
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ListFilter, MessageSquare, Briefcase, UserCheck, FileSpreadsheet, Users, RefreshCw, Star, Trash2, Eye, X, Save, Loader2, TrendingUp, Wallet, Check, Ban, DollarSign, PieChart, History, CreditCard, Banknote, Calendar, Clock, User, Phone, Mail, ShieldCheck, AlertCircle, UserPlus, ShieldAlert, ChevronDown, Plus, Minus } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { User as UserType, Booking, UserRole } from '../types';

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
  const { language, bookings, refreshData, updateBooking, updateUser, deleteUser, isAdmin, users, confirmAction, currentUser } = useAppContext();
  const location = useLocation();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'trainers' | 'finance' | 'users' | 'applications' | 'reviews'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingSettlementId, setPendingSettlementId] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [viewingDossier, setViewingDossier] = useState<Booking | null>(null);
  const [activeRoleMenu, setActiveRoleMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveRoleMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pendingApps = users.filter(u => u.roles?.includes('trainer_pending'));

  const totalRevenue = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0), [completedBookings]);
  const coachPayouts = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.trainerEarnings) || 0), 0), [completedBookings]);
  const gymProfit = useMemo(() => completedBookings.reduce((sum, b) => sum + (Number(b.commissionAmount) || 0), 0), [completedBookings]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const handleExecuteSettlement = async (method: 'cash' | 'card') => {
    if (!pendingSettlementId) return;
    setIsSettling(true);
    try {
      await updateBooking(pendingSettlementId, { status: 'completed', paymentMethod: method });
      setPendingSettlementId(null);
    } catch (err) {
      alert("Settlement failed. Please try again.");
    } finally {
      setIsSettling(false);
    }
  };

  const handleToggleRole = (userId: string, targetRole: UserRole) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    let newRoles: UserRole[];
    const hasRole = user.roles.includes(targetRole);

    // Sticky Logic: Management role cannot be removed via UI
    if (hasRole && targetRole === 'management') {
      alert(language === 'bg' ? 'Ролята "Management" не може да бъде премахната от никого.' : 'The "Management" role cannot be removed by anyone.');
      return;
    }

    if (hasRole) {
      newRoles = user.roles.filter(r => r !== targetRole);
      if (newRoles.length === 0) newRoles = ['user'];
    } else {
      newRoles = Array.from(new Set([...user.roles, targetRole]));
    }

    confirmAction({
      title: hasRole ? 'Revoke Authority' : 'Grant Authority',
      message: `Update roles for ${user.name.split('(')[0].trim()}?`,
      onConfirm: async () => await updateUser(userId, { roles: newRoles })
    });
  };

  const handleDeleteUserAccount = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.roles.includes('management')) {
      alert(language === 'bg' ? 'Акаунти с роля "Management" не могат да бъдат изтривани.' : 'Accounts with the "Management" role cannot be deleted.');
      return;
    }

    confirmAction({
      title: 'Permanently Delete User',
      message: 'This action will remove the user profile and all associated data. This cannot be undone.',
      onConfirm: async () => await deleteUser(userId)
    });
  };

  const cleanName = (name: string | undefined) => (name || 'Member').split('(')[0].trim();

  // Updated Labels for Roles
  const roleOptions: { id: UserRole, label: string, color: string }[] = [
    { id: 'management', label: 'Management', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'admin', label: 'Web Admin', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    { id: 'trainer', label: 'Gym Coach', color: 'text-brand bg-brand/10 border-brand/20' },
    { id: 'user', label: 'Member', color: 'text-slate-400 bg-white/5 border-white/10' },
    { id: 'trainer_pending', label: 'Pending Coach', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' }
  ];

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
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">ClassFit Varna • Mir Stop</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-surface p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: LayoutDashboard, label: t.tabOverview },
              { id: 'finance', icon: FileSpreadsheet, label: t.tabAnalysis, badge: awaitingPaymentList.length },
              { id: 'bookings', icon: ListFilter, label: t.tabBookings },
              { id: 'trainers', icon: Briefcase, label: t.trainer },
              { id: 'applications', icon: UserCheck, label: t.tabRecruitment, badge: pendingApps.length },
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
                                 <button onClick={() => setPendingSettlementId(b.id)} className="px-4 py-2 bg-brand text-dark rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-brand/10 flex items-center gap-2"><Check size={14} /> Confirm Payment</button>
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

      {activeTab === 'users' && (
         <div className="animate-in slide-in-from-bottom-2 duration-500 pb-32">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center"><Users size={24} /></div>
                <div><h3 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none">User Directory</h3><p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic mt-1">Authority Management & Permissions</p></div>
            </div>
            
            <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-visible">
               <table className="w-full">
                  <thead className="bg-dark/30 text-[9px] font-black uppercase text-slate-500">
                     <tr>
                        <th className="px-8 py-5 text-left">Identity</th>
                        <th className="px-8 py-5 text-left">Joined</th>
                        <th className="px-8 py-5 text-left">Assigned Authority</th>
                        <th className="px-8 py-5 text-right">Security</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {users.length === 0 ? <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-bold italic">No user accounts found.</td></tr> : users.map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-dark border border-white/10 flex items-center justify-center text-brand font-black overflow-hidden shrink-0">
                                    <img src={user.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                    <p className="text-white font-black uppercase italic text-sm leading-none mb-1">{cleanName(user.name)}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{user.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-slate-400 text-xs font-bold uppercase tracking-widest">{new Date(user.joinedDate).toLocaleDateString()}</td>
                           <td className="px-8 py-6 relative overflow-visible">
                              <div className="flex flex-wrap gap-2 items-center">
                                 {user.roles.map(role => {
                                    const option = roleOptions.find(o => o.id === role);
                                    return (
                                       <span key={role} className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest italic border ${option?.color || 'bg-white/5 text-slate-400 border-white/10'}`}>
                                          {option?.label || role}
                                       </span>
                                    );
                                 })}
                                 
                                 <div className="relative inline-block ml-1">
                                    <button 
                                       onClick={() => setActiveRoleMenu(activeRoleMenu === user.id ? null : user.id)}
                                       className="p-1.5 rounded-lg bg-brand/10 text-brand border border-brand/20 hover:bg-brand hover:text-dark transition-all"
                                    >
                                       <Plus size={12} strokeWidth={3} />
                                    </button>

                                    {activeRoleMenu === user.id && (
                                       <div ref={menuRef} className="absolute top-full left-0 mt-2 w-52 bg-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                          <div className="p-3 border-b border-white/5 bg-white/5">
                                             <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic">Toggle Roles</p>
                                          </div>
                                          {roleOptions.map(option => {
                                             const isActive = user.roles.includes(option.id);
                                             return (
                                                <button 
                                                   key={option.id}
                                                   onClick={() => handleToggleRole(user.id, option.id)}
                                                   className={`w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all hover:bg-white/5 ${
                                                      isActive ? 'text-brand' : 'text-slate-400 hover:text-white'
                                                   }`}
                                                >
                                                   <span className="flex items-center gap-2">
                                                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-brand shadow-[0_0_8px_rgba(197,217,45,0.7)]' : 'bg-slate-700'}`}></div>
                                                      {option.label}
                                                   </span>
                                                   {isActive ? (
                                                      option.id === 'management' ? <ShieldCheck size={10} className="text-purple-400 opacity-50" /> : <X size={10} className="text-red-500" />
                                                   ) : (
                                                      <Plus size={10} className="opacity-40" />
                                                   )}
                                                </button>
                                             );
                                          })}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                 {!user.roles.includes('management') && (
                                    <button 
                                       onClick={() => handleDeleteUserAccount(user.id)}
                                       className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                       <Trash2 size={16} />
                                    </button>
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

      {activeTab === 'applications' && (
         <div className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center"><UserCheck size={24} /></div>
                <div><h3 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none">Recruitment Queue</h3><p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic mt-1">Pending Professional Coach Applications</p></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {pendingApps.length === 0 ? (
                  <div className="md:col-span-2 p-20 text-center bg-surface rounded-[3rem] border border-white/5 border-dashed">
                     <p className="text-slate-500 font-black uppercase tracking-widest italic">No pending applications at this time.</p>
                  </div>
               ) : pendingApps.map(app => (
                  <div key={app.id} className="p-8 bg-surface rounded-[3rem] border border-white/5 relative overflow-hidden group">
                     <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-[2rem] bg-dark border border-white/10 flex items-center justify-center text-2xl font-black text-brand uppercase">
                           {app.name.charAt(0)}
                        </div>
                        <div>
                           <h4 className="text-2xl font-black uppercase italic text-white leading-none mb-2">{cleanName(app.name)}</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest text-brand italic">{app.name.match(/\((.*)\)/)?.[1] || 'Candidate'}</p>
                        </div>
                     </div>
                     <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold"><Mail size={14} className="text-slate-600"/> {app.email}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold"><Phone size={14} className="text-slate-600"/> {app.phone}</div>
                        <p className="text-[10px] text-slate-500 italic leading-relaxed pt-4 border-t border-white/5">{app.bio}</p>
                     </div>
                     <div className="flex gap-4">
                        <button 
                           onClick={() => handleToggleRole(app.id, 'trainer')}
                           className="flex-1 py-4 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl shadow-brand/10 flex items-center justify-center gap-2"
                        >
                           <Check size={16} /> Hire Coach
                        </button>
                        <button 
                           onClick={() => handleToggleRole(app.id, 'trainer_pending')}
                           className="px-6 py-4 bg-white/5 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all"
                        >
                           <Ban size={16} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {activeTab === 'bookings' && (
         <div className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center"><Calendar size={24} /></div>
                <div><h3 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none">Gym Operations</h3><p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic mt-1">Global Live Schedule & Pending Requests</p></div>
            </div>
            
            <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden">
               <table className="w-full">
                  <thead className="bg-dark/30 text-[9px] font-black uppercase text-slate-500">
                     <tr>
                        <th className="px-8 py-5 text-left">Session</th>
                        <th className="px-8 py-5 text-left">Member</th>
                        <th className="px-8 py-5 text-left">Coach</th>
                        <th className="px-8 py-5 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {activeBookings.length === 0 ? <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-bold italic">No active operations scheduled.</td></tr> : activeBookings.map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                           <td className="px-8 py-6">
                              <p className="text-white font-bold text-xs">{b.date}</p>
                              <p className="text-[10px] text-slate-500 font-black uppercase italic">{b.time}</p>
                           </td>
                           <td className="px-8 py-6 text-white font-black uppercase italic text-xs tracking-tight">{b.customerName}</td>
                           <td className="px-8 py-6 text-slate-400 font-bold uppercase italic text-xs">{cleanName(users.find(u => u.id === b.trainerId)?.name)}</td>
                           <td className="px-8 py-6 text-right">
                              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest italic ${
                                 b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                 {b.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Payment Selection Overlay */}
      {pendingSettlementId && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-surface border border-white/10 rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative text-center">
               <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
               <div className="w-20 h-20 bg-brand/10 text-brand rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand/5">
                  {isSettling ? <Loader2 size={32} className="animate-spin" /> : <DollarSign size={32} />}
               </div>
               <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter mb-2">Finalize Settlement</h2>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic mb-10">Select customer's payment method</p>
               
               <div className="grid grid-cols-2 gap-4">
                  <button 
                     disabled={isSettling}
                     onClick={() => handleExecuteSettlement('cash')}
                     className="flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-brand hover:bg-brand/5 transition-all group disabled:opacity-50"
                  >
                     <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-dark transition-all">
                        <Banknote size={24} />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">Cash Payment</span>
                  </button>
                  <button 
                     disabled={isSettling}
                     onClick={() => handleExecuteSettlement('card')}
                     className="flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-brand hover:bg-brand/5 transition-all group disabled:opacity-50"
                  >
                     <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-dark transition-all">
                        <CreditCard size={24} />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">Card Payment</span>
                  </button>
               </div>
               
               <button 
                  disabled={isSettling}
                  onClick={() => setPendingSettlementId(null)} 
                  className="mt-10 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-all disabled:opacity-0"
               >
                  Cancel Process
               </button>
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
