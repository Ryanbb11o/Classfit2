
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, X, Loader2, TrendingUp, Wallet, Check, Ban, Calendar, User, Phone, ShieldCheck, Key, Settings2, ChevronDown, ChevronUp, Info, Edit3, Save, Languages, ExternalLink, ThumbsUp, Activity, BarChart3, DollarSign, ArrowRight, Banknote, CreditCard, Clock, Eye } from 'lucide-react';
import { useAppContext } from '../AppContext';
// Import DEFAULT_PROFILE_IMAGE to fix the reference error in the user list
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { User as UserType, Booking, Review } from '../types';
import RoleManagementModal from '../components/RoleManagementModal';

// Helper to calculate end time for range display
const formatTimeRange = (startTime: string, durationMins: number = 60) => {
  if (!startTime) return '';
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  const endDate = new Date(date.getTime() + durationMins * 60000);
  const endHours = String(endDate.getHours()).padStart(2, '0');
  const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
  return `${startTime} -> ${endHours}:${endMinutes}`;
};

const SessionDetailsModal: React.FC<{ booking: Booking; trainerName: string; onClose: () => void; t: any }> = ({ booking, trainerName, onClose, t }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-dark/98 backdrop-blur-md animate-in fade-in duration-300 text-left">
       <div className="bg-surface rounded-[2.5rem] border border-white/10 p-10 w-full max-w-xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
          <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20} /></button>
          
          <div className="mb-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-lg text-[10px] font-black uppercase tracking-widest italic mb-4">
                <ShieldCheck size={14} /> {t.sessionDetails}
             </div>
             <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">{booking.customerName}</h2>
             <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-2">PIN: {booking.checkInCode}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
             <div className="space-y-6">
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">{t.coach}</label>
                   <p className="text-sm font-black uppercase italic text-white">{trainerName}</p>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">{t.date}</label>
                   <p className="text-sm font-black text-white">{booking.date}</p>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">Time</label>
                   <p className="text-sm font-black text-white">{formatTimeRange(booking.time, booking.duration)}</p>
                </div>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">{t.price}</label>
                   <p className="text-xl font-black text-brand italic">{booking.price.toFixed(2)} €</p>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">{t.method}</label>
                   <p className="text-sm font-black uppercase text-white">{booking.paymentMethod || 'Unsettled'}</p>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">{t.status}</label>
                   <span className="px-2 py-1 bg-brand/10 text-brand rounded text-[9px] font-black uppercase italic">{booking.status}</span>
                </div>
             </div>
          </div>

          {booking.status === 'completed' && (
             <div className="bg-dark/40 p-6 rounded-2xl border border-white/5 grid grid-cols-2 gap-6 mb-8">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.gymCut}</p>
                   <p className="text-lg font-black text-brand italic">+{booking.commissionAmount?.toFixed(2)} €</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.trainerCut}</p>
                   <p className="text-lg font-black text-white italic">{booking.trainerEarnings?.toFixed(2)} €</p>
                </div>
             </div>
          )}

          <button onClick={onClose} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[11px] italic transition-all border border-white/10">
             {t.closeConsole}
          </button>
       </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { language, bookings, refreshData, updateBooking, updateUser, deleteUser, isAdmin, isManagement, users, reviews, deleteReview, updateReview, confirmAction, deleteBooking, currentUser } = useAppContext();
  const location = useLocation();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'bookings' | 'trainers' | 'applications' | 'users' | 'roles' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userForRoles, setUserForRoles] = useState<UserType | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [detailedBooking, setDetailedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab as any);
  }, [location.state]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const awaitingPaymentList = (bookings || []).filter(b => b.status === 'trainer_completed');
  const pendingApps = (users || []).filter(u => u.roles?.includes('trainer_pending'));
  const pendingReviews = (reviews || []).filter(r => !r.isPublished);
  
  const upcomingTrainings = (bookings || []).filter(b => b.date >= todayStr && b.status !== 'completed' && b.status !== 'cancelled').slice(0, 5);
  const completedTrainings = (bookings || []).filter(b => b.status === 'completed').sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);

  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  // Aggregate Stats
  const stats = useMemo(() => {
    const bks = bookings || [];
    const totalSessions = bks.length;
    const completedSessions = bks.filter(b => b.status === 'completed');
    const totalRevenue = completedSessions.reduce((acc, b) => acc + b.price, 0);
    
    const gymNetProfit = completedSessions.reduce((acc, b) => {
      if (b.commissionAmount !== undefined) return acc + b.commissionAmount;
      const rate = users.find(u => String(u.id) === String(b.trainerId))?.commissionRate || 25;
      return acc + (b.price * (rate / 100));
    }, 0);

    return { 
      totalSessions, 
      completedSessions: completedSessions.length, 
      totalRevenue, 
      gymNetProfit,
      trainingsTodayCount: bks.filter(b => b.date === todayStr).length
    };
  }, [bookings, users, todayStr]);

  const handleVerifyPayment = async (booking: Booking, method: 'cash' | 'card' | 'decline') => {
    if (method === 'decline') {
      confirmAction({
        title: t.decline,
        message: 'This will move the session back to confirmed status without settlement.',
        onConfirm: async () => {
          await updateBooking(booking.id, { status: 'confirmed' });
          setVerifyingId(null);
          refreshData();
        }
      });
      return;
    }

    const trainer = users.find(u => String(u.id) === String(booking.trainerId));
    const rate = trainer?.commissionRate || 25;
    const gymCut = booking.price * (rate / 100);
    const trainerCut = booking.price - gymCut;

    await updateBooking(booking.id, { 
      status: 'completed', 
      paymentMethod: method,
      commissionAmount: gymCut,
      trainerEarnings: trainerCut,
      settledAt: new Date().toISOString(),
      settledBy: currentUser?.name || 'Admin'
    });
    setVerifyingId(null);
    refreshData();
  };

  if (!isAdmin) return <div className="p-20 text-center text-white">{t.accessDenied}</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 animate-in fade-in duration-500 text-left">
      
      {/* TOP METRICS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <button 
            onClick={() => setActiveTab('finance')}
            className="p-8 bg-brand text-dark rounded-[2rem] shadow-xl hover:shadow-[0_0_40px_rgba(197,217,45,0.7)] transition-all group relative overflow-hidden active:scale-[0.98]"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><TrendingUp size={60}/></div>
             <p className="text-[10px] font-black uppercase mb-2 opacity-70 tracking-widest italic">{t.gymNetProfit}</p>
             <p className="text-4xl font-black italic tracking-tighter">{stats.gymNetProfit.toFixed(2)} €</p>
             <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-60">
                {t.viewMore} <ArrowRight size={10} />
             </div>
          </button>

          <button 
            onClick={() => setActiveTab('finance')}
            className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/40 hover:shadow-[0_0_30px_rgba(197,217,45,0.3)] transition-all group relative overflow-hidden active:scale-[0.98]"
          >
             <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest italic">{t.grossIntake}</p>
             <p className="text-4xl font-black italic text-white tracking-tighter">{stats.totalRevenue.toFixed(2)} €</p>
             <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand opacity-0 group-hover:opacity-100 transition-all">
                {t.viewMore} <ArrowRight size={10} />
             </div>
          </button>

          <button 
            onClick={() => setActiveTab('bookings')}
            className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/40 hover:shadow-[0_0_30px_rgba(197,217,45,0.3)] transition-all group relative overflow-hidden active:scale-[0.98]"
          >
             <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest italic">{t.trainingsToday}</p>
             <p className="text-4xl font-black italic text-brand tracking-tighter">{stats.trainingsTodayCount}</p>
             <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand opacity-0 group-hover:opacity-100 transition-all">
                {t.viewMore} <ArrowRight size={10} />
             </div>
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/40 hover:shadow-[0_0_30px_rgba(197,217,45,0.3)] transition-all group relative overflow-hidden active:scale-[0.98]"
          >
             <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest italic">{t.activeRegistry}</p>
             <p className="text-4xl font-black italic text-white tracking-tighter">{(users || []).length}</p>
             <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand opacity-0 group-hover:opacity-100 transition-all">
                {t.viewMore} <ArrowRight size={10} />
             </div>
          </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">{t.mgmtConsole}</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-xl bg-white/5 ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}><RefreshCw size={18} /></button>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[9px] mt-2 italic">{t.officialControl}</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: BarChart3, label: t.stats },
              { id: 'finance', icon: FileSpreadsheet, label: t.finance, badge: awaitingPaymentList.length },
              { id: 'bookings', icon: ListFilter, label: t.sessions },
              { id: 'applications', icon: UserCheck, label: t.recruits, badge: pendingApps.length },
              { id: 'users', icon: Users, label: t.registry },
              { id: 'reviews', icon: Star, label: t.moderation, badge: pendingReviews.length }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <tab.icon size={11} /> {tab.label}
                    {tab.badge ? <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-red-500 text-white">{tab.badge}</span> : null}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && (
           <div className="space-y-8 animate-in fade-in duration-500">
             {/* TRAINING LEDGER */}
             <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-3 italic">
                      <ListFilter size={16} className="text-brand" /> {t.trainingLedger}
                   </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase text-brand/60 tracking-widest mb-2 italic border-b border-white/5 pb-2">{t.upcoming}</p>
                      {upcomingTrainings.length === 0 ? <p className="text-[9px] text-slate-600 italic">{t.nothingScheduled}</p> : upcomingTrainings.map(b => (
                         <div key={b.id} className="flex items-center justify-between p-3 bg-dark/40 rounded-xl border border-white/5">
                            <div>
                               <p className="text-[10px] font-black uppercase text-white italic">{b.customerName}</p>
                               <p className="text-[8px] font-bold text-slate-500 uppercase">{b.date} @ {formatTimeRange(b.time, b.duration)}</p>
                            </div>
                            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{b.checkInCode}</span>
                         </div>
                      ))}
                   </div>
                   <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-2 italic border-b border-white/5 pb-2">{t.past}</p>
                      {completedTrainings.length === 0 ? <p className="text-[9px] text-slate-600 italic">{t.noVerifiedProfits}</p> : completedTrainings.map(b => {
                         const trainer = users.find(u => String(u.id) === String(b.trainerId));
                         const rate = trainer?.commissionRate || 25;
                         const gymProfit = b.commissionAmount !== undefined ? b.commissionAmount : (b.price * (rate / 100));
                         return (
                            <div key={b.id} className="flex items-center justify-between p-3 bg-dark/20 rounded-xl border border-white/5 hover:bg-brand/5 transition-all group cursor-default">
                               <div>
                                  <p className="text-[10px] font-black uppercase text-slate-400 italic group-hover:text-white">{b.customerName}</p>
                                  <p className="text-[8px] font-bold text-slate-600 uppercase">{b.date}</p>
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black text-brand italic">+{gymProfit.toFixed(2)} €</span>
                                  <Check size={10} className="text-brand" />
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             </div>
           </div>
        )}

        {/* REGISTRY TAB - FIXED & RE-IMPLEMENTED */}
        {activeTab === 'users' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden animate-in fade-in duration-500 shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-dark/20 flex items-center justify-between">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic flex items-center gap-3">
                    <Users size={18} className="text-brand"/> Membership Registry
                 </h3>
                 <span className="text-[9px] font-black uppercase text-slate-500 bg-white/5 px-3 py-1 rounded-full">{(users || []).length} Recorded Subjects</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                   <thead className="bg-dark/10 text-[9px] font-black uppercase text-slate-500 sticky top-0 z-10 backdrop-blur-sm">
                      <tr>
                         <th className="p-5">{t.client}</th>
                         <th className="p-5">{t.email}</th>
                         <th className="p-5">{t.roles}</th>
                         <th className="p-5">Joined</th>
                         <th className="p-5 text-right">Protocol</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-[10px] italic font-medium">
                      {(users || []).length === 0 ? (
                        <tr>
                           <td colSpan={5} className="p-20 text-center text-slate-600 uppercase font-black italic tracking-widest">No subjects found in database.</td>
                        </tr>
                      ) : users.map(u => (
                         <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-5">
                               <div className="flex items-center gap-4">
                                  <img src={u.image || DEFAULT_PROFILE_IMAGE} className="w-8 h-8 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                                  <span className="font-black uppercase italic text-white group-hover:text-brand transition-colors">{cleanName(u.name)}</span>
                               </div>
                            </td>
                            <td className="p-5 text-slate-400 font-bold">{u.email}</td>
                            <td className="p-5">
                               <div className="flex flex-wrap gap-1">
                                  {(u.roles || []).map(r => (
                                     <span key={r} className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${r.includes('trainer') ? 'bg-brand/10 text-brand' : 'bg-white/5 text-slate-500'}`}>
                                        {r.replace('_', ' ')}
                                     </span>
                                  ))}
                               </div>
                            </td>
                            <td className="p-5 text-slate-500 font-bold">{(u.joinedDate || '').split('T')[0]}</td>
                            <td className="p-5">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => setUserForRoles(u)} className="p-2 bg-white/5 rounded-lg text-brand hover:bg-brand hover:text-dark transition-all" title="Manage Protocol"><Settings2 size={12}/></button>
                                  <button onClick={() => confirmAction({ title: t.deleteMsg, message: 'Initiate permanent termination of this subject?', onConfirm: () => deleteUser(u.id) })} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
        )}

        {/* MODERATION TAB - FIXED REVIEW BODY DISPLAY */}
        {activeTab === 'reviews' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
              {pendingReviews.length === 0 ? <p className="text-center col-span-2 py-20 text-slate-500 italic uppercase font-black text-[9px]">{t.noReviews}</p> : pendingReviews.map(r => (
                 <div key={r.id} className="p-6 bg-surface rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand/40"></div>
                    <div className="flex justify-between items-center mb-4">
                       <div>
                          <h4 className="font-black uppercase italic text-white text-xs">{r.author || 'Anonymous'}</h4>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">{cleanName(users.find(u => u.id === r.trainerId)?.name) || 'Coach'}</p>
                       </div>
                       <div className="flex text-brand">
                          {[...Array(Number(r.rating || 5))].map((_, i) => <Star key={i} size={8} fill="currentColor"/>)}
                       </div>
                    </div>
                    <div className="bg-dark/40 p-4 rounded-xl border border-white/5 mb-6 shadow-inner">
                       <p className="text-xs text-slate-300 italic font-medium leading-relaxed">
                          "{r.text || "No feedback body provided."}"
                       </p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => updateReview(r.id, { isPublished: true })} className="flex-1 py-2 bg-brand text-dark rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg italic"><ThumbsUp size={10}/> Approve</button>
                       <button onClick={() => deleteReview(r.id)} className="flex-1 py-2 bg-white/5 text-red-500 rounded-lg text-[9px] font-black uppercase border border-red-500/10 hover:bg-red-500 hover:text-white transition-all italic">Delete</button>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-dark/20">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic flex items-center gap-3">
                    <DollarSign size={18} className="text-brand"/> {t.finVerifyQueue}
                 </h3>
                 <span className="bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full">{awaitingPaymentList.length} {t.awaiting}</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-dark/10 text-[9px] font-black uppercase text-slate-500 sticky top-0 z-10 backdrop-blur-sm">
                      <tr><th className="p-4">{t.date}</th><th className="p-4">{t.client}</th><th className="p-4">{t.coach}</th><th className="p-4">{t.price}</th><th className="p-4">{t.status}</th><th className="p-4 text-center">{t.verifyPay}</th></tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-[10px] italic">
                      {bookings.filter(b => b.status === 'trainer_completed' || b.status === 'completed').sort((a,b) => b.date.localeCompare(a.date)).map(b => (
                         <tr key={b.id} className={`hover:bg-white/5 transition-colors ${b.status === 'trainer_completed' ? 'bg-brand/5' : ''}`}>
                            <td className="p-4 font-bold text-slate-400">{b.date} @ {formatTimeRange(b.time, b.duration)}</td>
                            <td className="p-4 uppercase italic text-white font-black">{b.customerName}</td>
                            <td className="p-4 uppercase font-bold text-slate-400">{cleanName(users.find(u => String(u.id) === String(b.trainerId))?.name)}</td>
                            <td className="p-4 font-black text-brand text-sm italic">{b.price.toFixed(2)} €</td>
                            <td className="p-4 uppercase font-black tracking-widest italic">
                               <span className={b.status === 'completed' ? 'text-brand' : 'text-yellow-500'}>{b.status.replace('_', ' ')}</span>
                            </td>
                            <td className="p-4">
                               <div className="flex justify-center items-center gap-2 min-w-[220px]">
                                  {b.status === 'trainer_completed' && (
                                     verifyingId === b.id ? (
                                        <div className="flex gap-2 animate-in slide-in-from-right-2">
                                           <button onClick={() => handleVerifyPayment(b, 'cash')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-green-500 transition-all shadow-lg italic"><Banknote size={12} /> {t.payCash}</button>
                                           <button onClick={() => handleVerifyPayment(b, 'card')} className="px-4 py-2 bg-brand text-dark rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-white transition-all shadow-lg italic"><CreditCard size={12} /> {t.payCard}</button>
                                           <button onClick={() => setVerifyingId(null)} className="px-4 py-2 bg-white/10 text-slate-400 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-lg italic"><X size={12} /></button>
                                        </div>
                                     ) : (
                                        <button onClick={() => setVerifyingId(b.id)} className="px-6 py-2.5 bg-brand text-dark rounded-xl text-[9px] font-black uppercase tracking-widest italic shadow-xl hover:scale-105 transition-all">{t.verifyPay}</button>
                                     )
                                  )}
                                  {b.status === 'completed' && (
                                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase italic">
                                        <Check size={12} className="text-brand"/> {t.verifiedBy} {b.settledBy || t.system}
                                     </div>
                                  )}
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
        )}
      </div>

      {userForRoles && (
         <RoleManagementModal 
            user={userForRoles} 
            onClose={() => setUserForRoles(null)} 
            onUpdate={async (uid, updates) => await updateUser(uid, updates)} 
            language={language} 
            isManagement={isManagement} 
         />
      )}

      {detailedBooking && (
         <SessionDetailsModal 
            booking={detailedBooking} 
            trainerName={cleanName(users.find(u => String(u.id) === String(detailedBooking.trainerId))?.name || 'Coach')} 
            onClose={() => setDetailedBooking(null)} 
            t={t}
         />
      )}
    </div>
  );
};

export default AdminPanel;
