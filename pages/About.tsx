
import React from 'react';
import { Target, Heart, Zap } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import Reveal from '../components/Reveal';

const About: React.FC = () => {
  const { language } = useAppContext();
  const t = TRANSLATIONS[language];

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="max-w-4xl mb-32">
        <Reveal>
          <div className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-6 italic">{t.ourDna}</div>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="text-6xl md:text-8xl font-black uppercase italic mb-8 tracking-tighter leading-[0.9]">{t.weAre}</h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-xl md:text-2xl text-dark/70 font-medium leading-relaxed italic">
            {t.aboutDesc}
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
        <Reveal delay={0} className="h-full">
          <div className="p-10 bg-dark text-white rounded-[2.5rem] group hover:bg-brand hover:text-dark transition-all duration-500 h-full">
            <div className="w-14 h-14 bg-brand/20 text-brand rounded-2xl flex items-center justify-center mb-8 group-hover:bg-dark/10 group-hover:text-dark">
              <Target size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tight">{t.mission}</h3>
            <p className="opacity-60 group-hover:opacity-90 font-medium leading-relaxed italic">{t.missionDesc}</p>
          </div>
        </Reveal>

        <Reveal delay={150} className="h-full">
          <div className="p-10 bg-gray-50 rounded-[2.5rem] border-2 border-transparent hover:border-brand transition-all duration-500 h-full">
            <div className="w-14 h-14 bg-dark text-brand rounded-2xl flex items-center justify-center mb-8">
              <Heart size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tight text-dark">{t.values}</h3>
            <p className="text-dark/50 font-medium leading-relaxed italic">{t.valuesDesc}</p>
          </div>
        </Reveal>

        <Reveal delay={300} className="h-full">
          <div className="p-10 bg-brand text-dark rounded-[2.5rem] group hover:bg-dark hover:text-white transition-all duration-500 h-full">
            <div className="w-14 h-14 bg-dark text-brand rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand group-hover:text-dark">
              <Zap size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tight">{t.vision}</h3>
            <p className="opacity-80 font-medium leading-relaxed italic">{t.visionDesc}</p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={400} width="100%">
        <div className="relative group rounded-[4rem] overflow-hidden shadow-2xl border-4 border-dark">
           <div className="absolute inset-0 bg-brand/20 mix-blend-multiply opacity-0 group-hover:opacity-40 transition-quick z-10"></div>
           <img 
            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop" 
            alt="ClassFit Facility" 
            className="w-full h-[60vh] object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
           />
           <div className="absolute bottom-10 left-10 z-20">
               <div className="bg-brand text-dark px-8 py-4 rounded-full font-black uppercase italic tracking-widest text-lg shadow-xl">
                  {t.beLegendary}
               </div>
           </div>
        </div>
      </Reveal>
    </div>
  );
};

export default About;
