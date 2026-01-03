
import React, { useState, useMemo } from 'react';
import { Calendar, Star, LogOut, Dumbbell, Loader2, X, MapPinned, Settings2, Trash2, AlertCircle, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import RoleManagementModal from '../components/RoleManagementModal';

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

  if (!booking) return null;

  const handleAiEnhance = async () => {
    if (!comment.trim()) return;
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
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
            properties: { polishedReview: { type: Type.STRING }, insights: { type: Type.STRING } },
            required: ["polishedReview", "insights"]
          },
          systemInstruction: "Rewrite customer reviews to be more engaging. Return JSON."
        }
      });
      const result = JSON.parse(response.text || '{}');
      if (result.polishedReview) { setComment(result.polishedReview); setIsAiEnhanced(true); }
    } catch (e) { console.error(e); } finally { setIsEnhancing(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md">
       <div className="bg-surface rounded-[2.5rem] border border-white/10 w-full max-w-md p-10 text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white"><X size={20} /></button>
          <div className="w-16 h-16 bg-brand text-dark rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/10"><Star size={28} className="fill-dark" /></div>
          <h2 className="text-2xl font-black uppercase italic text-white mb-2 leading-none">Review Coach</h2>
          <form onSubmit={(e) => { e.preventDefault(); setIsSubmitting(true); onSubmit(booking.id, rating, comment, isAiEnhanced, booking.trainerId).finally(() => setIsSubmitting(false)); }} className="space-y-6 text-left mt-8">
             <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-125"><Star size={32} className={`${s <= rating ? 'text-brand fill-brand' : 'text-slate-700'}`} /></button>)}
             </div>
             <div className="space-y-2 relative">
                <div className="flex items-center justify-between mb-1"><label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Your Feedback</label><button type="button" onClick={handleAiEnhance} disabled={isEnhancing || !comment.trim()} className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand rounded-full text-[8px] font-black uppercase transition-all">{isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI Enhance</button></div>
                <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was it?" className="w-full bg-dark/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-medium italic outline-none focus:border-brand resize-none text-sm" />
             </div>
             <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase text-[10px] hover:bg-white transition-all shadow-xl">{isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Submit for Moderation'}</button>
          </form>
       </div>
    </div>
  );
};

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, currentUser, logout, users, addReview, refreshData, confirmAction, isManagement, isAdmin, updateUser } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const calculateTimeRange = (startTime: string, durationMins: number = 60) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMins;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
  };

  const allTrainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    const dynamicTrainers: Trainer[] = users
      .filter(u => u.roles?.includes('trainer'))
      .map(u => ({ id: u.id, name: u.name.split('(')[0].trim(), specialty: u.name.match(/\((.*)\)/)?.[1] || 'Instructor', price: 20, image: u.image || DEFAULT_PROFILE_IMAGE, phone: u.phone || '', availability: [] }));
    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users]);

  if (!currentUser) return null;

  // Improved filtering: also include bookings where email matches (in case of guest checkout)
  const myBookings = useMemo(() => {
    return bookings.filter(b => b.userId === currentUser.id || b.customerEmail === currentUser.email);
  }, [bookings, currentUser]);

  const handleReviewSubmit = async (id: string, rating: number, text: string, isAi: boolean, trainerId: string) => {
    await addReview({ trainerId, author: currentUser.name.split('(')[0].trim(), rating, text, isAiEnhanced: isAi, bookingId: id });
    await updateBooking(id, { status: 'trainer_completed', hasBeenReviewed: true });
    setBookingToReview(null);
    await refreshData();
  };

  const getTrainerImage = (trainerId: string) => {
    const t = allTrainers.find(tr => tr.id === trainerId);
    return t?.image || DEFAULT_PROFILE_IMAGE;
  };

  const cleanName = (name: string) => name.split('(')[0].trim();

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full p-1 border-2 border-brand/50 bg-dark shrink-0"><img src={currentUser.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover rounded-full" /></div>
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black uppercase italic text-white leading-none mb-2 tracking-tighter">{cleanName(currentUser.name)}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                   <span className="text-brand bg-brand/10 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-brand/20">{(currentUser.roles?.[0] || 'user').toUpperCase()}</span>
                   <button onClick={() => setShowEditModal(true)} className="bg-white/5 hover:bg-brand hover:text-dark text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10 transition-all flex items-center gap-1.5"><Settings2 size={10} /> Identity</button>
                   {isAdmin && (
                      <button onClick={() => navigate('/admin')} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-red-500/20 transition-all flex items-center gap-1.5 shadow-lg">
                        <ShieldCheck size={10} /> Web Console <ChevronRight size={10} />
                      </button>
                   )}
                </div>
            </div>
         </div>
         <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 hover:text-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
           <LogOut size={16} /> {t.logout}
         </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-2 italic">Session Registry</h2>
        {myBookings.length === 0 ? (
            <div className="text-center py-24 bg-surface/50 rounded-[3rem] border border-white/5 border-dashed">
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="mt-6 text-brand font-black uppercase tracking-widest text-[10px]">{t.makeFirst} →</button>
            </div>
        ) : (
            myBookings.map(booking => {
                const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
                return (
                    <div key={booking.id} className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-[3rem] p-8 hover:border-brand/40 transition-all group overflow-hidden">
                        <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl bg-dark border border-white/5"><img src={getTrainerImage(booking.trainerId)} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" /></div>
                                <div><h3 className="font-black uppercase italic text-xl text-white mb-1 tracking-tight leading-none">{trainer?.name || 'Coach'}</h3><p className="text-[9px] text-brand font-black uppercase tracking-widest">{trainer?.specialty || 'Instructor'}</p></div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 lg:py-0 border-y lg:border-y-0 lg:border-x border-white/5 lg:px-8">
                                <div className="flex items-center gap-3"><Calendar className="text-brand" size={16} /><span className="text-[10px] font-black uppercase text-white tracking-widest">{booking.date} • {calculateTimeRange(booking.time, booking.duration)}</span></div>
                                <div className="flex items-center gap-3"><MapPinned className="text-slate-500" size={16} /><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CLASSFIT VARNA</span></div>
                            </div>
                            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-dark/40 rounded-[2rem] border border-white/10 min-w-[160px]">
                                <div className="text-3xl font-black italic text-brand tracking-widest mb-1">{booking.checkInCode}</div>
                                <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                  booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                                  booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                                  'bg-brand/10 text-brand'
                                }`}>{booking.status.replace('_', ' ')}</div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                {(booking.status === 'confirmed') && !booking.hasBeenReviewed && (
                                  <button onClick={() => setBookingToReview(booking)} className="flex items-center gap-2 px-6 py-3 bg-brand text-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"><Star size={14} /> Finish & Review</button>
                                )}
                                {booking.hasBeenReviewed && <span className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase border border-white/5"><Star size={12} className="text-brand fill-brand" /> Verified</span>}
                            </div>
                            <div className="flex gap-2">
                                {(booking.status === 'confirmed' || booking.status === 'pending') && <button onClick={() => confirmAction({ title: 'Cancel', message: 'Cancel session?', onConfirm: () => updateBooking(booking.id, { status: 'cancelled' }) })} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all border border-red-500/10"><X size={14} /> Cancel</button>}
                                {booking.status !== 'confirmed' && booking.status !== 'pending' && <button onClick={() => confirmAction({ title: 'Remove', message: 'Clear from history?', onConfirm: () => deleteBooking(booking.id) })} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase hover:text-red-500 transition-all"><Trash2 size={14} /> Remove</button>}
                            </div>
                        </div>
                    </div>
                )
            })
        )}
      </div>

      <RoleManagementModal user={currentUser} onClose={() => setShowEditModal(false)} onUpdate={async (uid, updates) => await updateUser(uid, updates)} language={language} isManagement={isManagement} />
      {bookingToReview && <ReviewModal booking={bookingToReview} onClose={() => setBookingToReview(null)} onSubmit={handleReviewSubmit} />}
    </div>
  );
};

export default CustomerDashboard;
