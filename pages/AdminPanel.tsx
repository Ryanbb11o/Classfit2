
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, X, Loader2, TrendingUp, Wallet, Check, Ban, Calendar, User, Phone, ShieldCheck, Key, Settings2, ChevronDown, ChevronUp, Info, Edit3, Save, Languages, ExternalLink, ThumbsUp, Activity, BarChart3 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { User as UserType, Booking, Review } from '../types';
import RoleManagementModal from '../components/RoleManagementModal';

const AdminPanel: React.FC = () => {
  const { language, bookings, refreshData, updateBooking, updateUser, deleteUser, isAdmin, isManagement, users, reviews, deleteReview, updateReview, confirmAction, deleteBooking, currentUser } = useAppContext();
  const location = useLocation();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'bookings' | 'trainers' | 'applications' | 'users' | 'roles' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userForRoles, setUserForRoles] = useState<UserType | null>(null);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab as any);
  }, [location.state]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const pendingApps = users.filter(u => u.roles?.includes('trainer_pending'));
  const pendingReviews = reviews.filter(r => !r.isPublished);
  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  // Aggregate Stats
  const stats = useMemo(() => {
    const totalSessions = bookings.length;
    const completedSessions = bookings.filter(b => b.status === 'completed').length;
    const confirmedSessions = bookings.filter(b => b.status === 'confirmed').length;
    const pendingSessions = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + b.price, 0);
    const projectedRevenue = bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + b.price, 0);
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return { totalSessions, completedSessions, confirmedSessions, pendingSessions, totalRevenue, projectedRevenue, completionRate };
  }, [bookings]);

  if (!isAdmin) return <div className="p-20 text-center text-white">{t.accessDenied}</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">Management Console</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-xl bg-white/5 ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}><RefreshCw size={18} /></button>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[9px] mt-2 italic">Official Control Center</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: BarChart3, label: 'Stats' },
              { id: 'finance', icon: FileSpreadsheet, label: 'Finance', badge: awaitingPaymentList.length },
              { id: 'bookings', icon: ListFilter, label: 'Sessions' },
              { id: 'applications', icon: UserCheck, label: 'Recruits', badge: pendingApps.length },
              { id: 'users', icon: Users, label: 'Registry' },
              { id: 'reviews', icon: Star, label: 'Moderation', badge: pendingReviews.length }
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
                   <p className="text-[9px] font-black uppercase mb-1 opacity-60">All-Time Revenue</p>
                   <p className="text-3xl font-black italic tracking-tighter">{stats.totalRevenue.toFixed(0)} BGN</p>
                </div>
                <div className="p-6 bg-surface border border-white/5 rounded-[1.5rem]">
                   <p className="text-[9px] font-black uppercase mb-1 text-slate-500">Historical Sessions</p>
                   <p className="text-3xl font-black italic text-white tracking-tighter">{stats.totalSessions}</p>
                </div>
                <div className="p-6 bg-surface border border-white/5 rounded-[1.5rem]">
                   <p className="text-[9px] font-black uppercase mb-1 text-slate-500">Confirmed Queue</p>
                   <p className="text-3xl font-black italic text-white tracking-tighter">{stats.confirmedSessions}</p>
                </div>
                <div className="p-6 bg-surface border border-white/5 rounded-[1.5rem]">
                   <p className="text-[9px] font-black uppercase mb-1 text-slate-500">Active Members</p>
                   <p className="text-3xl font-black italic text-brand tracking-tighter">{users.length}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface rounded-[2rem] border border-white/5 p-8">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-3"><Activity size={16} className="text-brand"/> Performance Metrics</h3>
                   <div className="space-y-6">
                      <div className="flex justify-between items-end">
                         <span className="text-xs font-bold uppercase italic text-slate-300">Completion Rate</span>
                         <span className="text-2xl font-black text-white italic">{stats.completionRate.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-dark rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-brand transition-all duration-1000" style={{width: `${stats.completionRate}%`}}></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                         <div>
                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Completed</p>
                            <p className="text-lg font-black text-white">{stats.completedSessions}</p>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Upcoming</p>
                            <p className="text-lg font-black text-white">{stats.confirmedSessions}</p>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Total</p>
                            <p className="text-lg font-black text-white">{stats.totalSessions}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-surface rounded-[2rem] border border-white/5 p-8">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-3"><TrendingUp size={16} className="text-brand"/> Financial Projections</h3>
                   <div className="space-y-6">
                      <div className="p-4 bg-dark/40 rounded-xl border border-white/5 flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase text-slate-500">Confirmed (Unpaid)</span>
                         <span className="text-lg font-black text-white italic">{stats.projectedRevenue.toFixed(0)} BGN</span>
                      </div>
                      <div className="p-4 bg-dark/40 rounded-xl border border-white/5 flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase text-slate-500">Average Session Value</span>
                         <span className="text-lg font-black text-brand italic">{(stats.totalRevenue / (stats.completedSessions || 1)).toFixed(2)} BGN</span>
                      </div>
                      <p className="text-[9px] text-slate-600 italic font-medium">Calculations based on verified historical session data and active confirmed booking queue.</p>
                   </div>
                </div>
             </div>
           </div>
        )}

        {activeTab === 'finance' && (
           <div className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-dark/20 text-[9px] font-black uppercase text-slate-500">
                    <tr><th className="p-5">Session</th><th className="p-5">Client</th><th className="p-5">Amount</th><th className="p-5">Status</th><th className="p-5">Action</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-[10px]">
                    {bookings.filter(b => b.status === 'trainer_completed' || b.status === 'completed').map(b => (
                       <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-bold">{b.date} @ {b.time}</td>
                          <td className="p-5 uppercase italic">{b.customerName}</td>
                          <td className="p-5 font-black text-brand">{b.price.toFixed(2)} BGN</td>
                          <td className="p-5 uppercase font-black">{b.status}</td>
                          <td className="p-5">
                             {b.status === 'trainer_completed' && (
                               <button onClick={() => updateBooking(b.id, { status: 'completed' })} className="px-3 py-1.5 bg-brand text-dark rounded-lg text-[8px] font-black uppercase">Verify Pay</button>
                             )}
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
                    <tr><th className="p-5">Client</th><th className="p-5">Date</th><th className="p-5">Time</th><th className="p-5">Status</th><th className="p-5">Manage</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-[10px] italic">
                    {bookings.map(b => (
                       <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-black uppercase">{b.customerName}</td>
                          <td className="p-5 text-slate-400">{b.date}</td>
                          <td className="p-5 text-slate-400">{b.time}</td>
                          <td className="p-5">
                             <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${b.status === 'completed' ? 'text-brand' : 'text-slate-500'}`}>{b.status}</span>
                          </td>
                          <td className="p-5">
                             <button onClick={() => confirmAction({ title: 'Delete Booking', message: 'Permanent removal?', onConfirm: () => deleteBooking(b.id) })} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={12}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

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

        {activeTab === 'reviews' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReviews.length === 0 ? <p className="text-center col-span-2 py-20 text-slate-500 italic uppercase font-black text-[9px]">Registry clear. No pending reviews.</p> : pendingReviews.map(r => (
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
    </div>
  );
};

export default AdminPanel;
