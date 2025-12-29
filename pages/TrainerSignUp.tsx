
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
        const success = await registerTrainer(name, email, password, phone, specialty);
        if (success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMsg(language === 'bg' ? 'Имейлът вече е регистриран.' : 'Email already in use.');
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
                  <div className="w-24 h-24 bg-brand text-dark rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand/20">
                      <CheckCircle size={48} />
                  </div>
                  <h1 className="text-4xl font-black uppercase italic text-white mb-6">
                      {language === 'bg' ? 'Заявката е приета' : 'Application Received'}
                  </h1>
                  <p className="text-slate-400 font-medium leading-relaxed mb-8">
                      {language === 'bg' 
                        ? 'Благодарим ви за интереса към ClassFit. Вашият профил "Треньор" е създаден със статус на изчакване. Администратор ще се свърже с вас на посочения телефон за потвърждение.' 
                        : 'Thank you for your interest in ClassFit. Your Coach profile has been created with pending status. An administrator will contact you via phone for verification.'}
                  </p>
                  <button 
                    onClick={() => navigate('/')} 
                    className="px-10 py-4 border-2 border-white/10 rounded-full font-black uppercase tracking-widest text-white hover:border-brand hover:text-brand transition-all"
                  >
                      {language === 'bg' ? 'Обратно към начало' : 'Back to Home'}
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-[80vh] py-20 px-4 animate-in fade-in duration-500 relative flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-surface border border-white/10 text-brand rounded-3xl mb-6 shadow-2xl">
             <Dumbbell size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-white">
            {language === 'bg' ? 'Стани част от екипа' : 'Join as a Trainer'}
          </h1>
          <p className="text-slate-400 font-medium max-w-md mx-auto italic">
            {language === 'bg' 
                ? 'Развивайте бизнеса си в ClassFit. Достъп до премиум база и нови клиенти.' 
                : 'Grow your business at ClassFit. Access premium facilities and new clients.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
          {status === 'error' && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide border border-red-500/20">
               <AlertCircle size={16} /> {errorMsg}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.nameSurname}</label>
                <div className="relative">
                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                    placeholder="John Doe"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{language === 'bg' ? 'Специалност' : 'Specialty'}</label>
                <div className="relative">
                    <Briefcase size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                    type="text" 
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                    placeholder="CrossFit, Yoga, Boxing..."
                    />
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.email}</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                    placeholder="coach@example.com"
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.phone}</label>
                <div className="relative">
                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                    placeholder="+359 888 888 888"
                    />
                </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.password}</label>
            <div className="relative">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                placeholder="••••••••"
                />
            </div>
          </div>

          <div className="pt-4">
            <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-brand text-dark py-5 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-dark transition-all duration-300 shadow-xl shadow-brand/20 disabled:opacity-50"
            >
                {status === 'loading' ? 'Processing...' : (language === 'bg' ? 'Изпрати заявка' : 'Submit Application')}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-400">
          {t.yesAccount} <Link to="/login" className="text-brand font-bold hover:text-white transition-colors">{t.loginHere}</Link>
        </p>
      </div>
    </div>
  );
};

export default TrainerSignUp;
