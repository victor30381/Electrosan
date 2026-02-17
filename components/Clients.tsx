import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { safeDateFormat } from '../utils/dateUtils';
import {
   Search, User, Phone, MapPin, Pencil, Trash2,
   ShoppingCart, ChevronDown, Package, Calendar,
   CheckCircle, AlertTriangle, X, FileText, Check,
   AlertCircle
} from 'lucide-react';
import { PaymentFrequency, PaymentMethod, Sale } from '../types';



interface ClientsProps {
   onNavigateToSales?: () => void;
}

export const Clients: React.FC<ClientsProps> = ({ onNavigateToSales }) => {
   const { clients, sales, deleteClient, isDefaulter, getClientStats, setPreSelectedClientId, markInstallmentPaid } = useStore();
   const [searchTerm, setSearchTerm] = useState('');
   const [showForm, setShowForm] = useState(false);
   const [editingClientId, setEditingClientId] = useState<string | null>(null);
   const [viewingClient, setViewingClient] = useState<any | null>(null);
   const [formData, setFormData] = useState({
      name: '',
      phone: '',
      address: '',
      notes: ''
   });

   const filteredClients = clients.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
   );

   const clientStats = viewingClient ? getClientStats(viewingClient.id) : null;

   const handleNewSale = (clientId: string) => {
      setPreSelectedClientId(clientId);
      if (onNavigateToSales) {
         onNavigateToSales();
      } else {
         // Fallback if prop not provided (like in old versions)
         window.dispatchEvent(new CustomEvent('nav-change', { detail: { view: 'sales', clientId } }));
      }
   };

   const handleEdit = (client: any, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingClientId(client.id);
      setFormData({
         name: client.name,
         phone: client.phone,
         address: client.address,
         notes: client.notes || ''
      });
      setShowForm(true);
   };

   const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`¿Estás seguro de eliminar a ${name}? Se borrarán también todas sus ventas.`)) {
         try {
            await deleteClient(id);
         } catch (error) {
            console.error("Error deleting client:", error);
            alert("No se pudo eliminar el cliente.");
         }
      }
   };

   const { addClient, updateClient } = useStore();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         if (editingClientId) {
            await updateClient(editingClientId, formData);
         } else {
            await addClient(formData);
         }
         setShowForm(false);
         setEditingClientId(null);
         setFormData({ name: '', phone: '', address: '', notes: '' });
      } catch (error) {
         console.error("Error saving client:", error);
         alert("Hubo un error al guardar el cliente.");
      }
   };

   return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
               <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                  CONTROL DE <span className="text-neon-400 uppercase">Clientes</span>
               </h1>
               <p className="text-white/60 mt-2 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-400 animate-pulse" />
                  Base de datos estratégica y estados de cuenta.
               </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
               <div className="relative group flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-neon-400 transition-colors" size={18} />
                  <input
                     type="text"
                     placeholder="Buscar por nombre o celular..."
                     className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-medium focus:outline-none focus:border-neon-400/50 focus:bg-white/[0.04] transition-all placeholder:text-white/20"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                     <span className="text-[10px] font-black text-neon-400">{filteredClients.length}</span>
                  </div>
               </div>

               <button
                  onClick={() => {
                     setEditingClientId(null);
                     setFormData({ name: '', phone: '', address: '', notes: '' });
                     setShowForm(true);
                  }}
                  className="bg-neon-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-neon-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
               >
                  <User size={18} /> Nuevo Cliente
               </button>
            </div>
         </header>

         <div className="glass-glow border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400/20 to-transparent" />

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto relative z-10">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-white/40 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
                        <th className="p-6">Perfil Cliente</th>
                        <th className="p-6">Información Contacto</th>
                        <th className="p-6">Ubicación</th>
                        <th className="p-6 text-right">Acciones de Gestión</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {filteredClients.map((client, index) => {
                        const defaulted = isDefaulter(client.id);
                        return (
                           <tr
                              key={client.id}
                              onClick={() => setViewingClient(client)}
                              className={`transition-all duration-300 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 ${defaulted
                                 ? 'bg-red-900/10 border-l-4 border-red-500 hover:bg-red-900/20'
                                 : 'hover:bg-white/[0.03] border-l-4 border-transparent hover:border-neon-400'
                                 }`}
                              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
                           >
                              <td className="p-6">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${defaulted
                                       ? 'bg-red-900/30 text-red-500 border border-red-500/30'
                                       : 'bg-white/5 text-neon-400 border border-white/10 group-hover:bg-neon-400 group-hover:text-black group-hover:shadow-neon-sm'
                                       }`}>
                                       {defaulted ? <AlertTriangle size={24} /> : <User size={24} />}
                                    </div>
                                    <div>
                                       <p className={`text-lg font-black tracking-tight transition-colors flex items-center gap-2 ${defaulted ? 'text-red-400' : 'text-white group-hover:text-neon-400 group-hover:neon-text'}`}>
                                          {client.name}
                                          {defaulted && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Baja Definitiva</span>}
                                       </p>
                                       <div className="flex items-center gap-2">
                                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">ID #{client.id.substr(0, 6)}</p>
                                          {(() => {
                                             const clientSales = sales.filter(s => s.clientId === client.id && s.status === 'active');
                                             const totalMissed = clientSales.reduce((acc, s) => acc + (s.missedPaymentsCount || 0), 0);
                                             return totalMissed > 0 ? (
                                                <span className="text-[8px] bg-amber-400/20 text-amber-500 border border-amber-400/30 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                   Moroso {totalMissed} cuota{totalMissed > 1 ? 's' : ''}
                                                </span>
                                             ) : null;
                                          })()}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6">
                                 <div className="flex items-center gap-3 text-white/50 group-hover:text-white transition-colors">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-neon-400/30">
                                       <Phone size={14} className="text-white/40 group-hover:text-neon-400" />
                                    </div>
                                    <span className="font-semibold tracking-wide">{client.phone}</span>
                                 </div>
                              </td>
                              <td className="p-6">
                                 <div className="flex items-center gap-3 text-white/50 group-hover:text-white transition-colors">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-neon-400/30">
                                       <MapPin size={14} className="text-white/40 group-hover:text-neon-400" />
                                    </div>
                                    <span className="font-medium truncate max-w-[220px]">{client.address}</span>
                                 </div>
                              </td>
                              <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                                 <div className="flex items-center justify-end gap-3">
                                    <button
                                       type="button"
                                       onClick={(e) => handleEdit(client, e)}
                                       className="p-3 text-white/30 hover:text-yellow-400 hover:bg-yellow-400/20 rounded-xl transition-all border border-transparent hover:border-yellow-400/30"
                                       title="Editar Cliente"
                                    >
                                       <Pencil size={20} />
                                    </button>
                                    <button
                                       type="button"
                                       onClick={(e) => handleDelete(client.id, client.name, e)}
                                       className="p-3 text-white/30 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all border border-transparent hover:border-red-500/30"
                                       title="Eliminar Cliente"
                                    >
                                       <Trash2 size={20} />
                                    </button>
                                    <button
                                       type="button"
                                       onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleNewSale(client.id);
                                       }}
                                       className="bg-white/5 hover:bg-neon-400 hover:text-black border border-white/10 hover:border-neon-400 text-white/40 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ml-2 hover:shadow-neon-sm active:scale-95 transition-all duration-300 hover-neon-indirect"
                                    >
                                       <ShoppingCart size={16} />
                                       Vender
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-6 space-y-4 relative z-10">
               {filteredClients.map((client, index) => {
                  const defaulted = isDefaulter(client.id);
                  return (
                     <div
                        key={client.id}
                        onClick={() => setViewingClient(client)}
                        className={`glass-glow border rounded-[24px] p-6 space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${defaulted ? 'border-red-500/30 bg-red-900/5' : 'border-white/5 hover:border-neon-400/30'}`}
                        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${defaulted ? 'bg-red-900/30 text-red-500' : 'bg-white/5 text-neon-400 border border-white/10'}`}>
                                 {defaulted ? <AlertTriangle size={24} /> : <User size={24} />}
                              </div>
                              <div>
                                 <h4 className={`text-lg font-black tracking-tight ${defaulted ? 'text-red-400' : 'text-white'}`}>{client.name}</h4>
                                 <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Saldo Deuda #{client.id.substr(0, 6)}</p>
                                    {(() => {
                                       const clientSales = sales.filter(s => s.clientId === client.id && s.status === 'active');
                                       const totalMissed = clientSales.reduce((acc, s) => acc + (s.missedPaymentsCount || 0), 0);
                                       return totalMissed > 0 ? (
                                          <span className="text-[8px] bg-amber-400/20 text-amber-500 border border-amber-400/20 px-2 py-0.5 rounded-full font-black uppercase">
                                             Moroso {totalMissed} cuota{totalMissed > 1 ? 's' : ''}
                                          </span>
                                       ) : null;
                                    })()}
                                 </div>
                              </div>
                           </div>
                           {defaulted && <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Baja Definitiva</span>}
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center gap-4 text-xs font-medium text-white/50">
                              <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                 <Phone size={14} className="text-neon-400" />
                              </div>
                              {client.phone}
                           </div>
                           <div className="flex items-center gap-4 text-xs font-medium text-white/50">
                              <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                 <MapPin size={14} className="text-neon-400" />
                              </div>
                              <span className="truncate">{client.address}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-white/5" onClick={e => e.stopPropagation()}>
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleNewSale(client.id);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 bg-neon-400/10 hover:bg-neon-400 text-neon-400 hover:text-black border border-neon-400/20 hover:border-neon-400 p-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-neon-sm hover-neon-indirect"
                           >
                              Nueva Venta
                           </button>
                           <button
                              onClick={(e) => handleEdit(client, e)}
                              className="p-4 bg-white/5 text-white/30 rounded-xl border border-white/10 active:bg-yellow-400/20 active:text-yellow-400"
                           >
                              <Pencil size={18} />
                           </button>
                           <button
                              onClick={(e) => handleDelete(client.id, client.name, e)}
                              className="p-4 bg-white/5 text-white/30 rounded-xl border border-white/10 active:bg-red-500/20 active:text-red-500"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>

            {filteredClients.length === 0 && (
               <div className="p-16 text-center text-white/40 font-bold uppercase tracking-widest text-xs">
                  <User size={48} className="mx-auto mb-4 opacity-10" />
                  No se encontraron clientes.
               </div>
            )}
         </div>

         {/* CLIENT FORM MODAL (Add / Edit) */}
         {showForm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
               <div className="glass-glow border border-white/10 rounded-[32px] w-full max-w-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400 to-transparent" />

                  <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative z-10">
                     <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                           {editingClientId ? 'Editar Cliente' : 'Nuevo Cliente'}
                        </h3>
                        <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Gestión integral de datos de contacto</p>
                     </div>
                     <button
                        onClick={() => setShowForm(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-red-500/20 hover:text-red-500 transition-all border border-white/5"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 relative z-10">
                     <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Nombre Completo</label>
                        <input
                           type="text"
                           required
                           value={formData.name}
                           onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20 font-medium text-sm"
                              placeholder="555-0101"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Observaciones</label>
                           <input
                              type="text"
                              required
                              value={formData.address}
                              onChange={e => setFormData({ ...formData, address: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20 font-medium text-sm"
                              placeholder="Av. Siempre Viva 742"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Notas (Opcional)</label>
                        <textarea
                           value={formData.notes}
                           onChange={e => setFormData({ ...formData, notes: e.target.value })}
                           className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 h-20 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20 resize-none font-medium text-xs"
                           placeholder="Referencias de pago, horarios, etc."
                        />
                     </div>

                     <button
                        type="submit"
                        className="w-full bg-neon-400 text-black font-black uppercase tracking-widest text-xs py-4.5 rounded-xl shadow-neon-md hover:shadow-neon-lg hover:scale-[1.01] active:scale-95 transition-all duration-300"
                     >
                        <Check className="inline-block mr-2" size={16} />
                        {editingClientId ? 'Actualizar Información' : 'Registrar Cliente'}
                     </button>
                  </form>
               </div>
            </div>
         )}

         {/* CLIENT ACCOUNT STATEMENT MODAL */}
         {viewingClient && clientStats && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
               <div className="glass-glow border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-neon-400/50 to-transparent blur-[2px]" />

                  {/* Modal Header */}
                  <div className="p-4 md:p-6 bg-white/[0.02] border-b border-white/5 relative flex-shrink-0">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-neon-400/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />

                     <div className="flex flex-row justify-between items-start gap-4 relative z-10">
                        {/* TOP-LEFT: Avatar & Name */}
                        <div className="flex flex-row items-center gap-3 md:gap-5 text-left flex-1 min-w-0">
                           <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center border shadow-xl transition-all duration-500 flex-shrink-0 ${isDefaulter(viewingClient.id) ? 'border-red-500/30 bg-red-900/20 text-red-500' : 'bg-white/5 border-neon-400/30 text-neon-400'}`}>
                              {isDefaulter(viewingClient.id) ? <AlertTriangle size={24} className="md:w-8 md:h-8" /> : <User size={24} className="md:w-8 md:h-8" />}
                           </div>
                           <div className="flex flex-col min-w-0">
                              <h2 className={`text-xl md:text-3xl font-black tracking-tighter truncate ${isDefaulter(viewingClient.id) ? 'text-red-400' : 'text-white'}`}>
                                 {viewingClient.name}
                              </h2>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <p className="text-[8px] md:text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">Cliente Verificado</p>
                                 {(() => {
                                    const clientSales = sales.filter(s => s.clientId === viewingClient.id && s.status === 'active');
                                    const totalMissed = clientSales.reduce((acc, s) => acc + (s.missedPaymentsCount || 0), 0);
                                    return totalMissed > 0 ? (
                                       <span className="text-[8px] bg-amber-400/20 text-amber-500 border border-amber-400/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                          Moroso {totalMissed} cuota{totalMissed > 1 ? 's' : ''}
                                       </span>
                                    ) : null;
                                 })()}
                              </div>
                           </div>
                        </div>

                        {/* TOP-RIGHT: Small Contact Info & Actions */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                           <div className="flex items-center gap-2">
                              <button
                                 onClick={() => {
                                    setShowForm(true);
                                    setEditingClientId(viewingClient.id);
                                    setFormData({ name: viewingClient.name, phone: viewingClient.phone, address: viewingClient.address, notes: viewingClient.notes || '' });
                                    setViewingClient(null);
                                 }}
                                 className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-yellow-400/20 rounded-lg text-white/40 hover:text-yellow-400 transition-all border border-white/10"
                                 title="Editar"
                              >
                                 <Pencil size={14} />
                              </button>
                              <button
                                 onClick={() => setViewingClient(null)}
                                 className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-500 transition-all border border-white/10"
                              >
                                 <X size={14} />
                              </button>
                           </div>

                           <div className="flex flex-col gap-1.5 items-end">
                              <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                 <Phone size={10} className="text-neon-400" />
                                 <span className="text-white text-[10px] md:text-xs font-bold">{viewingClient.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                 <MapPin size={10} className="text-neon-400" />
                                 <span className="text-white text-[10px] md:text-xs font-bold truncate max-w-[120px] md:max-w-none">{viewingClient.address}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 p-3 md:p-6 bg-white/[0.01] border-b border-white/5 relative z-10 flex-shrink-0">
                     <div className="glass-glow p-2.5 md:p-4 rounded-xl border border-white/5 group">
                        <p className="text-[8px] md:text-[9px] text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5 mb-0.5 group-hover:text-white transition-colors">
                           <ShoppingCart size={10} className="text-neon-400" /> Comprado
                        </p>
                        <p className="text-lg md:text-2xl font-black text-white group-hover:neon-text transition-all duration-300">${clientStats.totalPurchased.toLocaleString()}</p>
                     </div>
                     <div className="glass-glow p-2.5 md:p-4 rounded-xl border border-neon-400/20 shadow-[0_0_15px_rgba(57,255,20,0.05)] group">
                        <p className="text-[8px] md:text-[9px] text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5 mb-0.5 group-hover:text-white transition-colors">
                           <Check size={10} className="text-neon-400" /> Pagado
                        </p>
                        <p className="text-lg md:text-2xl font-black text-neon-400 drop-shadow-[0_0_8px_rgba(57,255,20,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(57,255,20,0.5)] transition-all duration-300">${clientStats.totalPaid.toLocaleString()}</p>
                     </div>
                     <div className={`glass-glow p-2.5 md:p-4 rounded-xl border ${isDefaulter(viewingClient.id) ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-red-500/20'} group`}>
                        <p className="text-[8px] md:text-[9px] text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5 mb-0.5 group-hover:text-white transition-colors">
                           <AlertCircle size={10} className="text-red-500" /> Deuda
                        </p>
                        <p className="text-lg md:text-2xl font-black text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all duration-300">${clientStats.totalDebt.toLocaleString()}</p>
                     </div>
                  </div>

                  {/* Transaction History */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black/40">
                     <h3 className="text-sm md:text-base font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest opacity-80">
                        <FileText className="text-neon-400" size={14} /> Historial
                     </h3>

                     {clientStats.history.length === 0 ? (
                        <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-xl text-xs">
                           No hay historial para este cliente.
                        </div>
                     ) : (
                        <div className="space-y-3">
                           {clientStats.history.map(sale => (
                              <ClientSaleHistoryItem key={sale.id} sale={sale} />
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 md:p-6 border-t border-white/5 bg-white/[0.02] flex justify-center md:justify-end relative z-10 flex-shrink-0">
                     <button
                        onClick={() => {
                           setViewingClient(null);
                           handleNewSale(viewingClient.id);
                        }}
                        className="w-full md:w-auto bg-neon-400 text-black font-black uppercase tracking-[0.2em] text-[10px] py-3.5 px-6 rounded-xl shadow-neon-md hover:shadow-neon-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                     >
                        <ShoppingCart size={14} /> Nueva Venta
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

// Sub-component for individual sale history item
const ClientSaleHistoryItem: React.FC<{ sale: Sale }> = ({ sale }) => {
   const { markInstallmentPaid } = useStore();
   const [expanded, setExpanded] = useState(false);
   const progress = ((sale.totalAmount - sale.remainingAmount) / sale.totalAmount) * 100;
   const isCompleted = sale.status === 'completed';
   const isDefaulted = sale.status === 'defaulted';

   return (
      <div className={`glass-glow border ${isCompleted ? 'border-white/5 opacity-70' : isDefaulted ? 'border-red-500' : 'border-neon-400/20 hover:border-neon-400/50'} rounded-2xl overflow-hidden transition-all duration-300 shadow-xl group`}>
         <div
            className={`p-6 cursor-pointer group-hover:bg-white/[0.02] transition-colors ${isDefaulted ? 'bg-red-900/10' : ''}`}
            onClick={() => setExpanded(!expanded)}
         >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
               <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-white/5 text-white/40' : isDefaulted ? 'bg-red-900/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-neon-400/10 text-neon-400 shadow-[0_0_15px_rgba(57,255,20,0.1)] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]'}`}>
                     {isDefaulted ? <AlertTriangle size={24} /> : isCompleted ? <CheckCircle size={24} className="text-white/40" /> : <Package size={24} />}
                  </div>
                  <div>
                     <h4 className={`text-lg font-black tracking-tight transition-colors ${isDefaulted ? 'text-red-400' : isCompleted ? 'text-white/40' : 'text-white'}`}>
                        {sale.product.name}
                        {isDefaulted && <span className="text-[10px] ml-2 text-red-500 border border-red-500/30 px-2 py-0.5 rounded-full uppercase font-black">Incumplimiento</span>}
                        {isCompleted && <span className="text-[10px] ml-2 text-white/40 border border-white/5 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Finalizado</span>}
                     </h4>
                     <p className="text-[10px] text-white/40 flex items-center gap-3 uppercase font-black tracking-widest mt-1">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-neon-400" /> {safeDateFormat(sale.startDate).toLocaleDateString()}</span>
                        <span className="w-1 h-1 bg-white/40 rounded-full" />
                        <span className={`${sale.frequency === 'Diaria' ? 'text-cyan-400' :
                           sale.frequency === 'Semanal' ? 'text-orange-400' :
                              sale.frequency === 'Mensual' ? 'text-violet-400' :
                                 'text-neon-400/70'
                           }`}>{sale.frequency}</span>
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-8 md:gap-12 flex-1 justify-end">
                  <div className="text-right">
                     <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Monto Total</p>
                     <p className="text-xl font-black text-white">${sale.totalAmount.toLocaleString()}</p>
                  </div>

                  {!isCompleted && (
                     <div className="text-right">
                        <p className="text-[10px] text-red-400 uppercase font-black tracking-widest mb-1">Saldo Pendiente</p>
                        <p className={`text-xl font-black ${isDefaulted ? 'text-white/40 line-through decoration-red-500' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]'}`}>
                           ${sale.remainingAmount.toLocaleString()}
                        </p>
                     </div>
                  )}

                  <div className={`p-2 rounded-xl bg-white/5 border border-white/10 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                     <ChevronDown size={18} className="text-white/40" />
                  </div>
               </div>
            </div>

            <div className="mt-6 w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 p-[1px]">
               <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${isCompleted ? 'bg-gray-600' : isDefaulted ? 'bg-red-500' : 'bg-neon-400'}`}
                  style={{ width: `${progress}%`, color: isCompleted ? '#4b5563' : isDefaulted ? '#ef4444' : '#39ff14' }}
               />
            </div>
         </div>

         {expanded && (
            <div className="border-t border-white/5 bg-white/[0.02] p-8 animate-in slide-in-from-top-2 duration-300">
               <h5 className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] mb-6 ml-1">Plan de Cuotas</h5>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {sale.installments.map(inst => (
                     <div
                        key={inst.id}
                        onClick={(e) => { e.stopPropagation(); markInstallmentPaid(sale.id, inst.id); }}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center cursor-pointer active:scale-95 ${inst.status === 'paid'
                           ? 'bg-neon-400/5 border-neon-400/20 text-neon-400 shadow-inner hover:border-neon-400/50'
                           : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                           }`}
                        title={inst.status === 'paid' ? 'Desmarcar pago' : 'Marcar como pagado'}
                     >
                        <p className="text-[9px] uppercase font-black tracking-widest opacity-50 mb-1">Nº {inst.number}</p>
                        <div className="flex items-center gap-2">
                           <p className={`text-lg font-black ${inst.status === 'paid' ? 'neon-text' : ''}`}>${inst.amount.toFixed(0)}</p>
                           {inst.status === 'paid' && <Check size={14} className="text-neon-400" />}
                        </div>
                        <p className="text-[9px] font-bold opacity-40 mt-1 uppercase">{safeDateFormat(inst.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};