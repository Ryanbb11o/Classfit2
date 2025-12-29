
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, Timer, XCircle, Trash2, CheckCircle2, User as UserIcon, Mail, CalendarPlus, Phone, MapPin, ChevronRight, LogOut, Dumbbell, Activity } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, currentUser, logout, users } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // 1. COMBINE STATIC AND DYNAMIC TRAINERS TO ENSURE WE FIND EVERYONE
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
          name: displayName, // Clean name
          specialty: displaySpecialty, // Extracted specialty
          price: 20, 
          image: u.image || DEFAULT_PROFILE_IMAGE, 
          phone: u.phone || '',
          availability: []
        };
      });

    // Merge arrays, preferring dynamic if ID conflicts
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

  // Helper to safely get trainer image
  const getTrainerImage = (trainer?: Trainer) => {
      if (!trainer || !trainer.image) return DEFAULT_PROFILE_IMAGE;
      return trainer.image;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
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
                <div className="flex flex-col md:flex-row gap-2 items-center">
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

      <div className="space-y-4">
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
                    <div key={booking.id} className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-brand/30 transition-all group flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                        
                        {/* 1. Trainer Avatar */}
                        <div className="shrink-0 relative">
                            <img 
                                src={getTrainerImage(trainer)} 
                                alt={trainer?.name || 'Trainer'} 
                                className="w-16 h-16 rounded-2xl object-cover bg-dark" 
                            />
                            <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg border-2 border-surface ${
                                isConfirmed ? 'bg-green-500 text-dark' :
                                isPending ? 'bg-brand text-dark' :
                                isCancelled ? 'bg-red-500 text-white' :
                                'bg-slate-600 text-white'
                            }`}>
                                {isConfirmed && <CheckCircle2 size={12} />}
                                {isPending && <Timer size={12} />}
                                {isCancelled && <XCircle size={12} />}
                                {isCompleted && <CheckCircle size={12} />}
                            </div>
                        </div>

                        {/* 2. Main Info */}
                        <div className="flex-1 text-center md:text-left min-w-0 w-full">
                            <h3 className="font-black uppercase italic text-lg text-white leading-tight mb-3 truncate">{trainer?.name || 'Unknown Trainer'}</h3>
                            
                            {/* Updated Metadata Section: Focus on Activity instead of Location */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-400">
                                
                                {/* Activity Type (Specialty) - Highlighted */}
                                <div className="flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-lg">
                                    <Activity size={14} />
                                    <span className="font-black uppercase tracking-wider">{trainer?.specialty || 'Training'}</span>
                                </div>

                                <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-500" /> {booking.date}</span>
                                <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-500" /> {booking.time}</span>
                            </div>
                        </div>

                        {/* 3. Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                             {isConfirmed && (
                                <>
                                    <a 
                                        href={getGoogleCalendarUrl(booking, trainer)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/5 hover:bg-white text-slate-400 hover:text-dark rounded-xl transition-all"
                                        title={language === 'bg' ? 'Добави в Календар' : 'Add to Calendar'}
                                    >
                                        <CalendarPlus size={18} />
                                    </a>
                                    {trainer?.phone && (
                                        <a href={`tel:${trainer.phone}`} className="p-3 bg-white/5 hover:bg-green-500 text-slate-400 hover:text-white rounded-xl transition-all" title="Call Trainer">
                                            <Phone size={18} />
                                        </a>
                                    )}
                                </>
                             )}

                             {(isPending || isConfirmed) && (
                                cancellingId === booking.id ? (
                                    <div className="flex items-center gap-2 bg-red-500/10 p-1 rounded-xl">
                                        <button onClick={() => handleCancelRequest(booking.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">Confirm</button>
                                        <button onClick={() => setCancellingId(null)} className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-colors">Back</button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setCancellingId(booking.id)}
                                        className="p-3 bg-white/5 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-all"
                                        title={t.cancelReq}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )
                             )}
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
