
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, User, Briefcase, RefreshCw, AlertCircle, Link as LinkIcon, Check, DollarSign, ListFilter, LayoutDashboard, Settings, Camera, Save, Loader2, Zap, Star } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE, getTrainerReviews } from '../constants';

const TrainerDashboard: React.FC = () => {
  const { currentUser, bookings, updateBooking, updateUser, language, refreshData, isLoading } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'requests' | 'reviews' | 'profile'>('schedule');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  
  // Track initialization to prevent overwriting user input on background refreshes
  const initializedRef = useRef(false);
  
  // For demo/testing: allow a user to "link" their current session to a static Trainer ID
  const [linkedStaticId, setLinkedStaticId] = useState<string | null>(localStorage.getItem('trainer_link_id'));

  // 1. Auth Guard
  useEffect(() => {
    // Only redirect if we are done loading and there is no valid trainer user
    if (!isLoading && (!currentUser || currentUser.role !== 'trainer')) {
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);

  // 3. Load user data into edit state (Run once when user data is available)
  useEffect(() => {
    if (currentUser && !initializedRef.current) {
        // Parse name and specialty from stored "Name (Specialty)" format
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
        
        // If profile is incomplete (no image), default to profile tab on first load
        if (!currentUser.image) {
            setActiveTab('profile');
        }
        
        initializedRef.current = true;
    }
  }, [currentUser]);

  const handleLinkProfile = (id: string) => {
    setLinkedStaticId(id);
    localStorage.setItem('trainer_link_id', id);
    alert("Profile linked! You will now see bookings for this demo trainer in addition to your own.");
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
          // Re-combine name and specialty for backend storage
          const fullName = editSpecialty ? `${editName} (${editSpecialty})` : editName;

          await updateUser(currentUser.id, {
              name: fullName,
              image: editImage || '', 
              bio: editBio,
              phone: editPhone
          });
          alert(language === 'bg' ? 'Профилът е обновен!' : 'Profile updated successfully!');
      } catch (err: any) {
          console.error(err);
          const msg = err.message || err.error_description || 'Unknown error';
          alert(`Failed to update profile: ${msg}`);
      } finally {
          setIsSaving(false);
      }
  };

  const handleAction = async (bookingId: string, action: 'confirmed' | 'cancelled' | 'trainer_completed') => {
    const confirmMsg = action === 'trainer_completed' 
        ? (language === 'bg' ? 'Маркиране като приключена? Администратор ще потвърди плащането.' : 'Mark as completed? An admin will confirm payment.')
        : `Mark this booking as ${action}?`;

    if (window.confirm(confirmMsg)) {
       await updateBooking(bookingId, { status: action });
    }
  };

  const handleFixProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('profile');
    // Force scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Filter logic: Match currentUser.id OR the linked demo ID
  const myBookings = bookings.filter(b => b.trainerId === currentUser.id || b.trainerId === linkedStaticId);
  
  const activeBookings = myBookings.filter(b => b.status === 'confirmed');
  const pendingRequests = myBookings.filter(b => b.status === 'pending');
  const completedBookings = myBookings.filter(b => b.status === 'completed');
  
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);

  // Reviews Data
  const myReviews = getTrainerReviews(currentUser.id, language);

  return (
    <div className="max-w-6xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
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
        
        <button 
          onClick={handleRefresh} 
          className={`p-3 bg-surface border border-white/10 rounded-xl hover:text-brand transition-all text-slate-400 ${isRefreshing ? 'animate-spin text-brand' : ''}`}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* ALERT: Missing Profile Picture */}
      {!currentUser.image && (
          <div className="mb-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <Camera size={24} />
                  </div>
                  <div>
                      <h3 className="text-xl font-black uppercase italic text-white">Profile Photo</h3>
                      <p className="text-slate-300 font-medium text-sm">You are currently using the default profile picture. Upload your own to stand out!</p>
                  </div>
              </div>
              <button 
                onClick={handleFixProfileClick}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-blue-500 transition-all whitespace-nowrap"
              >
                  Update
              </button>
          </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-surface p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pending Requests</span>
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white group-hover:bg-brand group-hover:text-dark transition-colors">
                  <AlertCircle size={18} />
               </div>
            </div>
            <div className="text-4xl font-black italic text-white relative z-10">{pendingRequests.length}</div>
            <div className="absolute right-0 bottom-0 opacity-5 transform translate-y-1/4 translate-x-1/4">
               <AlertCircle size={120} />
            </div>
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

      {/* Main Content Area */}
      <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden min-h-[500px]">
         {/* Tabs */}
         <div className="border-b border-white/5 p-6 flex items-center gap-4 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white text-dark' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
               <LayoutDashboard size={14} /> My Schedule
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'requests' ? 'bg-white text-dark' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
               <ListFilter size={14} /> Requests
               {pendingRequests.length > 0 && <span className="ml-2 bg-brand text-dark px-1.5 py-0.5 rounded text-[9px]">{pendingRequests.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'reviews' ? 'bg-white text-dark' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
               <Star size={14} /> Reviews
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white text-dark' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
               <Settings size={14} /> Profile Settings
               {!currentUser.image && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>}
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
                           <th className="px-8 py-4">Status</th>
                           <th className="px-8 py-4 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {activeBookings.length === 0 ? (
                           <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-bold italic">No upcoming sessions scheduled.</td></tr>
                        ) : (
                           activeBookings.map(booking => (
                              <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand">
                                          <Clock size={18} />
                                       </div>
                                       <div>
                                          <div className="text-white font-bold text-sm">{booking.date}</div>
                                          <div className="text-slate-500 text-xs font-bold">{booking.time}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-white font-bold text-sm uppercase italic">{booking.customerName.split('(')[0].trim()}</div>
                                    <div className="text-slate-500 text-xs">{booking.customerPhone || booking.customerEmail || 'No contact info'}</div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                       Confirmed
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <button 
                                      onClick={() => handleAction(booking.id, 'trainer_completed')}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white hover:text-dark rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all"
                                    >
                                       <CheckCircle size={14} /> Mark Done
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
                     <thead className="bg-dark/30">
                        <tr className="text-[10px] font-black uppercase text-slate-500">
                           <th className="px-8 py-4">Requested Time</th>
                           <th className="px-8 py-4">Client</th>
                           <th className="px-8 py-4">Payment</th>
                           <th className="px-8 py-4 text-right">Decision</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {pendingRequests.length === 0 ? (
                           <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-bold italic">No pending requests.</td></tr>
                        ) : (
                           pendingRequests.map(booking => (
                              <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                                          <AlertCircle size={18} />
                                       </div>
                                       <div>
                                          <div className="text-white font-bold text-sm">{booking.date}</div>
                                          <div className="text-slate-500 text-xs font-bold">{booking.time}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-white font-bold text-sm uppercase italic">{booking.customerName.split('(')[0].trim()}</div>
                                    <div className="text-slate-500 text-xs">{booking.customerPhone}</div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-white font-bold text-sm">{booking.price} BGN</div>
                                    <div className="text-slate-500 text-[10px] uppercase font-bold">Standard Rate</div>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                       <button 
                                          onClick={() => handleAction(booking.id, 'confirmed')}
                                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                          title="Accept"
                                       >
                                          <Check size={18} />
                                       </button>
                                       <button 
                                          onClick={() => handleAction(booking.id, 'cancelled')}
                                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                          title="Decline"
                                       >
                                          <XCircle size={18} />
                                       </button>
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
               <div className="p-8 md:p-12 animate-in fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                   {myReviews.map((review, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-brand/30 transition-all">
                          <div className="flex items-center gap-4 mb-4">
                             <div className="w-10 h-10 rounded-full bg-brand text-dark flex items-center justify-center font-bold text-sm">
                                {review.avatar}
                             </div>
                             <div>
                                <h4 className="font-bold text-white text-sm">{review.author}</h4>
                                <div className="flex gap-1 mt-1">
                                    {[...Array(review.rating)].map((_, j) => (
                                        <Star key={j} size={12} className="text-brand fill-brand" />
                                    ))}
                                </div>
                             </div>
                             <span className="ml-auto text-[10px] text-slate-500 uppercase font-bold">{review.time}</span>
                          </div>
                          <p className="text-slate-300 italic text-sm leading-relaxed">"{review.text}"</p>
                      </div>
                   ))}
               </div>
            )}

            {activeTab === 'profile' && (
                <div className="p-8 md:p-12 animate-in fade-in">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Preview Side */}
                        <div className="w-full lg:w-1/3 flex flex-col items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 w-full text-center">Live Preview (Public)</h3>
                            <div className="w-full relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/5 bg-surface group">
                                <div className="aspect-[3/4] relative">
                                    <img 
                                        src={editImage || DEFAULT_PROFILE_IMAGE} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-90"></div>
                                    <div className="absolute bottom-0 left-0 p-6 w-full">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-brand text-dark text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {editSpecialty || 'Specialty'}
                                            </span>
                                            <span className="px-3 py-1 bg-white/10 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                                                20 BGN
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-black uppercase italic text-white leading-none mb-2">{editName}</h2>
                                    </div>
                                </div>
                                <div className="p-6 bg-surface border-t border-white/5">
                                     <div className="flex items-start gap-2 mb-2">
                                        <Zap size={14} className="text-brand shrink-0 mt-0.5" />
                                        <p className="text-slate-400 text-xs italic leading-relaxed line-clamp-4">
                                            {editBio || 'No biography set.'}
                                        </p>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="w-full lg:w-2/3">
                            <h3 className="text-xl font-black uppercase italic text-white mb-6">Edit Profile Details</h3>
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-brand"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Specialty</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-brand"
                                            value={editSpecialty}
                                            onChange={(e) => setEditSpecialty(e.target.value)}
                                            placeholder="e.g. CrossFit"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Contact Phone</label>
                                    <input 
                                        type="tel" 
                                        className="w-full bg-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-brand"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Profile Image URL</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="url" 
                                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-brand"
                                            value={editImage}
                                            onChange={(e) => setEditImage(e.target.value)}
                                            placeholder="Leave empty to use default image"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setEditImage('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop')}
                                            className="px-4 bg-white/5 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 whitespace-nowrap"
                                        >
                                            Use Demo
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1 ml-2">Provide a direct link to a square image (jpg/png), or leave blank for default.</p>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Biography</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full bg-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white font-medium outline-none focus:border-brand resize-none"
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        placeholder="Tell clients about your experience and style..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="px-8 py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* DEMO LINKER */}
      <div className="mt-12 p-8 bg-dark/50 border border-white/5 rounded-3xl text-center">
         <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-4">Demo Tools</h3>
         <div className="flex flex-wrap justify-center gap-4">
             {getTrainers('en').map(t => (
                 <button 
                   key={t.id}
                   onClick={() => handleLinkProfile(t.id)}
                   className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${linkedStaticId === t.id ? 'bg-brand text-dark border-brand' : 'bg-transparent text-slate-500 border-white/10 hover:border-white'}`}
                 >
                    <LinkIcon size={12} className="inline mr-2" /> Link to {t.name}
                 </button>
             ))}
         </div>
      </div>

    </div>
  );
};

export default TrainerDashboard;
