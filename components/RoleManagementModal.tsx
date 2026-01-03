
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Fingerprint, Edit3, CheckSquare, Plus, Loader2 } from 'lucide-react';
import { User, UserRole } from '../types';

interface RoleManagementModalProps {
  user: User | null;
  onClose: () => void;
  onUpdate: (userId: string, updates: Partial<User>) => Promise<void>;
  language: string;
  isManagement: boolean;
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({ user, onClose, onUpdate, language, isManagement }) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || ['user']);
      setEditName(user.name);
      setShowSuccess(false);
    }
  }, [user]);

  if (!user) return null;

  const roleOptions: { id: UserRole, label: string }[] = [
    { id: 'management', label: 'Management' },
    { id: 'admin', label: 'Web Admin' },
    { id: 'trainer', label: 'Gym Coach' },
    { id: 'user', label: 'Member' },
    { id: 'trainer_pending', label: 'Pending Coach' }
  ];

  const handleToggle = (role: UserRole) => {
    if (!isManagement) return;
    if (role === 'management' && user.roles.includes('management')) {
      alert(language === 'bg' ? 'Ролята "Management" е защитена.' : 'The "Management" role is protected.');
      return;
    }
    if (selectedRoles.includes(role)) {
      const next = selectedRoles.filter(r => r !== role);
      setSelectedRoles(next.length === 0 ? ['user'] : next);
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSave = async () => {
    if (!isManagement) return;
    setIsSaving(true);
    try {
      await onUpdate(user.id, { roles: selectedRoles, name: editName });
      setShowSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      alert("Update failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-surface border border-white/10 rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand"></div>
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full z-10"><X size={20} /></button>
          
          <div className="mb-8">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 italic"><ShieldCheck size={12} /> Authority Control</div>
             <div className="flex items-center gap-2 text-slate-500 mb-2"><Fingerprint size={12} /><p className="text-[10px] font-mono uppercase tracking-tighter">ID: {user.id}</p></div>
          </div>

          <div className="overflow-y-auto pr-4 custom-scrollbar space-y-8">
            <div className="bg-dark/40 rounded-3xl p-6 border border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 italic">Core Identity</h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-600 ml-2">Display Username</label>
                        <div className="relative group">
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!isManagement} className="w-full bg-surface border border-white/5 focus:border-brand rounded-xl px-5 py-3 text-sm font-bold text-white outline-none transition-all disabled:opacity-50" />
                            {isManagement && <Edit3 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-brand" />}
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl"><p className="text-[8px] font-black uppercase text-slate-500 mb-1">Registered Email</p><p className="text-xs text-white font-medium truncate">{user.email}</p></div>
                </div>
            </div>

            <div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 italic">Authority Delegation</h3>
               <div className="grid grid-cols-1 gap-2">
                  {roleOptions.map((opt) => {
                    const isActive = selectedRoles.includes(opt.id);
                    const isLocked = opt.id === 'management' && user.roles.includes('management');
                    return (
                      <button key={opt.id} onClick={() => handleToggle(opt.id)} disabled={isLocked || !isManagement} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? 'bg-brand/10 border-brand/30 text-white' : 'bg-dark/20 border-white/5 text-slate-500'} ${(isLocked || !isManagement) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand shadow-[0_0_8px_rgba(197,217,45,0.8)]' : 'bg-slate-700'}`}></div>
                            <span className="text-[11px] font-black uppercase tracking-widest">{opt.label}</span>
                         </div>
                         {isActive ? <CheckSquare size={16} className="text-brand" /> : <Plus size={16} className="opacity-20" />}
                      </button>
                    );
                  })}
               </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/5">
             <button onClick={handleSave} disabled={isSaving || !isManagement || showSuccess} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl flex items-center justify-center gap-2 ${showSuccess ? 'bg-green-500 text-white' : 'bg-brand text-dark hover:bg-white shadow-brand/10'} disabled:opacity-50`}>
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : showSuccess ? <><CheckSquare size={18} /> Verified & Saved</> : <><ShieldCheck size={18} /> Confirm Identity Update</>}
             </button>
          </div>
       </div>
    </div>
  );
};

export default RoleManagementModal;
