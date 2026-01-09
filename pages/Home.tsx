
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Award, Users, Zap, CheckCircle, Navigation, Play } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import GoogleReviews from '../components/GoogleReviews';
import Reveal from '../components/Reveal';

const Home: React.FC = () => {
  const { language } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover grayscale opacity-60 scale-105"
            poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
          >
            <source src="https://videos.pexels.com/video-files/4761612/4761612-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-dark/40"></div>
          <div className="absolute inset-0 bg-dark/30 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center text-center pt-20">
            <Reveal>
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-brand px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10 hover:bg-white/20 transition-all cursor-default italic">
                <Zap size={14} className="text-brand fill-brand" /> {t.joinMovement}
              </div>
            </Reveal>
            
            <div className="mb-8 relative w-full max-w-full overflow-hidden flex flex-col items-center">
                <Reveal delay={100} direction="up">
                    <h1 className="text-[11vw] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-[1] sm:leading-[0.85] uppercase italic drop-shadow-2xl break-all sm:break-words max-w-[90vw]">
                        {t.transform}
                    </h1>
                </Reveal>
                <Reveal delay={300} direction="up">
                    <h1 className="text-[11vw] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-brand leading-[1] sm:leading-[0.85] uppercase italic drop-shadow-[0_0_30px_rgba(197,217,45,0.3)] break-all sm:break-words max-w-[90vw]">
                        {t.yourself}
                    </h1>
                </Reveal>
            </div>
            
            <Reveal delay={500}>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-12 font-medium max-w-2xl leading-relaxed italic mx-auto drop-shadow-md px-4">
                {t.motivation}
              </p>
            </Reveal>

            <Reveal delay={600}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 w-full sm:w-auto">
                <button 
                  onClick={() => navigate('/booking')}
                  className="w-full sm:w-auto px-10 py-5 bg-brand text-dark rounded-full font-black uppercase italic tracking-[0.2em] hover:bg-white hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group shadow-[0_0_40px_rgba(197,217,45,0.3)] text-xs sm:text-sm"
                >
                  {t.bookNow} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/memberships')}
                  className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase italic tracking-[0.2em] hover:bg-white hover:text-dark hover:border-white transition-all duration-300 text-xs sm:text-sm"
                >
                  {t.memberships}
                </button>
              </div>
            </Reveal>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden sm:block">
           <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white rounded-full"></div>
           </div>
        </div>
      </section>

      <div className="bg-brand border-y border-white/10 py-3 overflow-hidden relative z-20">
        <div className="flex whitespace-nowrap animate-scroll">
           {[...Array(10)].map((_, i) => (
              <span key={i} className="text-dark font-black italic uppercase tracking-[0.2em] text-[10px] mx-8 flex items-center gap-4">
                 CLASSFIT VARNA <span className="w-1.5 h-1.5 bg-dark rounded-full"></span> ELITE TRAINING <span className="w-1.5 h-1.5 bg-dark rounded-full"></span> NO EXCUSES <span className="w-1.5 h-1.5 bg-dark rounded-full"></span>
              </span>
           ))}
        </div>
      </div>

      <section className="py-24 bg-surface border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <Reveal delay={0}>
            <div className="group">
              <div className="w-14 h-14 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-dark transition-all duration-500">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-black uppercase italic mb-3 text-white tracking-tight">{t.location}</h3>
              <p className="text-slate-400 text-sm italic font-medium">{t.locationDesc}</p>
            </div>
          </Reveal>
          
          <Reveal delay={100}>
            <div className="group">
              <div className="w-14 h-14 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-dark transition-all duration-500">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-black uppercase italic mb-3 text-white tracking-tight">{language === 'bg' ? 'ЕКСПЕРТИЗА' : 'EXPERTISE'}</h3>
              <p className="text-slate-400 text-sm italic font-medium">
                {language === 'bg' ? 'Най-високо квалифицираните треньори в региона.' : 'Top tier qualified coaches in the region.'}
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="group">
              <div className="w-14 h-14 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-dark transition-all duration-500">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-black uppercase italic mb-3 text-white tracking-tight">{language === 'bg' ? 'ОБЩНОСТ' : 'COMMUNITY'}</h3>
              <p className="text-slate-400 text-sm italic font-medium">
                {language === 'bg' ? 'Присъединете се към семейството на ClassFit.' : 'Join the growing ClassFit family.'}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-surface rounded-[2.5rem] border border-white/10 p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl overflow-hidden">
            <div className="flex-1">
              <Reveal>
                <div className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-4 italic">{t.locationVarna}</div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic text-white mb-6 leading-none">
                  {language === 'bg' ? 'В СЪРЦЕТО НА' : 'IN THE HEART OF'} <span className="text-brand">ВАРНА</span>
                </h2>
                <p className="text-slate-400 font-medium italic mb-8 leading-relaxed text-sm">
                  {t.locationDesc}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white font-black uppercase italic tracking-widest text-[10px]">
                    <Navigation className="text-brand" size={16} /> {t.address}
                  </div>
                  <div className="flex items-center gap-4 text-white font-black uppercase italic tracking-widest text-[10px]">
                    <MapPin className="text-brand" size={16} /> {t.stop}
                  </div>
                </div>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-10 px-8 py-4 bg-white text-dark rounded-full font-black uppercase italic tracking-widest text-[10px] hover:bg-brand transition-colors shadow-lg"
                >
                  {t.viewOnGoogle} <ArrowRight size={14} />
                </a>
              </Reveal>
            </div>
            <div className="flex-1 w-full h-[300px] rounded-3xl overflow-hidden border-2 border-white/5 group">
              <img 
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      </section>

      <GoogleReviews />

      <section className="bg-surface py-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
           <Reveal>
             <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-10">{t.readyLevel}</h2>
           </Reveal>
           <Reveal delay={100}>
             <button 
               onClick={() => navigate('/memberships')}
               className="px-12 py-6 bg-brand text-dark rounded-full font-black uppercase italic tracking-[0.3em] hover:bg-white transition-all shadow-2xl text-xs"
             >
               {t.joinClassfit}
             </button>
           </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
