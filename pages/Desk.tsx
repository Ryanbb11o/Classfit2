
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, User, Briefcase, Calendar, Clock, Banknote, CreditCard, CheckCircle2, ShieldCheck, Phone, X, Loader2, DollarSign, Wallet, Mail, MapPin, Languages, ChevronRight, AlertCircle, Timer } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Booking } from '../types';

const Desk: React.FC = () => {
  const { language, bookings, isCashier, users, updateBooking, confirmAction } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const [searchCode, setSearchCode] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isCashier) navigate('/');
  }, [isCashier]);

  const today = new Date().toISOString().split('T')[0];
  
  const todayUnpaid = useMemo(() => {
    return bookings.filter(b => 
      b.date === today && 
      (b.status === 'confirmed' || b.status === 'trainer_completed' || b.status === 'pending')
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings, today]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = searchCode.trim().toUpperCase();
    if (!code) return;
    
    const result = bookings.find(b => b.checkInCode.toUpperCase() === code);
    if (result) {
      setFoundBooking(result);
    } else {
      setFoundBooking(null);
      alert(language === 'bg' ? 'Кодът не е намерен.' : 'Code not found.');
    }
  };

  const selectFromList = (booking: Booking) => {
    setFoundBooking(booking);
    setSearchCode(booking.checkInCode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const processPayment = async (method: 'cash' | 'card') => {
    if (!foundBooking) return;
    
    confirmAction({
      title: language === 'bg' ? 'Потвърди плащане' : 'Confirm Payment',
      message: `${language === 'bg' ? 'Приемане на плащане от' : 'Accept payment from'} ${foundBooking.customerName} - ${foundBooking.price.toFixed(2)} BGN (${method.toUpperCase()})`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await updateBooking(foundBooking.id, { 
            status: 'completed', 
            paymentMethod: method 
          });
          setFoundBooking(null);
          setSearchCode('');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const quickConfirm = async () => {
    if (!foundBooking) return;
    setIsProcessing(true);
    try {
      await updateBooking(foundBooking.id, { status: 'confirmed' });
      setFoundBooking({ ...foundBooking, status: 'confirmed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTrainerName = (id: string) => users.find(u => u.id === id)?.name.split('(')[0].trim() || 'Coach';

  const calculateTimeRange = (startTime: string, durationMins: number = 60) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMins;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
  };

  if (!isCashier) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in duration-500 text-left">
      <div className="mb-16 text-center">
         <div className="inline-flex items-center gap-3 bg-brand/10 text-brand px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 border border-brand/20">
            <QrCode size={14} /> Front Desk Authorization
         </div>
         <h1 className="text-5xl md:text-7xl font-black uppercase italic mb-4 tracking-tighter leading-none text-white">Entry <span className="text-brand">Terminal</span></h1>
         <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[11px] italic">Mark Paid • Verify Identity • Support Client</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* SEARCH & ACTION AREA */}
         <div className="lg:col-span-7 space-y-8">
            <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8 shadow-xl">
               <form onSubmit={handleSearch} className="relative mb-8">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                     <Search className="text-slate-500" size={20} />
                  </div>
                  <input 
                     type="text" 
                     value={searchCode}
                     onChange={(e) => setSearchCode(e.target.value)}
                     placeholder={language === 'bg' ? "Въведете 6-цифрен код..." : "Enter 6-digit code..."}
                     className="w-full bg-dark border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl font-black uppercase tracking-widest text-brand outline-none focus:border-brand transition-all shadow-inner"
                  />
                  {searchCode && (
                     <button type="button" onClick={() => { setSearchCode(''); setFoundBooking(null); }} className="absolute inset-y-0 right-6 flex items-center text-slate-500 hover:text-white">
                        <X size={20} />
                     </button>
                  )}
               </form>

               {foundBooking ? (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                     <div className="flex items-start justify-between mb-8 p-6 bg-dark/40 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-brand text-dark flex items-center justify-center shadow-lg shadow-brand/10">
                              <User size={32} />
                           </div>
                           <div>
                              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">{language === 'bg' ? 'Клиент' : 'Client'}</p>
                              <h2 className="text-2xl font-black uppercase italic text-white leading-none">{foundBooking.customerName}</h2>
                              <p className="text-xs font-bold text-slate-400 mt-1">{foundBooking.customerPhone || 'No Phone'}</p>
                           </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border ${
                           foundBooking.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                           foundBooking.status === 'trainer_completed' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                           'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                           {foundBooking.status.replace('_', ' ')}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-5 bg-dark/20 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-2 mb-2 text-slate-500">
                              <Briefcase size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Coach</span>
                           </div>
                           <p className="text-sm font-black uppercase italic text-white">{getTrainerName(foundBooking.trainerId)}</p>
                        </div>
                        <div className="p-5 bg-dark/20 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-2 mb-2 text-slate-500">
                              <Clock size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Time</span>
                           </div>
                           <p className="text-sm font-black uppercase italic text-white">{foundBooking.time} <span className="opacity-50 text-[10px]">({foundBooking.duration}m)</span></p>
                        </div>
                     </div>

                     <div className="mb-8">
                        <div className="flex items-end justify-between mb-2">
                           <span className="text-slate-400 font-bold uppercase text-xs">Total Due</span>
                           <span className="text-4xl font-black text-white italic tracking-tighter">{foundBooking.price.toFixed(2)} <span className="text-lg text-brand">BGN</span></span>
                        </div>
                        <div className="h-1 w-full bg-dark rounded-full overflow-hidden">
                           <div className="h-full bg-brand w-full opacity-20"></div>
                        </div>
                     </div>

                     {foundBooking.status === 'completed' ? (
                        <div className="w-full py-5 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center gap-3 text-green-500 font-black uppercase tracking-widest text-[11px]">
                           <CheckCircle2 size={18} /> {language === 'bg' ? 'Плащането е прието' : 'Payment Settled'}
                        </div>
                     ) : (
                        <div className="space-y-3">
                           {foundBooking.status === 'pending' && (
                              <button 
                                 onClick={quickConfirm}
                                 disabled={isProcessing}
                                 className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg flex items-center justify-center gap-3"
                              >
                                 <ShieldCheck size={16} /> {language === 'bg' ? 'Потвърди резервация' : 'Confirm Booking Only'}
                              </button>
                           )}
                           
                           <div className="grid grid-cols-2 gap-3">
                              <button 
                                 onClick={() => processPayment('cash')}
                                 disabled={isProcessing}
                                 className="py-5 bg-white text-dark rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all shadow-xl flex items-center justify-center gap-3"
                              >
                                 {isProcessing ? <Loader2 className="animate-spin" /> : <><Banknote size={18} /> {language === 'bg' ? 'В брой' : 'Cash'}</>}
                              </button>
                              <button 
                                 onClick={() => processPayment('card')}
                                 disabled={isProcessing}
                                 className="py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-brand/90 transition-all shadow-xl flex items-center justify-center gap-3"
                              >
                                 {isProcessing ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> {language === 'bg' ? 'Карта' : 'Card'}</>}
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-center py-12 opacity-30">
                     <QrCode size={48} className="mx-auto mb-4" />
                     <p className="text-[11px] font-black uppercase tracking-widest">Ready to scan</p>
                  </div>
               )}
            </div>
         </div>

         {/* TODAY'S LIST */}
         <div className="lg:col-span-5">
            <div className="bg-surface/50 border border-white/5 rounded-[2.5rem] p-8 h-full min-h-[500px]">
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                  <Calendar size={14} /> {language === 'bg' ? 'Днешни сесии' : "Today's Ledger"}
               </h3>
               
               <div className="space-y-3">
                  {todayUnpaid.length === 0 ? (
                     <div className="text-center py-10 text-slate-600 italic">No active sessions for today.</div>
                  ) : (
                     todayUnpaid.map(booking => (
                        <div 
                           key={booking.id}
                           onClick={() => selectFromList(booking)}
                           className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
                              booking.status === 'trainer_completed' 
                                 ? 'bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/50' 
                                 : 'bg-dark/40 border-white/5 hover:border-white/20'
                           }`}
                        >
                           <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-white text-sm uppercase italic">{booking.customerName}</span>
                              <span className="text-[10px] font-mono text-slate-500">{booking.checkInCode}</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                                 <Timer size={12} /> {booking.time}
                              </div>
                              {booking.status === 'trainer_completed' && (
                                 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-yellow-500 animate-pulse">
                                    <AlertCircle size={10} /> Pay Now
                                 </div>
                              )}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Desk;
