
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, User, Phone, X, Loader2, ChevronLeft, ChevronRight, ArrowLeft, Star, MapPin, Target, MessageSquare, Sparkles, Languages, ExternalLink, Navigation, PhoneCall, Info, Zap } from 'lucide-react';
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
    return liveReviews.filter(r => r.trainerId === trainerId && r.isPublished).length + 12; 
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
    for (let i = 0; i < offset; i++) days.push(<div key={`empty-${i}`} className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20"></div>);
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 1; i <= daysInMonth; i++) {
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate.toDateString() === current.toDateString();
        const isPast = current < today;
        days.push(
            <button key={i} onClick={() => handleDateClick(i)} disabled={isPast} className={`h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-[1.5rem] flex items-center justify-center text-lg sm:text-xl font-black transition-all ${isSelected ? 'bg-brand text-dark shadow-[0_15px_40px_rgba(197,217,45,0.4)] scale-110 z-10' : isPast ? 'text-slate-800 cursor-not-allowed' : 'text-white hover:bg-white/10 border border-white/5 hover:border-brand/40'}`}>{i}</button>
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
      gymAddress: 'бул. „Осми приморски полк“ 128 (Спирка МИР)'
    };
    try {
      await addBooking(newBooking);
      setLastBooking(newBooking);
      setShowGuestForm(false);
      setIsSuccess(true);
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  if (isSuccess && lastBooking && selectedTrainer) {
    return (
      <div className="max-w-2xl mx-auto py-32 px-4 animate-in zoom-in-95 duration-700 text-left">
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_20px_60px_rgba(197,217,45,0.3)] animate-bounce">
            <Check size={64} strokeWidth={3} />
          </div>
          <h2 className="text-6xl md:text-7xl font-black uppercase italic mb-4 text-white tracking-tighter leading-none">{t.reqSent}</h2>
          <div className="inline-flex items-center gap-4 bg-yellow-500/10 px-10 py-5 rounded-full border-2 border-yellow-500/20 mb-8 mt-4">
             <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse"></div>
             <span className="text-sm font-black uppercase text-yellow-500 tracking-[0.2em]">{t.waitingConfirmation}</span>
          </div>
        </div>

        <div className="bg-surface border border-white/10 rounded-[4rem] p-12 mb-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-3 bg-brand"></div>
           <div className="space-y-10">
              <div className="flex flex-col sm:flex-row items-center gap-10">
                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-brand shadow-2xl">
                    <img src={selectedTrainer.image} className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-sm font-black uppercase text-brand tracking-[0.4em] mb-2 italic">{selectedTrainer.specialty}</p>
                    <h3 className="text-5xl font-black uppercase italic text-white tracking-tighter leading-none">{selectedTrainer.name}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 py-10 border-y-2 border-white/5">
                 <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-slate-500 tracking-[0.5em] italic">DATE & TIME</p>
                    <p className="text-white font-black uppercase italic text-3xl tracking-tighter leading-tight">{lastBooking.date} <br/> {lastBooking.time}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-slate-500 tracking-[0.5em] italic">ENTRY PIN</p>
                    <p className="text-brand font-black text-6xl tracking-[0.2em] italic leading-none drop-shadow-[0_0_20px_rgba(197,217,45,0.4)]">{lastBooking.checkInCode}</p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-5">
                <a href={`tel:${selectedTrainer.phone}`} className="flex items-center justify-between px-10 py-8 bg-white/5 text-white rounded-[2.5rem] border-2 border-white/5 hover:bg-white hover:text-dark transition-all group shadow-xl">
                   <div className="flex items-center gap-6">
                     <PhoneCall size={32} className="text-brand group-hover:text-dark" />
                     <span className="text-base font-black uppercase tracking-[0.2em] italic">{t.trainerPhoneLabel}</span>
                   </div>
                   <span className="text-2xl font-black italic tracking-tighter">{selectedTrainer.phone}</span>
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-10 py-8 bg-white/5 text-white rounded-[2.5rem] border-2 border-white/5 hover:bg-brand hover:text-dark transition-all group shadow-xl">
                   <div className="flex items-center gap-6">
                     <Navigation size={32} className="text-brand group-hover:text-dark" />
                     <span className="text-base font-black uppercase tracking-[0.2em] italic">{language === 'bg' ? 'ЛОКАЦИЯ: СПИРКА МИР' : 'NAVIGATE TO MIR STOP'}</span>
                   </div>
                   <ExternalLink size={24} />
                </a>
              </div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
          <button onClick={() => navigate('/profile')} className="flex-1 py-8 bg-brand text-dark rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-white transition-all shadow-2xl">
            {t.myBookings}
          </button>
          <button onClick={() => { setIsSuccess(false); setSelectedTrainer(null); }} className="flex-1 py-8 bg-surface text-slate-400 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-white/10 transition-all border-2 border-white/5">
            {t.newBooking}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-24 text-left">
      {!selectedTrainer ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
            <div>
              <h1 className="text-7xl md:text-[10rem] font-black uppercase italic mb-8 tracking-tighter text-white leading-[0.75] drop-shadow-2xl">
                SELECT <br/> <span className="text-brand">YOUR COACH</span>
              </h1>
              <div className="flex items-center gap-4 bg-white/5 w-fit px-6 py-3 rounded-2xl border border-white/10">
                 <Zap size={18} className="text-brand fill-brand" />
                 <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-xs italic">Elite Personnel • ClassFit Varna Base</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {trainers.map((trainer) => (
              <div key={trainer.id} onClick={() => setSelectedTrainer(trainer)} className="group relative bg-surface rounded-[4rem] overflow-hidden cursor-pointer hover:-translate-y-6 transition-all duration-700 border-2 border-white/5 hover:border-brand/60 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <div className="aspect-[4/5] overflow-hidden relative">
                   <img src={trainer.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent"></div>
                   
                   <div className="absolute top-10 right-10 flex flex-col gap-2">
                     <div className="px-8 py-3 bg-brand text-dark rounded-full text-sm font-black uppercase tracking-widest shadow-2xl scale-110">
                       {trainer.price} BGN
                     </div>
                   </div>

                   <div className="absolute bottom-10 left-10 right-10">
                      <div className="flex items-center gap-3 mb-4 bg-dark/60 backdrop-blur-xl w-fit px-5 py-2.5 rounded-2xl border-2 border-white/10">
                        <Star size={18} className="text-brand fill-brand" />
                        <span className="text-lg font-black text-white italic">5.0 <span className="text-slate-500 ml-2">({getReviewCount(trainer.id)})</span></span>
                      </div>
                      <h3 className="text-5xl font-black uppercase text-white leading-none tracking-tighter group-hover:text-brand transition-colors mb-2 italic drop-shadow-xl">{trainer.name}</h3>
                      <p className="text-sm font-black uppercase text-slate-400 tracking-[0.3em] italic mb-8">{trainer.specialty}</p>
                      
                      <div className="flex gap-4">
                         <div className="w-20 h-20 flex items-center justify-center bg-white/10 rounded-3xl hover:bg-brand hover:text-dark transition-all shadow-xl">
                            <PhoneCall size={28} />
                         </div>
                         <div className="flex-1 flex items-center justify-center gap-4 bg-brand text-dark rounded-3xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl group-hover:bg-white transition-colors">
                            BOOK SESSION <ChevronRight size={20} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in slide-in-from-bottom-16 duration-1000">
          <button onClick={() => setSelectedTrainer(null)} className="mb-20 flex items-center gap-6 text-slate-500 hover:text-brand font-black uppercase tracking-[0.5em] text-sm transition-all italic">
            <ArrowLeft size={24} /> RETURN TO ROSTER
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            <div className="lg:col-span-5 space-y-10">
               <div className="bg-surface rounded-[5rem] overflow-hidden border-2 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.6)] group">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={selectedTrainer.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/10 to-transparent"></div>
                    <div className="absolute bottom-16 left-16 right-16">
                       <h2 className="text-7xl sm:text-[6rem] font-black uppercase italic text-white mb-6 leading-[0.8] tracking-tighter drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">{selectedTrainer.name}</h2>
                       <div className="inline-flex items-center gap-4 bg-brand px-8 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] text-dark italic shadow-2xl">
                          <Target size={20} /> {selectedTrainer.specialty}
                       </div>
                    </div>
                  </div>
                  <div className="p-16">
                     <div className="grid grid-cols-2 gap-8 mb-16">
                        <div className="p-10 bg-dark/60 rounded-[3rem] border-2 border-white/5 text-center shadow-inner">
                           <p className="text-xs font-black uppercase text-slate-600 tracking-[0.5em] mb-4 italic">AVG RATING</p>
                           <div className="flex items-center justify-center gap-3">
                              <Star size={32} className="text-brand fill-brand" />
                              <span className="text-5xl font-black text-white italic">5.0</span>
                           </div>
                        </div>
                        <div className="p-10 bg-dark/60 rounded-[3rem] border-2 border-white/5 text-center shadow-inner">
                           <p className="text-xs font-black uppercase text-slate-600 tracking-[0.5em] mb-4 italic">CLIENT LOG</p>
                           <p className="text-5xl font-black text-white italic">{getReviewCount(selectedTrainer.id)}</p>
                        </div>
                     </div>
                     <div className="space-y-10">
                        <div className="flex items-start gap-6">
                           <Info className="text-brand mt-1.5 shrink-0" size={32} />
                           <p className="text-2xl text-slate-300 italic font-medium leading-[1.6]">
                              {selectedTrainer.bio}
                           </p>
                        </div>
                        
                        <div className="pt-12 border-t-2 border-white/5 space-y-6">
                           <a href={`tel:${selectedTrainer.phone}`} className="flex items-center justify-between p-10 bg-white/5 hover:bg-white/10 rounded-[3rem] border-2 border-white/10 transition-all group shadow-xl">
                              <div className="flex items-center gap-6">
                                 <PhoneCall size={40} className="text-brand" />
                                 <span className="text-sm font-black uppercase text-white tracking-[0.4em] italic">{t.trainerPhoneLabel}</span>
                              </div>
                              <span className="text-3xl font-black text-slate-400 group-hover:text-white transition-colors italic tracking-tighter">{selectedTrainer.phone}</span>
                           </a>
                           <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-10 bg-white/5 hover:bg-brand rounded-[3rem] border-2 border-white/10 transition-all group shadow-xl">
                              <div className="flex items-center gap-6">
                                 <Navigation size={40} className="text-brand group-hover:text-dark" />
                                 <span className="text-sm font-black uppercase text-white group-hover:text-dark tracking-[0.4em] italic">{language === 'bg' ? 'ЛОКАЦИЯ: СПИРКА МИР' : 'LOCATION: MIR STOP'}</span>
                              </div>
                              <ExternalLink size={28} className="text-slate-600 group-hover:text-dark" />
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7 space-y-16">
               <div className="bg-surface/30 backdrop-blur-[60px] p-12 sm:p-20 rounded-[5rem] border-2 border-white/10 shadow-[0_60px_120px_rgba(0,0,0,0.7)] italic">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-10 mb-20">
                    <h3 className="text-5xl font-black uppercase text-white flex items-center gap-8 tracking-tighter">
                      <CalendarIcon className="text-brand" size={56} /> TRAINING MATRIX
                    </h3>
                    <div className="flex items-center gap-6 bg-dark/60 p-3 rounded-[2rem] border-2 border-white/5 shadow-inner">
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-4 text-slate-500 hover:text-brand transition-colors"><ChevronLeft size={32}/></button>
                       <span className="text-sm font-black uppercase tracking-[0.4em] text-white min-w-[200px] text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-4 text-slate-500 hover:text-brand transition-colors"><ChevronRight size={32}/></button>
                    </div>
                  </div>

                  <div className="mb-20 px-4">
                    <div className="grid grid-cols-7 gap-6 text-center mb-12">
                      {['MO','TU','WE','TH','FR','SA','SU'].map(d => (
                        <div key={d} className="text-sm font-black uppercase text-slate-600 tracking-[0.6em]">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-6">
                      {renderCalendar()}
                    </div>
                  </div>

                  <div className="pt-20 border-t-2 border-white/10">
                    <h4 className="text-sm font-black uppercase text-slate-500 tracking-[0.6em] mb-12 italic text-center sm:text-left">SELECT YOUR TRANSFORMATION SLOT</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-20">
                        {selectedTrainer.availability.map(time => (
                          <button 
                            key={time} 
                            onClick={() => setSelectedTime(time)} 
                            className={`py-8 rounded-[2.5rem] text-xl font-black border-2 transition-all ${
                              selectedTime === time 
                                ? 'bg-brand text-dark border-brand shadow-[0_0_60px_rgba(197,217,45,0.5)] scale-105' 
                                : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand/60'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-12">
                       <div className="flex-1 text-center sm:text-left bg-dark/40 p-10 rounded-[3rem] border-2 border-white/5 min-w-[240px]">
                          <p className="text-xs font-black uppercase text-slate-500 tracking-[0.5em] mb-4 italic">SESSION FEE</p>
                          <p className="text-7xl font-black italic text-white tracking-tighter leading-none">{selectedTrainer.price} <span className="text-2xl text-brand uppercase ml-2 not-italic">BGN</span></p>
                       </div>
                       <button 
                         onClick={() => currentUser ? finalizeBooking(currentUser.name, currentUser.phone, currentUser.id, currentUser.email) : setShowGuestForm(true)} 
                         disabled={!selectedTime || isSubmitting} 
                         className="flex-[2] group w-full py-10 bg-brand text-dark rounded-[3.5rem] font-black uppercase tracking-[0.5em] text-lg shadow-[0_30px_80px_rgba(197,217,45,0.3)] disabled:opacity-20 hover:bg-white hover:scale-[1.03] transition-all flex items-center justify-center gap-6"
                       >
                         {isSubmitting ? <Loader2 className="animate-spin" size={32} /> : (
                           <>INITIALIZE SESSION <ChevronRight size={32} className="group-hover:translate-x-4 transition-transform" /></>
                         )}
                       </button>
                    </div>
                  </div>
               </div>

               <div className="p-20 bg-surface/10 rounded-[5rem] border-2 border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-8">
                      <MessageSquare className="text-brand" size={48} />
                      <h3 className="text-5xl font-black uppercase italic text-white tracking-tighter">CLIENT FEEDBACK</h3>
                    </div>
                    <div className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 italic hidden md:block">VERIFIED BY CLASSFIT</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className="p-10 bg-dark/60 rounded-[3rem] border-2 border-white/5 space-y-6 hover:border-brand/40 transition-all shadow-xl group">
                          <div className="flex justify-between items-start">
                             <div className="flex gap-2 text-brand">
                                {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="currentColor" />)}
                             </div>
                             <span className="text-xs font-black text-slate-700 uppercase tracking-[0.4em]">2 DAYS AGO</span>
                          </div>
                          <p className="text-xl text-slate-400 italic font-medium leading-[1.6] group-hover:text-white transition-colors">"Exceptional coaching and discipline. Saw major strength gains in just 4 weeks. Best training in Varna."</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {showGuestForm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-dark/98 backdrop-blur-[80px] animate-in fade-in duration-700">
           <div className="bg-[#1a2332] rounded-[5rem] p-16 sm:p-24 max-w-2xl w-full border-2 border-white/10 shadow-[0_0_200px_rgba(0,0,0,1)] relative italic">
              <div className="absolute top-0 left-0 w-full h-3 bg-brand"></div>
              <button onClick={()=>setShowGuestForm(false)} className="absolute top-16 right-16 p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={32}/></button>
              
              <div className="mb-16">
                 <h2 className="text-6xl font-black uppercase italic text-white tracking-tighter mb-6">IDENTIFICATION</h2>
                 <p className="text-slate-500 text-sm font-black uppercase tracking-[0.5em] italic">GUEST SESSION CHECK-IN REQUIRED</p>
              </div>

              <form onSubmit={(e)=>{e.preventDefault(); finalizeBooking(guestName, guestPhone, undefined, guestEmail)}} className="space-y-10">
                <div className="space-y-4">
                   <label className="text-sm font-black uppercase text-slate-600 tracking-[0.4em] ml-8">FULL NAME (LEGAL)</label>
                   <input type="text" placeholder="John Doe" required value={guestName} onChange={(e)=>setGuestName(e.target.value)} className="w-full bg-[#131b27] border-2 border-white/10 focus:border-brand rounded-[2.5rem] px-10 py-8 text-2xl font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-4">
                   <label className="text-sm font-black uppercase text-slate-600 tracking-[0.4em] ml-8">MOBILE NUMBER</label>
                   <input type="tel" placeholder="+359..." required value={guestPhone} onChange={(e)=>setGuestPhone(e.target.value)} className="w-full bg-[#131b27] border-2 border-white/10 focus:border-brand rounded-[2.5rem] px-10 py-8 text-2xl font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-4">
                   <label className="text-sm font-black uppercase text-slate-600 tracking-[0.4em] ml-8">EMAIL ADDRESS</label>
                   <input type="email" placeholder="john@email.com" required value={guestEmail} onChange={(e)=>setGuestEmail(e.target.value)} className="w-full bg-[#131b27] border-2 border-white/10 focus:border-brand rounded-[2.5rem] px-10 py-8 text-2xl font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-10 bg-brand text-dark rounded-[3rem] font-black uppercase tracking-[0.5em] text-lg shadow-[0_40px_100px_rgba(197,217,45,0.3)] mt-12 hover:bg-white transition-all transform hover:scale-[1.02]">
                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={40}/> : 'INITIALIZE SESSION'}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
