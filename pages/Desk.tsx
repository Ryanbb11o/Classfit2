
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, User, Briefcase, Calendar, Clock, Banknote, CreditCard, CheckCircle2, ShieldCheck, Phone, X, Loader2, DollarSign, Wallet, Mail, MapPin, Languages, ChevronRight, AlertCircle, Timer, CalendarDays } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Booking } from '../types';

const Desk: React.FC = () => {
  const { language, bookings, isCashier, users, updateBooking, confirmAction, refreshData } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const [searchCode, setSearchCode] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'today' | 'upcoming'>('today');

  useEffect(() => {
    if (!isCashier) navigate('/');
    refreshData();
  }, [isCashier]);

  const todayStr = new Date().toISOString().split('T')[0];
  
  const filteredSessions = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    if (viewMode === 'today') {
      return sorted.filter(b => b.date === todayStr && b.status !== 'completed' && b.status !== 'cancelled');
    }
    return sorted.filter(b => b.date > todayStr && b.status !== 'completed' && b.status !== 'cancelled');
  }, [bookings, todayStr, viewMode]);

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

  const getTrainerName = (id: string) => users.find(u => String(u.id) === String(id))?.name.split('(')[0].trim() || 'Coach';

  if (!isCashier) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-left">
      <div className="mb-16 text-center">
         <div className="inline-flex items-center gap-3 bg-brand/10 text-brand px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-6 border border-brand/20 italic">
            <QrCode size={14} /> Front Desk Terminal
         </div>
         <h1 className="text-4xl md:text-5xl font-black uppercase italic mb-4 tracking-tighter text-white">Entry <span className="text-brand">Protocol</span></h1>
         <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] italic">Verify Code • Process Transaction • Grant Access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* LEFT: INTERACTION PANEL */}
         <div className="lg:col-span-7 space-y-8">
            <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck size={120} />
               </div>
               
               <form onSubmit={handleSearch} className="relative mb-8 z-10">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                     <Search className="text-brand" size={20} />
                  </div>
                  <input 
                     type="text" 
                     autoFocus
                     value={searchCode}
                     onChange={(e) => setSearchCode(e.target.value)}
                     placeholder={language === 'bg' ? "ВЪВЕДЕТЕ КОД..." : "ENTER ENTRY PIN..."}
                     className="w-full bg-dark/50 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-2xl font-black uppercase tracking-[0.3em] text-brand outline-none focus:border-brand transition-all shadow-inner italic"
                  />
                  {searchCode && (
                     <button type="button" onClick={() => { setSearchCode(''); setFoundBooking(null); }} className="absolute inset-y-0 right-6 flex items-center text-slate-500 hover:text-white">
                        <X size={20} />
                     </button>
                  )}
               </form>

               {foundBooking ? (
                  <div className="animate-in slide-in-from-bottom-4 duration-300 relative z-10">
                     <div className="flex items-center gap-6 mb-8 p-6 bg-dark/40 rounded-3xl border border-white/5">
                        <div className="w-20 h-20 rounded-2xl bg-brand text-dark flex items-center justify-center shadow-xl">
                           <User size={36} />
                        </div>
                        <div className="flex-grow">
                           <div className="flex justify-between items-start">
                              <div>
                                 <p className="text-[10px] font-black uppercase text-brand italic tracking-widest mb-1">Active Subject</p>
                                 <h2 className="text-2xl font-black uppercase italic text-white leading-none tracking-tighter">{foundBooking.customerName}</h2>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                 foundBooking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              }`}>
                                 {foundBooking.status.replace('_', ' ')}
                              </span>
                           </div>
                           <div className="flex gap-4 mt-4">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><Phone size={12} className="text-brand"/> {foundBooking.customerPhone || 'N/A'}</div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><Clock size={12} className="text-brand"/> {foundBooking.date} @ {foundBooking.time}</div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-dark/20 p-8 rounded-3xl border border-white/5 mb-8">
                        <div className="flex justify-between items-end mb-4">
                           <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest italic">Service Balance</p>
                           <p className="text-4xl font-black text-white italic tracking-tighter">{foundBooking.price.toFixed(2)} <span className="text-lg text-brand uppercase not-italic">BGN</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                           <button 
                              onClick={() => processPayment('cash')}
                              disabled={isProcessing}
                              className="py-5 bg-white text-dark rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-brand transition-all flex items-center justify-center gap-3 shadow-xl italic"
                           >
                              <Banknote size={18} /> {language === 'bg' ? 'В брой' : 'CASH'}
                           </button>
                           <button 
                              onClick={() => processPayment('card')}
                              disabled={isProcessing}
                              className="py-5 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all flex items-center justify-center gap-3 shadow-xl italic"
                           >
                              <CreditCard size={18} /> {language === 'bg' ? 'Карта' : 'CARD'}
                           </button>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="py-20 text-center opacity-10">
                     <QrCode size={100} className="mx-auto mb-6" />
                     <p className="text-xl font-black uppercase italic tracking-[0.5em]">Scanning System Ready</p>
                  </div>
               )}
            </div>
         </div>

         {/* RIGHT: LEDGER VIEW */}
         <div className="lg:col-span-5">
            <div className="bg-surface/50 rounded-[2.5rem] border border-white/5 p-8 flex flex-col h-full shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3 italic">
                     <CalendarDays size={16} className="text-brand" /> Operational Ledger
                  </h3>
                  <div className="flex bg-dark/40 p-1 rounded-xl border border-white/10">
                     <button 
                        onClick={() => setViewMode('today')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${viewMode === 'today' ? 'bg-brand text-dark' : 'text-slate-500 hover:text-white'}`}
                     >
                        Today
                     </button>
                     <button 
                        onClick={() => setViewMode('upcoming')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${viewMode === 'upcoming' ? 'bg-brand text-dark' : 'text-slate-500 hover:text-white'}`}
                     >
                        Future
                     </button>
                  </div>
               </div>

               <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {filteredSessions.length === 0 ? (
                     <div className="py-20 text-center bg-dark/20 rounded-2xl border border-dashed border-white/5">
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest italic">No active targets found.</p>
                     </div>
                  ) : filteredSessions.map(b => (
                     <div 
                        key={b.id}
                        onClick={() => selectFromList(b)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] flex items-center justify-between gap-4 ${
                           foundBooking?.id === b.id ? 'bg-brand/10 border-brand' : 'bg-dark/40 border-white/5 hover:border-brand/30'
                        }`}
                     >
                        <div className="flex-grow">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-black uppercase italic text-white tracking-tight group-hover:text-brand transition-colors">{b.customerName}</span>
                              <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{b.checkInCode}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Clock size={10} className="text-brand"/> {b.time}</span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Calendar size={10} className="text-brand"/> {b.date.split('-').slice(1).join('/')}</span>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-700 group-hover:text-brand transition-all" />
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Desk;
