import React, { useState, useEffect } from 'react';
import { OracleMethod, ReadingRequest, ReadingResult, UserProfile, SoulCard } from './types';
import { consultOracle } from './services/oracle';
import Nav from './components/Nav';
import InputForm from './components/InputForm';
import ReadingCard from './components/ReadingCard';
import HistoryDrawer from './components/HistoryDrawer';
import ProfileDrawer from './components/ProfileDrawer';
import RitualOverlay from './components/RitualOverlay';
import { Menu, Sparkles, User } from 'lucide-react';

const STORAGE_KEY = 'zen_oracle_history';
const PROFILES_KEY = 'zen_oracle_profiles';
const ACTIVE_PROFILE_KEY = 'zen_oracle_active_profile';

const App: React.FC = () => {
  const [method, setMethod] = useState<OracleMethod>(OracleMethod.HE_LUO);
  const [appState, setAppState] = useState<'input' | 'ritual' | 'loading'>('input');
  
  const [currentReading, setCurrentReading] = useState<ReadingResult | null>(null);
  const [history, setHistory] = useState<ReadingResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<ReadingRequest | null>(null);

  // Profile State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');

  // Initial Load
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      
      const savedProfiles = localStorage.getItem(PROFILES_KEY);
      let parsedProfiles: UserProfile[] = [];
      if (savedProfiles) {
         parsedProfiles = JSON.parse(savedProfiles);
         setProfiles(parsedProfiles);
      }

      const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (savedActiveId && parsedProfiles.find(p => p.id === savedActiveId)) {
        setActiveProfileId(savedActiveId);
      } else if (parsedProfiles.length > 0) {
        setActiveProfileId(parsedProfiles[0].id);
      } else {
        // Init default profile
        const newId = crypto.randomUUID();
        const defaultProfile: UserProfile = { 
          id: newId, 
          name: '', 
          gender: 'male', 
          birthDate: '', 
          occupation: '', 
          bio: '', 
          soulCards: [] 
        };
        setProfiles([defaultProfile]);
        setActiveProfileId(newId);
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
  }, []);

  // Persist Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
  }, [profiles]);

  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
    }
  }, [activeProfileId]);


  const handleFormSubmit = (data: Partial<ReadingRequest>) => {
    const request: ReadingRequest = {
      method: data.method!,
      query: data.query!,
      gender: data.gender,
      birthDate: data.birthDate,
      birthTime: data.birthTime,
      character: data.character,
    };
    setPendingRequest(request);
    setAppState('ritual');
  };

  const handleRitualComplete = async (ritualData?: any) => {
    if (!pendingRequest) return;
    
    setAppState('loading');
    
    // Merge ritual data
    const finalRequest = { ...pendingRequest, ...ritualData };
    
    try {
      const result = await consultOracle(finalRequest);
      setCurrentReading(result);
      setHistory(prev => [result, ...prev]);
    } catch (error) {
      alert("灵台蒙尘，连接中断。请重试。");
    } finally {
      setAppState('input');
      setPendingRequest(null);
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };
  
  // Profile Management
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleAddProfile = () => {
    const newId = crypto.randomUUID();
    const newProfile: UserProfile = { 
      id: newId, 
      name: `新命主 ${profiles.length + 1}`, 
      gender: 'male', 
      birthDate: '', 
      occupation: '', 
      bio: '', 
      soulCards: [] 
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newId);
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-800 font-serif overflow-x-hidden selection:bg-stone-200">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Main Layout */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          
          <button 
             onClick={() => setIsProfileOpen(true)}
             className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500 relative"
          >
             <User size={24} />
             {activeProfile && activeProfile.name && (
               <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap opacity-60">
                 {activeProfile.name}
               </span>
             )}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center text-stone-50">
              <span className="font-bold text-lg leading-none mt-1">易</span>
            </div>
            <h1 className="text-xl font-bold tracking-widest uppercase">灵台 · 易</h1>
          </div>
          
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto transition-all duration-500">
          
          <div className="mb-12 text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-stone-800">
              问卦 · 寻心
            </h2>
            <p className="text-stone-400 text-sm tracking-widest uppercase">
              万物皆数 • 心诚则灵
            </p>
          </div>

          <Nav 
            currentMethod={method} 
            setMethod={setMethod} 
            disabled={appState !== 'input'} 
          />

          <div className="w-full relative min-h-[400px]">
            {appState === 'loading' ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 fade-in">
                 <div className="w-24 h-24 rounded-full border border-stone-200 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-t-2 border-stone-800 rounded-full animate-spin"></div>
                    <Sparkles className="text-stone-300 animate-pulse" size={32} />
                 </div>
                 <p className="text-sm tracking-widest text-stone-400 animate-pulse">天机推演中...</p>
               </div>
            ) : (
               <>
                  <InputForm 
                    method={method} 
                    onSubmit={handleFormSubmit} 
                    isLoading={false}
                    activeProfile={activeProfile} 
                  />
                  
                  {/* Ritual Overlay */}
                  {appState === 'ritual' && pendingRequest && (
                    <RitualOverlay 
                      method={pendingRequest.method} 
                      onComplete={handleRitualComplete} 
                    />
                  )}
               </>
            )}
          </div>

        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-stone-300 tracking-widest uppercase">
          <p>© {new Date().getFullYear()} Zen Oracle AI</p>
        </footer>
      </div>

      {/* Modals/Drawers */}
      {currentReading && (
        <ReadingCard 
          result={currentReading} 
          onClose={() => setCurrentReading(null)} 
          isSaved={history.some(h => h.id === currentReading.id)}
          onSave={() => {
            if (!history.some(h => h.id === currentReading.id)) {
              setHistory([currentReading, ...history]);
            }
          }}
        />
      )}

      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(reading) => {
          setCurrentReading(reading);
          setIsHistoryOpen(false);
        }}
        onDelete={handleDeleteHistory}
      />
      
      <ProfileDrawer 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={setActiveProfileId}
        onUpdateProfile={handleUpdateProfile}
        onAddProfile={handleAddProfile}
      />

    </div>
  );
};

export default App;