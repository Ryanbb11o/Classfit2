
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, User, Briefcase, RefreshCw, AlertCircle, Check, DollarSign, LayoutDashboard, Settings, Loader2, Star, QrCode, Grid, List, ChevronLeft, ChevronRight, Ban, Unlock, X, CalendarPlus } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, DEFAULT_PROFILE_IMAGE, getTrainerReviews } from '../constants';
import { Booking } from '../types';

const TrainerDashboard: React.FC = () => {
  const { currentUser, bookings, updateBooking, updateUser, language, refreshData, isLoading, confirmAction } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'calendar' | 'requests' | 'reviews' | 'profile'>('calendar');
  const [calStyle, setCalStyle] = useState<'grid' | 'agenda'>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoading && (!currentUser || !currentUser.roles.includes('trainer'))) {
      navigate('/login');
    }
  }, [currentUser, isLoading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAction = (bookingId: string, action: 'confirmed' | 'cancelled' | 'trainer_completed') => {
    const title = action === 'trainer_completed' ? 'Mark Completed' : 'Status Update';
    confirmAction({
      title,
      message: `Change session status to ${action.replace('_', ' ')}?`,
      onConfirm: async () => await updateBooking(bookingId, { status: action })
    });
  };

  const getGoogleCalendarUrl = (booking: Booking) => {
    const [year, month, day] = booking.date.split('-');
    const [hour, minute] = booking.time.split(':');
    const startDate = `${year}${month}${day}T${hour.replace(':','')}${minute.replace(':','')}00`;
    const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
    const endDate = `${year}${month}${day}T${endHour}${minute}00`;
    
    const text = encodeURIComponent(`ClassFit Training: ${booking.customerName}`);
    const details = encodeURIComponent(`Client: ${booking.customerName}\nStatus: Confirmed\nLocation: ClassFit Varna, сп. Мир`);
    const location = encodeURIComponent(`ClassFit Varna, сп. Мир`);
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  const myBookings = bookings.filter(b => b.trainerId === currentUser?.id);
  const pendingRequests = myBookings.filter(b => b.status === 'pending');
  const confirmedSessions = myBookings.filter(b => b.status === 'confirmed');

  // Calendar Logic
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return d === 0 ? 6 : d - 1; // Mon starts
  };

  const handleToggleBlockDate = (dateStr: string) => {
    if (!currentUser) return;
    const currentBlocks = currentUser.blockedDates || [];
    const isBlocked = currentBlocks.includes(dateStr);
    const newBlocks = isBlocked ? currentBlocks.filter(d => d !== dateStr) : [...currentBlocks, dateStr];
    updateUser(currentUser.id, { blockedDates: newBlocks });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Bigger cells: h-44
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-32 md:h-44 border border-white/5 opacity-20"></div>);

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = myBookings.filter(b => b.date === dateStr);
        const hasPending = dayBookings.some(b => b.status === 'pending');
        const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
        const isBlocked = currentUser?.blockedDates?.includes(dateStr);

        days.push(
            <div 
              key={i} 
              onClick={() => setSelectedDay(date)}
              className={`h-32 md:h-44 p-4 border border-white/10 transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden
                ${isBlocked ? 'bg-red-500/5' : 'bg-dark/40 hover:bg-white/5'}
              `}
            >
                <div className="flex justify-between items-start">
                   <span className={`text-sm font-black uppercase tracking-widest ${isBlocked ? 'text-red-500/50' : 'text-slate-500 group-hover:text-white'}`}>{i}</span>
                   {isBlocked && <Ban size={14} className="text-red-500" />}
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                   {hasPending && (
                      <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.7)] animate-pulse"></div>
                         <span className="text-[8px] font-black text-yellow-500 uppercase">Pending</span>
                      </div>
                   )}
                   {hasConfirmed && (
                      <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"></div>
                         <span className="text-[8px] font-black text-green-500 uppercase">Confirmed</span>
                      </div>
                   )}
                </div>

                <div className="mt-auto">
                  {dayBookings.length > 0 && (
                     <div className="text-[9px] font-black uppercase tracking-widest text-white italic bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 inline-flex items-center gap-2">
                        <Grid size={10} className="text-brand" /> {dayBookings.length} {dayBookings.length === 1 ? 'Session' : 'Sessions'}
                     </div>
                  )}
                </div>
            </div>
        );
    }
    return days;
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div>
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest mb-4 italic shadow-lg shadow-brand/10">
              <Briefcase size={14} /> Professional Dashboard
           </div>
           <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
             {currentUser.name.split('(')[0].trim()}
           </h1>
           <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-3 italic">ClassFit Varna Official Coach Portal</p>
        </div>
        <div className="flex gap-4">
           <button onClick={handleRefresh} className={`p-3 bg-surface border border-white/10 rounded-xl text-slate-500 ${isRefreshing ? 'animate-spin text-brand' : ''}`}><RefreshCw size={20} /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute top-4 right-4 opacity-5"><LayoutDashboard size={48} /></div>
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4 italic">Confirmations Needed</p>
             <p className={`text-4xl font-black italic ${pendingRequests.length > 0 ? 'text-yellow-500' : 'text-white'}`}>{pendingRequests.length}</p>
          </div>
          <div className="p-8 bg-surface border border-white/5 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute top-4 right-4 opacity-5"><CalendarIcon size={48} /></div>
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4 italic">Active Sessions</p>
             <p className="text-4xl font-black italic text-white">{confirmedSessions.length}</p>
          </div>
          <div className="p-8 bg-brand text-dark rounded-[2.5rem] shadow-xl relative overflow-hidden">
             <div className="absolute top-4 right-4 opacity-10"><DollarSign size={48} /></div>
             <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-4 italic">Completed Volume</p>
             <p className="text-4xl font-black italic">{myBookings.filter(b => b.status === 'completed').length} <span className="text-xs">UNITS</span></p>
          </div>
      </div>

      {/* Main Interface */}
      <div className="bg-surface rounded-[3rem] border border-white/10 overflow-hidden min-h-[600px] shadow-2xl">
         <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 bg-dark/20">
            <div className="flex items-center gap-4 bg-dark/40 p-1.5 rounded-2xl border border-white/5">
               <button onClick={() => setActiveTab('calendar')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-brand text-dark shadow-lg' : 'text-slate-500 hover:text-white'}`}>Calendar</button>
               <button onClick={() => setActiveTab('requests')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-brand text-dark shadow-lg' : 'text-slate-500 hover:text-white'}`}>Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}</button>
               <button onClick={() => setActiveTab('reviews')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reviews' ? 'bg-brand text-dark shadow-lg' : 'text-slate-500 hover:text-white'}`}>Reviews</button>
            </div>

            {activeTab === 'calendar' && (
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-dark/40 p-1 rounded-xl border border-white/5">
                     <button onClick={() => setCalStyle('grid')} className={`p-2 rounded-lg transition-all ${calStyle === 'grid' ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-white'}`}><Grid size={16} /></button>
                     <button onClick={() => setCalStyle('agenda')} className={`p-2 rounded-lg transition-all ${calStyle === 'agenda' ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-white'}`}><List size={16} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-all"><ChevronLeft size={20} /></button>
                     <span className="text-[11px] font-black uppercase text-white tracking-widest min-w-[140px] text-center italic">{currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                     <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-all"><ChevronRight size={20} /></button>
                  </div>
               </div>
            )}
         </div>

         <div className="p-0">
            {activeTab === 'calendar' && (
               calStyle === 'grid' ? (
                  <div className="animate-in fade-in duration-500 overflow-x-auto">
                     <div className="min-w-[900px]">
                        <div className="grid grid-cols-7 text-center py-6 bg-dark/40 border-b border-white/10">
                           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d} className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 border-collapse">
                           {renderCalendar()}
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="p-10 space-y-4 animate-in fade-in duration-500">
                     {confirmedSessions.length === 0 ? <p className="text-center py-20 text-slate-500 font-bold italic">No sessions scheduled.</p> : confirmedSessions.sort((a,b) => a.date.localeCompare(b.date)).map(b => (
                        <div key={b.id} className="p-6 bg-dark/20 border border-white/5 rounded-[2rem] flex items-center justify-between">
                           <div>
                              <p className="text-[9px] font-black uppercase text-brand tracking-widest mb-1 italic">{b.date} @ {b.time}</p>
                              <h4 className="text-lg font-black uppercase italic text-white leading-none">{b.customerName}</h4>
                           </div>
                           <div className="flex items-center gap-3">
                              <a 
                                 href={getGoogleCalendarUrl(b)}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all border border-white/5"
                              >
                                 <CalendarPlus size={18} />
                              </a>
                              <button onClick={() => handleAction(b.id, 'trainer_completed')} className="px-5 py-2 bg-brand text-dark text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-md shadow-brand/10">Mark Done</button>
                           </div>
                        </div>
                     ))}
                  </div>
               )
            )}

            {activeTab === 'requests' && (
               <div className="p-0 animate-in fade-in">
                  <table className="w-full">
                     <thead className="bg-dark/30 text-[9px] font-black uppercase text-slate-500">
                        <tr><th className="px-8 py-5">Request Info</th><th className="px-8 py-5 text-center">Check-in</th><th className="px-8 py-5 text-right">Approve / Decline</th></tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {pendingRequests.length === 0 ? <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-500 font-bold italic">All requests processed. Ready for training.</td></tr> : pendingRequests.map(b => (
                           <tr key={b.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-6">
                                 <p className="text-white font-black uppercase italic tracking-tighter text-sm mb-1">{b.customerName}</p>
                                 <p className="text-[9px] text-slate-500 font-black tracking-widest">{b.date} @ {b.time}</p>
                              </td>
                              <td className="px-8 py-6 text-center"><span className="px-3 py-1 bg-brand/10 text-brand rounded-lg text-[10px] font-black border border-brand/20 italic">{b.checkInCode}</span></td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-3">
                                    <button onClick={() => handleAction(b.id, 'confirmed')} className="w-10 h-10 flex items-center justify-center bg-green-500/10 text-green-500 rounded-xl border border-green-500/10 hover:bg-green-500 hover:text-white transition-all"><Check size={18} /></button>
                                    <button onClick={() => handleAction(b.id, 'cancelled')} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all"><XCircle size={18} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {activeTab === 'reviews' && (
               <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                  {getTrainerReviews(currentUser.id, language).map((r, i) => (
                     <div key={i} className="p-8 bg-dark/20 border border-white/5 rounded-[2.5rem] relative">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3"><div className="w-10 h-10 bg-brand text-dark rounded-xl flex items-center justify-center font-black">{r.avatar}</div><span className="text-xs font-black uppercase italic text-white tracking-tight">{r.author}</span></div>
                           <div className="flex text-brand">{[...Array(r.rating)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}</div>
                        </div>
                        <p className="text-sm text-slate-400 font-medium italic leading-relaxed">"{r.text}"</p>
                        <span className="absolute bottom-6 right-8 text-[8px] font-black uppercase tracking-widest text-slate-700 italic">{r.time}</span>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* Day Interaction Modal */}
      {selectedDay && (
         <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300 text-left">
            <div className="bg-surface border border-white/10 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
                <button onClick={() => setSelectedDay(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full"><X size={20} /></button>
                
                <div className="mb-10">
                   <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none mb-2">{selectedDay.toLocaleString('en-US', { day: 'numeric', month: 'long' })}</h2>
                   <div className="flex items-center gap-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Day Details & Management</p>
                      <button 
                        onClick={() => handleToggleBlockDate(selectedDay.toISOString().split('T')[0])}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                           currentUser?.blockedDates?.includes(selectedDay.toISOString().split('T')[0])
                           ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                           : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                      >
                         {currentUser?.blockedDates?.includes(selectedDay.toISOString().split('T')[0]) ? <><Unlock size={12}/> Open for Booking</> : <><Ban size={12}/> Block Entire Day</>}
                      </button>
                   </div>
                </div>

                <div className="space-y-4 overflow-y-auto custom-scrollbar flex-grow pr-4">
                   {myBookings.filter(b => b.date === selectedDay.toISOString().split('T')[0]).length === 0 ? (
                      <div className="p-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl text-slate-500 text-[10px] font-black uppercase tracking-widest">No sessions found for this date.</div>
                   ) : (
                      myBookings.filter(b => b.date === selectedDay.toISOString().split('T')[0]).map(b => (
                         <div key={b.id} className="p-6 bg-dark/40 border border-white/5 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                               <div className="text-center shrink-0"><p className="text-[9px] font-black text-slate-500 uppercase">TIME</p><p className="text-lg font-black text-white italic">{b.time}</p></div>
                               <div>
                                  <h4 className="text-white font-black uppercase italic tracking-tighter leading-none mb-1">{b.customerName}</h4>
                                  <div className="flex items-center gap-2">
                                     <p className={`text-[8px] font-black uppercase tracking-widest ${
                                        b.status === 'confirmed' ? 'text-green-500' : b.status === 'pending' ? 'text-yellow-500' : 'text-slate-500'
                                     }`}>{b.status.replace('_', ' ')}</p>
                                     {b.status === 'confirmed' && (
                                       <a 
                                          href={getGoogleCalendarUrl(b)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[8px] text-brand uppercase font-black hover:underline flex items-center gap-1"
                                       >
                                          <CalendarPlus size={10} /> Sync to G-Cal
                                       </a>
                                     )}
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               {b.status === 'pending' && <button onClick={() => handleAction(b.id, 'confirmed')} className="p-3 bg-brand text-dark rounded-xl shadow-lg shadow-brand/10"><Check size={16}/></button>}
                               {b.status === 'confirmed' && <button onClick={() => handleAction(b.id, 'trainer_completed')} className="px-4 py-2 bg-brand text-dark rounded-xl text-[9px] font-black uppercase hover:bg-white transition-all shadow-md">Mark Finished</button>}
                            </div>
                         </div>
                      ))
                   )}
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
