import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Timer, XCircle, Trash2, CheckCircle2, User as UserIcon, Mail, CalendarPlus, Phone, MapPin } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, currentUser, logout } = useAppContext();
  const t = TRANSLATIONS[language];
  const trainers = getTrainers(language);
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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
    
    // Format: YYYYMMDDTHHmmSS
    const startDate = `${year}${month}${day}T${hour}${minute}00`;
    
    // Default 1 hour duration
    const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
    const endDate = `${year}${month}${day}T${endHour}${minute}00`;
    
    const text = encodeURIComponent(`Training with ${trainer?.name} @ ClassFit`);
    const details = encodeURIComponent(`Your training session at ClassFit Varna has been confirmed.\n\nTrainer: ${trainer?.name}\nSpecialty: ${trainer?.specialty}\n\nThank you for choosing ClassFit!`);
    const location = encodeURIComponent(`ClassFit Varna, Levski District, Mir Bus Stop, Varna, Bulgaria`);
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  // Filter bookings for this user
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16 pb-16 border-b border-white/5">
         <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-white/5 rounded-full text-xs font-black uppercase tracking-widest text-white">
                    <UserIcon size={14} className="text-brand" /> {t.clubMember}
                </div>
                {/* Email Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/5 bg-surface rounded-full text-xs font-bold text-slate-400">
                    <Mail size={14} /> {currentUser.email}
                </div>
            </div>
            
            <h1 className="text-5xl font-black uppercase italic mb-2 tracking-tighter leading-none text-white">{t.hello}, <span className="text-brand">{currentUser.name.split(' ')[0]}</span></h1>
            <p className="text-slate-400 font-medium italic">{t.welcomeBackUser}</p>
         </div>
         <button 
           onClick={handleLogout}
           className="px-6 py-3 border-2 border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:border-red-500 hover:text-red-500 transition-all bg-surface hover:bg-surface/50"
         >
           {t.logout}
         </button>
      </div>

      <div className="mb-8 flex items-center gap-4">
          <h2 className="text-xl font-black uppercase italic tracking-tight text-white">{t.myBookings}</h2>
          <span className="bg-brand text-dark text-xs font-black px-2 py-1 rounded-md">{myBookings.length}</span>
      </div>

      <div className="space-y-6">
        {myBookings.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-3xl border border-white/5 border-dashed">
                <p className="text-slate-500 font-medium">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="mt-4 text-brand font-black uppercase text-xs tracking-widest hover:text-white transition-colors">{t.makeFirst}</button>
            </div>
        ) : (
            myBookings.map(booking => {
                const trainer = trainers.find(tr => tr.id === booking.trainerId);
                const isPending = booking.status === 'pending';
                const isConfirmed = booking.status === 'confirmed';
                
                return (
                    <div key={booking.id} className="bg-surface border border-white/5 rounded-[2.5rem] p-8 hover:border-brand/30 transition-all group relative overflow-hidden">
                        
                        <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            {/* Left: Trainer Image */}
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-dark overflow-hidden shrink-0 border border-white/5 shadow-2xl">
                                <img src={trainer?.image} alt={trainer?.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                            </div>

                            {/* Middle: Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                                    <div>
                                        <h3 className="font-black uppercase italic text-2xl text-white leading-none mb-2">{trainer?.name}</h3>
                                        <p className="text-brand text-xs font-black uppercase tracking-widest">{trainer?.specialty}</p>
                                    </div>
                                    
                                    {/* Status Badge */}
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                        booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        booking.status === 'pending' ? 'bg-brand text-dark' :
                                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                        'bg-white/5 text-slate-500'
                                    }`}>
                                        {booking.status === 'confirmed' && <CheckCircle2 size={14} />}
                                        {booking.status === 'pending' && <Timer size={14} />}
                                        {booking.status === 'cancelled' && <XCircle size={14} />}
                                        {booking.status === 'completed' && <CheckCircle size={14} />}
                                        {t[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}` as keyof typeof t]}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 my-6">
                                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                        <Calendar size={18} className="text-slate-400" />
                                        <span className="text-sm font-bold text-white">{booking.date}</span>
                                    </div>
                                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                        <Clock size={18} className="text-slate-400" />
                                        <span className="text-sm font-bold text-white">{booking.time}</span>
                                    </div>
                                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                        <MapPin size={18} className="text-slate-400" />
                                        <span className="text-sm font-bold text-white">ClassFit Varna (Mir Stop)</span>
                                    </div>
                                </div>
                                
                                {isConfirmed && (
                                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                                    {/* Add to Calendar Button */}
                                    <a 
                                      href={getGoogleCalendarUrl(booking, trainer)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-5 py-3 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-brand/10"
                                    >
                                      <CalendarPlus size={14} /> {language === 'bg' ? 'Добави в Календар' : 'Add to Calendar'}
                                    </a>

                                    {/* Call Trainer Button */}
                                    {trainer?.phone && (
                                        <a href={`tel:${trainer.phone}`} className="px-5 py-3 bg-surface border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-2">
                                            <Phone size={14} /> {language === 'bg' ? 'Обади се на треньора' : 'Call Trainer'}
                                        </a>
                                    )}

                                    {/* Call Gym Button */}
                                    <a href={`tel:${t.gymPhone}`} className="px-5 py-3 bg-surface border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-2">
                                        <Phone size={14} /> {language === 'bg' ? 'Рецепция' : 'Call Reception'}
                                    </a>
                                  </div>
                                )}
                            </div>
                        </div>

                        {/* Cancel Button (Absolute Top Right for Layout) */}
                        {(isPending || isConfirmed) && (
                            <div className="absolute top-8 right-8 hidden md:block">
                                {cancellingId === booking.id ? (
                                     <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 bg-dark/50 p-2 rounded-xl backdrop-blur-sm">
                                         <span className="text-xs text-red-500 font-bold mr-2">{t.sure}</span>
                                         <button onClick={() => handleCancelRequest(booking.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-quick"><CheckCircle size={16}/></button>
                                         <button onClick={() => setCancellingId(null)} className="p-2 bg-white/10 text-slate-400 rounded-lg hover:bg-white/20 hover:text-white transition-quick"><XCircle size={16}/></button>
                                     </div>
                                 ) : (
                                    <button 
                                        onClick={() => setCancellingId(booking.id)}
                                        className="p-2 text-slate-600 hover:text-red-500 transition-all"
                                        title={t.cancelReq}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                 )}
                            </div>
                        )}
                        
                        {/* Mobile Cancel Button */}
                        {(isPending || isConfirmed) && (
                            <div className="mt-6 md:hidden flex justify-center border-t border-white/5 pt-4">
                                {cancellingId === booking.id ? (
                                     <div className="flex items-center gap-4 w-full justify-between bg-red-500/10 p-4 rounded-xl">
                                         <span className="text-xs text-red-500 font-bold">{t.sure}</span>
                                         <div className="flex gap-2">
                                            <button onClick={() => handleCancelRequest(booking.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold">Yes, Cancel</button>
                                            <button onClick={() => setCancellingId(null)} className="px-4 py-2 bg-dark text-slate-400 rounded-lg text-xs font-bold">No</button>
                                         </div>
                                     </div>
                                 ) : (
                                    <button 
                                        onClick={() => setCancellingId(booking.id)}
                                        className="w-full py-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={14} /> {t.cancelReq}
                                    </button>
                                 )}
                            </div>
                        )}

                    </div>
                )
            })
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;