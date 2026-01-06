
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
      {/* CSS for Marquee Animation */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>

      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover grayscale opacity-60 scale-105"
            poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
          >
            {/* High quality gym atmosphere video */}
            <source src="https://videos.pexels.com/video-files/3209211/3209211-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-dark/40"></div>
          <div className="absolute inset-0 bg-dark/20 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center pt-20">
            <Reveal>
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-brand px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10 hover:bg-white/20 transition-all cursor-default">
                <Zap size={14} className="text-brand fill-brand" /> {t.joinMovement}
              </div>
            </Reveal>
            
            <div className="mb-8 relative">
                <Reveal delay={100} direction="up">
                    <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-[0.85] uppercase italic drop-shadow-2xl">
                        {t.transform}
                    </h1>
                </Reveal>
                <Reveal delay={300} direction="up">
                    <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-black tracking-tighter text-brand leading-[0.85] uppercase italic drop-shadow-[0_0_30px_rgba(197,217,45,0.3)]">
                        {t.yourself}
                    </h1>
                </Reveal>
            </div>
            
            <Reveal delay={500}>
              <p className="text-lg md:text-2xl text-slate-300 mb-12 font-medium max-w-2xl leading-relaxed italic mx-auto drop-shadow-md">
                {t.motivation}
              </p>
            </Reveal>

            <Reveal delay={600}>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <button 
                  onClick={() => navigate('/booking')}
                  className="px-12 py-6 bg-brand text-dark rounded-full font-black uppercase italic tracking-[0.2em] hover:bg-white hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group shadow-[0_0_40px_rgba(197,217,45,0.3)]"
                >
                  {t.bookNow} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/memberships')}
                  className="px-12 py-6 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase italic tracking-[0.2em] hover:bg-white hover:text-dark hover:border-white transition-all duration-300"
                >
                  {t.memberships}
                </button>
              </div>
            </Reveal>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
           <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white rounded-full"></div>
           </div>
        </div>
      </section>

      {/* Infinite Marquee Bar */}
      <div className="bg-brand border-y border-white/10 py-3 overflow-hidden relative z-20">
        <div className="flex whitespace-nowrap animate-scroll">
           {[...Array(10)].map((_, i) => (
              <span key={i} className="text-dark font-black italic uppercase tracking-[0.2em] text-sm mx-8 flex items-center gap-4">
                 CLASSFIT VARNA <span className="w-2 h-2 bg-dark rounded-full"></span> ELITE TRAINING <span className="w-2 h-2 bg-dark rounded-full"></span> NO EXCUSES <span className="w-2 h-2 bg-dark rounded-full"></span>
              </span>
           ))}
        </div>
      </div>

      {/* Highlights Grid */}
      <section className="py-32 bg-surface border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          <Reveal delay={0} className="h-full">
            <div className="group h-full">
              <div className="w-16 h-16 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand group-hover:text-dark transition-all duration-500 transform group-hover:-translate-y-2">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-4 tracking-tight text-white">{t.location}</h3>
              <p className="text-slate-400 font-medium leading-relaxed italic">{t.locationDesc}</p>
            </div>
          </Reveal>
          
          <Reveal delay={100} className="h-full">
            <div className="group h-full">
              <div className="w-16 h-16 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand group-hover:text-dark transition-all duration-500 transform group-hover:-translate-y-2">
                <Award size={28} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-4 tracking-tight text-white">{t.expertise}</h3>
              <p className="text-slate-400 font-medium leading-relaxed italic">{t.expertiseDesc}</p>
            </div>
          </Reveal>

          <Reveal delay={200} className="h-full">
            <div className="group h-full">
              <div className="w-16 h-16 bg-white/5 text-brand rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand group-hover:text-dark transition-all duration-500 transform group-hover:-translate-y-2">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-4 tracking-tight text-white">{t.community}</h3>
              <p className="text-slate-400 font-medium leading-relaxed italic">{t.communityDesc}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Location specific section - Varna LevskiPrimorski */}
      <section className="py-32 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-surface rounded-[3rem] border border-white/10 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative shadow-2xl">
            <div className="flex-1 relative z-10">
              <Reveal>
                <div className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-4 italic">Локация Варна</div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic text-white mb-6 leading-none">
                  В СЪРЦЕТО НА <span className="text-brand">ВАРНА</span>
                </h2>
                <p className="text-slate-400 font-medium italic mb-8 leading-relaxed">
                  Намираме се в <span className="text-white font-bold">ЛевскиПриморски, ул. „Студентска“ 1 а</span>. Лесен достъп с автомобил и градски транспорт в една от най-комуникативните точки на града.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white font-black uppercase italic tracking-widest text-[11px]">
                    <Navigation className="text-brand" size={20} /> ул. „Студентска“ 1А
                  </div>
                  <div className="flex items-center gap-4 text-white font-black uppercase italic tracking-widest text-[11px]">
                    <MapPin className="text-brand" size={20} /> Варна, 9010
                  </div>
                </div>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Studentska+1A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-10 px-8 py-4 bg-white text-dark rounded-full font-black uppercase italic tracking-widest text-[11px] hover:bg-brand transition-colors shadow-lg"
                >
                  Отвори в Google Maps <ArrowRight size={14} />
                </a>
              </Reveal>
            </div>
            <div className="flex-1 w-full h-[400px] rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border-2 border-white/5 relative group">
              <img 
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop" 
                alt="Gym Interior" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-dark/40 group-hover:bg-transparent transition-colors"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Motivational Accent Section */}
      <section className="py-40 bg-dark overflow-hidden relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <Reveal>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight text-white" style={{ whiteSpace: 'pre-line' }}>
                {t.pushBoundaries}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-lg text-slate-400 font-medium italic leading-relaxed">
                {t.pushDesc}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="grid grid-cols-2 gap-6">
                {t.features.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
                     <CheckCircle size={16} className="text-brand" /> {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <div className="flex-1 relative w-full">
             <Reveal delay={300} width="100%">
               <div className="aspect-square bg-brand rounded-full absolute -top-10 -left-10 w-2/3 h-2/3 blur-[120px] opacity-10 pointer-events-none"></div>
               <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white/5 group">
                  <img 
                    src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop" 
                    alt="Focus" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark/20">
                     <div className="w-20 h-20 bg-brand text-dark rounded-full flex items-center justify-center">
                        <Play size={30} fill="currentColor" className="ml-1"/>
                     </div>
                  </div>
               </div>
             </Reveal>
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <GoogleReviews />

      {/* CTA Section */}
      <section className="bg-surface py-32 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
           <Reveal>
             <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white mb-10">{t.readyLevel}</h2>
           </Reveal>
           <Reveal delay={100}>
             <button 
               onClick={() => navigate('/memberships')}
               className="px-16 py-6 bg-brand text-dark rounded-full font-black uppercase italic tracking-[0.3em] hover:bg-white transition-all duration-300 shadow-2xl shadow-brand/20 hover:scale-105"
             >
               {t.joinClassfit}
             </button>
           </Reveal>
        </div>
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C5D92D_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
      </section>
    </div>
  );
};

export default Home;
