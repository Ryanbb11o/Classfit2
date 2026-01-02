
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, Timer, XCircle, Trash2, CheckCircle2, User as UserIcon, Mail, CalendarPlus, Phone, MapPin, ChevronRight, LogOut, Dumbbell, Activity, AlertCircle, Briefcase, Loader2, X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Trainer, Booking } from '../types';

const CustomerDashboard: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, currentUser, logout, users, requestTrainerUpgrade, confirmAction } = useAppContext();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSpecialty, setUpgradeSpecialty] = useState('');
  const [upgradePhone, setUpgradePhone] = useState(currentUser?.phone || '');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const allTrainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    const dynamicTrainers: Trainer[] = users
      .filter(u => u.role === 'trainer')
      .map(u => {
        const match = u.name.match(/^(.*)\s\((.*)\)$/);
        const displayName = match ? match[1] : u.name;
        const displaySpecialty = match ? match[2] : (language === 'bg' ? 'Фитнес инструктор' : 'Fitness Instructor');
        return {
          id: u.id,
          name: displayName,
          specialty: displaySpecialty,
          price: 20, 
          image: u.image || DEFAULT_PROFILE_IMAGE, 
          phone: u.phone || '',
          availability: []
        };
      });
    return [...staticTrainers, ...dynamicTrainers];
  }, [language, users]);

  if (!currentUser) return null;

  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  const handleCancelRequest = (id: string) => {
    confirmAction({
      title: 'Cancel Training',
      message: 'Are you sure you want to cancel this session?',
      onConfirm: async () => {
        await updateBooking(id, { status: 'cancelled' });
      }
    });
  };

  const handleDelete = (id: string) => {
    confirmAction({
      title: 'Remove from History',
      message: 'Are you sure you want to remove this session from your dashboard?',
      onConfirm: async () => {
        await deleteBooking(id);
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      setIsUpgrading(true);
      try {
          const { success, msg } = await requestTrainerUpgrade(currentUser.id, currentUser.name, upgradePhone, upgradeSpecialty);
          if (success) {
              alert(language === 'bg' ? 'Заявката е изпратена!' : 'Application sent!');
              setShowUpgradeModal(false);
          }
      } finally {
          setIsUpgrading(false);
      }
  };

  const getTrainerImage = (trainer?: Trainer) => trainer?.image || DEFAULT_PROFILE_IMAGE;
  const displayName = currentUser.name.split('(')[0].trim();

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full p-1 border-2 border-brand/50">
                <img src={currentUser.image || DEFAULT_PROFILE_IMAGE} alt="Profile" className="w-full h-full object-cover rounded-full bg-dark" />
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black uppercase italic text-white leading-none mb-2">{displayName}</h1>
                <span className="text-brand bg-brand/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{currentUser.role.toUpperCase()}</span>
            </div>
         </div>
         <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 hover:text-white text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
           <LogOut size={16} /> {t.logout}
         </button>
      </div>

      {currentUser.role === 'user' && (
          <div className="mb-12 p-8 bg-brand/5 rounded-[2.5rem] border border-brand/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-brand text-dark rounded-2xl flex items-center justify-center shadow-lg"><Briefcase size={28} /></div>
                  <div className="text-center md:text-left">
                      <h3 className="text-2xl font-black uppercase italic text-white mb-1">Become a Trainer</h3>
                      <p className="text-slate-400 font-medium text-sm">Join ClassFit and manage your own clients.</p>
                  </div>
              </div>
              <button onClick={() => setShowUpgradeModal(true)} className="px-8 py-4 bg-brand text-dark rounded-full font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-brand/10">Apply Now</button>
          </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {myBookings.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-[2rem] border border-white/5 border-dashed">
                <p className="text-slate-500 font-medium">{t.noBookings}</p>
            </div>
        ) : (
            myBookings.map(booking => {
                const trainer = allTrainers.find(tr => tr.id === booking.trainerId);
                const isActive = booking.status === 'pending' || booking.status === 'confirmed';
                return (
                    <div key={booking.id} className="bg-surface border border-white/5 rounded-[2rem] p-8 hover:border-brand/30 transition-all flex flex-col md:flex-row gap-8 items-center">
                        <img src={getTrainerImage(trainer)} className="w-24 h-24 rounded-2xl object-cover" />
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-black uppercase italic text-xl text-white mb-1">{trainer?.name || 'Trainer'}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{booking.date} @ {booking.time}</p>
                        </div>
                        <div className="flex gap-2">
                             {isActive ? (
                                 <button onClick={() => handleCancelRequest(booking.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                             ) : (
                                 <button onClick={() => handleDelete(booking.id)} className="p-3 bg-white/5 text-slate-500 rounded-xl hover:text-red-500 transition-all"><X size={20} /></button>
                             )}
                        </div>
                    </div>
                )
            })
        )}
      </div>

      {showUpgradeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-surface rounded-[2.5rem] border border-white/10 p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
                  <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
                  <h2 className="text-2xl font-black uppercase italic text-white mb-6 text-center">Trainer Application</h2>
                  <form onSubmit={handleUpgradeSubmit} className="space-y-4">
                      <input type="text" required className="w-full bg-dark/50 border border-white/5 rounded-xl px-5 py-4 text-white outline-none focus:border-brand" placeholder="Specialty" value={upgradeSpecialty} onChange={e => setUpgradeSpecialty(e.target.value)} />
                      <input type="tel" required className="w-full bg-dark/50 border border-white/5 rounded-xl px-5 py-4 text-white outline-none focus:border-brand" placeholder="Phone" value={upgradePhone} onChange={e => setUpgradePhone(e.target.value)} />
                      <button type="submit" disabled={isUpgrading} className="w-full py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2">{isUpgrading ? <Loader2 className="animate-spin" /> : 'Submit'}</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
