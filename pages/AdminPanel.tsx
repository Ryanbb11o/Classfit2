
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, MessageSquare, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, Eye, X, Save, Loader2, TrendingUp, Wallet, Check, Ban, DollarSign, PieChart, History, CreditCard, Banknote, Calendar, Clock, User, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { User as UserType, Booking } from '../types';

const TransactionDossier: React.FC<{ booking: Booking | null; onClose: () => void; users: UserType[] }> = ({ booking, onClose, users }) => {
  if (!booking) return null;
  const trainer = users.find(u => u.id === booking.trainerId);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300 text-left">
       <div className="bg-surface border border-white/10 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand"></div>
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full"><X size={20} /></button>
          
          <div className="mb-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-lg text-[9px] font-black uppercase tracking-widest mb-4">
                <ShieldCheck size={12} /> Verified Settlement
             </div>
             <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none mb-2">Transaction Dossier</h2>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Reference: {booking.id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div>
                   <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-3 italic">Session Info</h4>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3 text-white font-bold"><Calendar size={14} className="text-brand"/> {booking.date}</div>
                      <div className="flex items-center gap-3 text-white font-bold"><Clock size={14} className="text-brand"/> {booking.time}</div>
                      <div className="flex items-center gap-3 text-white font-bold uppercase italic"><User size={14} className="text-brand"/> {booking.customerName}</div>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-3 italic">Assigned Coach</h4>
                   <div className="flex items-center gap-4">
                      <img src={trainer?.image || DEFAULT_PROFILE_IMAGE} className="w-12 h-12 rounded-xl object-cover grayscale" />
                      <div>
                         <p className="text-white font-black uppercase italic text-sm leading-none mb-1">{trainer?.name.split('(')[0].trim()}</p>
                         <p className="text-[9px] text-brand font-black uppercase tracking-widest">{trainer?.name.match(/\((.*)\)/)?.[1] || 'Professional'}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-dark/40 border border-white/5 rounded-[2rem] space-y-6">
                <div>
                   <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-4 italic">Settlement Analysis</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-medium">Payment Mode</span>
                         <span className="text-white font-black uppercase tracking-widest flex items-center gap-2">
                            {booking.paymentMethod === 'card' ? <><CreditCard size={12}/> Card</> : <><Banknote size={12}/> Cash</>}
                         </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-medium">Total Fee</span>
                         <span className="text-white font-black italic text-lg">{booking.price.toFixed(2)} BGN</span>
                      </div>
                      <div className="h-px bg-white/5"></div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-brand font-black uppercase tracking-widest">Gym Revenue</span>
                         <span className="text-brand font-black italic">{booking.commissionAmount?.toFixed(2)} BGN</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-medium italic">Coach Payout</span>
                         <span className="text-white font-bold italic">{booking.trainerEarnings?.toFixed(2)} BGN</span>
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5 text-center">
                   <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1 italic">Settled At</p>
                   <p className="text-[10px] text-white font-bold">{booking.settledAt ? new Date(booking.settledAt).toLocaleString() : 'N/A'}</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { language, bookings, reviews, updateReview, deleteReview, updateBooking, deleteBooking, isAdmin, users, deleteUser, updateUser, currentUser, refreshData, confirmAction } = useAppContext();
  const location = useLocation();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'trainers' | 'finance' | 'users' | 'applications' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingSettlement, setPendingSettlement] = useState<string | null>(null);
  const [viewingDossier, setViewingDossier] = useState<Booking | null>(null);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const totalRevenue = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0), [completedBookings]);
  const coachPayouts = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.trainerEarnings) || 0), 0), [completedBookings]);
  const gymProfit = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.commissionAmount) || 0), 0), [completedBookings]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const handleExecuteSettlement = async (method: 'cash' | 'card') => {
    if (!pendingSettlement) return;
    await updateBooking(pendingSettlement, { status: 'completed', paymentMethod: method });
    setPendingSettlement(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    confirmAction({
      title: 'Void Session',
      message: 'Are you sure you want to cancel this booking?',
      onConfirm: async () => await updateBooking(bookingId, { status: 'cancelled' })
    });
  };

  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  if (!isAdmin) return <div className="p-20 text-center text-white">{t.accessDenied}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none">Management Console</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-xl bg-white/5 ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}><RefreshCw size={18} /></button>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">ClassFit Varna • Mir Stop Base</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-surface p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: LayoutDashboard, label: t.tabOverview },
              { id: 'finance', icon: FileSpreadsheet, label: t.tabAnalysis, badge: awaitingPaymentList.length },
              { id: 'bookings', icon: ListFilter, label: t.tabBookings },
              { id: 'trainers', icon: Briefcase, label: t.trainer },
              { id: 'applications', icon: UserCheck, label: t.tabRecruitment, badge: users.filter(u => u.role === 'trainer_pending').length },
              { id: 'users', icon: Users, label: t.tabUsers }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <tab.icon size={14} /> {tab.label}
                    {tab.badge ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] bg-red-500 text-white">{tab.badge}</span> : null}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'overview' && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="p-8 bg-brand text-dark rounded-[2.5rem] shadow-xl relative overflow-hidden group">
               <div className="absolute top-4 right-4 opacity-10"><PieChart size={48} /></div>
               <p className="text-[10px] font-black uppercase mb-4 tracking-widest italic opacity-60">Gross Revenue</p>
               <p className="text-4xl font-black italic">{totalRevenue.toFixed(2)} <span className="text-xs">BGN</span></p>
            </div>
            <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-4 right-4 opacity-5"><DollarSign size={48} /></div>
               <p className="text-[10px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Coach Payouts</p>
               <p className="text-4xl font-black italic text-white">{coachPayouts.toFixed(2)} <span className="text-xs">BGN</span></p>
            </div>
            <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-4 right-4 opacity-10"><TrendingUp size={48} className="text-brand" /></div>
               <p className="text-[10px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Net Profit</p>
               <p className="text-4xl font-black italic text-brand">{gymProfit.toFixed(2)} <span className="text-xs">BGN</span></p>
            </div>
            <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-4 right-4 opacity-10"><Wallet size={48} className="text-yellow-500" /></div>
               <p className="text-[10px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Awaiting Settlement</p>
               <p className="text-4xl font-black italic text-yellow-500">{awaitingPaymentList.length}</p>
            </div>
         </div>
      )}

      {activeTab === 'finance' && (
         <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center"><Wallet size={24} /></div>
                <div><h3 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none">Awaiting Settlement</h3><p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic mt-1">Confirmed Coach Sessions Pending Payment</p></div>
            </div>
            
            <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden">
               <table className="w-full">
                  <thead className="bg-dark/30 text-[9px] font-black uppercase text-slate-500">
                     <tr>
                        <th className="px-8 py-5">Date & Time</th>
                        <th className="px-8 py-5">Coach Professional</th>
                        <th className="px-8 py-5">Member</th>
                        <th className="px-8 py-5 text-right">Fee</th>
                        <th className="px-8 py-5 text-right">Settlement</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {awaitingPaymentList.length === 0 ? <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold italic">No pending settlements in the queue.</td></tr> : awaitingPaymentList.map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                           <td className="px-8 py-6 text-white font-bold">{b.date} <span className="text-[10px] text-slate-500 ml-2">{b.time}</span></td>
                           <td className="px-8 py-6 font-black uppercase italic text-white">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                           <td className="px-8 py-6 text-slate-400">{b.customerName}</td>
                           <td className="px-8 py-6 text-right font-black text-brand">{b.price.toFixed(2)}</td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => setPendingSettlement(b.id)} className="px-4 py-2 bg-brand text-dark rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-brand/10 flex items-center gap-2"><Check size={14} /> Confirm Payment</button>
                                 <button onClick={() => handleCancelBooking(b.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Ban size={16} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="pt-12">
               <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center"><History size={24} /></div>
                   <div><h3 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none">Settlement History</h3><p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic mt-1">Archived Successful Transactions</p></div>
               </div>
               <div className="bg-surface/50 rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <table className="w-full">
                     <thead className="bg-dark/20 text-[9px] font-black uppercase text-slate-500">
                        <tr><th className="px-8 py-4">Date</th><th className="px-8 py-4">Coach</th><th className="px-8 py-4 text-right">Fee</th><th className="px-8 py-4 text-right">Action</th></tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {completedBookings.length === 0 ? <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-500 text-xs italic">No settled history yet.</td></tr> : completedBookings.map(b => (
                           <tr key={b.id} className="text-slate-400 text-xs hover:bg-white/5 transition-all">
                              <td className="px-8 py-4">{b.date}</td>
                              <td className="px-8 py-4 font-bold">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                              <td className="px-8 py-4 text-right text-white font-black">{b.price.toFixed(2)} BGN</td>
                              <td className="px-8 py-4 text-right">
                                 <button onClick={() => setViewingDossier(b)} className="px-3 py-1.5 bg-white/5 hover:bg-brand hover:text-dark text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/5 flex items-center justify-center gap-1.5 ml-auto">
                                    <Eye size={12} /> Details
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}

      {/* Payment Selection Overlay */}
      {pendingSettlement && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-surface border border-white/10 rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative text-center">
               <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
               <div className="w-20 h-20 bg-brand/10 text-brand rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand/5">
                  <DollarSign size={32} />
               </div>
               <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter mb-2">Finalize Settlement</h2>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic mb-10">Select customer's payment method</p>
               
               <div className="grid grid-cols-2 gap-4">
                  <button 
                     onClick={() => handleExecuteSettlement('cash')}
                     className="flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-brand hover:bg-brand/5 transition-all group"
                  >
                     <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-dark transition-all">
                        <Banknote size={24} />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">Cash Payment</span>
                  </button>
                  <button 
                     onClick={() => handleExecuteSettlement('card')}
                     className="flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-brand hover:bg-brand/5 transition-all group"
                  >
                     <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-dark transition-all">
                        <CreditCard size={24} />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">Card Payment</span>
                  </button>
               </div>
               
               <button onClick={() => setPendingSettlement(null)} className="mt-10 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-all">Cancel Process</button>
            </div>
         </div>
      )}

      <TransactionDossier 
         booking={viewingDossier} 
         onClose={() => setViewingDossier(null)} 
         users={users} 
      />
    </div>
  );
};

export default AdminPanel;
