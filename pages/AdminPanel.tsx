
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, Eye, X, Loader2, TrendingUp, Wallet, Check, Ban, DollarSign, PieChart, History, CreditCard, Banknote, Calendar, Clock, User, Phone, ShieldCheck, Key, Fingerprint, Settings2, Copy, CheckSquare, MessageSquare, Trash, Zap, ArrowUpRight, Activity, BellRing, ChevronDown, ChevronUp, Info, MapPinned, Edit3, Save, AlertTriangle, Percent, Languages, ExternalLink } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { User as UserType, Booking, Review } from '../types';
import RoleManagementModal from '../components/RoleManagementModal';

const AdminPanel: React.FC = () => {
  const { language, bookings, refreshData, updateBooking, updateUser, deleteUser, isAdmin, isManagement, users, reviews, deleteReview, updateReview, confirmAction, deleteBooking, currentUser } = useAppContext();
  const location = useLocation();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'bookings' | 'trainers' | 'applications' | 'users' | 'roles' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingSettlementId, setPendingSettlementId] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [userForRoles, setUserForRoles] = useState<UserType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isSavingBooking, setIsSavingBooking] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab as any);
  }, [location.state]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const calculateTimeRange = (startTime: string, durationMins: number = 60) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMins;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
  };

  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pendingApps = users.filter(u => u.roles?.includes('trainer_pending'));
  const activeTrainers = users.filter(u => u.roles?.includes('trainer'));
  const pendingReviews = reviews.filter(r => !r.isPublished);

  const totalRevenue = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0), [completedBookings]);
  const gymProfit = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.commissionAmount) || 0), 0), [completedBookings]);
  
  const recentActivity = useMemo(() => {
    const activities = [
        ...bookings.map(b => ({ 
            type: 'booking', 
            id: b.id, 
            label: `Session: ${b.customerName}`, 
            time: b.date, 
            subLabel: calculateTimeRange(b.time, b.duration),
            icon: Calendar, 
            color: 'text-blue-500',
            status: b.status,
            fullData: b
        })),
        ...reviews.map(r => ({ 
            type: 'review', 
            id: r.id, 
            label: `New Review: ${r.author}`, 
            time: r.time, 
            subLabel: 'Member Feedback',
            icon: Star, 
            color: 'text-brand',
            status: r.isPublished ? 'published' : 'pending'
        })),
        ...users.slice(0, 10).map(u => ({ 
            type: 'user', 
            id: u.id, 
            label: `New Member: ${u.name.split('(')[0]}`, 
            time: u.joinedDate.split('T')[0], 
            subLabel: 'Registration Complete',
            icon: User, 
            color: 'text-purple-500',
            status: 'active'
        }))
    ];
    return activities.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
  }, [bookings, reviews, users]);

  const todaySessions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.date === todayStr);
  }, [bookings]);

  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  const SettlementDossier = ({ booking }: { booking: Booking }) => {
    const trainer = users.find(u => u.id === booking.trainerId);
    return (
      <div className="mt-4 p-6 bg-dark/60 rounded-2xl border border-white/10 animate-in slide-in-from-top-2 duration-300">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-brand">
                <ShieldCheck size={14} />
                <h4 className="text-[11px] font-black uppercase tracking-widest italic">Chain of Custody Dossier</h4>
            </div>
            {isManagement && (
                <button onClick={() => setEditingBooking(booking)} className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-brand hover:text-dark text-slate-500 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all">
                    <Edit3 size={10} /> Administrative Override
                </button>
            )}
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                     <Briefcase size={16} className="text-slate-500" />
                  </div>
                  <div>
                     <p className="text-[11px] font-black uppercase text-slate-600 mb-0.5">Primary Coach</p>
                     <p className="text-xs font-black text-white italic">{cleanName(trainer?.name)}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                     <User size={16} className="text-slate-500" />
                  </div>
                  <div>
                     <p className="text-[11px] font-black uppercase text-slate-600 mb-0.5">Verification Identity</p>
                     <p className="text-xs font-black text-white italic">{booking.settledBy || 'System/Pending'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                     {booking.paymentMethod === 'card' ? <CreditCard size={16} className="text-brand" /> : <Banknote size={16} className="text-brand" />}
                  </div>
                  <div>
                     <p className="text-[11px] font-black uppercase text-slate-600 mb-0.5">Methodology</p>
                     <p className="text-xs font-black text-brand uppercase italic tracking-widest">{booking.paymentMethod || 'PENDING'}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
                <div className="bg-dark/40 p-5 rounded-xl border border-white/5 space-y-3">
                   <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-bold uppercase">Transaction Value</span>
                      <span className="text-white font-black italic">{booking.price.toFixed(2)} BGN</span>
                   </div>
                   <div className="h-px bg-white/5"></div>
                   <div className="flex justify-between items-center text-[11px]">
                      <span className="text-brand font-black uppercase">Gym P&L</span>
                      <span className="text-brand font-black italic">{booking.commissionAmount?.toFixed(2)} BGN</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-bold uppercase italic">Coach Yield</span>
                      <span className="text-white font-black italic">{booking.trainerEarnings?.toFixed(2)} BGN</span>
                   </div>
                </div>
            </div>
         </div>
      </div>
    );
  };

  if (!isAdmin) return <div className="p-20 text-center text-white">{t.accessDenied}</div>;

  const handleDeleteReview = (id: string) => {
    confirmAction({
      title: t.deleteMsg,
      message: t.sure,
      onConfirm: async () => {
        await deleteReview(id);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none">Console</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-xl bg-white/5 ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}><RefreshCw size={18} /></button>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[11px] mt-2 italic">ClassFit Varna Admin • Mir Stop</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-surface p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'finance', icon: FileSpreadsheet, label: 'Finance', badge: awaitingPaymentList.length },
              { id: 'bookings', icon: ListFilter, label: 'Bookings' },
              { id: 'trainers', icon: Briefcase, label: 'Trainers' },
              { id: 'applications', icon: UserCheck, label: 'Recruitment', badge: pendingApps.length },
              { id: 'users', icon: Users, label: 'Registry' },
              { id: 'roles', icon: Key, label: 'Authority' },
              { id: 'reviews', icon: MessageSquare, label: 'Moderation', badge: pendingReviews.length }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <tab.icon size={14} /> {tab.label}
                    {tab.badge ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] bg-red-500 text-white">{tab.badge}</span> : null}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
        
        {activeTab === 'overview' && (
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div 
                    onClick={() => setActiveTab('finance')}
                    className="p-8 bg-brand text-dark rounded-[2.5rem] shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                 >
                    <div className="absolute top-4 right-4 opacity-10"><PieChart size={48} /></div>
                    <p className="text-[11px] font-black uppercase mb-4 tracking-widest italic opacity-60">Total Revenue</p>
                    <p className="text-4xl font-black italic tracking-tighter">{totalRevenue.toFixed(2)} <span className="text-xs">BGN</span></p>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-dark/10 rounded-lg text-[11px] font-black uppercase italic group-hover:bg-dark group-hover:text-brand transition-colors">
                       <ArrowUpRight size={12} /> Financial Report
                    </div>
                 </div>

                 <div 
                    onClick={() => setActiveTab('finance')}
                    className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden group cursor-pointer hover:border-brand/40 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                    <div className="absolute top-4 right-4 opacity-10"><TrendingUp size={48} className="text-brand" /></div>
                    <p className="text-[11px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Gym Profit</p>
                    <p className="text-4xl font-black italic text-brand tracking-tighter">{gymProfit.toFixed(2)} <span className="text-xs">BGN</span></p>
                    <p className="text-[11px] text-slate-600 font-bold uppercase mt-4 italic tracking-widest group-hover:text-brand transition-colors">Profit Analysis →</p>
                 </div>

                 <div 
                    onClick={() => setActiveTab('finance')}
                    className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden group cursor-pointer hover:border-yellow-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                    <div className="absolute top-4 right-4 opacity-5"><Wallet size={48} className="text-yellow-500" /></div>
                    <p className="text-[11px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Pending Pay</p>
                    <p className="text-4xl font-black italic text-yellow-500 tracking-tighter">{awaitingPaymentList.length}</p>
                    <div className="mt-4 text-[11px] font-black uppercase text-slate-400 group-hover:text-yellow-500 transition-colors">Awaiting Verification →</div>
                 </div>

                 <div 
                    onClick={() => setActiveTab('users')}
                    className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden group cursor-pointer hover:border-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                    <div className="absolute top-4 right-4 opacity-5"><Users size={48} className="text-blue-500" /></div>
                    <p className="text-[11px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Community</p>
                    <p className="text-4xl font-black italic text-white tracking-tighter">{users.length}</p>
                    <p className="text-[11px] text-slate-600 font-bold uppercase mt-4 italic tracking-widest group-hover:text-blue-400 transition-colors">Member Registry →</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 bg-surface rounded-[3rem] border border-white/5 p-10">
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3"><Activity className="text-brand" /> Activity Log</h3>
                       <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 italic">Audit Track</span>
                    </div>
                    <div className="space-y-4">
                       {recentActivity.length === 0 ? <p className="text-center py-20 text-slate-500 italic">No activity recorded.</p> : recentActivity.map((act) => {
                          const isExpandable = act.type === 'booking';
                          const isExpanded = expandedBookingId === act.id;
                          return (
                            <div key={act.id} className="flex flex-col">
                                <div 
                                    onClick={() => isExpandable && setExpandedBookingId(isExpanded ? null : act.id)}
                                    className={`flex items-center gap-6 p-5 bg-dark/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all group ${isExpandable ? 'cursor-pointer' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-dark border border-white/5 flex items-center justify-center ${act.color} group-hover:scale-110 transition-transform`}>
                                        <act.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-black uppercase italic text-sm leading-none mb-1.5">{act.label}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[11px] font-black uppercase text-slate-600 tracking-widest italic">{act.time} {act.subLabel ? `• ${act.subLabel}` : ''}</p>
                                            <span className={`text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                act.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                                                act.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                                                act.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' : 'bg-white/5 text-slate-500'
                                            }`}>
                                                {act.status}
                                            </span>
                                        </div>
                                    </div>
                                    {isExpandable && (
                                        <div className="text-slate-500 group-hover:text-brand transition-colors">
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    )}
                                </div>
                                {isExpanded && act.fullData && act.type === 'booking' && <SettlementDossier booking={act.fullData as Booking} />}
                            </div>
                          );
                       })}
                    </div>
                 </div>

                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-surface rounded-[3rem] border border-white/5 p-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent">
                       <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3 mb-8"><Zap className="text-brand" /> Today's Pulse</h3>
                       <div className="space-y-6">
                          <div className="p-6 bg-dark/40 rounded-2xl border border-white/5">
                             <p className="text-[11px] font-black uppercase text-slate-500 mb-2 tracking-widest italic">Sessions Scheduled</p>
                             <div className="flex items-end justify-between">
                                <span className="text-3xl font-black italic text-white">{todaySessions.length}</span>
                                <span className="text-[11px] font-black uppercase text-brand">Live Schedule</span>
                             </div>
                          </div>
                          <div className="p-6 bg-dark/40 rounded-2xl border border-white/5">
                             <p className="text-[11px] font-black uppercase text-slate-500 mb-2 tracking-widest italic">Pending Recruits</p>
                             <div className="flex items-end justify-between">
                                <span className="text-3xl font-black italic text-white">{pendingApps.length}</span>
                                <button onClick={() => setActiveTab('applications')} className="p-2 bg-brand text-dark rounded-lg hover:scale-110 transition-transform"><ArrowUpRight size={14}/></button>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-12 pb-32">
            <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
               <div className="px-8 py-6 bg-dark/30 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-3"><Wallet className="text-brand" /> Awaiting Settlement</h3>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500 italic">
                     <Clock size={12} /> {awaitingPaymentList.length} Units Pending
                  </div>
               </div>
               <table className="w-full">
                  <thead className="bg-dark/10 text-[11px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Session</th><th className="px-8 py-5 text-left">Coach</th><th className="px-8 py-5 text-left">Member</th><th className="px-8 py-5 text-right">Fee</th><th className="px-8 py-5 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {awaitingPaymentList.length === 0 ? <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold italic">Clear Ledger. No payments outstanding.</td></tr> : awaitingPaymentList.map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors text-xs">
                           <td className="px-8 py-6 font-bold text-white italic">{b.date} <span className="text-[11px] text-slate-500 ml-2">{calculateTimeRange(b.time, b.duration)}</span></td>
                           <td className="px-8 py-6 uppercase italic text-slate-300">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                           <td className="px-8 py-6 text-slate-400 uppercase font-black tracking-tighter">{b.customerName}</td>
                           <td className="px-8 py-6 text-right font-black text-brand tracking-tighter">{b.price.toFixed(2)} BGN</td>
                           <td className="px-8 py-6 text-right">
                              <button onClick={() => setPendingSettlementId(b.id)} className="px-5 py-2.5 bg-brand text-dark rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-brand/10">Settle Transaction</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="bg-surface/50 rounded-[3rem] border border-white/5 overflow-hidden shadow-xl">
               <div className="px-8 py-6 bg-dark/20 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase italic text-slate-400">Archived Ledger & Verification History</h3>
                  <Info size={14} className="text-slate-600" />
               </div>
               <div className="divide-y divide-white/5">
                  {completedBookings.length === 0 ? <p className="p-20 text-center text-slate-600 italic">No history available.</p> : completedBookings.map(b => {
                     const isExpanded = expandedBookingId === b.id;
                     return (
                        <div key={b.id} className="flex flex-col">
                           <div 
                              onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                              className="px-8 py-6 hover:bg-white/5 transition-all cursor-pointer group flex items-center justify-between"
                           >
                              <div className="grid grid-cols-4 flex-1 items-center">
                                 <span className="text-slate-500 text-[11px] font-black italic">{b.date} • {calculateTimeRange(b.time, b.duration)}</span>
                                 <span className="text-white font-black uppercase italic text-xs tracking-tight">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</span>
                                 <span className="text-slate-400 text-xs font-black uppercase tracking-tighter">{b.customerName}</span>
                                 <span className="text-right text-brand font-black italic text-xs pr-8">{b.price.toFixed(2)} BGN</span>
                              </div>
                              <div className="flex items-center gap-4">
                                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 border border-white/10 px-2 py-1 rounded italic">{b.paymentMethod || 'CASH'}</span>
                                 {isExpanded ? <ChevronUp size={16} className="text-brand" /> : <ChevronDown size={16} className="text-slate-600 group-hover:text-white" />}
                              </div>
                           </div>
                           {isExpanded && <div className="px-8 pb-8"><SettlementDossier booking={b} /></div>}
                        </div>
                     )
                  })}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
           <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full">
                  <thead className="bg-dark/30 text-[11px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Session</th><th className="px-8 py-5 text-left">Client</th><th className="px-8 py-5 text-left">Coach</th><th className="px-8 py-5 text-right">Status / Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {activeBookings.length === 0 ? <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">No active operations.</td></tr> : activeBookings.map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors text-xs text-white">
                           <td className="px-8 py-6 italic font-bold">{b.date} <span className="opacity-50 ml-2">@ {calculateTimeRange(b.time, b.duration)}</span></td>
                           <td className="px-8 py-6 font-black italic uppercase tracking-tighter">{b.customerName}</td>
                           <td className="px-8 py-6 text-slate-400 italic">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-3">
                                 <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{b.status}</span>
                                 {isManagement && (
                                    <div className="flex gap-1.5 ml-4 border-l border-white/10 pl-4">
                                       <button onClick={() => setEditingBooking(b)} className="p-2 bg-white/5 hover:bg-brand hover:text-dark rounded-lg text-slate-500 transition-all"><Edit3 size={14}/></button>
                                       <button onClick={() => confirmAction({ title: 'Delete Booking', message: `Remove ${b.customerName}'s session entirely?`, onConfirm: () => deleteBooking(b.id) })} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg text-slate-500 transition-all"><Trash2 size={14}/></button>
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

        {activeTab === 'trainers' && (
           <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="px-8 py-6 bg-dark/30 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-3"><Briefcase className="text-brand" /> Active Coaches</h3>
                <span className="text-[11px] font-black text-slate-500 uppercase italic">{activeTrainers.length} Registered Professionals</span>
              </div>
              <table className="w-full">
                  <thead className="bg-dark/10 text-[11px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Identity</th><th className="px-8 py-5 text-left">Terms</th><th className="px-8 py-5 text-left">Languages</th><th className="px-8 py-5 text-right">Control</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {activeTrainers.map(t => (
                        <tr key={t.id} className="hover:bg-white/5 transition-colors text-xs">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <img src={t.image || DEFAULT_PROFILE_IMAGE} className="w-12 h-12 rounded-xl object-cover" />
                                 <div>
                                    <p className="font-black text-white uppercase italic text-sm">{cleanName(t.name)}</p>
                                    <p className="text-[11px] text-brand font-bold uppercase tracking-widest">{t.name.match(/\((.*)\)/)?.[1] || 'Instructor'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="space-y-1">
                                 <p className="text-slate-400 font-bold italic">Gym Share: <span className="text-white">{t.commissionRate || 25}%</span></p>
                                 <p className="text-[10px] text-slate-600 font-black uppercase">Coach Yield: {(100 - (t.commissionRate || 25))}%</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-wrap gap-1.5">
                                 {t.languages && t.languages.length > 0 ? t.languages.map(l => (
                                    <span key={l} className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] font-black uppercase tracking-tighter text-slate-400 border border-white/5 italic">{l}</span>
                                 )) : (
                                    <span className="text-[10px] text-slate-600 font-black uppercase italic">Unspecified</span>
                                 )}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button onClick={() => setUserForRoles(t)} className="p-3 bg-white/5 hover:bg-brand hover:text-dark rounded-xl text-slate-500 transition-all">
                                 <Settings2 size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
              </table>
           </div>
        )}

        {activeTab === 'applications' && (
           <div className="space-y-6">
              {pendingApps.length === 0 ? (
                 <div className="bg-surface rounded-[3rem] border border-white/5 p-20 text-center border-dashed">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-700">
                       <UserCheck size={32} />
                    </div>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[11px] italic">No active recruitment files found.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {pendingApps.map(app => (
                       <div key={app.id} className="p-10 bg-surface rounded-[3rem] border border-white/10 shadow-2xl relative group overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                          <div className="flex items-center gap-6 mb-8">
                             <div className="w-16 h-16 rounded-2xl bg-dark border border-white/10 overflow-hidden"><img src={app.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover grayscale opacity-60" /></div>
                             <div>
                                <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{cleanName(app.name)}</h4>
                                <p className="text-[11px] text-yellow-500 font-black uppercase tracking-widest">{app.name.match(/\((.*)\)/)?.[1] || 'Applicant'}</p>
                             </div>
                          </div>
                          
                          <div className="space-y-6 mb-10">
                             <div className="p-5 bg-dark/40 rounded-2xl border border-white/5 max-h-[200px] overflow-y-auto custom-scrollbar">
                                <p className="text-[11px] font-black uppercase text-slate-500 mb-2 italic tracking-widest flex items-center gap-2"><Info size={12}/> Profile Statement</p>
                                <p className="text-xs text-slate-300 font-medium italic leading-relaxed whitespace-pre-line">{app.bio}</p>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-dark/20 border border-white/5 rounded-xl">
                                   <p className="text-[10px] font-black uppercase text-slate-600 mb-1">Direct Line</p>
                                   <a href={`tel:${app.phone}`} className="text-[11px] font-bold text-white hover:text-brand transition-colors">{app.phone || 'N/A'}</a>
                                </div>
                                <div className="p-4 bg-dark/20 border border-white/5 rounded-xl">
                                   <p className="text-[10px] font-black uppercase text-slate-600 mb-1">Joined Basis</p>
                                   <p className="text-[11px] font-bold text-slate-400 italic">{new Date(app.joinedDate).toLocaleDateString()}</p>
                                </div>
                             </div>
                          </div>

                          <div className="flex gap-4">
                             <button 
                                onClick={() => confirmAction({ 
                                   title: 'Approve Coach', 
                                   message: `Induct ${cleanName(app.name)} into the ClassFit professional team?`, 
                                   onConfirm: () => updateUser(app.id, { roles: ['user', 'trainer'], approvedBy: currentUser?.name }) 
                                })}
                                className="flex-1 py-5 bg-brand text-dark rounded-2xl font-black uppercase text-[11px] shadow-lg shadow-brand/10 hover:bg-white transition-all flex items-center justify-center gap-2"
                             >
                                <Check size={14} /> Approve Access
                             </button>
                             <button 
                                onClick={() => confirmAction({ 
                                   title: 'Decline Application', 
                                   message: `Remove recruitment file for ${cleanName(app.name)}?`, 
                                   onConfirm: () => updateUser(app.id, { roles: ['user'] }) 
                                })}
                                className="px-8 py-5 bg-white/5 text-slate-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                             >
                                <X size={18} />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        )}

        {activeTab === 'users' && (
           <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full">
                  <thead className="bg-dark/30 text-[11px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Member Profile</th><th className="px-8 py-5 text-left">Info</th><th className="px-8 py-5 text-left">Registration</th><th className="px-8 py-5 text-right">Delete</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors text-xs">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <img src={u.image || DEFAULT_PROFILE_IMAGE} className="w-10 h-10 rounded-xl grayscale opacity-60" />
                                 <div>
                                    <p className="font-black text-white uppercase italic leading-none mb-1">{cleanName(u.name)}</p>
                                    <p className="text-[11px] text-slate-500 italic">{u.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 {u.languages && u.languages.length > 0 && (
                                   <div className="flex items-center gap-1.5 text-slate-400 font-black uppercase tracking-widest text-[9px] italic">
                                     <Languages size={10} /> {u.languages.join(', ')}
                                   </div>
                                 )}
                                 <div className="text-[9px] font-black uppercase text-slate-600 tracking-[0.2em]">{u.roles.join(' • ')}</div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-slate-400 font-bold italic">{new Date(u.joinedDate).toLocaleDateString()}</td>
                           <td className="px-8 py-6 text-right">
                              {!u.roles.includes('management') && isManagement && <button onClick={() => confirmAction({ title: 'Purge Account', message: `Permanently delete ${u.name}'s entire profile and history?`, onConfirm: () => deleteUser(u.id) })} className="p-3 text-slate-700 hover:text-red-500 transition-colors bg-white/5 rounded-xl"><Trash2 size={16}/></button>}
                           </td>
                        </tr>
                     ))}
                  </tbody>
              </table>
           </div>
        )}

        {activeTab === 'roles' && (
           <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full">
                  <thead className="bg-dark/30 text-[11px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Identity</th><th className="px-8 py-5 text-left">Authority Delegation</th><th className="px-8 py-5 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors text-xs">
                           <td className="px-8 py-6"><p className="text-white font-black uppercase italic text-xs leading-none">{cleanName(u.name)}</p><p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">{u.email}</p></td>
                           <td className="px-8 py-6"><div className="flex flex-wrap gap-2">{u.roles.map(r => (<span key={r} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-black uppercase italic tracking-tighter text-slate-400">{r}</span>))}</div></td>
                           <td className="px-8 py-6 text-right"><button onClick={() => setUserForRoles(u)} className="px-5 py-2.5 bg-white/5 hover:bg-brand hover:text-dark text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2 ml-auto shadow-sm italic"><Settings2 size={14} /> Update Authority</button></td>
                        </tr>
                     ))}
                  </tbody>
              </table>
           </div>
        )}

        {activeTab === 'reviews' && ( pendingReviews.length === 0 ? <p className="text-center py-20 text-slate-500 italic">No feedback pending moderation.</p> :
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {pendingReviews.map(r => (
                 <div 
                    key={r.id} 
                    className={`p-5 bg-surface rounded-[3rem] border border-brand/20 shadow-2xl relative overflow-hidden transition-all duration-500 group ${isManagement ? 'hover:p-10 hover:shadow-[0_20px_50px_rgba(220,38,38,0.25)]' : ''}`}
                 >
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand/10 border border-brand/20 text-brand rounded-2xl flex items-center justify-center font-black italic shadow-inner">{r.avatar}</div>
                          <div>
                             <h4 className="text-sm font-black uppercase text-white italic tracking-tight">{r.author}</h4>
                             <p className="text-[11px] text-slate-500 font-bold italic">Reviewing: {cleanName(users.find(u => u.id === r.trainerId)?.name)}</p>
                          </div>
                       </div>
                       <div className="flex text-brand gap-1">{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
                    </div>
                    <div className="p-6 bg-dark/40 rounded-2xl border border-white/5 mb-10 transition-all group-hover:bg-dark/60">
                        <p className="text-xs text-slate-300 italic leading-relaxed">"{r.text}"</p>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => updateReview(r.id, { isPublished: true })} className="flex-1 py-5 bg-brand text-dark rounded-2xl font-black uppercase text-[11px] shadow-lg shadow-brand/10 hover:bg-white transition-all">Publish Live</button>
                       <button onClick={() => handleDeleteReview(r.id)} className="px-8 py-5 bg-white/5 text-slate-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash size={18} /></button>
                    </div>
                 </div>
              ))}
           </div>
        )}

      </div>
      
      {editingBooking && (
         <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300 text-left">
            <div className="bg-surface border border-white/10 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-500"></div>
                <button onClick={() => setEditingBooking(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full"><X size={20} /></button>
                
                <div className="mb-10">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-[11px] font-black uppercase tracking-widest mb-4 italic"><Settings2 size={12} /> Management Override</div>
                   <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none mb-1">Modify Operation</h2>
                   <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">ID: {editingBooking.id.substring(0,8)}...</p>
                </div>

                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 ml-2">Session Date</label>
                           <input 
                                type="date" 
                                value={editingBooking.date} 
                                onChange={(e) => setEditingBooking({...editingBooking, date: e.target.value})}
                                className="w-full bg-dark/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs outline-none focus:border-brand transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 ml-2">Session Start Time</label>
                           <input 
                                type="time" 
                                value={editingBooking.time} 
                                onChange={(e) => setEditingBooking({...editingBooking, time: e.target.value})}
                                className="w-full bg-dark/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs outline-none focus:border-brand transition-all"
                           />
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[11px] font-black uppercase text-slate-500 mb-1">Estimated Slot (60 min)</p>
                      <p className="text-xs text-white font-black italic">{calculateTimeRange(editingBooking.time, editingBooking.duration)}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 ml-2">Force Status Update</label>
                        <select 
                            value={editingBooking.status} 
                            onChange={(e) => setEditingBooking({...editingBooking, status: e.target.value as any})}
                            className="w-full bg-dark/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs outline-none focus:border-brand transition-all appearance-none cursor-pointer"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="trainer_completed">Awaiting Payment</option>
                            <option value="completed">Completed/Settled</option>
                        </select>
                    </div>

                    <div className="bg-dark/40 p-6 rounded-2xl border border-white/5 space-y-4">
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic mb-2">P&L Overrides</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[11px] font-black uppercase text-slate-600 ml-1 italic">Gym Profit (BGN)</label>
                             <input 
                                type="number" 
                                value={editingBooking.commissionAmount} 
                                onChange={(e) => {
                                   const gymCut = Number(e.target.value);
                                   setEditingBooking({
                                      ...editingBooking, 
                                      commissionAmount: gymCut,
                                      trainerEarnings: editingBooking.price - gymCut
                                   });
                                }}
                                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-brand font-black text-xs outline-none focus:border-brand"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[11px] font-black uppercase text-slate-600 ml-1 italic">Coach Yield (BGN)</label>
                             <input 
                                type="number" 
                                value={editingBooking.trainerEarnings} 
                                onChange={(e) => {
                                   const trainerCut = Number(e.target.value);
                                   setEditingBooking({
                                      ...editingBooking, 
                                      trainerEarnings: trainerCut,
                                      commissionAmount: editingBooking.price - trainerCut
                                   });
                                }}
                                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white font-black text-xs outline-none focus:border-brand"
                             />
                          </div>
                       </div>
                       <p className="text-[11px] text-slate-600 font-bold italic text-center">Base Price: {editingBooking.price} BGN • Adjustments will be saved to the ledger.</p>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-3">
                        <button 
                            disabled={isSavingBooking}
                            onClick={async () => { 
                              setIsSavingBooking(true);
                              try {
                                await updateBooking(editingBooking.id, editingBooking); 
                                setEditingBooking(null); 
                              } finally {
                                setIsSavingBooking(false);
                              }
                            }} 
                            className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-brand/10 hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                            {isSavingBooking ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Commit Overrides & Update Ledger</>}
                        </button>
                    </div>
                </div>
            </div>
         </div>
      )}

      {pendingSettlementId && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-surface border border-white/10 rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative text-center">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-brand"></div>
               <div className="w-20 h-20 bg-brand/10 text-brand rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand/10">{isSettling ? <Loader2 size={32} className="animate-spin" /> : <ShieldCheck size={32} />}</div>
               <h2 className="text-2xl font-black uppercase italic text-white mb-2 tracking-tighter">Finalize Settlement</h2>
               <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest italic mb-10">Identity Check Complete. Choose Method.</p>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={async () => { setIsSettling(true); await updateBooking(pendingSettlementId, { status: 'completed', paymentMethod: 'cash' }); setPendingSettlementId(null); setIsSettling(false); }} className="p-10 bg-white/5 rounded-[2rem] hover:bg-brand/5 border border-white/5 flex flex-col items-center gap-4 transition-all group"><Banknote className="text-brand group-hover:scale-110 transition-transform" size={28} /><span className="text-[11px] font-black uppercase text-white italic">Cash</span></button>
                  <button onClick={async () => { setIsSettling(true); await updateBooking(pendingSettlementId, { status: 'completed', paymentMethod: 'card' }); setPendingSettlementId(null); setIsSettling(false); }} className="p-10 bg-white/5 rounded-[2rem] hover:bg-brand/5 border border-white/5 flex flex-col items-center gap-4 transition-all group"><CreditCard className="text-brand group-hover:scale-110 transition-transform" size={28} /><span className="text-[11px] font-black uppercase text-white italic">Card</span></button>
               </div>
               <button onClick={() => setPendingSettlementId(null)} className="mt-10 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-all italic">Discard Settlement Request</button>
            </div>
         </div>
      )}

      <RoleManagementModal 
        user={userForRoles}
        onClose={() => setUserForRoles(null)}
        onUpdate={async (uid, updates) => await updateUser(uid, updates)}
        language={language}
        isManagement={isManagement}
      />
    </div>
  );
};

export default AdminPanel;
