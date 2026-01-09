
import React, { useState } from 'react';
import { ShoppingBag, Plus, ShoppingCart, X, Info, CreditCard, Banknote } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { getProducts, TRANSLATIONS } from '../constants';
import { Product } from '../types';

const Shop: React.FC = () => {
  const { language } = useAppContext();
  const t = TRANSLATIONS[language];
  const products = getProducts(language);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(t.catAll);

  const categories = [t.catAll, t.catPrograms, t.catSupplements, t.catGear];
  const filteredProducts = activeCategory === t.catAll 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
        <div>
          <div className="inline-flex items-center gap-2 text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-4">
            <ShoppingCart size={12} /> {t.store}
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic mb-4 tracking-tight leading-none text-white">{t.shop}</h1>
          <p className="text-slate-400 font-medium max-w-md italic">{t.premiumProducts}</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map((cat, idx) => (
            <button 
                key={idx} 
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-quick whitespace-nowrap ${activeCategory === cat ? 'bg-brand text-dark' : 'bg-surface text-slate-400 hover:bg-white/10 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="group cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-surface mb-6 border-2 border-white/5 group-hover:border-brand transition-all duration-500">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
              <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-quick flex items-center justify-center">
                  <div className="w-16 h-16 bg-brand text-dark rounded-full flex items-center justify-center shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 hover:scale-110 active:scale-90">
                    <Plus size={28} strokeWidth={3} />
                  </div>
              </div>
              <div className="absolute top-4 left-4">
                  <span className="bg-dark/90 backdrop-blur px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white border border-white/10">
                    {product.category}
                  </span>
              </div>
            </div>
            <div className="px-2">
                <h3 className="font-black uppercase italic text-lg text-white group-hover:text-brand transition-quick">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-black italic text-white">{product.price.toFixed(2)} <span className="text-xs font-bold text-slate-500">€</span></span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-md animate-in fade-in duration-300">
              <div className="relative bg-surface rounded-[3rem] overflow-hidden max-w-4xl w-full shadow-2xl border border-white/10 flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                  {/* Close Button */}
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-6 right-6 z-20 w-10 h-10 bg-dark/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-brand hover:text-dark transition-all"
                  >
                    <X size={20} />
                  </button>

                  {/* Product Image */}
                  <div className="md:w-1/2 bg-dark">
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name} 
                        className="w-full h-full object-cover grayscale-0 md:grayscale-0"
                      />
                  </div>

                  {/* Product Details */}
                  <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                      <div className="mb-8">
                        <span className="inline-block px-4 py-1.5 bg-brand/10 text-brand text-[11px] font-black uppercase tracking-widest rounded-lg mb-4">
                            {selectedProduct.category}
                        </span>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none mb-4">
                            {selectedProduct.name}
                        </h2>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-4xl font-black italic text-brand">{selectedProduct.price.toFixed(2)}</span>
                            <span className="text-sm font-bold text-slate-500 uppercase">€</span>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-4 mb-8">
                            <Info size={20} className="text-brand shrink-0 mt-1" />
                            <p className="text-slate-300 font-medium italic leading-relaxed text-sm">
                                {selectedProduct.description}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-6 py-4 bg-brand rounded-2xl text-dark font-black uppercase italic tracking-widest text-[11px] shadow-xl shadow-brand/10">
                                <Banknote size={20} />
                                {t.ableToPayAtDesk}
                            </div>
                            <p className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                {language === 'bg' ? 'ЗАПИТАЙТЕ НА РЕЦЕПЦИЯ' : 'ASK AT RECEPTION'}
                            </p>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Shop;
