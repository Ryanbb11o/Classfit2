
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, AlertCircle, CheckCircle, Briefcase, User, Mail, Phone, Lock } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';

const TrainerSignUp: React.FC = () => {
  const { registerTrainer, language } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [password, setPassword] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
        const { success, msg } = await registerTrainer(name, email, password, phone, specialty);
        if (success) {
            setStatus('success');
        } else {
            setStatus('error');
            // Check for DB constraint error vs just duplicate email
            if (msg?.includes('check constraint')) {
                setErrorMsg('Database Update Required. Please contact Admin to run SQL migration.');
            } else if (msg?.includes('unique constraint')) {
                setErrorMsg(language === 'bg' ? 'Имейлът вече е регистриран.' : 'Email already in use.');
            } else {
                setErrorMsg(msg || 'Registration failed.');
            }
        }
    } catch (err) {
        setStatus('error');
        setErrorMsg('System error.');
    }
  };

  if (status === 'success') {
      return (
          <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in zoom-in-95 duration-500">
              <div className="text-center max-w-lg">
                  <div className="w-20 h-20 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand/20">
                      <CheckCircle size={40} />
                  </div>
                  <h1 className="text-3xl font-black uppercase italic text-white mb-4">
                      {language === 'bg' ? 'Заявката е приета' : 'Application Received'}
                  </h1>
                  <p className="text-slate-400 font-medium leading-relaxed mb-8 text-sm">
                      {language === 'bg' 
                        ? 'Благодарим ви за интереса към ClassFit. Вашият профил "Треньор" е създаден със статус на изчакване. Администратор ще се свърже с вас на посочения телефон за потвърждение.' 
                        : 'Thank you for your interest in ClassFit. Your Coach profile has been created with pending status. An administrator will contact you via phone for verification.'}
                  </p>
                  <button 
                    onClick={() => navigate('/')} 
                    className="px-8 py-3 border-2 border-white/10 rounded-full font-black uppercase tracking-widest text-white hover:border-brand hover:text-brand transition-all text-xs"
                  >
                      {language === 'bg' ? 'Обратно към начало' : 'Back to Home'}
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-[80vh] py-20 px-4 animate-in fade-in duration-500 relative flex justify-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-surface border border-white/10 text-brand rounded-2xl mb-4 shadow-xl">
             <Dumbbell size={20} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-white">
            {t.joinTeamTitle}
          </h1>
          <p className="text-slate-400 font-medium max-w-sm mx-auto italic text-xs">
            {t.joinTeamDesc}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface/50 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-2xl space-y-5">
          {status === 'error' && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide border border-red-500/20">
               <AlertCircle size={14} /> {errorMsg}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.nameSurname}</label>
                <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all text-white placeholder-slate-600"
                    placeholder="John Doe"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{language === 'bg' ? 'Специалност' : 'Specialty'}</label>
                <div className="relative">
                    <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                    type="text" 
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all text-white placeholder-slate-600"
                    placeholder="CrossFit..."
                    />
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.email}</label>
                <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all text-white placeholder-slate-600"
                    placeholder="coach@ex.com"
                    />
                </div>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.phone}</label>
                <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all text-white placeholder-slate-600"
                    placeholder="0888..."
                    />
                </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.password}</label>
            <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all text-white placeholder-slate-600"
                placeholder="••••••••"
                />
            </div>
          </div>

          <div className="pt-2">
            <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-brand text-dark py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-dark transition-all duration-300 shadow-xl shadow-brand/20 disabled:opacity-50"
            >
                {status === 'loading' ? 'Processing...' : (language === 'bg' ? 'Изпрати заявка' : 'Submit Application')}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-xs font-medium text-slate-400">
          {t.yesAccount} <Link to="/login" className="text-brand font-bold hover:text-white transition-colors">{t.loginHere}</Link>
        </p>
      </div>
    </div>
  );
};

export default TrainerSignUp;
