
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
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center text-center py-32">
            <Reveal>
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-brand px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-12 border border-white/10 hover:bg-white/20 transition-all cursor-default italic">
                <Zap size={14} className="text-brand fill-brand" /> {t.joinMovement}
              </div>
            </Reveal>
            
            <div className="mb-12 flex flex-col items-center">
                <Reveal delay={100} direction="up">
                    <h1 className="text-6xl md:text-7xl lg:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-none uppercase italic drop-shadow-2xl">
                        {t.transform}
                    </h1>
                </Reveal>
                <Reveal delay={300} direction="up">
                    <h1 className="text-6xl md:text-7xl lg:text-9xl font-black tracking-tight text-brand leading-none uppercase italic drop-shadow-[0_0_30px_rgba(197,217,45,0.3)]">
                        {t.yourself}
                    </h1>
                </Reveal>
            </div>
            
            <Reveal delay={500}>
              <p className="text-lg md:text-xl text-slate-300 mb-16 font-medium max-w-2xl leading-relaxed italic mx-auto drop-shadow-md px-4">
                {t.motivation}
              </p>
            </Reveal>

            <Reveal delay={600}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center px-4 w-full sm:w-auto">
                <button 
                  onClick={() => navigate('/booking')}
                  className="w-full sm:w-auto px-12 py-6 bg-brand text-dark rounded-full font-black uppercase italic tracking-[0.2em] hover:bg-white hover:scale-105 transition-all duration-300 flex items-center justify-center gap-4 group shadow-[0_0_40px_rgba(197,217,45,0.4)] text-sm"
                >
                  {t.bookNow} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/memberships')}
                  className="w-full sm:w-auto px-12 py-6 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase italic tracking-[0.2em] hover:bg-white hover:text-dark hover:border-white transition-all duration-300 text-sm"
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

      <div className="bg-brand border-y border-white/10 py-4 overflow-hidden relative z-20">
        <div className="flex whitespace-nowrap animate-scroll">
           {[...Array(10)].map((_, i) => (
              <span key={i} className="text-dark font-black italic uppercase tracking-[0.2em] text-[11px] mx-10 flex items-center gap-6">
                 CLASSFIT VARNA <span className="w-2 h-2 bg-dark rounded-full"></span> ELITE TRAINING <span className="w-2 h-2 bg-dark rounded-full"></span> NO EXCUSES <span className="w-2 h-2 bg-dark rounded-full"></span>
              </span>
           ))}
        </div>
      </div>

      <section className="py-32 bg-surface border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          <Reveal delay={0}>
            <div className="group p-8 rounded-[2rem] bg-dark/20 border border-white/5 hover:border-brand/40 transition-all duration-500">
              <div className="w-14 h-14 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-dark transition-all duration-500">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-3 text-white tracking-tight">{t.location}</h3>
              <p className="text-slate-400 text-sm italic font-medium leading-relaxed">{t.locationDesc}</p>
            </div>
          </Reveal>
          
          <Reveal delay={100}>
            <div className="group p-8 rounded-[2rem] bg-dark/20 border border-white/5 hover:border-brand/40 transition-all duration-500">
              <div className="w-14 h-14 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-dark transition-all duration-500">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-3 text-white tracking-tight">{language === 'bg' ? 'ЕКСПЕРТИЗА' : 'EXPERTISE'}</h3>
              <p className="text-slate-400 text-sm italic font-medium leading-relaxed">
                {language === 'bg' ? 'Най-високо квалифицираните треньори в региона.' : 'Top tier qualified coaches in the region.'}
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="group p-8 rounded-[2rem] bg-dark/20 border border-white/5 hover:border-brand/40 transition-all duration-500">
              <div className="w-14 h-14 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-dark transition-all duration-500">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-3 text-white tracking-tight">{language === 'bg' ? 'ОБЩНОСТ' : 'COMMUNITY'}</h3>
              <p className="text-slate-400 text-sm italic font-medium leading-relaxed">
                {language === 'bg' ? 'Присъединете се към семейството на ClassFit.' : 'Join the growing ClassFit family.'}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-32 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-surface rounded-[3rem] border border-white/10 p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="flex-1 relative z-10">
              <Reveal>
                <div className="text-brand font-black uppercase tracking-[0.4em] text-[11px] mb-6 italic">{t.locationVarna}</div>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-8 leading-tight tracking-tighter">
                  {language === 'bg' ? 'В СЪРЦЕТО НА' : 'IN THE HEART OF'} <span className="text-brand">ВАРНА</span>
                </h2>
                <p className="text-slate-400 font-medium italic mb-10 leading-relaxed text-base">
                  {t.locationDesc}
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-5 text-white font-black uppercase italic tracking-[0.2em] text-[11px]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand"><Navigation size={18} /></div> {t.address}
                  </div>
                  <div className="flex items-center gap-5 text-white font-black uppercase italic tracking-[0.2em] text-[11px]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand"><MapPin size={18} /></div> {t.stop}
                  </div>
                </div>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 mt-14 px-10 py-5 bg-white text-dark rounded-full font-black uppercase italic tracking-widest text-xs hover:bg-brand transition-all shadow-xl group/btn"
                >
                  {t.viewOnGoogle} <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </Reveal>
            </div>
            <div className="flex-1 w-full h-[450px] rounded-[2.5rem] overflow-hidden border border-white/5 group shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop" 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <GoogleReviews />

      <section className="bg-surface py-32 text-center relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
           <Reveal>
             <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white mb-12">{t.readyLevel}</h2>
           </Reveal>
           <Reveal delay={100}>
             <button 
               onClick={() => navigate('/memberships')}
               className="px-14 py-7 bg-brand text-dark rounded-full font-black uppercase italic tracking-[0.3em] hover:bg-white transition-all shadow-[0_20px_60px_rgba(197,217,45,0.3)] text-sm"
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
