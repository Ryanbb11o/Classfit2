
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, MessageSquare, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, Eye, X, Save, Loader2, TrendingUp, Wallet, Check, Ban, DollarSign, PieChart } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { User as UserType, Booking } from '../types';

const AdminPanel: React.FC = () => {
  const { language, bookings, reviews, updateReview, deleteReview, updateBooking, deleteBooking, isAdmin, users, deleteUser, updateUser, currentUser, refreshData, confirmAction } = useAppContext();
  const location = useLocation();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'trainers' | 'finance' | 'users' | 'applications' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  // Financial calculations
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const coachPayouts = completedBookings.reduce((sum, b) => sum + (Number(b.trainerEarnings) || 0), 0);
  const gymProfit = completedBookings.reduce((sum, b) => sum + (Number(b.commissionAmount) || 0), 0);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const handleConfirmPayment = (bookingId: string) => {
    confirmAction({
      title: 'Confirm Payment',
      message: 'Confirm that this session has been paid? This will calculate the coach split and mark it as completed.',
      onConfirm: async () => {
        await updateBooking(bookingId, { status: 'completed', paymentMethod: 'cash' });
      }
    });
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
                                 <button onClick={() => handleConfirmPayment(b.id)} className="px-4 py-2 bg-brand text-dark rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-brand/10 flex items-center gap-2"><Check size={14} /> Confirm Payment</button>
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
                        <tr><th className="px-8 py-4">Date</th><th className="px-8 py-4">Coach</th><th className="px-8 py-4 text-right">Fee</th><th className="px-8 py-4 text-right">Split (Gym / Coach)</th></tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {completedBookings.map(b => (
                           <tr key={b.id} className="text-slate-400 text-xs">
                              <td className="px-8 py-4">{b.date}</td>
                              <td className="px-8 py-4 font-bold">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                              <td className="px-8 py-4 text-right text-white font-black">{b.price.toFixed(2)}</td>
                              <td className="px-8 py-4 text-right"><span className="text-brand font-bold">{b.commissionAmount?.toFixed(2)}</span> / {b.trainerEarnings?.toFixed(2)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}

      {/* Rest of the tabs (trainers, users, etc.) would follow similar professional table patterns... */}
    </div>
  );
};

export default AdminPanel;
