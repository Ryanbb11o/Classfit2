
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, User, Phone, X, Loader2, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Star, MapPin, Target, MessageSquare, ExternalLink, Navigation, PhoneCall, Info, Zap, CalendarDays } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getTrainers, TRANSLATIONS, DEFAULT_PROFILE_IMAGE } from '../constants';
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
          bio: u.bio || (language === 'bg' ? 'Професионален инструктор в ClassFit Varna.' : 'Professional instructor at ClassFit Varna.'),
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
    return liveReviews.filter(r => r.trainerId === trainerId && r.isPublished).length + 32;
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
    for (let i = 0; i < offset; i++) days.push(<div key={`empty-${i}`} className="h-10 w-10 md:h-12 md:w-12"></div>);
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 1; i <= daysInMonth; i++) {
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate.toDateString() === current.toDateString();
        const isPast = current < today;
        days.push(
            <button key={i} onClick={() => handleDateClick(i)} disabled={isPast} className={`h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-xs font-black transition-all ${isSelected ? 'bg-brand text-dark shadow-md scale-110 z-10' : isPast ? 'text-slate-800 cursor-not-allowed' : 'text-white hover:bg-white/10 border border-white/10 hover:border-brand/40'}`}>{i}</button>
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
      <div className="max-w-2xl mx-auto py-24 px-6 animate-in zoom-in-95 duration-500 text-left">
        <div className="bg-surface border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-brand"></div>
           <div className="w-16 h-16 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
              <Check size={32} strokeWidth={4} />
           </div>
           <h2 className="text-3xl font-black uppercase italic mb-2 text-white">{t.reqSent}</h2>
           <p className="text-slate-400 text-sm mb-10 italic">{t.trainerReviewMsg}</p>
           
           <div className="bg-dark/40 rounded-3xl p-8 mb-10 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 italic">PIN CODE</p>
                 <p className="text-5xl font-black text-brand tracking-widest italic">{lastBooking.checkInCode}</p>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <CalendarDays size={16} className="text-slate-500" />
                    <span className="text-sm font-bold text-white uppercase">{lastBooking.date}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-500" />
                    <span className="text-sm font-bold text-white uppercase">{lastBooking.time}</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/profile')} className="flex-1 py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all">
                {t.myBookings}
              </button>
              <button onClick={() => { setIsSuccess(false); setSelectedTrainer(null); }} className="flex-1 py-4 bg-surface text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/10">
                {t.newBooking}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16 text-left">
      {!selectedTrainer ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic mb-4 tracking-tighter text-white leading-none">
                ELITE <span className="text-brand">PERSONNEL</span>
              </h1>
              <div className="flex items-center gap-3 bg-white/5 w-fit px-4 py-2 rounded-xl border border-white/10">
                 <Zap size={14} className="text-brand fill-brand" />
                 <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[9px] italic">Official Varna Coach Roster</p>
              </div>
            </div>
            <div className="text-right hidden md:block">
               <p className="text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] mb-1 italic">LOCATION</p>
               <h3 className="text-lg font-black uppercase italic text-white">BUS STOP MIR, VARNA</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer.id} onClick={() => setSelectedTrainer(trainer)} className="group relative bg-surface rounded-[2rem] overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 border border-white/5 hover:border-brand/40 shadow-xl">
                <div className="aspect-[4/5] overflow-hidden relative">
                   <img src={trainer.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/10 to-transparent"></div>
                   
                   <div className="absolute top-4 right-4">
                     <div className="px-3 py-1.5 bg-brand text-dark rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                       {trainer.price} BGN
                     </div>
                   </div>

                   <div className="absolute bottom-5 left-5 right-5">
                      <div className="flex items-center gap-2 mb-2 bg-dark/60 backdrop-blur-md w-fit px-2.5 py-1 rounded-lg border border-white/10">
                        <Star size={10} className="text-brand fill-brand" />
                        <span className="text-[10px] font-black text-white italic">5.0 <span className="text-slate-500 ml-1">({getReviewCount(trainer.id)})</span></span>
                      </div>
                      <h3 className="text-xl font-black uppercase text-white leading-tight group-hover:text-brand transition-colors mb-1 italic">{trainer.name}</h3>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] italic mb-6">{trainer.specialty}</p>
                      
                      <div className="flex gap-2">
                         <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-brand hover:text-dark transition-all">
                            <PhoneCall size={16} />
                         </div>
                         <div className="flex-1 flex items-center justify-center gap-2 bg-brand text-dark rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg italic">
                            VIEW PROFILE <ArrowRight size={14} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          <button onClick={() => setSelectedTrainer(null)} className="mb-10 flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all italic">
            <ArrowLeft size={14} /> BACK TO LIST
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT COLUMN: Profile Info */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-surface rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={selectedTrainer.image} className="w-full h-full object-cover grayscale-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/5 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                       <h2 className="text-3xl font-black uppercase italic text-white mb-2 leading-tight">{selectedTrainer.name}</h2>
                       <div className="inline-flex items-center gap-2 bg-brand px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-dark italic">
                          <Target size={12} /> {selectedTrainer.specialty}
                       </div>
                    </div>
                  </div>
                  <div className="p-8">
                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-dark/40 rounded-2xl border border-white/5 text-center">
                           <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1 italic">RATING</p>
                           <div className="flex items-center justify-center gap-1.5">
                              <Star size={14} className="text-brand fill-brand" />
                              <span className="text-lg font-black text-white italic">5.0</span>
                           </div>
                        </div>
                        <div className="p-4 bg-dark/40 rounded-2xl border border-white/5 text-center">
                           <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1 italic">REVIEWS</p>
                           <p className="text-lg font-black text-white italic">{getReviewCount(selectedTrainer.id)}</p>
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="flex items-start gap-4">
                           <Info className="text-brand mt-1 shrink-0" size={20} />
                           <p className="text-sm text-slate-400 italic leading-relaxed">
                              {selectedTrainer.bio}
                           </p>
                        </div>
                        
                        <div className="pt-6 border-t border-white/5 space-y-3">
                           <a href={`tel:${selectedTrainer.phone}`} className="flex items-center justify-between p-5 bg-white/5 hover:bg-white hover:text-dark rounded-2xl border border-white/10 transition-all group shadow-lg">
                              <div className="flex items-center gap-4">
                                 <PhoneCall size={20} className="text-brand group-hover:text-dark" />
                                 <span className="text-[9px] font-black uppercase tracking-widest italic">{t.trainerPhoneLabel}</span>
                              </div>
                              <span className="text-base font-black group-hover:text-dark italic">{selectedTrainer.phone}</span>
                           </a>
                           <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-white/5 hover:bg-brand rounded-2xl border border-white/10 transition-all group shadow-lg">
                              <div className="flex items-center gap-4">
                                 <Navigation size={20} className="text-brand group-hover:text-dark" />
                                 <span className="text-[9px] font-black uppercase tracking-widest italic">{language === 'bg' ? 'ЛОКАЦИЯ: СПИРКА МИР' : 'LOCATION: MIR STOP'}</span>
                              </div>
                              <ExternalLink size={16} className="text-slate-600 group-hover:text-dark" />
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: Calendar & Slots */}
            <div className="lg:col-span-8 space-y-8">
               <div className="bg-surface/30 backdrop-blur-md p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl italic">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
                    <h3 className="text-2xl font-black uppercase text-white flex items-center gap-4 tracking-tighter">
                      <CalendarDays className="text-brand" size={32} /> TRAINING MATRIX
                    </h3>
                    <div className="flex items-center gap-4 bg-dark/60 p-1.5 rounded-xl border border-white/10">
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 text-slate-500 hover:text-brand transition-colors"><ChevronLeft size={18}/></button>
                       <span className="text-[10px] font-black uppercase tracking-widest text-white min-w-[150px] text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 text-slate-500 hover:text-brand transition-colors"><ChevronRight size={18}/></button>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="grid grid-cols-7 gap-2 text-center mb-6">
                      {['MO','TU','WE','TH','FR','SA','SU'].map(d => (
                        <div key={d} className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {renderCalendar()}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-8 italic">AVAILABLE TIME SLOTS</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10">
                        {selectedTrainer.availability.map(time => (
                          <button 
                            key={time} 
                            onClick={() => setSelectedTime(time)} 
                            className={`py-4 rounded-xl text-xs font-black border transition-all ${
                              selectedTime === time 
                                ? 'bg-brand text-dark border-brand shadow-lg scale-105' 
                                : 'bg-white/5 text-slate-400 border-white/10 hover:border-brand/40'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-8 pt-4 border-t border-white/5">
                       <div className="flex-1 text-center sm:text-left">
                          <p className="text-[9px] font-black uppercase text-slate-600 mb-1 italic">SESSION FEE</p>
                          <p className="text-4xl font-black italic text-white tracking-tighter">{selectedTrainer.price} <span className="text-lg text-brand uppercase not-italic">BGN</span></p>
                       </div>
                       <button 
                         onClick={() => currentUser ? finalizeBooking(currentUser.name, currentUser.phone, currentUser.id, currentUser.email) : setShowGuestForm(true)} 
                         disabled={!selectedTime || isSubmitting} 
                         className="flex-[2] group w-full py-5 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl disabled:opacity-20 hover:bg-white hover:scale-[1.02] transition-all flex items-center justify-center gap-3 italic"
                       >
                         {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                           <>INITIALIZE SESSION <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                         )}
                       </button>
                    </div>
                  </div>
               </div>

               <div className="p-10 bg-surface/10 rounded-[3rem] border border-white/10 shadow-xl">
                  <div className="flex items-center gap-4 mb-10">
                    <MessageSquare className="text-brand" size={24} />
                    <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">CLIENT REVIEWS</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[...Array(2)].map((_, i) => (
                       <div key={i} className="p-6 bg-dark/60 rounded-2xl border border-white/5 space-y-4 shadow-lg group">
                          <div className="flex justify-between items-start">
                             <div className="flex gap-1.5 text-brand">
                                {[...Array(5)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                             </div>
                             <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">VERIFIED SQUAD</span>
                          </div>
                          <p className="text-xs text-slate-400 italic font-medium leading-relaxed group-hover:text-white transition-colors">"Exceptional coaching and discipline. Saw major strength gains in just 4 weeks. Best training in Varna."</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {showGuestForm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-dark/98 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-[#1a2332] rounded-[2.5rem] p-10 max-w-md w-full border border-white/10 shadow-2xl relative italic">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
              <button onClick={()=>setShowGuestForm(false)} className="absolute top-8 right-8 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20}/></button>
              
              <div className="mb-10 text-center">
                 <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter mb-2">IDENTIFICATION</h2>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">GUEST CHECK-IN REQUIRED</p>
              </div>

              <form onSubmit={(e)=>{e.preventDefault(); finalizeBooking(guestName, guestPhone, undefined, guestEmail)}} className="space-y-5">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-2">FULL NAME</label>
                   <input type="text" placeholder="John Doe" required value={guestName} onChange={(e)=>setGuestName(e.target.value)} className="w-full bg-[#131b27] border border-white/10 focus:border-brand rounded-xl px-5 py-4 text-sm font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-2">PHONE</label>
                   <input type="tel" placeholder="+359..." required value={guestPhone} onChange={(e)=>setGuestPhone(e.target.value)} className="w-full bg-[#131b27] border border-white/10 focus:border-brand rounded-xl px-5 py-4 text-sm font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-2">EMAIL</label>
                   <input type="email" placeholder="john@email.com" required value={guestEmail} onChange={(e)=>setGuestEmail(e.target.value)} className="w-full bg-[#131b27] border border-white/10 focus:border-brand rounded-xl px-5 py-4 text-sm font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl mt-6 hover:bg-white transition-all transform hover:scale-[1.02]">
                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'INITIALIZE SESSION'}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
