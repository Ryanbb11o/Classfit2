
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, Timer, XCircle, Trash2, CheckCircle2, User as UserIcon, Mail, CalendarPlus, Phone, MapPin, ChevronRight, LogOut, Dumbbell, Activity, AlertCircle, Briefcase, Loader2, X, MapPinned, CreditCard, Banknote, Timer as ClockIcon, Star, CheckSquare, Sparkles, Lightbulb, Info } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE, getTrainerReviews } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const ReviewModal: React.FC<{ 
  booking: Booking | null; 
  onClose: () => void; 
  onSubmit: (id: string, rating: number, text: string, isAi: boolean, trainerId: string) => Promise<void>;
}> = ({ booking, onClose, onSubmit }) => {
  const { language } = useAppContext();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  if (!booking) return null;

  const handleAiEnhance = async () => {
    if (!comment.trim()) return;
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("AI Error: API_KEY is missing.");
      alert("AI Enhancement requires an API Key. Please check the Vercel environment variables.");
      return;
    }

    setIsEnhancing(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Review to enhance: "${comment}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              polishedReview: {
                type: Type.STRING,
                description: "The straight, enhanced review text ONLY. No intros or conversational filler.",
              },
              insights: {
                type: Type.STRING,
                description: "A brief professional explanation of what was improved or suggestions for the user.",
              }
            },
            required: ["polishedReview", "insights"]
          },
          systemInstruction: "You are a professional review editor for ClassFit Gym. Your goal is to rewrite customer reviews to be more engaging and professional while keeping the original meaning. You MUST return a JSON object with 'polishedReview' and 'insights'. DO NOT talk back to the user in the 'polishedReview' field."
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      if (result.polishedReview) {
        setComment(result.polishedReview);
        setAiInsights(result.insights);
        setIsAiEnhanced(true);
      }
    } catch (error: any) {
      console.error("AI Enhancement failed:", error);
      alert("AI Enhancement currently unavailable.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(booking.id, rating, comment, isAiEnhanced, booking.trainerId);
    } catch (err) {
      console.error("Review Submit Error:", err);
      alert("Failed to save review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
       <div className={`bg-surface rounded-[2.5rem] border border-white/10 w-full shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col md:flex-row transition-all duration-500 ${aiInsights ? 'max-w-4xl' : 'max-w-md'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
          
          <div className="flex-1 p-10 text-center">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors md:hidden"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
               <div className="w-16 h-16 bg-brand text-dark rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand/20">
                  <Star size={28} className="fill-dark" />
               </div>
               <h2 className="text-2xl font-black uppercase italic text-white mb-1 leading-none tracking-tighter">Review Your Coach</h2>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Session: {booking.date}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
               <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star 
                        size={32} 
                        className={`${star <= rating ? 'text-brand fill-brand' : 'text-slate-700'}`} 
                      />
                    </button>
                  ))}
               </div>

               <div className="space-y-2 relative">
                  <div className="flex items-center justify-between mb-1 px-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Your Feedback</label>
                     <button
                        type="button"
                        onClick={handleAiEnhance}
                        disabled={isEnhancing || !comment.trim()}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                          isAiEnhanced 
                            ? 'bg-brand/20 text-brand border border-brand/30' 
                            : 'bg-brand/10 text-brand border border-brand/20 hover:bg-brand hover:text-dark disabled:opacity-50'
                        }`}
                     >
                        {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        {isAiEnhanced ? 'Re-Enhance' : 'AI Enhance'}
                     </button>
                  </div>
                  <textarea 
                    rows={4}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (isAiEnhanced) setIsAiEnhanced(false);
                    }}
                    placeholder="Tell us how it went..."
                    className="w-full bg-dark/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-medium italic outline-none focus:border-brand resize-none placeholder-slate-600 transition-all text-sm"
                  />
                  
                  {/* MODERATION WARNING */}
                  <div className="flex items-start gap-2 px-3 py-3 bg-red-500/10 rounded-xl border border-red-500/20 mt-4">
                     <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight leading-normal italic">
                        {language === 'bg' 
                          ? 'Вашият отзив ще бъде прегледан от администратор преди публикуване.' 
                          : 'Your review will be checked by an administrator before appearing on the public page.'}
                     </p>
                  </div>
               </div>
               
               <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand/10"
               >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit for Moderation'}
               </button>
            </form>
          </div>

          <button 
            onClick={onClose}
            className="hidden md:block absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
             <X size={20} />
          </button>
       </div>
    </div>
  );
};

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, currentUser, logout, users, addReview, refreshData, confirmAction } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

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

  const handleReviewSubmit = async (id: string, rating: number, text: string, isAi: boolean, trainerId: string) => {
    try {
        await addReview({
          trainerId,
          author: currentUser.name.split('(')[0].trim(),
          rating,
          text,
          isAiEnhanced: isAi,
          bookingId: id
        });

        await updateBooking(id, { 
          status: 'trainer_completed',
          hasBeenReviewed: true
        });

        setBookingToReview(null);
        alert(language === 'bg' ? 'Благодарим! Отзивът ви е изпратен за одобрение.' : 'Thank you! Your review has been sent for approval.');
        await refreshData();
    } catch (err) {
        console.error("Review failed:", err);
        alert("Could not submit review.");
    }
  };

  const getTrainerImage = (trainer?: Trainer) => trainer?.image || DEFAULT_PROFILE_IMAGE;

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full p-1 border-2 border-brand/50 bg-dark">
                <img src={currentUser.image || DEFAULT_PROFILE_IMAGE} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black uppercase italic text-white leading-none mb-2 tracking-tighter">{currentUser.name.split('(')[0].trim()}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                   <span className="text-brand bg-brand/10 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-brand/20">
                      {currentUser.role.replace('_', ' ').toUpperCase()}
                   </span>
                </div>
            </div>
         </div>
         <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 hover:text-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
           <LogOut size={16} /> {t.logout}
         </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-2 italic">My Training Schedule</h2>
        {myBookings.length === 0 ? (
            <div className="text-center py-24 bg-surface/50 rounded-[3rem] border border-white/5 border-dashed">
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="mt-6 text-brand font-black uppercase tracking-widest text-[10px]">
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
                    <div key={booking.id} className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-[3rem] p-8 hover:border-brand/40 transition-all group overflow-hidden">
                        <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-dark">
                                    <img src={getTrainerImage(trainer)} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase italic text-xl text-white mb-1 tracking-tight leading-none">{trainer?.name || 'Coach'}</h3>
                                    <p className="text-[9px] text-brand font-black uppercase tracking-widest">{trainer?.specialty}</p>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 lg:py-0 border-y lg:border-y-0 lg:border-x border-white/5 lg:px-8">
                                <div className="space-y-4">
                                   <div className="flex items-center gap-3">
                                      <Calendar className="text-brand" size={16} />
                                      <span className="text-[10px] font-black uppercase text-white tracking-widest">{booking.date} @ {booking.time}</span>
                                   </div>
                                </div>
                                <div className="space-y-4">
                                   <div className="flex items-center gap-3">
                                      <MapPinned className="text-slate-500" size={16} />
                                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CLASSFIT VARNA</span>
                                   </div>
                                </div>
                            </div>

                            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-dark/40 rounded-[2rem] border border-white/10 min-w-[160px]">
                                <div className="text-3xl font-black italic text-brand tracking-widest mb-1">{booking.checkInCode}</div>
                                <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                   booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                                   booking.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 
                                   'bg-brand/10 text-brand'
                                }`}>
                                   {booking.status.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                {isConfirmed && (
                                   <button 
                                      onClick={() => setBookingToReview(booking)}
                                      className="flex items-center gap-2 px-6 py-3 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                                   >
                                      <Star size={14} /> Finish & Review
                                   </button>
                                )}
                                {(isCompleted || isAwaitingPay) && booking.hasBeenReviewed && (
                                   <span className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase border border-white/5">
                                      <Star size={12} className="text-brand fill-brand" /> Feedback Pending Moderation
                                   </span>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                {(isConfirmed || booking.status === 'pending') && (
                                    <button 
                                       onClick={() => handleCancelRequest(booking.id)} 
                                       className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                                    >
                                       <X size={14} /> Cancel
                                    </button>
                                )}
                                {!isConfirmed && !isAwaitingPay && booking.status !== 'pending' && (
                                    <button 
                                       onClick={() => handleDelete(booking.id)} 
                                       className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase hover:text-red-500 transition-all"
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
