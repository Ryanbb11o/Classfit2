
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, User, Briefcase, RefreshCw, AlertCircle, Check, DollarSign, LayoutDashboard, Settings, Loader2, Star, QrCode, Grid, List, ChevronLeft, ChevronRight, Ban, Unlock, X, CalendarPlus, ShieldCheck } from 'lucide-react';
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
    // Safely check for trainer role with optional chaining
    if (!isLoading && (!currentUser || !currentUser.roles?.includes('trainer'))) {
      navigate('/login');
    }
  }, [currentUser, isLoading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const calculateTimeRange = (startTime: string, durationMins: number = 60) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMins;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
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
    const details = encodeURIComponent(`Client: ${booking.customerName}\nStatus: Confirmed\nLocation: ClassFit Varna`);
    const location = encodeURIComponent(`ClassFit Varna`);
    
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
    
    confirmAction({
      title: isBlocked ? 'Unlock Day' : 'Block Entire Day',
      message: isBlocked 
        ? `Are you sure you want to make ${dateStr} available for bookings again?`
        : `This will prevent any clients from booking sessions on ${dateStr}. Existing confirmed sessions will remain.`,
      onConfirm: async () => {
        const newBlocks = isBlocked 
          ? currentBlocks.filter(d => d !== dateStr) 
          : [...currentBlocks, dateStr];
        await updateUser(currentUser.id, { blockedDates: newBlocks });
      }
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-32 md:h-44 border border-white/5 opacity-20"></div>);

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = myBookings.filter(b => b.date === dateStr);
        const hasPending = dayBookings.some(b => b.status === 'pending');
        const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
        const isBlocked = currentUser?.blockedDates?.includes(dateStr);
        const isSelected = selectedDay?.toDateString() === date.toDateString();

        days.push(
            <div 
              key={i} 
              onClick={() => setSelectedDay(date)}
              className={`h-32 md:h-44 p-4 border border-white/10 transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden
                ${isBlocked ? 'bg-red-500/5' : isSelected ? 'bg-brand/10' : 'bg-dark/40 hover:bg-white/5'}
                ${isSelected ? 'border-brand' : ''}
              `}
            >
                <div className="flex justify-between items-start">
                   <span className={`text-sm font-black uppercase tracking-widest ${isSelected ? 'text-brand' : isBlocked ? 'text-red-500/50' : 'text-slate-500 group-hover:text-white'}`}>{i}</span>
                   {isBlocked && <Ban size={14} className="text-red-500" />}
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                   {isBlocked && (
                      <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                         <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">OFF-DUTY</span>
                      </div>
                   )}
                   {hasPending && (
                      <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.7)] animate-pulse"></div>
                         <span className="text-[9px] font-black text-yellow-500 uppercase tracking-tighter">PENDING</span>
                      </div>
                   )}
                   {hasConfirmed && (
                      <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"></div>
                         <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">ACTIVE</span>
                      </div>
                   )}
                </div>

                <div className="mt-auto">
                  {dayBookings.length > 0 && (
                     <div className="text-[9px] font-black uppercase tracking-widest text-white italic bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 inline-flex items-center gap-1.5">
                        <Grid size={10} className="text-brand" /> {dayBookings.length}
                     </div>
                  )}
                </div>
            </div>
        );
    }
    return days;
  };

  const selectedDateStr = selectedDay?.toISOString().split('T')[0];
  const isSelectedBlocked = currentUser?.blockedDates?.includes(selectedDateStr || '');

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div>
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-dark rounded-xl text-[11px] font-black uppercase tracking-widest mb-4 italic shadow-lg shadow-brand/10">
              <Briefcase size={14} /> Professional Dashboard
           </div>
           <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
             {currentUser.name.split('(')[0].trim()}
           </h1>
           <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[11px] mt-3 italic">ClassFit Varna Official Coach Portal</p>
        </div>
        <div className="flex gap-4">
           <button onClick={handleRefresh} className={`p-3 bg-surface border border-white/10 rounded-xl text-slate-500 ${isRefreshing ? 'animate-spin text-brand' : ''}`}><RefreshCw size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="bg-surface rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <CalendarIcon className="text-brand" />
                     <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">Availability Matrix</h2>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
                     <span className="text-[11px] font-black uppercase tracking-widest text-white w-32 text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                     <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-white/5 rounded-full"><ChevronRight size={20} /></button>
                  </div>
               </div>
               <div className="grid grid-cols-7 text-center bg-dark/20">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-white/5">{d}</div>
                  ))}
               </div>
               <div className="grid grid-cols-7">
                  {renderCalendar()}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            {selectedDay ? (
               <div className="bg-surface border border-brand/20 rounded-[2.5rem] p-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                        <CalendarIcon size={24} />
                     </div>
                     <button onClick={() => setSelectedDay(null)} className="p-2 text-slate-600 hover:text-white"><X size={20} /></button>
                  </div>
                  
                  <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter mb-1">{selectedDay.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</h3>
                  <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-8">Daily Operations Manager</p>

                  <div className="space-y-4">
                     <div className={`p-6 rounded-[2rem] border transition-all ${isSelectedBlocked ? 'bg-red-500/10 border-red-500/30' : 'bg-dark/40 border-white/10'}`}>
                        <div className="flex items-center gap-4 mb-4">
                           {isSelectedBlocked ? <Ban className="text-red-500" /> : <ShieldCheck className="text-brand" />}
                           <div>
                              <p className="text-xs font-black text-white uppercase italic tracking-tighter">Availability Status</p>
                              <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelectedBlocked ? 'text-red-500' : 'text-brand'}`}>
                                 {isSelectedBlocked ? 'BLOCKED TO PUBLIC' : 'AVAILABLE FOR BOOKING'}
                              </p>
                           </div>
                        </div>
                        <button 
                           onClick={() => handleToggleBlockDate(selectedDateStr || '')}
                           className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSelectedBlocked ? 'bg-white text-dark hover:bg-brand' : 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/10'}`}
                        >
                           {isSelectedBlocked ? <Unlock size={14} /> : <Ban size={14} />}
                           {isSelectedBlocked ? 'Unlock Entire Day' : 'Block Entire Day'}
                        </button>
                     </div>

                     <div className="p-6 bg-dark/40 border border-white/10 rounded-[2rem]">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 italic">Scheduled Intensity</p>
                        <div className="flex items-end justify-between">
                           <span className="text-4xl font-black italic text-white">{myBookings.filter(b => b.date === selectedDateStr).length}</span>
                           <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Reserved Slots</span>
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="bg-surface/30 border border-dashed border-white/10 rounded-[3rem] p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-700">
                     <CalendarPlus size={32} />
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[11px] italic">Select a date in the matrix to manage availability or view specific tasks.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
