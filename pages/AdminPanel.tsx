
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, X, Loader2, TrendingUp, Wallet, Check, Ban, Calendar, User, Phone, ShieldCheck, Key, Settings2, ChevronDown, ChevronUp, Info, Edit3, Save, Languages, ExternalLink, ThumbsUp } from 'lucide-react';
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
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

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
    return `${startTime} - ${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const pendingApps = users.filter(u => u.roles?.includes('trainer_pending'));
  const pendingReviews = reviews.filter(r => !r.isPublished);
  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  if (!isAdmin) return <div className="p-20 text-center text-white">{t.accessDenied}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none">Admin Console</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-xl bg-white/5 ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}><RefreshCw size={18} /></button>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">Official Control Center</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Stats' },
              { id: 'finance', icon: FileSpreadsheet, label: 'Finance', badge: awaitingPaymentList.length },
              { id: 'bookings', icon: ListFilter, label: 'All Sessions' },
              { id: 'applications', icon: UserCheck, label: 'Recruits', badge: pendingApps.length },
              { id: 'users', icon: Users, label: 'Registry' },
              { id: 'roles', icon: Key, label: 'Authority' },
              { id: 'reviews', icon: Star, label: 'Moderation', badge: pendingReviews.length }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <tab.icon size={12} /> {tab.label}
                    {tab.badge ? <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-red-500 text-white">{tab.badge}</span> : null}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-8 bg-brand text-dark rounded-[2.5rem] shadow-xl">
                 <p className="text-[10px] font-black uppercase mb-2 opacity-60">Revenue Logged</p>
                 <p className="text-4xl font-black italic tracking-tighter">{bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0).toFixed(0)} BGN</p>
              </div>
              <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem]">
                 <p className="text-[10px] font-black uppercase mb-2 text-slate-500">Active Bookings</p>
                 <p className="text-4xl font-black italic text-white tracking-tighter">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
              <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem]">
                 <p className="text-[10px] font-black uppercase mb-2 text-slate-500">Total Users</p>
                 <p className="text-4xl font-black italic text-white tracking-tighter">{users.length}</p>
              </div>
              <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem]">
                 <p className="text-[10px] font-black uppercase mb-2 text-slate-500">Pending Reviews</p>
                 <p className="text-4xl font-black italic text-brand tracking-tighter">{pendingReviews.length}</p>
              </div>
           </div>
        )}

        {activeTab === 'finance' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-dark/20 text-[10px] font-black uppercase text-slate-500">
                    <tr><th className="p-6">Session</th><th className="p-6">Client</th><th className="p-6">Amount</th><th className="p-6">Status</th><th className="p-6">Action</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-xs">
                    {bookings.filter(b => b.status === 'trainer_completed' || b.status === 'completed').map(b => (
                       <tr key={b.id}>
                          <td className="p-6 font-bold">{b.date} @ {b.time}</td>
                          <td className="p-6 uppercase italic">{b.customerName}</td>
                          <td className="p-6 font-black text-brand">{b.price.toFixed(2)} BGN</td>
                          <td className="p-6 uppercase font-black text-[10px]">{b.status}</td>
                          <td className="p-6">
                             {b.status === 'trainer_completed' && (
                               <button onClick={() => updateBooking(b.id, { status: 'completed' })} className="px-4 py-2 bg-brand text-dark rounded-lg text-[10px] font-black uppercase">Verify Pay</button>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {activeTab === 'bookings' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-dark/20 text-[10px] font-black uppercase text-slate-500">
                    <tr><th className="p-6">Client</th><th className="p-6">Date</th><th className="p-6">Time</th><th className="p-6">Status</th><th className="p-6">Manage</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-xs italic">
                    {bookings.map(b => (
                       <tr key={b.id}>
                          <td className="p-6 font-black uppercase">{b.customerName}</td>
                          <td className="p-6 text-slate-400">{b.date}</td>
                          <td className="p-6 text-slate-400">{b.time}</td>
                          <td className="p-6">
                             <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-slate-500'}`}>{b.status}</span>
                          </td>
                          <td className="p-6">
                             <button onClick={() => confirmAction({ title: 'Delete Booking', message: 'Permanent removal?', onConfirm: () => deleteBooking(b.id) })} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={14}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {activeTab === 'applications' && (
           <div className="grid grid-cols-1 gap-4">
              {pendingApps.length === 0 ? <p className="text-center py-20 text-slate-500">No pending coach applications.</p> : pendingApps.map(u => (
                 <div key={u.id} className="p-8 bg-surface rounded-[2.5rem] border border-white/5 flex justify-between items-center">
                    <div>
                       <h3 className="text-xl font-black uppercase italic text-white mb-1">{cleanName(u.name)}</h3>
                       <p className="text-[10px] text-brand font-black uppercase mb-4">{u.roles.includes('trainer_pending') ? 'Awaiting Promotion' : 'Recruit'}</p>
                       <p className="text-xs text-slate-500 max-w-md italic">{u.bio || 'No details provided.'}</p>
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => updateUser(u.id, { roles: ['user', 'trainer'] })} className="px-6 py-3 bg-brand text-dark rounded-xl text-[10px] font-black uppercase shadow-lg">Approve Coach</button>
                       <button onClick={() => confirmAction({ title: 'Reject Application', message: 'Clear recruiter info?', onConfirm: () => deleteUser(u.id) })} className="px-6 py-3 bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase border border-white/10">Reject</button>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {activeTab === 'users' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-dark/20 text-[10px] font-black uppercase text-slate-500">
                    <tr><th className="p-6">User</th><th className="p-6">Email</th><th className="p-6">Roles</th><th className="p-6">Joined</th><th className="p-6">Actions</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-xs italic">
                    {users.map(u => (
                       <tr key={u.id}>
                          <td className="p-6 font-black uppercase">{cleanName(u.name)}</td>
                          <td className="p-6 text-slate-400">{u.email}</td>
                          <td className="p-6 flex gap-1">
                             {u.roles.map(r => <span key={r} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase">{r}</span>)}
                          </td>
                          <td className="p-6 text-slate-500">{u.joinedDate.split('T')[0]}</td>
                          <td className="p-6 flex gap-2">
                             <button onClick={() => setUserForRoles(u)} className="p-2 bg-white/5 rounded-lg text-brand hover:bg-brand hover:text-dark transition-all"><Settings2 size={14}/></button>
                             <button onClick={() => confirmAction({ title: 'Delete User', message: 'Delete entire account?', onConfirm: () => deleteUser(u.id) })} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={14}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {activeTab === 'reviews' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReviews.length === 0 ? <p className="text-center col-span-2 py-20 text-slate-500 italic uppercase font-black text-[10px]">No reviews pending moderation.</p> : pendingReviews.map(r => (
                 <div key={r.id} className="p-6 bg-surface rounded-3xl border border-yellow-500/20 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-black uppercase italic text-white text-sm">{r.author}</h4>
                       <div className="flex text-brand">
                          {[...Array(r.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor"/>)}
                       </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 italic">"{r.text}"</p>
                    <div className="flex gap-2">
                       <button onClick={() => updateReview(r.id, { isPublished: true })} className="flex-1 py-2 bg-brand text-dark rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2"><ThumbsUp size={12}/> Approve</button>
                       <button onClick={() => deleteReview(r.id)} className="flex-1 py-2 bg-white/5 text-red-500 rounded-lg text-[10px] font-black uppercase border border-red-500/10 hover:bg-red-500 hover:text-white transition-all">Delete</button>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {activeTab === 'roles' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 p-10 text-center">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-6"><Key size={32}/></div>
              <h3 className="text-xl font-black uppercase italic text-white mb-2">Authority Registry</h3>
              <p className="text-slate-500 text-xs mb-8 italic">Manage role delegation and system access via the Member Registry tab settings.</p>
              <button onClick={() => setActiveTab('users')} className="px-8 py-4 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Open User Registry</button>
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
