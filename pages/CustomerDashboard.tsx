
import React, { useState, useMemo } from 'react';
import { Calendar, Star, LogOut, Dumbbell, Loader2, X, MapPinned, Settings2, Trash2, AlertCircle, Sparkles, ShieldCheck, ChevronRight, Languages, MessageSquarePlus, Clock, Phone, MapPin, CheckCircle2, User, Heart, MessageSquareHeart } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import RoleManagementModal from '../components/RoleManagementModal';

const ReviewModal: React.FC<{ 
  booking: Booking | null; 
  trainerName: string;
  onClose: () => void; 
  onSubmit: (id: string, rating: number, text: string, isAi: boolean, trainerId: string) => Promise<void>;
}> = ({ booking, trainerName, onClose, onSubmit }) => {
  const { language } = useAppContext();
  const t = TRANSLATIONS[language];
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
          systemInstruction: "Rewrite the customer review in Bulgarian (or English if written in English) to be clear, honest, and concise. Keep it short (1-2 sentences) and make it sound like it was written by a real person, not an advertisement. Avoid over-the-top energy and excessive exclamation marks. Return JSON."
        }
      });
      const result = JSON.parse(response.text || '{}');
      if (result.polishedReview) { setComment(result.polishedReview); setIsAiEnhanced(true); }
    } catch (e) { console.error(e); } finally { setIsEnhancing(false); }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-surface rounded-[3rem] border border-white/10 w-full max-w-md p-10 text-center relative shadow-[0_0_50px_rgba(197,217,45,0.15)] animate-in zoom-in-95 duration-300">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20} /></button>
          
          <div className="w-20 h-20 bg-brand/10 text-brand rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Heart size={32} className="fill-brand" />
          </div>
          
          <h2 className="text-2xl font-black uppercase italic text-white mb-4 leading-tight tracking-tight px-4">
            {t.reviewModalTitle} <span className="text-brand">{trainerName}</span>
          </h2>
          
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest italic mb-8">{t.reviewModalSubtitle}</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setIsSubmitting(true); onSubmit(booking.id, rating, comment, isAiEnhanced, booking.trainerId).finally(() => setIsSubmitting(false)); }} className="space-y-6 text-left">
             <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-125"><Star size={36} className={`${s <= rating ? 'text-brand fill-brand' : 'text-slate-700'}`} /></button>)}
             </div>
             
             <div className="space-y-2 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.yourExperience}</label>
                  <button type="button" onClick={handleAiEnhance} disabled={isEnhancing || !comment.trim()} className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] font-black uppercase transition-all hover:bg-brand hover:text-dark">
                    {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} {t.polishWithAi}
                  </button>
                </div>
                <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="..." className="w-full bg-dark/50 border border-white/5 rounded-2xl px-6 py-5 text-white font-medium italic outline-none focus:border-brand resize-none text-sm shadow-inner" />
             </div>
             
             <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-white transition-all shadow-2xl shadow-brand/20 active:scale-[0.98]">
               {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : t.submitFeedback}
             </button>
          </form>
       </div>
    </div>
  );
};

const SessionDetailModal: React.FC<{ 
    booking: Booking; 
    onClose: () => void; 
    onReview: () => void;
    trainer: Trainer | undefined;
    language: 'bg' | 'en';
}> = ({ booking, onClose, onReview, trainer, language }) => {
    const t = TRANSLATIONS[language];
    const isFinished = booking.status === 'trainer_completed' || booking.status === 'completed';
    const canReview = (booking.status === 'confirmed' || isFinished) && !booking.hasBeenReviewed;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-surface border border-white/10 rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand"></div>
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full z-10 transition-colors"><X size={20} /></button>

                <div className="p-10">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl bg-dark border border-white/10">
                            <img src={trainer?.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover" alt="Trainer" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase text-brand tracking-widest mb-1 italic">{t.transform}</p>
                            <h2 className="text-3xl font-black uppercase italic text-white leading-none tracking-tighter">{trainer?.name || 'Coach'}</h2>
                            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-2 italic">{trainer?.specialty || t.trainer}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-dark/40 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black uppercase text-slate-600 mb-2">PIN</p>
                                <p className="text-2xl font-black text-brand tracking-widest italic leading-none">{booking.checkInCode}</p>
                            </div>
                            <div className="p-6 bg-dark/40 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black uppercase text-slate-600 mb-2">{t.status}</p>
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                  booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                                  booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                                  'bg-brand/10 text-brand'
                                }`}>{t[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}` as keyof typeof t] || booking.status}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-4 text-slate-300">
                                <Calendar size={18} className="text-brand" />
                                <span className="text-[12px] font-black uppercase tracking-widest italic">{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <Clock size={18} className="text-brand" />
                                <span className="text-[12px] font-black uppercase tracking-widest italic">{booking.time} (60 min)</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <MapPin size={18} className="text-slate-500" />
                                <span className="text-[12px] font-black uppercase tracking-widest italic">Classfit, Varna</span>
                            </div>
                        </div>

                        <div className="pt-10">
                            {canReview ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onReview(); }}
                                    className="w-full py-6 bg-brand text-dark rounded-2xl font-black uppercase tracking-[0.2em] text-[13px] flex items-center justify-center gap-3 shadow-2xl shadow-brand/20 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all group"
                                >
                                    <Star size={18} className="fill-dark group-hover:scale-110 transition-transform" /> 
                                    {t.leaveReview}
                                </button>
                            ) : booking.hasBeenReviewed ? (
                                <div className="w-full py-5 bg-white/5 border border-white/10 text-slate-500 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase italic">
                                    <CheckCircle2 size={16} className="text-brand" /> {t.feedbackProvided}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, currentUser, logout, users, addReview, refreshData, confirmAction, isManagement, isAdmin, updateUser } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const allTrainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    const dynamicTrainers: Trainer[] = users
      .filter(u => u.roles?.includes('trainer'))
      .map(u => ({ id: u.id, name: u.name.split('(')[0].trim(), specialty: u.name.match(/\((.*)\)/)?.[1] || t.trainer, price: 20, image: u.image || DEFAULT_PROFILE_IMAGE, phone: u.phone || '', availability: [] }));
    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users, t]);

  if (!currentUser) return null;

  const myBookings = useMemo(() => {
    return bookings.filter(b => b.userId === currentUser.id || b.customerEmail === currentUser.email);
  }, [bookings, currentUser]);

  const handleReviewSubmit = async (id: string, rating: number, text: string, isAi: boolean, trainerId: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    // 1. Submit review
    await addReview({ 
      trainerId, 
      author: currentUser.name.split('(')[0].trim(), 
      rating, 
      text, 
      isAiEnhanced: isAi, 
      bookingId: id 
    });

    // 2. Update status and toggle reviewed flag
    const newStatus = booking.status === 'confirmed' ? 'trainer_completed' : booking.status;
    await updateBooking(id, { 
      status: newStatus as any, 
      hasBeenReviewed: true 
    });

    setBookingToReview(null);
    setViewingBooking(null);
    await refreshData();
  };

  const getTrainerImage = (trainerId: string) => {
    const tImg = allTrainers.find(tr => tr.id === trainerId);
    return tImg?.image || DEFAULT_PROFILE_IMAGE;
  };

  const cleanName = (name: string) => name.split('(')[0].trim();

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-surface p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-28 h-28 rounded-full p-1.5 border-4 border-brand/20 bg-dark shrink-0 overflow-hidden">
                <img src={currentUser.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-black uppercase italic text-white leading-none mb-3 tracking-tighter">{cleanName(currentUser.name)}</h1>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                   <span className="text-brand bg-brand/10 text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-brand/20 shadow-sm shadow-brand/5">{(currentUser.roles?.[0] || 'user').toUpperCase()}</span>
                   
                   {currentUser.languages && currentUser.languages.length > 0 && (
                     <div className="flex items-center gap-1.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
                       <Languages size={12} /> {currentUser.languages.join(' • ')}
                     </div>
                   )}
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                   <button onClick={() => setShowEditModal(true)} className="bg-white/5 hover:bg-brand hover:text-dark text-white text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/10 transition-all flex items-center gap-1.5"><Settings2 size={12} /> {t.profileSettings}</button>
                   {isAdmin && (
                      <button onClick={() => navigate('/admin')} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-red-500/20 transition-all flex items-center gap-1.5 shadow-lg">
                        <ShieldCheck size={12} /> Console <ChevronRight size={12} />
                      </button>
                   )}
                </div>
            </div>
         </div>
         <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-red-500 hover:text-white text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/5">
           <LogOut size={16} /> {t.logout}
         </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">{t.myWorkouts}</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 uppercase tracking-widest"><AlertCircle size={10}/> {t.interactionRequired}</div>
        </div>
        
        {myBookings.length === 0 ? (
            <div className="text-center py-24 bg-surface/50 rounded-[4rem] border-2 border-white/5 border-dashed">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-700"><Calendar size={32}/></div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-[11px]">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="mt-8 px-10 py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-brand/10 hover:bg-white transition-all">{t.makeFirst} →</button>
            </div>
        ) : (
            myBookings.map(booking => {
                const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
                const isFinished = booking.status === 'trainer_completed' || booking.status === 'completed';
                const canReview = (booking.status === 'confirmed' || isFinished) && !booking.hasBeenReviewed;

                return (
                    <div 
                        key={booking.id} 
                        onClick={() => setViewingBooking(booking)}
                        className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-[3.5rem] p-10 hover:border-brand transition-all group overflow-hidden cursor-pointer active:scale-[0.98] shadow-xl hover:shadow-2xl relative"
                    >
                        <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
                            <div className="flex items-center gap-8 shrink-0">
                                <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-2xl bg-dark border border-white/10">
                                  <img src={getTrainerImage(booking.trainerId)} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1 italic">{t.trainer}</p>
                                  <h3 className="font-black uppercase italic text-2xl text-white mb-1 tracking-tighter leading-none">{trainer?.name || 'Coach'}</h3>
                                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">{trainer?.specialty || t.trainer}</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 lg:py-0 border-y lg:border-y-0 lg:border-x border-white/10 lg:px-10">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4"><Calendar className="text-brand" size={18} /><span className="text-[12px] font-black uppercase text-white tracking-widest italic">{booking.date}</span></div>
                                  <div className="flex items-center gap-4"><Clock className="text-brand" size={18} /><span className="text-[12px] font-black uppercase text-white tracking-widest italic">{booking.time} • 60M</span></div>
                                </div>
                                <div className="flex items-center gap-4"><MapPinned className="text-slate-500" size={20} /><span className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-relaxed italic">{t.address.toUpperCase()}</span></div>
                            </div>
                            
                            <div className="shrink-0 flex flex-col items-center justify-center p-8 bg-dark/40 rounded-[2.5rem] border border-white/10 min-w-[180px] shadow-inner">
                                <div className="text-[10px] font-black uppercase text-slate-600 mb-3 tracking-[0.2em]">PIN CODE</div>
                                <div className="text-4xl font-black italic text-brand tracking-widest leading-none mb-4">{booking.checkInCode}</div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                  booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                  booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                  'bg-brand/10 text-brand border-brand/20'
                                }`}>{t[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}` as keyof typeof t] || booking.status}</div>
                            </div>
                        </div>
                        
                        <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                            <div className="flex gap-4">
                                {canReview && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setBookingToReview(booking); }} 
                                    className="flex items-center gap-3 px-8 py-4 bg-brand text-dark rounded-2xl text-[12px] font-black uppercase tracking-[0.1em] hover:bg-white transition-all shadow-xl hover:scale-[1.05] active:scale-95 group relative overflow-hidden"
                                  >
                                    <span className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none"></span>
                                    <Star size={16} className="fill-dark group-hover:scale-125 transition-transform relative z-10" /> 
                                    <span className="relative z-10">{t.leaveReview}</span>
                                  </button>
                                )}
                                {booking.hasBeenReviewed && <span className="flex items-center gap-3 px-6 py-4 bg-white/5 text-slate-500 rounded-2xl text-[11px] font-black uppercase border border-white/5 italic"><CheckCircle2 size={16} className="text-brand" /> {t.feedbackProvided}</span>}
                            </div>
                            <div className="flex gap-3">
                                {(booking.status === 'confirmed' || booking.status === 'pending') && <button onClick={(e) => { e.stopPropagation(); confirmAction({ title: t.cancel, message: t.sure, onConfirm: () => updateBooking(booking.id, { status: 'cancelled' }) }); }} className="flex items-center gap-2 px-6 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[11px] font-black uppercase hover:bg-red-500 hover:text-white transition-all border border-red-500/10"><X size={16} /> {t.cancel}</button>}
                                {booking.status !== 'confirmed' && booking.status !== 'pending' && <button onClick={(e) => { e.stopPropagation(); confirmAction({ title: t.deleteBooking, message: t.sure, onConfirm: () => deleteBooking(booking.id) }); }} className="flex items-center gap-2 px-6 py-4 bg-white/5 text-slate-500 rounded-2xl text-[11px] font-black uppercase hover:text-red-500 transition-all"><Trash2 size={16} /> {t.deleteUser}</button>}
                            </div>
                        </div>
                    </div>
                )
            })
        )}
      </div>

      {showEditModal && (
        <RoleManagementModal 
          user={currentUser} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={async (uid, updates) => await updateUser(uid, updates)} 
          language={language} 
          isManagement={isManagement} 
          isSelf={true}
        />
      )}

      {viewingBooking && (
          <SessionDetailModal 
            booking={viewingBooking} 
            onClose={() => setViewingBooking(null)} 
            onReview={() => setBookingToReview(viewingBooking)}
            trainer={allTrainers.find(tImg => tImg.id === viewingBooking.trainerId)}
            language={language}
          />
      )}

      {bookingToReview && (
        <ReviewModal 
          booking={bookingToReview} 
          trainerName={allTrainers.find(tImg => tImg.id === bookingToReview.trainerId)?.name || 'your coach'}
          onClose={() => setBookingToReview(null)} 
          onSubmit={handleReviewSubmit} 
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
