import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { getArgentinaToday, formatArgentinaDate, safeDateFormat, addDays, addMonths, toLocalISOString } from '../utils/dateUtils';
import { Plus, DollarSign, Calendar, Check, Trash2, ChevronDown, ChevronUp, AlertCircle, Pencil, CreditCard as CreditCardIcon, X } from 'lucide-react';
import { PaymentFrequency, PaymentMethod, Sale, Installment } from '../types';





// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

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

export const Sales: React.FC = () => {
  const { clients, sales, leads, addSale, updateSale, deleteSale, addLead, addClient, deleteLead, preSelectedClientId, setPreSelectedClientId, editingSaleId, setEditingSaleId } = useStore();
  const [activeTab, setActiveTab] = useState<'sales' | 'leads'>('sales');
  const [isPreSelected, setIsPreSelected] = useState(false);

  // New Sale Form State
  const initialFormState = {
    clientId: '',
    productName: '',
    costPrice: '',
    salePrice: '',
    installmentsCount: '12',
    installmentAmount: '0',
    frequency: 'Diaria' as PaymentFrequency,
    method: 'Efectivo' as PaymentMethod,
    startDate: getArgentinaToday(),
    firstInstallmentNumber: '1',
    weeklyDay: 1, // Lunes
    monthlyDay: 5, // 5 de cada mes
  };

  const [saleForm, setSaleForm] = useState(initialFormState);

  // New Lead Form State
  const [leadText, setLeadText] = useState('');
  const [leadClientId, setLeadClientId] = useState('');
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);

  // Quick Client Form State
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Auto-select client if coming from Clients page
  useEffect(() => {
    if (preSelectedClientId) {
      setSaleForm(prev => ({ ...prev, clientId: preSelectedClientId }));
      setIsPreSelected(true);
      const timer = setTimeout(() => setIsPreSelected(false), 5000);
      // Clear it after using so it doesn't persist weirdly
      return () => {
        setPreSelectedClientId(null);
        clearTimeout(timer);
      };
    }
  }, [preSelectedClientId, setPreSelectedClientId]);

  useEffect(() => {
    if (editingSaleId && sales.length > 0) {
      const sale = sales.find(s => s.id === editingSaleId);
      if (sale) {
        setSaleForm({
          clientId: sale.clientId,
          productName: sale.product.name,
          costPrice: sale.product.costPrice.toString(),
          salePrice: sale.product.salePrice.toString(),
          installmentsCount: sale.installments.length.toString(),
          installmentAmount: sale.installments[0]?.amount.toString() || '0',
          frequency: sale.frequency,
          method: sale.paymentMethod,
          startDate: sale.startDate.split('T')[0],
          firstInstallmentNumber: sale.installments[0]?.number.toString() || '1',
          weeklyDay: sale.weeklyDay || 1,
          monthlyDay: sale.monthlyDay || 5,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [editingSaleId, sales]);

  // Sync Logic
  const handleTotalChange = (value: string) => {
    const total = parseFloat(value);
    const count = parseInt(saleForm.installmentsCount);
    const amount = (!isNaN(total) && count > 0) ? (total / count).toFixed(2) : '';
    setSaleForm({ ...saleForm, salePrice: value, installmentAmount: amount });
  };

  const handleCountChange = (value: string) => {
    const count = parseInt(value) || 1;
    const total = parseFloat(saleForm.salePrice);
    // When count changes, keep Total fixed, recalculate Amount
    const amount = (!isNaN(total) && count > 0) ? (total / count).toFixed(2) : '';
    setSaleForm({ ...saleForm, installmentsCount: value, installmentAmount: amount });
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value);
    const count = parseInt(saleForm.installmentsCount);
    // When installment amount changes, update the Total Sale Price
    const total = (!isNaN(amount) && count > 0) ? (amount * count).toFixed(2) : '';
    setSaleForm({ ...saleForm, installmentAmount: value, salePrice: total });
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSaleId) {
        const existingSale = sales.find(s => s.id === editingSaleId);
        if (!existingSale) return;

        // Recalculate plan based on form data
        const installmentsCount = parseInt(saleForm.installmentsCount);
        const firstInstallmentNumber = parseInt(saleForm.firstInstallmentNumber) || 1;
        const totalSalePrice = parseFloat(saleForm.salePrice);
        const amountPerInstallment = Math.floor(totalSalePrice / installmentsCount);

        // Generate new installments
        const newInstallments: Installment[] = [];
        const [year, month, day] = saleForm.startDate.split('-').map(Number);
        const start = new Date(year, month - 1, day);

        const startNum = Math.max(1, firstInstallmentNumber);
        const totalPlanCount = Math.max(startNum, installmentsCount); // Fix logic if needed, but assuming count is total count
        // Actually, if count is 12, do we mean 12 installments total? Yes.
        // In addSale logic: 
        // const totalPlanCount = Math.max(startNum, installmentsCount);
        // implicit assumption: installmentsCount is total plan length?
        // Let's stick to simple logic: we generate 'installmentsCount' installments starting from 'firstInstallmentNumber'.
        // Wait, the Store logic was:
        // const totalPlanCount = Math.max(startNum, installmentsCount); 
        // const installmentsToGenerate = totalPlanCount - startNum + 1;
        // This implies installmentsCount is the TARGET END NUMBER? No, it's confusing in Store.

        // Let's assume standard behavior: We want N installments.
        // If first is #1, we want 1..N.
        // If first is #5, we want 5..(5+N-1).

        // Let's follow the Store logic exactly to be consistent if possible, or fix it if it's weird.
        // Store logic:
        // const startNum = Math.max(1, firstInstallmentNumber);
        // const totalPlanCount = Math.max(startNum, installmentsCount);
        // const installmentsToGenerate = totalPlanCount - startNum + 1;

        // Example: count=12, start=1. max(1,12)=12. gen=12-1+1=12. Correct.
        // Example: count=12, start=5. max(5,12)=12. gen=12-5+1=8. Generates 5,6,7,8,9,10,11,12. (8 installments).
        // This means "installmentsCount" is treated as the "Final Quota Number" in Store logic if start > 1?
        // Or is it "Total Quotas in the Plan"?
        // If I say "12 quotas", and start at #1, I get 12.
        // If i say "12 quotas", and start at #5, I expect 12 quotas: 5..16.

        // Let's look at the UI: "Nº Cuotas" (installmentsCount).
        // If I put 12, I expect 12 installments.

        // I will use a simpler logic for Edit: generate 'installmentsCount' items.

        for (let i = 0; i < installmentsCount; i++) {
          const currentInstallmentNumber = startNum + i;
          let dueDate = new Date(start);

          if (saleForm.frequency === 'Diaria') {
            dueDate = addDays(start, i);
          } else if (saleForm.frequency === 'Semanal') {
            if (saleForm.weeklyDay !== undefined) {
              const firstInstallment = new Date(start);
              const currentDay = firstInstallment.getDay();
              const daysUntilTarget = (saleForm.weeklyDay - currentDay + 7) % 7;
              firstInstallment.setDate(firstInstallment.getDate() + daysUntilTarget);
              dueDate = addDays(firstInstallment, i * 7);
            } else {
              dueDate = addDays(start, i * 7);
            }
          } else if (saleForm.frequency === 'Mensual') {
            if (saleForm.monthlyDay !== undefined) {
              const firstInstallment = new Date(start);
              if (firstInstallment.getDate() > saleForm.monthlyDay) {
                firstInstallment.setMonth(firstInstallment.getMonth() + 1);
              }
              firstInstallment.setDate(saleForm.monthlyDay);
              dueDate = addMonths(firstInstallment, i);
            } else {
              dueDate = addMonths(start, i);
            }
          }

          // Amount calculation (last one gets remainder)
          let amount = amountPerInstallment;
          if (i === installmentsCount - 1) {
            const previousTotal = amountPerInstallment * (installmentsCount - 1);
            amount = totalSalePrice - previousTotal;
          }

          // Preserve ID and Status if exists?
          // If we are editing, let's try to map existing installments if possible?
          // It's hard to match. Let's just generate new ones. 
          // Status will be 'pending'.
          // If the user wanted to keep paid ones, they shouldn't edit the plan drastically.
          // BUT, if they just changed the NAME of the product, we shouldn't wipe payments.

          // CHECK IF PLAN DATA CHANGED:
          // If price, count, or frequency changed, we MUST regenerate.
          // If only product name changed, we should KEEP existing installments.

          // Let's implement that check!

          newInstallments.push({
            id: generateId(),
            saleId: existingSale.id, // Will be set/ignored by update? No, we store it.
            number: currentInstallmentNumber,
            amount: amount,
            dueDate: toLocalISOString(dueDate),
            status: 'pending' // Reset to pending
          });
        }

        // Logic to decide if we keep old installments or use new ones
        const planChanged =
          existingSale.totalAmount !== totalSalePrice ||
          existingSale.installments.length !== installmentsCount ||
          existingSale.frequency !== saleForm.frequency ||
          existingSale.startDate.split('T')[0] !== saleForm.startDate;

        // If plan changed, use newInstallments. 
        // If plan didn't change (only name/client changed), keep existing.
        // But what if they changed 'method'? Doesn't affect installments schedule.

        const finalInstallments = planChanged ? newInstallments : existingSale.installments;
        const finalRemaining = planChanged
          ? totalSalePrice // reset to full amount if plan changed
          : existingSale.remainingAmount; // keep existing if plan same (preserves payments)

        // Wait, if plan changed, remaining is total? Yes, because we reset to pending.

        const updatedSale: Sale = {
          ...existingSale,
          clientId: saleForm.clientId,
          product: {
            ...existingSale.product,
            name: saleForm.productName,
            costPrice: parseFloat(saleForm.costPrice),
            salePrice: totalSalePrice,
          },
          frequency: saleForm.frequency,
          paymentMethod: saleForm.method,
          weeklyDay: saleForm.frequency === 'Semanal' ? saleForm.weeklyDay : undefined,
          monthlyDay: saleForm.frequency === 'Mensual' ? saleForm.monthlyDay : undefined,
          installments: finalInstallments,
          totalAmount: totalSalePrice,
          remainingAmount: finalRemaining,
          status: planChanged ? 'active' : existingSale.status // If plan changed, reactivate if it was completed/defaulted?
        };

        await updateSale(updatedSale);
        setEditingSaleId(null);
        alert('Venta actualizada correctamente.');
      } else {
        if (saleForm.clientId && saleForm.productName && saleForm.salePrice) {
          await addSale({
            clientId: saleForm.clientId,
            product: {
              name: saleForm.productName,
              costPrice: parseFloat(saleForm.costPrice) || 0,
              salePrice: parseFloat(saleForm.salePrice),
            },
            firstInstallmentNumber: parseInt(saleForm.firstInstallmentNumber) || 1,
            installmentsCount: parseInt(saleForm.installmentsCount),
            frequency: saleForm.frequency,
            method: saleForm.method,
            startDate: saleForm.startDate,
            weeklyDay: saleForm.weeklyDay,
            monthlyDay: saleForm.monthlyDay,
          });

          if (convertingLeadId) {
            await deleteLead(convertingLeadId);
            setConvertingLeadId(null);
          }
          alert('Venta registrada correctamente.');
        }
      }
      setSaleForm(initialFormState);
    } catch (error: any) {
      console.error("Error saving sale:", error);
      alert("Hubo un error al guardar la venta: " + (error.message || "Error desconocido"));
    }
  };

  const handleEditSale = (sale: Sale) => {
    setSaleForm({
      clientId: sale.clientId,
      productName: sale.product.name,
      firstInstallmentNumber: sale.installments[0].number.toString(),
      costPrice: sale.product.costPrice.toString(),
      salePrice: sale.product.salePrice.toString(),
      installmentsCount: sale.installments.length.toString(),
      installmentAmount: sale.installments[0].amount.toString(),
      frequency: sale.frequency,
      method: sale.paymentMethod,
      startDate: sale.startDate.split('T')[0],
      weeklyDay: sale.weeklyDay || 1,
      monthlyDay: sale.monthlyDay || 5,
    });
    setEditingSaleId(sale.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadText.trim()) {
      try {
        await addLead(leadText, leadClientId || undefined);
        setLeadText('');
        setLeadClientId('');
      } catch (error) {
        console.error("Error saving lead:", error);
        alert("Hubo un error al guardar la nota.");
      }
    }
  };

  const handleAcceptLead = (lead: any) => {
    setActiveTab('sales');
    setSaleForm(prev => ({
      ...prev,
      clientId: lead.clientId || '',
      productName: lead.description,
      salePrice: '',
      installmentAmount: ''
    }));
    setConvertingLeadId(lead.id);
  };

  const handleQuickClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientForm.name && newClientForm.phone) {
      try {
        const newClient = await addClient(newClientForm);
        setSaleForm(prev => ({ ...prev, clientId: newClient.id }));
        setShowNewClientModal(false);
        setNewClientForm({ name: '', phone: '', address: '' });
        alert('Cliente registrado y seleccionado.');
      } catch (error) {
        console.error("Error creating quick client:", error);
        alert("Hubo un error al registrar el cliente.");
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.1)]">
          CENTRO DE <span className="text-neon-400 uppercase">Ventas</span>
        </h1>
        <p className="text-white/60 mt-2 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-400 animate-pulse" />
          Registra operaciones y gestiona pedidos de clientes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-4 px-6 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 border-b-2 ${activeTab === 'sales' ? 'border-neon-400 text-neon-400 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]' : 'border-transparent text-white/40 hover:text-white/70'}`}
        >
          Centro de Operaciones
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-4 px-6 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 border-b-2 ${activeTab === 'leads' ? 'border-neon-400 text-neon-400 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]' : 'border-transparent text-white/40 hover:text-white/70'}`}
        >
          Notas de Pedido
        </button>
      </div>

      {activeTab === 'leads' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Lead Input */}
          <div className="md:col-span-1 glass-glow border border-neon-400/20 rounded-3xl p-8 h-fit shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-400/5 blur-[50px] -mr-16 -mt-16 transition-all duration-700 group-hover:bg-neon-400/10" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Nueva Nota de Interés</h3>
            <form onSubmit={handleLeadSubmit}>
              <div className="space-y-2 mb-4">
                <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Vincular Cliente (Opcional)</label>
                <div className="flex flex-col gap-2">
                  <select
                    value={leadClientId}
                    onChange={e => setLeadClientId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-4 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all appearance-none cursor-pointer font-bold text-base"
                  >
                    <option value="">Consumidor Final / Sin Asignar</option>
                    {[...clients].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewClientModal(true)}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-neon-400 text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-neon-sm hover:shadow-neon-md hover:scale-[1.02] transition-all group/btn"
                    title="Nuevo Cliente"
                  >
                    <Plus size={16} className="group-hover/btn:scale-110 transition-transform" />
                    Nuevo Cliente Rápido
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Descripción del Pedido</label>
                <textarea
                  value={leadText}
                  onChange={e => setLeadText(e.target.value)}
                  placeholder="Ej. Juan pregunta por Heladera Gafa..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 h-32 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20 resize-none font-bold text-base"
                />
              </div>
              <button className="w-full bg-neon-400 text-black font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-neon-md hover:shadow-neon-lg hover:scale-[1.02] active:scale-95 transition-all duration-300">
                Guardar Registro
              </button>
            </form>
          </div>

          {/* Lead List */}
          <div className="md:col-span-2 space-y-4">
            {leads.length === 0 && (
              <div className="glass-glow border border-dashed border-white/5 rounded-3xl p-16 text-center text-white/30 font-black uppercase tracking-[0.2em] text-[10px]">
                <AlertCircle size={40} className="mx-auto mb-4 opacity-10" />
                No hay pedidos activos en este momento.
              </div>
            )}
            {leads.map(lead => (
              <div key={lead.id} className="glass-glow border border-white/5 rounded-2xl p-6 flex justify-between items-center group hover:border-neon-400/30 transition-all duration-300 shadow-xl relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1 bg-neon-400/0 group-hover:bg-neon-400 transition-all" />
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-white text-lg font-bold tracking-tight group-hover:text-neon-400 transition-colors">{lead.description}</p>
                    {lead.clientId && (
                      <span className="bg-neon-400/10 text-neon-400 text-[8px] font-black px-2 py-0.5 rounded-lg border border-neon-400/20 uppercase tracking-widest">
                        {clients.find(c => c.id === lead.clientId)?.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Calendar size={12} className="text-neon-400" />
                    <span className="text-[10px] text-white/30 font-extrabold uppercase tracking-widest">{formatArgentinaDate(lead.createdAt, { dateStyle: 'long' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAcceptLead(lead)}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-400/10 border border-neon-400/20 rounded-xl text-neon-400 text-[10px] font-black uppercase tracking-widest hover:bg-neon-400 hover:text-black transition-all shadow-neon-sm"
                  >
                    <Check size={14} /> Aceptar
                  </button>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-xl text-white/30 hover:text-red-500 transition-all border border-white/5 hover:border-red-500/30"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">

          {/* Create Sale Panel - Expanded to provide more space */}
          {/* Create Sale Panel - Full Width & Centered */}
          <div className={`w-full max-w-6xl mx-auto glass-glow border border-neon-400/20 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden group z-10 neon-indirect-glow ${isPreSelected ? 'active' : ''}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-400/5 blur-[100px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-neon-400/10 pointer-events-none" />

            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3 relative z-10">
              <div className="p-3 bg-neon-400/10 rounded-2xl border border-neon-400/30">
                {editingSaleId ? <Pencil size={20} className="text-neon-400 shadow-neon-sm" /> : <Plus size={20} className="text-neon-400 shadow-neon-sm" />}
              </div>
              {editingSaleId ? 'Editar Crédito' : 'Alta de Crédito'}
              {editingSaleId && (
                <button
                  onClick={() => { setEditingSaleId(null); setSaleForm(initialFormState); }}
                  className="ml-auto p-2 text-white/30 hover:text-white transition-colors"
                  title="Cancelar edición"
                >
                  <X size={16} />
                </button>
              )}
            </h2>
            <form onSubmit={handleSaleSubmit} className="space-y-6 relative z-10 max-w-4xl mx-auto">

              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Vincular Cliente</label>
                <div className="flex flex-col gap-2">
                  <select
                    value={saleForm.clientId}
                    onChange={e => setSaleForm({ ...saleForm, clientId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-4 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all appearance-none cursor-pointer font-bold text-base"
                    required
                  >
                    <option value="">Seleccionar Cliente...</option>
                    {clients.sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewClientModal(true)}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-neon-400 text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-neon-sm hover:shadow-neon-md hover:scale-[1.02] transition-all group/btn"
                    title="Nuevo Cliente"
                  >
                    <Plus size={16} className="group-hover/btn:scale-110 transition-transform" />
                    Nuevo Cliente Rápido
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Producto / Servicio</label>
                <input
                  type="text"
                  value={saleForm.productName}
                  onChange={e => setSaleForm({ ...saleForm, productName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-4 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20 font-bold text-base"
                  placeholder="Ej. SmarTV 55' 4K"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Costo (Opcional)</label>
                  <input
                    type="number"
                    value={saleForm.costPrice}
                    onChange={e => setSaleForm({ ...saleForm, costPrice: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-base font-bold focus:outline-none focus:border-neon-400/50 focus:bg-white/[0.04] transition-all placeholder:text-white/30"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neon-400 uppercase font-black tracking-widest ml-1 mb-1">Venta Final ($)</label>
                  <input
                    type="number"
                    value={saleForm.salePrice}
                    onChange={e => handleTotalChange(e.target.value)}
                    className="w-full bg-neon-400/5 border border-neon-400 text-neon-400 font-black rounded-xl p-4 focus:outline-none shadow-neon-sm text-lg"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="bg-white/[0.02] p-6 rounded-3xl space-y-6 border border-white/5 shadow-inner">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] border-b border-white/5 pb-3">Plan Financiero</p>

                {/* Cuotas y Valor */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Nº Cuotas</label>
                    <input
                      type="number"
                      min="1"
                      value={saleForm.installmentsCount}
                      onChange={e => handleCountChange(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-neon-400 focus:outline-none font-black text-center text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Cuota Inicial #</label>
                    <input
                      type="number"
                      min="1"
                      value={saleForm.firstInstallmentNumber}
                      onChange={e => setSaleForm({ ...saleForm, firstInstallmentNumber: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-neon-400 focus:outline-none font-black text-center text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-neon-400/70 uppercase font-black tracking-widest ml-1 mb-1">Valor Unitario</label>
                    <input
                      type="number"
                      value={saleForm.installmentAmount}
                      onChange={e => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-neon-400/30 text-neon-400 rounded-xl p-3 focus:border-neon-400 focus:outline-none font-black text-center text-lg"
                    />
                  </div>
                </div>

                {/* Frecuencia y Modo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Frecuencia de Cobro</label>
                    <select
                      value={saleForm.frequency}
                      onChange={e => setSaleForm({ ...saleForm, frequency: e.target.value as PaymentFrequency })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-neon-400 focus:outline-none font-bold text-base"
                    >
                      <option value="Diaria">Diaria</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Mensual">Mensual</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase font-black tracking-widest ml-1 mb-1">Medio Pago</label>
                    <select
                      value={saleForm.method}
                      onChange={e => setSaleForm({ ...saleForm, method: e.target.value as PaymentMethod })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-neon-400 focus:outline-none font-bold text-base"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>
                </div>

                {/* Inicio */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} className="text-neon-400" />
                    {parseInt(saleForm.firstInstallmentNumber) > 1
                      ? `Fecha Vencimiento Cuota ${saleForm.firstInstallmentNumber}`
                      : 'Fecha de Inicio'}
                  </label>
                  <input
                    type="date"
                    value={saleForm.startDate}
                    onChange={e => setSaleForm({ ...saleForm, startDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-neon-400 focus:outline-none font-bold"
                  />
                </div>

                {/* Day of week selector - Only for weekly */}
                {saleForm.frequency === 'Semanal' && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] border-b border-orange-400/10 pb-2">Día de Cobro (Semanal)</p>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {[
                        { label: 'L', value: 1 },
                        { label: 'M', value: 2 },
                        { label: 'M', value: 3 },
                        { label: 'J', value: 4 },
                        { label: 'V', value: 5 },
                        { label: 'S', value: 6 },
                        { label: 'D', value: 0 },
                      ].map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => setSaleForm({ ...saleForm, weeklyDay: day.value })}
                          className={`h-10 rounded-xl text-[10px] font-black transition-all border ${saleForm.weeklyDay === day.value
                            ? 'bg-orange-400 text-black border-orange-400 shadow-orange-md scale-105'
                            : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'
                            }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[8px] text-white/30 font-bold uppercase text-center mt-2">
                      Las cuotas se fijarán los {['Domingos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados'][saleForm.weeklyDay]}
                    </p>
                  </div>
                )}

                {/* Day of month selector - Only for monthly */}
                {saleForm.frequency === 'Mensual' && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] border-b border-violet-400/10 pb-2">Día de Cobro (Mensual)</p>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSaleForm({ ...saleForm, monthlyDay: day })}
                          className={`h-8 rounded-lg text-[9px] font-black transition-all border ${saleForm.monthlyDay === day
                            ? 'bg-violet-400 text-black border-violet-400 shadow-violet-md scale-110'
                            : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                            }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <p className="text-[8px] text-white/30 font-bold uppercase text-center mt-2">
                      Las cuotas se fijarán los días {saleForm.monthlyDay} de cada mes
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-neon-400 text-black font-black uppercase tracking-widest text-sm py-5 rounded-2xl shadow-neon-md hover:shadow-neon-lg hover:scale-[1.02] active:scale-95 transition-all duration-300">
                {editingSaleId ? 'Actualizar Operación' : 'Efectivizar Operación'}
              </button>
            </form>
          </div>


        </div>
      )}

      {/* Quick New Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="glass-glow border border-white/10 rounded-[32px] w-full max-w-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400 to-transparent" />

            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Nueva Venta</h3>
                <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Configuración de crédito y plan de pagos</p>
              </div>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-red-500/20 hover:text-red-500 transition-all border border-white/5"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleQuickClientSubmit} className="p-6 md:p-8 space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newClientForm.name}
                  onChange={e => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20 font-medium text-sm"
                  placeholder="Ej. Juan Carlos Pérez"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={newClientForm.phone}
                    onChange={e => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20 font-medium text-sm"
                    placeholder="555-0101"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Dirección</label>
                  <input
                    type="text"
                    required
                    value={newClientForm.address}
                    onChange={e => setNewClientForm({ ...newClientForm, address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20 font-medium text-sm"
                    placeholder="Av. Siempre Viva 742"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-neon-400 text-black font-black uppercase tracking-widest text-xs py-4.5 rounded-xl shadow-neon-md hover:shadow-neon-lg hover:scale-[1.01] active:scale-95 transition-all duration-300"
              >
                Registrar y Seleccionar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
