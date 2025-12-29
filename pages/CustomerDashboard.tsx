
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, Timer, XCircle, Trash2, CheckCircle2, User as UserIcon, Mail, CalendarPlus, Phone, MapPin, ChevronRight, LogOut, Dumbbell, Activity, AlertCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, currentUser, logout, users } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // 1. COMBINE STATIC AND DYNAMIC TRAINERS
  const allTrainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    
    // Convert users with role 'trainer' into Trainer objects
    const dynamicTrainers: Trainer[] = users
      .filter(u => u.role === 'trainer')
      .map(u => {
        // STRICT PARSING: Separate Name from Specialty
        const match = u.name.match(/^(.*)\s\((.*)\)$/);
        const displayName = match ? match[1] : u.name;
        const displaySpecialty = match ? match[2] : (language === 'bg' ? 'Фитнес инструктор' : 'Fitness Instructor');

        return {
          id: u.id,
          name: displayName,
          specialty: displaySpecialty,
          price: 20, 
          image: u.image || DEFAULT_PROFILE_IMAGE, 
          phone: u.phone || '',
          availability: []
        };
      });

    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users]);

  if (!currentUser) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark">
            <div className="text-center">
                <p className="mb-4 text-slate-400 font-bold">Please log in to view your dashboard.</p>
                <button onClick={() => navigate('/login')} className="px-6 py-3 bg-brand text-dark font-black uppercase rounded-xl hover:bg-white transition-all">{t.login}</button>
            </div>
        </div>
    )
  }

  // Helper to generate Google Calendar Link
  const getGoogleCalendarUrl = (booking: Booking, trainer?: Trainer) => {
    const [year, month, day] = booking.date.split('-');
    const [hour, minute] = booking.time.split(':');
    const startDate = `${year}${month}${day}T${hour}${minute}00`;
    const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
    const endDate = `${year}${month}${day}T${endHour}${minute}00`;
    
    const text = encodeURIComponent(`Training: ${trainer?.specialty || 'Fitness'} with ${trainer?.name}`);
    const details = encodeURIComponent(`Activity: ${trainer?.specialty}\nTrainer: ${trainer?.name}\nLocation: ClassFit Varna (MIR)`);
    const location = encodeURIComponent(`ClassFit Varna, Levski District, MIR, Varna, Bulgaria`);
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  const handleCancelRequest = async (id: string) => {
    try {
      await updateBooking(id, { status: 'cancelled' });
      setCancellingId(null);
    } catch (e) {
      console.error(e);
      alert(language === 'bg' ? 'Неуспешна отмяна.' : 'Failed to cancel.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  const getTrainerImage = (trainer?: Trainer) => {
      if (!trainer || !trainer.image) return DEFAULT_PROFILE_IMAGE;
      return trainer.image;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full p-1 border-2 border-brand/50">
                <img 
                    src={currentUser.image || DEFAULT_PROFILE_IMAGE} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full bg-dark"
                />
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black uppercase italic text-white leading-none mb-2">
                    {currentUser.name}
                </h1>
                <div className="flex flex-col md:flex-row gap-2 items-center justify-center md:justify-start">
                    <span className="text-brand text-[10px] font-black uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">
                        {t.clubMember}
                    </span>
                    <span className="text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Mail size={12} /> {currentUser.email}
                    </span>
                </div>
            </div>
         </div>
         <button 
           onClick={handleLogout}
           className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 hover:text-white text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
         >
           <LogOut size={16} /> {t.logout}
         </button>
      </div>

      <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">{t.myBookings}</h2>
          <span className="bg-brand text-dark text-xs font-black px-3 py-1 rounded-full">{myBookings.length}</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myBookings.length === 0 ? (
            <div className="text-center py-24 bg-surface rounded-[2rem] border border-white/5 border-dashed">
                <p className="text-slate-500 font-medium mb-6">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="px-8 py-4 bg-brand text-dark rounded-full font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-xl shadow-brand/20">
                    {t.makeFirst}
                </button>
            </div>
        ) : (
            myBookings.map(booking => {
                const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
                const isPending = booking.status === 'pending';
                const isConfirmed = booking.status === 'confirmed';
                const isCancelled = booking.status === 'cancelled';
                const isCompleted = booking.status === 'completed';

                return (
                    <div key={booking.id} className="bg-surface border border-white/5 rounded-[2rem] p-8 hover:border-brand/30 transition-all group relative overflow-hidden">
                        
                        <div className="flex flex-col md:flex-row gap-8">
                            
                            {/* 1. Left Side: Trainer Image & Big Status */}
                            <div className="flex flex-col items-center md:items-start gap-4 md:w-48 shrink-0">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-700 shadow-lg">
                                    <img 
                                        src={getTrainerImage(trainer)} 
                                        alt={trainer?.name || 'Trainer'} 
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                    />
                                </div>
                                <div className={`w-full py-2 rounded-xl text-center text-[10px] font-black uppercase tracking-widest border ${
                                    isConfirmed ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    isPending ? 'bg-brand/10 text-brand border-brand/20' :
                                    isCancelled ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    'bg-slate-700/50 text-slate-400 border-white/5'
                                }`}>
                                    {isConfirmed && "Confirmed"}
                                    {isPending && "Pending"}
                                    {isCancelled && "Cancelled"}
                                    {isCompleted && "Completed"}
                                </div>
                            </div>

                            {/* 2. Middle: Details Grid (Filling the space) */}
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="mb-6 text-center md:text-left">
                                    <h3 className="font-black uppercase italic text-2xl text-white leading-tight mb-2">{trainer?.name || 'Unknown Trainer'}</h3>
                                    <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                                        <Activity size={14} />
                                        <span>{trainer?.specialty || 'Training'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <div className="p-2 bg-dark rounded-lg text-brand"><Calendar size={18} /></div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Date</p>
                                            <p className="font-bold text-white">{booking.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <div className="p-2 bg-dark rounded-lg text-brand"><Clock size={18} /></div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Time</p>
                                            <p className="font-bold text-white">{booking.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300 sm:col-span-2">
                                        <div className="p-2 bg-dark rounded-lg text-brand"><MapPin size={18} /></div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Location</p>
                                            <p className="font-bold text-white">ClassFit Varna (MIR)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Right: Action Buttons */}
                            <div className="flex flex-col justify-center gap-3 md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6">
                                {isConfirmed && (
                                    <>
                                        <a 
                                            href={getGoogleCalendarUrl(booking, trainer)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 bg-white/5 hover:bg-white text-slate-400 hover:text-dark rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                                        >
                                            <CalendarPlus size={16} /> Calendar
                                        </a>
                                        {trainer?.phone && (
                                            <a href={`tel:${trainer.phone}`} className="w-full py-3 bg-white/5 hover:bg-green-500 text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                                                <Phone size={16} /> Call
                                            </a>
                                        )}
                                    </>
                                )}

                                {(isPending || isConfirmed) && (
                                    cancellingId === booking.id ? (
                                        <div className="flex flex-col gap-2 p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                                            <p className="text-center text-[10px] text-red-400 font-bold uppercase mb-1">Are you sure?</p>
                                            <button onClick={() => handleCancelRequest(booking.id)} className="w-full py-2 bg-red-500 text-white rounded-lg text-xs font-black uppercase hover:bg-red-600 transition-colors">
                                                Yes, Cancel
                                            </button>
                                            <button onClick={() => setCancellingId(null)} className="w-full py-2 bg-dark text-slate-400 rounded-lg text-xs font-black uppercase hover:text-white transition-colors">
                                                No, Keep
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setCancellingId(booking.id)}
                                            className="w-full py-3 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest border border-transparent hover:border-red-500/30"
                                        >
                                            <Trash2 size={16} /> Cancel
                                        </button>
                                    )
                                )}
                                
                                {isCancelled && (
                                    <div className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 font-medium italic">Session Cancelled</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
