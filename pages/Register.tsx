
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';

const Register: React.FC = () => {
  const { register, language } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      navigate('/booking'); // Auto login and redirect
    } else {
      setError(t.emailTaken);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in duration-500 relative">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand text-dark rounded-xl mb-4 shadow-xl shadow-brand/20">
             <UserPlus size={20} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-1 text-white">{t.register}</h1>
          <p className="text-slate-400 font-medium text-xs">{t.startTrans}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface/50 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-2xl space-y-5">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide border border-red-500/20">
               <AlertCircle size={14} /> {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.nameSurname}</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-white placeholder-slate-600"
              placeholder="Ivan Petrov"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.email}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-white placeholder-slate-600"
              placeholder="name@example.com"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.password}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-white placeholder-slate-600"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand text-dark py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-dark transition-all duration-300 shadow-lg mt-2"
          >
            {t.createAccount}
          </button>
        </form>

        <p className="text-center mt-6 text-xs font-medium text-slate-400">
          {t.yesAccount} <Link to="/login" className="text-brand font-bold hover:text-white transition-colors">{t.loginHere}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
