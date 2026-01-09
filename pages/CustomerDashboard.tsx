
import React, { useState, useMemo } from 'react';
import { Calendar, Star, LogOut, Loader2, X, Settings2, Trash2, AlertCircle, Sparkles, Languages, Clock, MapPin, CheckCircle2, User, Heart, Search, Briefcase, ShieldCheck, Globe } from 'lucide-react';
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
            properties: { polishedReview: { type: Type.STRING } },
            required: ["polishedReview"]
          },
          systemInstruction: "Rewrite the review to be short and clear. Maintain tone."
        }
      });
      const result = JSON.parse(response.text || '{}');
      if (result.polishedReview) { setComment(result.polishedReview); setIsAiEnhanced(true); }
    } catch (e) { console.error(e); } finally { setIsEnhancing(false); }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-surface rounded-[3rem] border border-white/10 w-full max-w-md p-10 text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20} /></button>
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="fill-brand" />
          </div>
          <h2 className="text-2xl font-black uppercase italic text-white mb-4 leading-tight tracking-tight">
            Review <span className="text-brand">{trainerName}</span>
          </h2>
          <form onSubmit={(e) => { e.preventDefault(); setIsSubmitting(true); onSubmit(booking.id, rating, comment, isAiEnhanced, booking.trainerId).finally(() => setIsSubmitting(false)); }} className="space-y-6 text-left">
             <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-125"><Star size={28} className={`${s <= rating ? 'text-brand fill-brand' : 'text-slate-700'}`} /></button>)}
             </div>
             <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.yourExperience}</label>
                  <button type="button" onClick={handleAiEnhance} disabled={isEnhancing || !comment.trim()} className="flex items-center gap-1.5 px-2 py-0.5 bg-brand/10 text-brand rounded-full text-[9px] font-black uppercase">
                    {isEnhancing ? <Loader2 size={8} className="animate-spin" /> : <Sparkles size={8} />} AI Polish
                  </button>
                </div>
                <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="..." className="w-full bg-dark/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand resize-none" />
             </div>
             <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-xl">
               {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : t.submitFeedback}
             </button>
          </form>
       </div>
    </div>
  );
};

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, currentUser, logout, users, addReview, refreshData, confirmAction, isManagement, isAdmin, isCashier, updateUser } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const allTrainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    const dynamicTrainers: Trainer[] = users
      .filter(u => u.roles?.includes('trainer'))
      .map(u => ({ 
        id: u.id, 
        name: u.name.split('(')[0].trim(), 
        specialty: u.name.match(/\((.*)\)/)?.[1] || t.trainer, 
        price: 20, 
        image: u.image || DEFAULT_PROFILE_IMAGE, 
        phone: u.phone || '', 
        availability: [] 
      }));
    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users, t]);

  if (!currentUser) return null;

  const myBookings = useMemo(() => {
    return bookings.filter(b => b.userId === currentUser.id || b.customerEmail === currentUser.email);
  }, [bookings, currentUser]);

  const handleReviewSubmit = async (id: string, rating: number, text: string, isAi: boolean, trainerId: string) => {
    await addReview({ trainerId, author: currentUser.name.split('(')[0].trim(), rating, text, isAiEnhanced: isAi, bookingId: id });
    await updateBooking(id, { hasBeenReviewed: true });
    setBookingToReview(null);
    await refreshData();
  };

  const hasStaffAccess = isCashier || isAdmin || currentUser.roles?.includes('trainer');

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-surface p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-full p-1 bg-brand/20 shrink-0 overflow-hidden">
                <img src={currentUser.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
                <h1 className="text-3xl font-black uppercase italic text-white mb-2 tracking-tighter">{currentUser.name.split('(')[0].trim()}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                   {currentUser.roles?.map(role => (
                     <span key={role} className="text-brand bg-brand/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand/20">
                       {role.toUpperCase()}
                     </span>
                   ))}
                   <button onClick={() => setShowEditModal(true)} className="bg-white/5 hover:bg-brand hover:text-dark text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 transition-all flex items-center gap-1.5"><Settings2 size={10} /> {t.profileSettings}</button>
                </div>
                
                {/* Spoken Languages Display */}
                {currentUser.languages && currentUser.languages.length > 0 && (
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1.5 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                        <Globe size={10} className="text-brand" /> {language === 'bg' ? 'Езици:' : 'Spoken:'}
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        {currentUser.languages.map(lang => (
                          <span key={lang} className="text-white/60 text-[9px] font-black uppercase italic tracking-tighter bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            {lang}
                          </span>
                        ))}
                     </div>
                  </div>
                )}
            </div>
         </div>
         <button onClick={() => { logout(); navigate('/'); }} className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10 flex items-center gap-2">
           <LogOut size={14} /> {t.logout}
         </button>
      </div>

      {hasStaffAccess && (
        <div className="mb-12">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic mb-4">Staff Portals</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {isCashier && <button onClick={() => navigate('/desk')} className="p-6 bg-brand text-dark rounded-3xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-lg font-black uppercase italic text-sm"><Search size={20}/> Front Desk Terminal</button>}
              {currentUser.roles?.includes('trainer') && <button onClick={() => navigate('/trainer')} className="p-6 bg-surface border border-brand/20 text-brand rounded-3xl flex items-center gap-4 transition-all hover:scale-[1.02] font-black uppercase italic text-sm"><Briefcase size={20}/> Coach Dashboard</button>}
              {isAdmin && <button onClick={() => navigate('/admin')} className="p-6 bg-surface border border-red-500/20 text-red-500 rounded-3xl flex items-center gap-4 transition-all hover:scale-[1.02] font-black uppercase italic text-sm"><ShieldCheck size={20}/> Admin Console</button>}
           </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Workout History</h2>
        {myBookings.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 rounded-[3rem] border-2 border-white/5 border-dashed">
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="mt-6 px-8 py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-white transition-all">{t.makeFirst}</button>
            </div>
        ) : (
            myBookings.map(booking => {
                const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
                // REQUIREMENT: Review button only after status is 'completed' (paid)
                const canReview = booking.status === 'completed' && !booking.hasBeenReviewed;
                
                return (
                    <div key={booking.id} className="bg-surface/50 border border-white/10 rounded-[2.5rem] p-8 hover:border-brand transition-all flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-dark border border-white/5 shrink-0">
                          <img src={trainer?.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                           <p className="text-[10px] font-black uppercase text-brand mb-1 italic">{trainer?.name || 'Coach'}</p>
                           <h3 className="font-black uppercase italic text-lg text-white mb-2 leading-none">{booking.date} @ {booking.time}</h3>
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><MapPin size={10}/> ул. Студентска 1А, Варна</p>
                        </div>
                        <div className="text-center p-4 bg-dark/40 rounded-2xl border border-white/5 min-w-[120px]">
                           <p className="text-[9px] font-black uppercase text-slate-600 mb-1">PIN</p>
                           <p className="text-xl font-black text-white tracking-widest italic">{booking.checkInCode || 'N/A'}</p>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[150px]">
                           {canReview && <button onClick={() => setBookingToReview(booking)} className="w-full px-5 py-3 bg-brand text-dark rounded-xl text-[10px] font-black uppercase hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"><Star size={12} fill="currentColor"/> {t.leaveReview}</button>}
                           {booking.hasBeenReviewed && <span className="w-full px-5 py-3 bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase border border-white/10 italic flex items-center justify-center gap-2"><CheckCircle2 size={12} className="text-brand"/> Feedback Sent</span>}
                           
                           <div className="flex gap-2">
                             <div className={`flex-grow px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center border ${
                               booking.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                               booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                               'bg-white/5 text-slate-500 border-white/10'
                             }`}>
                               {booking.status.replace('_', ' ')}
                             </div>
                             <button onClick={() => confirmAction({ title: t.deleteBooking, message: t.sure, onConfirm: () => deleteBooking(booking.id) })} className="p-3 bg-white/5 hover:text-red-500 rounded-xl transition-all border border-white/10"><Trash2 size={16}/></button>
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
      {bookingToReview && (
        <ReviewModal 
          booking={bookingToReview} 
          trainerName={allTrainers.find(tImg => tImg.id === bookingToReview.trainerId)?.name || 'Coach'}
          onClose={() => setBookingToReview(null)} 
          onSubmit={handleReviewSubmit} 
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
