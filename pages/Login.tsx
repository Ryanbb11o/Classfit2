
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';

const Login: React.FC = () => {
  const { login, language } = useAppContext();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Fixed: Made handleSubmit asynchronous and added await for the login function to correctly handle its Promise<boolean> return value.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/booking'); // Redirect to booking or profile
    } else {
      setError(t.invalidCreds);
    }
  };

  const handleHardReset = () => {
    if (window.confirm('Reset App? This will delete all accounts and bookings on this device.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in duration-500 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-2xl mb-6 shadow-xl shadow-brand/20">
             <LogIn size={28} className="text-dark" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2 text-white">{t.login}</h1>
          <p className="text-slate-400 font-medium text-sm">{t.welcomeBack}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface p-10 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/50 space-y-6">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide border border-red-500/20">
               <AlertCircle size={16} /> {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.email}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl px-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
              placeholder="name@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.password}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark/50 border-2 border-transparent focus:border-brand focus:bg-dark rounded-xl px-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand text-dark py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-dark transition-all duration-300 shadow-xl"
          >
            {t.loginBtn}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-400">
          {t.noAccount} <Link to="/signup" className="text-brand font-bold hover:text-white transition-colors">{t.registerHere}</Link>
        </p>

        {/* Developer Tool: Hard Reset */}
        <div className="mt-12 text-center">
            <button 
              onClick={handleHardReset}
              className="text-[10px] uppercase font-black tracking-widest text-slate-600 hover:text-red-500 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={12} /> Reset App Data (Dev)
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
