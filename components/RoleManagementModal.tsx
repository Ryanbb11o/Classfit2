
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Fingerprint, Edit3, CheckSquare, Plus, Loader2, Save, Languages, Percent, Image as ImageIcon, Briefcase, Target, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../types';

interface RoleManagementModalProps {
  user: User | null;
  onClose: () => void;
  onUpdate: (userId: string, updates: Partial<User>) => Promise<void>;
  language: string;
  isManagement: boolean;
  isSelf?: boolean;
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({ user, onClose, onUpdate, language, isManagement, isSelf }) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [editName, setEditName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editCommission, setEditCommission] = useState(25);
  const [editLangs, setEditLangs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || ['user']);
      const nameParts = user.name.match(/^(.*)\s\((.*)\)$/);
      setEditName(nameParts ? nameParts[1] : user.name);
      setEditSpecialty(nameParts ? nameParts[2] : '');
      setEditImage(user.image || '');
      setEditCommission(user.commissionRate || 25);
      setEditLangs(user.languages || ['Bulgarian']);
      setShowSuccess(false);
    }
  }, [user]);

  if (!user) return null;

  const isTrainerMode = selectedRoles.includes('trainer') || selectedRoles.includes('trainer_pending');
  
  const roleOptions: { id: UserRole, label: string }[] = [
    { id: 'management', label: 'Management' },
    { id: 'admin', label: 'Web Admin' },
    { id: 'trainer', label: 'Gym Coach' },
    { id: 'user', label: 'Member' }
  ];

  const languageOptions = ['Bulgarian', 'English', 'Russian', 'German', 'Turkish', 'Other'];

  const handleToggleRole = (role: UserRole) => {
    if (!isManagement) return;
    if (role === 'management' && user.roles.includes('management')) return;
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleToggleLang = (lang: string) => {
    if (editLangs.includes(lang)) {
      setEditLangs(editLangs.filter(l => l !== lang));
    } else {
      setEditLangs([...editLangs, lang]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalName = isTrainerMode && editSpecialty ? `${editName} (${editSpecialty})` : editName;
      
      const updates: Partial<User> = {
        name: finalName,
        image: editImage,
        languages: editLangs,
        bio: isTrainerMode ? user.bio : `Fitness Goal: ${editSpecialty}`
      };

      if (isManagement) {
        updates.roles = selectedRoles;
        updates.commissionRate = editCommission;
      }

      await onUpdate(user.id, updates);
      setShowSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      alert("Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300 text-left">
       <div className="bg-[#1a2332] border border-white/10 rounded-[3rem] p-8 md:p-12 w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
          
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full z-10 transition-colors">
            <X size={20} />
          </button>
          
          <div className="mb-10">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                   {isTrainerMode ? <Briefcase size={16} /> : <UserIcon size={16} />}
                </div>
                <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">
                   {isTrainerMode ? 'COACH PROFILE' : 'MEMBER IDENTITY'}
                </h2>
             </div>
             <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest italic ml-11">
                {isTrainerMode ? 'Refine your professional profile and club terms' : 'Manage your member profile and workout preferences'}
             </p>
          </div>

          <div className="overflow-y-auto pr-2 custom-scrollbar space-y-10 pb-4">
            {/* Core Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Име / Name</label>
                   <input 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className="w-full bg-[#131b27] border border-white/5 focus:border-brand rounded-2xl px-6 py-4 text-sm font-black text-white outline-none transition-all" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-500 ml-2">
                      {isTrainerMode ? 'Specialty' : 'Primary Goal'}
                   </label>
                   <input 
                      value={editSpecialty} 
                      onChange={(e) => setEditSpecialty(e.target.value)} 
                      placeholder={isTrainerMode ? "e.g. Muscle Growth" : "e.g. Get Shredded"}
                      className="w-full bg-[#131b27] border border-white/5 focus:border-brand rounded-2xl px-6 py-4 text-sm font-black text-white outline-none transition-all" 
                   />
                </div>
            </div>

            {/* Languages Section */}
            <div className="space-y-4">
               <label className="flex items-center gap-2 text-[9px] font-black uppercase text-brand ml-2">
                  <Languages size={14} /> {isTrainerMode ? 'Communication Skills' : 'Speaking Languages'}
               </label>
               <div className="flex flex-wrap gap-2">
                  {languageOptions.map(lang => (
                     <button 
                        key={lang} 
                        onClick={() => handleToggleLang(lang)}
                        className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                           editLangs.includes(lang) 
                           ? 'bg-brand text-dark border-brand shadow-lg shadow-brand/10' 
                           : 'bg-white/5 text-slate-500 border-white/5 hover:border-brand/40'
                        }`}
                     >
                        {editLangs.includes(lang) && '✓ '} {lang}
                     </button>
                  ))}
               </div>
            </div>

            {/* Club Specifics - ONLY for Managers viewing someone or themselves */}
            {isManagement && (
               <div className="space-y-8 animate-in slide-in-from-top-2">
                  <div className="p-8 bg-brand/5 rounded-[2.5rem] border border-brand/20 relative group">
                    <div className="flex justify-between items-center mb-6">
                       <label className="text-[9px] font-black uppercase text-brand tracking-widest">Club Commission Share</label>
                       <span className="text-[8px] font-black text-slate-500 uppercase">Current Ledger Rate: {user.commissionRate}%</span>
                    </div>
                    <div className="relative">
                       <input 
                          type="number" 
                          value={editCommission} 
                          onChange={(e) => setEditCommission(Number(e.target.value))}
                          className="w-full bg-[#131b27] border border-white/5 focus:border-brand rounded-2xl px-8 py-5 text-2xl font-black text-white outline-none transition-all text-center"
                       />
                       <Percent size={24} className="absolute right-8 top-1/2 -translate-y-1/2 text-brand" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 italic">Authority Delegation</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {roleOptions.map((opt) => {
                          const active = selectedRoles.includes(opt.id);
                          return (
                             <button 
                                key={opt.id} 
                                onClick={() => handleToggleRole(opt.id)}
                                className={`flex items-center justify-between p-4 rounded-2xl border text-[9px] font-black uppercase transition-all ${
                                   active ? 'bg-white/5 border-brand/50 text-white' : 'bg-dark/20 border-white/5 text-slate-600'
                                }`}
                             >
                                {opt.label}
                                {active && <CheckSquare size={14} className="text-brand" />}
                             </button>
                          );
                       })}
                    </div>
                  </div>
               </div>
            )}

            {/* General Profile Asset */}
            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Profile Avatar Asset (Link)</label>
               <div className="relative">
                  <input 
                     value={editImage} 
                     onChange={(e) => setEditImage(e.target.value)} 
                     className="w-full bg-[#131b27] border border-white/5 focus:border-brand rounded-2xl px-6 py-4 text-xs font-medium text-white outline-none transition-all truncate" 
                     placeholder="https://..."
                  />
               </div>
               <p className="text-[8px] text-slate-600 font-bold italic ml-2">Publicly visible on class booking and ranking.</p>
            </div>
          </div>

          <div className="pt-6">
             <button 
                onClick={handleSave} 
                disabled={isSaving || showSuccess} 
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl ${
                   showSuccess ? 'bg-green-500 text-white' : 'bg-brand text-dark hover:brightness-110 active:scale-95'
                }`}
             >
                {isSaving ? <Loader2 className="animate-spin" /> : showSuccess ? 'Profile Updated' : <><Save size={18}/> Commit Changes</>}
             </button>
          </div>
       </div>
    </div>
  );
};

export default RoleManagementModal;
