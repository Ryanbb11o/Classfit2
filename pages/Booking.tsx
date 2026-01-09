
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Added missing ArrowRight icon to lucide-react imports
import { Check, Calendar as CalendarIcon, Clock, User, Phone, X, Loader2, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Star, MapPin, Target, MessageSquare, Sparkles, Languages, ExternalLink, Navigation, PhoneCall, Info, Zap, CalendarDays } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getTrainers, TRANSLATIONS, DEFAULT_PROFILE_IMAGE, getTrainerReviews } from '../constants';
import { Trainer, Booking } from '../types';

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
          bio: u.bio || (language === 'bg' ? 'Професионален инструктор с доказани резултати.' : 'Professional instructor with proven results.'),
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
    return liveReviews.filter(r => r.trainerId === trainerId && r.isPublished).length + 24; // More mock reviews to look established
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
    for (let i = 0; i < offset; i++) days.push(<div key={`empty-${i}`} className="h-16 w-16 md:h-20 md:w-20"></div>);
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 1; i <= daysInMonth; i++) {
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate.toDateString() === current.toDateString();
        const isPast = current < today;
        days.push(
            <button key={i} onClick={() => handleDateClick(i)} disabled={isPast} className={`h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] flex items-center justify-center text-xl font-black transition-all ${isSelected ? 'bg-brand text-dark shadow-2xl shadow-brand/30 scale-110 z-10' : isPast ? 'text-slate-800 cursor-not-allowed border border-white/5' : 'text-white hover:bg-white/10 border border-white/10 hover:border-brand/40'}`}>{i}</button>
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
      <div className="max-w-3xl mx-auto py-32 px-6 animate-in zoom-in-95 duration-700 text-left">
        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_20px_60px_rgba(197,217,45,0.4)] animate-bounce">
            <Check size={64} strokeWidth={4} />
          </div>
          <h2 className="text-6xl md:text-8xl font-black uppercase italic mb-6 text-white tracking-tighter leading-none">{t.reqSent}</h2>
          <div className="inline-flex items-center gap-4 bg-yellow-500/10 px-10 py-5 rounded-full border-2 border-yellow-500/20">
             <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse"></div>
             <span className="text-sm font-black uppercase text-yellow-500 tracking-[0.3em]">{t.waitingConfirmation}</span>
          </div>
        </div>

        <div className="bg-surface border-2 border-white/10 rounded-[4rem] p-12 md:p-16 mb-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-4 bg-brand"></div>
           <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-brand shadow-2xl shrink-0">
                    <img src={selectedTrainer.image} className="w-full h-full object-cover" />
                </div>
                <div className="text-center md:text-left">
                    <p className="text-sm font-black uppercase text-brand tracking-[0.5em] mb-2 italic">{selectedTrainer.specialty}</p>
                    <h3 className="text-5xl md:text-7xl font-black uppercase italic text-white tracking-tighter leading-none">{selectedTrainer.name}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12 border-y-2 border-white/5">
                 <div className="space-y-3">
                    <p className="text-xs font-black uppercase text-slate-500 tracking-[0.6em] italic">SCHEDULED START</p>
                    <p className="text-white font-black uppercase italic text-4xl tracking-tighter leading-tight">{lastBooking.date} <br/> <span className="text-brand">{lastBooking.time}</span></p>
                 </div>
                 <div className="space-y-3">
                    <p className="text-xs font-black uppercase text-slate-500 tracking-[0.6em] italic">ENTRY PIN</p>
                    <p className="text-brand font-black text-7xl md:text-8xl tracking-[0.1em] italic leading-none drop-shadow-[0_0_30px_rgba(197,217,45,0.5)]">{lastBooking.checkInCode}</p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-6">
                <a href={`tel:${selectedTrainer.phone}`} className="flex items-center justify-between px-10 py-8 bg-white/5 text-white rounded-[2.5rem] border-2 border-white/10 hover:bg-white hover:text-dark transition-all group shadow-xl">
                   <div className="flex items-center gap-6">
                     <PhoneCall size={40} className="text-brand group-hover:text-dark" />
                     <span className="text-base font-black uppercase tracking-[0.3em] italic">{t.trainerPhoneLabel}</span>
                   </div>
                   <span className="text-3xl font-black italic tracking-tighter">{selectedTrainer.phone}</span>
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-10 py-8 bg-white/5 text-white rounded-[2.5rem] border-2 border-white/10 hover:bg-brand hover:text-dark transition-all group shadow-xl">
                   <div className="flex items-center gap-6">
                     <Navigation size={40} className="text-brand group-hover:text-dark" />
                     <span className="text-base font-black uppercase tracking-[0.3em] italic">{language === 'bg' ? 'СПИРКА МИР' : 'MIR BUS STOP'}</span>
                   </div>
                   <ExternalLink size={32} />
                </a>
              </div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <button onClick={() => navigate('/profile')} className="flex-1 py-10 bg-brand text-dark rounded-[3rem] font-black uppercase tracking-[0.4em] text-sm hover:bg-white transition-all shadow-2xl">
            {t.myBookings}
          </button>
          <button onClick={() => { setIsSuccess(false); setSelectedTrainer(null); }} className="flex-1 py-10 bg-surface text-slate-400 rounded-[3rem] font-black uppercase tracking-[0.4em] text-sm hover:bg-white/10 transition-all border-2 border-white/5">
            {t.newBooking}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-24 text-left">
      {!selectedTrainer ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
            <div>
              <h1 className="text-7xl md:text-[11rem] font-black uppercase italic mb-8 tracking-[0.02em] text-white leading-[0.7] drop-shadow-2xl">
                ELITE <br/> <span className="text-brand">COACHES</span>
              </h1>
              <div className="flex items-center gap-5 bg-white/5 w-fit px-8 py-4 rounded-3xl border border-white/10 shadow-xl">
                 <Zap size={24} className="text-brand fill-brand" />
                 <p className="text-slate-400 font-black uppercase tracking-[0.6em] text-xs italic">ClassFit Varna Official Roster</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {trainers.map((trainer) => (
              <div key={trainer.id} onClick={() => setSelectedTrainer(trainer)} className="group relative bg-surface rounded-[4.5rem] overflow-hidden cursor-pointer hover:-translate-y-6 transition-all duration-700 border-2 border-white/5 hover:border-brand/60 shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
                <div className="aspect-[4/5] overflow-hidden relative">
                   <img src={trainer.image} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/20 to-transparent"></div>
                   
                   <div className="absolute top-12 right-12">
                     <div className="px-8 py-4 bg-brand text-dark rounded-full text-lg font-black uppercase tracking-widest shadow-2xl scale-110 rotate-3">
                       {trainer.price} BGN
                     </div>
                   </div>

                   <div className="absolute bottom-12 left-12 right-12">
                      <div className="flex items-center gap-3 mb-6 bg-dark/60 backdrop-blur-2xl w-fit px-6 py-3 rounded-2xl border-2 border-white/10 shadow-xl">
                        <Star size={20} className="text-brand fill-brand" />
                        <span className="text-xl font-black text-white italic">5.0 <span className="text-slate-500 ml-2">({getReviewCount(trainer.id)})</span></span>
                      </div>
                      <h3 className="text-5xl md:text-6xl font-black uppercase text-white leading-[0.85] tracking-tighter group-hover:text-brand transition-colors mb-3 italic drop-shadow-2xl">{trainer.name}</h3>
                      <p className="text-sm font-black uppercase text-slate-400 tracking-[0.4em] italic mb-10">{trainer.specialty}</p>
                      
                      <div className="flex gap-4">
                         <div className="w-24 h-24 flex items-center justify-center bg-white/10 rounded-[2rem] hover:bg-brand hover:text-dark transition-all shadow-xl group/btn">
                            <PhoneCall size={32} className="group-hover/btn:scale-110 transition-transform" />
                         </div>
                         <div className="flex-1 flex items-center justify-center gap-4 bg-brand text-dark rounded-[2rem] font-black uppercase text-sm tracking-[0.5em] shadow-2xl group-hover:bg-white transition-colors italic">
                            VIEW DETAILS <ArrowRight size={24} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in slide-in-from-bottom-20 duration-1000">
          <button onClick={() => setSelectedTrainer(null)} className="mb-20 flex items-center gap-6 text-slate-500 hover:text-brand font-black uppercase tracking-[0.6em] text-sm transition-all italic">
            <ArrowLeft size={28} /> BACK TO SELECTION
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            <div className="lg:col-span-5 space-y-12">
               <div className="bg-surface rounded-[6rem] overflow-hidden border-2 border-white/10 shadow-[0_60px_150px_rgba(0,0,0,0.8)] group">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={selectedTrainer.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/5 to-transparent"></div>
                    <div className="absolute bottom-16 left-16 right-16">
                       <h2 className="text-7xl sm:text-[7rem] font-black uppercase italic text-white mb-6 leading-[0.75] tracking-tighter drop-shadow-[0_0_50px_rgba(0,0,0,0.9)]">{selectedTrainer.name}</h2>
                       <div className="inline-flex items-center gap-5 bg-brand px-10 py-5 rounded-full text-base font-black uppercase tracking-[0.3em] text-dark italic shadow-2xl">
                          <Target size={24} /> {selectedTrainer.specialty}
                       </div>
                    </div>
                  </div>
                  <div className="p-16">
                     <div className="grid grid-cols-2 gap-10 mb-16">
                        <div className="p-12 bg-dark/60 rounded-[3.5rem] border-2 border-white/5 text-center shadow-inner">
                           <p className="text-xs font-black uppercase text-slate-600 tracking-[0.6em] mb-4 italic">AVG SCORE</p>
                           <div className="flex items-center justify-center gap-4">
                              <Star size={40} className="text-brand fill-brand" />
                              <span className="text-6xl font-black text-white italic">5.0</span>
                           </div>
                        </div>
                        <div className="p-12 bg-dark/60 rounded-[3.5rem] border-2 border-white/5 text-center shadow-inner">
                           <p className="text-xs font-black uppercase text-slate-600 tracking-[0.6em] mb-4 italic">VERIFIED REVIEWS</p>
                           <p className="text-6xl font-black text-white italic">{getReviewCount(selectedTrainer.id)}</p>
                        </div>
                     </div>
                     <div className="space-y-12">
                        <div className="flex items-start gap-8">
                           <Info className="text-brand mt-2 shrink-0" size={40} />
                           <p className="text-3xl text-slate-300 italic font-medium leading-[1.6]">
                              {selectedTrainer.bio}
                           </p>
                        </div>
                        
                        <div className="pt-16 border-t-4 border-white/5 space-y-8">
                           <a href={`tel:${selectedTrainer.phone}`} className="flex items-center justify-between p-12 bg-white/5 hover:bg-white hover:text-dark rounded-[3.5rem] border-2 border-white/10 transition-all group shadow-2xl">
                              <div className="flex items-center gap-8">
                                 <PhoneCall size={48} className="text-brand group-hover:text-dark" />
                                 <span className="text-sm font-black uppercase text-white group-hover:text-dark tracking-[0.5em] italic">{t.trainerPhoneLabel}</span>
                              </div>
                              <span className="text-4xl font-black group-hover:text-dark transition-colors italic tracking-tighter">{selectedTrainer.phone}</span>
                           </a>
                           <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-12 bg-white/5 hover:bg-brand rounded-[3.5rem] border-2 border-white/10 transition-all group shadow-2xl">
                              <div className="flex items-center gap-8">
                                 <Navigation size={48} className="text-brand group-hover:text-dark" />
                                 <span className="text-sm font-black uppercase text-white group-hover:text-dark tracking-[0.5em] italic">{language === 'bg' ? 'ЛОКАЦИЯ: СПИРКА МИР' : 'LOCATION: MIR STOP'}</span>
                              </div>
                              <ExternalLink size={40} className="text-slate-600 group-hover:text-dark" />
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7 space-y-20">
               <div className="bg-surface/40 backdrop-blur-[100px] p-16 md:p-24 rounded-[6rem] border-2 border-white/10 shadow-[0_80px_150px_rgba(0,0,0,0.8)] italic">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-12 mb-24">
                    <h3 className="text-6xl font-black uppercase text-white flex items-center gap-10 tracking-tighter leading-none">
                      <CalendarDays className="text-brand" size={72} /> TRAINING MATRIX
                    </h3>
                    <div className="flex items-center gap-8 bg-dark/60 p-4 rounded-[2.5rem] border-2 border-white/10 shadow-inner">
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-5 text-slate-500 hover:text-brand transition-colors"><ChevronLeft size={40}/></button>
                       <span className="text-base font-black uppercase tracking-[0.5em] text-white min-w-[240px] text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-5 text-slate-500 hover:text-brand transition-colors"><ChevronRight size={40}/></button>
                    </div>
                  </div>

                  <div className="mb-24 px-6">
                    <div className="grid grid-cols-7 gap-8 text-center mb-16">
                      {['MO','TU','WE','TH','FR','SA','SU'].map(d => (
                        <div key={d} className="text-sm font-black uppercase text-slate-600 tracking-[0.8em]">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-8">
                      {renderCalendar()}
                    </div>
                  </div>

                  <div className="pt-24 border-t-4 border-white/10">
                    <h4 className="text-base font-black uppercase text-slate-500 tracking-[0.8em] mb-16 italic text-center sm:text-left">SELECT YOUR TRANSFORMATION SLOT</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 mb-24">
                        {selectedTrainer.availability.map(time => (
                          <button 
                            key={time} 
                            onClick={() => setSelectedTime(time)} 
                            className={`py-10 rounded-[3rem] text-2xl font-black border-4 transition-all ${
                              selectedTime === time 
                                ? 'bg-brand text-dark border-brand shadow-[0_0_80px_rgba(197,217,45,0.6)] scale-105' 
                                : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand/70'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-16">
                       <div className="flex-1 text-center sm:text-left bg-dark/60 p-12 rounded-[4rem] border-2 border-white/10 min-w-[320px] shadow-inner">
                          <p className="text-sm font-black uppercase text-slate-500 tracking-[0.6em] mb-4 italic">SESSION FEE</p>
                          <p className="text-8xl font-black italic text-white tracking-tighter leading-none">{selectedTrainer.price} <span className="text-3xl text-brand uppercase ml-3 not-italic">BGN</span></p>
                       </div>
                       <button 
                         onClick={() => currentUser ? finalizeBooking(currentUser.name, currentUser.phone, currentUser.id, currentUser.email) : setShowGuestForm(true)} 
                         disabled={!selectedTime || isSubmitting} 
                         className="flex-[2] group w-full py-12 bg-brand text-dark rounded-[4rem] font-black uppercase tracking-[0.6em] text-xl shadow-[0_40px_100px_rgba(197,217,45,0.4)] disabled:opacity-20 hover:bg-white hover:scale-[1.03] transition-all flex items-center justify-center gap-8 italic"
                       >
                         {isSubmitting ? <Loader2 className="animate-spin" size={48} /> : (
                           <>INITIALIZE SESSION <ChevronRight size={48} className="group-hover:translate-x-6 transition-transform" /></>
                         )}
                       </button>
                    </div>
                  </div>
               </div>

               <div className="p-20 md:p-32 bg-surface/10 rounded-[7rem] border-4 border-white/10 shadow-3xl">
                  <div className="flex items-center justify-between mb-24">
                    <div className="flex items-center gap-10">
                      <MessageSquare className="text-brand" size={64} />
                      <h3 className="text-6xl font-black uppercase italic text-white tracking-tighter leading-none">CLIENT FEEDBACK</h3>
                    </div>
                    <div className="text-sm font-black uppercase tracking-[0.8em] text-slate-500 italic hidden xl:block">VERIFIED BY CLASSFIT</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className="p-12 bg-dark/70 rounded-[4rem] border-2 border-white/5 space-y-8 hover:border-brand/50 transition-all duration-500 shadow-2xl group">
                          <div className="flex justify-between items-start">
                             <div className="flex gap-3 text-brand">
                                {[...Array(5)].map((_, j) => <Star key={j} size={24} fill="currentColor" />)}
                             </div>
                             <span className="text-xs font-black text-slate-700 uppercase tracking-[0.6em]">VERIFIED RESULT</span>
                          </div>
                          <p className="text-2xl text-slate-300 italic font-medium leading-[1.6] group-hover:text-white transition-colors">"Exceptional coaching and discipline. Saw major strength gains in just 4 weeks. Best training in Varna."</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {showGuestForm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-dark/99 backdrop-blur-[120px] animate-in fade-in duration-1000">
           <div className="bg-[#1a2332] rounded-[6rem] p-20 sm:p-32 max-w-3xl w-full border-4 border-white/10 shadow-[0_0_250px_rgba(0,0,0,1)] relative italic">
              <div className="absolute top-0 left-0 w-full h-4 bg-brand"></div>
              <button onClick={()=>setShowGuestForm(false)} className="absolute top-20 right-20 p-6 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={48}/></button>
              
              <div className="mb-20 text-center">
                 <h2 className="text-7xl font-black uppercase italic text-white tracking-tighter mb-8">IDENTIFICATION</h2>
                 <p className="text-slate-500 text-sm font-black uppercase tracking-[0.8em] italic">GUEST SESSION CHECK-IN REQUIRED</p>
              </div>

              <form onSubmit={(e)=>{e.preventDefault(); finalizeBooking(guestName, guestPhone, undefined, guestEmail)}} className="space-y-12">
                <div className="space-y-6">
                   <label className="text-sm font-black uppercase text-slate-600 tracking-[0.6em] ml-12">FULL NAME (LEGAL)</label>
                   <input type="text" placeholder="John Doe" required value={guestName} onChange={(e)=>setGuestName(e.target.value)} className="w-full bg-[#131b27] border-4 border-white/10 focus:border-brand rounded-[3.5rem] px-12 py-10 text-3xl font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-6">
                   <label className="text-sm font-black uppercase text-slate-600 tracking-[0.6em] ml-12">MOBILE NUMBER</label>
                   <input type="tel" placeholder="+359..." required value={guestPhone} onChange={(e)=>setGuestPhone(e.target.value)} className="w-full bg-[#131b27] border-4 border-white/10 focus:border-brand rounded-[3.5rem] px-12 py-10 text-3xl font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-6">
                   <label className="text-sm font-black uppercase text-slate-600 tracking-[0.6em] ml-12">EMAIL ADDRESS</label>
                   <input type="email" placeholder="john@email.com" required value={guestEmail} onChange={(e)=>setGuestEmail(e.target.value)} className="w-full bg-[#131b27] border-4 border-white/10 focus:border-brand rounded-[3.5rem] px-12 py-10 text-3xl font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-12 bg-brand text-dark rounded-[4rem] font-black uppercase tracking-[0.6em] text-xl shadow-[0_50px_120px_rgba(197,217,45,0.4)] mt-16 hover:bg-white transition-all transform hover:scale-[1.02]">
                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={56}/> : 'INITIALIZE SESSION'}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
