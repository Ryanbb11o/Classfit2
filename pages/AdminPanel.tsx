
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Check, X, ShieldAlert, CheckCircle2, DollarSign, CreditCard, Banknote, LayoutDashboard, ListFilter, FileSpreadsheet, TrendingUp, Phone, Loader2, Trash2, Users, Shield, RefreshCw, History, Briefcase, CheckCircle, ArrowRight, AlertTriangle, Mail, Edit, ChevronDown, Save, CreditCard as CardIcon, Wallet, Percent, UserCheck, Eye, QrCode } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { Trainer, User as UserType, Booking } from '../types';
import { useLocation } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, isAdmin, users, deleteUser, updateUser, currentUser, refreshData, confirmAction } = useAppContext();
  const t = TRANSLATIONS[language];
  const location = useLocation();
  
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', image: '', specialty: '', commissionRate: 0 });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'trainers' | 'finance' | 'users' | 'applications'>('overview');
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
    
    // Find trainer to get their current commission rate
    const trainer = users.find(u => u.id === booking.trainerId);
    const rate = trainer?.commissionRate || 25;
    const commAmt = (booking.price * rate) / 100;

    try {
      await updateBooking(id, { 
          status: 'completed', 
          paymentMethod: method,
          commissionAmount: commAmt
      });
      console.log("Payment successfully logged for booking:", id);
    } catch (err) {
      console.error("Failed to update booking status:", err);
      alert("Error saving payment. Check console.");
    }
  };

  const handleApproveTrainer = (id: string) => {
    confirmAction({
      title: 'Approve Trainer',
      message: 'Are you sure you want to approve this professional?',
      onConfirm: async () => {
        await updateUser(id, { 
            role: 'trainer', 
            approvedBy: currentUser?.name || 'Admin',
            commissionRate: 25 
        });
      }
    });
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) return;
    confirmAction({
      title: t.sure,
      message: 'This will permanently remove the user account.',
      onConfirm: async () => {
        await deleteUser(id);
      }
    });
  };

  const handleDeleteBooking = (id: string) => {
    confirmAction({
      title: t.sure,
      message: 'This will delete the booking from the records.',
      onConfirm: async () => {
        await deleteBooking(id);
      }
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
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black uppercase italic text-white leading-none tracking-tighter">{t.adminPanel}</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-full hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin text-brand' : 'text-slate-500'}`}>
                <RefreshCw size={18} />
             </button>
          </div>
          <p className="text-slate-400 font-medium italic mt-2">ClassFit Management System • бул. „Осми приморски полк“ 128</p>
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
                 <p className="text-[10px] font-black uppercase mb-4 opacity-60 tracking-widest">Total Revenue</p>
                 <p className="text-4xl font-black italic">{totalIncome} <span className="text-sm">BGN</span></p>
              </div>
              <div className="p-8 bg-surface border border-white/5 text-white rounded-[2rem]">
                 <p className="text-[10px] font-black uppercase mb-4 text-slate-500 tracking-widest">Club Commission</p>
                 <p className="text-4xl font-black italic text-brand">{totalCommission.toFixed(0)} <span className="text-sm text-slate-500">BGN</span></p>
              </div>
              {awaitingPaymentList.length > 0 && (
                <div className="md:col-span-2 p-8 bg-red-500/10 border border-red-500/30 rounded-[2rem] flex items-center justify-between shadow-2xl">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                         <Wallet size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase italic text-white mb-1">Pay Requests Sent</h3>
                        <p className="text-slate-400 text-xs font-medium">{awaitingPaymentList.length} sessions waiting for payment method.</p>
                      </div>
                   </div>
                   <button onClick={() => setActiveTab('bookings')} className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-white hover:text-red-500 transition-all">Verify Now</button>
                </div>
              )}
           </div>
        )}

        {activeTab === 'bookings' && (
            <div className="space-y-6">
                {awaitingPaymentList.length > 0 && (
                    <div className="space-y-4">
                         <h3 className="text-brand font-black uppercase italic text-sm px-4 flex items-center gap-2">
                             <AlertTriangle size={16} /> Awaiting Payment Logging
                         </h3>
                         {awaitingPaymentList.map(booking => (
                            <div key={booking.id} className="bg-surface p-6 rounded-[2rem] border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Wallet size={24} /></div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase italic">{booking.customerName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{booking.date} @ {booking.time}</p>
                                        <div className="mt-1 text-brand font-black text-[10px] italic">CODE: {booking.checkInCode}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Training Price</p>
                                        <p className="text-brand font-black italic">{booking.price} BGN</p>
                                    </div>
                                    <button onClick={() => handleFinish(booking.id, 'cash')} className="px-5 py-3 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1 hover:scale-105 transition-all"><Banknote size={14} /> Cash</button>
                                    <button onClick={() => handleFinish(booking.id, 'card')} className="px-5 py-3 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1 hover:scale-105 transition-all"><CardIcon size={14} /> Card</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden">
                   <div className="p-6 border-b border-white/5 bg-white/5 font-black uppercase italic text-xs text-slate-400">Upcoming Schedule</div>
                   <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-dark/30">
                              <tr className="text-[10px] font-black uppercase text-slate-500">
                                 <th className="px-8 py-4">Client</th>
                                 <th className="px-8 py-4 text-center">Check-in Code</th>
                                 <th className="px-8 py-4">Date & Time</th>
                                 <th className="px-8 py-4">Status</th>
                                 <th className="px-8 py-4 text-right">Action</th>
                              </tr>
                           </thead>
                            <tbody className="divide-y divide-white/5">
                                {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').map(b => (
                                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-5 text-xs font-bold text-white uppercase italic">{b.customerName}</td>
                                        <td className="px-8 py-5 text-center">
                                           <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-black italic rounded-lg border border-brand/20">
                                              {b.checkInCode}
                                           </span>
                                        </td>
                                        <td className="px-8 py-5 text-[10px] text-slate-500 font-black uppercase tracking-widest">{b.date} | {b.time}</td>
                                        <td className="px-8 py-5"><span className={`px-2 py-1 ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-brand/10 text-brand'} text-[9px] font-black rounded uppercase`}>{b.status}</span></td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => handleDeleteBooking(b.id)} className="p-2 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
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
                   <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2"><Briefcase className="text-brand" size={20} /> Active Professionals</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase text-slate-500 border-b border-white/5 bg-dark/20">
                                <th className="px-8 py-6">Trainer Information</th>
                                <th className="px-8 py-6">Approval Tracker</th>
                                <th className="px-8 py-6">Commission Structure</th>
                                <th className="px-8 py-6 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeTrainers.map(tr => (
                                <tr key={tr.id} className="hover:bg-white/5 group transition-colors">
                                    <td className="px-8 py-6 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/5">
                                            <img src={tr.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover bg-dark" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase italic leading-none mb-1">{cleanName(tr.name)}</p>
                                            <p className="text-[9px] text-brand font-bold uppercase tracking-wider">{tr.name.match(/\((.*)\)/)?.[1] || 'Club Instructor'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield size={12} className="text-blue-400" />
                                            <span className="text-[10px] font-black uppercase text-slate-300">Approved by: <span className="text-white">{tr.approvedBy || 'System'}</span></span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">Joined: {new Date(tr.joinedDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand text-dark text-[10px] font-black rounded-full border border-brand/20 w-fit">
                                                <Percent size={10} /> {tr.commissionRate}% Club Share
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-bold ml-1 uppercase italic">Trainer earns {(100 - (tr.commissionRate || 0))}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => handleEditUserClick(tr)} 
                                            className="px-5 py-3 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand hover:text-dark transition-all flex items-center gap-2 ml-auto shadow-sm group-hover:bg-white/10"
                                        >
                                            <Eye size={14} /> View Details
                                        </button>
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
             <div className="bg-surface border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
                <button onClick={() => setEditingUser(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full"><X size={20} /></button>
                
                <h2 className="text-2xl font-black uppercase italic text-white mb-2 leading-none">Trainer Management</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Update profile and commission details</p>
                
                <form onSubmit={handleSaveUser} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Trainer Name</label>
                            <input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Specialty</label>
                            <input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand" value={editForm.specialty} onChange={e => setEditForm({...editForm, specialty: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="p-6 bg-brand/5 border border-brand/20 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand">Gym Commission Share</label>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Current: {editingUser.commissionRate}%</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="0" max="100"
                                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-4 text-white font-black text-xl outline-none focus:border-brand pr-12" 
                                value={editForm.commissionRate} 
                                onChange={e => setEditForm({...editForm, commissionRate: parseInt(e.target.value) || 0})} 
                            />
                            <Percent size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand" />
                        </div>
                        <p className="text-[9px] text-slate-500 mt-3 font-medium italic">This is the percentage of each booking that goes to the gym. New trainers default to 25%.</p>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Profile Image URL</label>
                        <input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} />
                    </div>

                    <button type="submit" disabled={isSavingUser} className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all shadow-xl shadow-brand/10">
                        {isSavingUser ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Trainer Info
                    </button>
                </form>
             </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;
