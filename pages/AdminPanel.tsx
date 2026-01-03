
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, Eye, X, Loader2, TrendingUp, Wallet, Check, Ban, DollarSign, PieChart, History, CreditCard, Banknote, Calendar, Clock, User, Phone, ShieldCheck, Key, Fingerprint, Settings2, Copy, CheckSquare, MessageSquare, Trash, Zap, ArrowUpRight, Activity, BellRing } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { User as UserType, Booking, Review } from '../types';
import RoleManagementModal from '../components/RoleManagementModal';

const AdminPanel: React.FC = () => {
  const { language, bookings, refreshData, updateBooking, updateUser, deleteUser, isAdmin, isManagement, users, reviews, deleteReview, updateReview, confirmAction } = useAppContext();
  const location = useLocation();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'bookings' | 'trainers' | 'applications' | 'users' | 'roles' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingSettlementId, setPendingSettlementId] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [userForRoles, setUserForRoles] = useState<UserType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab as any);
  }, [location.state]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Data Selectors
  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pendingApps = users.filter(u => u.roles?.includes('trainer_pending'));
  const activeTrainers = users.filter(u => u.roles?.includes('trainer'));
  const pendingReviews = reviews.filter(r => !r.isPublished);

  // Stats Logic
  const totalRevenue = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0), [completedBookings]);
  const gymProfit = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.commissionAmount) || 0), 0), [completedBookings]);
  
  // Overview Logic: Get Latest 5 events
  const recentActivity = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const activities = [
        ...bookings.map(b => ({ type: 'booking', date: b.id, label: `Session: ${b.customerName}`, time: b.date, icon: Calendar, color: 'text-blue-500' })),
        ...reviews.map(r => ({ type: 'review', date: r.id, label: `New Review: ${r.author}`, time: r.time, icon: Star, color: 'text-brand' })),
        ...users.slice(0, 10).map(u => ({ type: 'user', date: u.id, label: `New Member: ${u.name.split('(')[0]}`, time: u.joinedDate.split('T')[0], icon: User, color: 'text-purple-500' }))
    ];

    // Simple sort by "simulated freshness" (actually needs timestamps to be perfect, but we'll sort by ID/JoinedDate for now)
    return activities.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6);
  }, [bookings, reviews, users]);

  const todaySessions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.date === todayStr);
  }, [bookings]);

  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  if (!isAdmin) return <div className="p-20 text-center text-white">{t.accessDenied}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none">Console</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-xl bg-white/5 ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}><RefreshCw size={18} /></button>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">ClassFit Varna Admin</p>
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
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <tab.icon size={14} /> {tab.label}
                    {tab.badge ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] bg-red-500 text-white">{tab.badge}</span> : null}
                </button>
            ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
        
        {activeTab === 'overview' && (
           <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="p-8 bg-brand text-dark rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-4 right-4 opacity-10"><PieChart size={48} /></div>
                    <p className="text-[10px] font-black uppercase mb-4 tracking-widest italic opacity-60">Total Revenue</p>
                    <p className="text-4xl font-black italic tracking-tighter">{totalRevenue.toFixed(2)} <span className="text-xs">BGN</span></p>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-dark/10 rounded-lg text-[9px] font-black uppercase italic">
                       <ArrowUpRight size={12} /> All Time
                    </div>
                 </div>
                 <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-10"><TrendingUp size={48} className="text-brand" /></div>
                    <p className="text-[10px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Gym Profit</p>
                    <p className="text-4xl font-black italic text-brand tracking-tighter">{gymProfit.toFixed(2)} <span className="text-xs">BGN</span></p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-4 italic tracking-widest">Net Earnings</p>
                 </div>
                 <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-5"><Wallet size={48} className="text-yellow-500" /></div>
                    <p className="text-[10px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Pending Pay</p>
                    <p className="text-4xl font-black italic text-yellow-500 tracking-tighter">{awaitingPaymentList.length}</p>
                    <button onClick={() => setActiveTab('finance')} className="mt-4 text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors">Action Required →</button>
                 </div>
                 <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-5"><Users size={48} className="text-blue-500" /></div>
                    <p className="text-[10px] font-black uppercase mb-4 tracking-widest italic text-slate-500">Community</p>
                    <p className="text-4xl font-black italic text-white tracking-tighter">{users.length}</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-4 italic tracking-widest">Active Members</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Recent Activity Feed */}
                 <div className="lg:col-span-8 bg-surface rounded-[3rem] border border-white/5 p-10">
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3"><Activity className="text-brand" /> Recent Activity</h3>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Real-time Feed</span>
                    </div>
                    <div className="space-y-6">
                       {recentActivity.length === 0 ? <p className="text-center py-20 text-slate-500 italic">No activity recorded.</p> : recentActivity.map((act, i) => (
                          <div key={i} className="flex items-center gap-6 p-4 bg-dark/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                             <div className={`w-12 h-12 rounded-xl bg-dark border border-white/5 flex items-center justify-center ${act.color} group-hover:scale-110 transition-transform`}>
                                <act.icon size={20} />
                             </div>
                             <div className="flex-1">
                                <p className="text-white font-black uppercase italic text-sm leading-none mb-1.5">{act.label}</p>
                                <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest italic">{act.time}</p>
                             </div>
                             <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/5 px-3 py-1 rounded-full group-hover:text-brand transition-colors">Verified</div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Snapshot & Quick Links */}
                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-surface rounded-[3rem] border border-white/5 p-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent">
                       <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3 mb-8"><Zap className="text-brand" /> Today's Pulse</h3>
                       <div className="space-y-6">
                          <div className="p-6 bg-dark/40 rounded-2xl border border-white/5">
                             <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest italic">Sessions Scheduled</p>
                             <div className="flex items-end justify-between">
                                <span className="text-3xl font-black italic text-white">{todaySessions.length}</span>
                                <span className="text-[10px] font-black uppercase text-brand">Live Schedule</span>
                             </div>
                          </div>
                          <div className="p-6 bg-dark/40 rounded-2xl border border-white/5">
                             <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest italic">Pending Recruits</p>
                             <div className="flex items-end justify-between">
                                <span className="text-3xl font-black italic text-white">{pendingApps.length}</span>
                                <button onClick={() => setActiveTab('applications')} className="p-2 bg-brand text-dark rounded-lg hover:scale-110 transition-transform"><ArrowUpRight size={14}/></button>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-surface rounded-[3rem] border border-white/5 p-10">
                       <h3 className="text-xl font-black uppercase italic text-white mb-8">Quick Actions</h3>
                       <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setActiveTab('finance')} className="p-4 bg-dark/40 hover:bg-brand hover:text-dark rounded-2xl border border-white/5 text-slate-400 transition-all flex flex-col items-center gap-3">
                             <DollarSign size={20} />
                             <span className="text-[8px] font-black uppercase tracking-widest">Settle All</span>
                          </button>
                          <button onClick={() => setActiveTab('reviews')} className="p-4 bg-dark/40 hover:bg-brand hover:text-dark rounded-2xl border border-white/5 text-slate-400 transition-all flex flex-col items-center gap-3 relative">
                             <MessageSquare size={20} />
                             {pendingReviews.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                             <span className="text-[8px] font-black uppercase tracking-widest">Moderation</span>
                          </button>
                          <button onClick={() => setActiveTab('bookings')} className="p-4 bg-dark/40 hover:bg-brand hover:text-dark rounded-2xl border border-white/5 text-slate-400 transition-all flex flex-col items-center gap-3">
                             <Calendar size={20} />
                             <span className="text-[8px] font-black uppercase tracking-widest">Schedule</span>
                          </button>
                          <button onClick={() => setActiveTab('trainers')} className="p-4 bg-dark/40 hover:bg-brand hover:text-dark rounded-2xl border border-white/5 text-slate-400 transition-all flex flex-col items-center gap-3">
                             <Briefcase size={20} />
                             <span className="text-[8px] font-black uppercase tracking-widest">Coaches</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-12">
            <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
               <div className="px-8 py-6 bg-dark/30 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-3"><Wallet className="text-brand" /> Awaiting Settlement</h3>
               </div>
               <table className="w-full">
                  <thead className="bg-dark/10 text-[9px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Session</th><th className="px-8 py-5 text-left">Coach</th><th className="px-8 py-5 text-left">Member</th><th className="px-8 py-5 text-right">Fee</th><th className="px-8 py-5 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {awaitingPaymentList.length === 0 ? <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold italic">No pending payments.</td></tr> : awaitingPaymentList.map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors text-xs">
                           <td className="px-8 py-6 font-bold text-white">{b.date} <span className="text-[10px] text-slate-500 ml-2">{b.time}</span></td>
                           <td className="px-8 py-6 uppercase italic text-slate-300">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                           <td className="px-8 py-6 text-slate-400">{b.customerName}</td>
                           <td className="px-8 py-6 text-right font-black text-brand">{b.price.toFixed(2)}</td>
                           <td className="px-8 py-6 text-right">
                              <button onClick={() => setPendingSettlementId(b.id)} className="px-4 py-2 bg-brand text-dark rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-md">Confirm Payment</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="bg-surface/50 rounded-[3rem] border border-white/5 overflow-hidden opacity-80 shadow-xl">
               <div className="px-8 py-4 bg-dark/20 border-b border-white/5"><h3 className="text-sm font-black uppercase italic text-slate-400">Transaction History</h3></div>
               <table className="w-full text-[10px]">
                  <tbody className="divide-y divide-white/5">
                     {completedBookings.slice(0, 10).map(b => (
                        <tr key={b.id} className="text-slate-400">
                           <td className="px-8 py-4">{b.date}</td>
                           <td className="px-8 py-4 font-bold text-white uppercase italic">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                           <td className="px-8 py-4 text-right font-black">{b.price.toFixed(2)} BGN</td>
                           <td className="px-8 py-4 text-right uppercase italic text-[8px]">{b.paymentMethod || 'cash'}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
           <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full">
                  <thead className="bg-dark/30 text-[9px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Session</th><th className="px-8 py-5 text-left">Client</th><th className="px-8 py-5 text-left">Coach</th><th className="px-8 py-5 text-right">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {activeBookings.length === 0 ? <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">No active operations.</td></tr> : activeBookings.map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors text-xs text-white">
                           <td className="px-8 py-6"><b>{b.date}</b> @ {b.time}</td>
                           <td className="px-8 py-6 font-bold italic uppercase">{b.customerName}</td>
                           <td className="px-8 py-6 text-slate-400 italic">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                           <td className="px-8 py-6 text-right"><span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{b.status}</span></td>
                        </tr>
                     ))}
                  </tbody>
              </table>
           </div>
        )}

        {activeTab === 'trainers' && ( activeTrainers.length === 0 ? <p className="text-center py-20 text-slate-500">No active coaches.</p> :
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTrainers.map(t => (
                 <div key={t.id} className="p-8 bg-surface rounded-[3rem] border border-white/5 relative group shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                       <img src={t.image || DEFAULT_PROFILE_IMAGE} className="w-16 h-16 rounded-2xl object-cover grayscale" />
                       <div>
                          <h4 className="text-xl font-black uppercase italic text-white leading-none mb-1">{cleanName(t.name)}</h4>
                          <p className="text-[9px] font-black uppercase tracking-widest text-brand">{t.name.match(/\((.*)\)/)?.[1] || 'Coach'}</p>
                       </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-white/5">
                       <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Commision Rate</span>
                          <span className="text-white bg-white/5 px-3 py-1 rounded-lg">{t.commissionRate || 25}%</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Registered ID</span>
                          <div className="flex items-center gap-2">
                             <span className="text-slate-600 font-mono">{t.id.substring(0,8)}...</span>
                             <button onClick={() => handleCopy(t.id)} className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                                {copiedId === t.id ? <Check size={12} /> : <Copy size={12} />}
                             </button>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setUserForRoles(t)} className="mt-8 w-full py-4 bg-white/5 hover:bg-brand hover:text-dark text-slate-500 text-[10px] font-black uppercase rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2">
                       <Settings2 size={14} /> Identity Settings
                    </button>
                 </div>
              ))}
           </div>
        )}

        {activeTab === 'applications' && ( pendingApps.length === 0 ? <p className="text-center py-20 text-slate-500 italic">Queue is clear.</p> :
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingApps.map(app => (
                 <div key={app.id} className="p-10 bg-surface rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="flex items-center gap-6 mb-8">
                       <div className="w-16 h-16 rounded-[2rem] bg-dark flex items-center justify-center text-2xl font-black text-brand">{app.name.charAt(0)}</div>
                       <div>
                          <h4 className="text-2xl font-black uppercase italic text-white leading-none mb-2">{cleanName(app.name)}</h4>
                          <p className="text-[10px] font-black tracking-widest text-brand">{app.name.match(/\((.*)\)/)?.[1] || 'Coach'}</p>
                       </div>
                    </div>
                    <div className="space-y-4 mb-10">
                       <p className="text-xs text-slate-400 italic">"{app.bio}"</p>
                       <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-600">
                          <span>{app.email}</span> • <span>{app.phone}</span>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setUserForRoles(app)} className="flex-1 py-4 bg-brand text-dark rounded-2xl font-black uppercase text-xs hover:bg-white transition-all shadow-xl">Process Hiring</button>
                       <button onClick={() => confirmAction({ title: 'Reject', message: 'Reject this application?', onConfirm: () => updateUser(app.id, { roles: ['user'] }) })} className="px-6 py-4 bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all"><Ban size={18} /></button>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {activeTab === 'users' && (
           <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full">
                  <thead className="bg-dark/30 text-[9px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Identity</th><th className="px-8 py-5 text-left">User ID</th><th className="px-8 py-5 text-left">Joined</th><th className="px-8 py-5 text-right">Management</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors text-xs">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <img src={u.image || DEFAULT_PROFILE_IMAGE} className="w-10 h-10 rounded-xl grayscale" />
                                 <div>
                                    <p className="font-black text-white uppercase italic leading-none mb-1">{cleanName(u.name)}</p>
                                    <p className="text-[10px] text-slate-500">{u.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-mono text-slate-600 bg-dark/50 px-2 py-1 rounded border border-white/5">{u.id.substring(0,12)}...</span>
                                 <button onClick={() => handleCopy(u.id)} className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all border border-white/5">{copiedId === u.id ? <Check size={12} /> : <Copy size={12} />}</button>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-slate-400">{new Date(u.joinedDate).toLocaleDateString()}</td>
                           <td className="px-8 py-6 text-right">
                              {!u.roles.includes('management') && isManagement && <button onClick={() => confirmAction({ title: 'Delete Account', message: `Remove ${u.name}?`, onConfirm: () => deleteUser(u.id) })} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>}
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
                  <thead className="bg-dark/30 text-[9px] font-black uppercase text-slate-500">
                     <tr><th className="px-8 py-5 text-left">Username</th><th className="px-8 py-5 text-left">Current Authority</th><th className="px-8 py-5 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors text-xs">
                           <td className="px-8 py-6"><p className="text-white font-black uppercase italic text-xs leading-none">{cleanName(u.name)}</p><p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">{u.email}</p></td>
                           <td className="px-8 py-6"><div className="flex flex-wrap gap-1">{u.roles.map(r => (<span key={r} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-black uppercase italic tracking-tighter text-slate-400">{r}</span>))}</div></td>
                           <td className="px-8 py-6 text-right"><button onClick={() => setUserForRoles(u)} className="px-4 py-2 bg-white/5 hover:bg-brand hover:text-dark text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 flex items-center gap-2 ml-auto shadow-sm"><Settings2 size={14} /> Change Roles</button></td>
                        </tr>
                     ))}
                  </tbody>
              </table>
           </div>
        )}

        {activeTab === 'reviews' && ( pendingReviews.length === 0 ? <p className="text-center py-20 text-slate-500">No reviews pending moderation.</p> :
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingReviews.map(r => (
                 <div key={r.id} className="p-8 bg-surface rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand text-dark rounded-xl flex items-center justify-center font-black">{r.avatar}</div>
                          <div>
                             <h4 className="text-xs font-black uppercase text-white italic">{r.author}</h4>
                             <p className="text-[9px] text-slate-500">Coach: {cleanName(users.find(u => u.id === r.trainerId)?.name)}</p>
                          </div>
                       </div>
                       <div className="flex text-brand gap-0.5">{[...Array(r.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}</div>
                    </div>
                    <p className="text-xs text-slate-400 italic mb-10 leading-relaxed">"{r.text}"</p>
                    <div className="flex gap-4">
                       <button onClick={() => updateReview(r.id, { isPublished: true })} className="flex-1 py-4 bg-brand text-dark rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-brand/10">Approve & Publish</button>
                       <button onClick={() => deleteReview(r.id)} className="px-6 py-4 bg-white/5 text-slate-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash size={18} /></button>
                    </div>
                 </div>
              ))}
           </div>
        )}

      </div>

      {/* Overlays */}
      {pendingSettlementId && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-surface border border-white/10 rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative text-center">
               <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
               <div className="w-20 h-20 bg-brand/10 text-brand rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand/10">{isSettling ? <Loader2 size={32} className="animate-spin" /> : <DollarSign size={32} />}</div>
               <h2 className="text-2xl font-black uppercase italic text-white mb-2">Finalize Settlement</h2>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic mb-10">Select Payment Method</p>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={async () => { setIsSettling(true); await updateBooking(pendingSettlementId, { status: 'completed', paymentMethod: 'cash' }); setPendingSettlementId(null); setIsSettling(false); }} className="p-8 bg-white/5 rounded-3xl hover:bg-brand/5 border border-white/5 flex flex-col items-center gap-4 transition-all group"><Banknote className="text-brand group-hover:scale-110 transition-transform" size={24} /><span className="text-[11px] font-black uppercase text-white">Cash</span></button>
                  <button onClick={async () => { setIsSettling(true); await updateBooking(pendingSettlementId, { status: 'completed', paymentMethod: 'card' }); setPendingSettlementId(null); setIsSettling(false); }} className="p-8 bg-white/5 rounded-3xl hover:bg-brand/5 border border-white/5 flex flex-col items-center gap-4 transition-all group"><CreditCard className="text-brand group-hover:scale-110 transition-transform" size={24} /><span className="text-[11px] font-black uppercase text-white">Card</span></button>
               </div>
               <button onClick={() => setPendingSettlementId(null)} className="mt-10 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-all">Cancel</button>
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
