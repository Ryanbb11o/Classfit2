
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
      {/* LEFT SIDE: IMMERSIVE BRANDING */}
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
            <span>ClassFit Varna Base</span>
            <span>Est. 2024</span>
         </div>
      </div>

      <div className="flex-1 md:ml-[35%] lg:ml-[30%] bg-surface/10 backdrop-blur-3xl p-6 sm:p-10 md:p-16 lg:p-24 min-h-screen">
         <div className="max-w-3xl mx-auto">
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
            {/* Form follows... */}
         </div>
      </div>
    </div>
  );
};

export default TrainerSignUp;
