import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { formatArgentinaDate, safeDateFormat } from '../utils/dateUtils';
import { DollarSign, Check, Trash2, Pencil, X, Calendar, ChevronDown, CreditCard as CreditCardIcon } from 'lucide-react';
import { Sale } from '../types';





// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
// NOTE: SaleCard component is defined at the bottom or imported. Wait, in Credits.tsx it was at the bottom.
// In Sales.tsx I moved it to top. In Credits.tsx I should keep it or check where it is.
// Step 214 output shows SaleCard at line 499.
// So I don't need to move it unless I want to.
// I will just clean the component logic.

interface CreditsProps {
  onNavigateToSales?: () => void;
}

export const Credits: React.FC<CreditsProps> = ({ onNavigateToSales }) => {
  const { clients, sales, deleteSale, setEditingSaleId } = useStore();
  const [activeTab, setActiveTab] = useState<'sales' | 'completed'>('sales');

  const handleEditSale = (saleId: string) => {
    setEditingSaleId(saleId);
    if (onNavigateToSales) {
      onNavigateToSales();
    } else {
      // Fallback
      window.dispatchEvent(new CustomEvent('nav-change', { detail: { view: 'sales' } }));
    }
  };


  const handleDeleteSale = async (saleId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este crédito? Esta acción no se puede deshacer.')) {
      try {
        await deleteSale(saleId);
      } catch (error) {
        console.error("Error deleting sale:", error);
        alert("No se pudo eliminar el crédito.");
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.1)]">
          CENTRO DE <span className="text-neon-400 uppercase">Créditos</span>
        </h1>
        <p className="text-white/60 mt-2 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-400 animate-pulse" />
          Control y seguimiento de cartera activa e historial.
        </p>
      </div>

      {/* Tabs */}
      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-4 px-6 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 border-b-2 ${activeTab === 'sales' ? 'border-neon-400 text-neon-400 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]' : 'border-transparent text-white/40 hover:text-white/70'}`}
        >
          Monitor de Cobranzas
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-6 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 border-b-2 ${activeTab === 'completed' ? 'border-neon-400 text-neon-400 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]' : 'border-transparent text-white/40 hover:text-white/70'}`}
        >
          Créditos Finalizados
        </button>
      </div>

      {activeTab === 'completed' ? (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
            <div className="w-1 h-6 bg-neon-400 rounded-full shadow-neon-sm" />
            Historial de Créditos Pagados
          </h2>
          {sales.filter(s => s.status === 'completed').length === 0 && (
            <div className="glass-glow border border-dashed border-white/5 rounded-[32px] p-24 text-center text-white/30 font-black uppercase tracking-[0.2em] text-xs">
              <Check size={48} className="mx-auto mb-6 opacity-10" />
              No hay créditos finalizados por el momento.
            </div>
          )}
          <div className="space-y-4">
            {sales.filter(s => s.status === 'completed').map(sale => (
              <SaleCard
                key={sale.id}
                sale={sale}
                clientName={clients.find(c => c.id === sale.clientId)?.name || 'Desconocido'}
                onEdit={() => handleEditSale(sale.id)}
                onDelete={() => handleDeleteSale(sale.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
          <div className="sticky top-0 bg-transparent z-10 backdrop-blur-md py-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <div className="w-1 h-6 bg-neon-400 rounded-full shadow-neon-sm" />
              Monitor de Cobranzas
            </h2>
          </div>
          {sales.filter(s => s.status !== 'completed').length === 0 && (
            <div className="glass-glow border border-dashed border-white/5 rounded-[32px] p-24 text-center text-white/30 font-black uppercase tracking-[0.2em] text-xs">
              <DollarSign size={48} className="mx-auto mb-6 opacity-10" />
              No se registran ventas activas.
            </div>
          )}
          <div className="space-y-4">
            {sales.filter(s => s.status !== 'completed').map(sale => (
              <SaleCard
                key={sale.id}
                sale={sale}
                clientName={clients.find(c => c.id === sale.clientId)?.name || 'Desconocido'}
                onEdit={() => handleEditSale(sale.id)}
                onDelete={() => handleDeleteSale(sale.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick New Client Modal */}

    </div >
  );
};

const SaleCard: React.FC<{
  sale: Sale;
  clientName: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ sale, clientName, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const { markInstallmentPaid } = useStore();

  const progress = ((sale.totalAmount - sale.remainingAmount) / sale.totalAmount) * 100;

  return (
    <div className={`glass-glow border ${sale.status === 'completed' ? 'border-neon-400/40 shadow-[0_0_20px_rgba(57,255,20,0.05)]' : 'border-white/5'} rounded-[32px] overflow-hidden transition-all duration-300 shadow-2xl group`}>
      <div
        className="p-6 md:p-8 lg:p-10 cursor-pointer hover:bg-white/[0.03] transition-all duration-300 relative"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="absolute inset-y-0 left-0 w-2 bg-neon-400/0 group-hover:bg-neon-400 transition-all duration-500" />

        {/* Responsive Grid - Better space allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative">

          {/* Section 1: Product & Status (4 cols) */}
          <div className="lg:col-span-4 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-white text-xl lg:text-2xl tracking-tighter leading-none uppercase group-hover:neon-text transition-all duration-500 min-w-0 flex-1">
                {sale.product.name}
              </h3>
              {sale.status === 'completed' && (
                <span className="bg-neon-400/10 text-neon-400 text-[8px] font-black px-2 py-0.5 rounded border border-neon-400/30">FINALIZADO</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-neon-400/10 flex items-center justify-center border border-neon-400/20 flex-shrink-0">
                <span className="text-neon-400 font-black text-[10px]">{clientName.charAt(0)}</span>
              </div>
              <span className="text-white/80 font-black text-xs uppercase tracking-wider min-w-0">{clientName}</span>
            </div>
          </div>

          {/* Section 2: Info (3 cols) */}
          <div className="lg:col-span-3 flex flex-wrap lg:flex-col lg:items-center gap-3 lg:border-l lg:border-white/5 lg:px-4">
            <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
              <Calendar size={12} className="text-neon-400/50" />
              {formatArgentinaDate(sale.startDate, { day: '2-digit', month: 'short' })}
            </div>

            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${sale.frequency === 'Diaria' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30' :
              sale.frequency === 'Semanal' ? 'bg-orange-400/10 text-orange-400 border-orange-400/30' :
                'bg-violet-400/10 text-violet-400 border-violet-400/30'
              }`}>
              {sale.frequency}
            </span>

            {/* Payment Method Badge */}
            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${sale.paymentMethod === 'Transferencia' ? 'bg-blue-400/10 text-blue-400 border-blue-400/30' :
              'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
              }`}>
              {sale.paymentMethod || 'Efectivo'}
            </span>

            <div className="hidden xl:flex items-center gap-3 w-full">
              <div className="flex-1 bg-white/5 rounded-full h-1.5 p-[1px] border border-white/5">
                <div className={`h-full rounded-full bg-neon-400 shadow-neon-sm`} style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-[8px] font-black text-white/30">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Section 3: Result & Actions (5 cols) */}
          <div className="lg:col-span-5 lg:border-l lg:border-white/5 lg:pl-8 flex flex-col items-end gap-3">
            <div className="text-right w-full">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] mb-1">Capital Restante</p>
              <p className={`text-2xl lg:text-3xl font-black tracking-tighter leading-none ${sale.status === 'completed' ? 'text-neon-400 neon-text' : 'text-white'}`}>
                ${sale.remainingAmount.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neon-400/10 text-white/40 hover:text-neon-400 transition-all"
                  title="Editar crédito"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all"
                  title="Eliminar crédito"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 transition-all duration-500 ${expanded ? 'rotate-180 bg-neon-400/10 border-neon-400/30 shadow-neon-sm' : 'hover:border-neon-400/30'}`}>
                <ChevronDown size={24} className={expanded ? 'text-neon-400' : 'text-white/40'} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 bg-white/[0.01] p-6 md:p-10 animate-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[10px] text-white/30 uppercase font-black tracking-[0.4em] flex items-center gap-3">
              <CreditCardIcon size={16} className="text-neon-400" /> Plan de Cuotas
            </h4>
            <div className="h-px flex-1 bg-gradient-to-r from-neon-400/20 to-transparent ml-6" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sale.installments.map((inst, index) => {
              const prevPaid = index === 0 || sale.installments[index - 1].status === 'paid';
              const isNextDue = inst.status === 'pending' && prevPaid;

              return (
                <div
                  key={inst.id}
                  className={`relative p-5 rounded-[22px] border transition-all duration-500 flex flex-col gap-4 group/inst ${inst.status === 'paid'
                    ? 'bg-white/[0.01] border-white/5 opacity-40 hover:opacity-100'
                    : isNextDue
                      ? 'bg-neon-400/[0.05] border-neon-400/30 shadow-[0_0_20px_rgba(57,255,20,0.05)] scale-[1.02] z-10'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                >
                  {isNextDue && (
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-neon-400 text-black text-[8px] font-black uppercase tracking-widest rounded-full shadow-neon-sm">
                      Siguiente a Cobrar
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border transition-all duration-300 ${inst.status === 'paid'
                        ? 'bg-neon-400/10 border-neon-400/20 text-neon-400'
                        : isNextDue
                          ? 'bg-neon-400 text-black border-neon-400 shadow-neon-sm'
                          : 'bg-white/5 border-white/10 text-white/30'
                        }`}>
                        {inst.status === 'paid' ? <Check size={16} strokeWidth={3} /> : inst.number}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Cuota {inst.number}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${inst.status === 'paid' ? 'text-neon-400/50' : 'text-white/40'}`}>
                          Vence: {safeDateFormat(inst.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {inst.status === 'pending' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markInstallmentPaid(sale.id, inst.id); }}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${isNextDue
                          ? 'bg-neon-400 text-black shadow-neon-md hover:scale-110'
                          : 'bg-white/5 text-white/30 hover:bg-neon-400 hover:text-black border border-white/10 hover:border-neon-400'
                          }`}
                      >
                        <DollarSign size={18} />
                      </button>
                    )}

                    {inst.status === 'paid' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markInstallmentPaid(sale.id, inst.id); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/10 hover:text-red-400 transition-all opacity-0 group-hover/inst:opacity-100"
                        title="Revertir pago"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className={`text-2xl font-black tracking-tighter transition-all ${inst.status === 'paid' ? 'text-neon-400/30' : 'text-white'}`}>
                      ${inst.amount.toLocaleString()}
                    </span>
                    {inst.status === 'paid' && inst.paidAt && (
                      <span className="text-[8px] text-neon-400/40 font-bold uppercase tracking-widest ml-auto">
                        Pagado: {new Date(inst.paidAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function CreditCard({ size, className }: { size: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}