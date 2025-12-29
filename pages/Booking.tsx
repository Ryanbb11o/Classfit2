import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, Info, User, Phone, X, LogIn, Mail, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getTrainers, TRANSLATIONS } from '../constants';
import { Trainer, Booking } from '../types';

const BookingPage: React.FC = () => {
  const { language, addBooking, currentUser, users } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  // --- 1. Data Preparation ---
  const trainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    
    const getPlaceholderImage = (id: string) => {
      const images = [
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop', 
        'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      ];
      const charCodeSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return images[charCodeSum % images.length];
    };

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
          image: u.image || getPlaceholderImage(u.id), 
          phone: u.phone || '',
          availability: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00', '17:00']
        };
      });

    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users]);

  // --- 2. State Management ---
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | undefined>(undefined);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  
  // Guest Booking State
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Scroll to calendar when trainer selected
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
    // 0 = Sunday, 1 = Monday. We want Monday start? Let's stick to standard 0-6 Sun-Sat for simplicity in grid
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
        setSelectedTime(null); // Reset time when date changes
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth); // 0 (Sun) - 6 (Sat)
    
    // Adjust for Monday start if desired, but let's do standard Sun-Sat for international compatibility
    // Actually, Bulgaria uses Monday start usually. Let's do Monday start logic.
    // Monday = 1, Sunday = 0.
    // Shift: Mon(1)->0, Tue(2)->1 ... Sun(0)->6
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1; 

    const days = [];
    // Padding
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
    
    // Format date as YYYY-MM-DD local time to avoid timezone shifts
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
      alert(language === 'bg' 
        ? 'Възникна грешка при записването на часа. Моля, опитайте отново.' 
        : 'An error occurred while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. Render Success Screen ---
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
                ? `Потвърдителен имейл ще бъде изпратен на ${customerEmail}, след като треньорът одобри заявката.`
                : `A confirmation email will be sent to ${customerEmail} once the trainer approves your request.`}
            </span>
          </div>
        )}
        
        <div className="flex flex-col gap-4 max-w-xs mx-auto mt-6">
          {currentUser && (
            <button 
              onClick={() => navigate('/profile')}
              className="px-12 py-4 bg-white text-dark rounded-full font-bold uppercase tracking-widest hover:bg-brand hover:text-dark transition-quick shadow-lg flex items-center justify-center gap-2"
            >
              <User size={18} /> {t.myBookings}
            </button>
          )}
          
          <button 
            onClick={() => {
              setIsSuccess(false);
              setSelectedTrainer(null);
              setSelectedTime(null);
              setGuestName('');
              setGuestPhone('');
              setGuestEmail('');
              setCustomerEmail(undefined);
              setLastBooking(null);
            }}
            className="px-12 py-4 bg-surface text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-quick"
          >
            {t.newBooking}
          </button>
        </div>
      </div>
    );
  }

  // --- 6. Render Selection Flow ---
  return (
    <div className="min-h-screen py-24 animate-in fade-in duration-500">
      
      {/* SECTION 1: TRAINER SELECTION */}
      {!selectedTrainer ? (
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-black uppercase italic mb-6 tracking-tight leading-none text-white">{t.booking}</h1>
            <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-sm max-w-2xl mx-auto">
              {language === 'bg' ? 'Изберете вашия персонален треньор' : 'Select Your Personal Trainer'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {trainers.map((trainer) => (
              <div 
                key={trainer.id}
                onClick={() => setSelectedTrainer(trainer)}
                className="group relative bg-surface rounded-[2.5rem] overflow-hidden border-2 border-white/5 hover:border-brand cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-brand/10 hover:-translate-y-2"
              >
                <div className="aspect-[4/5] relative">
                   <img 
                      src={trainer.image} 
                      alt={trainer.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-90"></div>
                   
                   <div className="absolute bottom-0 left-0 p-6 w-full">
                      <div className="inline-block px-3 py-1 bg-brand text-dark text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                         {trainer.specialty}
                      </div>
                      <h3 className="text-2xl font-black uppercase italic text-white leading-none mb-1">{trainer.name}</h3>
                      <p className="text-slate-400 font-bold text-sm">{trainer.price} {t.perSession}</p>
                   </div>
                   
                   {/* Overlay Action */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark/40 backdrop-blur-[2px]">
                      <div className="w-16 h-16 rounded-full bg-brand text-dark flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                         <CalendarIcon size={28} />
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SECTION 2: CALENDAR & TIME SELECTION */
        <div className="max-w-6xl mx-auto px-6 animate-in slide-in-from-bottom-8 fade-in duration-500">
          
          <button 
            onClick={() => { setSelectedTrainer(null); setSelectedTime(null); }}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white font-black uppercase tracking-widest text-xs transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {language === 'bg' ? 'Назад към Треньори' : 'Back to Trainers'}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Trainer Info & Custom Calendar */}
            <div className="lg:col-span-1 space-y-6">
               {/* Trainer Card Mini */}
               <div className="bg-surface p-6 rounded-[2rem] border border-white/5 flex items-center gap-5">
                  <img src={selectedTrainer.image} alt={selectedTrainer.name} className="w-20 h-20 rounded-2xl object-cover" />
                  <div>
                    <h3 className="text-xl font-black uppercase italic text-white leading-none mb-1">{selectedTrainer.name}</h3>
                    <p className="text-xs text-brand font-black uppercase tracking-wider">{selectedTrainer.specialty}</p>
                  </div>
               </div>

               {/* CUSTOM CALENDAR */}
               <div className="bg-surface p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-6 px-2">
                     <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                     </button>
                     <div className="text-center">
                        <span className="block text-lg font-black uppercase italic text-white">
                           {monthNames[currentMonth.getMonth()]}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                           {currentMonth.getFullYear()}
                        </span>
                     </div>
                     <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                     </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2 text-center">
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

            {/* Right Column: Time Selection & Confirmation */}
            <div className="lg:col-span-2">
               <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8 md:p-10 h-full flex flex-col">
                  <div className="mb-8">
                     <h2 className="text-3xl font-black uppercase italic text-white mb-2">
                        {language === 'bg' ? 'Изберете Час' : 'Select Time'}
                     </h2>
                     <p className="text-slate-400 text-sm font-medium">
                        {selectedDate.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                     </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-10">
                     {selectedTrainer.availability.map(time => (
                        <button
                           key={time}
                           onClick={() => setSelectedTime(time)}
                           className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                              selectedTime === time
                                 ? 'bg-brand text-dark border-brand shadow-lg shadow-brand/20 scale-105'
                                 : 'bg-dark/50 text-slate-400 border-white/5 hover:border-brand/40 hover:text-white'
                           }`}
                        >
                           {time}
                        </button>
                     ))}
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/5">
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                           <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mb-1">{t.total}</div>
                           <div className="text-4xl font-black uppercase italic text-white">{selectedTrainer.price} <span className="text-lg text-slate-500">BGN</span></div>
                        </div>

                        <button 
                           onClick={initiateBooking}
                           disabled={!selectedTime || isSubmitting}
                           className={`w-full sm:w-auto px-12 py-5 rounded-full font-black uppercase italic tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                              selectedTime && !isSubmitting
                                 ? 'bg-brand text-dark hover:bg-white hover:text-dark hover:scale-105 shadow-brand/20'
                                 : 'bg-white/10 text-slate-500 cursor-not-allowed shadow-none'
                           }`}
                        >
                           {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (language === 'bg' ? 'Запиши Час' : 'Book Session')}
                        </button>
                     </div>
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
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-quick text-white"
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
                    <input 
                      type="text" 
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50"
                      placeholder={t.yourName}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.phone}</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel" 
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50"
                      placeholder="0888 123 456"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.email}</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand text-dark py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-dark transition-all duration-300 shadow-xl shadow-brand/20 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
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