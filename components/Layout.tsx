
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck, User as UserIcon, Home, Info, Calendar, Dumbbell, ShoppingBag, LogIn, LogOut, Phone } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, isAdmin, currentUser, logout } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white font-sans selection:bg-brand selection:text-dark">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 bg-dark/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Far Left: Logo */}
          <NavLink to="/" className="flex items-center gap-3 shrink-0">
            <span className="text-2xl font-black tracking-tighter uppercase italic leading-none text-white">
              CLASS<span className="text-brand">FIT</span>
            </span>
          </NavLink>

          {/* Center Space */}
          <div className="flex-grow"></div>

          {/* Far Right: Auth + Menu */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 mr-4">
               {currentUser ? (
                 <div className="flex items-center gap-4">
                   <NavLink to="/profile" className="text-xs font-black uppercase tracking-widest hover:text-brand transition-all duration-200 flex items-center gap-2 text-white">
                     <UserIcon size={14} /> {currentUser.name}
                   </NavLink>
                 </div>
               ) : (
                 <div className="flex items-center gap-4">
                   <NavLink to="/login" className="text-xs font-black uppercase tracking-widest hover:text-brand transition-all duration-200 text-white">
                     {t.login}
                   </NavLink>
                   <NavLink to="/signup" className="px-5 py-2 bg-white text-dark rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand hover:text-dark transition-all duration-200">
                     {t.register}
                   </NavLink>
                 </div>
               )}
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block"></div>
            
            <LanguageSwitcher />

            {/* Hamburger Menu Icon */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-white hover:bg-white/10 rounded-full transition-all duration-200"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in Mobile/Sidebar Menu */}
      <div 
        className={`fixed inset-0 z-[60] bg-dark/80 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
      >
        <div 
          className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-surface shadow-2xl p-10 flex flex-col transition-transform duration-300 ease-out border-l border-white/5 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-16">
            <span className="text-xl font-black italic tracking-tighter text-white">{t.nav}</span>
            <button onClick={closeMenu} className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-8">
            <NavLink onClick={closeMenu} to="/" className="flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-white hover:text-brand transition-all duration-200">
              <Home size={24} /> {t.home}
            </NavLink>
            <NavLink onClick={closeMenu} to="/about" className="flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-white hover:text-brand transition-all duration-200">
              <Info size={24} /> {t.about}
            </NavLink>
            <NavLink onClick={closeMenu} to="/booking" className="flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-brand hover:scale-105 origin-left transition-all duration-200">
              <Calendar size={24} /> {t.booking}
            </NavLink>
            <NavLink onClick={closeMenu} to="/memberships" className="flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-white hover:text-brand transition-all duration-200">
              <Dumbbell size={24} /> {t.memberships}
            </NavLink>
            <NavLink onClick={closeMenu} to="/shop" className="flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-white hover:text-brand transition-all duration-200">
              <ShoppingBag size={24} /> {t.shop}
            </NavLink>
            
            <div className="h-px bg-white/10 my-4"></div>

            {/* Mobile Auth Links */}
            {currentUser ? (
              <>
                 <NavLink onClick={closeMenu} to="/profile" className="flex items-center gap-4 text-xl font-bold uppercase tracking-widest text-white hover:text-brand transition-all duration-200">
                   <UserIcon size={20}/> {t.myBookings}
                 </NavLink>
                 <button onClick={handleLogout} className="flex items-center gap-4 text-xl font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all duration-200 text-left">
                   <LogOut size={20}/> {t.logout}
                 </button>
              </>
            ) : (
               <>
                 <NavLink onClick={closeMenu} to="/login" className="flex items-center gap-4 text-xl font-bold uppercase tracking-widest text-white hover:text-brand transition-all duration-200">
                   <LogIn size={20}/> {t.login}
                 </NavLink>
                 <NavLink onClick={closeMenu} to="/signup" className="flex items-center gap-4 text-xl font-bold uppercase tracking-widest text-white hover:text-brand transition-all duration-200">
                   <UserIcon size={20}/> {t.register}
                 </NavLink>
               </>
            )}

            {isAdmin && (
               <NavLink onClick={closeMenu} to="/admin" className="flex items-center gap-4 text-xl font-bold uppercase tracking-widest text-red-500 mt-4">
                 <ShieldCheck size={20}/> {t.admin}
               </NavLink>
            )}
          </nav>

          <div className="mt-auto pt-10 border-t border-white/10">
             <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">{t.location}</p>
             </div>
             <p className="text-sm font-medium italic mb-2 text-white">{t.address}</p>
             <p className="text-xs text-slate-500">{t.stop}</p>
          </div>
        </div>
      </div>

      <main className="flex-grow pt-20">
        {children}
      </main>

      <footer className="bg-dark border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-black italic mb-6 tracking-tighter text-white">CLASS<span className="text-brand">FIT</span> VARNA</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-sm mx-auto md:mx-0 mb-6">
              {t.gymDesc}
            </p>
            <div className="flex flex-col gap-2">
                <a href={`tel:${t.gymPhone}`} className="text-brand font-black italic text-lg hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                    <Phone size={18} /> {t.gymPhone}
                </a>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-white/30">{t.connect}</h3>
            <div className="flex flex-col gap-3 text-sm text-slate-400 font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-brand transition-all duration-200">Instagram</a>
              <a href="#" className="hover:text-brand transition-all duration-200">Facebook</a>
              <a href="#" className="hover:text-brand transition-all duration-200">LinkedIn</a>
              <NavLink to="/trainer-signup" className="text-brand hover:text-white transition-all duration-200 mt-4 block">
                 Join Team (Trainers)
              </NavLink>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end justify-start">
             <p className="text-[10px] text-slate-600 mt-auto pt-10">{t.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
