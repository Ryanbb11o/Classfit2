
import React, { useState, useMemo } from 'react';
import { Calendar, Star, LogOut, Loader2, X, Settings2, Trash2, Sparkles, Clock, MapPin, CheckCircle2, User, Heart, Search, Briefcase, ShieldCheck, Globe, Navigation, ExternalLink, ArrowRight, PhoneCall, Ticket } from 'lucide-react';
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
        <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic text-center sm:text-left">SESSION HISTORY</h2>
        <div className="grid grid-cols-1 gap-6">
          {myBookings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(booking => {
              const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
              const canReview = booking.status === 'completed' && !booking.hasBeenReviewed;
              return (
                  <div key={booking.id} className="bg-surface/50 border border-white/10 rounded-[1.5rem] p-6 hover:border-brand/40 transition-all duration-500 group flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                      <div className="flex items-center gap-6 flex-grow w-full">
                         <div className="w-16 h-16 rounded-2xl overflow-hidden bg-dark border-2 border-white/10 shrink-0 group-hover:border-brand transition-all duration-700">
                           <img src={trainer?.image || DEFAULT_PROFILE_IMAGE} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-grow">
                            <p className="text-[8px] font-black uppercase text-brand italic tracking-widest">{trainer?.specialty || 'ELITE PERSONNEL'}</p>
                            <h3 className="font-black uppercase italic text-xl text-white tracking-tighter group-hover:text-brand transition-colors">{trainer?.name || 'Unknown Coach'}</h3>
                            <div className="flex gap-4 pt-2">
                               <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 italic"><Clock size={12} className="text-brand" /> {booking.date} @ {booking.time}</div>
                               <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 italic"><MapPin size={12} className="text-brand" /> VARNA</div>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-4 w-full lg:w-auto items-center">
                         <div className="bg-dark/80 p-3 px-6 rounded-xl border border-white/5 flex flex-col items-center justify-center min-w-[120px]">
                            <p className="text-[7px] font-black uppercase text-slate-600 mb-0.5 tracking-widest">ENTRY PIN</p>
                            <p className="text-2xl font-black text-brand tracking-widest italic">{booking.checkInCode || 'N/A'}</p>
                         </div>
                         <div className="flex gap-2">
                           {canReview && <button onClick={() => setBookingToReview(booking)} className="px-5 py-3 bg-brand text-dark rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-md">REVIEW</button>}
                           <a href={`tel:${trainer?.phone}`} className="w-10 h-10 bg-white/5 hover:bg-white hover:text-dark text-white rounded-xl flex items-center justify-center border border-white/10 transition-all"><PhoneCall size={16} /></a>
                           <button onClick={() => confirmAction({ title: t.deleteBooking, message: t.sure, onConfirm: () => deleteBooking(booking.id) })} className="w-10 h-10 bg-white/5 hover:bg-red-500 hover:text-white text-slate-500 rounded-xl flex items-center justify-center border border-white/10 transition-all"><Trash2 size={16}/></button>
                         </div>
                      </div>
                  </div>
              )
          })}
        </div>
      </div>
      {showEditModal && <RoleManagementModal user={currentUser} onClose={() => setShowEditModal(false)} onUpdate={async (uid, updates) => await updateUser(uid, updates)} language={language} isManagement={isManagement} isSelf={true} />}
      {bookingToReview && <ReviewModal booking={bookingToReview} trainerName={allTrainers.find(tImg => tImg.id === bookingToReview.trainerId)?.name || 'Coach'} onClose={() => setBookingToReview(null)} onSubmit={handleReviewSubmit} />}
    </div>
  );
};

export default CustomerDashboard;
