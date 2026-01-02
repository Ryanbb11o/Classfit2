
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
          <div className="fixed inset-0 z-[100] bg-dark flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
              <div className="text-center max-w-xl bg-surface/30 backdrop-blur-xl border border-white/10 p-16 rounded-[4rem] shadow-2xl relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand text-dark rounded-full flex items-center justify-center shadow-2xl shadow-brand/20">
                      <CheckCircle size={40} />
                  </div>
                  <h1 className="text-4xl font-black uppercase italic text-white mb-6 mt-4 tracking-tighter">
                      {language === 'bg' ? 'ЗАЯВКАТА Е ПРИЕТА' : 'APPLICATION FILED'}
                  </h1>
                  <p className="text-slate-400 font-medium leading-relaxed mb-10 italic">
                      {language === 'bg' 
                        ? 'Профилът ви беше създаден успешно със статус "Изчакващ". Екипът на ClassFit ще прегледа вашата експертиза и ще се свърже с вас за интервю.' 
                        : 'Your profile has been successfully created with pending status. The ClassFit team will review your expertise and contact you for an interview shortly.'}
                  </p>
                  <button 
                    onClick={() => navigate('/')} 
                    className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl shadow-brand/10"
                  >
                      {language === 'bg' ? 'Към началната страница' : 'Return to Base'}
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 z-[50] bg-dark flex flex-col md:flex-row overflow-hidden font-sans">
      {/* LEFT SIDE: IMMERSIVE BRANDING */}
      <div className="hidden md:flex md:w-[40%] lg:w-[35%] relative overflow-hidden bg-dark p-20 flex-col justify-between border-r border-white/5">
         <div className="absolute inset-0 z-0">
            <img 
               src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop" 
               className="w-full h-full object-cover grayscale opacity-30 scale-110 blur-sm"
               alt="Gym"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-dark via-dark/80 to-transparent"></div>
         </div>

         <div className="relative z-10">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-white font-black italic text-2xl tracking-tighter uppercase mb-20 group">
               CLASS<span className="text-brand">FIT</span> 
               <X size={18} className="text-slate-600 group-hover:text-white transition-colors" />
            </button>

            <h1 className="text-7xl font-black uppercase italic text-white leading-[0.8] tracking-tighter mb-8">
               JOIN THE <br/> <span className="text-brand">ELITE</span> <br/> TEAM
            </h1>
            <p className="text-slate-400 text-lg font-medium italic max-w-xs leading-relaxed mb-12">
               {language === 'bg' 
                 ? 'Търсим най-добрите професионалисти във Варна. Развивайте кариерата си при нас.' 
                 : 'We are looking for the absolute best professionals in Varna. Grow your career with us.'}
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
                    <span className="text-[10px] font-black uppercase tracking-widest italic">{item.text}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="relative z-10 flex items-center justify-between text-slate-600 text-[9px] font-black uppercase tracking-widest">
            <span>ClassFit Varna • Mir Stop</span>
            <span>Est. 2024</span>
         </div>
      </div>

      {/* RIGHT SIDE: FULL APPLICATION FORM */}
      <div className="flex-1 overflow-y-auto bg-surface/10 backdrop-blur-3xl p-8 md:p-16 lg:p-24 custom-scrollbar">
         <div className="max-w-3xl mx-auto">
            <div className="md:hidden flex justify-between items-center mb-12">
               <span className="text-xl font-black italic text-white">CLASS<span className="text-brand">FIT</span></span>
               <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            <div className="mb-16">
               <div className="inline-flex items-center gap-3 bg-brand text-dark px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-brand/20">
                  <Briefcase size={12} /> Coach Application Portal
               </div>
               <h2 className="text-5xl font-black uppercase italic text-white tracking-tighter mb-4 leading-none">PROFESSIONAL DETAILS</h2>
               <p className="text-slate-500 font-medium text-sm italic">Tell us about your expertise and why you belong at ClassFit.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-16">
               {status === 'error' && (
                  <div className="bg-red-500/10 text-red-500 p-6 rounded-3xl flex items-center gap-3 text-xs font-black uppercase tracking-wide border border-red-500/20 animate-in fade-in zoom-in-95">
                     <AlertCircle size={20} /> {errorMsg}
                  </div>
               )}

               {/* SECTION 1: IDENTITY */}
               <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                     <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center"><User size={14} /></div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Identity & Access</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Full Legal Name</label>
                        <input name="name" type="text" required value={form.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800" placeholder="Michael Jordan" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Email Address</label>
                        <input name="email" type="email" required value={form.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800" placeholder="coach@classfit.bg" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Password</label>
                        <input name="password" type="password" required value={form.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800" placeholder="••••••••" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Phone Number</label>
                        <input name="phone" type="tel" required value={form.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800" placeholder="+359..." />
                     </div>
                  </div>
               </div>

               {/* SECTION 2: EXPERTISE */}
               <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                     <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center"><Dumbbell size={14} /></div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Expertise & Experience</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Primary Coaching Discipline</label>
                        <input name="specialty" type="text" required value={form.specialty} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800" placeholder="Powerlifting, CrossFit, Yoga..." />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Years of Experience</label>
                        <div className="relative group flex items-center">
                           <button type="button" onClick={() => handleExperienceChange('dec')} className="absolute left-3 w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center hover:bg-brand hover:text-dark transition-all z-10"><Minus size={16} /></button>
                           <input type="number" value={form.experience} readOnly className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-5 text-white font-black text-xl outline-none text-center" />
                           <span className="absolute right-16 text-[9px] font-black uppercase tracking-widest text-slate-600 pointer-events-none italic">Years</span>
                           <button type="button" onClick={() => handleExperienceChange('inc')} className="absolute right-3 w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center hover:bg-brand hover:text-dark transition-all z-10"><Plus size={16} /></button>
                        </div>
                     </div>
                  </div>
                  
                  {/* LANGUAGE SELECTION */}
                  <div className="space-y-4">
                     <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">
                        <Languages size={14} className="text-brand" /> Languages Spoken
                     </label>
                     <div className="flex flex-wrap gap-3">
                        {languageOptions.map(lang => (
                           <button 
                              key={lang} 
                              type="button" 
                              onClick={() => toggleLanguage(lang)}
                              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
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

                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Certifications & Education</label>
                     <textarea name="certs" rows={3} value={form.certs} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-medium italic outline-none focus:border-brand transition-all placeholder-slate-800 resize-none" placeholder="List your professional certifications..." />
                  </div>
               </div>

               {/* SECTION 3: SOCIAL & VISION */}
               <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                     <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center"><Sparkles size={14} /></div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Motivation & Reach</h3>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Social Profile Link (IG/LI)</label>
                     <div className="relative">
                        <Instagram size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" />
                        <input name="social" type="text" value={form.social} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-brand transition-all placeholder-slate-800" placeholder="instagram.com/coach_profile" />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Why join the ClassFit Team?</label>
                     <textarea name="motivation" required rows={5} value={form.motivation} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-medium italic outline-none focus:border-brand transition-all placeholder-slate-800 resize-none" placeholder="Describe your philosophy and what you bring to our club..." />
                  </div>
               </div>

               <div className="pt-10 flex flex-col md:flex-row items-center gap-10">
                  <button 
                     type="submit"
                     disabled={status === 'loading'}
                     className="w-full md:w-auto px-24 py-7 bg-brand text-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-2xl shadow-brand/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                     {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <>Submit Application <ChevronRight size={20} /></>}
                  </button>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic text-center md:text-left leading-loose">
                     {language === 'bg' ? 'До 48 часа за преглед на заявката.' : 'Review period: 48 Business Hours.'} <br/>
                     <span className="text-slate-700">All data is kept strictly professional.</span>
                  </p>
               </div>
            </form>
            
            <div className="mt-24 pt-10 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
               <Link to="/login" className="hover:text-white transition-colors">Existing Account Login</Link>
               <Link to="/" className="hover:text-white transition-colors tracking-[0.4em]">ClassFit Base</Link>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TrainerSignUp;
