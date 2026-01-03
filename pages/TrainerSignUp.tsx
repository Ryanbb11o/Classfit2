
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, AlertCircle, CheckCircle, Briefcase, User, Mail, Phone, Lock, ArrowRight, Instagram, Award, History, Heart, Sparkles, X, ChevronRight, Loader2, Zap, Plus, Minus, Languages, Check } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';

const TrainerSignUp: React.FC = () => {
  const { registerTrainer, language } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '0',
    certs: '',
    social: '',
    motivation: '',
    password: ''
  });

  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Bulgarian']);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const languageOptions = ['Bulgarian', 'English', 'Russian', 'German', 'Turkish', 'Other'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLangs(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleExperienceChange = (type: 'inc' | 'dec') => {
    setForm(prev => {
      const current = parseInt(prev.experience) || 0;
      const next = type === 'inc' ? current + 1 : Math.max(0, current - 1);
      return { ...prev, experience: next.toString() };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
        const { success, msg } = await registerTrainer({
          name: form.name,
          email: form.email,
          pass: form.password,
          phone: form.phone,
          specialty: form.specialty,
          experience: form.experience,
          certs: form.certs,
          social: form.social,
          motivation: form.motivation,
          languages: selectedLangs
        });
        
        if (success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMsg(msg || 'Registration failed.');
        }
    } catch (err) {
        setStatus('error');
        setErrorMsg('System error.');
    }
  };

  if (status === 'success') {
      return (
          <div className="min-h-screen bg-dark flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
              <div className="text-center w-full max-w-xl bg-surface/30 backdrop-blur-xl border border-white/10 p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand text-dark rounded-full flex items-center justify-center shadow-2xl shadow-brand/20">
                      <CheckCircle size={40} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white mb-6 mt-4 tracking-tighter leading-none">
                      {t.applicationFiled}
                  </h1>
                  <p className="text-slate-400 font-medium leading-relaxed mb-10 italic text-sm md:text-base">
                      {t.pendingReviewMsg}
                  </p>
                  <button 
                    onClick={() => navigate('/')} 
                    className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-xl shadow-brand/10"
                  >
                      {t.returnToBase}
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="relative min-h-screen bg-dark flex flex-col md:flex-row font-sans selection:bg-brand selection:text-dark">
      {/* LEFT SIDE: IMMERSIVE BRANDING (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-[35%] lg:w-[30%] fixed top-0 bottom-0 left-0 overflow-hidden bg-dark p-12 lg:p-20 flex-col justify-between border-r border-white/5">
         <div className="absolute inset-0 z-0">
            <img 
               src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop" 
               className="w-full h-full object-cover grayscale opacity-20 scale-110 blur-[2px]"
               alt="Gym"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-dark via-dark/90 to-transparent"></div>
         </div>

         <div className="relative z-10">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-white font-black italic text-2xl tracking-tighter uppercase mb-20 group">
               CLASS<span className="text-brand">FIT</span> 
               <X size={18} className="text-slate-600 group-hover:text-white transition-colors" />
            </button>

            <h1 className="text-5xl lg:text-7xl font-black uppercase italic text-white leading-[0.85] tracking-tighter mb-8">
               {t.joinThe} <br/> <span className="text-brand">{t.eliteTeam}</span>
            </h1>
            <p className="text-slate-400 text-base lg:text-lg font-medium italic max-w-xs leading-relaxed mb-12">
               {t.varnaProfessionals}
            </p>

            <div className="space-y-4">
               {[
                 { icon: Zap, text: 'High-Traffic Base' },
                 { icon: Award, text: 'Club Benefits' },
                 { icon: Briefcase, text: 'Professional Growth' }
               ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-white group">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-dark transition-all">
                       <item.icon size={18} fill="currentColor" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest italic">{item.text}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="relative z-10 flex items-center justify-between text-slate-600 text-[11px] font-black uppercase tracking-widest">
            <span>ClassFit Varna • Mir Stop</span>
            <span>Est. 2024</span>
         </div>
      </div>

      {/* RIGHT SIDE: FULL APPLICATION FORM (Mobile Friendly) */}
      <div className="flex-1 md:ml-[35%] lg:ml-[30%] bg-surface/10 backdrop-blur-3xl p-6 sm:p-10 md:p-16 lg:p-24 min-h-screen">
         <div className="max-w-3xl mx-auto">
            {/* Mobile-only Header */}
            <div className="md:hidden flex justify-between items-center mb-10 pt-4">
               <span className="text-2xl font-black italic text-white tracking-tighter uppercase">
                  CLASS<span className="text-brand">FIT</span>
               </span>
               <button onClick={() => navigate('/')} className="p-3 bg-white/5 rounded-full text-slate-400">
                  <X size={20}/>
               </button>
            </div>

            <div className="mb-12 md:mb-16">
               <div className="inline-flex items-center gap-3 bg-brand text-dark px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-brand/20">
                  <Briefcase size={12} /> {t.coachPortal}
               </div>
               <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic text-white tracking-tighter mb-4 leading-none">
                  {t.professionalDetails}
               </h2>
               <p className="text-slate-500 font-medium text-sm italic leading-relaxed">
                  {t.coachPhilosophy}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12 md:space-y-16">
               {status === 'error' && (
                  <div className="bg-red-500/10 text-red-500 p-6 rounded-3xl flex items-center gap-3 text-[11px] font-black uppercase tracking-wide border border-red-500/20 animate-in fade-in zoom-in-95">
                     <AlertCircle size={20} /> {errorMsg}
                  </div>
               )}

               {/* SECTION 1: IDENTITY */}
               <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                     <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <User size={14} />
                     </div>
                     <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                        {t.identityAndAccess}
                     </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerFullName}</label>
                        <input name="name" type="text" required value={form.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800 text-sm" placeholder="e.g. Michael Jordan" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerEmail}</label>
                        <input name="email" type="email" required value={form.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800 text-sm" placeholder="coach@classfit.bg" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerPassword}</label>
                        <input name="password" type="password" required value={form.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800 text-sm" placeholder="••••••••" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerPhone}</label>
                        <input name="phone" type="tel" required value={form.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800 text-sm" placeholder="+359..." />
                     </div>
                  </div>
               </div>

               {/* SECTION 2: EXPERTISE */}
               <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                     <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <Dumbbell size={14} />
                     </div>
                     <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                        {t.expertiseAndExperience}
                     </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerSpecialty}</label>
                        <input name="specialty" type="text" required value={form.specialty} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800 text-sm" placeholder="Powerlifting, Yoga..." />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerExperience}</label>
                        <div className="relative group flex items-center">
                           <button type="button" onClick={() => handleExperienceChange('dec')} className="absolute left-2 w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center hover:bg-brand hover:text-dark transition-all z-10"><Minus size={14} /></button>
                           <input type="number" value={form.experience} readOnly className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-white font-black text-lg outline-none text-center" />
                           <span className="absolute right-14 text-[11px] font-black uppercase tracking-widest text-slate-600 pointer-events-none italic">{t.years}</span>
                           <button type="button" onClick={() => handleExperienceChange('inc')} className="absolute right-2 w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center hover:bg-brand hover:text-dark transition-all z-10"><Plus size={14} /></button>
                        </div>
                     </div>
                  </div>
                  
                  {/* LANGUAGE SELECTION */}
                  <div className="space-y-4 text-left">
                     <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">
                        <Languages size={14} className="text-brand" /> {t.trainerLanguagesSpoken}
                     </label>
                     <div className="flex flex-wrap gap-2 md:gap-3">
                        {languageOptions.map(lang => (
                           <button 
                              key={lang} 
                              type="button" 
                              onClick={() => toggleLanguage(lang)}
                              className={`px-4 md:px-5 py-2.5 md:py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                                 selectedLangs.includes(lang) 
                                 ? 'bg-brand text-dark border-brand shadow-lg shadow-brand/10' 
                                 : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand/40'
                              }`}
                           >
                              {selectedLangs.includes(lang) && <Check size={12} className="inline mr-2" />}
                              {lang}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-2 text-left">
                     <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerCerts}</label>
                     <textarea name="certs" rows={3} value={form.certs} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium italic outline-none focus:border-brand transition-all placeholder-slate-800 resize-none text-sm" placeholder="List your professional certifications..." />
                  </div>
               </div>

               {/* SECTION 3: SOCIAL & VISION */}
               <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                     <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <Sparkles size={14} />
                     </div>
                     <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                        {t.motivationAndReach}
                     </h3>
                  </div>
                  <div className="space-y-2 text-left">
                     <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerSocial}</label>
                     <div className="relative">
                        <Instagram size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" />
                        <input name="social" type="text" value={form.social} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800 text-sm" placeholder="instagram.com/profile" />
                     </div>
                  </div>
                  <div className="space-y-2 text-left">
                     <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">{t.trainerMotivation}</label>
                     <textarea name="motivation" required rows={4} value={form.motivation} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium italic outline-none focus:border-brand transition-all placeholder-slate-800 resize-none text-sm" placeholder="Describe your philosophy..." />
                  </div>
               </div>

               <div className="pt-8 flex flex-col items-start gap-8">
                  <button 
                     type="submit"
                     disabled={status === 'loading'}
                     className="w-full md:w-auto px-16 md:px-24 py-5 md:py-6 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-2xl shadow-brand/10 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                     {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <>{t.trainerSubmit} <ChevronRight size={20} /></>}
                  </button>
                  <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest italic text-left leading-relaxed">
                     {t.trainerReviewHours} <br className="hidden sm:block"/>
                     <span className="text-slate-700">All data is kept strictly professional.</span>
                  </p>
               </div>
            </form>
            
            <div className="mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-600 pb-10">
               <Link to="/login" className="hover:text-white transition-colors">Existing Account Login</Link>
               <Link to="/" className="hover:text-white transition-colors tracking-[0.4em]">ClassFit Base</Link>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TrainerSignUp;
