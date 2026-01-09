
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Frown, ArrowLeft, MoveLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppContext();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 text-center animate-in fade-in zoom-in-95 duration-700">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] -z-10"></div>
      
      <div className="relative mb-8">
        <Frown size={120} strokeWidth={1} className="text-white opacity-20 absolute -top-10 -left-10 -rotate-12 animate-pulse" />
        <Frown size={160} strokeWidth={1.5} className="text-brand/40 drop-shadow-[0_0_30px_rgba(197,217,45,0.2)]" />
      </div>

      <h2 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-widest mb-4">
        {language === 'bg' ? 'ИЗГЛЕЖДА СТЕ СЕ ЗАГУБИЛИ' : "LOOK LIKE YOU'RE LOST"}
      </h2>

      <div className="relative group">
        <h1 className="text-[12rem] md:text-[20rem] font-black italic leading-none tracking-tighter text-brand selection:bg-white selection:text-brand drop-shadow-[0_0_50px_rgba(197,217,45,0.3)] transition-transform group-hover:scale-105 duration-500">
          404
        </h1>
        <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent pointer-events-none"></div>
      </div>

      <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs md:text-sm mb-12 max-w-md mx-auto italic">
        {language === 'bg' 
          ? 'СТРАНИЦАТА, КОЯТО ТЪРСИТЕ, НЕ СЪЩЕСТВУВА В НАШАТА СИСТЕМА.' 
          : 'THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST IN OUR SYSTEM.'}
      </p>

      <button 
        onClick={() => navigate(-1)}
        className="group relative flex items-center gap-4 px-12 py-5 bg-white text-dark rounded-full font-black uppercase italic tracking-[0.2em] text-xs hover:bg-brand transition-all shadow-2xl active:scale-95"
      >
        <MoveLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
        {language === 'bg' ? 'НАЗАД' : 'GO BACK'}
      </button>
    </div>
  );
};

export default NotFound;
