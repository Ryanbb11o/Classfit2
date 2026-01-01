
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, Info, User, Phone, X, LogIn, Mail, Loader2, ChevronLeft, ChevronRight, ArrowLeft, Instagram, Award, Star, Activity, Briefcase } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getTrainers, TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
import { Trainer, Booking } from '../types';

const BookingPage: React.FC = () => {
  const { language, addBooking, currentUser, users } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  // --- 1. Data Preparation ---
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
          philosophy: u.bio || (language === 'bg' ? 'Винаги 100% във всяка серия.' : 'Always 100% in every set.'),
          experienceYears: 4,
          certifications: ['ClassFit Elite Certified'],
          tags: [displaySpecialty],
          instagramHandle: '@' + displayName.toLowerCase().replace(/\s/g, '_'),
          instagramFeed: [
              'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400',
              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400',
              'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=400'
          ],
          price: 20, 
          image: u.image || DEFAULT_PROFILE_IMAGE, 
          phone: u.phone || '',
          availability: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00', '17:00']
        };
      });

    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users]);

  // --- 2. State Management ---
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [viewingTrainer, setViewingTrainer] = useState<Trainer | null>(null);
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

  useEffect(() => {
    if (selectedTrainer) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTrainer]);

  // --- 3. Calendar Logic ---
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
        days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
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
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                    ${isSelected 
                        ? 'bg-brand text-dark shadow-lg shadow-brand/20 scale-110' 
                        : isPast 
                            ? 'text-slate-600 cursor-not-allowed' 
                            : 'text-white hover:bg-white/10 hover:text-brand'
                    }
                    ${isToday && !isSelected ? 'border border-brand text-brand' : ''}
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

  // --- 4. Booking Logic ---
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && lastBooking) {
    return (
      <div className="max-w-xl mx-auto py-32 px-4 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/20">
          <Check size={40} strokeWidth={4} />
        </div>
        <h2 className="text-4xl font-black uppercase italic mb-4 tracking-tight text-white">{t.reqSent}</h2>
        <p className="text-slate-400 mb-8 font-medium">{t.confirmText}</p>
        
        {customerEmail && (
          <div className="inline-flex items-center gap-2 px-6 py-4 bg-surface rounded-2xl text-xs font-medium text-slate-300 mb-6 text-left border border-white/10">
            <Mail size={16} className="shrink-0 text-brand" /> 
            <span>
              {language === 'bg' 
                ? `Потвърдителен имейл ще бъде изпратен на ${customerEmail}.`
                : `A confirmation email will be sent to ${customerEmail}.`}
            </span>
          </div>
        )}
        
        <div className="flex flex-col gap-4 max-w-xs mx-auto mt-6">
          {currentUser && (
            <button onClick={() => navigate('/profile')} className="px-12 py-4 bg-white text-dark rounded-full font-bold uppercase tracking-widest hover:bg-brand hover:text-dark transition-all flex items-center justify-center gap-2">
              <User size={18} /> {t.myBookings}
            </button>
          )}
          <button 
            onClick={() => { setIsSuccess(false); setSelectedTrainer(null); }}
            className="px-12 py-4 bg-surface text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            {t.newBooking}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 animate-in fade-in duration-500">
      
      {!selectedTrainer ? (
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h1 className="text-7xl md:text-8xl font-black uppercase italic mb-6 tracking-tight leading-[0.85] text-white">
                {language === 'bg' ? 'ИЗБЕРИ' : 'CHOOSE'} <br/> <span className="text-brand">{t.trainer}</span>
            </h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] max-w-2xl mx-auto">
              {language === 'bg' ? 'ВЪРХОВНИ РЕЗУЛТАТИ С НАЙ-ДОБРИТЕ ВЪВ ВАРНА' : 'PREMIUM RESULTS WITH THE BEST IN VARNA'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {trainers.map((trainer) => (
              <div 
                key={trainer.id}
                className="group relative flex flex-col"
              >
                {/* 4:5 Portrait Card */}
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/5 transition-all duration-700 bg-surface shadow-2xl group-hover:border-brand/50 group-hover:shadow-[0_0_40px_rgba(197,217,45,0.15)] group-hover:-translate-y-2">
                    {/* Grayscale image that colors on hover */}
                    <img 
                      src={trainer.image} 
                      alt={trainer.name} 
                      className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                    />
                    
                    {/* Neon Glow Layer (Hidden until hover) */}
                    <div className="absolute inset-0 bg-brand/10 mix-blend-screen opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"></div>
                    
                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>

                    {/* Quick Info Overlay */}
                    <div className="absolute bottom-0 left-0 p-10 w-full z-10">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {trainer.tags?.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-white/5 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h3 className="text-3xl font-black uppercase italic text-white leading-none mb-2 tracking-tighter">{trainer.name}</h3>
                        <p className="text-brand text-xs font-black uppercase tracking-widest mb-6">{trainer.specialty}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                             <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <Activity size={14} className="text-brand" /> {trainer.experienceYears} {t.yearsExp}
                             </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); setViewingTrainer(trainer); }}
                                className="px-6 py-3 bg-white text-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand transition-all shadow-xl"
                             >
                                {t.viewProfile}
                             </button>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CALENDAR & TIME SELECTION */
        <div className="max-w-6xl mx-auto px-6 animate-in slide-in-from-bottom-8 fade-in duration-500">
          <button 
            onClick={() => { setSelectedTrainer(null); setSelectedTime(null); }}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white font-black uppercase tracking-widest text-xs transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {language === 'bg' ? 'Назад' : 'Back'}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-surface p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-xl">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-brand/20">
                    <img src={selectedTrainer.image} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic text-white leading-none mb-2">{selectedTrainer.name}</h3>
                    <p className="text-[10px] text-brand font-black uppercase tracking-widest">{selectedTrainer.specialty}</p>
                  </div>
               </div>

               <div className="bg-surface p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                     </button>
                     <div className="text-center">
                        <span className="block text-xl font-black uppercase italic text-white leading-none mb-1">
                           {monthNames[currentMonth.getMonth()]}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           {currentMonth.getFullYear()}
                        </span>
                     </div>
                     <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                     </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                     {weekDays.map(day => (
                        <div key={day} className="text-[10px] font-black text-slate-600 uppercase py-2">
                           {day}
                        </div>
                     ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 place-items-center">
                     {renderCalendar()}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-2">
               <div className="bg-surface rounded-[3rem] border border-white/5 p-10 h-full flex flex-col shadow-2xl">
                  <div className="mb-10">
                     <h2 className="text-4xl font-black uppercase italic text-white mb-2 leading-none">
                        {language === 'bg' ? 'ИЗБЕРИ ЧАС' : 'SELECT TIME'}
                     </h2>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <CalendarIcon size={14} className="text-brand" /> {selectedDate.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                     {selectedTrainer.availability.map(time => (
                        <button
                           key={time}
                           onClick={() => setSelectedTime(time)}
                           className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              selectedTime === time
                                 ? 'bg-brand text-dark border-brand shadow-xl shadow-brand/20 scale-105'
                                 : 'bg-dark/50 text-slate-400 border-white/5 hover:border-brand/40 hover:text-white'
                           }`}
                        >
                           {time}
                        </button>
                     ))}
                  </div>

                  <div className="mt-auto pt-10 border-t border-white/10">
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div>
                           <div className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mb-1">{t.total}</div>
                           <div className="text-5xl font-black uppercase italic text-white tracking-tighter">{selectedTrainer.price} <span className="text-xl text-slate-500">BGN</span></div>
                        </div>

                        <button 
                           onClick={initiateBooking}
                           disabled={!selectedTime || isSubmitting}
                           className={`w-full sm:w-auto px-16 py-6 rounded-full font-black uppercase italic tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-2xl ${
                              selectedTime && !isSubmitting
                                 ? 'bg-brand text-dark hover:bg-white hover:text-dark hover:scale-105 shadow-brand/30'
                                 : 'bg-white/5 text-slate-600 cursor-not-allowed shadow-none border border-white/5'
                           }`}
                        >
                           {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (language === 'bg' ? 'ЗАПИШИ ЧАС' : 'BOOK SESSION')}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* DEEP DIVE TRAINER DRAWER */}
      {viewingTrainer && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-dark/95 backdrop-blur-md animate-in fade-in duration-500">
              {/* Left Overlay to close */}
              <div className="hidden md:block flex-grow cursor-pointer" onClick={() => setViewingTrainer(null)}></div>
              
              {/* The Drawer */}
              <div className="w-full max-w-2xl bg-surface h-full shadow-2xl border-l border-white/10 overflow-y-auto animate-in slide-in-from-right duration-500 custom-scrollbar">
                  <div className="relative">
                      {/* Close Icon Mobile */}
                      <button 
                        onClick={() => setViewingTrainer(null)} 
                        className="absolute top-8 right-8 z-30 p-3 bg-dark/50 backdrop-blur rounded-full text-white hover:bg-brand hover:text-dark transition-all"
                      >
                        <X size={24} />
                      </button>

                      {/* Cover Photo */}
                      <div className="h-[45vh] relative overflow-hidden">
                          <img src={viewingTrainer.image} alt={viewingTrainer.name} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0" />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
                          
                          <div className="absolute bottom-10 left-10 right-10">
                              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand text-dark rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                  <Star size={12} className="fill-dark" /> {t.team}
                              </div>
                              <h2 className="text-5xl md:text-6xl font-black uppercase italic text-white tracking-tighter leading-none mb-2">{viewingTrainer.name}</h2>
                              <p className="text-brand font-black uppercase tracking-[0.2em] text-xs">{viewingTrainer.specialty}</p>
                          </div>
                      </div>

                      <div className="p-10 md:p-12 space-y-12">
                          
                          {/* Philosophy Section */}
                          <section>
                              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4 italic">Philosophy</div>
                              <p className="text-2xl md:text-3xl font-black uppercase italic text-white leading-tight">
                                  "{viewingTrainer.philosophy}"
                              </p>
                          </section>

                          {/* Stats Bar */}
                          <div className="grid grid-cols-3 gap-4">
                              <div className="p-6 bg-dark/30 rounded-3xl border border-white/5 text-center">
                                  <div className="text-2xl font-black italic text-white mb-1">{viewingTrainer.experienceYears}+</div>
                                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Years Exp</div>
                              </div>
                              <div className="p-6 bg-dark/30 rounded-3xl border border-white/5 text-center">
                                  <div className="text-2xl font-black italic text-white mb-1">50+</div>
                                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Clients</div>
                              </div>
                              <div className="p-6 bg-dark/30 rounded-3xl border border-white/5 text-center">
                                  <div className="text-2xl font-black italic text-brand mb-1">{viewingTrainer.price}</div>
                                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">BGN/H</div>
                              </div>
                          </div>

                          {/* Certifications */}
                          <section>
                              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 italic">{t.certifications}</div>
                              <div className="space-y-4">
                                  {viewingTrainer.certifications?.map((cert, i) => (
                                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                          <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                                              <Award size={20} />
                                          </div>
                                          <span className="text-sm font-bold uppercase tracking-wide text-white">{cert}</span>
                                      </div>
                                  ))}
                              </div>
                          </section>

                          {/* Instagram Integration Mock */}
                          <section>
                              <div className="flex items-center justify-between mb-8">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">{t.instagramTitle}</div>
                                <a href="#" className="flex items-center gap-2 text-brand text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                                    <Instagram size={14} /> {viewingTrainer.instagramHandle}
                                </a>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                  {viewingTrainer.instagramFeed?.map((img, i) => (
                                      <div key={i} className="aspect-square rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer">
                                          <img src={img} className="w-full h-full object-cover" />
                                      </div>
                                  ))}
                              </div>
                          </section>

                          {/* CTA */}
                          <div className="sticky bottom-0 pt-10 pb-4 bg-surface">
                              <button 
                                onClick={() => { setSelectedTrainer(viewingTrainer); setViewingTrainer(null); }}
                                className="w-full py-6 bg-brand text-dark rounded-full font-black uppercase italic tracking-[0.2em] shadow-2xl shadow-brand/20 hover:bg-white transition-all flex items-center justify-center gap-3"
                              >
                                  <CalendarIcon size={20} /> {t.bookThisTrainer}
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Guest Form Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-surface rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/10">
              <button 
                onClick={() => setShowGuestForm(false)}
                disabled={isSubmitting}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-white"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-white">{t.finalize}</h2>
              <p className="text-sm text-slate-400 font-medium mb-8">{t.enterDetails}</p>

              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.name}</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required value={guestName} onChange={(e) => setGuestName(e.target.value)} disabled={isSubmitting} className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50" placeholder={t.yourName} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.phone}</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} disabled={isSubmitting} className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50" placeholder="0888 123 456" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.email}</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} disabled={isSubmitting} className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50" placeholder="name@example.com" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-brand text-dark py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-xl shadow-brand/20 mt-4 flex items-center justify-center gap-2">
                   {isSubmitting ? <Loader2 className="animate-spin" /> : t.confirmBooking}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
