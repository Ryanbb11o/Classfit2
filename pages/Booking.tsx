
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, User, Phone, X, Mail, Loader2, ChevronLeft, ChevronRight, ArrowLeft, Star, Award, Zap, Quote, ThumbsUp, MapPin } from 'lucide-react';
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
          bio: u.bio || '',
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
  const [customerEmail, setCustomerEmail] = useState<string | undefined>(undefined);
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
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1; 

    const days = [];
    for (let i = 0; i < startDayIndex; i++) {
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
      await finalizeBooking(currentUser.name, undefined, currentUser.id, currentUser.email);
    } else {
      setShowGuestForm(true);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName && guestPhone && guestEmail) {
      await finalizeBooking(guestName, guestPhone, undefined, guestEmail);
    }
  };

  const finalizeBooking = async (name: string, phone?: string, userId?: string, email?: string) => {
    if (!selectedTrainer || !selectedTime || !selectedDate) return;
    setIsSubmitting(true);
    const offset = selectedDate.getTimezoneOffset();
    const localDate = new Date(selectedDate.getTime() - (offset*60*1000));
    const formattedDate = localDate.toISOString().split('T')[0];

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      trainerId: selectedTrainer.id,
      userId: userId, 
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      language: language,
      date: formattedDate,
      time: selectedTime,
      price: selectedTrainer.price,
      status: 'pending',
    };

    try {
      await addBooking(newBooking);
      setLastBooking(newBooking);
      setCustomerEmail(email);
      setShowGuestForm(false);
      setIsSuccess(true);
    } catch (error) {
      console.error("Booking failed:", error);
      alert(language === 'bg' ? 'Грешка. Моля опитайте пак.' : 'Error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && lastBooking) {
    return (
      <div className="max-w-xl mx-auto py-32 px-4 text-center animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black uppercase italic mb-4 text-white tracking-tighter">{t.reqSent}</h2>
        <p className="text-slate-400 mb-8 text-sm">{t.confirmText}</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {currentUser && (
            <button onClick={() => navigate('/profile')} className="w-full py-4 bg-white text-dark rounded-full font-black uppercase tracking-widest text-xs hover:bg-brand transition-all">
              {t.myBookings}
            </button>
          )}
          <button onClick={() => { setIsSuccess(false); setSelectedTrainer(null); }} className="w-full py-4 bg-surface text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
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
              {language === 'bg' ? 'Изберете Вашия Професионалист' : 'Select Your Professional Coach'}
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
                   <img 
                      src={trainer.image} 
                      alt={trainer.name} 
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                   />
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
        <div className="max-w-7xl mx-auto px-6 animate-in slide-in-from-bottom-4 duration-500">
          
          <button 
            onClick={() => { setSelectedTrainer(null); setSelectedTime(null); }}
            className="mb-12 flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[9px] transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {language === 'bg' ? 'Всички Треньори' : 'All Coaches'}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* LEFT: COACH DETAILS */}
            <div className="lg:col-span-4 space-y-12">
               <div className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-surface shadow-2xl">
                  <img 
                    src={selectedTrainer.image} 
                    alt={selectedTrainer.name} 
                    className="w-full aspect-[4/5] object-cover grayscale-0"
                  />
                  {/* Centered Profile Text */}
                  <div className="p-8 text-center">
                     <h2 className="text-3xl font-black uppercase italic text-white mb-2 leading-none">{selectedTrainer.name}</h2>
                     <p className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-6">{selectedTrainer.specialty}</p>
                     
                     <div className="space-y-4 pt-6 border-t border-white/5 flex flex-col items-center">
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <Award className="text-brand" size={16} /> 5+ Years Experience
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <Zap className="text-brand" size={16} /> Performance Focused
                        </div>
                     </div>
                  </div>
               </div>

               {/* Centered Bio Header & Text */}
               <div className="px-2 text-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-6 italic">Background</h3>
                  <p className="text-slate-400 leading-relaxed font-medium italic text-sm">
                      {selectedTrainer.bio || 'Professional fitness guidance focused on achieving peak physical results and sustainable health habits.'}
                  </p>
               </div>
            </div>

            {/* RIGHT: BOOKING BLOCK */}
            <div className="lg:col-span-8">
               <div className="bg-surface/30 backdrop-blur-sm rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl">
                  
                  {/* Calendar Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                     <h3 className="text-xl font-black uppercase italic text-white">
                        {language === 'bg' ? 'График' : 'Calendar'}
                     </h3>
                     <div className="flex items-center gap-3">
                         <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all border border-white/5">
                            <ChevronLeft size={16} />
                         </button>
                         <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/5 min-w-[120px] text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">
                               {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </span>
                         </div>
                         <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all border border-white/5">
                            <ChevronRight size={16} />
                         </button>
                     </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="mb-12">
                      <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                         {weekDays.map(day => (
                            <div key={day} className="text-[9px] font-black text-slate-600 uppercase">
                               {day}
                            </div>
                         ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2 place-items-center">
                         {renderCalendar()}
                      </div>
                  </div>

                  {/* Slots Grid */}
                  <div className="pt-10 border-t border-white/5 mb-12">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6 italic">Available Times</h3>
                     <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {selectedTrainer.availability.map(time => (
                           <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                 selectedTime === time
                                    ? 'bg-brand text-dark border-brand shadow-lg shadow-brand/10'
                                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand/40'
                              }`}
                           >
                              {time}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Summary & Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-6">
                      <div className="text-center sm:text-left">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Session Rate</p>
                          <div className="text-3xl font-black uppercase italic text-white leading-none">
                              {selectedTrainer.price} <span className="text-sm text-slate-500 font-bold not-italic">BGN</span>
                          </div>
                      </div>

                      <button 
                         onClick={initiateBooking}
                         disabled={!selectedTime || isSubmitting}
                         className={`w-full sm:w-auto px-12 py-5 rounded-full font-black uppercase italic tracking-[0.2em] text-xs transition-all shadow-xl flex items-center justify-center gap-3 ${
                            selectedTime && !isSubmitting
                               ? 'bg-brand text-dark hover:scale-105 shadow-brand/20'
                               : 'bg-white/5 text-slate-700 cursor-not-allowed shadow-none border border-white/5'
                         }`}
                      >
                         {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (language === 'bg' ? 'Запази' : 'Confirm Session')}
                      </button>
                  </div>

                  {/* CLIENT TESTIMONIALS SECTION */}
                  <div className="mt-20 pt-12 border-t border-white/5">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black uppercase italic text-white flex items-center gap-3">
                           <ThumbsUp size={14} className="text-brand" /> Client Testimonials
                        </h3>
                        <div className="flex items-center gap-1">
                            <Star size={12} className="text-brand fill-brand" />
                            <span className="text-[10px] font-black text-white">5.0 RATING</span>
                        </div>
                     </div>

                     <div className="space-y-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-4">
                        {trainerReviews.map((review, i) => (
                           <div key={i} className="group relative">
                              <div className="flex items-start gap-4 mb-2">
                                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] text-brand shrink-0">
                                    {review.avatar}
                                 </div>
                                 <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                       <span className="text-[11px] font-black text-white uppercase italic">{review.author}</span>
                                       <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{review.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
                                       "{review.text}"
                                    </p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

               </div>
            </div>

          </div>
        </div>
      )}

      {/* Guest Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-surface rounded-[2rem] p-8 md:p-10 max-w-sm w-full shadow-2xl relative border border-white/10">
              <button onClick={() => setShowGuestForm(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black uppercase italic mb-6 text-white tracking-tighter">{t.finalize}</h2>
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <input 
                  type="text" required value={guestName} placeholder={t.name}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand"
                />
                <input 
                  type="tel" required value={guestPhone} placeholder={t.phone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand"
                />
                <input 
                  type="email" required value={guestEmail} placeholder="Email"
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand"
                />
                <button type="submit" className="w-full bg-brand text-dark py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg mt-4">
                   {t.confirmBooking}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
