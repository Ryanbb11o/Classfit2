
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, Info, User, Phone, X, LogIn, Mail } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getTrainers, TRANSLATIONS } from '../constants';
import { Trainer, Booking } from '../types';

const BookingPage: React.FC = () => {
  const { language, addBooking, currentUser } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  const trainers = getTrainers(language);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  
  // Date and Time State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | undefined>(undefined);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  
  // Guest Booking State
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const initiateBooking = () => {
    if (!selectedTrainer || !selectedTime || !selectedDate) return;

    if (currentUser) {
      // If logged in, book immediately using account email
      finalizeBooking(currentUser.name, undefined, currentUser.id, currentUser.email);
    } else {
      // If not logged in, show guest form
      setShowGuestForm(true);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName && guestPhone && guestEmail) {
      finalizeBooking(guestName, guestPhone, undefined, guestEmail);
    }
  };

  const finalizeBooking = (name: string, phone?: string, userId?: string, email?: string) => {
    if (!selectedTrainer || !selectedTime || !selectedDate) return;

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      trainerId: selectedTrainer.id,
      userId: userId, 
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      language: language, // Важно: Запазваме езика на потребителя тук
      date: selectedDate,
      time: selectedTime,
      price: selectedTrainer.price,
      status: 'pending',
    };

    addBooking(newBooking);
    setLastBooking(newBooking);
    setCustomerEmail(email);
    setShowGuestForm(false);
    setIsSuccess(true);
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
                ? `Потвърдителен имейл ще бъде изпратен на ${customerEmail}, след като треньорът одобри заявката.`
                : `A confirmation email will be sent to ${customerEmail} once the trainer approves your request.`}
            </span>
          </div>
        )}

        <div className="mb-8 p-4 bg-brand/5 rounded-2xl border border-brand/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.lateOrCancel}</p>
            <a href={`tel:${t.gymPhone}`} className="text-xl font-black text-brand italic hover:text-white transition-colors flex items-center justify-center gap-2">
                <Phone size={18} /> {t.gymPhone}
            </a>
        </div>
        
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black uppercase italic mb-4 tracking-tight leading-none text-white">{t.booking}</h1>
        <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">{t.selectTrainer}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Trainer Selection */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 mb-6">{t.team}</h3>
          {trainers.map(trainer => (
            <div 
              key={trainer.id}
              onClick={() => setSelectedTrainer(trainer)}
              className={`p-5 rounded-3xl border-2 transition-quick cursor-pointer flex items-center gap-5 ${
                selectedTrainer?.id === trainer.id ? 'border-brand bg-brand/10 shadow-lg shadow-brand/5' : 'border-white/5 hover:border-brand/30 bg-surface'
              }`}
            >
              <img src={trainer.image} alt={trainer.name} className="w-16 h-16 rounded-2xl object-cover grayscale brightness-90 group-hover:grayscale-0" />
              <div>
                <h4 className="font-black uppercase italic text-lg text-white">{trainer.name}</h4>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">{trainer.specialty}</p>
                <p className="text-white font-black text-sm">{trainer.price} {t.perSession}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar / Timeslots */}
        <div className="lg:col-span-2">
          {selectedTrainer ? (
            <div className="bg-surface rounded-[2.5rem] border-2 border-white/5 p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <CalendarIcon size={120} className="text-white" />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 relative z-10 gap-6">
                <div>
                  <h3 className="text-3xl font-black uppercase italic text-white">{selectedTrainer.name}</h3>
                  <p className="text-brand text-xs font-bold uppercase tracking-[0.2em]">{t.trainerCalendar}</p>
                </div>
                
                {/* Date Picker Input */}
                <div className="flex items-center gap-3 bg-dark p-1.5 pl-4 pr-3 rounded-2xl shadow-xl shadow-black/20 w-full sm:w-auto border border-white/10">
                  <CalendarIcon size={16} className="text-brand shrink-0" />
                  <input 
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-white text-xs font-black uppercase tracking-widest outline-none border-none cursor-pointer w-full sm:w-auto [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              <div className="mb-10 relative z-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">{t.availableSlots}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedTrainer.availability.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-quick border-2 ${
                        selectedTime === time 
                        ? 'bg-brand text-dark border-brand shadow-lg shadow-brand/20' 
                        : 'bg-dark/50 text-slate-400 border-white/5 hover:border-brand/40'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-brand/5 rounded-3xl flex items-start gap-4 mb-10 border border-brand/10">
                <Info size={20} className="text-brand mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">{t.confirmText}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t-2 border-white/5 gap-6 relative z-10">
                <div className="text-center sm:text-left">
                    <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">{t.total}</span>
                    <div className="text-3xl font-black uppercase italic text-white">{selectedTrainer.price} <span className="text-sm font-bold text-slate-500">BGN</span></div>
                </div>
                
                <button 
                  disabled={!selectedTime}
                  onClick={initiateBooking}
                  className={`w-full sm:w-auto px-16 py-5 rounded-full font-black uppercase italic tracking-[0.2em] transition-quick shadow-2xl flex items-center justify-center gap-2 ${
                    selectedTime
                    ? 'bg-brand text-dark hover:bg-white hover:text-dark shadow-brand/20 active:scale-95' 
                    : 'bg-white/10 text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {t.bookNow}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 border-4 border-dashed border-white/10 rounded-[3rem] bg-surface/50">
              <Clock className="text-white/10 mb-6" size={64} />
              <h3 className="text-slate-400 font-black uppercase italic text-xl">{t.chooseTrainer}</h3>
              <p className="text-slate-500 text-sm font-medium mt-2">{t.seeCalendar}</p>
            </div>
          )}
        </div>
      </div>

      {/* Guest Form Modal Overlay */}
      {showGuestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-surface rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/10">
              <button 
                onClick={() => setShowGuestForm(false)}
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
                      className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
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
                      className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
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
                      className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-11 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand text-dark py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-dark transition-all duration-300 shadow-xl shadow-brand/20 mt-4 flex items-center justify-center gap-2"
                >
                   {t.confirmBooking}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                 <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">{t.haveAccount}</p>
                 <button 
                   onClick={() => navigate('/login')}
                   className="flex items-center justify-center gap-2 w-full py-3 border-2 border-white/10 rounded-xl font-black uppercase tracking-widest text-white hover:border-brand transition-all text-xs"
                 >
                   <LogIn size={14} /> {t.loginProfile}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
