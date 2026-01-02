
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, User, Briefcase, RefreshCw, AlertCircle, Link as LinkIcon, Check, DollarSign, ListFilter, LayoutDashboard, Settings, Camera, Save, Loader2, Zap, Star } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE, getTrainerReviews } from '../constants';

const TrainerDashboard: React.FC = () => {
  const { currentUser, bookings, updateBooking, updateUser, language, refreshData, isLoading, confirmAction } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'requests' | 'reviews' | 'profile'>('schedule');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editName, setEditName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  
  const initializedRef = useRef(false);
  const [linkedStaticId, setLinkedStaticId] = useState<string | null>(localStorage.getItem('trainer_link_id'));

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'trainer')) {
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    if (currentUser && !initializedRef.current) {
        const match = currentUser.name.match(/^(.*)\s\((.*)\)$/);
        if (match) {
            setEditName(match[1]);
            setEditSpecialty(match[2]);
        } else {
            setEditName(currentUser.name);
            setEditSpecialty('');
        }
        setEditImage(currentUser.image || '');
        setEditBio(currentUser.bio || '');
        setEditPhone(currentUser.phone || '');
        if (!currentUser.image) setActiveTab('profile');
        initializedRef.current = true;
    }
  }, [currentUser]);

  const handleLinkProfile = (id: string) => {
    setLinkedStaticId(id);
    localStorage.setItem('trainer_link_id', id);
    refreshData();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      setIsSaving(true);
      try {
          const fullName = editSpecialty ? `${editName} (${editSpecialty})` : editName;
          await updateUser(currentUser.id, {
              name: fullName,
              image: editImage || '', 
              bio: editBio,
              phone: editPhone
          });
      } catch (err: any) {
          console.error(err);
      } finally {
          setIsSaving(false);
      }
  };

  const handleAction = (bookingId: string, action: 'confirmed' | 'cancelled' | 'trainer_completed') => {
    const title = action === 'trainer_completed' ? 'Finish Session' : 'Confirm Request';
    const message = action === 'trainer_completed' 
        ? (language === 'bg' ? 'Маркиране като приключена? Администратор ще потвърди плащането.' : 'Mark as completed? An admin will confirm payment.')
        : `Mark this booking as ${action}?`;

    confirmAction({
      title,
      message,
      onConfirm: async () => {
        await updateBooking(bookingId, { status: action });
      }
    });
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-dark">
            <Loader2 className="animate-spin text-brand" size={40} />
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Loading Trainer Portal...</p>
        </div>
    );
  }

  if (!currentUser) return null;

  const myBookings = bookings.filter(b => b.trainerId === currentUser.id || b.trainerId === linkedStaticId);
  const activeBookings = myBookings.filter(b => b.status === 'confirmed');
  const pendingRequests = myBookings.filter(b => b.status === 'pending');
  const completedBookings = myBookings.filter(b => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);
  const myReviews = getTrainerReviews(currentUser.id, language);

  return (
    <div className="max-w-6xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div>
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-dark rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <Briefcase size={14} /> Trainer Portal
           </div>
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2 leading-none">
             {currentUser.name.split('(')[0].trim()}
           </h1>
           <p className="text-slate-400 font-medium italic">Manage your schedule and requests.</p>
        </div>
        <button onClick={handleRefresh} className={`p-3 bg-surface border border-white/10 rounded-xl hover:text-brand transition-all text-slate-400 ${isRefreshing ? 'animate-spin text-brand' : ''}`}>
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-surface p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pending Requests</span>
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white group-hover:bg-brand group-hover:text-dark transition-colors">
                  <AlertCircle size={18} />
               </div>
            </div>
            <div className="text-4xl font-black italic text-white relative z-10">{pendingRequests.length}</div>
         </div>
         <div className="bg-surface p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upcoming Sessions</span>
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white group-hover:bg-brand group-hover:text-dark transition-colors">
                  <Calendar size={18} />
               </div>
            </div>
            <div className="text-4xl font-black italic text-white relative z-10">{activeBookings.length}</div>
         </div>
         <div className="bg-surface p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Earnings</span>
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white group-hover:bg-brand group-hover:text-dark transition-colors">
                  <DollarSign size={18} />
               </div>
            </div>
            <div className="text-4xl font-black italic text-brand relative z-10">{totalEarnings} <span className="text-sm text-slate-500">BGN</span></div>
         </div>
      </div>

      <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden min-h-[500px]">
         <div className="border-b border-white/5 p-6 flex items-center gap-4 overflow-x-auto">
            <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white text-dark' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
               <LayoutDashboard size={14} /> My Schedule
            </button>
            <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'requests' ? 'bg-white text-dark' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
               <ListFilter size={14} /> Requests
               {pendingRequests.length > 0 && <span className="ml-2 bg-brand text-dark px-1.5 py-0.5 rounded text-[9px]">{pendingRequests.length}</span>}
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'reviews' ? 'bg-white text-dark' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
               <Star size={14} /> Reviews
            </button>
            <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white text-dark' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
               <Settings size={14} /> Profile
            </button>
         </div>

         <div className="p-0">
            {activeTab === 'schedule' && (
                <div className="overflow-x-auto animate-in fade-in">
                   <table className="w-full text-left">
                     <thead className="bg-dark/30">
                        <tr className="text-[10px] font-black uppercase text-slate-500">
                           <th className="px-8 py-4">Date & Time</th>
                           <th className="px-8 py-4">Client</th>
                           <th className="px-8 py-4 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {activeBookings.length === 0 ? (
                           <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-500 font-bold italic">No upcoming sessions.</td></tr>
                        ) : (
                           activeBookings.map(booking => (
                              <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                 <td className="px-8 py-6">
                                    <div className="text-white font-bold text-sm">{booking.date}</div>
                                    <div className="text-slate-500 text-xs font-bold">{booking.time}</div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-white font-bold text-sm uppercase italic">{booking.customerName}</div>
                                    <div className="text-slate-500 text-xs">{booking.customerPhone || 'No contact info'}</div>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <button onClick={() => handleAction(booking.id, 'trainer_completed')} className="px-4 py-2 bg-white/5 hover:bg-brand hover:text-dark rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">
                                       <CheckCircle size={14} className="inline mr-2" /> Mark Done
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                   </table>
                </div>
            )}

            {activeTab === 'requests' && (
               <div className="overflow-x-auto animate-in fade-in">
                  <table className="w-full text-left">
                     <tbody className="divide-y divide-white/5">
                        {pendingRequests.length === 0 ? (
                           <tr><td colSpan={2} className="px-8 py-20 text-center text-slate-500 font-bold italic">No pending requests.</td></tr>
                        ) : (
                           pendingRequests.map(booking => (
                              <tr key={booking.id} className="hover:bg-white/5">
                                 <td className="px-8 py-6">
                                    <div className="text-white font-bold text-sm">{booking.date} @ {booking.time}</div>
                                    <div className="text-slate-500 text-xs uppercase font-bold">{booking.customerName}</div>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                       <button onClick={() => handleAction(booking.id, 'confirmed')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"><Check size={18} /></button>
                                       <button onClick={() => handleAction(booking.id, 'cancelled')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><XCircle size={18} /></button>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            )}
            
            {activeTab === 'reviews' && (
               <div className="p-10 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myReviews.map((r, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                           <span className="font-bold text-white text-sm">{r.author}</span>
                           <div className="flex text-brand">
                              {[...Array(r.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                           </div>
                        </div>
                        <p className="text-slate-400 italic text-sm">"{r.text}"</p>
                      </div>
                    ))}
                  </div>
               </div>
            )}

            {activeTab === 'profile' && (
                <div className="p-10 animate-in fade-in">
                    <form onSubmit={handleSaveProfile} className="max-w-xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Display Name</label>
                                <input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand" value={editName} onChange={e => setEditName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Specialty</label>
                                <input type="text" className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand" value={editSpecialty} onChange={e => setEditSpecialty(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Biography</label>
                            <textarea rows={3} className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand" value={editBio} onChange={e => setEditBio(e.target.value)} />
                        </div>
                        <button type="submit" disabled={isSaving} className="px-8 py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all">
                            {isSaving ? <Loader2 className="animate-spin" /> : 'Save Profile'}
                        </button>
                    </form>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
