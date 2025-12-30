
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Check, X, ShieldAlert, CheckCircle2, DollarSign, CreditCard, Banknote, LayoutDashboard, ListFilter, FileSpreadsheet, TrendingUp, Phone, Loader2, Trash2, Users, Shield, RefreshCw, History, Briefcase, CheckCircle, ArrowRight, AlertTriangle, MessageSquare, Mail, Eye } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { TRANSLATIONS, getTrainers, DEFAULT_PROFILE_IMAGE } from '../constants';
import emailjs from '@emailjs/browser';
import { Trainer } from '../types';

const AdminPanel: React.FC = () => {
  const { language, bookings, updateBooking, deleteBooking, isAdmin, users, deleteUser, updateUser, currentUser, refreshData, messages, deleteMessage, markMessageRead } = useAppContext();
  const t = TRANSLATIONS[language];
  
  // MERGE STATIC AND DYNAMIC TRAINERS TO FIX "BLANK NAME" ISSUE
  const trainers = useMemo(() => {
    const staticTrainers = getTrainers(language);
    
    // Convert users with role 'trainer' into Trainer objects
    const dynamicTrainers: Trainer[] = users
      .filter(u => u.role === 'trainer')
      .map(u => {
        // STRICT PARSING: Separate Name from Specialty
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

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'history' | 'finance' | 'users' | 'applications' | 'messages'>('overview');

  // Refresh data on mount AND when tab changes to ensure fresh data
  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const activeBookingsList = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const historyBookingsList = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const pendingApplications = users.filter(u => u.role === 'trainer_pending');
  const newMessagesCount = messages.filter(m => m.status === 'new').length;
  
  const totalIncome = completedBookings.reduce((sum, b) => sum + b.price, 0);

  const incomeByTrainer = trainers.map(trainer => {
    const trainerBookings = completedBookings.filter(b => b.trainerId === trainer.id);
    const trainerIncome = trainerBookings.reduce((sum, b) => sum + b.price, 0);
    return { ...trainer, income: trainerIncome, count: trainerBookings.length };
  });

  const analyticsSheet = trainers.map(trainer => {
    const trBookings = completedBookings.filter(b => b.trainerId === trainer.id);
    const cashBookings = trBookings.filter(b => b.paymentMethod === 'cash');
    const cashTotal = cashBookings.reduce((sum, b) => sum + b.price, 0);
    const cardBookings = trBookings.filter(b => b.paymentMethod === 'card');
    const cardTotal = cardBookings.reduce((sum, b) => sum + b.price, 0);
    return {
      ...trainer,
      totalCount: trBookings.length,
      totalIncome: trBookings.reduce((sum, b) => sum + b.price, 0),
      cashCount: cashBookings.length,
      cashIncome: cashTotal,
      cardCount: cardBookings.length,
      cardIncome: cardTotal,
    };
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const appCount = pendingApplications.length;
  const msgCount = messages.length;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData().then(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  const handleFinish = async (id: string, method: 'card' | 'cash') => {
    await updateBooking(id, { status: 'completed', paymentMethod: method });
    setCompletingId(null);
  };

  const handleApproveTrainer = async (id: string) => {
    if (window.confirm("Approve this user as a Trainer? They will gain Trainer access.")) {
        await updateUser(id, { role: 'trainer' });
    }
  };

  const handleRejectTrainer = async (id: string) => {
    if (window.confirm("Reject and DELETE this application?")) {
        await deleteUser(id);
    }
  };

  const handleDeleteMessage = async (id: string) => {
     if (window.confirm(language === 'bg' ? 'Сигурни ли сте?' : 'Are you sure you want to delete this message?')) {
        await deleteMessage(id);
     }
  };

  const handleMarkRead = async (id: string) => {
      await markMessageRead(id);
  };

  const handleConfirm = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setProcessingId(bookingId);

    // Важно: Използваме езика на резервацията, не текущия език на админа
    const bookingLang = booking.language || 'bg'; 
    const bookingTrainers = getTrainers(bookingLang);
    const trainer = bookingTrainers.find(tr => tr.id === booking.trainerId);
    const currentT = TRANSLATIONS[bookingLang];
    
    if (booking.customerEmail && trainer) {
      // 1. Форматиране на датата спрямо езика на клиента
      const dateObj = new Date(booking.date);
      const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = dateObj.toLocaleDateString(bookingLang === 'bg' ? 'bg-BG' : 'en-US', dateOptions);
      const humanReadableDateTime = bookingLang === 'bg' 
        ? `${formattedDate} в ${booking.time} ч.`
        : `${formattedDate} @ ${booking.time}`;

      // 2. Google Calendar линк
      const [year, month, day] = booking.date.split('-');
      const [hour, minute] = booking.time.split(':');
      const startIso = `${year}${month}${day}T${hour}${minute}00`;
      const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
      const endIso = `${year}${month}${day}T${endHour}${minute}00`;
      
      const calText = encodeURIComponent(bookingLang === 'bg' ? `Тренировка с ${trainer.name} @ ClassFit` : `Training with ${trainer.name} @ ClassFit`);
      const calLoc = encodeURIComponent(`ClassFit Varna, MIR, ${currentT.address}`);
      const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${calText}&dates=${startIso}/${endIso}&location=${calLoc}`;

      // 3. Параметри за имейл шаблона
      const templateParams = {
        to_email: booking.customerEmail,
        gym_name: "ClassFit Varna",
        booking_id: booking.id.toUpperCase(),
        customer_name: booking.customerName,
        service_name: trainer.specialty,
        start_datetime_human: humanReadableDateTime,
        duration_minutes: "60",
        coach_name: trainer.name,
        location_name: "ClassFit Varna (MIR)",
        address_line: currentT.address,
        price: booking.price.toFixed(2),
        currency: bookingLang === 'bg' ? 'лв.' : 'BGN',
        payment_method: currentT.payAtDesk,
        manage_booking_url: `${window.location.origin}/profile`,
        add_to_calendar_url: calendarUrl,
        checkin_code: booking.id.slice(0, 6).toUpperCase(),
        support_email: "support@classfitvarna.bg",
        support_phone: currentT.gymPhone,
        terms_url: `${window.location.origin}/about`,
        privacy_url: `${window.location.origin}/about`
      };

      // Избор на шаблон според езика
      const templateId = bookingLang === 'bg' ? 'template_8dnoxwb' : 'template_18zuajh'; 

      try {
        await emailjs.send('service_ienhll4', templateId, templateParams, 'OSc44Rzyw4ZIkrQ8U');
      } catch (error) {
        console.error('[EmailJS] Confirmation failed:', error);
      }
    }

    await updateBooking(bookingId, { status: 'confirmed' });
    setProcessingId(null);
  };

  const handleDeleteBooking = (id: string) => {
    deleteBooking(id);
  };

  const handleFactoryReset = () => {
    if (window.confirm(t.sure)) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) return;
    if (window.confirm(t.sure)) deleteUser(id);
  };

  // HELPER: Clean name display
  const cleanName = (name: string) => name.split('(')[0].trim();

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-40 px-4 text-center">
        <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-white">{t.accessDenied}</h2>
        <p className="text-slate-400 font-light">{t.accessDeniedDesc}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black uppercase italic mb-4 tracking-tight leading-none text-white">{t.adminPanel}</h1>
             <button onClick={handleManualRefresh} className={`p-2 rounded-full hover:bg-white/10 text-slate-400 transition-all ${isRefreshing ? 'animate-spin text-brand' : ''}`}>
                <RefreshCw size={20} />
             </button>
          </div>
          <p className="text-slate-400 font-medium italic">{t.welcomeAdmin}</p>
        </div>

        <div className="bg-surface border border-white/5 p-1.5 rounded-2xl flex items-center gap-1 self-start md:self-auto overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-brand text-dark' : 'text-slate-400'}`}>
            <LayoutDashboard size={14} className="inline mr-2" />{t.tabOverview}
          </button>
          <button onClick={() => setActiveTab('finance')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'finance' ? 'bg-brand text-dark' : 'text-slate-400'}`}>
            <FileSpreadsheet size={14} className="inline mr-2" />{t.tabAnalysis}
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-brand text-dark' : 'text-slate-400'}`}>
            <ListFilter size={14} className="inline mr-2" />{t.tabBookings} {pendingCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-brand text-dark rounded text-[8px]">{pendingCount}</span>}
          </button>
          <button onClick={() => setActiveTab('applications')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'applications' ? 'bg-brand text-dark' : 'text-slate-400'}`}>
            <Briefcase size={14} className="inline mr-2" /> Requests {appCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-white text-dark rounded text-[8px]">{appCount}</span>}
          </button>
          <button onClick={() => setActiveTab('messages')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'bg-brand text-dark' : 'text-slate-400'}`}>
            <MessageSquare size={14} className="inline mr-2" /> {t.tabMessages} {newMessagesCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-white text-dark rounded text-[8px]">{newMessagesCount}</span>}
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-brand text-dark' : 'text-slate-400'}`}>
            <Users size={14} className="inline mr-2" />{t.tabUsers}
          </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            
            {/* ALERT BANNER FOR TRAINER APPLICATIONS */}
            {pendingApplications.length > 0 && (
                <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500 text-dark rounded-xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase italic text-white">Action Required</h3>
                        <p className="text-slate-400 font-medium">{pendingApplications.length} pending trainer application(s).</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('applications')}
                    className="px-6 py-3 bg-yellow-500 text-dark rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                  >
                    Review Now <ArrowRight size={16} />
                  </button>
                </div>
            )}
            
            {/* ALERT BANNER FOR MESSAGES */}
            {newMessagesCount > 0 && (
                <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 text-white rounded-xl">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase italic text-white">Inbox</h3>
                        <p className="text-slate-400 font-medium">{newMessagesCount} new message(s) in inbox.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-blue-500 transition-all flex items-center gap-2"
                  >
                    View Messages <ArrowRight size={16} />
                  </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="p-10 bg-brand text-dark rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 text-dark mb-6">
                     <div className="p-2 bg-dark/10 rounded-lg"><DollarSign size={20} /></div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.totalIncome}</span>
                   </div>
                   <p className="text-5xl font-black italic tracking-tighter mb-2">{totalIncome} <span className="text-lg opacity-60">BGN</span></p>
                   <p className="text-xs opacity-60 font-medium">{t.genBy} {completedBookings.length} {t.completedWorkouts}</p>
                 </div>
              </div>
              {incomeByTrainer.map(trainer => (
                <div key={trainer.id} className="p-8 bg-surface border border-white/5 rounded-[2.5rem] flex flex-col justify-between">
                   <div className="flex items-start justify-between mb-6">
                     <img src={trainer.image || DEFAULT_PROFILE_IMAGE} alt={trainer.name} className="w-14 h-14 rounded-2xl object-cover bg-dark" />
                     <div className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400">{trainer.count}</div>
                   </div>
                   <div>
                      <h4 className="text-sm font-black uppercase italic leading-none mb-2 text-white">{cleanName(trainer.name)}</h4>
                      <p className="text-2xl font-black italic text-brand">{trainer.income} <span className="text-xs text-slate-500">BGN</span></p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... (finance, bookings, applications tabs remain unchanged) ... */}
        {activeTab === 'finance' && (
          <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
             <div className="p-8 border-b border-white/5 bg-white/5">
                <h3 className="text-lg font-black uppercase italic text-white"><TrendingUp size={18} className="inline mr-2 text-brand" /> {t.financialAnalysis}</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase text-slate-500">
                     <th className="px-8 py-6">{t.trainer}</th>
                     <th className="px-8 py-6 text-center">{t.workouts}</th>
                     <th className="px-8 py-6 text-right">{t.cash}</th>
                     <th className="px-8 py-6 text-right">{t.card}</th>
                     <th className="px-8 py-6 text-right text-white">{t.totalSum}</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {analyticsSheet.map((row, idx) => (
                     <tr key={idx} className="hover:bg-white/5">
                       <td className="px-8 py-5 flex items-center gap-3">
                         <img src={row.image || DEFAULT_PROFILE_IMAGE} alt={row.name} className="w-8 h-8 rounded-lg object-cover bg-dark" />
                         <span className="font-black italic text-xs text-white">{cleanName(row.name)}</span>
                       </td>
                       <td className="px-8 py-5 text-center text-slate-300 font-bold">{row.totalCount}</td>
                       <td className="px-8 py-5 text-right text-slate-400">{row.cashIncome} BGN</td>
                       <td className="px-8 py-5 text-right text-slate-400">{row.cardIncome} BGN</td>
                       <td className="px-8 py-5 text-right"><span className="font-black italic text-brand text-lg">{row.totalIncome} BGN</span></td>
                     </tr>
                   ))}
                   <tr className="bg-dark text-white border-t border-white/5 font-black uppercase italic text-xs">
                      <td className="px-8 py-6 text-slate-400">{t.totalTotal}</td>
                      <td className="px-8 py-6 text-center text-brand">{analyticsSheet.reduce((a, b) => a + b.totalCount, 0)}</td>
                      <td className="px-8 py-6 text-right">{analyticsSheet.reduce((a, b) => a + b.totalCount > 0 ? a + b.cashIncome : a, 0)} BGN</td>
                      <td className="px-8 py-6 text-right">{analyticsSheet.reduce((a, b) => a + b.totalCount > 0 ? a + b.cardIncome : a, 0)} BGN</td>
                      <td className="px-8 py-6 text-right text-brand text-xl">{totalIncome} BGN</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/5"><h3 className="text-lg font-black uppercase italic text-white">{t.allBookings}</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black uppercase text-slate-500">
                    <th className="px-8 py-6">{t.client}</th>
                    <th className="px-8 py-6">{t.trainer}</th>
                    <th className="px-8 py-6">{t.details}</th>
                    <th className="px-8 py-6">{t.status}</th>
                    <th className="px-8 py-6 text-right">{t.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeBookingsList.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-500 uppercase font-black italic">{t.noRecords}</td></tr>
                  ) : (
                    activeBookingsList.map(booking => {
                      const trainer = trainers.find(tr => tr.id === booking.trainerId);
                      const bookingUser = users.find(u => u.id === booking.userId);
                      const isPending = booking.status === 'pending';
                      const isConfirmed = booking.status === 'confirmed';
                      const isProcessing = processingId === booking.id;
                      return (
                        <tr key={booking.id} className="hover:bg-white/5">
                          <td className="px-8 py-6 flex items-center gap-3">
                            <img 
                                src={bookingUser?.image || DEFAULT_PROFILE_IMAGE} 
                                alt={booking.customerName} 
                                className="w-10 h-10 rounded-xl object-cover bg-dark" 
                            />
                            <div>
                                <span className="font-black italic uppercase text-xs text-white">{cleanName(booking.customerName)}</span>
                                {booking.customerPhone && <span className="block text-[9px] text-slate-500">{booking.customerPhone}</span>}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-slate-400 font-bold uppercase text-[10px]">{trainer?.name ? cleanName(trainer.name) : 'Unknown'}</td>
                          <td className="px-8 py-6 text-[10px] font-black uppercase text-white">{booking.date} | {booking.time}</td>
                          <td className="px-8 py-6">
                             <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg ${isConfirmed ? 'bg-green-500/10 text-green-400' : 'bg-brand text-dark'}`}>
                                {t[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}` as keyof typeof t]}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                {isPending && (
                                  <>
                                    <button onClick={() => handleConfirm(booking.id)} disabled={isProcessing} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                                      {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    </button>
                                    <button onClick={() => updateBooking(booking.id, { status: 'cancelled' })} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
                                  </>
                                )}
                                {isConfirmed && (
                                  completingId === booking.id ? (
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => handleFinish(booking.id, 'cash')} className="px-3 py-2 bg-green-500/10 text-green-500 rounded-lg text-[9px] font-black uppercase hover:bg-green-500 hover:text-white transition-all"><Banknote size={12} className="inline mr-1" /> {t.cash}</button>
                                      <button onClick={() => handleFinish(booking.id, 'card')} className="px-3 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all"><CreditCard size={12} className="inline mr-1" /> {t.card}</button>
                                      <button onClick={() => setCompletingId(null)} className="p-2 text-slate-500"><X size={14}/></button>
                                    </div>
                                  ) : (
                                    <button onClick={() => setCompletingId(booking.id)} className="px-4 py-2 bg-brand text-dark rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-1">
                                        <CheckCircle2 size={14} /> {t.finish}
                                    </button>
                                  )
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden animate-in fade-in">
             <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-3">
                   <Briefcase className="text-brand" size={20} /> Pending Trainer Applications
                </h3>
                <button onClick={handleManualRefresh} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                   <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} /> Refresh List
                </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase">
                     <th className="px-8 py-6">{t.name}</th>
                     <th className="px-8 py-6">{t.email}</th>
                     <th className="px-8 py-6">{t.phone}</th>
                     <th className="px-8 py-6 text-right">{t.action}</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {pendingApplications.length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-500 uppercase font-black italic">No pending applications</td></tr>
                   ) : (
                       pendingApplications.map(u => (
                         <tr key={u.id} className="hover:bg-white/5">
                           <td className="px-8 py-6 font-black uppercase italic text-xs text-white">
                                {cleanName(u.name)}
                           </td>
                           <td className="px-8 py-6 text-xs text-slate-400">{u.email}</td>
                           <td className="px-8 py-6 text-xs text-brand font-bold">{u.phone || 'N/A'}</td>
                           <td className="px-8 py-6 text-right flex justify-end gap-2">
                             <button 
                                onClick={() => handleApproveTrainer(u.id)} 
                                className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-[9px] font-black uppercase hover:bg-green-500 hover:text-white transition-all flex items-center gap-1"
                             >
                                <CheckCircle size={12} /> Approve
                             </button>
                             <button 
                                onClick={() => handleRejectTrainer(u.id)}
                                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
                             >
                                <Trash2 size={12} /> Reject
                             </button>
                           </td>
                         </tr>
                       ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden animate-in fade-in">
             <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-3">
                   <MessageSquare className="text-brand" size={20} /> {t.allMessages} <span className="bg-brand text-dark px-2 py-0.5 rounded text-xs">{messages.length}</span>
                </h3>
                <button onClick={handleManualRefresh} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                   <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase">
                     <th className="px-8 py-6 w-1/4">{t.sender}</th>
                     <th className="px-8 py-6 w-1/4">{t.subject}</th>
                     <th className="px-8 py-6 w-1/3">{t.message}</th>
                     <th className="px-8 py-6">{t.received}</th>
                     <th className="px-8 py-6 text-right">{t.action}</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {messages.length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-500 uppercase font-black italic">Inbox Empty</td></tr>
                   ) : (
                       messages.map(m => (
                         <tr key={m.id} className={`hover:bg-white/5 align-top transition-colors ${m.status === 'new' ? 'bg-brand/5' : ''}`}>
                           <td className="px-8 py-6">
                                <div className={`font-black uppercase italic text-xs text-white mb-1 ${m.status === 'new' ? 'text-brand' : ''}`}>
                                    {m.status === 'new' && <span className="w-2 h-2 rounded-full bg-brand inline-block mr-2 animate-pulse"></span>}
                                    {m.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1"><Mail size={10} /> {m.email}</div>
                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Phone size={10} /> {m.phone}</div>
                           </td>
                           <td className="px-8 py-6 text-xs text-white font-bold uppercase">{m.subject}</td>
                           <td className="px-8 py-6 text-xs text-slate-300 italic leading-relaxed whitespace-pre-wrap max-w-xs">{m.message}</td>
                           <td className="px-8 py-6 text-[10px] text-slate-500 font-bold uppercase">
                              {new Date(m.date).toLocaleDateString()} <br/>
                              {new Date(m.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </td>
                           <td className="px-8 py-6 text-right flex flex-col gap-2 items-end">
                             {m.status === 'new' && (
                                <button 
                                  onClick={() => handleMarkRead(m.id)}
                                  className="px-3 py-2 bg-brand/20 text-brand rounded-lg text-[9px] font-black uppercase hover:bg-brand hover:text-dark transition-all flex items-center gap-2"
                                >
                                    <Eye size={12} /> Mark Read
                                </button>
                             )}
                             <a 
                                href={`mailto:${m.email}?subject=Re: ${m.subject}`}
                                className="px-3 py-2 bg-white/5 text-slate-300 rounded-lg text-[9px] font-black uppercase hover:bg-white hover:text-dark transition-all flex items-center gap-2"
                             >
                                <Mail size={12} /> {t.reply}
                             </a>
                             <button 
                                onClick={() => handleDeleteMessage(m.id)}
                                className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                             >
                                <Trash2 size={12} /> {t.deleteMsg}
                             </button>
                           </td>
                         </tr>
                       ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-surface rounded-[2.5rem] border border-white/5 overflow-hidden animate-in fade-in">
             <div className="p-8 border-b border-white/5 bg-white/5">
                <h3 className="text-lg font-black uppercase italic text-white">{t.allUsers} <span className="bg-brand text-dark px-2 py-0.5 rounded ml-2">{users.length}</span></h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase">
                     <th className="px-8 py-6">User</th>
                     <th className="px-8 py-6">{t.email}</th>
                     <th className="px-8 py-6">{t.role}</th>
                     <th className="px-8 py-6 text-right">{t.action}</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {users.map(u => (
                     <tr key={u.id} className="hover:bg-white/5">
                       <td className="px-8 py-6 flex items-center gap-3">
                          <img 
                            src={u.image || DEFAULT_PROFILE_IMAGE} 
                            alt={u.name} 
                            className="w-10 h-10 rounded-xl object-cover bg-dark" 
                          />
                          <span className="font-black uppercase italic text-xs text-white">{cleanName(u.name)}</span>
                       </td>
                       <td className="px-8 py-6 text-xs text-slate-400">{u.email}</td>
                       <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded text-[9px] font-black uppercase ${
                                u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 
                                u.role === 'trainer' ? 'bg-brand text-dark' :
                                u.role === 'trainer_pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-white/5 text-slate-500'
                            }`}>
                                {u.role}
                            </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                         {u.id !== currentUser?.id && <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={16} /></button>}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
