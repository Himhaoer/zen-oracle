import React, { useState } from 'react';
import { UserProfile, SoulCard, Gender } from '../types';
import { User, Sparkles, RefreshCw, X, Plus, Users, ChevronRight } from 'lucide-react';
import { generateSoulPortrait } from '../services/oracle';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSwitchProfile: (id: string) => void;
  onUpdateProfile: (p: UserProfile) => void;
  onAddProfile: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ 
  isOpen, onClose, profiles, activeProfileId, onSwitchProfile, onUpdateProfile, onAddProfile
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [view, setView] = useState<'list' | 'detail'>('detail');

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const soulCards = activeProfile?.soulCards || [];
  const activeCard = soulCards.length > 0 ? soulCards[activeCardIndex] : null;

  const handleGenerate = async () => {
    if (!activeProfile.name || !activeProfile.occupation) {
      alert("请先完善您的信息。");
      return;
    }
    setIsGenerating(true);
    try {
      const card = await generateSoulPortrait(activeProfile);
      const updatedProfile = {
          ...activeProfile,
          soulCards: [card, ...soulCards]
      };
      onUpdateProfile(updatedProfile);
      setActiveCardIndex(0);
    } catch (e) {
      alert("灵感枯竭，请稍后再试。");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeProfile && profiles.length === 0) {
      // Should handle empty state or init
      return null;
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40" onClick={onClose} />
      )}
      
      <div className={`
        fixed top-0 left-0 h-full w-full md:w-[480px] bg-[#fcfbf9] shadow-2xl z-50 transform transition-transform duration-500 ease-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setView(view === 'list' ? 'detail' : 'list')}>
             {view === 'detail' && profiles.length > 1 && <Users size={18} className="text-stone-400"/>}
             <h2 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
                {view === 'list' ? '选择命主' : '命主画像'}
             </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          
          {view === 'list' ? (
             <div className="space-y-4">
                {profiles.map(p => (
                   <div 
                     key={p.id} 
                     onClick={() => { onSwitchProfile(p.id); setView('detail'); }}
                     className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${p.id === activeProfileId ? 'border-stone-800 bg-stone-50' : 'border-stone-200 hover:border-stone-400'}`}
                   >
                      <div>
                         <p className="font-serif font-bold text-stone-800">{p.name || '未命名'}</p>
                         <p className="text-xs text-stone-400">{p.occupation || '身份未知'}</p>
                      </div>
                      {p.id === activeProfileId && <div className="w-2 h-2 rounded-full bg-stone-800"></div>}
                   </div>
                ))}
                
                <button 
                  onClick={() => { onAddProfile(); setView('detail'); }}
                  className="w-full py-4 border border-dashed border-stone-300 rounded-lg text-stone-400 hover:text-stone-600 hover:border-stone-400 transition-all flex items-center justify-center gap-2"
                >
                   <Plus size={18} />
                   <span className="text-sm tracking-widest uppercase">新增命主</span>
                </button>
             </div>
          ) : (
             <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
                {/* 1. Soul Card Section */}
                <div className="flex flex-col items-center">
                   <div className="relative w-64 h-96 perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                      <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                         
                         {/* Front */}
                         <div className="absolute inset-0 backface-hidden rounded-xl shadow-2xl overflow-hidden border-4 border-stone-200 bg-stone-100 flex items-center justify-center">
                            {activeCard ? (
                              <img src={activeCard.imageUrl} alt="Soul Card" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center p-6 text-stone-400">
                                 <Sparkles className="mx-auto mb-4 opacity-50" size={40} />
                                 <p className="text-sm tracking-widest uppercase">暂无灵相</p>
                                 <p className="text-xs mt-2 opacity-60">点击生成以显化</p>
                              </div>
                            )}
                            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
                         </div>

                         {/* Back */}
                         <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl shadow-2xl overflow-hidden bg-stone-800 flex flex-col items-center justify-center p-6 border-4 border-stone-600 text-stone-200">
                            <div className="w-16 h-16 rounded-full border border-stone-500 flex items-center justify-center mb-4">
                               <span className="font-serif text-3xl">命</span>
                            </div>
                            <p className="text-xs tracking-[0.3em] uppercase opacity-70 mb-2">灵相解读</p>
                            <p className="font-serif text-center italic leading-relaxed">
                              {activeCard?.description || activeProfile.bio || "无言之境"}
                            </p>
                            <p className="absolute bottom-4 text-[10px] text-stone-500">
                               {activeCard ? new Date(activeCard.timestamp).toLocaleDateString() : ''}
                            </p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-6 flex gap-4">
                      <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="px-6 py-2 bg-stone-800 text-stone-50 text-sm font-serif tracking-widest rounded-full hover:bg-stone-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                        {activeCard ? '重绘灵相' : '显化灵相'}
                      </button>
                   </div>
                   
                   {/* History dots */}
                   {soulCards.length > 1 && (
                     <div className="flex gap-2 mt-4">
                       {soulCards.map((_, idx) => (
                         <button 
                           key={idx}
                           onClick={() => { setActiveCardIndex(idx); setIsFlipped(false); }}
                           className={`w-2 h-2 rounded-full transition-colors ${idx === activeCardIndex ? 'bg-stone-800' : 'bg-stone-300'}`}
                         />
                       ))}
                     </div>
                   )}
                </div>

                {/* 2. Profile Form */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">基本信息</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs text-stone-500 mb-1 block">姓名</label>
                          <input 
                            type="text" 
                            className="w-full bg-stone-50 border border-stone-200 p-2 rounded text-sm focus:outline-none focus:border-stone-800 transition-colors"
                            value={activeProfile.name}
                            onChange={e => onUpdateProfile({...activeProfile, name: e.target.value})}
                          />
                       </div>
                       
                       {/* Gender */}
                       <div>
                          <label className="text-xs text-stone-500 mb-1 block">性别 (乾/坤)</label>
                          <div className="flex bg-stone-50 rounded border border-stone-200 p-1">
                             <button 
                               onClick={() => onUpdateProfile({...activeProfile, gender: 'male'})}
                               className={`flex-1 text-xs py-1 rounded transition-colors ${activeProfile.gender === 'male' ? 'bg-stone-800 text-stone-50' : 'text-stone-400 hover:text-stone-600'}`}
                             >
                               乾 (男)
                             </button>
                             <button 
                               onClick={() => onUpdateProfile({...activeProfile, gender: 'female'})}
                               className={`flex-1 text-xs py-1 rounded transition-colors ${activeProfile.gender === 'female' ? 'bg-stone-800 text-stone-50' : 'text-stone-400 hover:text-stone-600'}`}
                             >
                               坤 (女)
                             </button>
                          </div>
                       </div>
                       
                       <div className="col-span-2">
                          <label className="text-xs text-stone-500 mb-1 block">出生日期</label>
                          <input 
                            type="date" 
                            className="w-full bg-stone-50 border border-stone-200 p-2 rounded text-sm focus:outline-none focus:border-stone-800 transition-colors"
                            value={activeProfile.birthDate}
                            onChange={e => onUpdateProfile({...activeProfile, birthDate: e.target.value})}
                          />
                       </div>
                    </div>

                    <div>
                        <label className="text-xs text-stone-500 mb-1 block">当前状态 / 身份</label>
                        <input 
                          type="text" 
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded text-sm focus:outline-none focus:border-stone-800 transition-colors"
                          value={activeProfile.occupation}
                          onChange={e => onUpdateProfile({...activeProfile, occupation: e.target.value})}
                          placeholder="例如：创业者、求学者..."
                        />
                    </div>

                    <div>
                        <label className="text-xs text-stone-500 mb-1 block">心境自述 (用于画像)</label>
                        <textarea 
                          rows={3}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded text-sm focus:outline-none focus:border-stone-800 transition-colors"
                          value={activeProfile.bio}
                          onChange={e => onUpdateProfile({...activeProfile, bio: e.target.value})}
                          placeholder="描述当下的心境..."
                        />
                    </div>
                  </div>
                </div>
             </div>
          )}

        </div>
        
        <style>{`
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
      </div>
    </>
  );
};

export default ProfileDrawer;