
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, Timer, XCircle, Trash2, CheckCircle2, User as UserIcon, Mail, CalendarPlus, Phone, MapPin, ChevronRight, LogOut, Dumbbell, Activity, AlertCircle, Briefcase, Loader2, X, MapPinned, CreditCard, Banknote, Timer as ClockIcon, Star, CheckSquare } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';

const ReviewModal: React.FC<{ 
  booking: Booking | null; 
  onClose: () => void; 
  onSubmit: (id: string, rating: number, text: string) => Promise<void>;
}> = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(booking.id, rating, comment);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-surface rounded-[2.5rem] border border-white/10 p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
             <X size={20} />
          </button>

          <div className="mb-8">
             <div className="w-20 h-20 bg-brand text-dark rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/20">
                <Star size={32} className="fill-dark" />
             </div>
             <h2 className="text-3xl font-black uppercase italic text-white mb-2 leading-none tracking-tighter">Review Your Coach</h2>
             <p className="text-slate-400 text-sm font-medium italic">How was your session on <span className="text-white font-bold">{booking.date}</span>?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 text-left">
             <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star 
                      size={36} 
                      className={`${star <= rating ? 'text-brand fill-brand' : 'text-slate-700'}`} 
                    />
                  </button>
                ))}
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Tell us about your experience</label>
                <textarea 
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Excellent trainer, really pushed me to my limits!"
                  className="w-full bg-dark/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-medium italic outline-none focus:border-brand resize-none placeholder-slate-600 transition-all"
                />
             </div>
             
             <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand/10"
             >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm & Send Review'}
             </button>
             <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest">
               Submission marks session as complete
             </p>
          </form>
       </div>
    </div>
  );
};

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, currentUser, logout, users, requestTrainerUpgrade, confirmAction } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSpecialty, setUpgradeSpecialty] = useState('');
  const [upgradePhone, setUpgradePhone] = useState(currentUser?.phone || '');
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);

  const allTrainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    const dynamicTrainers: Trainer[] = users
      .filter(u => u.role === 'trainer')
      .map(u => {
        const match = u.name.match(/^(.*)\s\((.*)\)$/);
        const displayName = match ? match[1] : u.name;
        const displaySpecialty = match ? match[2] : (language === 'bg' ? 'Инструктор' : 'Instructor');
        return {
          id: u.id,
          name: displayName,
          specialty: displaySpecialty,
          price: 20, 
          image: u.image || DEFAULT_PROFILE_IMAGE, 
          phone: u.phone || '',
          availability: []
        };
      });
    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users]);

  if (!currentUser) return null;

  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  const handleCancelRequest = (id: string) => {
    confirmAction({
      title: 'Cancel Training',
      message: 'Are you sure you want to cancel this session?',
      onConfirm: async () => {
        await updateBooking(id, { status: 'cancelled' });
      }
    });
  };

  const handleDelete = (id: string) => {
    confirmAction({
      title: 'Remove from History',
      message: 'This removes the entry from your dashboard.',
      onConfirm: async () => {
        await deleteBooking(id);
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      setIsUpgrading(true);
      try {
          const { success } = await requestTrainerUpgrade(currentUser.id, currentUser.name, upgradePhone, upgradeSpecialty);
          if (success) {
              alert(language === 'bg' ? 'Заявката е изпратена!' : 'Application sent!');
              setShowUpgradeModal(false);
          }
      } finally {
          setIsUpgrading(false);
      }
  };

  const handleReviewSubmit = async (id: string, rating: number, text: string) => {
    // 1. Mark as completed/awaiting payment
    // 2. Save rating and review text
    await updateBooking(id, { 
      status: 'trainer_completed',
      hasBeenReviewed: true, 
      rating: rating, 
      reviewText: text 
    });
    setBookingToReview(null);
    alert(language === 'bg' ? 'Благодарим за отзива! Моля платете на рецепция.' : 'Review saved! Please settle payment at the front desk.');
  };

  const getTrainerImage = (trainer?: Trainer) => trainer?.image || DEFAULT_PROFILE_IMAGE;
  const displayName = currentUser.name.split('(')[0].trim();

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors"></div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full p-1 border-2 border-brand/50 bg-dark">
                <img src={currentUser.image || DEFAULT_PROFILE_IMAGE} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black uppercase italic text-white leading-none mb-2 tracking-tighter">{displayName}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                   <span className="text-brand bg-brand/10 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-brand/20">
                      {currentUser.role.replace('_', ' ').toUpperCase()}
                   </span>
                   <span className="text-slate-400 bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/5">
                      {myBookings.length} SESSIONS
                   </span>
                </div>
            </div>
         </div>
         <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 hover:text-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
           <LogOut size={16} /> {t.logout}
         </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-2 italic">My Schedule</h2>
        {myBookings.length === 0 ? (
            <div className="text-center py-24 bg-surface/50 rounded-[3rem] border border-white/5 border-dashed">
                <div className="w-16 h-16 bg-white/5 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Calendar size={32} />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="mt-6 text-brand font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                  {t.makeFirst} →
                </button>
            </div>
        ) : (
            myBookings.map(booking => {
                const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
                const isConfirmed = booking.status === 'confirmed';
                const isCompleted = booking.status === 'completed';
                const isAwaitingPay = booking.status === 'trainer_completed';
                
                return (
                    <div key={booking.id} className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-[3rem] p-8 md:p-10 hover:border-brand/40 transition-all group relative overflow-hidden">
                        
                        <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                            {/* Trainer Profile */}
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-dark">
                                    <img src={getTrainerImage(trainer)} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase italic text-xl text-white mb-1 tracking-tight leading-none">{trainer?.name || 'Coach'}</h3>
                                    <p className="text-[9px] text-brand font-black uppercase tracking-widest">{trainer?.specialty}</p>
                                </div>
                            </div>

                            {/* Session Details */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 lg:py-0 border-y lg:border-y-0 lg:border-x border-white/5 lg:px-8">
                                <div className="space-y-4">
                                   <div className="flex items-center gap-3">
                                      <Calendar className="text-brand" size={16} />
                                      <span className="text-[10px] font-black uppercase text-white tracking-widest">{booking.date} @ {booking.time}</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <ClockIcon className="text-slate-500" size={16} />
                                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">60 MIN SESSION</span>
                                   </div>
                                </div>
                                <div className="space-y-4">
                                   <div className="flex items-center gap-3">
                                      <MapPinned className="text-slate-500" size={16} />
                                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest truncate max-w-[150px]">BUL. OSMI PRIMORSKI 128</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      {isCompleted ? <CheckSquare size={16} className="text-green-500" /> : <CreditCard size={16} className="text-blue-400" />}
                                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                         {isCompleted ? `PAID (${booking.paymentMethod?.toUpperCase()})` : (isAwaitingPay ? 'PAY AT DESK' : 'RESERVED')}
                                      </span>
                                   </div>
                                </div>
                            </div>

                            {/* Check-in Code Area */}
                            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-dark/40 rounded-[2rem] border border-white/10 min-w-[160px] relative group-hover:border-brand/30 transition-all">
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Check-in Code</div>
                                <div className="text-3xl font-black italic text-brand tracking-widest mb-1 leading-none pt-3">{booking.checkInCode}</div>
                                <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                   booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                                   booking.status === 'pending' ? 'bg-brand/10 text-brand' : 
                                   booking.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 
                                   booking.status === 'trainer_completed' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                   {booking.status.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                {isConfirmed && (
                                   <button 
                                      onClick={() => setBookingToReview(booking)}
                                      className="flex items-center gap-2 px-6 py-3 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-brand/10 group/btn"
                                   >
                                      <CheckCircle2 size={14} className="group-hover/btn:scale-110 transition-transform" /> Mark Done & Review
                                   </button>
                                )}
                                {(isCompleted || isAwaitingPay) && booking.hasBeenReviewed && (
                                   <span className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase border border-white/5">
                                      <Star size={12} className="text-brand fill-brand" /> Feedback Shared
                                   </span>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                {(isConfirmed || booking.status === 'pending') && (
                                    <button 
                                       onClick={() => handleCancelRequest(booking.id)} 
                                       className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                                    >
                                       <X size={14} /> Cancel
                                    </button>
                                )}
                                {!isConfirmed && !isAwaitingPay && booking.status !== 'pending' && (
                                    <button 
                                       onClick={() => handleDelete(booking.id)} 
                                       className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-red-500 transition-all border border-white/5"
                                    >
                                       <Trash2 size={14} /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })
        )}
      </div>

      {bookingToReview && (
         <ReviewModal 
            booking={bookingToReview}
            onClose={() => setBookingToReview(null)}
            onSubmit={handleReviewSubmit}
         />
      )}
    </div>
  );
};

export default CustomerDashboard;
