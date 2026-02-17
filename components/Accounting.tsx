import React, { useState, useMemo } from 'react';
import { useStore } from '../store/StoreContext';
import { getArgentinaDateFrom, formatArgentinaDate } from '../utils/dateUtils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { DollarSign, TrendingUp, Calendar, Wallet } from 'lucide-react';

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const Accounting: React.FC = () => {
  const { sales } = useStore();
  const [filter, setFilter] = useState<TimeFilter>('monthly');

  // Helper to get week number
  const getWeek = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const financialData = useMemo(() => {
    const dataMap = new Map<string, { label: string, income: number, expense: number, salesVolume: number, order: number }>();

    sales.forEach(sale => {
      const date = getArgentinaDateFrom(sale.startDate);
      let key = '';
      let label = '';
      let order = date.getTime();

      if (filter === 'daily') {
        key = date.toISOString().split('T')[0];
        label = formatArgentinaDate(date.toISOString(), { day: '2-digit', month: 'short' });
      } else if (filter === 'weekly') {
        const week = getWeek(date);
        key = `${date.getFullYear()}-W${week}`;
        label = `Sem ${week}`;
      } else if (filter === 'monthly') {
        key = `${date.getFullYear()}-${date.getMonth()}`;
        label = formatArgentinaDate(date.toISOString(), { month: 'short', year: '2-digit' });
        order = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      } else {
        key = `${date.getFullYear()}`;
        label = `${date.getFullYear()}`;
        order = new Date(date.getFullYear(), 0, 1).getTime();
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { label, income: 0, expense: 0, salesVolume: 0, order });
      }

      const entry = dataMap.get(key)!;
      entry.expense += sale.product.costPrice;
      entry.salesVolume += sale.totalAmount;
    });

    sales.forEach(sale => {
      sale.installments.forEach(inst => {
        if (inst.status === 'paid' && inst.paidAt) {
          const date = getArgentinaDateFrom(inst.paidAt);
          let key = '';

          if (filter === 'daily') key = date.toISOString().split('T')[0];
          else if (filter === 'weekly') key = `${date.getFullYear()}-W${getWeek(date)}`;
          else if (filter === 'monthly') key = `${date.getFullYear()}-${date.getMonth()}`;
          else key = `${date.getFullYear()}`;

          if (!dataMap.has(key)) {
            let label = '';
            let order = date.getTime();
            if (filter === 'daily') label = formatArgentinaDate(date.toISOString(), { day: '2-digit', month: 'short' });
            else if (filter === 'weekly') label = `Sem ${getWeek(date)}`;
            else if (filter === 'monthly') {
              label = formatArgentinaDate(date.toISOString(), { month: 'short', year: '2-digit' });
              order = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
            }
            else label = `${date.getFullYear()}`;

            dataMap.set(key, { label, income: 0, expense: 0, salesVolume: 0, order });
          }

          const entry = dataMap.get(key)!;
          entry.income += inst.amount;
        }
      });
    });

    return Array.from(dataMap.values()).sort((a, b) => a.order - b.order);
  }, [sales, filter]);

  const totals = useMemo(() => {
    return financialData.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      expense: acc.expense + curr.expense,
      salesVolume: acc.salesVolume + curr.salesVolume
    }), { income: 0, expense: 0, salesVolume: 0 });
  }, [financialData]);

  const profit = totals.income - totals.expense;
  const margin = totals.salesVolume > 0 ? ((totals.salesVolume - totals.expense) / totals.salesVolume) * 100 : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            ANÁLISIS <span className="text-neon-400 uppercase">Contable</span>
          </h1>
          <p className="text-white/60 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-400 animate-pulse" />
            Reportes financieros y rendimiento de capital.
          </p>
        </div>

        <div className="glass-glow border border-white/5 p-1.5 rounded-2xl flex flex-wrap items-center gap-1">
          {(['daily', 'weekly', 'monthly', 'yearly'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 min-w-[70px] px-3 md:px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === f
                ? 'bg-neon-400 text-black shadow-neon-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
            >
              {f === 'daily' && 'Día'}
              {f === 'weekly' && 'Sem'}
              {f === 'monthly' && 'Mes'}
              {f === 'yearly' && 'Año'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-glow border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-neon-400/30 transition-all duration-500 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-400/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-neon-400/10 transition-all" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] mb-2">Ingresos (Caja)</p>
              <h3 className="text-3xl font-black text-white group-hover:neon-text transition-all duration-500">${totals.income.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-neon-400/10 text-neon-400 rounded-2xl border border-neon-400/20 group-hover:shadow-neon-sm transition-all">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-neon-400 h-1 rounded-full shadow-[0_0_8px_rgba(57,255,20,0.8)]" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="glass-glow border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-blue-400/30 transition-all duration-500 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-400/10 transition-all" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Ventas Proyectadas</p>
              <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-all duration-500">${totals.salesVolume.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all">
              <Wallet size={24} />
            </div>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-1 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="glass-glow border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-red-500/30 transition-all duration-500 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-red-400/10 transition-all" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Costos Estimados</p>
              <h3 className="text-3xl font-black text-white group-hover:text-red-500 transition-all duration-500">${totals.expense.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-red-500 h-1 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" style={{ width: `${totals.salesVolume > 0 ? (totals.expense / totals.salesVolume) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="glass-glow border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-neon-400/30 transition-all duration-500 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-400/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-neon-400/10 transition-all" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Resultado Neto</p>
              <h3 className={`text-3xl font-black mt-1 transition-all duration-500 ${profit >= 0 ? 'text-neon-400 neon-text' : 'text-red-500'}`}>
                {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-white/5 text-white/30 rounded-2xl border border-white/5">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center justify-between">
            Margen Operativo <span className="text-white text-xs">{margin.toFixed(1)}%</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 glass-glow border border-white/5 rounded-[32px] p-6 md:p-10 shadow-2xl h-[400px] md:h-[500px]">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-8">Performance: <span className="text-white">Flujo vs Volumen</span></h3>
          <div className="w-full h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#333" tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#333" tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <CartesianGrid strokeDasharray="10 10" stroke="#1a1a1a" vertical={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', borderColor: 'rgba(57,255,20,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#39FF14', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}
                  cursor={{ stroke: '#39FF14', strokeWidth: 1, strokeDasharray: '5 5' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="salesVolume" name="Ventas Totales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="income" name="Ingreso Real (Caja)" stroke="#39FF14" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-glow border border-white/5 rounded-[32px] p-6 md:p-10 shadow-2xl h-[400px] md:h-[500px] flex flex-col">
          <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-8">Evolución de Recaudación</h3>
          <div className="flex-1 w-full h-[250px] md:h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData.slice(-10)}>
                <CartesianGrid strokeDasharray="10 10" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="label" stroke="#333" tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                  labelStyle={{ color: '#fff', fontWeight: 900, marginBottom: '8px' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
                />
                <Bar dataKey="income" name="Ingresos" fill="#39FF14" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Costos" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">Perspectiva inmediata de los últimos periodos.</p>
          </div>
        </div>
      </div>

      <div className="glass-glow border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Registro Histórico detallado</h3>
          <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Filtro: <span className="text-neon-400">{filter}</span></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] text-white/40 text-[10px] uppercase font-black font-extrabold tracking-widest border-b border-white/5">
              <tr>
                <th className="p-6">Periodo Analítico</th>
                <th className="p-6 text-right">Volumen Ventas</th>
                <th className="p-6 text-right text-neon-400">Ingreso Neto (Caja)</th>
                <th className="p-6 text-right text-red-500">Costo Mercadería</th>
                <th className="p-6 text-right">Balance Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {financialData.slice().reverse().map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-all duration-300 group">
                  <td className="p-6 font-black text-white group-hover:text-neon-400 transition-colors uppercase tracking-tight">{row.label}</td>
                  <td className="p-6 text-right text-white/60 font-bold tracking-tight group-hover:text-white transition-colors">${row.salesVolume.toLocaleString()}</td>
                  <td className="p-6 text-right text-neon-400 font-black group-hover:neon-text transition-colors">+${row.income.toLocaleString()}</td>
                  <td className="p-6 text-right text-red-500 font-bold opacity-80">-${row.expense.toLocaleString()}</td>
                  <td className="p-6 text-right font-black">
                    <span className={`px-4 py-2 rounded-xl border ${row.income - row.expense >= 0 ? 'bg-neon-400/10 border-neon-400/20 text-neon-400 shadow-[0_0_15px_rgba(57,255,20,0.05)]' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                      ${(row.income - row.expense).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {financialData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-white/30 font-black uppercase tracking-widest text-[10px]">
                    No se registran movimientos históricos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};