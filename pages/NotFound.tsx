
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Frown, MoveLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppContext();
  
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 text-center animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden bg-dark">
      {/* Decorative high-performance branding background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[140px] -z-10 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
      
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-brand/20 blur-[60px] rounded-full scale-150 opacity-20"></div>
        <Frown size={180} strokeWidth={1} className="text-brand/40 relative z-10 drop-shadow-[0_0_50px_rgba(197,217,45,0.4)]" />
      </div>

      <h2 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-[0.3em] mb-4 drop-shadow-lg">
        {language === 'bg' ? 'ИЗГЛЕЖДА СТЕ СЕ ЗАГУБИЛИ' : "LOOK LIKE YOU'RE LOST"}
      </h2>

      <div className="relative group mb-10">
        <h1 className="text-[14rem] md:text-[22rem] font-black italic leading-none tracking-tighter text-brand selection:bg-white selection:text-brand drop-shadow-[0_0_80px_rgba(197,217,45,0.5)] transition-transform group-hover:scale-[1.03] duration-700">
          404
        </h1>
        <div className="absolute bottom-10 left-0 w-full h-40 bg-gradient-to-t from-dark via-dark/40 to-transparent pointer-events-none"></div>
      </div>

      <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs md:text-sm mb-16 max-w-md mx-auto italic leading-relaxed opacity-60">
        {language === 'bg' 
          ? 'СТРАНИЦАТА, КОЯТО ТЪРСИТЕ, Е ИЗВЪН НАШИЯ ПЕРИМЕТЪР.' 
          : 'THE PAGE YOU ARE LOOKING FOR IS OUTSIDE OUR PERIMETER.'}
      </p>

      <button 
        onClick={() => navigate('/')}
        className="group relative flex items-center gap-6 px-16 py-6 bg-brand text-dark rounded-full font-black uppercase italic tracking-[0.3em] text-[11px] hover:bg-white transition-all shadow-[0_20px_60px_rgba(197,217,45,0.3)] active:scale-95"
      >
        <MoveLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
        {language === 'bg' ? 'КЪМ НАЧАЛОТО' : 'RETURN TO BASE'}
      </button>
    </div>
  );
};

export default NotFound;
