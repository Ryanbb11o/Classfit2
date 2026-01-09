
import React, { useState, useMemo } from 'react';
import { Calendar, Star, LogOut, Loader2, X, Settings2, Trash2, Sparkles, Clock, MapPin, CheckCircle2, User, Heart, Search, Briefcase, ShieldCheck, Globe, Navigation, ExternalLink, ArrowRight, PhoneCall, Ticket, Info, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import RoleManagementModal from '../components/RoleManagementModal';

// Helper for time ranges
const formatTimeRange = (startTime: string, durationMins: number = 60) => {
  if (!startTime) return '';
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  const endDate = new Date(date.getTime() + durationMins * 60000);
  const endHours = String(endDate.getHours()).padStart(2, '0');
  const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
  return `${startTime} -> ${endHours}:${endMinutes}`;
};

const CancellationModal: React.FC<{ 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
  t: any;
}> = ({ onClose, onConfirm, t }) => {
  const [reason, setReason] = useState('');
  const reasons = [t.cancelInjury, t.cancelSchedule, t.cancelPersonal, t.cancelOther];

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
       <div className="bg-surface border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative italic">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <button onClick={onClose} className="absolute top-6 right-8 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20}/></button>
          
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <AlertTriangle size={32} />
             </div>
             <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">{t.cancelSession}</h2>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{t.cancelReason}</p>
          </div>

          <div className="space-y-3 mb-8">
             {reasons.map((r) => (
                <button 
                  key={r} 
                  onClick={() => setReason(r)}
                  className={`w-full p-4 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all text-left flex justify-between items-center ${reason === r ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                   {r}
                   {reason === r && <CheckCircle2 size={14} className="animate-in zoom-in" />}
                </button>
             ))}
          </div>

          <div className="flex flex-col gap-3">
             <button 
                disabled={!reason}
                onClick={() => onConfirm(reason)}
                className={`w-full py-5 rounded-xl font-black uppercase italic tracking-widest text-xs transition-all shadow-xl ${reason ? 'bg-red-600 text-white hover:bg-red-500 active:scale-95' : 'bg-white/5 text-slate-700 cursor-not-allowed border border-white/5'}`}
             >
                {t.deleteBooking}
             </button>
             <button onClick={onClose} className="w-full py-4 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-white transition-colors">
                Back to Session
             </button>
          </div>
       </div>
    </div>
  );
};

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
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-dark/98 backdrop-blur-md animate-in fade-in duration-500">
       <div className="bg-[#1a2332] rounded-[2.5rem] border border-white/10 w-full max-w-lg p-10 text-center relative shadow-2xl italic">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
          <button onClick={onClose} className="absolute top-6 right-8 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20} /></button>
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"><Heart size={28} className="fill-brand" /></div>
          <h2 className="text-2xl font-black uppercase italic text-white mb-6 tracking-tighter">Review <span className="text-brand">{trainerName}</span></h2>
          <form onSubmit={(e) => { e.preventDefault(); setIsSubmitting(true); onSubmit(booking.id, rating, comment, isAiEnhanced, booking.trainerId).finally(() => setIsSubmitting(false)); }} className="space-y-8 text-left">
             <div className="flex justify-center gap-4 mb-8">
                {[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setRating(s)} className="p-1 transition-all hover:scale-125"><Star size={24} className={`${s <= rating ? 'text-brand fill-brand drop-shadow-[0_0_15px_rgba(197,217,45,0.4)]' : 'text-slate-800'}`} /></button>)}
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">YOUR FEEDBACK</label>
                  <button type="button" onClick={handleAiEnhance} disabled={isEnhancing || !comment.trim()} className="flex items-center gap-2 px-4 py-2 bg-brand text-dark rounded-full text-[9px] font-black uppercase italic hover:bg-white transition-all shadow-md">
                    {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI POLISH
                  </button>
                </div>
                <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Type your experience here..." className="w-full bg-dark/50 border border-white/10 focus:border-brand rounded-2xl px-6 py-4 text-white text-sm outline-none resize-none transition-all italic font-medium shadow-inner" />
             </div>
             <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-xl">
               {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'SUBMIT PERFORMANCE REVIEW'}
             </button>
          </form>
       </div>
    </div>
  );
};

const SessionProgressLine: React.FC<{ status: string, t: any }> = ({ status, t }) => {
  const steps = [
    { key: 'pending', label: t.statusRequested },
    { key: 'confirmed', label: t.statusConfirmed },
    { key: 'completed', label: t.statusCompletedLive }
  ];

  let progress = 0;
  if (status === 'pending') progress = 20;
  if (status === 'confirmed') progress = 60;
  if (status === 'completed' || status === 'trainer_completed') progress = 100;

  return (
    <div className="flex flex-col gap-3 flex-grow w-full max-w-lg">
       <div className="flex justify-between px-1 mb-1">
          {steps.map((step, idx) => {
             const active = status === step.key || 
                            (step.key === 'completed' && (status === 'trainer_completed' || status === 'completed')) || 
                            (step.key === 'pending' && (status === 'confirmed' || status === 'completed' || status === 'trainer_completed')) || 
                            (step.key === 'confirmed' && (status === 'completed' || status === 'trainer_completed'));
             return (
                <div key={step.key} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                   <div className={`w-3 h-3 rounded-full border-2 transition-all duration-700 ${active ? 'bg-brand border-brand shadow-[0_0_15px_rgba(197,217,45,0.8)]' : 'bg-dark border-slate-700'}`}></div>
                   <span className={`text-[8px] font-black uppercase tracking-tighter italic ${active ? 'text-white' : 'text-slate-600'}`}>{step.label}</span>
                </div>
             )
          })}
       </div>
       <div className="h-2 bg-dark border border-white/5 rounded-full overflow-hidden relative shadow-inner">
          <div 
             className="h-full bg-gradient-to-r from-brand/80 to-brand transition-all duration-1000 ease-out relative"
             style={{ width: `${progress}%` }}
          >
             {progress > 0 && progress < 100 && (
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-32 animate-scan pointer-events-none"></div>
             )}
          </div>
       </div>
    </div>
  );
};

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, currentUser, logout, users, addReview, refreshData, confirmAction, isManagement, isAdmin, isCashier, updateUser } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
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

  const handleCancelBooking = async (reason: string) => {
    if (!bookingToCancel) return;
    await updateBooking(bookingToCancel.id, { status: 'cancelled' });
    setBookingToCancel(null);
    await refreshData();
  };

  const hasStaffAccess = isCashier || isAdmin || currentUser.roles?.includes('trainer');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16 animate-in fade-in duration-700 text-left">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16 bg-surface p-10 rounded-[3rem] border border-white/10 shadow-xl relative overflow-hidden group">
         <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left w-full lg:w-auto">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1.5 bg-gradient-to-tr from-brand to-transparent shrink-0 overflow-hidden shadow-xl">
                  <img src={currentUser.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-all duration-1000" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand text-dark rounded-xl flex items-center justify-center border-4 border-surface shadow-xl rotate-12 transition-transform">
                 <ShieldCheck size={14} />
              </div>
            </div>
            <div className="flex-grow">
                <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white mb-3 tracking-tighter leading-none">{currentUser.name.split('(')[0].trim()}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                   {currentUser.roles?.map(role => (
                     <span key={role} className="text-brand bg-brand/10 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand/20 shadow-md italic">
                       {role.toUpperCase()}
                     </span>
                   ))}
                   <button onClick={() => setShowEditModal(true)} className="bg-white/5 hover:bg-white hover:text-dark text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 transition-all flex items-center gap-2 group/btn italic">
                     <Settings2 size={10} className="group-hover/btn:rotate-90 transition-transform" /> {t.profileSettings}
                   </button>
                </div>
            </div>
         </div>
         <button onClick={() => { logout(); navigate('/'); }} className="w-full lg:w-auto px-10 py-5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20 flex items-center justify-center gap-4 shadow-lg italic">
           <LogOut size={18} /> {t.logout}
         </button>
      </div>

      {hasStaffAccess && (
        <div className="mb-16">
           <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic mb-6 text-center sm:text-left">SYSTEM PORTALS</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isCashier && <button onClick={() => navigate('/desk')} className="group p-6 bg-brand text-dark rounded-[2rem] flex items-center justify-between transition-all hover:scale-[1.01] shadow-xl font-black uppercase italic text-xl tracking-tighter">
                <div className="flex items-center gap-6"><Search size={24}/> FRONT DESK</div>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>}
              {currentUser.roles?.includes('trainer') && <button onClick={() => navigate('/trainer')} className="group p-6 bg-surface border border-brand/40 text-brand rounded-[2rem] flex items-center justify-between transition-all hover:scale-[1.01] shadow-lg font-black uppercase italic text-xl tracking-tighter">
                <div className="flex items-center gap-6"><Briefcase size={24}/> COACH TERMINAL</div>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>}
              {isAdmin && <button onClick={() => navigate('/admin')} className="group p-6 bg-surface border border-red-500/40 text-red-500 rounded-[2rem] flex items-center justify-between transition-all hover:scale-[1.01] shadow-lg font-black uppercase italic text-xl tracking-tighter">
                <div className="flex items-center gap-6"><ShieldCheck size={24}/> ADMIN CONSOLE</div>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>}
           </div>
        </div>
      )}

      <div className="space-y-8">
        <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic text-center sm:text-left">LIVE SESSION HISTORY</h2>
        <div className="grid grid-cols-1 gap-6">
          {myBookings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(booking => {
              const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
              const canReview = booking.status === 'completed' && !booking.hasBeenReviewed;
              const isCancelled = booking.status === 'cancelled';
              
              return (
                  <div key={booking.id} className={`bg-surface/60 border border-white/5 rounded-[3rem] p-10 hover:border-brand/40 transition-all duration-500 group relative flex flex-col lg:flex-row gap-12 items-start lg:items-center ${isCancelled ? 'opacity-50 grayscale' : 'shadow-2xl'}`}>
                      
                      {/* 1. TRAINER PROFILE PICTURE ANCHOR */}
                      <div className="flex items-center gap-8 min-w-[320px] shrink-0">
                         <div className="relative group/avatar">
                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-dark border-2 border-white/10 group-hover:border-brand transition-all duration-700 shadow-xl">
                               <img src={trainer?.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-1000" />
                            </div>
                            {!isCancelled && booking.status !== 'completed' && (
                               <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand rounded-full border-4 border-surface animate-pulse shadow-[0_0_15px_rgba(197,217,45,0.6)]"></div>
                            )}
                         </div>
                         <div className="flex-grow">
                            <p className="text-[10px] font-black uppercase text-brand italic tracking-[0.2em] mb-1">{trainer?.specialty || 'Personnel'}</p>
                            <h3 className="font-black uppercase italic text-2xl text-white tracking-tighter group-hover:text-brand transition-colors leading-none mb-3">{trainer?.name || 'Coach'}</h3>
                            <div className="flex gap-4">
                               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 italic"><Clock size={12} className="text-brand" /> {booking.date}</div>
                            </div>
                         </div>
                      </div>

                      {/* 2. LIVE PROGRESS BAR WITH SCAN PULSE */}
                      {!isCancelled ? (
                         <div className="flex-grow w-full flex justify-center lg:justify-start">
                            <SessionProgressLine status={booking.status} t={t} />
                         </div>
                      ) : (
                         <div className="flex-grow text-center lg:text-left flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500"><X size={20} /></div>
                            <span className="px-5 py-2 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic border border-red-500/20">Protocol Terminated</span>
                         </div>
                      )}

                      {/* 3. STATUS DATA & ACTIONS */}
                      <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto items-center shrink-0">
                         <div className="flex flex-col items-center bg-dark/60 px-8 py-5 rounded-[2rem] border border-white/5 min-w-[160px] italic shadow-inner">
                            <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-[0.2em]">{formatTimeRange(booking.time, booking.duration)}</p>
                            <p className="text-3xl font-black text-white tracking-widest italic leading-none"><span className="text-slate-700 text-[10px] mr-2">PIN</span>{booking.checkInCode || '---'}</p>
                         </div>
                         
                         <div className="flex gap-3">
                            {canReview && (
                               <button 
                                 onClick={() => setBookingToReview(booking)} 
                                 className="px-8 py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-xl italic"
                               >
                                  Post Review
                               </button>
                            )}
                            <button 
                               onClick={() => confirmAction({ title: t.viewInfo, message: `Access Point: ${booking.gymAddress || t.address}`, onConfirm: () => {} })} 
                               className="w-14 h-14 bg-white/5 hover:bg-white hover:text-dark text-white rounded-2xl flex items-center justify-center border border-white/10 transition-all group/btn shadow-lg"
                               title="View Info"
                            >
                               <Info size={24} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                            
                            {!isCancelled && booking.status !== 'completed' && booking.status !== 'trainer_completed' && (
                               <button 
                                 onClick={() => setBookingToCancel(booking)} 
                                 className="w-14 h-14 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl flex items-center justify-center border border-red-500/10 transition-all group/btn shadow-lg"
                                 title="Cancel Session"
                               >
                                  <Trash2 size={22} className="group-hover/btn:rotate-12 transition-transform" />
                               </button>
                            )}
                         </div>
                      </div>
                  </div>
              )
          })}

          {myBookings.length === 0 && (
             <div className="py-40 text-center bg-surface/30 rounded-[4rem] border-2 border-dashed border-white/5 shadow-inner">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-700">
                   <Calendar size={40} />
                </div>
                <p className="text-xl font-black uppercase italic text-slate-500 tracking-tight">{t.noBookings}</p>
                <button onClick={() => navigate('/booking')} className="mt-10 px-12 py-6 bg-brand text-dark rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all italic shadow-2xl shadow-brand/20 active:scale-95">{t.makeFirst}</button>
             </div>
          )}
        </div>
      </div>

      {showEditModal && <RoleManagementModal user={currentUser} onClose={() => setShowEditModal(false)} onUpdate={async (uid, updates) => await updateUser(uid, updates)} language={language} isManagement={isManagement} isSelf={true} />}
      {bookingToReview && <ReviewModal booking={bookingToReview} trainerName={allTrainers.find(tImg => tImg.id === bookingToReview.trainerId)?.name || 'Coach'} onClose={() => setBookingToReview(null)} onSubmit={handleReviewSubmit} />}
      {bookingToCancel && <CancellationModal t={t} onClose={() => setBookingToCancel(null)} onConfirm={handleCancelBooking} />}
    </div>
  );
};

export default CustomerDashboard;
