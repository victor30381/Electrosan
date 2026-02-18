import React, { useMemo, useState } from 'react';
import { useStore } from '../store/StoreContext';
import { getArgentinaToday, formatArgentinaTime, safeDateFormat, getArgentinaDate } from '../utils/dateUtils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { AlertCircle, CheckCircle, TrendingUp, DollarSign, Calendar, Users, X, CheckSquare, List, Phone, MapPin, User, ChevronRight, Wallet, Clock, CreditCard, Ban, PlayCircle, RefreshCw } from 'lucide-react';
import { Client, Sale } from '../types';



const StatCard: React.FC<{
  title: string,
  value: string,
  icon: React.ReactNode,
  type?: 'neutral' | 'success' | 'warning' | 'info',
  onClick?: () => void
}> = ({ title, value, icon, type = 'neutral', onClick }) => {
  const glowColor = type === 'success' ? 'rgba(57, 255, 20, 0.2)' : type === 'warning' ? 'rgba(239, 68, 68, 0.2)' : type === 'info' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)';
  const borderColor = type === 'success' ? 'border-neon-400/50' : type === 'warning' ? 'border-red-500/50' : type === 'info' ? 'border-blue-500/50' : 'border-white/5';
  const iconColor = type === 'success' ? 'text-neon-400' : type === 'warning' ? 'text-red-500' : type === 'info' ? 'text-blue-500' : 'text-white/60';
  const hoverClass = onClick ? 'cursor-pointer hover:bg-white/[0.02] hover:scale-[1.01] active:scale-[0.99]' : '';

  return (
    <div
      onClick={onClick}
      className={`glass-glow border ${borderColor} rounded-[32px] p-8 relative overflow-hidden group transition-all duration-300 ${hoverClass}`}
      style={{ boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5), 0 0 20px -5px ${glowColor}` }}
    >
      {/* Background Icon */}
      <div className={`absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${iconColor} transform scale-150 rotate-12 bg-transparent pointer-events-none`}>
        {React.cloneElement(icon as React.ReactElement, { size: 120 })}
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex flex-col gap-3 min-w-0 pr-4">
          <p className="text-white/60 text-xs font-bold uppercase tracking-[0.25em]">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none group-hover:neon-text transition-all duration-300 whitespace-nowrap">
              {value}
            </h3>
            {onClick && (
              <ChevronRight size={20} className="text-white/20 group-hover:text-neon-400 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
            )}
          </div>
        </div>

        <div className={`w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 ${iconColor} flex items-center justify-center shadow-inner flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        </div>
      </div>

      {/* Indirect Glow Element */}
      <div className={`absolute bottom-0 left-0 h-1 w-full blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${type === 'success' ? 'bg-gradient-to-r from-transparent via-neon-400 to-transparent' : type === 'warning' ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'}`} />
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { sales, clients, markInstallmentPaid, reportMissedPayment, toggleSaleStatus } = useStore();
  const [activeModal, setActiveModal] = useState<'pending' | 'collected' | 'active_credits' | null>(null);
  const [viewingClient, setViewingClient] = useState<string | null>(null); // Stores Client ID
  const [selectedDashboardDate, setSelectedDashboardDate] = useState(getArgentinaToday());

  const stats = useMemo(() => {
    let totalReceivable = 0;
    let totalCollected = 0;
    let activeCreditsCount = 0;
    let completedCreditsCount = 0;

    // Lists for modals
    const pendingList: any[] = []; // Only for today/overdue (alerts - installments)
    const collectedTodayList: any[] = [];
    const activeCreditsList: any[] = []; // Detailed list of active credits

    const today = safeDateFormat(getArgentinaToday());
    const todayStr = getArgentinaToday();
    const selectedDate = safeDateFormat(selectedDashboardDate);
    const isToday = selectedDashboardDate === getArgentinaToday();

    const alerts: { clientId: string, clientName: string, amount: number, date: string, daysOverdue: number, frequency: string }[] = [];

    sales.forEach(sale => {
      const clientName = clients.find(c => c.id === sale.clientId)?.name || 'Desconocido';

      if (sale.status === 'active' || sale.status === 'defaulted') {
        activeCreditsCount++;

        // Calculate details for "Por Cobrar" modal
        const paidInstallments = sale.installments.filter(i => i.status === 'paid').length;
        const totalInstallments = sale.installments.length;
        const pendingInstallments = totalInstallments - paidInstallments;
        const paidAmount = sale.totalAmount - sale.remainingAmount;

        activeCreditsList.push({
          id: sale.id,
          clientId: sale.clientId,
          clientName,
          productName: sale.product.name,
          totalAmount: sale.totalAmount,
          remainingAmount: sale.remainingAmount,
          paidAmount,
          paidInstallments,
          pendingInstallments,
          totalInstallments,
          startDate: sale.startDate,
          status: sale.status,
          progress: (paidAmount / sale.totalAmount) * 100
        });

      } else {
        completedCreditsCount++;
      }

      sale.installments.forEach(inst => {
        if (inst.status === 'paid') {
          totalCollected += inst.amount;

          // Check if paid today (timezone adjusted: compare YYYY-MM-DD in AR time)
          const paidDateAr = inst.paidAt ? new Date(inst.paidAt).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) : '';
          if (paidDateAr === todayStr) {
            collectedTodayList.push({
              id: inst.id,
              saleId: sale.id,
              clientName,
              amount: inst.amount,
              time: formatArgentinaTime(inst.paidAt)
            });
          }

        } else {
          // It is pending

          // IMPORTANT: Only add to General Receivable KPI if NOT defaulted
          if (sale.status !== 'defaulted') {
            totalReceivable += inst.amount;
          }

          const dueDate = safeDateFormat(inst.dueDate);
          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const isOverdue = dueDate < today;

          const instDueDateStr = inst.dueDate.split('T')[0];
          const matchesDate = instDueDateStr === selectedDashboardDate;

          // LOGIC: Group by Client for "Today's Alerts" and "Pending List"
          if (matchesDate && sale.status !== 'defaulted') {
            const existingAlert = alerts.find(a => a.clientId === sale.clientId);
            if (existingAlert) {
              existingAlert.amount += inst.amount;
              // We could also merge product names or count items, but amount is key
            } else {
              alerts.push({
                clientId: sale.clientId,
                clientName,
                amount: inst.amount,
                date: inst.dueDate,
                daysOverdue: diffDays,
                frequency: sale.frequency
              });
            }

            // For the MODAL list (Pending List), we also want to group by client
            if (dueDate <= today) {
              const existingPending = pendingList.find(p => p.clientId === sale.clientId);

              if (existingPending) {
                existingPending.amount += inst.amount;
                existingPending.products.push(sale.product.name);
                existingPending.installments.push({
                  id: inst.id,
                  saleId: sale.id,
                  amount: inst.amount,
                  number: inst.number
                });
              } else {
                pendingList.push({
                  // We simulate a single item ID, but we need to handle multi-payment
                  id: inst.id,
                  saleId: sale.id, // Primary sale ID, but could be mixed
                  clientId: sale.clientId,
                  clientName,
                  productName: sale.product.name, // Initial product name
                  products: [sale.product.name],
                  number: inst.number,
                  amount: inst.amount,
                  dueDate: inst.dueDate,
                  daysOverdue: Math.max(0, diffDays),
                  isOverdue,
                  missedPaymentsCount: sale.missedPaymentsCount || 0,
                  installments: [{ // New structure to hold all child installments
                    id: inst.id,
                    saleId: sale.id,
                    amount: inst.amount,
                    number: inst.number
                  }]
                });
              }
            }
          }
        }
      });
    });

    // Sort active credits: Defaulted at bottom (or top depending on pref, let's keep amount desc), then Amount
    activeCreditsList.sort((a, b) => b.remainingAmount - a.remainingAmount);

    // Sort alerts by client name
    alerts.sort((a, b) => a.clientName.localeCompare(b.clientName));

    return {
      totalReceivable,
      totalCollected,
      activeCreditsCount,
      completedCreditsCount,
      alerts,
      pendingList,
      collectedTodayList,
      activeCreditsList,
      selectedDateTotal: alerts.reduce((acc, a) => acc + a.amount, 0)
    };
  }, [sales, clients, selectedDashboardDate]);

  // Derived state for the Client Detail Modal
  const clientDetailData = useMemo(() => {
    if (!viewingClient) return null;
    const client = clients.find(c => c.id === viewingClient);
    if (!client) return null;

    const clientSales = sales.filter(s => s.clientId === viewingClient);
    const totalDebt = clientSales.reduce((acc, s) => acc + s.remainingAmount, 0);
    const totalPaid = clientSales.reduce((acc, s) => acc + (s.totalAmount - s.remainingAmount), 0);

    return { client, clientSales, totalDebt, totalPaid };
  }, [viewingClient, clients, sales]);

  const pieData = [
    { name: 'Activos', value: stats.activeCreditsCount },
    { name: 'Finalizados', value: stats.completedCreditsCount },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            DASHBOARD <span className="text-neon-400 uppercase">Resumen</span>
          </h1>
          <p className="text-white/60 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-400 animate-pulse" />
            Control financiero y gestión de cartera en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm text-xs font-bold text-white/50">
          <Clock size={14} className="text-neon-400" />
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' })}
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Cobros Hoy / Mora"
          value={`$${stats.alerts.reduce((acc, a) => acc + a.amount, 0).toLocaleString()}`}
          icon={<AlertCircle />}
          type="warning"
          onClick={() => setActiveModal('pending')}
        />
        <StatCard
          title="Recaudación Hoy"
          value={`$${stats.collectedTodayList.reduce((acc, a) => acc + a.amount, 0).toLocaleString()}`}
          icon={<CheckCircle />}
          type="success"
          onClick={() => setActiveModal('collected')}
        />
        <StatCard
          title="Cartera Activa"
          value={`$${stats.totalReceivable.toLocaleString()}`}
          icon={<TrendingUp />}
          type="info"
          onClick={() => setActiveModal('active_credits')}
        />
        <StatCard
          title="Créditos en Curso"
          value={stats.activeCreditsCount.toString()}
          icon={<DollarSign />}
          type="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 items-start">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-glow border border-white/5 rounded-[32px] p-6 md:p-10 shadow-2xl min-h-[500px] flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <div className="w-1 h-6 bg-neon-400 rounded-full" />
                Crecimiento de Cartera
              </h2>
              <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mt-1 ml-4">Volumen Mensual de Cobranzas</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 p-1 bg-white/5 rounded-xl border border-white/5 self-start">
              <input
                type="date"
                value={selectedDashboardDate}
                onChange={(e) => setSelectedDashboardDate(e.target.value)}
                className="bg-transparent text-[9px] font-black text-neon-400 uppercase tracking-widest border-none focus:ring-0 p-1 cursor-pointer"
              />
              <div className="px-4 py-1.5 bg-neon-400 text-black text-[9px] font-black rounded-lg shadow-neon-sm uppercase tracking-widest">
                {selectedDashboardDate === getArgentinaToday() ? 'Actual' : 'Programado'}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/40 border-b border-white/5 text-[10px] uppercase font-black tracking-[0.2em]">
                    <th className="pb-4 font-black">Cliente</th>
                    <th className="pb-4 font-black text-center">Freq</th>
                    <th className="pb-4 font-black">Monto</th>
                    <th className="pb-4 font-black">Estado</th>
                    <th className="pb-4 font-black text-right">Vencimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.alerts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-white/40 font-black uppercase tracking-widest text-[10px]">
                        No hay cobros para esta fecha.
                      </td>
                    </tr>
                  ) : (
                    stats.alerts.map((alert: any, idx) => (
                      <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 text-white font-medium">{alert.clientName}</td>
                        <td className="py-4 text-center">
                          {alert.frequency === 'Diaria' && (
                            <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg text-[9px] font-black border border-cyan-500/20 uppercase tracking-widest">Diario</span>
                          )}
                          {alert.frequency === 'Semanal' && (
                            <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-lg text-[9px] font-black border border-orange-500/20 uppercase tracking-widest">Semanal</span>
                          )}
                          {alert.frequency === 'Mensual' && (
                            <span className="bg-violet-500/10 text-violet-400 px-3 py-1 rounded-lg text-[9px] font-black border border-violet-500/20 uppercase tracking-widest">Mensual</span>
                          )}
                        </td>
                        <td className="py-4 text-neon-400 font-bold">${alert.amount.toLocaleString()}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${alert.daysOverdue === 0 ? 'bg-neon-400/10 text-neon-400 border-neon-400/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {alert.daysOverdue === 0 ? 'Hoy' : alert.daysOverdue > 0 ? `+${alert.daysOverdue} días` : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-4 text-white/50 text-right text-sm">
                          {safeDateFormat(alert.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section Footer: Total Amount integrated into the card structure */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
              {stats.alerts.length} registros encontrados
            </p>
            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[9px] text-white/40 uppercase font-black tracking-[0.2em]">Monto Total</span>
              <span className="text-2xl font-black text-neon-400 neon-text transition-all duration-300">
                ${stats.selectedDateTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="glass-glow border border-white/5 rounded-[32px] p-6 md:p-10 shadow-2xl h-fit">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">Estado de Créditos</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#39FF14' : 'rgba(255,255,255,0.1)'}
                      className="transition-all duration-500 hover:opacity-80 drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10,10,10,0.9)',
                    borderColor: 'rgba(57,255,20,0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    borderWidth: '1px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text for Pie Chart */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total</span>
              <span className="text-2xl font-black text-white">{(stats.activeCreditsCount + stats.completedCreditsCount)}</span>
            </div>
          </div>

          <div className="w-full mt-8 space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-400 shadow-[0_0_5px_#39FF14]" />
                <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Recaudación</span>
              </div>
              <span className="text-neon-400 font-black">
                {((stats.totalCollected / (stats.totalCollected + stats.totalReceivable || 1)) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div
                className="bg-neon-400 h-full rounded-full shadow-[0_0_15px_#39FF14] transition-all duration-1000 ease-out"
                style={{ width: `${(stats.totalCollected / (stats.totalCollected + stats.totalReceivable || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass-glow border border-white/10 rounded-[40px] w-full max-w-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400/30 to-transparent" />

            {/* Modal Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/[0.02]">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  {activeModal === 'pending' && <><List className="text-neon-400 drop-shadow-neon-sm" size={24} /> Próximas Cobranzas</>}
                  {activeModal === 'collected' && <><CheckSquare className="text-neon-400 drop-shadow-neon-sm" size={24} /> Éxito del Día</>}
                  {activeModal === 'active_credits' && <><Wallet className="text-neon-400 drop-shadow-neon-sm" size={24} /> Cartera de Créditos</>}
                </h3>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                  {activeModal === 'pending' && 'Seguimiento de cuotas por percibir.'}
                  {activeModal === 'collected' && 'Ingresos efectivos registrados hoy.'}
                  {activeModal === 'active_credits' && 'Estado integral de créditos en curso.'}
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-red-500/20 hover:text-red-500 transition-all border border-white/5 hover:border-red-500/30"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto">

              {/* VISTA: POR COBRAR (Active Credits Summary) */}
              {activeModal === 'active_credits' && (
                <div className="space-y-4 p-4">
                  {stats.activeCreditsList.length === 0 && (
                    <div className="text-center py-20 text-white/30">
                      <CreditCard size={64} className="mx-auto mb-6 opacity-10" />
                      <p className="font-black uppercase tracking-widest text-xs">Sin activos detectados</p>
                    </div>
                  )}

                  {stats.activeCreditsList.map((item) => (
                    <div
                      key={item.id}
                      className={`glass-glow border rounded-3xl p-6 transition-all relative overflow-hidden group ${item.status === 'defaulted'
                        ? 'border-red-500/30 bg-red-900/10'
                        : 'border-white/5 hover:border-neon-400/30'
                        }`}
                    >
                      {item.status === 'defaulted' && (
                        <div className="absolute top-0 right-0 bg-red-500 text-black text-[9px] uppercase font-black px-4 py-1.5 rounded-bl-2xl z-10 tracking-[0.2em] shadow-lg">
                          Default
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-6">
                        <div className={item.status === 'defaulted' ? 'opacity-60' : ''}>
                          <h4
                            onClick={() => setViewingClient(item.clientId)}
                            className={`text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-3 uppercase ${item.status === 'defaulted'
                              ? 'text-red-400'
                              : 'text-white hover:text-neon-400 hover:neon-text'
                              } transition-all duration-500`}
                          >
                            {item.clientName} <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </h4>
                          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-2">{item.productName}</p>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                          <div className="text-right">
                            <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em] mb-1">Pendiente</p>
                            <p className={`text-3xl font-black tracking-tighter transition-all duration-500 ${item.status === 'defaulted' ? 'text-white/30 line-through decoration-red-500' : 'text-white group-hover:neon-text'
                              }`}>
                              ${item.remainingAmount.toLocaleString()}
                            </p>
                          </div>

                          <button
                            onClick={() => toggleSaleStatus(item.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${item.status === 'defaulted'
                              ? 'bg-neon-400 text-black shadow-neon-sm hover:scale-105'
                              : 'bg-white/5 text-white/30 border border-white/5 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10'
                              }`}
                          >
                            {item.status === 'defaulted' ? (
                              <><RefreshCw size={12} className="animate-spin-slow" /> Regularizar</>
                            ) : (
                              <><Ban size={12} /> Detener</>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar & Details */}
                      <div className={`bg-white/[0.02] rounded-2xl p-4 border border-white/5 ${item.status === 'defaulted' ? 'opacity-50 grayscale' : ''}`}>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                          <span className="text-neon-400 group-hover:neon-text transition-colors">{item.paidInstallments} Pagadas</span>
                          <span className="text-white/30">{item.pendingInstallments} Restantes</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-3 p-[1px] border border-white/5 shadow-inner">
                          <div className={`h-full rounded-full transition-all duration-1000 ${item.status === 'defaulted' ? 'bg-gray-700' : 'bg-neon-400 shadow-neon-sm'}`} style={{ width: `${item.progress}%` }}></div>
                        </div>
                        <p className="text-[9px] text-white/30 text-center font-black uppercase tracking-[0.2em]">
                          Iniciado: {new Date(item.startDate).toLocaleDateString()} • {item.totalInstallments} Cuotas
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VISTA: ALERTAS (PENDING/OVERDUE) */}
              {activeModal === 'pending' && (
                <div className="space-y-4 p-4">
                  {stats.pendingList.length === 0 && (
                    <div className="text-center py-20 text-white/30 font-black uppercase tracking-widest text-xs">
                      <CheckCircle size={48} className="mx-auto mb-6 opacity-10" />
                      Todo el día está cubierto.
                    </div>
                  )}
                  {stats.pendingList.map((item) => (
                    <div
                      key={item.id}
                      className="glass-glow border border-white/5 rounded-2xl flex items-stretch justify-between group overflow-hidden hover:border-neon-400/30 transition-all duration-300 shadow-xl"
                    >
                      {/* Left: Click to Mark as Paid (Grouped) */}
                      <button
                        onClick={async () => {
                          if (item.installments && item.installments.length > 0) {
                            // Pay all grouped installments
                            for (const inst of item.installments) {
                              await markInstallmentPaid(inst.saleId, inst.id);
                            }
                          } else {
                            // Fallback for single (legacy)
                            markInstallmentPaid(item.saleId, item.id);
                          }
                        }}
                        className="w-20 flex items-center justify-center bg-white/[0.03] border-r border-white/5 hover:bg-neon-400 transition-all group/btn active:scale-95"
                        title="Marcar TODO cobrado"
                      >
                        <div className="w-8 h-8 rounded-xl border border-white/10 group-hover:border-black/20 flex items-center justify-center transition-all shadow-inner">
                          <DollarSign size={18} className="text-neon-400 group-hover:text-black transition-colors" />
                        </div>
                      </button>

                      {/* Middle: Click to View Client Details */}
                      <div className="flex-1 p-6 flex flex-col justify-center">
                        <div
                          onClick={() => setViewingClient(item.clientId)}
                          className="cursor-pointer hover:bg-white/[0.02] -m-2 p-2 rounded-xl transition-all"
                        >
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col w-full md:w-auto">
                              <p className="text-white font-black uppercase tracking-tight text-lg group-hover:text-neon-400 group-hover:neon-text transition-all flex items-center gap-2">
                                {item.clientName} <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${item.isOverdue ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-neon-400/20 text-neon-400 border border-neon-400/20'}`}>
                                  {item.isOverdue ? `Atraso: ${item.daysOverdue} días` : 'Vence Hoy'}
                                </span>
                                {item.missedPaymentsCount > 0 && (
                                  <span className="bg-amber-400/20 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                                    Moroso {item.missedPaymentsCount} cuota{item.missedPaymentsCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-2xl font-black text-white group-hover:neon-text transition-all">${item.amount.toLocaleString()}</span>
                          </div>

                          {/* If Multiple Items: Show Breakdown */}
                          {item.installments && item.installments.length > 1 ? (
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                              {item.installments.map((subInst: any, subIdx: number) => {
                                const prodName = item.products && item.products[subIdx] ? item.products[subIdx] : 'Crédito';
                                return (
                                  <div key={subInst.id} className="flex items-center justify-between bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] text-white font-bold uppercase tracking-tight">{prodName}</span>
                                      <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Cuota {subInst.number}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-black text-neon-400">${subInst.amount.toLocaleString()}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Don't open client modal
                                          markInstallmentPaid(subInst.saleId, subInst.id);
                                        }}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-neon-400 text-white/50 hover:text-black transition-all"
                                        title="Pagar solo esta cuota"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">
                                Cuota {item.number} • {item.productName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col border-l border-white/5 bg-white/[0.01]">
                        <button
                          onClick={() => reportMissedPayment(item.saleId)}
                          className="flex-1 px-4 hover:bg-amber-400/20 text-white/40 hover:text-amber-400 transition-all border-b border-white/5"
                          title="Atrasar cobro"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={() => toggleSaleStatus(item.saleId)}
                          className="flex-1 px-4 hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all"
                          title="Baja definitiva"
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VISTA: COBRADOS HOY */}
              {activeModal === 'collected' && (
                <div className="space-y-4 p-4">
                  {stats.collectedTodayList.length === 0 && (
                    <div className="text-center py-20 text-white/30 font-black uppercase tracking-widest text-xs">
                      <TrendingUp size={48} className="mx-auto mb-6 opacity-10" />
                      Esperando el primer ingreso del día.
                    </div>
                  )}
                  {stats.collectedTodayList.map((item) => (
                    <div key={item.id} className="glass-glow border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-neon-400/30 transition-all duration-500 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neon-400/10 border border-neon-400/20 rounded-2xl flex items-center justify-center text-neon-400 group-hover:shadow-neon-sm transition-all">
                          <CheckCircle size={24} />
                        </div>
                        <div>
                          <p className="text-white font-black uppercase tracking-tight text-lg">{item.clientName}</p>
                          <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                            <Clock size={12} /> {item.time}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-neon-400 neon-text">+${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLIENT DETAIL MODAL (Single Plate Redesign) */}
      {viewingClient && clientDetailData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[120] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="glass-glow border border-white/10 rounded-[32px] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-neon-400/50 shadow-neon-sm" />

            <button
              onClick={() => setViewingClient(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-black/50 text-white/50 hover:text-white transition-all z-20 border border-white/10"
            >
              <X size={16} />
            </button>

            <div className="p-5 flex flex-col items-center border-b border-white/5 bg-white/[0.02]">
              <div className="w-16 h-16 bg-white/5 border border-neon-400/30 rounded-2xl flex items-center justify-center mb-3 text-neon-400 shadow-neon-sm">
                <User size={32} />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter text-center line-clamp-1">{clientDetailData.client.name}</h2>
              <div className="flex items-center gap-1.5 mt-1 opacity-80">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-400 animate-pulse" />
                <span className="text-[8px] text-neon-400 font-bold uppercase tracking-widest">Perfil Verificado</span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Contact Info Compact */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2.5 bg-white/5 border border-white/5 rounded-xl group/info">
                  <Phone size={12} className="text-neon-400" />
                  <span className="text-[10px] text-white/50 font-bold truncate">{clientDetailData.client.phone}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-white/5 border border-white/5 rounded-xl group/info">
                  <MapPin size={12} className="text-neon-400" />
                  <span className="text-[10px] text-white/50 font-bold truncate">{clientDetailData.client.address}</span>
                </div>
              </div>

              {/* Financial Stats Compact */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-center">
                  <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1">En Deuda</p>
                  <p className="text-lg font-black text-red-500">${clientDetailData.totalDebt.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-neon-400/5 border border-neon-400/10 rounded-2xl text-center">
                  <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1">Pago Total</p>
                  <p className="text-lg font-black text-neon-400">${clientDetailData.totalPaid.toLocaleString()}</p>
                </div>
              </div>

              {/* Active Products List */}
              <div>
                <h4 className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Clock size={10} className="text-neon-400" /> Créditos Vigentes
                </h4>
                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {clientDetailData.clientSales.filter(s => s.status === 'active' || s.status === 'defaulted').length === 0 ? (
                    <div className="py-4 text-center text-white/30 text-[8px] font-black uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
                      Sin deudas vigentes
                    </div>
                  ) : (
                    clientDetailData.clientSales.filter(s => s.status === 'active' || s.status === 'defaulted').map(sale => (
                      <div key={sale.id} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex flex-col min-w-0">
                          <span className={`text-[11px] font-black uppercase tracking-tight truncate ${sale.status === 'defaulted' ? 'text-red-500' : 'text-white'}`}>
                            {sale.product.name}
                          </span>
                          <span className="text-[8px] text-white/30 font-bold flex items-center gap-1">
                            <Calendar size={10} className="text-neon-400" />
                            Iniciado: {new Date(sale.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-[11px] font-black flex-shrink-0 ml-2 ${sale.status === 'defaulted' ? 'text-red-400' : 'text-neon-400'}`}>
                          ${sale.remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};