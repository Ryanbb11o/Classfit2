
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, User, Phone, X, Loader2, ChevronLeft, ChevronRight, ArrowLeft, Star, MapPin, Target, MessageSquare, Sparkles, Languages, ExternalLink, Navigation, PhoneCall, Info } from 'lucide-react';
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
    return liveReviews.filter(r => r.trainerId === trainerId && r.isPublished).length + 12; // Base mock reviews
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
    for (let i = 0; i < offset; i++) days.push(<div key={`empty-${i}`} className="h-12 w-12 sm:h-14 sm:w-14"></div>);
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 1; i <= daysInMonth; i++) {
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate.toDateString() === current.toDateString();
        const isPast = current < today;
        days.push(
            <button key={i} onClick={() => handleDateClick(i)} disabled={isPast} className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center text-sm sm:text-base font-black transition-all ${isSelected ? 'bg-brand text-dark shadow-2xl shadow-brand/20 scale-110' : isPast ? 'text-slate-800 cursor-not-allowed' : 'text-white/80 hover:bg-white/10 border border-white/5 hover:border-brand/40'}`}>{i}</button>
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
      setLastBooking(newBooking);
      setShowGuestForm(false);
      setIsSuccess(true);
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  if (isSuccess && lastBooking && selectedTrainer) {
    return (
      <div className="max-w-xl mx-auto py-32 px-4 animate-in zoom-in-95 duration-500 text-left">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand/20 animate-bounce">
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className="text-5xl font-black uppercase italic mb-2 text-white tracking-tighter leading-none">{t.reqSent}</h2>
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 px-8 py-4 rounded-full border border-yellow-500/20 mb-8 mt-4">
             <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
             <span className="text-xs font-black uppercase text-yellow-500 tracking-widest">{t.waitingConfirmation}</span>
          </div>
        </div>

        <div className="bg-surface border border-white/10 rounded-[3rem] p-10 mb-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-brand"></div>
           <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-brand shadow-2xl">
                    <img src={selectedTrainer.image} className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-xs font-black uppercase text-brand tracking-[0.3em] mb-1 italic">{selectedTrainer.specialty}</p>
                    <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none">{selectedTrainer.name}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                 <div>
                    <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2 italic">DATE & TIME</p>
                    <p className="text-white font-black uppercase italic text-2xl tracking-tighter">{lastBooking.date} <br/> {lastBooking.time}</p>
                 </div>
                 <div>
                    <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2 italic">ENTRY PIN</p>
                    <p className="text-brand font-black text-4xl tracking-[0.2em] italic leading-none">{lastBooking.checkInCode}</p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <a href={`tel:${selectedTrainer.phone}`} className="flex items-center justify-between px-8 py-6 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white hover:text-dark transition-all group">
                   <div className="flex items-center gap-4">
                     <Phone size={24} className="text-brand group-hover:text-dark" />
                     <span className="text-sm font-black uppercase tracking-widest italic">{t.trainerPhoneLabel}</span>
                   </div>
                   <span className="text-base font-black italic">{selectedTrainer.phone}</span>
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-8 py-6 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-brand hover:text-dark transition-all group">
                   <div className="flex items-center gap-4">
                     <Navigation size={24} className="text-brand group-hover:text-dark" />
                     <span className="text-sm font-black uppercase tracking-widest italic">{language === 'bg' ? 'ОТИДИ ДО ЗАЛАТА' : 'NAVIGATE TO GYM'}</span>
                   </div>
                   <ExternalLink size={18} />
                </a>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-4">
          <button onClick={() => navigate('/profile')} className="w-full py-6 bg-brand text-dark rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-white transition-all shadow-2xl shadow-brand/20">
            {t.myBookings}
          </button>
          <button onClick={() => { setIsSuccess(false); setSelectedTrainer(null); }} className="w-full py-6 bg-surface text-slate-400 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition-all border border-white/5">
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div>
              <h1 className="text-6xl md:text-[8rem] font-black uppercase italic mb-6 tracking-tighter text-white leading-[0.8] drop-shadow-2xl">
                CHOOSE <span className="text-brand">YOUR</span> <br/> ELITE COACH
              </h1>
              <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs italic">ClassFit Varna • Pro Personnel • Varna, BG</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {trainers.map((trainer) => (
              <div key={trainer.id} onClick={() => setSelectedTrainer(trainer)} className="group relative bg-surface rounded-[3rem] overflow-hidden cursor-pointer hover:-translate-y-4 transition-all duration-700 border border-white/5 hover:border-brand/40 shadow-2xl">
                <div className="aspect-[4/5] overflow-hidden relative">
                   <img src={trainer.image} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
                   
                   <div className="absolute top-8 left-8 flex flex-col gap-2">
                     <div className="px-5 py-2 bg-brand text-dark rounded-full text-xs font-black uppercase tracking-widest shadow-2xl">
                       {trainer.price} BGN
                     </div>
                   </div>

                   <div className="absolute bottom-8 left-8 right-8">
                      <div className="flex items-center gap-2 mb-3 bg-dark/60 backdrop-blur-md w-fit px-3 py-1.5 rounded-xl border border-white/10">
                        <Star size={14} className="text-brand fill-brand" />
                        <span className="text-sm font-black text-white italic">5.0 <span className="text-slate-500 ml-1">({getReviewCount(trainer.id)})</span></span>
                      </div>
                      <h3 className="text-4xl font-black uppercase text-white leading-none tracking-tighter group-hover:text-brand transition-colors mb-2 italic">{trainer.name}</h3>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] italic mb-6">{trainer.specialty}</p>
                      
                      <div className="flex gap-2">
                         <div className="flex-1 flex items-center justify-center p-4 bg-white/10 rounded-2xl hover:bg-brand hover:text-dark transition-all">
                            <PhoneCall size={18} />
                         </div>
                         <div className="flex-[3] flex items-center justify-center gap-2 p-4 bg-brand text-dark rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">
                            BOOK SESSION <ChevronRight size={14} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in slide-in-from-bottom-12 duration-1000">
          <button onClick={() => setSelectedTrainer(null)} className="mb-16 flex items-center gap-4 text-slate-500 hover:text-white font-black uppercase tracking-[0.4em] text-xs transition-all italic">
            <ArrowLeft size={20} /> RETURN TO ROSTER
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 space-y-8">
               <div className="bg-surface rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl group">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={selectedTrainer.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/20 to-transparent"></div>
                    <div className="absolute bottom-12 left-12 right-12">
                       <h2 className="text-6xl sm:text-7xl font-black uppercase italic text-white mb-4 leading-[0.85] tracking-tighter drop-shadow-2xl">{selectedTrainer.name}</h2>
                       <div className="inline-flex items-center gap-3 bg-brand px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest text-dark italic shadow-2xl">
                          <Target size={16} /> {selectedTrainer.specialty}
                       </div>
                    </div>
                  </div>
                  <div className="p-12">
                     <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="p-6 bg-dark/40 rounded-3xl border border-white/5 text-center">
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2 italic">AVERAGE SCORE</p>
                           <div className="flex items-center justify-center gap-2">
                              <Star size={20} className="text-brand fill-brand" />
                              <span className="text-3xl font-black text-white italic">5.0</span>
                           </div>
                        </div>
                        <div className="p-6 bg-dark/40 rounded-3xl border border-white/5 text-center">
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2 italic">TOTAL REVIEWS</p>
                           <p className="text-3xl font-black text-white italic">{getReviewCount(selectedTrainer.id)}</p>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="flex items-start gap-4">
                           <Info className="text-brand mt-1" size={24} />
                           <p className="text-lg text-slate-300 italic font-medium leading-relaxed">
                              {selectedTrainer.bio}
                           </p>
                        </div>
                        
                        <div className="pt-8 border-t border-white/5 space-y-4">
                           <a href={`tel:${selectedTrainer.phone}`} className="flex items-center justify-between p-8 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all group">
                              <div className="flex items-center gap-5">
                                 <PhoneCall size={28} className="text-brand" />
                                 <span className="text-xs font-black uppercase text-white tracking-[0.3em] italic">{t.trainerPhoneLabel}</span>
                              </div>
                              <span className="text-xl font-black text-slate-400 group-hover:text-white transition-colors italic">{selectedTrainer.phone}</span>
                           </a>
                           <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-8 bg-white/5 hover:bg-brand rounded-3xl border border-white/5 transition-all group">
                              <div className="flex items-center gap-5">
                                 <Navigation size={28} className="text-brand group-hover:text-dark" />
                                 <span className="text-xs font-black uppercase text-white group-hover:text-dark tracking-[0.3em] italic">{language === 'bg' ? 'ЛОКАЦИЯ: СПИРКА МИР' : 'LOCATION: MIR STOP'}</span>
                              </div>
                              <ExternalLink size={20} className="text-slate-600 group-hover:text-dark" />
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7 space-y-12">
               <div className="bg-surface/30 backdrop-blur-3xl p-10 sm:p-16 rounded-[4rem] border border-white/10 shadow-2xl italic">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-16">
                    <h3 className="text-4xl font-black uppercase text-white flex items-center gap-6 tracking-tighter">
                      <CalendarIcon className="text-brand" size={40} /> TRAINING MATRIX
                    </h3>
                    <div className="flex items-center gap-4 bg-dark/40 p-2 rounded-2xl border border-white/5">
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 text-slate-500 hover:text-brand transition-colors"><ChevronLeft size={24}/></button>
                       <span className="text-xs font-black uppercase tracking-[0.3em] text-white min-w-[160px] text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 text-slate-500 hover:text-brand transition-colors"><ChevronRight size={24}/></button>
                    </div>
                  </div>

                  <div className="mb-16">
                    <div className="grid grid-cols-7 gap-4 text-center mb-8">
                      {['MO','TU','WE','TH','FR','SA','SU'].map(d => (
                        <div key={d} className="text-xs font-black uppercase text-slate-600 tracking-[0.4em]">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                      {renderCalendar()}
                    </div>
                  </div>

                  <div className="pt-16 border-t border-white/10">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.5em] mb-10 italic">SELECT YOUR TRANSFORMATION SLOT</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
                        {selectedTrainer.availability.map(time => (
                          <button 
                            key={time} 
                            onClick={() => setSelectedTime(time)} 
                            className={`py-6 rounded-3xl text-sm font-black border transition-all ${
                              selectedTime === time 
                                ? 'bg-brand text-dark border-brand shadow-[0_0_40px_rgba(197,217,45,0.4)] scale-105' 
                                : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand/40'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-10">
                       <div className="flex-1 text-center sm:text-left">
                          <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] mb-2">SESSION FEE</p>
                          <p className="text-6xl font-black italic text-white tracking-tighter leading-none">{selectedTrainer.price} <span className="text-2xl text-brand uppercase ml-2">BGN</span></p>
                       </div>
                       <button 
                         onClick={() => currentUser ? finalizeBooking(currentUser.name, currentUser.phone, currentUser.id, currentUser.email) : setShowGuestForm(true)} 
                         disabled={!selectedTime || isSubmitting} 
                         className="flex-[2] group w-full py-8 bg-brand text-dark rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-brand/20 disabled:opacity-20 hover:bg-white hover:scale-[1.03] transition-all flex items-center justify-center gap-4"
                       >
                         {isSubmitting ? <Loader2 className="animate-spin" /> : (
                           <>INITIALIZE SESSION <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" /></>
                         )}
                       </button>
                    </div>
                  </div>
               </div>

               <div className="p-16 bg-surface/10 rounded-[4rem] border border-white/10">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                      <MessageSquare className="text-brand" size={32} />
                      <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">CLIENT FEEDBACK</h3>
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 italic">VERIFIED BY CLASSFIT</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className="p-8 bg-dark/40 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-brand/30 transition-all">
                          <div className="flex justify-between items-start">
                             <div className="flex gap-1.5 text-brand">
                                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                             </div>
                             <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">2 DAYS AGO</span>
                          </div>
                          <p className="text-base text-slate-400 italic font-medium leading-relaxed">"Exceptional coaching and discipline. Saw major strength gains in just 4 weeks. Best training in Varna."</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {showGuestForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-dark/98 backdrop-blur-3xl animate-in fade-in duration-700">
           <div className="bg-[#1a2332] rounded-[4rem] p-12 sm:p-20 max-w-xl w-full border border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.8)] relative italic">
              <div className="absolute top-0 left-0 w-full h-2 bg-brand"></div>
              <button onClick={()=>setShowGuestForm(false)} className="absolute top-12 right-12 p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={28}/></button>
              
              <div className="mb-12">
                 <h2 className="text-5xl font-black uppercase italic text-white tracking-tighter mb-4">IDENTIFICATION</h2>
                 <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] italic">GUEST SESSION CHECK-IN</p>
              </div>

              <form onSubmit={(e)=>{e.preventDefault(); finalizeBooking(guestName, guestPhone, undefined, guestEmail)}} className="space-y-8">
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase text-slate-600 tracking-[0.3em] ml-6">FULL NAME (FIRST & LAST)</label>
                   <input type="text" placeholder="John Doe" required value={guestName} onChange={(e)=>setGuestName(e.target.value)} className="w-full bg-[#131b27] border border-white/10 focus:border-brand rounded-3xl px-8 py-6 text-lg font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase text-slate-600 tracking-[0.3em] ml-6">MOBILE NUMBER</label>
                   <input type="tel" placeholder="+359..." required value={guestPhone} onChange={(e)=>setGuestPhone(e.target.value)} className="w-full bg-[#131b27] border border-white/10 focus:border-brand rounded-3xl px-8 py-6 text-lg font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase text-slate-600 tracking-[0.3em] ml-6">EMAIL ADDRESS</label>
                   <input type="email" placeholder="john@email.com" required value={guestEmail} onChange={(e)=>setGuestEmail(e.target.value)} className="w-full bg-[#131b27] border border-white/10 focus:border-brand rounded-3xl px-8 py-6 text-lg font-black text-white outline-none transition-all shadow-inner" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-8 bg-brand text-dark rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-brand/30 mt-10 hover:bg-white transition-all transform hover:scale-[1.02]">
                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={32}/> : 'INITIALIZE SESSION'}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
