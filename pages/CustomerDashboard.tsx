
import React, { useState, useMemo } from 'react';
import { Calendar, Star, LogOut, Loader2, X, Settings2, Trash2, AlertCircle, Sparkles, Languages, Clock, MapPin, CheckCircle2, User, Heart, Search, Briefcase, ShieldCheck, Globe, Navigation, Phone, ExternalLink, ArrowRight, PhoneCall, Zap, Ticket } from 'lucide-react';
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
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-dark/99 backdrop-blur-[150px] animate-in fade-in duration-700">
       <div className="bg-[#1a2332] rounded-[6rem] border-4 border-white/10 w-full max-w-3xl p-20 sm:p-32 text-center relative shadow-[0_0_250px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500 italic">
          <div className="absolute top-0 left-0 w-full h-4 bg-brand"></div>
          <button onClick={onClose} className="absolute top-20 right-20 p-6 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={48} /></button>
          
          <div className="w-40 h-40 bg-brand/10 text-brand rounded-[4rem] flex items-center justify-center mx-auto mb-16 shadow-2xl">
            <Heart size={80} className="fill-brand" />
          </div>
          
          <h2 className="text-6xl sm:text-7xl font-black uppercase italic text-white mb-10 tracking-tighter leading-none">
            REview <span className="text-brand">{trainerName}</span>
          </h2>
          <p className="text-slate-500 text-sm font-black uppercase tracking-[0.6em] mb-20 italic">HOW WAS YOUR SQUAD SESSION?</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setIsSubmitting(true); onSubmit(booking.id, rating, comment, isAiEnhanced, booking.trainerId).finally(() => setIsSubmitting(false)); }} className="space-y-16 text-left">
             <div className="flex justify-center gap-8 mb-16">
                {[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setRating(s)} className="p-4 transition-all hover:scale-150"><Star size={80} className={`${s <= rating ? 'text-brand fill-brand drop-shadow-[0_0_50px_rgba(197,217,45,0.8)]' : 'text-slate-800'}`} /></button>)}
             </div>
             
             <div className="space-y-8">
                <div className="flex items-center justify-between px-10">
                  <label className="text-sm font-black uppercase tracking-[0.5em] text-slate-600 italic">YOUR FEEDBACK</label>
                  <button type="button" onClick={handleAiEnhance} disabled={isEnhancing || !comment.trim()} className="flex items-center gap-4 px-10 py-4 bg-brand text-dark rounded-full text-xs font-black uppercase italic hover:bg-white transition-all shadow-[0_20px_50px_rgba(197,217,45,0.3)]">
                    {isEnhancing ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />} AI POLISH
                  </button>
                </div>
                <textarea rows={6} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Type your experience here..." className="w-full bg-dark/50 border-4 border-white/10 focus:border-brand rounded-[4rem] px-12 py-10 text-white text-2xl outline-none resize-none transition-all italic font-medium shadow-inner" />
             </div>
             
             <button type="submit" disabled={isSubmitting} className="w-full py-12 bg-brand text-dark rounded-[4rem] font-black uppercase tracking-[0.6em] text-xl hover:bg-white transition-all shadow-[0_50px_120px_rgba(197,217,45,0.4)]">
               {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={56} /> : 'SUBMIT PERFORMANCE REVIEW'}
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
    <div className="max-w-[1800px] mx-auto px-6 py-24 animate-in fade-in duration-1000 text-left selection:bg-brand selection:text-dark">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-16 mb-32 bg-surface p-16 sm:p-24 md:p-32 rounded-[8rem] border-4 border-white/10 shadow-[0_0_200px_rgba(0,0,0,0.9)] relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand/5 rounded-full blur-[250px] pointer-events-none group-hover:bg-brand/10 transition-all duration-1000"></div>
         <div className="flex flex-col md:flex-row items-center gap-20 relative z-10 text-center md:text-left w-full xl:w-auto">
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full p-4 bg-gradient-to-tr from-brand to-transparent shrink-0 overflow-hidden shadow-[0_0_150px_rgba(197,217,45,0.3)]">
                  <img src={currentUser.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-brand text-dark rounded-[3.5rem] flex items-center justify-center border-[12px] border-surface shadow-[0_30px_80px_rgba(0,0,0,0.7)] rotate-12 group-hover:rotate-0 transition-transform">
                 <ShieldCheck size={64} />
              </div>
            </div>
            <div className="flex-grow">
                <h1 className="text-7xl sm:text-9xl md:text-[11rem] font-black uppercase italic text-white mb-8 tracking-[0.02em] leading-[0.7] drop-shadow-3xl">{currentUser.name.split('(')[0].trim()}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-12">
                   {currentUser.roles?.map(role => (
                     <span key={role} className="text-brand bg-brand/10 text-base font-black uppercase tracking-[0.6em] px-12 py-5 rounded-full border-4 border-brand/20 shadow-2xl italic">
                       {role.toUpperCase()}
                     </span>
                   ))}
                   <button onClick={() => setShowEditModal(true)} className="bg-white/5 hover:bg-white hover:text-dark text-white text-base font-black uppercase tracking-[0.6em] px-12 py-5 rounded-full border-4 border-white/10 transition-all flex items-center gap-6 group/btn italic shadow-2xl">
                     <Settings2 size={32} className="group-hover/btn:rotate-90 transition-transform" /> {t.profileSettings}
                   </button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-16">
                   <div className="flex items-center gap-6 text-slate-500 font-black uppercase tracking-[0.8em] text-sm italic">
                      <Globe size={32} className="text-brand" /> {language === 'bg' ? 'ЕЗИЦИ' : 'DIALECTS'}
                   </div>
                   <div className="flex flex-wrap justify-center gap-6">
                      {currentUser.languages?.map(lang => (
                        <span key={lang} className="text-white text-xl font-black uppercase italic tracking-[0.2em] bg-white/5 px-8 py-4 rounded-3xl border-4 border-white/5 shadow-inner">
                          {lang}
                        </span>
                      ))}
                   </div>
                </div>
            </div>
         </div>
         <button onClick={() => { logout(); navigate('/'); }} className="w-full xl:w-auto px-20 py-12 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-[4rem] text-sm font-black uppercase tracking-[0.6em] transition-all border-4 border-red-500/20 flex items-center justify-center gap-8 shadow-[0_30px_100px_rgba(239,68,68,0.3)] italic">
           <LogOut size={48} /> {t.logout}
         </button>
      </div>

      {hasStaffAccess && (
        <div className="mb-40">
           <h2 className="text-sm font-black uppercase tracking-[1em] text-slate-600 italic mb-16 text-center sm:text-left">SYSTEM PORTALS</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {isCashier && <button onClick={() => navigate('/desk')} className="group p-16 bg-brand text-dark rounded-[5rem] flex items-center justify-between transition-all hover:scale-[1.03] shadow-[0_60px_120px_rgba(197,217,45,0.35)] font-black uppercase italic text-4xl tracking-tighter">
                <div className="flex items-center gap-10"><Search size={64}/> FRONT DESK</div>
                <ArrowRight size={56} className="group-hover:translate-x-6 transition-transform" />
              </button>}
              {currentUser.roles?.includes('trainer') && <button onClick={() => navigate('/trainer')} className="group p-16 bg-surface border-4 border-brand/60 text-brand rounded-[5rem] flex items-center justify-between transition-all hover:scale-[1.03] shadow-[0_60px_120px_rgba(0,0,0,0.7)] font-black uppercase italic text-4xl tracking-tighter">
                <div className="flex items-center gap-10"><Briefcase size={64}/> COACH TERMINAL</div>
                <ArrowRight size={56} className="group-hover:translate-x-6 transition-transform" />
              </button>}
              {isAdmin && <button onClick={() => navigate('/admin')} className="group p-16 bg-surface border-4 border-red-500/60 text-red-500 rounded-[5rem] flex items-center justify-between transition-all hover:scale-[1.03] shadow-[0_60px_120px_rgba(0,0,0,0.7)] font-black uppercase italic text-4xl tracking-tighter">
                <div className="flex items-center gap-10"><ShieldCheck size={64}/> ADMIN CONSOLE</div>
                <ArrowRight size={56} className="group-hover:translate-x-6 transition-transform" />
              </button>}
           </div>
        </div>
      )}

      <div className="space-y-20">
        <h2 className="text-sm font-black uppercase tracking-[1em] text-slate-600 italic text-center sm:text-left">TRANSFORMATION JOURNEY</h2>
        {myBookings.length === 0 ? (
            <div className="text-center py-80 bg-surface/10 rounded-[8rem] border-[8px] border-dashed border-white/5 italic">
                <div className="w-48 h-48 bg-white/5 rounded-[4.5rem] flex items-center justify-center mx-auto mb-20 text-slate-800 shadow-3xl">
                  <Calendar size={80} />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.8em] text-2xl mb-24">NO SQUAD SESSIONS LOGGED.</p>
                <button onClick={() => navigate('/booking')} className="px-32 py-12 bg-brand text-dark rounded-full font-black uppercase tracking-[0.6em] text-sm shadow-[0_50px_150px_rgba(197,217,45,0.4)] hover:bg-white transition-all transform hover:scale-105 italic">INITIALIZE FIRST SESSION</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-12">
              {myBookings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(booking => {
                  const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
                  const canReview = booking.status === 'completed' && !booking.hasBeenReviewed;
                  
                  return (
                      <div key={booking.id} className="bg-surface/60 border-4 border-white/10 rounded-[7rem] p-16 sm:p-24 hover:border-brand/70 transition-all duration-1000 group relative overflow-hidden flex flex-col 2xl:flex-row gap-20 items-start 2xl:items-center shadow-[0_50px_150px_rgba(0,0,0,0.8)]">
                          <div className="flex flex-col md:flex-row gap-20 items-center flex-grow w-full">
                             <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-[24rem] md:h-[24rem] rounded-[5rem] overflow-hidden bg-dark border-[6px] border-white/10 shrink-0 shadow-3xl group-hover:border-brand transition-all duration-1000">
                               <img src={trainer?.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                             </div>
                             <div className="text-center md:text-left flex-grow space-y-12">
                                <div className="space-y-4">
                                   <p className="text-base font-black uppercase text-brand italic tracking-[0.8em]">{trainer?.specialty || 'ELITE PERSONNEL'}</p>
                                   <h3 className="font-black uppercase italic text-7xl sm:text-8xl md:text-[8rem] text-white tracking-[0.02em] leading-[0.7] group-hover:text-brand transition-colors drop-shadow-3xl">{trainer?.name || 'Unknown Coach'}</h3>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-16 pt-6">
                                   <div className="flex items-center gap-8 text-2xl font-black uppercase text-slate-300 italic tracking-tighter"><Clock size={48} className="text-brand" /> {booking.date} <span className="text-white font-black italic">@</span> <span className="text-brand">{booking.time}</span></div>
                                   <div className="flex items-center gap-8 text-2xl font-black uppercase text-slate-300 italic tracking-tighter"><MapPin size={48} className="text-brand" /> MIR STOP, VARNA</div>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row 2xl:flex-col gap-10 w-full 2xl:w-auto shrink-0 justify-center">
                             <div className="bg-dark/95 backdrop-blur-3xl p-16 sm:p-20 rounded-[5rem] border-[6px] border-white/5 flex flex-col items-center justify-center min-w-[350px] shadow-[0_40px_100px_rgba(0,0,0,0.7)] group-hover:border-brand/40 transition-colors">
                                <div className="flex items-center gap-4 mb-6">
                                   <Ticket className="text-slate-700" size={24} />
                                   <p className="text-sm font-black uppercase text-slate-600 tracking-[0.8em] italic">ENTRY PIN</p>
                                </div>
                                <p className="text-8xl md:text-[7rem] font-black text-brand tracking-[0.3em] italic leading-none drop-shadow-[0_0_40px_rgba(197,217,45,0.5)]">{booking.checkInCode || 'N/A'}</p>
                             </div>
                             <div className={`px-12 py-8 rounded-3xl text-sm font-black uppercase tracking-[0.8em] text-center border-[6px] shadow-3xl italic ${
                               booking.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/50' : 
                               booking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/50' : 
                               booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50' : 
                               'bg-white/5 text-slate-500 border-white/30'
                             }`}>
                               {booking.status.replace('_', ' ')}
                             </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-6 w-full 2xl:w-auto">
                             {canReview ? (
                               <button onClick={() => setBookingToReview(booking)} className="flex-1 2xl:w-[24rem] px-16 py-12 bg-brand text-dark rounded-[4.5rem] text-xl font-black uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[0_50px_150px_rgba(197,217,45,0.4)] flex items-center justify-center gap-8 italic">
                                 <Star size={40} fill="currentColor"/> LEAVE REVIEW
                               </button>
                             ) : booking.hasBeenReviewed ? (
                               <div className="flex-1 2xl:w-[24rem] px-16 py-12 bg-white/5 text-brand rounded-[4.5rem] text-base font-black uppercase tracking-[0.4em] border-4 border-brand/50 flex items-center justify-center gap-8 italic opacity-80">
                                 <CheckCircle2 size={40}/> PERFORMANCE LOGGED
                               </div>
                             ) : null}
                             
                             <div className="flex gap-6 flex-1 2xl:flex-none">
                               <a href={`tel:${trainer?.phone}`} className="flex-1 2xl:w-32 h-32 bg-white/5 hover:bg-white hover:text-dark text-white rounded-[3rem] flex items-center justify-center border-4 border-white/10 transition-all group/icon shadow-3xl">
                                  <PhoneCall size={64} className="text-brand group-hover/icon:text-dark" />
                               </a>
                               <a href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A" target="_blank" rel="noopener noreferrer" className="flex-1 2xl:w-32 h-32 bg-white/5 hover:bg-brand hover:text-dark text-white rounded-[3rem] flex items-center justify-center border-4 border-white/10 transition-all group/icon shadow-3xl">
                                  <Navigation size={64} className="text-brand group-hover/icon:text-dark" />
                               </a>
                               <button onClick={() => confirmAction({ title: t.deleteBooking, message: t.sure, onConfirm: () => deleteBooking(booking.id) })} className="flex-1 2xl:w-32 h-32 bg-white/5 hover:bg-red-500 hover:text-white text-slate-500 rounded-[3rem] flex items-center justify-center border-4 border-white/10 transition-all shadow-3xl">
                                 <Trash2 size={64}/>
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
