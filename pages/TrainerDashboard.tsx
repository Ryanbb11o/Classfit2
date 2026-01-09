
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, User, Briefcase, RefreshCw, Check, LayoutDashboard, Loader2, ChevronLeft, ChevronRight, Ban, Unlock, X, CalendarPlus, ShieldCheck, Mail, Phone, ExternalLink, ArrowRight, Edit3 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Booking } from '../types';

const TrainerDashboard: React.FC = () => {
  const { currentUser, bookings, updateBooking, updateUser, language, refreshData, isLoading, confirmAction } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'calendar' | 'requests' | 'roster'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (!isLoading && (!currentUser || !currentUser.roles?.includes('trainer'))) {
      navigate('/login');
    }
    refreshData();
  }, [currentUser, isLoading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAction = (bookingId: string, action: 'confirmed' | 'cancelled' | 'trainer_completed') => {
    const actionLabel = action === 'confirmed' ? 'Confirm' : action === 'cancelled' ? 'Cancel' : 'Complete';
    confirmAction({
      title: `${actionLabel} Session`,
      message: `Are you sure you want to ${actionLabel.toLowerCase()} this training request?`,
      onConfirm: async () => {
        await updateBooking(bookingId, { status: action });
      }
    });
  };

  const handleReschedule = async (bookingId: string) => {
    if (!newTime) return;
    await updateBooking(bookingId, { time: newTime });
    setEditingBookingId(null);
    setNewTime('');
  };

  const getGoogleCalendarUrl = (booking: Booking) => {
    const [year, month, day] = booking.date.split('-');
    const [hour, minute] = booking.time.split(':');
    const startDate = `${year}${month}${day}T${hour}${minute}00`;
    const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
    const endDate = `${year}${month}${day}T${endHour}${minute}00`;
    
    const text = encodeURIComponent(`ClassFit: ${booking.customerName}`);
    const details = encodeURIComponent(`Client: ${booking.customerName}\nPhone: ${booking.customerPhone || 'N/A'}\nEmail: ${booking.customerEmail || 'N/A'}`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}/${endDate}&details=${details}&location=ClassFit+Varna`;
  };

  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter(b => String(b.trainerId) === String(currentUser.id));
  }, [bookings, currentUser]);

  const pendingRequests = useMemo(() => myBookings.filter(b => b.status === 'pending'), [myBookings]);
  const rosterSessions = useMemo(() => myBookings.filter(b => b.status === 'confirmed').sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)), [myBookings]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return d === 0 ? 6 : d - 1; 
  };

  const handleToggleBlockDate = (dateStr: string) => {
    if (!currentUser) return;
    const currentBlocks = currentUser.blockedDates || [];
    const isBlocked = currentBlocks.includes(dateStr);
    
    confirmAction({
      title: isBlocked ? 'Unlock Day' : 'Block Day',
      message: isBlocked ? `Make ${dateStr} available for bookings?` : `Block all new sessions on ${dateStr}? This will hide this day from customers.`,
      onConfirm: async () => {
        const newBlocks = isBlocked ? currentBlocks.filter(d => d !== dateStr) : [...currentBlocks, dateStr];
        await updateUser(currentUser.id, { blockedDates: newBlocks });
      }
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-20 sm:h-28 border border-white/5 opacity-20"></div>);

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = myBookings.filter(b => b.date === dateStr);
        const hasPending = dayBookings.some(b => b.status === 'pending');
        const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
        const isBlocked = currentUser?.blockedDates?.includes(dateStr);
        const isSelected = selectedDay?.toDateString() === date.toDateString();

        days.push(
            <div key={i} onClick={() => setSelectedDay(date)} className={`h-20 sm:h-28 p-2 border border-white/10 transition-all cursor-pointer relative flex flex-col justify-between ${isBlocked ? 'bg-red-500/5' : isSelected ? 'bg-brand/10 border-brand' : 'bg-dark/40 hover:bg-white/5'}`}>
                <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-brand' : isBlocked ? 'text-red-500/50' : 'text-slate-500'}`}>{i}</span>
                <div className="flex flex-col gap-1">
                   {isBlocked && <div className="text-[7px] font-black text-red-500 uppercase tracking-tighter bg-red-500/10 px-1 rounded">BLOCKED</div>}
                   {hasPending && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>}
                   {hasConfirmed && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                </div>
            </div>
        );
    }
    return days;
  };

  const selectedDateStr = selectedDay?.toISOString().split('T')[0];
  const isSelectedBlocked = currentUser?.blockedDates?.includes(selectedDateStr || '');
  const dayDetails = myBookings.filter(b => b.date === selectedDateStr).sort((a,b) => a.time.localeCompare(b.time));

  if (!currentUser) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-10">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand text-dark rounded-lg text-[9px] font-black uppercase tracking-widest mb-3 italic">
              <ShieldCheck size={12} /> Coach Terminal
           </div>
           <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">{currentUser.name.split('(')[0].trim()}</h1>
        </div>
        <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-white/5">
            {[
              { id: 'calendar', label: 'Schedule', icon: CalendarIcon },
              { id: 'requests', label: 'Requests', icon: Clock, badge: pendingRequests.length },
              { id: 'roster', label: 'Roster', icon: User }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-brand text-dark' : 'text-slate-400 hover:text-white'}`}>
                <tab.icon size={12} /> {tab.label}
                {tab.badge ? <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{tab.badge}</span> : null}
              </button>
            ))}
            <button onClick={handleRefresh} className={`p-2 ml-2 text-slate-500 hover:text-brand ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={14} /></button>
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'calendar' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-surface rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
                 <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white uppercase italic font-black text-sm tracking-widest">
                       <CalendarIcon size={18} className="text-brand" /> Matrix View
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1.5 hover:bg-white/5 rounded-lg"><ChevronLeft size={16} /></button>
                       <span className="text-[10px] font-black uppercase tracking-widest text-white w-28 text-center">{currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1.5 hover:bg-white/5 rounded-lg"><ChevronRight size={16} /></button>
                    </div>
                 </div>
                 <div className="grid grid-cols-7 text-center bg-dark/10">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="py-3 text-[8px] font-black uppercase tracking-widest text-slate-600 border-b border-white/5">{d}</div>
                    ))}
                 </div>
                 <div className="grid grid-cols-7">{renderCalendar()}</div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                 {selectedDay ? (
                    <div className="bg-surface rounded-[2rem] border border-white/10 p-8 shadow-xl animate-in slide-in-from-right-2">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <h3 className="text-lg font-black uppercase italic text-white tracking-tighter">{selectedDay.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</h3>
                             <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Daily Log</p>
                          </div>
                          <button onClick={() => handleToggleBlockDate(selectedDateStr || '')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isSelectedBlocked ? 'bg-white text-dark' : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'}`}>
                             {isSelectedBlocked ? <Unlock size={12} /> : <Ban size={12} />} {isSelectedBlocked ? 'Open Day' : 'Block Day'}
                          </button>
                       </div>

                       <div className="space-y-3">
                          {dayDetails.length === 0 ? (
                             <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No scheduled sessions</p>
                             </div>
                          ) : dayDetails.map(b => (
                             <div key={b.id} className="p-4 bg-dark/40 rounded-xl border border-white/5 group hover:border-brand/40 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                   <div className="flex items-center gap-2 text-brand font-black italic uppercase text-xs">
                                      <Clock size={12}/> {b.time}
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <a href={getGoogleCalendarUrl(b)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 text-slate-400 hover:text-brand rounded transition-all" title="Sync to GCal"><CalendarPlus size={14}/></a>
                                      <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${b.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-dark'}`}>{b.status}</span>
                                   </div>
                                </div>
                                <p className="text-sm font-black uppercase italic text-white mb-3 tracking-tighter">{b.customerName}</p>
                                
                                {editingBookingId === b.id ? (
                                  <div className="flex gap-2 mb-4 animate-in slide-in-from-top-1">
                                     <input 
                                       type="time" 
                                       value={newTime} 
                                       onChange={(e) => setNewTime(e.target.value)}
                                       className="bg-dark border border-white/10 rounded px-2 text-[10px] text-white outline-none focus:border-brand"
                                     />
                                     <button onClick={() => handleReschedule(b.id)} className="bg-brand text-dark p-1 rounded"><Check size={12}/></button>
                                     <button onClick={() => setEditingBookingId(null)} className="bg-white/5 text-slate-500 p-1 rounded"><X size={12}/></button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end mb-3">
                                     <button onClick={() => { setEditingBookingId(b.id); setNewTime(b.time); }} className="text-[8px] font-black uppercase text-slate-600 hover:text-brand flex items-center gap-1 italic"><Edit3 size={10}/> Reschedule</button>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                                   <a href={`tel:${b.customerPhone}`} className="p-2 bg-white/5 hover:bg-brand hover:text-dark rounded-lg flex items-center justify-center transition-all"><Phone size={12}/></a>
                                   <a href={`mailto:${b.customerEmail}`} className="p-2 bg-white/5 hover:bg-brand hover:text-dark rounded-lg flex items-center justify-center transition-all"><Mail size={12}/></a>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ) : null}
              </div>
           </div>
        )}

        {activeTab === 'requests' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.length === 0 ? (
                 <div className="col-span-full py-24 text-center bg-surface/10 rounded-[2rem] border-2 border-dashed border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No incoming requests.</p>
                 </div>
              ) : pendingRequests.map(b => (
                 <div key={b.id} className="bg-surface rounded-[2rem] border border-white/10 p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500"></div>
                    <div className="mb-6 flex justify-between items-start">
                       <div>
                          <p className="text-[8px] font-black uppercase text-yellow-500 tracking-widest mb-1 italic">Pending Recruitment</p>
                          <h3 className="text-xl font-black uppercase italic text-white tracking-tighter leading-none">{b.customerName}</h3>
                       </div>
                       <div className="bg-dark/60 p-2 rounded-xl border border-white/5 text-center min-w-[70px]">
                          <p className="text-[8px] font-bold text-slate-500 uppercase">{b.date}</p>
                          <p className="text-xs font-black text-brand italic">{b.time}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-2 mb-8 bg-dark/20 p-4 rounded-xl">
                       <div className="flex items-center gap-3 text-slate-400">
                          <Phone size={12} className="text-brand" />
                          <span className="text-xs font-bold">{b.customerPhone || 'N/A'}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-400">
                          <Mail size={12} className="text-brand" />
                          <span className="text-xs font-bold truncate">{b.customerEmail || 'N/A'}</span>
                       </div>
                    </div>

                    <div className="flex gap-3">
                       <button onClick={() => handleAction(b.id, 'confirmed')} className="flex-[2] py-4 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white transition-all flex items-center justify-center gap-2 font-black italic"><Check size={14}/> Confirm</button>
                       <button onClick={() => handleAction(b.id, 'cancelled')} className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Reject</button>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {activeTab === 'roster' && (
           <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Confirmed Transformation Queue</h2>
              <div className="grid grid-cols-1 gap-4">
                 {rosterSessions.length === 0 ? (
                    <div className="py-24 text-center bg-surface/10 rounded-[2rem] border-2 border-dashed border-white/5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Roster is currently empty.</p>
                    </div>
                 ) : rosterSessions.map(b => (
                    <div key={b.id} className="bg-surface p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-brand/40 transition-all">
                       <div className="flex items-center gap-6 flex-grow w-full md:w-auto">
                          <div className="w-12 h-12 bg-brand text-dark rounded-xl flex items-center justify-center shadow-lg shrink-0"><User size={24}/></div>
                          <div>
                             <h3 className="text-lg font-black uppercase italic text-white tracking-tighter mb-1">{b.customerName}</h3>
                             <div className="flex flex-wrap gap-4">
                                <span className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest italic"><CalendarIcon size={12} className="text-brand"/> {b.date}</span>
                                <span className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest italic"><Clock size={12} className="text-brand"/> {b.time}</span>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full md:w-auto shrink-0">
                          <div className="flex items-center gap-3 px-6 py-3 bg-dark/40 rounded-xl border border-white/5 text-slate-300">
                             <Phone size={14} className="text-brand"/>
                             <span className="text-[10px] font-bold uppercase">{b.customerPhone}</span>
                          </div>
                          <a href={getGoogleCalendarUrl(b)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-6 py-3 bg-white/5 hover:bg-white hover:text-dark rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all italic">
                             <ExternalLink size={14}/> Sync Cal
                          </a>
                          <button onClick={() => handleAction(b.id, 'trainer_completed')} className="flex items-center justify-center gap-3 px-6 py-3 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-white transition-all italic">
                             <Check size={14}/> Complete
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboard;
