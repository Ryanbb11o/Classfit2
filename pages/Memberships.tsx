
import React from 'react';
import { Check, Shield } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getMemberships, TRANSLATIONS } from '../constants';

const Memberships: React.FC = () => {
  const { language } = useAppContext();
  const t = TRANSLATIONS[language];
  const memberships = getMemberships(language);

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center mb-24">
        <div className="inline-block p-3 bg-brand/10 rounded-3xl mb-6">
            <Shield size={32} className="text-brand fill-brand/20" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase italic mb-4 tracking-tighter leading-none text-white">{t.memberships}</h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] max-w-xl mx-auto">{t.choosePower}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {memberships.map((tier) => (
          <div 
            key={tier.id}
            className={`relative p-12 rounded-[3rem] border-2 transition-all duration-500 flex flex-col ${
              tier.isPopular ? 'border-brand bg-surface text-white shadow-2xl shadow-brand/10 scale-105 z-10' : 'border-white/5 bg-surface text-white hover:border-brand/40'
            }`}
          >
            {tier.isPopular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand text-dark px-6 py-1.5 rounded-full text-[11px] font-black tracking-[0.3em] uppercase italic">
                {t.mostPopular}
              </span>
            )}
            
            <h3 className={`text-3xl font-black uppercase italic mb-6 tracking-tight ${tier.isPopular ? 'text-brand' : 'text-white'}`}>{tier.name}</h3>
            <div className="mb-10">
              <span className="text-5xl font-black italic">{tier.price}</span>
              <span className="text-sm font-bold opacity-40 ml-2 italic text-slate-300">€ / {tier.unit}</span>
            </div>

            <ul className="space-y-5 mb-12 flex-grow">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-bold uppercase tracking-wide text-slate-300">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${tier.isPopular ? 'bg-brand text-dark' : 'bg-brand/10 text-brand'}`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-[0.2em] text-center border-2 cursor-default ${
              tier.isPopular 
                ? 'bg-brand text-dark border-brand' 
                : 'bg-transparent text-slate-400 border-white/5'
            }`}>
              {t.payAtDesk}
            </div>
            
            <button className={`w-full mt-5 text-[11px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-quick text-white`}>
              {t.learnMore}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Memberships;
