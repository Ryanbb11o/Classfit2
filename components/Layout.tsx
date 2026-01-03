
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck, User as UserIcon, Home, Info, Calendar, Dumbbell, ShoppingBag, LogIn, LogOut, Phone, Briefcase, Bell, Mail, Star, MessageSquare, Check, Loader2, AlertTriangle, Wallet } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';
import { Booking } from '../types';

const ConfirmModal: React.FC = () => {
  const { confirmState, closeConfirm, language } = useAppContext();
  if (!confirmState) return null;

  const isDelete = confirmState.title?.toLowerCase().includes('delete') || 
                   confirmState.title?.toLowerCase().includes('reset') || 
                   confirmState.title?.toLowerCase().includes('cancel') ||
                   confirmState.title?.toLowerCase().includes('отказ') ||
                   confirmState.title?.toLowerCase().includes('изтрий');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-md animate-in fade-in duration-300 text-left">
       <div className="bg-surface rounded-[2.5rem] border border-white/10 p-10 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300 overflow-hidden">
          <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[80px] ${isDelete ? 'bg-red-500/20' : 'bg-brand/20'}`}></div>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl ${isDelete ? 'bg-red-500/10 text-red-500 shadow-red-500/10' : 'bg-brand/10 text-brand shadow-brand/10'}`}>
             {isDelete ? <AlertTriangle size={32} /> : <Check size={32} strokeWidth={3} />}
          </div>
          <h2 className="text-xl font-black uppercase italic text-white mb-2 tracking-tighter leading-none">
            {confirmState.title}
          </h2>
          <p className="text-slate-400 text-xs mb-10 leading-relaxed font-medium italic">
            {confirmState.message}
          </p>
          <div className="flex flex-col gap-3">
             <button 
                onClick={() => { confirmState.onConfirm(); closeConfirm(); }}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-lg active:scale-95 ${isDelete ? 'bg-red-500 text-white' : 'bg-brand text-dark'}`}
             >
                {confirmState.confirmText || (language === 'bg' ? 'Потвърди' : 'Confirm')}
             </button>
             <button onClick={closeConfirm} className="w-full py-4 bg-white/5 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[9px]">
                {confirmState.cancelText || (language === 'bg' ? 'Отказ' : 'Cancel')}
             </button>
          </div>
       </div>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, isAdmin, currentUser, logout, users, bookings } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isTrainer = currentUser?.roles?.includes('trainer') || false;
  
  // High-Priority Notification logic
  const pendingApplications = isAdmin ? users.filter(u => u.roles?.includes('trainer_pending')) : [];
  const awaitingPayment = isAdmin ? bookings.filter(b => b.status === 'trainer_completed') : [];
  const pendingBookings = isTrainer ? bookings.filter(b => b.trainerId === currentUser?.id && b.status === 'pending') : [];

  const totalNotifications = pendingApplications.length + awaitingPayment.length + pendingBookings.length;

  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); closeMenu(); };

  const handleNotificationClick = (type: 'application' | 'payment' | 'booking') => {
    setShowNotifications(false);
    if (type === 'payment') navigate('/admin', { state: { activeTab: 'finance' } });
    else if (type === 'application') navigate('/admin', { state: { activeTab: 'applications' } });
    else if (type === 'booking') navigate('/trainer', { state: { activeTab: 'requests' } });
  };

  const getDisplayName = (name: string) => name.split('(')[0].trim();

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white font-sans selection:bg-brand selection:text-dark">
      <header className="fixed top-0 left-0 right-0 bg-dark/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 shrink-0">
            <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic leading-none text-white">
              CLASS<span className="text-brand">FIT</span>
            </span>
          </NavLink>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-6">
               {currentUser ? (
                 <div className="flex items-center gap-4">
                   {isAdmin && <NavLink to="/admin" className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2"><ShieldCheck size={14} /> {t.admin}</NavLink>}
                   {isTrainer && <NavLink to="/trainer" className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><Briefcase size={14} /> Trainer</NavLink>}
                   <NavLink to="/profile" className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><UserIcon size={14} /> {getDisplayName(currentUser.name)}</NavLink>
                 </div>
               ) : (
                 <div className="flex items-center gap-6">
                   <NavLink to="/login" className="text-xs font-black uppercase tracking-widest text-white">{t.login}</NavLink>
                   <NavLink to="/signup" className="px-5 py-2 bg-white text-dark rounded-full text-xs font-black uppercase tracking-widest">{t.register}</NavLink>
                 </div>
               )}
            </div>

            <div className="shrink-0 scale-90 sm:scale-100"><LanguageSwitcher /></div>

            {currentUser && (
                 <div className="relative flex items-center" ref={notifRef}>
                    <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-full transition-all ${showNotifications ? 'bg-white text-dark' : 'text-slate-300 hover:text-white'}`}>
                      <Bell size={18} />
                      {totalNotifications > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-dark animate-pulse"></span>}
                    </button>

                    {showNotifications && (
                      <div className="absolute top-full right-0 mt-4 w-72 sm:w-80 bg-surface rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-[70] text-left">
                         <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Alert Center</span>
                            <span className="bg-brand text-dark text-[10px] font-black px-2 py-0.5 rounded italic">{totalNotifications}</span>
                         </div>
                         <div className="max-h-[300px] overflow-y-auto">
                            {totalNotifications === 0 ? <div className="p-10 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic">No New Activity</div> : (
                              <>
                                {awaitingPayment.map(b => (
                                  <div key={b.id} onClick={() => handleNotificationClick('payment')} className="p-4 border-b border-white/5 hover:bg-brand/5 cursor-pointer bg-brand/5">
                                     <div className="flex items-start gap-3">
                                       <div className="p-2 bg-brand text-dark rounded-xl shrink-0"><Wallet size={14} /></div>
                                       <div>
                                          <p className="text-[10px] font-black uppercase text-white tracking-tight">Payment Verification Required</p>
                                          <p className="text-[9px] text-slate-400 italic mt-1">{getDisplayName(b.customerName)}'s session with {getDisplayName(users.find(u => u.id === b.trainerId)?.name || 'Coach')} finished.</p>
                                       </div>
                                    </div>
                                  </div>
                                ))}
                                {pendingApplications.map(u => (
                                  <div key={u.id} onClick={() => handleNotificationClick('application')} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer">
                                    <div className="flex items-start gap-3">
                                       <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl shrink-0"><UserIcon size={14} /></div>
                                       <div>
                                          <p className="text-[10px] font-black uppercase text-white tracking-tight">New Coach Application</p>
                                          <p className="text-[9px] text-yellow-500 italic mt-1">{getDisplayName(u.name)} is waiting for review.</p>
                                       </div>
                                    </div>
                                  </div>
                                ))}
                                {pendingBookings.map(b => (
                                  <div key={b.id} onClick={() => handleNotificationClick('booking')} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer">
                                    <div className="flex items-start gap-3">
                                       <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl shrink-0"><Calendar size={14} /></div>
                                       <div>
                                          <p className="text-[10px] font-black uppercase text-white tracking-tight">New Training Request</p>
                                          <p className="text-[9px] text-slate-400 italic mt-1">{b.customerName} @ {b.date} {b.time}</p>
                                       </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                         </div>
                      </div>
                    )}
                 </div>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white hover:bg-white/10 rounded-full transition-all relative">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[60] bg-dark/80 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeMenu}>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-surface shadow-2xl p-10 flex flex-col transition-transform duration-300 ease-out border-l border-white/5 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-16">
            <span className="text-xl font-black italic tracking-tighter text-white uppercase">Navigation</span>
            <button onClick={closeMenu} className="p-2 hover:bg-white/10 rounded-full transition-all text-white"><X size={24} /></button>
          </div>
          <nav className="flex flex-col gap-8 text-left">
            <NavLink onClick={closeMenu} to="/" className="text-2xl font-black italic uppercase tracking-tighter text-white">Home</NavLink>
            <NavLink onClick={closeMenu} to="/booking" className="text-2xl font-black italic uppercase tracking-tighter text-brand">Booking</NavLink>
            <NavLink onClick={closeMenu} to="/memberships" className="text-2xl font-black italic uppercase tracking-tighter text-white">Memberships</NavLink>
            <NavLink onClick={closeMenu} to="/shop" className="text-2xl font-black italic uppercase tracking-tighter text-white">Shop</NavLink>
            <NavLink onClick={closeMenu} to="/contact" className="text-2xl font-black italic uppercase tracking-tighter text-white">Contact</NavLink>
            <div className="h-px bg-white/10 my-4"></div>
            {currentUser ? (
              <button onClick={handleLogout} className="text-xl font-bold uppercase tracking-widest text-slate-500 text-left">Logout</button>
            ) : (
              <NavLink onClick={closeMenu} to="/login" className="text-xl font-bold uppercase tracking-widest text-white">Login</NavLink>
            )}
          </nav>
        </div>
      </div>

      <main className="flex-grow pt-20">{children}</main>

      <footer className="bg-dark border-t border-white/5 py-16 text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-black italic mb-6 tracking-tighter text-white uppercase">CLASSFIT VARNA</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-sm italic">{t.gymDesc}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-white/30">Career</h3>
            <NavLink to="/trainer-signup" className="text-brand font-black uppercase tracking-widest text-xs italic">Join Professional Team</NavLink>
          </div>
          <div className="flex flex-col items-end justify-start text-[9px] font-black uppercase tracking-widest text-slate-700">© 2024 ClassFit Varna</div>
        </div>
      </footer>
      <ConfirmModal />
    </div>
  );
};

export default Layout;
