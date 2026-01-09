
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, X, Loader2, TrendingUp, Wallet, Check, Ban, Calendar, User, Phone, ShieldCheck, Key, Settings2, ChevronDown, ChevronUp, Info, Edit3, Save, Languages, ExternalLink, ThumbsUp, Activity, BarChart3, DollarSign, ArrowRight, Banknote, CreditCard, Clock, Eye } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { User as UserType, Booking, Review } from '../types';
import RoleManagementModal from '../components/RoleManagementModal';

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
                   <p className="text-sm font-black text-white">{booking.time}</p>
                </div>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">{t.price}</label>
                   <p className="text-xl font-black text-brand italic">{booking.price.toFixed(2)} €</p>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">Method</label>
                   <p className="text-sm font-black uppercase text-white">{booking.paymentMethod || 'Unsettled'}</p>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">Status</label>
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
             Close Console
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
  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const pendingApps = users.filter(u => u.roles?.includes('trainer_pending'));
  const pendingReviews = reviews.filter(r => !r.isPublished);
  const trainingsToday = bookings.filter(b => b.date === todayStr);

  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  // Aggregate Stats
  const stats = useMemo(() => {
    const totalSessions = bookings.length;
    const completedSessions = bookings.filter(b => b.status === 'completed');
    const totalRevenue = completedSessions.reduce((acc, b) => acc + b.price, 0);
    
    // Calculate Gym Earnings
    const gymNetProfit = completedSessions.reduce((acc, b) => {
      if (b.commissionAmount !== undefined) return acc + b.commissionAmount;
      const rate = users.find(u => u.id === b.trainerId)?.commissionRate || 25;
      return acc + (b.price * (rate / 100));
    }, 0);

    return { 
      totalSessions, 
      completedSessions: completedSessions.length, 
      totalRevenue, 
      gymNetProfit,
      trainingsTodayCount: trainingsToday.length
    };
  }, [bookings, users, trainingsToday]);

  const handleVerifyPayment = async (booking: Booking, method: 'cash' | 'card' | 'decline') => {
    if (method === 'decline') {
      confirmAction({
        title: 'Reject Payment Record',
        message: 'This will move the session back to confirmed status without verifying payment.',
        onConfirm: async () => {
          await updateBooking(booking.id, { status: 'confirmed' });
          setVerifyingId(null);
        }
      });
      return;
    }

    const trainer = users.find(u => u.id === booking.trainerId);
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
  };

  if (!isAdmin) return <div className="p-20 text-center text-white">{t.accessDenied}</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 animate-in fade-in duration-500 text-left">
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
           <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 bg-brand text-dark rounded-[1.5rem] shadow-xl">
                   <p className="text-[9px] font-black uppercase mb-1 opacity-60">{t.gymNetProfit}</p>
                   <p className="text-3xl font-black italic tracking-tighter">{stats.gymNetProfit.toFixed(0)} €</p>
                </div>
                <div className="p-6 bg-surface border border-white/5 rounded-[1.5rem]">
                   <p className="text-[9px] font-black uppercase mb-1 text-slate-500">{t.grossIntake}</p>
                   <p className="text-3xl font-black italic text-white tracking-tighter">{stats.totalRevenue.toFixed(0)} €</p>
                </div>
                <div className="p-6 bg-surface border border-white/5 rounded-[1.5rem]">
                   <p className="text-[9px] font-black uppercase mb-1 text-slate-500">{t.trainingsToday}</p>
                   <p className="text-3xl font-black italic text-brand tracking-tighter">{stats.trainingsTodayCount}</p>
                </div>
                <div className="p-6 bg-surface border border-white/5 rounded-[1.5rem]">
                   <p className="text-[9px] font-black uppercase mb-1 text-slate-500">{t.activeRegistry}</p>
                   <p className="text-3xl font-black italic text-white tracking-tighter">{users.length}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GYM EARNINGS LEDGER */}
                <div className="lg:col-span-2 bg-surface rounded-[2.5rem] border border-white/5 p-8">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-3 italic">
                      <DollarSign size={16} className="text-brand"/> {t.profitLedger}
                   </h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px]">
                         <thead>
                            <tr className="text-slate-600 uppercase border-b border-white/5 font-black tracking-widest">
                               <th className="pb-4">{t.date}</th>
                               <th className="pb-4">{t.coach}</th>
                               <th className="pb-4">{t.price}</th>
                               <th className="pb-4 text-brand">{t.gymCut}</th>
                               <th className="pb-4">{t.trainerCut}</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                            {bookings.filter(b => b.status === 'completed').slice(0, 10).map(b => {
                               const trainer = users.find(u => u.id === b.trainerId);
                               const rate = trainer?.commissionRate || 25;
                               const gymCut = b.commissionAmount !== undefined ? b.commissionAmount : (b.price * (rate / 100));
                               const trainerCut = b.trainerEarnings !== undefined ? b.trainerEarnings : (b.price - gymCut);
                               return (
                                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                     <td className="py-4 font-bold text-slate-400">{b.date}</td>
                                     <td className="py-4 font-black uppercase italic text-white">{cleanName(trainer?.name)}</td>
                                     <td className="py-4 font-bold text-slate-400">{b.price.toFixed(2)} €</td>
                                     <td className="py-4 font-black text-brand italic">+{gymCut.toFixed(2)} €</td>
                                     <td className="py-4 font-bold text-slate-400">{trainerCut.toFixed(2)} €</td>
                                  </tr>
                               );
                            })}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* TRAININGS TODAY */}
                <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8 flex flex-col">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-3 italic">
                      <Clock size={16} className="text-brand"/> {t.trainingsToday}
                   </h3>
                   <div className="space-y-3 flex-grow overflow-y-auto max-h-[300px] custom-scrollbar">
                      {trainingsToday.length === 0 ? (
                         <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t.nothingScheduled}</p>
                         </div>
                      ) : trainingsToday.map(b => (
                         <div key={b.id} className="p-4 bg-dark/40 rounded-xl border border-white/5">
                            <p className="text-[10px] font-black uppercase text-white italic">{b.customerName}</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{b.time} with {cleanName(users.find(u => u.id === b.trainerId)?.name)}</p>
                         </div>
                      ))}
                   </div>
                   <button onClick={() => setActiveTab('bookings')} className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-brand flex items-center justify-center gap-2 italic transition-all group">
                      {t.viewFullRegistry} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
           </div>
        )}

        {activeTab === 'finance' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-dark/20">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic flex items-center gap-3">
                    <DollarSign size={18} className="text-brand"/> {t.finVerifyQueue}
                 </h3>
                 <span className="bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full">{awaitingPaymentList.length} {t.awaiting}</span>
              </div>
              <table className="w-full text-left">
                 <thead className="bg-dark/10 text-[9px] font-black uppercase text-slate-500">
                    <tr><th className="p-5">{t.date}</th><th className="p-5">{t.client}</th><th className="p-5">{t.coach}</th><th className="p-5">Amount</th><th className="p-5">Status</th><th className="p-5 text-center">Action</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-[10px]">
                    {bookings.filter(b => b.status === 'trainer_completed' || b.status === 'completed').sort((a,b) => b.date.localeCompare(a.date)).map(b => (
                       <tr key={b.id} className={`hover:bg-white/5 transition-colors ${b.status === 'trainer_completed' ? 'bg-brand/5' : ''}`}>
                          <td className="p-5 font-bold text-slate-400 italic">{b.date} @ {b.time}</td>
                          <td className="p-5 uppercase italic text-white font-black">{b.customerName}</td>
                          <td className="p-5 uppercase font-bold text-slate-400">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                          <td className="p-5 font-black text-brand text-sm italic">{b.price.toFixed(2)} €</td>
                          <td className="p-5 uppercase font-black tracking-widest italic">
                             <span className={b.status === 'completed' ? 'text-brand' : 'text-yellow-500'}>{b.status.replace('_', ' ')}</span>
                          </td>
                          <td className="p-5">
                             <div className="flex justify-center items-center gap-2 min-w-[220px]">
                                {b.status === 'trainer_completed' && (
                                   verifyingId === b.id ? (
                                      <div className="flex gap-2 animate-in slide-in-from-right-2">
                                         <button 
                                            onClick={() => handleVerifyPayment(b, 'cash')} 
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-green-500 transition-all shadow-lg italic"
                                         >
                                            <Banknote size={12} /> {t.payCash}
                                         </button>
                                         <button 
                                            onClick={() => handleVerifyPayment(b, 'card')} 
                                            className="px-4 py-2 bg-brand text-dark rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-white transition-all shadow-lg italic"
                                         >
                                            <CreditCard size={12} /> {t.payCard}
                                         </button>
                                         <button 
                                            onClick={() => handleVerifyPayment(b, 'decline')} 
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-red-500 transition-all shadow-lg italic"
                                            title={t.decline}
                                         >
                                            <X size={12} /> {t.decline}
                                         </button>
                                      </div>
                                   ) : (
                                      <button 
                                         onClick={() => setVerifyingId(b.id)} 
                                         className="px-6 py-2.5 bg-brand text-dark rounded-xl text-[9px] font-black uppercase tracking-widest italic shadow-xl hover:scale-105 transition-all"
                                      >
                                         {t.verifyPay}
                                      </button>
                                   )
                                )}
                                {b.status === 'completed' && (
                                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase italic">
                                      <Check size={12} className="text-brand"/> {t.verifiedBy} {b.settledBy || 'System'}
                                   </div>
                                )}
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {activeTab === 'bookings' && (
           <div className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-dark/20 text-[9px] font-black uppercase text-slate-500">
                    <tr><th className="p-5">{t.client}</th><th className="p-5">{t.date}</th><th className="p-5">Time</th><th className="p-5">Status</th><th className="p-5">Manage</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-[10px] italic">
                    {bookings.sort((a,b) => b.date.localeCompare(a.date)).map(b => (
                       <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-black uppercase">{b.customerName}</td>
                          <td className="p-5 text-slate-400">{b.date}</td>
                          <td className="p-5 text-slate-400">{b.time}</td>
                          <td className="p-5">
                             <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${b.status === 'completed' ? 'text-brand' : 'text-slate-500'}`}>{b.status}</span>
                          </td>
                          <td className="p-5">
                             <div className="flex items-center gap-3">
                                <button onClick={() => setDetailedBooking(b)} className="p-2 text-slate-400 hover:text-brand transition-colors"><Eye size={12}/></button>
                                <button onClick={() => confirmAction({ title: 'Delete Booking', message: t.permanentRemoval, onConfirm: () => deleteBooking(b.id) })} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
           <div className="grid grid-cols-1 gap-4">
              {pendingApps.length === 0 ? <p className="text-center py-20 text-slate-500 uppercase font-black text-[10px]">No pending recruitments.</p> : pendingApps.map(u => (
                 <div key={u.id} className="p-6 bg-surface rounded-[1.5rem] border border-white/5 flex justify-between items-center">
                    <div>
                       <h3 className="text-lg font-black uppercase italic text-white mb-1">{cleanName(u.name)}</h3>
                       <p className="text-[8px] text-brand font-black uppercase mb-4">Awaiting Promotion</p>
                       <p className="text-xs text-slate-500 max-w-md italic">{u.bio || 'No details provided.'}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => updateUser(u.id, { roles: ['user', 'trainer'] })} className="px-5 py-3 bg-brand text-dark rounded-xl text-[9px] font-black uppercase shadow-lg">Approve</button>
                       <button onClick={() => confirmAction({ title: 'Reject Application', message: 'Clear recruiter info?', onConfirm: () => deleteUser(u.id) })} className="px-5 py-3 bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase border border-white/10">Reject</button>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {/* USERS REGISTRY TAB */}
        {activeTab === 'users' && (
           <div className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-dark/20 text-[9px] font-black uppercase text-slate-500">
                    <tr><th className="p-5">User</th><th className="p-5">Email</th><th className="p-5">Roles</th><th className="p-5">Joined</th><th className="p-5">Actions</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-[10px] italic">
                    {users.map(u => (
                       <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-black uppercase">{cleanName(u.name)}</td>
                          <td className="p-5 text-slate-400">{u.email}</td>
                          <td className="p-5 flex gap-1">
                             {u.roles.map(r => <span key={r} className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] font-black uppercase">{r}</span>)}
                          </td>
                          <td className="p-5 text-slate-500">{u.joinedDate.split('T')[0]}</td>
                          <td className="p-5 flex gap-2">
                             <button onClick={() => setUserForRoles(u)} className="p-2 bg-white/5 rounded-lg text-brand hover:bg-brand hover:text-dark transition-all"><Settings2 size={12}/></button>
                             <button onClick={() => confirmAction({ title: 'Delete User', message: 'Delete account permanently?', onConfirm: () => deleteUser(u.id) })} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={12}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {/* REVIEWS MODERATION TAB */}
        {activeTab === 'reviews' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReviews.length === 0 ? <p className="text-center col-span-2 py-20 text-slate-500 italic uppercase font-black text-[9px]">{t.noReviews}</p> : pendingReviews.map(r => (
                 <div key={r.id} className="p-6 bg-surface rounded-2xl border border-white/10 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-black uppercase italic text-white text-xs">{r.author}</h4>
                       <div className="flex text-brand">
                          {[...Array(r.rating)].map((_, i) => <Star key={i} size={8} fill="currentColor"/>)}
                       </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 italic">"{r.text}"</p>
                    <div className="flex gap-2">
                       <button onClick={() => updateReview(r.id, { isPublished: true })} className="flex-1 py-2 bg-brand text-dark rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2"><ThumbsUp size={10}/> Approve</button>
                       <button onClick={() => deleteReview(r.id)} className="flex-1 py-2 bg-white/5 text-red-500 rounded-lg text-[9px] font-black uppercase border border-red-500/10 hover:bg-red-500 hover:text-white transition-all">Delete</button>
                    </div>
                 </div>
              ))}
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
            trainerName={cleanName(users.find(u => u.id === detailedBooking.trainerId)?.name || 'Coach')} 
            onClose={() => setDetailedBooking(null)} 
            t={t}
         />
      )}
    </div>
  );
};

export default AdminPanel;
