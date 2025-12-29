
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Timer, XCircle, Trash2, CheckCircle2, User as UserIcon, Mail, ExternalLink, Phone } from 'lucide-react';
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
                <p className="mb-4 text-slate-400 font-bold">Моля, влезте в профила си.</p>
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
    
    const text = encodeURIComponent(`Training with ${trainer?.name} @ ClassFit Varna`);
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

      <div className="space-y-4">
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
                    <div key={booking.id} className="bg-surface border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-brand/30 transition-all group">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="w-16 h-16 rounded-2xl bg-dark overflow-hidden shrink-0 border border-white/5">
                                <img src={trainer?.image} alt={trainer?.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black uppercase italic text-lg text-white">{trainer?.name}</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={14}/> {booking.date}</span>
                                    <span className="flex items-center gap-1"><Clock size={14}/> {booking.time}</span>
                                </div>
                                
                                {isConfirmed && (
                                  <div className="mt-4 flex flex-col gap-2">
                                    {/* Contact Info */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                            <span className="text-brand">{t.trainerPhoneLabel}:</span> 
                                            <a href={`tel:${trainer?.phone}`} className="hover:text-white transition-colors flex items-center gap-1">
                                                <Phone size={10} /> {trainer?.phone}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                            <span className="text-brand">{t.gymPhoneLabel}:</span>
                                            <a href={`tel:${t.gymPhone}`} className="hover:text-white transition-colors flex items-center gap-1">
                                                <Phone size={10} /> {t.gymPhone}
                                            </a>
                                        </div>
                                    </div>
                                    
                                    {/* Save to Calendar Link */}
                                    <a 
                                      href={getGoogleCalendarUrl(booking, trainer)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 mt-1 text-[10px] font-black uppercase tracking-widest text-brand hover:text-white transition-quick"
                                    >
                                      <ExternalLink size={12} /> {t.saveToCalendar}
                                    </a>
                                  </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
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

                             {(isPending || isConfirmed) && (
                                 cancellingId === booking.id ? (
                                     <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                         <span className="text-xs text-red-500 font-bold">{t.sure}</span>
                                         <button onClick={() => handleCancelRequest(booking.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-quick"><CheckCircle size={16}/></button>
                                         <button onClick={() => setCancellingId(null)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 hover:text-white transition-quick"><XCircle size={16}/></button>
                                     </div>
                                 ) : (
                                    <button 
                                        onClick={() => setCancellingId(booking.id)}
                                        className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
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
