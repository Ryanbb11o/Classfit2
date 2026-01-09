
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ListFilter, Briefcase, UserCheck, FileSpreadsheet, 
  Users, RefreshCw, Star, Trash2, X, Loader2, TrendingUp, Wallet, Check, 
  Ban, Calendar, User, Phone, ShieldCheck, Key, Settings2, ChevronDown, 
  ChevronUp, Info, Edit3, Save, Languages, ExternalLink, ThumbsUp, 
  Activity, BarChart3, DollarSign, ArrowRight, Banknote, CreditCard, 
  Clock, Eye, Target, Zap
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { User as UserType, Booking, Review, UserRole } from '../types';
import RoleManagementModal from '../components/RoleManagementModal';

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

const AdminPanel: React.FC = () => {
  const { 
    language, bookings, refreshData, updateBooking, updateUser, 
    deleteUser, isAdmin, isManagement, users, reviews, deleteReview, 
    updateReview, confirmAction, deleteBooking, currentUser 
  } = useAppContext();
  
  const location = useLocation();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'bookings' | 'applications' | 'users' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userForRoles, setUserForRoles] = useState<UserType | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab as any);
    }
  }, [location.state]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const safeBookings = bookings || [];
  const safeUsers = users || [];
  const safeReviews = reviews || [];

  const awaitingPaymentList = safeBookings.filter(b => b.status === 'trainer_completed');
  const pendingApps = safeUsers.filter(u => (u.roles || []).includes('trainer_pending'));
  const pendingReviews = safeReviews.filter(r => !r.isPublished);
  
  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  const stats = useMemo(() => {
    const completedSessions = safeBookings.filter(b => b.status === 'completed');
    const totalRevenue = completedSessions.reduce((acc, b) => acc + b.price, 0);
    
    const gymNetProfit = completedSessions.reduce((acc, b) => {
      if (b.commissionAmount !== undefined && b.commissionAmount > 0) return acc + b.commissionAmount;
      const trainer = safeUsers.find(u => String(u.id) === String(b.trainerId));
      const rate = trainer?.commissionRate || 25;
      return acc + (b.price * (rate / 100));
    }, 0);

    return { 
      totalSessions: safeBookings.length, 
      completedSessions: completedSessions.length, 
      totalRevenue, 
      gymNetProfit,
      trainingsTodayCount: safeBookings.filter(b => b.date === todayStr).length
    };
  }, [safeBookings, safeUsers, todayStr]);

  const handleVerifyPayment = async (booking: Booking, method: 'cash' | 'card' | 'decline') => {
    if (method === 'decline') {
      await updateBooking(booking.id, { status: 'confirmed' });
      setVerifyingId(null);
      return;
    }

    setIsVerifying(true);
    const trainer = safeUsers.find(u => String(u.id) === String(booking.trainerId));
    const rate = trainer?.commissionRate || 25;
    const gymCut = Number(booking.price * (rate / 100));
    const trainerCut = Number(booking.price - gymCut);

    try {
        await updateBooking(booking.id, { 
          status: 'completed', 
          paymentMethod: method,
          commissionAmount: gymCut,
          trainerEarnings: trainerCut,
          settledAt: new Date().toISOString(),
          settledBy: currentUser?.name || 'Admin'
        });
        setVerifyingId(null);
    } catch (e) {
        console.error("Verification failed:", e);
        alert("Verification logic error. Check console.");
    } finally {
        setIsVerifying(false);
    }
  };

  const handleApproveApp = async (userId: string) => {
    const user = safeUsers.find(u => u.id === userId);
    if (!user) return;
    const currentRoles = user.roles || [];
    const newRoles = Array.from(new Set([...currentRoles.filter(r => r !== 'trainer_pending' as any), 'trainer' as UserRole]));
    await updateUser(userId, { roles: newRoles });
    refreshData();
  };

  if (!isAdmin) return <div className="p-20 text-center text-white">{t.accessDenied}</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 animate-in fade-in duration-500 text-left">
      
      {/* 1. HEADLINE AT THE TOP */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl md:text-5xl font-black uppercase italic text-white tracking-tighter leading-none">{t.mgmtConsole}</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-xl bg-white/5 ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}><RefreshCw size={22} /></button>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-3 italic">{t.officialControl}</p>
        </div>
        
        {/* TAB SWITCHER */}
        <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: BarChart3, label: t.stats },
              { id: 'finance', icon: FileSpreadsheet, label: t.finance, badge: awaitingPaymentList.length },
              { id: 'bookings', icon: ListFilter, label: t.sessions },
              { id: 'applications', icon: UserCheck, label: t.recruits, badge: pendingApps.length },
              { id: 'users', icon: Users, label: t.registry },
              { id: 'reviews', icon: Star, label: t.moderation, badge: pendingReviews.length }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <tab.icon size={11} /> {tab.label}
                    {tab.badge ? <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-red-500 text-white">{tab.badge}</span> : null}
                </button>
            ))}
        </div>
      </div>

      {/* 2. STATS CARDS BELOW HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <button onClick={() => setActiveTab('finance')} className="p-8 bg-brand text-dark rounded-[2rem] shadow-xl hover:shadow-[0_0_40px_rgba(197,217,45,0.7)] transition-all group relative overflow-hidden active:scale-[0.98]">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><TrendingUp size={60}/></div>
             <p className="text-[10px] font-black uppercase mb-2 opacity-70 tracking-widest italic">{t.gymNetProfit}</p>
             <p className="text-4xl font-black italic tracking-tighter">{stats.gymNetProfit.toFixed(2)} €</p>
             <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-60">{t.viewMore} <ArrowRight size={10} /></div>
          </button>
          <div className="p-8 bg-surface border border-white/5 rounded-[2rem]">
             <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest italic">{t.grossIntake}</p>
             <p className="text-4xl font-black italic text-white tracking-tighter">{stats.totalRevenue.toFixed(2)} €</p>
          </div>
          <div className="p-8 bg-surface border border-white/5 rounded-[2rem]">
             <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest italic">{t.trainingsToday}</p>
             <p className="text-4xl font-black italic text-brand tracking-tighter">{stats.trainingsTodayCount}</p>
          </div>
          <div className="p-8 bg-surface border border-white/5 rounded-[2rem]">
             <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest italic">{t.activeRegistry}</p>
             <p className="text-4xl font-black italic text-white tracking-tighter">{safeUsers.length}</p>
          </div>
      </div>

      <div className="space-y-8">
        {/* OVERVIEW TAB - ACTIVE SESSIONS FEED */}
        {activeTab === 'overview' && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl">
                <div className="p-8 border-b border-white/5 bg-dark/20 flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 italic">
                      <Target size={16} className="text-brand" /> Live Operation Feed
                   </h3>
                   <span className="text-[10px] font-black text-brand bg-brand/10 px-3 py-1 rounded-lg uppercase italic border border-brand/20">PROTOCOL ACTIVE</span>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-dark/40 text-[9px] font-black uppercase text-slate-500">
                         <tr><th className="p-5">Subject</th><th className="p-5">Time</th><th className="p-5">Coach</th><th className="p-5">Status</th><th className="p-5">Pin</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[10px] italic font-medium">
                         {safeBookings.filter(b => b.date === todayStr).length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-600 font-black uppercase tracking-widest italic">No active deployments found for today.</td></tr>
                         ) : safeBookings.filter(b => b.date === todayStr).map(b => (
                            <tr key={b.id} className="hover:bg-white/5 transition-colors">
                               <td className="p-5 font-black uppercase text-white">{b.customerName}</td>
                               <td className="p-5 font-bold text-slate-400">{b.time}</td>
                               <td className="p-5 uppercase font-bold text-slate-400">{cleanName(safeUsers.find(u => String(u.id) === String(b.trainerId))?.name)}</td>
                               <td className="p-5"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${b.status === 'completed' ? 'bg-brand/10 text-brand' : 'bg-yellow-500/10 text-yellow-500'}`}>{b.status}</span></td>
                               <td className="p-5 font-black tracking-widest text-brand">{b.checkInCode}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           </div>
        )}

        {/* FINANCE TAB - VERIFICATION LOGIC FIX */}
        {activeTab === 'finance' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-dark/20">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic flex items-center gap-3"><DollarSign size={18} className="text-brand"/> Settlement Protocol</h3>
                 <span className="bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full">{awaitingPaymentList.length} Awaiting Verification</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                   <thead className="bg-dark/10 text-[9px] font-black uppercase text-slate-500 sticky top-0 z-10 backdrop-blur-sm">
                      <tr><th className="p-4">Deployment</th><th className="p-4">Subject</th><th className="p-4">Officer</th><th className="p-4">Value</th><th className="p-4">Status</th><th className="p-4 text-center">Action</th></tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-[10px] italic">
                      {safeBookings.filter(b => b.status === 'trainer_completed' || b.status === 'completed').sort((a,b) => b.date.localeCompare(a.date)).map(b => (
                         <tr key={b.id} className={`hover:bg-white/5 transition-colors ${b.status === 'trainer_completed' ? 'bg-brand/5' : ''}`}>
                            <td className="p-4 font-bold text-slate-400">{b.date} @ {b.time}</td>
                            <td className="p-4 uppercase text-white font-black">{b.customerName}</td>
                            <td className="p-4 uppercase font-bold text-slate-400">{cleanName(safeUsers.find(u => String(u.id) === String(b.trainerId))?.name)}</td>
                            <td className="p-4 font-black text-brand text-sm">€{b.price.toFixed(2)}</td>
                            <td className="p-4 uppercase font-black text-[8px] tracking-widest"><span className={b.status === 'completed' ? 'text-brand' : 'text-yellow-500'}>{b.status.replace('_', ' ')}</span></td>
                            <td className="p-4">
                               <div className="flex justify-center items-center min-w-[200px]">
                               {b.status === 'trainer_completed' ? (
                                  verifyingId === b.id ? (
                                     <div className="flex gap-2 animate-in slide-in-from-right-2">
                                        <button disabled={isVerifying} onClick={() => handleVerifyPayment(b, 'cash')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1 shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50">
                                            {isVerifying ? <Loader2 size={10} className="animate-spin" /> : <Banknote size={10}/>} CASH
                                        </button>
                                        <button disabled={isVerifying} onClick={() => handleVerifyPayment(b, 'card')} className="px-4 py-2 bg-brand text-dark rounded-lg text-[9px] font-black uppercase flex items-center gap-1 shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50">
                                            {isVerifying ? <Loader2 size={10} className="animate-spin" /> : <CreditCard size={10}/>} CARD
                                        </button>
                                        <button onClick={() => setVerifyingId(null)} className="px-3 py-2 bg-white/5 text-slate-400 rounded-lg"><X size={12}/></button>
                                     </div>
                                  ) : (
                                     <button onClick={() => setVerifyingId(b.id)} className="px-6 py-2.5 bg-brand text-dark rounded-xl text-[9px] font-black uppercase tracking-widest italic shadow-lg hover:scale-105 transition-all">Verify Pay</button>
                                  )
                               ) : <div className="text-[8px] text-slate-500 uppercase font-black italic">Settled by {b.settledBy || 'SYS'} at {b.settledAt?.split('T')[0]}</div>}
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
        )}

        {/* RECRUITS TAB */}
        {activeTab === 'applications' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
              {pendingApps.length === 0 ? <p className="text-center col-span-full py-20 text-slate-500 uppercase font-black italic tracking-widest">No pending recruitment requests found.</p> : pendingApps.map(u => (
                 <div key={u.id} className="p-8 bg-surface rounded-[2.5rem] border border-white/10 shadow-xl relative overflow-hidden italic">
                    <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                    <div className="flex items-center gap-4 mb-8">
                       <img src={u.image || DEFAULT_PROFILE_IMAGE} className="w-16 h-16 rounded-2xl object-cover grayscale" />
                       <div><h4 className="text-xl font-black uppercase text-white tracking-tighter">{u.name}</h4><p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Candidate Coach</p></div>
                    </div>
                    <div className="space-y-3 mb-8 bg-dark/20 p-4 rounded-xl border border-white/5">
                       <p className="text-xs text-slate-400"><strong>EMAIL:</strong> {u.email}</p>
                       <p className="text-xs text-slate-400"><strong>PHONE:</strong> {u.phone}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleApproveApp(u.id)} className="flex-1 py-4 bg-brand text-dark rounded-xl text-[9px] font-black uppercase hover:bg-white transition-all shadow-lg italic">Approve</button>
                       <button onClick={() => deleteUser(u.id)} className="flex-1 py-4 bg-white/5 text-red-500 rounded-xl text-[9px] font-black uppercase border border-red-500/10 hover:bg-red-500 hover:text-white transition-all italic">Reject</button>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {/* REGISTRY TAB */}
        {activeTab === 'users' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden animate-in fade-in duration-500 shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-dark/20 flex items-center justify-between">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic flex items-center gap-3"><Users size={18} className="text-brand"/> Membership Registry</h3>
                 <span className="text-[9px] font-black uppercase text-slate-500 bg-white/5 px-3 py-1 rounded-full">{safeUsers.length} Recorded Subjects</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                   <thead className="bg-dark/10 text-[9px] font-black uppercase text-slate-500 sticky top-0 z-10 backdrop-blur-sm">
                      <tr><th className="p-5">Identity</th><th className="p-5">Channel</th><th className="p-5">Permissions</th><th className="p-5">Joined</th><th className="p-5 text-right">Protocol</th></tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-[10px] italic font-medium">
                      {safeUsers.map(u => (
                         <tr key={u.id} className="hover:bg-white/5 group">
                            <td className="p-5">
                               <div className="flex items-center gap-4">
                                  <img src={u.image || DEFAULT_PROFILE_IMAGE} className="w-8 h-8 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all shadow-lg" />
                                  <span className="font-black uppercase text-white group-hover:text-brand transition-colors">{cleanName(u.name)}</span>
                               </div>
                            </td>
                            <td className="p-5 text-slate-400 font-bold">{u.email}</td>
                            <td className="p-5"><div className="flex flex-wrap gap-1">{(u.roles || []).map(r => <span key={r} className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] font-black uppercase tracking-widest italic">{r}</span>)}</div></td>
                            <td className="p-5 text-slate-500 font-bold">{(u.joinedDate || '').split('T')[0]}</td>
                            <td className="p-5"><div className="flex justify-end gap-2"><button onClick={() => setUserForRoles(u)} className="p-2 bg-white/5 rounded-lg text-brand hover:bg-brand hover:text-dark transition-all shadow-md"><Settings2 size={14}/></button><button onClick={() => confirmAction({ title: 'Delete Subject?', message: 'Irreversible termination of data.', onConfirm: () => deleteUser(u.id) })} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button></div></td>
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
    </div>
  );
};

export default AdminPanel;
