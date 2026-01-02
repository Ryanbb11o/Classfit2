
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Check, X, ShieldAlert, CheckCircle2, DollarSign, CreditCard, Banknote, LayoutDashboard, ListFilter, FileSpreadsheet, TrendingUp, Phone, Loader2, Trash2, Users, Shield, RefreshCw, History, Briefcase, CheckCircle, ArrowRight, AlertTriangle, Mail, Edit, ChevronDown, Save, CreditCard as CardIcon, Wallet, Percent, UserCheck } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { Trainer, User as UserType, Booking } from '../types';
import { useLocation } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, isAdmin, users, deleteUser, updateUser, currentUser, refreshData } = useAppContext();
  const t = TRANSLATIONS[language];
  const location = useLocation();
  
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', image: '', specialty: '', commissionRate: 0 });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'trainers' | 'finance' | 'users' | 'applications'>('overview');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const awaitingPaymentList = bookings.filter(b => b.status === 'trainer_completed');
  const activeTrainers = users.filter(u => u.role === 'trainer');
  const pendingApplications = users.filter(u => u.role === 'trainer_pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const totalIncome = completedBookings.reduce((sum, b) => sum + b.price, 0);
  const totalCommission = completedBookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const handleFinish = async (id: string, method: 'card' | 'cash') => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    
    const trainer = users.find(u => u.id === booking.trainerId);
    const commissionRate = trainer?.commissionRate || 0;
    const commissionAmount = (booking.price * commissionRate) / 100;

    await updateBooking(id, { 
        status: 'completed', 
        paymentMethod: method,
        commissionAmount: commissionAmount
    });
    setCompletingId(null);
  };

  const handleApproveTrainer = async (id: string) => {
    if (window.confirm("Approve this user as a Trainer?")) {
        await updateUser(id, { 
            role: 'trainer', 
            approvedBy: currentUser?.name || 'Admin',
            commissionRate: 20 // Default commission
        });
    }
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
              name: finalName,
              phone: editForm.phone,
              bio: editForm.bio,
              image: editForm.image,
              commissionRate: editForm.commissionRate
          });
          setEditingUser(null);
      } catch (err) {
          alert("Error saving.");
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
          <h1 className="text-4xl font-black uppercase italic text-white mb-2">{t.adminPanel}</h1>
          <p className="text-slate-400 font-medium italic">ClassFit Management System</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-surface p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: LayoutDashboard, label: t.tabOverview },
              { id: 'bookings', icon: ListFilter, label: 'Bookings', badge: awaitingPaymentList.length },
              { id: 'trainers', icon: Briefcase, label: 'Trainers', badge: activeTrainers.length },
              { id: 'applications', icon: UserCheck, label: 'Apps', badge: pendingApplications.length },
              { id: 'finance', icon: FileSpreadsheet, label: 'Finance' },
              { id: 'users', icon: Users, label: t.tabUsers }
            ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark shadow-lg shadow-brand/10' : 'text-slate-400 hover:text-white'}`}
                >
                    <tab.icon size={14} /> {tab.label}
                    {tab.badge ? <span className={`ml-1 px-1.5 py-0.5 rounded text-[8px] ${tab.id === 'bookings' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white'}`}>{tab.badge}</span> : null}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-8 bg-brand text-dark rounded-[2rem] shadow-xl">
                 <p className="text-[10px] font-black uppercase mb-4 opacity-60">Total Revenue</p>
                 <p className="text-4xl font-black italic">{totalIncome} <span className="text-sm">BGN</span></p>
              </div>
              <div className="p-8 bg-surface border border-white/5 text-white rounded-[2rem]">
                 <p className="text-[10px] font-black uppercase mb-4 text-slate-500">Club Commission</p>
                 <p className="text-4xl font-black italic text-brand">{totalCommission.toFixed(0)} <span className="text-sm text-slate-500">BGN</span></p>
              </div>
              {awaitingPaymentList.length > 0 && (
                <div className="md:col-span-2 p-8 bg-red-500/10 border border-red-500/30 rounded-[2rem] flex items-center justify-between">
                   <div>
                      <h3 className="text-xl font-black uppercase italic text-white mb-1">Payment Alerts</h3>
                      <p className="text-slate-400 text-xs font-medium">{awaitingPaymentList.length} sessions need payment logging.</p>
                   </div>
                   <button onClick={() => setActiveTab('bookings')} className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase">Process Now</button>
                </div>
              )}
           </div>
        )}

        {activeTab === 'bookings' && (
            <div className="space-y-6">
                {awaitingPaymentList.map(booking => (
                    <div key={booking.id} className="bg-surface p-6 rounded-[2rem] border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center"><Wallet size={24} /></div>
                            <div>
                                <p className="text-xs font-black text-white uppercase italic">{booking.customerName} - {booking.date} @ {booking.time}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Trainer ID: {booking.trainerId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="text-right mr-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase">Total: <span className="text-brand">{booking.price} BGN</span></p>
                             </div>
                             <button onClick={() => handleFinish(booking.id, 'cash')} className="px-5 py-3 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1"><Banknote size={14} /> Cash</button>
                             <button onClick={() => handleFinish(booking.id, 'card')} className="px-5 py-3 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1"><CardIcon size={14} /> Card</button>
                        </div>
                    </div>
                ))}
                <div className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden">
                   <div className="p-6 border-b border-white/5 bg-white/5 font-black uppercase italic text-xs">Standard Bookings</div>
                   <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/5">
                                {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').map(b => (
                                    <tr key={b.id}>
                                        <td className="px-6 py-4 text-xs font-bold text-white uppercase italic">{b.customerName}</td>
                                        <td className="px-6 py-4 text-[10px] text-slate-500">{b.date} | {b.time}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-brand/10 text-brand text-[9px] font-black rounded uppercase">{b.status}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteBooking(b.id)} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                   </div>
                </div>
            </div>
        )}

        {activeTab === 'trainers' && (
            <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                   <h3 className="text-lg font-black uppercase italic text-white">Active Trainers Panel</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase text-slate-500 border-b border-white/5">
                                <th className="px-8 py-6">Trainer</th>
                                <th className="px-8 py-6">Approved By</th>
                                <th className="px-8 py-6">Commission</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeTrainers.map(tr => (
                                <tr key={tr.id} className="hover:bg-white/5">
                                    <td className="px-8 py-6 flex items-center gap-4">
                                        <img src={tr.image || DEFAULT_PROFILE_IMAGE} className="w-10 h-10 rounded-xl object-cover" />
                                        <div>
                                            <p className="text-xs font-black text-white uppercase italic">{cleanName(tr.name)}</p>
                                            <p className="text-[9px] text-brand font-bold uppercase">{tr.name.match(/\((.*)\)/)?.[1] || 'Instructor'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black uppercase text-slate-400">{tr.approvedBy || 'System'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-black rounded-full border border-brand/20">{tr.commissionRate}%</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button onClick={() => handleEditUserClick(tr)} className="px-4 py-2 bg-white/5 text-white rounded-lg text-[9px] font-black uppercase hover:bg-white hover:text-dark transition-all">Edit Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'applications' && (
            <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-white/5 font-black uppercase italic text-white">Pending Applications</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-white/5">
                            {pendingApplications.map(u => (
                                <tr key={u.id} className="hover:bg-white/5">
                                    <td className="px-8 py-6 text-xs font-black text-white uppercase italic">{u.name}</td>
                                    <td className="px-8 py-6 text-[10px] text-brand font-bold uppercase">{u.phone}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleApproveTrainer(u.id)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white"><Check size={16} /></button>
                                            <button onClick={() => deleteUser(u.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><X size={16} /></button>
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

      {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-surface border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative">
                <button onClick={() => setEditingUser(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={20} /></button>
                <h2 className="text-2xl font-black uppercase italic text-white mb-8">Edit Trainer Details</h2>
                <form onSubmit={handleSaveUser} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Name</label>
                            <input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Specialty</label>
                            <input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none" value={editForm.specialty} onChange={e => setEditForm({...editForm, specialty: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Gym Commission (%)</label>
                        <div className="relative">
                            <input type="number" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none pr-10" value={editForm.commissionRate} onChange={e => setEditForm({...editForm, commissionRate: parseInt(e.target.value)})} />
                            <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Profile Image URL</label>
                        <input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isSavingUser} className="w-full py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        {isSavingUser ? <Loader2 className="animate-spin" /> : <Save size={16} />} Save Trainer Info
                    </button>
                </form>
             </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;
