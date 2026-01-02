
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, User, Phone, X, Mail, Loader2, ChevronLeft, ChevronRight, ArrowLeft, Star, Award, Zap, Quote, ThumbsUp, MapPin, Target, ShieldCheck, CalendarPlus, MessageSquare } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getTrainers, TRANSLATIONS, DEFAULT_PROFILE_IMAGE, getTrainerReviews } from '../constants';
import { Trainer, Booking } from '../types';

const BookingPage: React.FC = () => {
  const { language, addBooking, currentUser, users } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const trainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
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
          bio: u.bio || (language === 'bg' ? 'Професионален инструктор с богат опит.' : 'Professional instructor with extensive experience.'),
          availability: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00', '17:00']
        };
      });

    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users]);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const trainerReviews = useMemo(() => {
    if (!selectedTrainer) return [];
    return getTrainerReviews(selectedTrainer.id, language);
  }, [selectedTrainer, language]);

  useEffect(() => {
    if (selectedTrainer) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTrainer]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate >= today) {
        setSelectedDate(newDate);
        setSelectedTime(null);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth); 
    const startDayIndex = firstDay === 0 ? { start: 6 } : { start: firstDay - 1 }; 

    const days = [];
    for (let i = 0; i < startDayIndex.start; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate.toDateString() === currentDate.toDateString();
        const isToday = today.toDateString() === currentDate.toDateString();
        const isPast = currentDate < today;

        days.push(
            <button
                key={i}
                onClick={() => handleDateClick(i)}
                disabled={isPast}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300
                    ${isSelected 
                        ? 'bg-brand text-dark shadow-md shadow-brand/20 scale-110' 
                        : isPast 
                            ? 'text-slate-700 cursor-not-allowed' 
                            : 'text-white/60 hover:text-brand hover:bg-white/5'
                    }
                    ${isToday && !isSelected ? 'border border-brand/40 text-brand' : ''}
                `}
            >
                {i}
            </button>
        );
    }
    return days;
  };

  const monthNames = language === 'bg' 
    ? ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDays = language === 'bg'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const initiateBooking = async () => {
    if (!selectedTrainer || !selectedTime || !selectedDate) return;
    if (currentUser) {
      await finalizeBooking(currentUser.name, currentUser.phone, currentUser.id, currentUser.email);
    } else {
      setShowGuestForm(true);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName && guestPhone && guestEmail) {
      await finalizeBooking(guestName, guestPhone, undefined, guestEmail);
    } else {
      alert(language === 'bg' ? 'Моля попълнете всички полета.' : 'Please fill all fields.');
    }
  };

  const finalizeBooking = async (name: string, phone?: string, userId?: string, email?: string) => {
    if (!selectedTrainer || !selectedTime || !selectedDate) return;
    setIsSubmitting(true);
    
    const offset = selectedDate.getTimezoneOffset();
    const localDate = new Date(selectedDate.getTime() - (offset*60*1000));
    const formattedDate = localDate.toISOString().split('T')[0];

    const bookingId = Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const newBooking: Booking = {
      id: String(bookingId),
      checkInCode: bookingId.substring(0, 6),
      trainerId: String(selectedTrainer.id),
      userId: userId ? String(userId) : undefined, 
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      language: language,
      date: formattedDate,
      time: selectedTime,
      duration: 60,
      price: selectedTrainer.price,
      status: 'pending',
      gymAddress: 'бул. „Осми приморски полк“ 128 (Спирка МИР)'
    };

    try {
      await addBooking(newBooking);
      setLastBooking(newBooking);
      setShowGuestForm(false);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Booking caught error:", error);
      alert(language === 'bg' ? 'Грешка при резервация.' : 'Booking error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGoogleCalendarUrl = (booking: Booking, trainer?: Trainer) => {
    const [year, month, day] = booking.date.split('-');
    const [hour, minute] = booking.time.split(':');
    const startDate = `${year}${month}${day}T${hour.replace(':','')}${minute.replace(':','')}00`;
    const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
    const endDate = `${year}${month}${day}T${endHour}${minute}00`;
    
    const text = encodeURIComponent(`ClassFit Session with ${trainer?.name}`);
    const details = encodeURIComponent(`Trainer: ${trainer?.name}\nSpecialty: ${trainer?.specialty}\nLocation: ClassFit Varna (near Bus Stop Mir)`);
    const location = encodeURIComponent(`бул. „Осми приморски полк“ 128, Варна`);
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  if (isSuccess && lastBooking && selectedTrainer) {
    return (
      <div className="max-w-xl mx-auto py-32 px-4 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand/20">
            <Check size={40} strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black uppercase italic mb-4 text-white tracking-tighter leading-none">{t.reqSent}</h2>
          <p className="text-slate-400 mb-2 text-sm max-w-sm mx-auto">{t.trainerReviewMsg}</p>
        </div>

        <div className="bg-brand/10 border border-brand/20 rounded-2xl p-6 mb-8 text-center animate-in slide-in-from-bottom-2 duration-700 delay-300">
            <div className="flex items-center justify-center gap-3 text-brand mb-2">
                <Mail size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.emailConfirmMsg}</span>
            </div>
            <p className="text-white font-bold text-sm underline decoration-brand/50 underline-offset-4">{lastBooking.customerEmail}</p>
        </div>

        <div className="bg-surface border border-white/5 rounded-[2.5rem] p-8 mb-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand mb-6 italic">Session Confirmation</h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between group/row">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover/row:text-brand transition-colors">
                       <User size={18} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.trainerPhoneLabel}</p>
                       <p className="text-white font-bold text-sm uppercase italic">{selectedTrainer.name}</p>
                    </div>
                 </div>
                 <a href={`tel:${selectedTrainer.phone}`} className="p-3 bg-brand text-dark rounded-full hover:scale-110 transition-transform shadow-lg shadow-brand/10">
                    <Phone size={18} />
                 </a>
              </div>
           </div>
           <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
              <a 
                href={getGoogleCalendarUrl(lastBooking, selectedTrainer)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white hover:text-dark transition-all"
              >
                <CalendarPlus size={16} /> {t.saveToCalendar}
              </a>
           </div>
        </div>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {currentUser && (
            <button onClick={() => navigate('/profile')} className="w-full py-4 bg-white text-dark rounded-full font-black uppercase tracking-widest text-xs hover:bg-brand transition-all">
              {t.myBookings}
            </button>
          )}
          <button onClick={() => { setIsSuccess(false); setSelectedTrainer(null); }} className="w-full py-4 bg-surface text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5">
            {t.newBooking}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 animate-in fade-in duration-700">
      {!selectedTrainer ? (
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic mb-4 tracking-tighter text-white">{t.booking}</h1>
            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
              {language === 'bg' ? 'ClassFit Варна • сп. Мир • Изберете Вашия Професионалист' : 'ClassFit Varna • Mir Stop • Select Your Professional Coach'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer) => (
              <div 
                key={trainer.id}
                onClick={() => setSelectedTrainer(trainer)}
                className="group relative bg-surface/50 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                   <img src={trainer.image} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent"></div>
                   <div className="absolute bottom-0 left-0 p-6 w-full">
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand mb-1">{trainer.specialty}</p>
                      <h3 className="text-xl font-black uppercase italic text-white leading-tight">{trainer.name}</h3>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 animate-in slide-in-from-bottom-4 duration-500 relative">
          <button onClick={() => { setSelectedTrainer(null); setSelectedTime(null); }} className="mb-12 flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[9px] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {language === 'bg' ? 'Всички Треньори' : 'All Coaches'}
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Profile, Bio, Experience & Reviews */}
            <div className="lg:col-span-4 space-y-8">
               <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-surface shadow-2xl">
                  <div className="aspect-[4/5] relative overflow-hidden"><img src={selectedTrainer.image} className="w-full h-full object-cover grayscale-0" /></div>
                  <div className="p-10">
                     <div className="text-center mb-8">
                        <h2 className="text-4xl font-black uppercase italic text-white mb-2 leading-tight tracking-tighter">{selectedTrainer.name}</h2>
                        <div className="inline-block px-4 py-1.5 bg-brand text-dark rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{selectedTrainer.specialty}</div>
                     </div>
                     
                     {/* Bio / Experience Section */}
                     <div className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                                <Award size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Professional Bio</h4>
                                <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
                                    {selectedTrainer.bio}
                                </p>
                            </div>
                        </div>

                        {/* Trainer Reviews Preview */}
                        <div className="pt-6 border-t border-white/5">
                           <div className="flex items-center justify-between mb-4 px-1">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                 <MessageSquare size={14} className="text-brand" /> Member Reviews
                              </h4>
                              <span className="text-brand text-[10px] font-black uppercase tracking-widest">
                                 {trainerReviews.length} Total
                              </span>
                           </div>
                           
                           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {trainerReviews.map((review, i) => (
                                 <div key={i} className="p-4 bg-dark/40 rounded-2xl border border-white/5 space-y-2">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-brand text-dark text-[8px] font-black flex items-center justify-center">{review.avatar}</div>
                                          <span className="text-[10px] font-bold text-white uppercase italic">{review.author}</span>
                                       </div>
                                       <div className="flex gap-0.5">
                                          {[...Array(review.rating)].map((_, j) => (
                                             <Star key={j} size={8} className="text-brand fill-brand" />
                                          ))}
                                       </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                                       "{review.text}"
                                    </p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Calendar and Booking */}
            <div className="lg:col-span-8">
               <div className="bg-surface/30 backdrop-blur-sm rounded-[3rem] border border-white/5 p-8 md:p-12 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand"><CalendarIcon size={20} /></div>
                        <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">Session Schedule</h3>
                     </div>
                     <div className="flex items-center gap-2">
                         <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all border border-white/5"><ChevronLeft size={18} /></button>
                         <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5 min-w-[140px] text-center">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                         </div>
                         <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all border border-white/5"><ChevronRight size={18} /></button>
                     </div>
                  </div>
                  <div className="mb-16">
                      <div className="grid grid-cols-7 gap-1 mb-6 text-center">{weekDays.map(day => (<div key={day} className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{day}</div>))}</div>
                      <div className="grid grid-cols-7 gap-3 place-items-center">{renderCalendar()}</div>
                  </div>
                  <div className="pt-12 border-t border-white/5 mb-12">
                     <div className="flex items-center gap-3 mb-8"><Clock className="text-brand" size={16} /><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Available Time Slots</h3></div>
                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {selectedTrainer.availability.map(time => (
                           <button key={time} onClick={() => setSelectedTime(time)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedTime === time ? 'bg-brand text-dark border-brand shadow-lg shadow-brand/10' : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand/40'}`}>{time}</button>
                        ))}
                     </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-10 pt-10 border-t border-white/5">
                      <div className="text-center sm:text-left"><p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Total</p><div className="text-4xl font-black uppercase italic text-white leading-none tracking-tighter">{selectedTrainer.price} <span className="text-lg text-brand font-bold not-italic ml-1">BGN</span></div></div>
                      <button onClick={initiateBooking} disabled={!selectedTime || isSubmitting} className={`w-full sm:w-auto px-16 py-6 rounded-full font-black uppercase italic tracking-[0.2em] text-xs transition-all shadow-xl flex items-center justify-center gap-3 ${selectedTime && !isSubmitting ? 'bg-brand text-dark hover:scale-105 shadow-brand/20' : 'bg-white/5 text-slate-700 cursor-not-allowed border border-white/5'}`}>
                         {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (language === 'bg' ? 'Запази час' : 'Confirm Session')}
                      </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
      {showGuestForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-surface rounded-[3rem] p-10 md:p-12 max-w-md w-full shadow-2xl relative border border-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
              <button onClick={() => setShowGuestForm(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all bg-white/5 p-2 rounded-full"><X size={20} /></button>
              <div className="mb-8"><h2 className="text-3xl font-black uppercase italic text-white tracking-tighter mb-2">{t.finalize}</h2><p className="text-slate-500 text-xs font-medium">Please provide contact details to finalize your ClassFit booking.</p></div>
              <form handleGuestSubmit={handleGuestSubmit} className="space-y-4">
                <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Name</label><input type="text" required value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full bg-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand transition-all" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Phone</label><input type="tel" required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full bg-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand transition-all" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Email</label><input type="email" required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full bg-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand transition-all" /></div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-brand text-dark py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/10 mt-6 hover:scale-[1.02] transition-all">
                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : t.confirmBooking}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
