
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         {/* Left: Search & Detail */}
         <div className="lg:col-span-8 space-y-8">
            <div className="bg-surface p-8 rounded-[3rem] border border-white/5 shadow-2xl">
               <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand transition-colors">
                     <Search size={20} />
                  </div>
                  <input 
                     value={searchCode}
                     onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                     placeholder="CLIENT PASS CODE (6 DIGITS)"
                     className="w-full bg-dark/50 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-xl font-black tracking-widest text-white outline-none focus:border-brand transition-all shadow-inner uppercase"
                     maxLength={6}
                  />
                  <button type="submit" className="absolute right-3 top-3 bottom-3 px-8 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all">
                     {language === 'bg' ? 'Търси' : 'Find'}
                  </button>
               </form>
            </div>

            {foundBooking ? (
               <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-surface border border-brand/20 rounded-[3rem] p-5 shadow-2xl overflow-hidden relative">
                     <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
                     
                     <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-10">
                           <div className="w-20 h-20 rounded-[2rem] bg-dark border border-brand/20 flex items-center justify-center shrink-0 shadow-lg">
                              <User size={32} className="text-brand" />
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                 <h3 className="text-3xl font-black uppercase italic text-white tracking-tight leading-none">{foundBooking.customerName}</h3>
                                 <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                    foundBooking.status === 'trainer_completed' ? 'bg-yellow-500/10 text-yellow-500' : 
                                    foundBooking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-slate-500'
                                 }`}>
                                    {foundBooking.status.replace('_', ' ')}
                                 </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-[11px] font-black uppercase text-slate-500 tracking-widest italic">
                                 <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand"/> {foundBooking.date}</span>
                                 <span className="flex items-center gap-1.5"><Clock size={12} className="text-brand"/> {foundBooking.time}</span>
                                 <span className="flex items-center gap-1.5"><Timer size={12} className="text-brand"/> {foundBooking.duration} MINS</span>
                              </div>
                           </div>
                           <div className="bg-dark/40 px-8 py-5 rounded-[2rem] border border-white/5 text-center shadow-inner shrink-0">
                              <p className="text-[10px] font-black uppercase text-slate-600 mb-1">Pass Code</p>
                              <p className="text-3xl font-black text-brand italic tracking-widest leading-none">{foundBooking.checkInCode}</p>
                           </div>
                        </div>

                        {/* Extended Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                           <div className="space-y-4">
                              <div className="p-5 bg-dark/20 rounded-2xl border border-white/5 flex items-center gap-4">
                                 <Mail size={16} className="text-slate-500" />
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-slate-600 mb-0.5">Contact Email</p>
                                    <p className="text-xs font-bold text-white truncate max-w-[200px]">{foundBooking.customerEmail || 'Not provided'}</p>
                                 </div>
                              </div>
                              <div className="p-5 bg-dark/20 rounded-2xl border border-white/5 flex items-center gap-4">
                                 <Phone size={16} className="text-slate-500" />
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-slate-600 mb-0.5">Contact Phone</p>
                                    <p className="text-xs font-bold text-white">{foundBooking.customerPhone || 'Not provided'}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="p-5 bg-dark/20 rounded-2xl border border-white/5 flex items-center gap-4">
                                 <MapPin size={16} className="text-slate-500" />
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-slate-600 mb-0.5">Gym Branch</p>
                                    <p className="text-xs font-bold text-white truncate max-w-[200px]">{foundBooking.gymAddress || 'ClassFit Varna'}</p>
                                 </div>
                              </div>
                              <div className="p-5 bg-dark/20 rounded-2xl border border-white/5 flex items-center gap-4">
                                 <Languages size={16} className="text-slate-500" />
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-slate-600 mb-0.5">App Language</p>
                                    <p className="text-xs font-bold text-white uppercase italic">{foundBooking.language || 'BG'}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                           <div className="p-6 bg-dark/40 rounded-2xl border border-white/5 flex items-center gap-6">
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0"><Briefcase size={20} className="text-slate-400" /></div>
                              <div>
                                 <p className="text-[11px] font-black uppercase text-slate-500 mb-1 tracking-widest italic">Coach Assigned</p>
                                 <p className="text-xl font-black text-white uppercase italic leading-none">{getTrainerName(foundBooking.trainerId)}</p>
                              </div>
                           </div>
                           <div className="p-6 bg-brand/10 rounded-2xl border border-brand/20 text-right">
                              <p className="text-[11px] font-black uppercase text-brand mb-1 tracking-widest italic">Amount Due</p>
                              <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{foundBooking.price.toFixed(2)} <span className="text-lg text-brand font-bold not-italic ml-1">BGN</span></p>
                           </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                           {foundBooking.status === 'completed' ? (
                              <div className="flex items-center justify-center gap-3 py-6 bg-green-500/10 border border-green-500/20 text-green-500 rounded-3xl text-xs font-black uppercase tracking-widest italic shadow-inner">
                                 <CheckCircle2 size={20} /> Transaction Finalized • {foundBooking.paymentMethod?.toUpperCase()}
                              </div>
                           ) : foundBooking.status === 'pending' ? (
                              <div className="flex flex-col gap-4">
                                 <div className="flex items-center gap-3 justify-center mb-2">
                                    <AlertCircle size={16} className="text-yellow-500" />
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">This session is awaiting coach approval.</p>
                                 </div>
                                 <button 
                                    disabled={isProcessing}
                                    onClick={quickConfirm}
                                    className="w-full py-6 bg-white text-dark rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-brand transition-all flex items-center justify-center gap-3 shadow-xl"
                                 >
                                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><ShieldCheck size={18} /> Force Confirmation (Front Desk)</>}
                                 </button>
                              </div>
                           ) : (
                              <div className="grid grid-cols-2 gap-4">
                                 <button 
                                    onClick={() => processPayment('cash')}
                                    className="p-10 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4 hover:bg-brand/5 hover:border-brand/40 transition-all group"
                                 >
                                    <Banknote size={40} className="text-slate-600 group-hover:text-brand group-hover:scale-110 transition-transform" />
                                    <span className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">Cash Settlement</span>
                                 </button>
                                 <button 
                                    onClick={() => processPayment('card')}
                                    className="p-10 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4 hover:bg-brand/5 hover:border-brand/40 transition-all group"
                                 >
                                    <CreditCard size={40} className="text-slate-600 group-hover:text-brand group-hover:scale-110 transition-transform" />
                                    <span className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">Card Terminal</span>
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                  
                  <button onClick={() => { setFoundBooking(null); setSearchCode(''); }} className="mt-8 flex items-center gap-2 mx-auto text-slate-500 hover:text-white font-black uppercase text-[11px] tracking-widest transition-all">
                     <X size={14} /> Clear Selection
                  </button>
               </div>
            ) : (
               <div className="text-center py-32 bg-dark/20 rounded-[4rem] border-2 border-dashed border-white/5">
                  <div className="w-24 h-24 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                     <Search size={40} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] italic text-slate-600">Enter a code or select from the live list</p>
               </div>
            )}
         </div>

         {/* Right: Live List */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface rounded-[3rem] border border-white/5 p-8">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Today's Pulse</h3>
                  <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
               </div>
               
               <div className="space-y-4">
                  {todayUnpaid.length === 0 ? (
                     <div className="p-10 text-center bg-dark/20 rounded-2xl italic text-slate-600 text-xs">No active sessions found for today.</div>
                  ) : (
                     todayUnpaid.map(b => (
                        <div 
                           key={b.id} 
                           onClick={() => selectFromList(b)}
                           className={`p-4 rounded-2xl flex items-center justify-between transition-all group cursor-pointer border ${
                              foundBooking?.id === b.id ? 'bg-brand text-dark border-brand shadow-lg' : 'bg-dark/40 border-white/5 hover:border-white/20'
                           }`}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                 foundBooking?.id === b.id ? 'bg-dark/20 text-dark' : 'bg-white/5 text-slate-500'
                              }`}>
                                 <Clock size={16} />
                              </div>
                              <div>
                                 <p className={`text-sm font-black uppercase italic leading-none mb-1.5 ${
                                    foundBooking?.id === b.id ? 'text-dark' : 'text-white'
                                 }`}>{b.customerName}</p>
                                 <p className={`text-[10px] font-black uppercase tracking-widest ${
                                    foundBooking?.id === b.id ? 'text-dark/60' : 'text-slate-600'
                                 }`}>{b.time} • {getTrainerName(b.trainerId)}</p>
                              </div>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className={`text-[10px] font-black uppercase mb-1 ${
                                 foundBooking?.id === b.id ? 'text-dark' : 'text-brand'
                              }`}>{b.price.toFixed(2)} BGN</span>
                              <ChevronRight size={14} className={foundBooking?.id === b.id ? 'text-dark' : 'text-slate-700'} />
                           </div>
                        </div>
                     ))
                  )}
               </div>

               <div className="mt-12 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase italic text-slate-500 mb-6">
                     <span>Today's Ledger</span>
                     <span className="text-white">Active</span>
                  </div>
                  <div className="p-5 bg-dark/40 rounded-2xl border border-white/5">
                     <p className="text-[10px] font-black uppercase text-slate-600 mb-2">Total Collections (Paid)</p>
                     <p className="text-2xl font-black text-brand italic tracking-tighter">
                        {bookings.filter(b => b.status === 'completed' && b.date === today).reduce((sum, b) => sum + b.price, 0).toFixed(2)} BGN
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Desk;
