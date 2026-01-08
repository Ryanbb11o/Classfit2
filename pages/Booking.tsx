
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar as CalendarIcon, Clock, User, Phone, X, Loader2, ChevronLeft, ChevronRight, ArrowLeft, Star, MapPin, Target, ShieldCheck, CalendarPlus, MessageSquare, Sparkles, Languages } from 'lucide-react';
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

  const allTrainerReviews = useMemo(() => {
    if (!selectedTrainer) return [];
    const realReviews = liveReviews.filter(r => r.trainerId === selectedTrainer.id && r.isPublished);
    const demoReviews = getTrainerReviews(selectedTrainer.id, language);
    return [...realReviews, ...demoReviews].slice(0, 5);
  }, [selectedTrainer, language, liveReviews]);

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
    for (let i = 0; i < offset; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 1; i <= daysInMonth; i++) {
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate.toDateString() === current.toDateString();
        const isPast = current < today;
        days.push(
            <button key={i} onClick={() => handleDateClick(i)} disabled={isPast} className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isSelected ? 'bg-brand text-dark shadow-lg' : isPast ? 'text-slate-700 cursor-not-allowed' : 'text-white/60 hover:bg-white/5'}`}>{i}</button>
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
      <div className="max-w-xl mx-auto py-32 px-4 text-center">
        <div className="w-16 h-16 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"><Check size={32}/></div>
        <h2 className="text-3xl font-black uppercase italic mb-4 text-white">{t.reqSent}</h2>
        <p className="text-slate-400 mb-10 text-xs">{t.trainerReviewMsg}</p>
        <button onClick={() => navigate('/profile')} className="w-full py-4 bg-white text-dark rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-brand transition-all">{t.myBookings}</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-left">
      {!selectedTrainer ? (
        <>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic mb-4 tracking-tighter text-white">{t.booking}</h1>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-12">ClassFit Varna • ул. Студентска 1А</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 italic">
            {trainers.map((trainer) => (
              <div key={trainer.id} onClick={() => setSelectedTrainer(trainer)} className="group relative bg-surface/50 rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all">
                <div className="aspect-[3/4] overflow-hidden"><img src={trainer.image} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" /></div>
                <div className="p-6 bg-dark/40 border-t border-white/5"><p className="text-[9px] font-black uppercase text-brand mb-1">{trainer.specialty}</p><h3 className="text-xl font-black uppercase text-white">{trainer.name}</h3></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setSelectedTrainer(null)} className="mb-12 flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase text-[10px]"><ArrowLeft size={14} /> Back</button>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 bg-surface rounded-[2.5rem] overflow-hidden border border-white/5">
               <img src={selectedTrainer.image} className="w-full aspect-[4/5] object-cover" />
               <div className="p-10"><h2 className="text-3xl font-black uppercase italic text-white mb-2">{selectedTrainer.name}</h2><p className="text-xs text-slate-400 italic leading-relaxed">{selectedTrainer.bio}</p></div>
            </div>
            <div className="lg:col-span-8 bg-surface/30 p-10 rounded-[3rem] border border-white/5 italic">
               <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-black uppercase text-white flex items-center gap-3"><CalendarIcon className="text-brand" /> Schedule</h3><span className="text-[10px] font-black uppercase text-white">{currentMonth.toLocaleString('default', { month: 'long' })}</span></div>
               <div className="grid grid-cols-7 gap-1 text-center mb-4 text-[9px] font-black text-slate-500">{['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=><div key={d}>{d}</div>)}</div>
               <div className="grid grid-cols-7 gap-2 mb-10">{renderCalendar()}</div>
               <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4">Available Slots</h3>
               <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-10">
                  {selectedTrainer.availability.map(time => (
                    <button key={time} onClick={() => setSelectedTime(time)} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${selectedTime === time ? 'bg-brand text-dark border-brand shadow-lg' : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand/40'}`}>{time}</button>
                  ))}
               </div>
               <button onClick={() => currentUser ? finalizeBooking(currentUser.name, currentUser.phone, currentUser.id, currentUser.email) : setShowGuestForm(true)} disabled={!selectedTime || isSubmitting} className="w-full py-5 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl disabled:opacity-20">{isSubmitting ? <Loader2 className="animate-spin mx-auto"/> : 'Confirm Session'}</button>
            </div>
          </div>
        </div>
      )}
      {showGuestForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md">
           <div className="bg-surface rounded-[2.5rem] p-10 max-w-sm w-full border border-white/10 italic">
              <h2 className="text-2xl font-black uppercase italic text-white mb-6">Guest Info</h2>
              <form onSubmit={(e)=>{e.preventDefault(); finalizeBooking(guestName, guestPhone, undefined, guestEmail)}} className="space-y-4">
                <input type="text" placeholder="Name & Surname" required value={guestName} onChange={(e)=>setGuestName(e.target.value)} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                <input type="tel" placeholder="Phone" required value={guestPhone} onChange={(e)=>setGuestPhone(e.target.value)} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                <input type="email" placeholder="Email" required value={guestEmail} onChange={(e)=>setGuestEmail(e.target.value)} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                <button type="submit" className="w-full py-4 bg-brand text-dark rounded-xl font-black uppercase">Finalize Request</button>
                <button type="button" onClick={()=>setShowGuestForm(false)} className="w-full text-slate-500 uppercase font-black text-[10px]">Cancel</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
