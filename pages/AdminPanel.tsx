
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, ListFilter, MessageSquare, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, Percent, Eye, X, Save, Loader2, TrendingUp, QrCode, Calendar, User, Mail, Shield } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { User as UserType, Booking, Review } from '../types';

const AdminPanel: React.FC = () => {
  const { language, bookings, reviews, updateReview, deleteReview, updateBooking, deleteBooking, isAdmin, users, deleteUser, updateUser, currentUser, refreshData, confirmAction } = useAppContext();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'trainers' | 'finance' | 'users' | 'applications' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', image: '', specialty: '', commissionRate: 0 });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const activeTrainers = users.filter(u => u.role === 'trainer');
  const pendingApplications = users.filter(u => u.role === 'trainer_pending');
  const pendingReviews = reviews.filter(r => !r.isPublished);
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const totalIncome = completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const totalCommission = completedBookings.reduce((sum, b) => sum + (Number(b.commissionAmount) || 0), 0);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const handleApproveReview = (id: string) => {
    confirmAction({
      title: 'Approve Review',
      message: 'This review will become visible on the public booking page.',
      onConfirm: async () => await updateReview(id, { isPublished: true })
    });
  };

  const handleApproveTrainer = (id: string) => {
    confirmAction({
      title: 'Approve Trainer',
      message: 'This member will be promoted to professional coach status.',
      onConfirm: async () => await updateUser(id, { role: 'trainer', commissionRate: 25, approvedBy: currentUser?.name || 'Admin' })
    });
  };

  const handleRejectTrainer = (id: string) => {
    confirmAction({
      title: 'Reject Application',
      message: 'Remove this pending trainer request?',
      onConfirm: async () => await deleteUser(id)
    });
  };

  const handleEditUserClick = (u: UserType) => {
    setEditingUser(u);
    const match = u.name.match(/^(.*)\s\((.*)\)$/);
    setEditForm({
        name: match ? match[1] : u.name,
        specialty: match ? match[2] : '',
        phone: u.phone || '',
        bio: u.bio || '',
        image: u.image || '',
        commissionRate: u.commissionRate || 0
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
        const finalName = editForm.specialty ? `${editForm.name} (${editForm.specialty})` : editForm.name;
        await updateUser(editingUser.id, {
            name: finalName, phone: editForm.phone, bio: editForm.bio, image: editForm.image, commissionRate: editForm.commissionRate
        });
        setEditingUser(null);
    } finally {
        setIsSavingUser(false);
    }
  };

  const cleanName = (name: string) => name.split('(')[0].trim();

  if (!isAdmin) return <div className="p-20 text-center text-white">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black uppercase italic text-white leading-none tracking-tighter">Admin Panel</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-full hover:bg-white/10 ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}>
                <RefreshCw size={18} />
             </button>
          </div>
          <p className="text-slate-400 font-medium italic mt-2">ClassFit Management • Varna Base</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-surface p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'bookings', icon: ListFilter, label: 'Reception', badge: awaitingPaymentList.length + bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length },
              { id: 'reviews', icon: MessageSquare, label: 'Moderation', badge: pendingReviews.length },
              { id: 'trainers', icon: Briefcase, label: 'Trainers' },
              { id: 'applications', icon: UserCheck, label: 'Apps', badge: pendingApplications.length },
              { id: 'finance', icon: FileSpreadsheet, label: 'Finance' },
              { id: 'users', icon: Users, label: 'Members' }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <tab.icon size={14} /> {tab.label}
                    {tab.badge ? <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] bg-red-500 text-white">{tab.badge}</span> : null}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-8 bg-brand text-dark rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                 <div className="absolute top-4 right-4 text-dark/20 group-hover:scale-125 transition-transform"><TrendingUp size={48} /></div>
                 <p className="text-[10px] font-black uppercase mb-4 opacity-60 tracking-widest">Gross Revenue</p>
                 <p className="text-4xl font-black italic">{totalIncome.toFixed(2)} <span className="text-sm font-bold">BGN</span></p>
              </div>
              <div className="p-8 bg-surface border border-white/5 text-white rounded-[2.5rem] relative overflow-hidden group">
                 <div className="absolute top-4 right-4 text-white/5 group-hover:scale-125 transition-transform"><MessageSquare size={48} /></div>
                 <p className="text-[10px] font-black uppercase mb-4 text-slate-500 tracking-widest">Moderation Queue</p>
                 <p className="text-4xl font-black italic text-brand">{pendingReviews.length}</p>
              </div>
              <div className="p-8 bg-surface border border-white/5 text-white rounded-[2.5rem] relative overflow-hidden group">
                 <div className="absolute top-4 right-4 text-white/5 group-hover:scale-125 transition-transform"><Users size={48} /></div>
                 <p className="text-[10px] font-black uppercase mb-4 text-slate-500 tracking-widest">Active Members</p>
                 <p className="text-4xl font-black italic">{users.filter(u => u.role === 'user').length}</p>
              </div>
              <div className="p-8 bg-surface border border-white/5 text-white rounded-[2.5rem] relative overflow-hidden group">
                 <div className="absolute top-4 right-4 text-white/5 group-hover:scale-125 transition-transform"><UserCheck size={48} /></div>
                 <p className="text-[10px] font-black uppercase mb-4 text-slate-500 tracking-widest">Coach Requests</p>
                 <p className="text-4xl font-black italic text-yellow-500">{pendingApplications.length}</p>
              </div>
           </div>
        )}

        {/* UNIFIED TABLE REGISTRY */}
        {activeTab !== 'overview' && activeTab !== 'reviews' && (
           <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in">
              <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                        {activeTab === 'bookings' && <ListFilter size={20} />}
                        {activeTab === 'trainers' && <Briefcase size={20} />}
                        {activeTab === 'finance' && <FileSpreadsheet size={20} />}
                        {activeTab === 'users' && <Users size={20} />}
                        {activeTab === 'applications' && <UserCheck size={20} />}
                    </div>
                    <h3 className="text-xl font-black uppercase italic text-white">{activeTab === 'bookings' ? 'Reception' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Registry</h3>
                 </div>
                 {activeTab === 'finance' && (
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Profit</p>
                       <p className="text-2xl font-black italic text-brand">{(totalIncome - totalCommission).toFixed(2)} BGN</p>
                    </div>
                 )}
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-dark/30 text-[9px] font-black uppercase text-slate-500 border-b border-white/5">
                        {activeTab === 'finance' && (
                           <tr>
                              <th className="px-8 py-5">Session Date</th>
                              <th className="px-8 py-5">Coach Name</th>
                              <th className="px-8 py-5">Client Name</th>
                              <th className="px-8 py-5 text-right">Revenue</th>
                              <th className="px-8 py-5 text-right">Commission</th>
                              <th className="px-8 py-5 text-center">Mode</th>
                           </tr>
                        )}
                        {activeTab === 'users' && (
                           <tr>
                              <th className="px-8 py-5">Full Member Details</th>
                              <th className="px-8 py-5">Email Address</th>
                              <th className="px-8 py-5 text-center">Auth Role</th>
                              <th className="px-8 py-5 text-right">Account Actions</th>
                           </tr>
                        )}
                        {activeTab === 'applications' && (
                           <tr>
                              <th className="px-8 py-5">Coach Applicant</th>
                              <th className="px-8 py-5">Contact Details</th>
                              <th className="px-8 py-5">Specialty</th>
                              <th className="px-8 py-5 text-right">Decision</th>
                           </tr>
                        )}
                        {activeTab === 'trainers' && (
                           <tr>
                              <th className="px-8 py-5">Professional Profile</th>
                              <th className="px-8 py-5">Commission Rate</th>
                              <th className="px-8 py-5">Verification</th>
                              <th className="px-8 py-5 text-right">Management</th>
                           </tr>
                        )}
                        {activeTab === 'bookings' && (
                           <tr>
                              <th className="px-8 py-5">Client Name</th>
                              <th className="px-8 py-5 text-center">Auth Code</th>
                              <th className="px-8 py-5">Session Schedule</th>
                              <th className="px-8 py-5">Log Status</th>
                              <th className="px-8 py-5 text-right">Ops</th>
                           </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-white">
                        {activeTab === 'finance' && completedBookings.map(b => (
                           <tr key={b.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5 font-medium text-slate-400">{b.date}</td>
                              <td className="px-8 py-5 font-black uppercase italic">{cleanName(users.find(u => u.id === b.trainerId)?.name || 'Coach')}</td>
                              <td className="px-8 py-5 text-slate-400">{b.customerName}</td>
                              <td className="px-8 py-5 text-right font-black">{Number(b.price).toFixed(2)}</td>
                              <td className="px-8 py-5 text-right text-brand font-bold">{Number(b.commissionAmount).toFixed(2)}</td>
                              <td className="px-8 py-5 text-center"><span className="px-2 py-1 bg-white/10 rounded text-[8px] font-black uppercase italic tracking-widest">{b.paymentMethod}</span></td>
                           </tr>
                        ))}
                        {activeTab === 'users' && users.map(u => (
                           <tr key={u.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5 flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-lg bg-white/5 overflow-hidden border border-white/5">
                                    <img src={u.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover" />
                                 </div>
                                 <p className="font-black uppercase italic">{cleanName(u.name)}</p>
                              </td>
                              <td className="px-8 py-5 text-slate-400">{u.email}</td>
                              <td className="px-8 py-5 text-center">
                                 <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : u.role === 'trainer' ? 'bg-brand/10 text-brand' : 'bg-white/10 text-slate-400'}`}>
                                    {u.role.replace('_', ' ')}
                                 </span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 {u.id !== currentUser?.id && <button onClick={() => deleteUser(u.id)} className="p-2 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={16} /></button>}
                              </td>
                           </tr>
                        ))}
                        {activeTab === 'applications' && pendingApplications.map(app => (
                            <tr key={app.id} className="hover:bg-white/5">
                                <td className="px-8 py-5 font-black uppercase italic text-white leading-none">{cleanName(app.name)}</td>
                                <td className="px-8 py-5 text-slate-400">{app.email} <br/> <span className="text-[10px]">{app.phone}</span></td>
                                <td className="px-8 py-5"><span className="text-yellow-500 font-bold uppercase text-[10px]">{app.name.match(/\((.*)\)/)?.[1] || 'Coach'}</span></td>
                                <td className="px-8 py-5 text-right flex gap-2 justify-end">
                                    <button onClick={() => handleApproveTrainer(app.id)} className="px-4 py-2 bg-brand text-dark rounded-lg text-[9px] font-black uppercase shadow-lg">Approve</button>
                                    <button onClick={() => handleRejectTrainer(app.id)} className="px-4 py-2 bg-white/5 text-slate-400 rounded-lg text-[9px] font-black uppercase hover:text-red-500 transition-all">Reject</button>
                                </td>
                            </tr>
                        ))}
                        {activeTab === 'trainers' && activeTrainers.map(tr => (
                           <tr key={tr.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5 flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-dark overflow-hidden border border-white/5">
                                    <img src={tr.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                    <p className="font-black uppercase italic leading-none mb-1">{cleanName(tr.name)}</p>
                                    <p className="text-[9px] text-brand font-black uppercase">{tr.name.match(/\((.*)\)/)?.[1] || 'Club Professional'}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-5"><span className="px-2 py-1 bg-brand text-dark rounded text-[8px] font-black uppercase">{tr.commissionRate}% Share</span></td>
                              <td className="px-8 py-5"><span className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Verified by Admin</span></td>
                              <td className="px-8 py-5 text-right"><button onClick={() => handleEditUserClick(tr)} className="px-4 py-2 bg-white/10 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-2 hover:bg-brand hover:text-dark transition-all ml-auto"><Eye size={14} /> Profile</button></td>
                           </tr>
                        ))}
                        {activeTab === 'bookings' && bookings.filter(b => b.status !== 'completed').map(b => (
                           <tr key={b.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5">
                                 <div className="font-black uppercase italic leading-none text-white mb-1">{b.customerName}</div>
                                 <div className="text-[9px] text-slate-500 uppercase tracking-widest">Coach: {cleanName(users.find(u => u.id === b.trainerId)?.name || 'Team')}</div>
                              </td>
                              <td className="px-8 py-5 text-center"><span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-black italic rounded-lg border border-brand/20">{b.checkInCode}</span></td>
                              <td className="px-8 py-5 text-slate-400">{b.date} | <span className="font-bold text-white">{b.time}</span></td>
                              <td className="px-8 py-5"><span className={`px-2 py-1 ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : b.status === 'trainer_completed' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-brand/10 text-brand'} text-[9px] font-black rounded uppercase`}>{b.status.replace('_', ' ')}</span></td>
                              <td className="px-8 py-5 text-right"><button onClick={() => deleteBooking(b.id)} className="p-2 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={16} /></button></td>
                           </tr>
                        ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === 'reviews' && (
            <div className="space-y-6">
                <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3">
                    <MessageSquare className="text-brand" /> Review Moderation
                </h3>
                {pendingReviews.length === 0 ? (
                    <div className="p-20 bg-surface/30 rounded-[3rem] border-2 border-dashed border-white/5 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">All feedback has been processed.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingReviews.map(review => (
                            <div key={review.id} className="bg-surface p-8 rounded-[2rem] border border-white/5 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand text-dark rounded-xl flex items-center justify-center font-black">{review.avatar}</div>
                                            <p className="text-xs font-black text-white uppercase italic tracking-tight">{review.author}</p>
                                        </div>
                                        <div className="flex text-brand">
                                            {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-300 italic mb-8 leading-relaxed">"{review.text}"</p>
                                </div>
                                <div className="flex gap-3 pt-6 border-t border-white/5">
                                    <button onClick={() => handleApproveReview(review.id)} className="flex-1 py-3 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg">Approve</button>
                                    <button onClick={() => deleteReview(review.id)} className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase border border-red-500/10 hover:bg-red-500 hover:text-white transition-all">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-surface border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
                <button onClick={() => setEditingUser(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full"><X size={20} /></button>
                <h2 className="text-2xl font-black uppercase italic text-white mb-2 leading-none tracking-tighter">Coach Management</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Update professional profile and financial terms</p>
                <form onSubmit={handleSaveUser} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-black uppercase text-slate-600 ml-2">Trainer Name</label><input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                        <div><label className="text-[10px] font-black uppercase text-slate-600 ml-2">Specialty</label><input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand" value={editForm.specialty} onChange={e => setEditForm({...editForm, specialty: e.target.value})} /></div>
                    </div>
                    <div className="p-6 bg-brand/5 border border-brand/20 rounded-2xl">
                        <div className="flex items-center justify-between mb-4"><label className="text-[10px] font-black uppercase text-brand">Club Commission Share</label><span className="text-[10px] font-black text-slate-500">Current: {editingUser.commissionRate}%</span></div>
                        <div className="relative"><input type="number" min="0" max="100" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-4 text-white font-black text-xl outline-none focus:border-brand pr-12" value={editForm.commissionRate} onChange={e => setEditForm({...editForm, commissionRate: parseInt(e.target.value) || 0})} /><Percent size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand" /></div>
                    </div>
                    <div><label className="text-[10px] font-black uppercase text-slate-600 ml-2">Public Image Link</label><input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} /></div>
                    <button type="submit" disabled={isSavingUser} className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl shadow-brand/10">{isSavingUser ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Commit Changes</button>
                </form>
             </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;
