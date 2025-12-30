
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Navigation, User, FileText } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import Reveal from '../components/Reveal';

const Contact: React.FC = () => {
  const { language } = useAppContext();
  const t = TRANSLATIONS[language];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      {/* Header */}
      <div className="text-center mb-20">
         <Reveal>
            <div className="inline-flex items-center gap-2 text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-4">
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
                 ? 'Имате въпроси? Ние сме тук, за да помогнем. Попълнете формата или ни посетете на място.' 
                 : 'Have questions? We are here to help. Fill out the form or visit us on site.'}
            </p>
         </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
         {/* Info Column */}
         <div className="space-y-12">
            
            {/* Contact Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Reveal delay={300}>
                    <div className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/30 transition-all h-full">
                       <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                          <Phone size={24} />
                       </div>
                       <h3 className="text-lg font-black uppercase italic text-white mb-2">{t.phone}</h3>
                       <a href={`tel:${t.gymPhone}`} className="text-slate-400 hover:text-white transition-colors block mb-1 font-bold">{t.gymPhone}</a>
                    </div>
                </Reveal>
                
                <Reveal delay={400}>
                    <div className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/30 transition-all h-full">
                       <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                          <Mail size={24} />
                       </div>
                       <h3 className="text-lg font-black uppercase italic text-white mb-2">{t.email}</h3>
                       <a href="mailto:contact@classfit.bg" className="text-slate-400 hover:text-white transition-colors block mb-1 font-bold">contact@classfit.bg</a>
                    </div>
                </Reveal>

                <Reveal delay={500} className="sm:col-span-2">
                    <div className="p-8 bg-surface border border-white/5 rounded-[2rem] hover:border-brand/30 transition-all">
                       <div className="flex flex-col md:flex-row gap-8">
                           <div className="shrink-0">
                               <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                                  <Clock size={24} />
                               </div>
                               <h3 className="text-lg font-black uppercase italic text-white mb-2">{t.workingHours}</h3>
                           </div>
                           <div className="space-y-3 flex-grow">
                               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <span className="text-slate-500 text-xs font-black uppercase tracking-widest">{t.monFri}</span>
                                  <span className="text-white font-bold">07:00 - 22:00</span>
                               </div>
                               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <span className="text-slate-500 text-xs font-black uppercase tracking-widest">{t.satSun}</span>
                                  <span className="text-white font-bold">09:00 - 20:00</span>
                               </div>
                           </div>
                       </div>
                    </div>
                </Reveal>
            </div>

            {/* Map */}
            <Reveal delay={600} width="100%">
               <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] border-2 border-white/10 group">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2907.4878370938634!2d27.93608127653775!3d43.21980317112595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a4547285141e6b%3A0xc3b0922e92c10719!2z0LHRg9C7LiDigJ44LdC80Lgg0L_RgNC40LzQvtGA0YHQutC4INC_0L7Qu9C64oCcIDEyOCwgOTAwMyDQltC6LiDQm9C10LLRgdC60LgsINCS0LDRgNC90LA!5e0!3m2!1sbg!2sbg!4v1709210000000!5m2!1sbg!2sbg" 
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
                        <p className="text-[10px] text-slate-400">{t.stop}</p>
                     </div>
                  </div>
               </div>
            </Reveal>
         </div>

         {/* Form Column */}
         <Reveal delay={300}>
            <div className="bg-surface p-8 md:p-12 rounded-[3rem] border border-white/5 relative overflow-hidden">
               {isSubmitted ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark/50 backdrop-blur-sm z-20 p-8 text-center animate-in zoom-in">
                     <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl">
                        <CheckCircle size={40} />
                     </div>
                     <h2 className="text-3xl font-black uppercase italic text-white mb-2">{t.sendSuccess}</h2>
                     <button 
                        onClick={() => setIsSubmitted(false)}
                        className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all"
                     >
                        Send Another
                     </button>
                  </div>
               ) : null}

               <div className="mb-8">
                  <h2 className="text-3xl font-black uppercase italic text-white mb-2">{t.getInTouch}</h2>
                  <p className="text-slate-400 text-sm italic">{t.enterDetails}</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.name}</label>
                        <div className="relative">
                           <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                           <input 
                              type="text" 
                              required
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-2xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                              placeholder={t.yourName}
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
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-2xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                              placeholder="0888..."
                           />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.email}</label>
                     <div className="relative">
                        <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                           type="email" 
                           required
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                           className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-2xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white placeholder-slate-600"
                           placeholder="name@example.com"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.subject}</label>
                     <div className="relative">
                        <FileText size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select 
                           value={formData.subject}
                           onChange={e => setFormData({...formData, subject: e.target.value})}
                           className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-2xl pl-12 pr-5 py-4 font-bold outline-none transition-all text-white appearance-none cursor-pointer"
                        >
                           <option value="" disabled className="text-slate-600">{language === 'bg' ? 'Изберете тема...' : 'Select topic...'}</option>
                           <option value="training" className="bg-dark">{language === 'bg' ? 'Персонални тренировки' : 'Personal Training'}</option>
                           <option value="membership" className="bg-dark">{language === 'bg' ? 'Карти и цени' : 'Memberships & Pricing'}</option>
                           <option value="other" className="bg-dark">{language === 'bg' ? 'Друго' : 'Other'}</option>
                        </select>
                        <Navigation size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none rotate-90" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.message}</label>
                     <textarea 
                        required
                        rows={4}
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-dark/50 border border-white/5 focus:border-brand focus:bg-dark rounded-2xl px-5 py-4 font-medium outline-none transition-all text-white placeholder-slate-600 resize-none"
                        placeholder="..."
                     />
                  </div>

                  <button 
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full py-5 bg-brand text-dark rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-white hover:text-dark transition-all shadow-xl shadow-brand/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                  >
                     {isSubmitting ? 'Sending...' : t.sendMessage} <Send size={16} />
                  </button>
               </form>
            </div>
         </Reveal>
      </div>
    </div>
  );
};

export default Contact;
