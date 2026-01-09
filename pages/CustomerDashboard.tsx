
import React, { useState, useMemo } from 'react';
import { Calendar, Star, LogOut, Loader2, X, Settings2, Trash2, AlertCircle, Sparkles, Languages, Clock, MapPin, CheckCircle2, User, Heart, Search, Briefcase, ShieldCheck, Globe, Navigation, Phone, ExternalLink, ArrowRight } from 'lucide-react';
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
       <div className="bg-[#1a2332] rounded-[4rem] border border-white/10 w-full max-w-md p-12 text-center relative shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 italic">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
          <button onClick={onClose} className="absolute top-10 right-10 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20} /></button>
          
          <div className="w-20 h-20 bg-brand/10 text-brand rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Heart size={40} className="fill-brand" />
          </div>
          
          <h2 className="text-3xl font-black uppercase italic text-white mb-4 tracking-tighter leading-none">
            REview <span className="text-brand">{trainerName}</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 italic">How was your transformation session?</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setIsSubmitting(true); onSubmit(booking.id, rating, comment, isAiEnhanced, booking.trainerId).finally(() => setIsSubmitting(false)); }} className="space-y-6 text-left">
             <div className="flex justify-center gap-3 mb-8">
                {[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setRating(s)} className="p-1 transition-all hover:scale-150"><Star size={32} className={`${s <= rating ? 'text-brand fill-brand drop-shadow-[0_0_10px_rgba(197,217,45,0.5)]' : 'text-slate-800'}`} /></button>)}
             </div>
             
             <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">YOUR FEEDBACK</label>
                  <button type="button" onClick={handleAiEnhance} disabled={isEnhancing || !comment.trim()} className="flex items-center gap-1.5 px-3 py-1 bg-brand text-dark rounded-full text-[9px] font-black uppercase italic hover:bg-white transition-all shadow-lg">
                    {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI POLISH
                  </button>
                </div>
                <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Type your experience here..." className="w-full bg-dark/50 border border-white/5 focus:border-brand rounded-[2rem] px-6 py-5 text-white text-sm outline-none resize-none transition-all italic font-medium" />
             </div>
             
             <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white transition-all shadow-2xl shadow-brand/10">
               {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'COMMIT REVIEW'}
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
  }, [language, users]);

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
    <div className="max-w-6xl mx-auto px-6 py-24 animate-in fade-in duration-500 text-left selection:bg-brand selection:text-dark">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16 bg-surface p-12 rounded-[4rem] border border-white/5 shadow-[0_0_60px_rgba(0,0,0,0.3)] relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand/10 transition-all duration-700"></div>
         <div className="flex items-center gap-10 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-brand to-transparent shrink-0 overflow-hidden shadow-2xl">
                  <img src={currentUser.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand text-dark rounded-full flex items-center justify-center border-4 border-surface shadow-xl">
                 <ShieldCheck size={20} />
              </div>
            </div>
            <div>
                <h1 className="text-4xl sm:text-5xl font-black uppercase italic text-white mb-3 tracking-tighter leading-none">{currentUser.name.split('(')[0].trim()}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                   {currentUser.roles?.map(role => (
                     <span key={role} className="text-brand bg-brand/10 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-brand/20 shadow-sm">
                       {role.toUpperCase()}
                     </span>
                   ))}
                   <button onClick={() => setShowEditModal(true)} className="bg-white/5 hover:bg-white hover:text-dark text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 transition-all flex items-center gap-2 group/btn">
                     <Settings2 size={12} className="group-hover/btn:rotate-90 transition-transform" /> {t.profileSettings}
                   </button>
                </div>
                
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2.5 text-slate-500 font-black uppercase tracking-widest text-[9px] italic">
                      <Globe size={12} className="text-brand" /> {language === 'bg' ? 'Езици:' : 'Communication:'}
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {currentUser.languages?.map(lang => (
                        <span key={lang} className="text-white/60 text-[9px] font-black uppercase italic tracking-tighter bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                          {lang}
                        </span>
                      ))}
                   </div>
                </div>
            </div>
         </div>
         <button onClick={() => { logout(); navigate('/'); }} className="px-8 py-4 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-red-500/10 flex items-center gap-3 shadow-lg">
           <LogOut size={16} /> {t.logout}
         </button>
      </div>

      {hasStaffAccess && (
        <div className="mb-20">
           <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 italic mb-6">SYSTEM PORTALS</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {isCashier && <button onClick={() => navigate('/desk')} className="group p-8 bg-brand text-dark rounded-[2.5rem] flex items-center justify-between transition-all hover:scale-[1.03] shadow-[0_20px_40px_rgba(197,217,45,0.15)] font-black uppercase italic text-sm">
                <div className="flex items-center gap-4"><Search size={22}/> FRONT DESK</div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>}
              {currentUser.roles?.includes('trainer') && <button onClick={() => navigate('/trainer')} className="group p-8 bg-surface border border-brand/20 text-brand rounded-[2.5rem] flex items-center justify-between transition-all hover:scale-[1.03] font-black uppercase italic text-sm">
                <div className="flex items-center gap-4"><Briefcase size={22}/> COACH TERMINAL</div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>}
              {isAdmin && <button onClick={() => navigate('/admin')} className="group p-8 bg-surface border border-red-500/20 text-red-500 rounded-[2.5rem] flex items-center justify-between transition-all hover:scale-[1.03] font-black uppercase italic text-sm">
                <div className="flex items-center gap-4"><ShieldCheck size={22}/> ADMIN CONSOLE</div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>}
           </div>
        </div>
      )}

      <div className="space-y-8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 italic">TRANSFORMATION JOURNEY</h2>
        {myBookings.length === 0 ? (
            <div className="text-center py-32 bg-surface/10 rounded-[4rem] border-2 border-dashed border-white/5 italic">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                  <Calendar size={32} />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[11px] mb-8">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="px-12 py-5 bg-brand text-dark rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand/20 hover:bg-white transition-all transform hover:scale-105">{t.makeFirst}</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
              {myBookings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(booking => {
                  const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
                  const canReview = booking.status === 'completed' && !booking.hasBeenReviewed;
                  
                  return (
                      <div key={booking.id} className="bg-surface/30 border border-white/5 rounded-[3rem] p-10 hover:border-brand/40 transition-all duration-500 group relative overflow-hidden flex flex-col xl:flex-row gap-10 items-start xl:items-center shadow-xl">
                          <div className="flex flex-col md:flex-row gap-8 items-center flex-grow">
                             <div className="w-24 h-24 rounded-3xl overflow-hidden bg-dark border border-white/10 shrink-0 shadow-lg group-hover:border-brand transition-all">
                               <img src={trainer?.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                             </div>
                             <div className="text-center md:text-left">
                                <p className="text-[10px] font-black uppercase text-brand mb-1 italic tracking-[0.2em]">{trainer?.specialty || 'SPECIALIST'}</p>
                                <h3 className="font-black uppercase italic text-3xl text-white mb-3 tracking-tighter leading-none group-hover:text-brand transition-colors">{trainer?.name || 'Unknown Coach'}</h3>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                   <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic"><Clock size={12} className="text-brand" /> {booking.date} @ {booking.time}</div>
                                   <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic"><MapPin size={12} className="text-brand" /> UL. STUDENTSKA 1A</div>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row xl:flex-col gap-4 w-full xl:w-auto shrink-0">
                             <div className="bg-dark/60 p-5 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-w-[140px]">
                                <p className="text-[8px] font-black uppercase text-slate-700 mb-1 tracking-widest">SESSION PIN</p>
                                <p className="text-2xl font-black text-brand tracking-widest italic leading-none">{booking.checkInCode || 'N/A'}</p>
                             </div>
                             <div className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center border shadow-sm ${
                               booking.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                               booking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                               booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                               'bg-white/5 text-slate-500 border-white/10'
                             }`}>
                               {booking.status.replace('_', ' ')}
                             </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                             {canReview ? (
                               <button onClick={() => setBookingToReview(booking)} className="flex-1 xl:w-48 px-6 py-5 bg-brand text-dark rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-brand/10 flex items-center justify-center gap-3 italic">
                                 <Star size={16} fill="currentColor"/> LEAVE REVIEW
                               </button>
                             ) : booking.hasBeenReviewed ? (
                               <div className="flex-1 xl:w-48 px-6 py-5 bg-white/5 text-brand rounded-2xl text-[10px] font-black uppercase tracking-widest border border-brand/20 flex items-center justify-center gap-3 italic opacity-60">
                                 <CheckCircle2 size={16}/> REVIEWED
                               </div>
                             ) : null}
                             
                             <div className="flex gap-2 flex-1 xl:flex-none">
                               <a href={`tel:${trainer?.phone}`} className="flex-1 xl:w-14 h-14 bg-white/5 hover:bg-white hover:text-dark text-white rounded-2xl flex items-center justify-center border border-white/10 transition-all group/icon shadow-lg">
                                  <Phone size={20} className="text-brand group-hover/icon:text-dark" />
                               </a>
                               <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex-1 xl:w-14 h-14 bg-white/5 hover:bg-brand hover:text-dark text-white rounded-2xl flex items-center justify-center border border-white/10 transition-all group/icon shadow-lg">
                                  <Navigation size={20} className="text-brand group-hover/icon:text-dark" />
                               </a>
                               <button onClick={() => confirmAction({ title: t.deleteBooking, message: t.sure, onConfirm: () => deleteBooking(booking.id) })} className="flex-1 xl:w-14 h-14 bg-white/5 hover:bg-red-500 hover:text-white text-slate-500 rounded-2xl flex items-center justify-center border border-white/10 transition-all shadow-lg">
                                 <Trash2 size={20}/>
                               </button>
                             </div>
                          </div>
                      </div>
                  )
              })}
            </div>
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
