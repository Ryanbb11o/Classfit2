
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, User, Phone, X, Loader2, ChevronLeft, ChevronRight, ArrowLeft, Star, MapPin, Target, MessageSquare, Sparkles, Languages, ExternalLink, Navigation } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getTrainers, TRANSLATIONS, DEFAULT_PROFILE_IMAGE, getTrainerReviews } from '../constants';
import { Trainer, Booking } from '../types';
import emailjs from '@emailjs/browser';

const BookingPage: React.FC = () => {
  const { language, addBooking, currentUser, users, bookings, reviews: liveReviews } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const trainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    const dynamicTrainers: Trainer[] = users
      .filter(u => u.roles?.includes('trainer'))
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
          bio: u.bio || (language === 'bg' ? 'Професионален инструктор.' : 'Professional instructor.'),
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

  const getReviewCount = (trainerId: string) => {
    return liveReviews.filter(r => r.trainerId === trainerId && r.isPublished).length + 12; // Adding 12 as base mock reviews
  };

  const sendBookingEmail = async (booking: Booking, trainer: Trainer) => {
     try {
       const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; 
       await emailjs.send('service_ienhll4', 'template_18zuajh', {
           customer_name: booking.customerName,
           customer_email: booking.customerEmail,
           trainer_name: trainer.name,
           booking_date: booking.date,
           booking_time: booking.time,
           pin_code: booking.checkInCode,
           trainer_phone: trainer.phone
         }, PUBLIC_KEY);
     } catch (err) {
       console.error("EmailJS delivery failed:", err);
     }
  };

  useEffect(() => { if (selectedTrainer) window.scrollTo({ top: 0, behavior: 'smooth' }); }, [selectedTrainer]);

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate >= today) { setSelectedDate(newDate); setSelectedTime(null); }
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    for (let i = 0; i < offset; i++) days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 1; i <= daysInMonth; i++) {
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate.toDateString() === current.toDateString();
        const isPast = current < today;
        days.push(
            <button key={i} onClick={() => handleDateClick(i)} disabled={isPast} className={`h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${isSelected ? 'bg-brand text-dark shadow-lg scale-110' : isPast ? 'text-slate-700 cursor-not-allowed' : 'text-white/60 hover:bg-white/10 border border-transparent hover:border-white/10'}`}>{i}</button>
        );
    }
    return days;
  };

  const finalizeBooking = async (name: string, phone?: string, userId?: string, email?: string) => {
    if (!selectedTrainer || !selectedTime) return;
    setIsSubmitting(true);
    const bookingId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newBooking: Booking = {
      id: bookingId,
      checkInCode: bookingId.substring(0, 6),
      trainerId: selectedTrainer.id,
      userId: userId, 
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      language,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration: 60,
      price: selectedTrainer.price,
      status: 'pending',
      gymAddress: 'ул. „Студентска“ 1А, Варна'
    };
    try {
      await addBooking(newBooking);
      await sendBookingEmail(newBooking, selectedTrainer);
      setLastBooking(newBooking);
      setShowGuestForm(false);
      setIsSuccess(true);
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  if (isSuccess && lastBooking && selectedTrainer) {
    return (
      <div className="max-w-xl mx-auto py-32 px-4 animate-in zoom-in-95 duration-500 text-left">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand/20 animate-bounce">
            <Check size={40} strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black uppercase italic mb-2 text-white tracking-tighter leading-none">{t.reqSent}</h2>
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 px-6 py-3 rounded-full border border-yellow-500/20 mb-8">
             <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
             <span className="text-[11px] font-black uppercase text-yellow-500 tracking-widest">{t.waitingConfirmation}</span>
          </div>
        </div>

        <div className="bg-surface border border-white/10 rounded-[2.5rem] p-8 mb-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
           <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-dark">
                       <img src={selectedTrainer.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-brand tracking-widest italic">{selectedTrainer.specialty}</p>
                       <p className="text-white font-black text-2xl italic uppercase tracking-tighter leading-none">{selectedTrainer.name}</p>
                    </div>
                 </div>
              </div>
              
              <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-8">
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 italic">Schedule</p>
                    <p className="text-white font-black uppercase italic text-lg">{lastBooking.date} @ {lastBooking.time}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 italic">Passcode</p>
                    <p className="text-brand font-black text-2xl tracking-widest italic">{lastBooking.checkInCode}</p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <a href={`tel:${selectedTrainer.phone}`} className="flex items-center gap-4 px-6 py-5 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white hover:text-dark transition-all group">
                   <Phone size={18} className="text-brand group-hover:text-dark" />
                   <span className="text-xs font-black uppercase tracking-widest italic">{t.trainerPhoneLabel}: {selectedTrainer.phone}</span>
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-6 py-5 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-brand hover:text-dark transition-all group">
                   <Navigation size={18} className="text-brand group-hover:text-dark" />
                   <span className="text-xs font-black uppercase tracking-widest italic">{language === 'bg' ? 'Отиди до залата' : 'Get Directions'}</span>
                </a>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/profile')} className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-xl">
            {t.myBookings}
          </button>
          <button onClick={() => { setIsSuccess(false); setSelectedTrainer(null); }} className="w-full py-5 bg-surface text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all border border-white/5">
            {t.newBooking}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-left">
      {!selectedTrainer ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h1 className="text-5xl md:text-8xl font-black uppercase italic mb-4 tracking-tighter text-white leading-[0.85]">
                CHOOSE <span className="text-brand">YOUR</span> COACH
              </h1>
              <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] italic">ClassFit Varna • Elite Training Personnel</p>
            </div>
            <div className="flex items-center gap-4 text-white/40 font-black uppercase tracking-widest text-[10px] italic">
              <Star size={14} className="text-brand fill-brand" /> Top Rated Base • Varna, BG
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 italic">
            {trainers.map((trainer) => (
              <div key={trainer.id} onClick={() => setSelectedTrainer(trainer)} className="group relative bg-surface/30 rounded-[2.5rem] overflow-hidden cursor-pointer hover:-translate-y-3 transition-all duration-500 border border-white/5 hover:border-brand/40 shadow-2xl">
                <div className="aspect-[4/5] overflow-hidden relative">
                   <img src={trainer.image} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
                   <div className="absolute top-6 right-6 px-3 py-1 bg-brand text-dark rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                     {trainer.price} BGN
                   </div>
                   <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star size={12} className="text-brand fill-brand" />
                        <span className="text-[10px] font-black text-white">5.0 <span className="text-slate-500">({getReviewCount(trainer.id)})</span></span>
                      </div>
                      <h3 className="text-2xl font-black uppercase text-white leading-none tracking-tighter group-hover:text-brand transition-colors mb-1">{trainer.name}</h3>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{trainer.specialty}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          <button onClick={() => setSelectedTrainer(null)} className="mb-12 flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all">
            <ArrowLeft size={16} /> RETURN TO ROSTER
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
               <div className="bg-surface rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl group">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={selectedTrainer.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                       <h2 className="text-4xl sm:text-5xl font-black uppercase italic text-white mb-2 leading-[0.9] tracking-tighter">{selectedTrainer.name}</h2>
                       <div className="inline-flex items-center gap-2 bg-brand px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-dark italic shadow-xl">
                          <Target size={12} /> {selectedTrainer.specialty}
                       </div>
                    </div>
                  </div>
                  <div className="p-10">
                     <div className="flex items-center gap-6 mb-10">
                        <div className="flex-1 p-5 bg-dark/40 rounded-2xl border border-white/5 text-center">
                           <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">RATING</p>
                           <div className="flex items-center justify-center gap-1.5">
                              <Star size={14} className="text-brand fill-brand" />
                              <span className="text-lg font-black text-white italic">5.0</span>
                           </div>
                        </div>
                        <div className="flex-1 p-5 bg-dark/40 rounded-2xl border border-white/5 text-center">
                           <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">REVIEWS</p>
                           <p className="text-lg font-black text-white italic">{getReviewCount(selectedTrainer.id)}</p>
                        </div>
                     </div>
                     <p className="text-sm text-slate-400 italic font-medium leading-relaxed mb-10">
                        {selectedTrainer.bio}
                     </p>
                     <div className="space-y-3">
                        <a href={`tel:${selectedTrainer.phone}`} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                           <div className="flex items-center gap-4">
                              <Phone size={18} className="text-brand" />
                              <span className="text-[10px] font-black uppercase text-white tracking-widest italic">{t.trainerPhoneLabel}</span>
                           </div>
                           <span className="text-xs font-black text-slate-500 group-hover:text-white transition-colors">{selectedTrainer.phone}</span>
                        </a>
                        <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-white/5 hover:bg-brand rounded-2xl border border-white/5 transition-all group">
                           <div className="flex items-center gap-4">
                              <Navigation size={18} className="text-brand group-hover:text-dark" />
                              <span className="text-[10px] font-black uppercase text-white group-hover:text-dark tracking-widest italic">{language === 'bg' ? 'Локация: Студентска 1А' : 'Location: Studentska 1A'}</span>
                           </div>
                           <ExternalLink size={14} className="text-slate-600 group-hover:text-dark" />
                        </a>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
               <div className="bg-surface/30 backdrop-blur-xl p-10 sm:p-14 rounded-[4rem] border border-white/5 shadow-2xl italic">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
                    <h3 className="text-3xl font-black uppercase text-white flex items-center gap-4 tracking-tighter">
                      <CalendarIcon className="text-brand" /> TRAINING CALENDAR
                    </h3>
                    <div className="flex items-center gap-3">
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 text-slate-500 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
                       <span className="text-[11px] font-black uppercase tracking-widest text-white min-w-[140px] text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 text-slate-500 hover:text-white transition-colors"><ChevronRight size={20}/></button>
                    </div>
                  </div>

                  <div className="mb-12">
                    <div className="grid grid-cols-7 gap-2 text-center mb-6">
                      {['MO','TU','WE','TH','FR','SA','SU'].map(d => (
                        <div key={d} className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                      {renderCalendar()}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/5">
                    <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] mb-8 italic">SELECT YOUR SESSION TIME</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-12">
                        {selectedTrainer.availability.map(time => (
                          <button 
                            key={time} 
                            onClick={() => setSelectedTime(time)} 
                            className={`py-4 rounded-2xl text-[11px] font-black border transition-all ${
                              selectedTime === time 
                                ? 'bg-brand text-dark border-brand shadow-[0_0_30px_rgba(197,217,45,0.3)] scale-105' 
                                : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand/40'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                    </div>

                    <button 
                      onClick={() => currentUser ? finalizeBooking(currentUser.name, currentUser.phone, currentUser.id, currentUser.email) : setShowGuestForm(true)} 
                      disabled={!selectedTime || isSubmitting} 
                      className="group w-full py-6 bg-brand text-dark rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-brand/20 disabled:opacity-20 hover:bg-white hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : (
                        <>INITIALIZE BOOKING <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </div>
               </div>

               <div className="p-10 bg-surface/10 rounded-[3rem] border border-white/5">
                  <div className="flex items-center gap-4 mb-8">
                    <MessageSquare className="text-brand" size={24} />
                    <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Client Feedback</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className="p-6 bg-dark/30 rounded-3xl border border-white/5 space-y-3">
                          <div className="flex justify-between items-start">
                             <div className="flex gap-1 text-brand">
                                {[...Array(5)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                             </div>
                             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">2 DAYS AGO</span>
                          </div>
                          <p className="text-xs text-slate-400 italic leading-relaxed">"Exceptional coaching and discipline. Saw major strength gains in just 4 weeks."</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {showGuestForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="bg-[#1a2332] rounded-[4rem] p-12 max-w-md w-full border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative italic">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
              <button onClick={()=>setShowGuestForm(false)} className="absolute top-10 right-10 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20}/></button>
              
              <div className="mb-10">
                 <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter mb-2">IDENTIFICATION</h2>
                 <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Guest Check-In Required</p>
              </div>

              <form onSubmit={(e)=>{e.preventDefault(); finalizeBooking(guestName, guestPhone, undefined, guestEmail)}} className="space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Full Name</label>
                   <input type="text" placeholder="John Doe" required value={guestName} onChange={(e)=>setGuestName(e.target.value)} className="w-full bg-[#131b27] border border-white/5 focus:border-brand rounded-2xl px-6 py-4 text-sm font-black text-white outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Phone Number</label>
                   <input type="tel" placeholder="+359..." required value={guestPhone} onChange={(e)=>setGuestPhone(e.target.value)} className="w-full bg-[#131b27] border border-white/5 focus:border-brand rounded-2xl px-6 py-4 text-sm font-black text-white outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Email Address</label>
                   <input type="email" placeholder="john@email.com" required value={guestEmail} onChange={(e)=>setGuestEmail(e.target.value)} className="w-full bg-[#131b27] border border-white/5 focus:border-brand rounded-2xl px-6 py-4 text-sm font-black text-white outline-none transition-all" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-brand text-dark rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-brand/20 mt-6 hover:bg-white transition-all">
                   {isSubmitting ? <Loader2 className="animate-spin mx-auto"/> : 'INITIALIZE SESSION'}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
