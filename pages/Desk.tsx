
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
    </div>
  );
};

export default Desk;
