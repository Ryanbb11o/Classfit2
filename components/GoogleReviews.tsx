
import React from 'react';
import { Star, MapPin, ExternalLink } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getReviews, TRANSLATIONS } from '../constants';
import Reveal from './Reveal';

const GoogleReviews: React.FC = () => {
  const { language } = useAppContext();
  const t = TRANSLATIONS[language];
  const reviews = getReviews(language);

  // Link to a search for the gym in Varna
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=ClassFit+Varna+Levski+Mir";

  return (
    <section className="py-24 bg-dark border-y border-white/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                <div>
                    <Reveal>
                      <div className="inline-flex items-center gap-2 text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                          <Star size={12} className="fill-brand" /> {t.reviewsTitle}
                      </div>
                    </Reveal>
                    <Reveal delay={100}>
                      <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
                          {t.reviewsSubtitle}
                      </h2>
                    </Reveal>
                </div>

                <div className="flex flex-col items-start md:items-end">
                     <Reveal delay={200}>
                       <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                              {[1,2,3,4,5].map(i => (
                                  <Star key={i} size={20} className="text-brand fill-brand" />
                              ))}
                          </div>
                          <span className="text-2xl font-black text-white">5.0</span>
                       </div>
                       <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{t.googleRating} • {t.basedOn}</p>
                     </Reveal>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.map((review, idx) => (
                    <Reveal key={review.id} delay={idx * 150} className="h-full">
                        <div className="bg-surface p-8 rounded-[2rem] border border-white/5 hover:border-brand/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-brand text-dark flex items-center justify-center font-black text-sm">
                                    {review.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">{review.author}</h4>
                                    <p className="text-xs text-slate-400">{review.time}</p>
                                </div>
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                                    alt="Google" 
                                    className="w-5 h-5 ml-auto opacity-50 grayscale invert"
                                />
                            </div>
                            
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} size={14} className="text-brand fill-brand" />
                                ))}
                            </div>

                            <p className="text-slate-300 text-sm font-medium italic leading-relaxed mb-6 flex-grow">
                                "{review.text}"
                            </p>
                        </div>
                    </Reveal>
                ))}
            </div>

            <div className="mt-12 text-center">
                <Reveal delay={400}>
                  <a 
                      href={googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-surface border-2 border-white/5 rounded-full text-xs font-black uppercase tracking-widest text-white hover:border-brand hover:bg-brand hover:text-dark transition-all duration-300 shadow-sm hover:shadow-xl"
                  >
                      <MapPin size={16} /> {t.viewOnGoogle} <ExternalLink size={14} className="opacity-50" />
                  </a>
                </Reveal>
            </div>
        </div>
    </section>
  );
};

export default GoogleReviews;
