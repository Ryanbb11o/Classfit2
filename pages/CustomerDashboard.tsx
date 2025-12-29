
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, Timer, XCircle, Trash2, CheckCircle2, User as UserIcon, Mail, CalendarPlus, Phone, MapPin, ChevronRight } from 'lucide-react';
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
        const match = u.name.match(/^(.*)\s\((.*)\)$/);
        const displayName = match ? match[1] : u.name;
        const displaySpecialty = match ? match[2] : (language === 'bg' ? 'Персонален треньор' : 'Personal Trainer');

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

    // Merge arrays, preferring dynamic if ID conflicts (unlikely with UUIDs)
    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users]);

  if (!currentUser) {
    return (
        <div className="min-h-screen flex items-center justify-center">
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
    
    const text = encodeURIComponent(`Training with ${trainer?.name} @ ClassFit`);
    const details = encodeURIComponent(`Your training session at ClassFit Varna has been confirmed.\n\nTrainer: ${trainer?.name}\nSpecialty: ${trainer?.specialty}\n\nThank you for choosing ClassFit!`);
    const location = encodeURIComponent(`ClassFit Varna, Levski District, Mir Bus Stop, Varna, Bulgaria`);
    
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
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Profile Header - Compact Version */}
      <div className="bg-surface rounded-[2rem] p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full border-2 border-brand p-1">
                <img 
                    src={currentUser.image || DEFAULT_PROFILE_IMAGE} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase italic text-white leading-none mb-1">
                    {currentUser.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                    <span className="text-brand text-xs font-black uppercase tracking-widest bg-brand/10 px-2 py-1 rounded">
                        {t.clubMember}
                    </span>
                    <span className="text-slate-400 text-xs font-bold px-2 py-1 bg-white/5 rounded flex items-center gap-1">
                        <Mail size={10} /> {currentUser.email}
                    </span>
                </div>
            </div>
         </div>
         <button 
           onClick={handleLogout}
           className="px-6 py-2 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-dark transition-all whitespace-nowrap"
         >
           {t.logout}
         </button>
      </div>

      <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-black uppercase italic tracking-tight text-white">{t.myBookings}</h2>
          <span className="bg-brand text-dark text-xs font-black px-2 py-1 rounded-md">{myBookings.length}</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myBookings.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-3xl border border-white/5 border-dashed">
                <p className="text-slate-500 font-medium mb-4">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="px-6 py-3 bg-brand text-dark rounded-full font-black uppercase text-xs tracking-widest hover:bg-white transition-colors shadow-lg shadow-brand/20">
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
                    <div key={booking.id} className="bg-surface border border-white/5 rounded-2xl p-5 hover:border-brand/30 transition-all group relative overflow-hidden flex flex-col md:flex-row gap-6">
                        
                        {/* 1. Image & Status Section */}
                        <div className="flex items-center gap-4 min-w-[200px]">
                            <img 
                                src={getTrainerImage(trainer)} 
                                alt={trainer?.name || 'Trainer'} 
                                className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 bg-dark" 
                            />
                            <div>
                                <h3 className="font-black uppercase italic text-lg text-white leading-none mb-1">{trainer?.name || 'Unknown Trainer'}</h3>
                                <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                    isConfirmed ? 'bg-green-500/10 text-green-500' :
                                    isPending ? 'bg-brand/10 text-brand' :
                                    isCancelled ? 'bg-red-500/10 text-red-500' :
                                    'bg-slate-700/50 text-slate-400'
                                }`}>
                                    {isConfirmed && <CheckCircle2 size={10} />}
                                    {isPending && <Timer size={10} />}
                                    {isCancelled && <XCircle size={10} />}
                                    {isCompleted && <CheckCircle size={10} />}
                                    {t[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}` as keyof typeof t]}
                                </div>
                            </div>
                        </div>

                        {/* 2. Details Section */}
                        <div className="flex-1 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm md:border-l md:border-white/5 md:pl-6">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Calendar size={14} className="text-brand" />
                                <span className="font-bold">{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <Clock size={14} className="text-brand" />
                                <span className="font-bold">{booking.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <MapPin size={14} className="text-brand" />
                                <span className="font-bold">ClassFit Varna (Mir)</span>
                            </div>
                        </div>

                        {/* 3. Actions Section */}
                        <div className="flex items-center justify-end gap-2 md:border-l md:border-white/5 md:pl-6">
                             {isConfirmed && (
                                <>
                                    <a 
                                        href={getGoogleCalendarUrl(booking, trainer)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-brand transition-colors"
                                        title={language === 'bg' ? 'Добави в Календар' : 'Add to Calendar'}
                                    >
                                        <CalendarPlus size={18} />
                                    </a>
                                    {trainer?.phone && (
                                        <a href={`tel:${trainer.phone}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-green-500 transition-colors" title="Call Trainer">
                                            <Phone size={18} />
                                        </a>
                                    )}
                                </>
                             )}

                             {(isPending || isConfirmed) && (
                                cancellingId === booking.id ? (
                                    <div className="flex items-center gap-2 bg-red-900/20 p-1 rounded-lg">
                                        <button onClick={() => handleCancelRequest(booking.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold">Confirm</button>
                                        <button onClick={() => setCancellingId(null)} className="px-3 py-1 bg-white/10 text-white rounded text-xs">No</button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setCancellingId(booking.id)}
                                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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
