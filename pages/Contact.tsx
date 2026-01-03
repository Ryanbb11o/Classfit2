
import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import Reveal from '../components/Reveal';

const Contact: React.FC = () => {
  const { language } = useAppContext();
  const t = TRANSLATIONS[language];

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      {/* Header */}
      <div className="text-center mb-20">
         <Reveal>
            <div className="inline-flex items-center gap-2 text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-4">
               <Mail size={12} /> {t.connect}
            </div>
         </Reveal>
         <Reveal delay={100}>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic mb-6 tracking-tighter leading-none text-white">
               {t.contact}
            </h1>
         </Reveal>
         <Reveal delay={200}>
            <p className="text-slate-400 font-medium max-w-xl mx-auto italic">
               {language === 'bg' 
                 ? 'Посетете ни на място за повече информация.' 
                 : 'Visit us on site for more information.'}
            </p>
         </Reveal>
      </div>

      <div className="flex flex-col gap-16 max-w-4xl mx-auto">
         {/* Contact Details Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal delay={300}>
                <div className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/30 transition-all h-full text-center">
                   <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <Phone size={24} />
                   </div>
                   <h3 className="text-lg font-black uppercase italic text-white mb-2">{t.phone}</h3>
                   <a href={`tel:${t.gymPhone}`} className="text-slate-400 hover:text-white transition-colors block mb-1 font-bold">{t.gymPhone}</a>
                </div>
            </Reveal>
            
            <Reveal delay={400}>
                <div className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/30 transition-all h-full text-center">
                   <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <Mail size={24} />
                   </div>
                   <h3 className="text-lg font-black uppercase italic text-white mb-2">{t.email}</h3>
                   <a href="mailto:contact@classfit.bg" className="text-slate-400 hover:text-white transition-colors block mb-1 font-bold">contact@classfit.bg</a>
                </div>
            </Reveal>

            <Reveal delay={500} className="md:col-span-2">
                <div className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/30 transition-all">
                   <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                       <div className="shrink-0 text-center md:text-left">
                           <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                              <Clock size={24} />
                           </div>
                           <h3 className="text-lg font-black uppercase italic text-white mb-2">{t.workingHours}</h3>
                       </div>
                       <div className="space-y-3 flex-grow w-full">
                           <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-slate-500 text-[11px] font-black uppercase tracking-widest">{t.monFri}</span>
                              <span className="text-white font-bold">07:00 - 22:00</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-slate-500 text-[11px] font-black uppercase tracking-widest">{t.satSun}</span>
                              <span className="text-white font-bold">09:00 - 20:00</span>
                           </div>
                       </div>
                   </div>
                </div>
            </Reveal>
         </div>

         {/* Map */}
         <Reveal delay={600} width="100%">
            <div className="relative rounded-[2.5rem] overflow-hidden h-[400px] border-2 border-white/10 group">
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2907.3815338165036!2d27.933827576537873!3d43.22203117112613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a4540a8775877f%3A0x629555c42022421!2z0YPQuy4g4oCe0KHRgtGD0LTQtdC90YLRgdC60LDigJwgMSwgOTA5MCDQktCw0YDQvdCw!5e0!3m2!1sbg!2sbg!4v1709210000000!5m2!1sbg!2sbg" 
                 width="100%" 
                 height="100%" 
                 style={{border:0, filter: 'grayscale(100%) invert(90%) contrast(80%)'}} 
                 allowFullScreen={true} 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
                 className="group-hover:grayscale-0 group-hover:invert-0 group-hover:contrast-100 transition-all duration-700"
               ></iframe>
               <div className="absolute bottom-4 left-4 right-4 bg-dark/90 backdrop-blur p-4 rounded-xl flex items-center gap-3 border border-white/10 pointer-events-none">
                  <MapPin size={20} className="text-brand shrink-0" />
                  <div>
                     <p className="text-xs font-bold text-white uppercase">{t.address}</p>
                     <p className="text-[11px] text-slate-400">{t.stop}</p>
                  </div>
               </div>
            </div>
         </Reveal>
      </div>
    </div>
  );
};

export default Contact;
