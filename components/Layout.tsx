
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck, User as UserIcon, Home, Info, Calendar, Dumbbell, ShoppingBag, LogIn, LogOut, Phone, Briefcase, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, isAdmin, currentUser, logout, users, bookings } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  // Close notifications if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Notification Logic ---
  const isTrainer = currentUser?.role === 'trainer';
  
  // Get pending trainer applications (Admin only)
  const pendingApplications = isAdmin ? users.filter(u => u.role === 'trainer_pending') : [];
  
  // Get pending bookings (Admin sees all pending, Trainer sees only theirs)
  const pendingBookings = isAdmin 
    ? bookings.filter(b => b.status === 'pending')
    : isTrainer 
      ? bookings.filter(b => b.trainerId === currentUser?.id && b.status === 'pending')
      : [];
  
  const totalNotifications = pendingApplications.length + pendingBookings.length;

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  const handleNotificationClick = (type: 'application' | 'booking') => {
    setShowNotifications(false);
    if (isAdmin) {
      navigate('/admin');
    } else if (isTrainer) {
      navigate('/trainer');
    }
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
            
            {/* Desktop Auth Links + Language */}
            <div className="hidden md:flex items-center gap-6">
               {currentUser ? (
                 <div className="flex items-center gap-4">
                   {isAdmin && (
                     <NavLink 
                       to="/admin" 
                       className="text-xs font-black uppercase tracking-widest hover:text-brand transition-all duration-200 flex items-center gap-2 text-white relative"
                     >
                       <ShieldCheck size={14} /> {t.admin}
                     </NavLink>
                   )}
                   {isTrainer && (
                     <NavLink 
                       to="/trainer" 
                       className="text-xs font-black uppercase tracking-widest hover:text-brand transition-all duration-200 flex items-center gap-2 text-white relative"
                     >
                       <Briefcase size={14} /> Trainer
                     </NavLink>
                   )}
                   <NavLink to="/profile" className="text-xs font-black uppercase tracking-widest hover:text-brand transition-all duration-200 flex items-center gap-2 text-white">
                     <UserIcon size={14} /> {currentUser.name}
                   </NavLink>
                 </div>
               ) : (
                 <div className="flex items-center gap-6">
                   <NavLink to="/login" className="text-xs font-black uppercase tracking-widest hover:text-brand transition-all duration-200 text-white">
                     {t.login}
                   </NavLink>
                   <NavLink to="/signup" className="px-5 py-2 bg-white text-dark rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand hover:text-dark transition-all duration-200">
                     {t.register}
                   </NavLink>
                 </div>
               )}
               
               <div className="h-6 w-px bg-white/10"></div>
               <LanguageSwitcher />
            </div>

            {/* NOTIFICATIONS (Admin + Trainer) - Visible on Mobile & Desktop */}
            {(isAdmin || isTrainer) && (
                 <div className="relative flex items-center" ref={notifRef}>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`relative p-2 rounded-full transition-all duration-200 ${showNotifications ? 'bg-white text-dark' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                    >
                      <Bell size={18} />
                      {totalNotifications > 0 && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-dark animate-pulse"></span>
                      )}
                    </button>

                    {/* Dropdown */}
                    {showNotifications && (
                      <div className="absolute top-full right-0 mt-4 w-80 bg-surface rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[70]">
                         <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</span>
                            <span className="bg-brand text-dark text-[10px] font-bold px-1.5 py-0.5 rounded">{totalNotifications}</span>
                         </div>
                         <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {totalNotifications === 0 ? (
                               <div className="p-8 text-center text-slate-500 text-xs font-medium italic">
                                  All caught up! No new activity.
                               </div>
                            ) : (
                              <>
                                {/* Trainer Applications (Admin Only) */}
                                {pendingApplications.map(u => (
                                  <div 
                                    key={u.id}
                                    onClick={() => handleNotificationClick('application')}
                                    className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                                  >
                                    <div className="flex items-start gap-3">
                                       <div className="p-2 bg-brand/10 text-brand rounded-full shrink-0 group-hover:bg-brand group-hover:text-dark transition-colors">
                                          <Briefcase size={14} />
                                       </div>
                                       <div>
                                          <p className="text-xs font-bold text-white mb-1">New Trainer Application</p>
                                          <p className="text-[10px] text-brand font-black uppercase italic tracking-wider">({u.name})</p>
                                          <p className="text-[9px] text-slate-500 mt-1">{new Date(u.joinedDate).toLocaleDateString()}</p>
                                       </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Bookings */}
                                {pendingBookings.map(b => (
                                  <div 
                                    key={b.id}
                                    onClick={() => handleNotificationClick('booking')}
                                    className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                                  >
                                    <div className="flex items-start gap-3">
                                       <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                          <Calendar size={14} />
                                       </div>
                                       <div>
                                          <p className="text-xs font-bold text-white mb-1">New Booking Request</p>
                                          <p className="text-[10px] text-slate-300 uppercase italic">{b.customerName}</p>
                                          <p className="text-[9px] text-slate-500 mt-1">{b.date} @ {b.time}</p>
                                       </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                         </div>
                         <div className="p-3 bg-dark/50 text-center border-t border-white/5">
                            <button 
                              onClick={() => handleNotificationClick('application')}
                              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                              View Panel
                            </button>
                         </div>
                      </div>
                    )}
                 </div>
               )}

            {/* Hamburger Menu Icon */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-white hover:bg-white/10 rounded-full transition-all duration-200 relative"
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
                 {isTrainer && (
                   <NavLink onClick={closeMenu} to="/trainer" className="flex items-center gap-4 text-xl font-bold uppercase tracking-widest text-white hover:text-brand transition-all duration-200">
                     <Briefcase size={20}/> Trainer Menu
                   </NavLink>
                 )}
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
                 <ShieldCheck size={20}/> 
                 {t.admin}
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
