import React, { useState, useEffect, useRef } from 'react';
import { OracleMethod } from '../types';

interface RitualOverlayProps {
  method: OracleMethod;
  onComplete: (data?: any) => void;
}

const RitualOverlay: React.FC<RitualOverlayProps> = ({ method, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [instruction, setInstruction] = useState('');
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mei Hua: Track tap times to calculate intervals
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  useEffect(() => {
    switch (method) {
      case OracleMethod.HE_LUO:
        setInstruction('长按磨墨 • 注入意念');
        break;
      case OracleMethod.MEI_HUA:
        setInstruction('随心而叩 • 间隔即数 (0/3)');
        break;
      case OracleMethod.CE_ZI:
        setInstruction('点击落水 • 镜花水月');
        break;
    }
  }, [method]);

  // Handle Ripples
  const addRipple = (x: number, y: number) => {
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  // 1. He Luo: Hold to Fill (Grinding Ink)
  const [isHolding, setIsHolding] = useState(false);
  useEffect(() => {
    let interval: any;
    if (isHolding && method === OracleMethod.HE_LUO) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => onComplete(), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isHolding, method, onComplete]);

  // 2. Mei Hua: Tap logic with Interval capture
  const handleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    
    // Add ripple visual
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      addRipple(e.clientX - rect.left, e.clientY - rect.top);
    }

    if (method === OracleMethod.MEI_HUA) {
      setTapTimes(prev => {
        // Use functional update to ensure we have the latest state even on fast clicks
        const newTapTimes = [...prev, now];
        const tapCount = newTapTimes.length;
        
        // Update visual progress based on new count
        setProgress((tapCount / 3) * 100);
        setInstruction(`随心而叩 • 间隔即数 (${tapCount}/3)`);

        if (tapCount >= 3) {
          // Calculate intervals immediately
          const interval1 = newTapTimes[1] - newTapTimes[0];
          const interval2 = newTapTimes[2] - newTapTimes[1];
          // Pass back
          setTimeout(() => onComplete({ tapInterval1: interval1, tapInterval2: interval2 }), 500);
        }
        
        return newTapTimes;
      });
      
    } else if (method === OracleMethod.CE_ZI) {
       // Single tap for water
       setProgress(100);
       setTimeout(() => onComplete(), 800);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-20 bg-[#fcfbf9]/90 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer select-none"
      onMouseDown={() => method === OracleMethod.HE_LUO && setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
      onTouchStart={() => method === OracleMethod.HE_LUO && setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
      onClick={handleTap}
    >
       {/* Instruction */}
       <div className="absolute top-1/4 text-center pointer-events-none w-full px-4">
          <p className="text-xl font-serif text-stone-800 tracking-[0.3em] animate-pulse">
            {instruction}
          </p>
          {method === OracleMethod.MEI_HUA && tapTimes.length > 0 && tapTimes.length < 3 && (
             <p className="text-xs text-stone-400 mt-2 tracking-widest uppercase">
               感受呼吸... 等待... 再叩
             </p>
          )}
       </div>

       {/* Visuals */}
       <div className="relative w-40 h-40 flex items-center justify-center pointer-events-none">
          
          {/* Progress Circle Background */}
          <div className="absolute inset-0 border border-stone-200 rounded-full opacity-30 scale-110"></div>
          
          {/* Active Visual based on method */}
          {method === OracleMethod.HE_LUO && (
             <div 
               className="w-full h-full bg-stone-900 rounded-full transition-transform duration-100 ease-linear shadow-xl"
               style={{ transform: `scale(${progress / 100})`, opacity: 0.8 }}
             ></div>
          )}

          {method === OracleMethod.CE_ZI && (
             <div className="w-1 h-1 bg-stone-800 rounded-full absolute top-0 animate-bounce"></div>
          )}
          
          {method === OracleMethod.MEI_HUA && (
             <div className="w-full h-full flex items-center justify-center">
                <div 
                   className="w-20 h-20 bg-stone-800 rounded-full transition-all duration-300"
                   style={{ transform: `scale(${progress / 100})`, opacity: 0.2 }}
                />
             </div>
          )}
          
          {/* Ripple Effects for Taps */}
          {ripples.map(r => (
            <div 
              key={r.id}
              className="absolute rounded-full border border-stone-400 opacity-0 animate-[ping_1s_ease-out]"
              style={{ 
                left: r.x - 100, 
                top: r.y - 100,
                width: 50, 
                height: 50,
              }}
            ></div>
          ))}
       </div>

       {/* Screen-wide ripples */}
       {ripples.map(r => (
         <div 
            key={r.id + '_screen'}
            className="fixed rounded-full border border-stone-500 pointer-events-none"
            style={{
              left: r.x,
              top: r.y,
              width: '10px',
              height: '10px',
              transform: 'translate(-50%, -50%)',
              animation: 'ripple 1s ease-out forwards'
            }}
         />
       ))}

       <style>{`
         @keyframes ripple {
           0% { width: 0px; height: 0px; opacity: 0.6; border-width: 4px; }
           100% { width: 300px; height: 300px; opacity: 0; border-width: 0px; }
         }
       `}</style>

    </div>
  );
};

export default RitualOverlay;