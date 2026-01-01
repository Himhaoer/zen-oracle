import React, { useState, useEffect } from 'react';
import { OracleMethod, ReadingRequest, Gender, UserProfile } from '../types';

interface InputFormProps {
  method: OracleMethod;
  onSubmit: (data: Partial<ReadingRequest>) => void;
  isLoading: boolean;
  activeProfile?: UserProfile; // Pre-fill data
}

const CHARACTER_CARDS = [
  '静', '动', '寻', '归', '乱', '定', 
  '风', '山', '火', '水', '悟', '迷', 
  '信', '诚', '变', '通', '升', '沉'
];

const InputForm: React.FC<InputFormProps> = ({ method, onSubmit, isLoading, activeProfile }) => {
  const [formData, setFormData] = useState({
    query: '',
    birthDate: '',
    birthTime: '',
    gender: 'male' as Gender,
    character: ''
  });
  
  const [ceZiMode, setCeZiMode] = useState<'input' | 'select'>('select');

  // Load profile data if available
  useEffect(() => {
    if (activeProfile) {
      setFormData(prev => ({
        ...prev,
        birthDate: activeProfile.birthDate || '',
        gender: activeProfile.gender || 'male',
      }));
    }
  }, [activeProfile]);

  // Reset/Adjust when method changes
  useEffect(() => {
    // Keep gender/date if profile exists, otherwise maybe reset or keep previous input?
    // Let's keep data to avoid frustration, but reset character
    setFormData(prev => ({ ...prev, character: '' }));
  }, [method]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      method,
      query: formData.query,
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      character: formData.character
    });
  };

  const inputClass = "w-full bg-transparent border-b border-stone-300 py-3 text-stone-800 focus:outline-none focus:border-stone-800 transition-colors placeholder-stone-400 font-serif";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-8 fade-in">
      
      {/* Dynamic Inputs */}
      <div className="space-y-6 min-h-[160px] flex flex-col justify-center">
        {method === OracleMethod.HE_LUO && (
          <div className="space-y-4">
             {/* Gender Selector */}
             <div className="flex justify-center gap-8">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center transition-all ${formData.gender === 'male' ? 'border-stone-800 bg-stone-800' : ''}`}>
                    <div className="w-1.5 h-1.5 bg-stone-50 rounded-full"></div>
                  </div>
                  <input 
                    type="radio" 
                    name="gender" 
                    value="male" 
                    checked={formData.gender === 'male'} 
                    onChange={() => setFormData({...formData, gender: 'male'})}
                    className="hidden"
                  />
                  <span className={`text-xs uppercase tracking-widest ${formData.gender === 'male' ? 'text-stone-800 font-bold' : 'text-stone-400'}`}>乾造 (男)</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center transition-all ${formData.gender === 'female' ? 'border-stone-800 bg-stone-800' : ''}`}>
                     <div className="w-1.5 h-1.5 bg-stone-50 rounded-full"></div>
                  </div>
                  <input 
                    type="radio" 
                    name="gender" 
                    value="female" 
                    checked={formData.gender === 'female'} 
                    onChange={() => setFormData({...formData, gender: 'female'})}
                    className="hidden"
                  />
                  <span className={`text-xs uppercase tracking-widest ${formData.gender === 'female' ? 'text-stone-800 font-bold' : 'text-stone-400'}`}>坤造 (女)</span>
               </label>
             </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-widest">出生日期 (公历)</label>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-widest">出生时间</label>
                <input
                  type="time"
                  required
                  className={inputClass}
                  value={formData.birthTime}
                  onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {method === OracleMethod.MEI_HUA && (
          <div className="text-center py-6">
            <p className="text-sm text-stone-500 tracking-wider leading-relaxed">
              无需言数。<br/>
              梅花易数讲究“触机”。<br/>
              稍后请随心叩击屏幕三次，<br/>
              我们将以你指尖的节奏（时间间隔）起卦。
            </p>
            <div className="mt-4 w-12 h-1 bg-stone-200 mx-auto rounded-full"></div>
          </div>
        )}

        {method === OracleMethod.CE_ZI && (
          <div className="space-y-4">
             {/* Toggle */}
             <div className="flex justify-center gap-6 mb-2">
               <button 
                 type="button" 
                 onClick={() => setCeZiMode('select')}
                 className={`text-xs tracking-widest uppercase pb-1 border-b-2 transition-colors ${ceZiMode === 'select' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400'}`}
               >
                 直觉选字
               </button>
               <button 
                 type="button" 
                 onClick={() => setCeZiMode('input')}
                 className={`text-xs tracking-widest uppercase pb-1 border-b-2 transition-colors ${ceZiMode === 'input' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400'}`}
               >
                 手动输入
               </button>
             </div>

             {ceZiMode === 'input' ? (
                <div className="text-center">
                  <input
                    type="text"
                    maxLength={1}
                    required={ceZiMode === 'input'}
                    placeholder="字"
                    className="w-24 h-24 text-center text-4xl border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:border-stone-800 transition-colors mx-auto block font-serif placeholder-stone-200"
                    value={formData.character}
                    onChange={e => setFormData({ ...formData, character: e.target.value })}
                  />
                </div>
             ) : (
               <div className="grid grid-cols-6 gap-2">
                 {CHARACTER_CARDS.map(char => (
                   <button
                     key={char}
                     type="button"
                     onClick={() => setFormData({ ...formData, character: char })}
                     className={`
                       aspect-square flex items-center justify-center text-lg font-serif rounded border transition-all
                       ${formData.character === char 
                         ? 'bg-stone-800 text-stone-50 border-stone-800 scale-105 shadow-md' 
                         : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'}
                     `}
                   >
                     {char}
                   </button>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>

      {/* Common Query Input */}
      <div>
        <label className="text-xs text-stone-500 uppercase tracking-widest">所求何事?</label>
        <textarea
          required
          rows={2}
          placeholder={activeProfile ? `以 ${activeProfile.name} 的名义提问...` : "心中疑惑，直言无妨..."}
          className={inputClass}
          value={formData.query}
          onChange={e => setFormData({ ...formData, query: e.target.value })}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex justify-center">
        <button
          type="submit"
          disabled={isLoading || !formData.query || (method === OracleMethod.CE_ZI && !formData.character)}
          className={`
            group relative px-8 py-3 bg-stone-800 text-stone-50 font-serif tracking-widest rounded transition-all duration-300
            hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-lg
          `}
        >
          <span className="relative z-10">{isLoading ? '推演中...' : '开启卦象'}</span>
        </button>
      </div>
    </form>
  );
};

export default InputForm;