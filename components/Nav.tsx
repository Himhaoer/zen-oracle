import React from 'react';
import { OracleMethod } from '../types';
import { METHOD_DESCRIPTIONS, METHOD_NAMES } from '../constants';
import { Feather, Hash, Type } from 'lucide-react';

interface NavProps {
  currentMethod: OracleMethod;
  setMethod: (m: OracleMethod) => void;
  disabled: boolean;
}

const Nav: React.FC<NavProps> = ({ currentMethod, setMethod, disabled }) => {
  const items = [
    { id: OracleMethod.HE_LUO, label: '河洛', icon: <Feather size={18} /> },
    { id: OracleMethod.MEI_HUA, label: '梅花', icon: <Hash size={18} /> },
    { id: OracleMethod.CE_ZI, label: '测字', icon: <Type size={18} /> },
  ];

  return (
    <div className="w-full flex flex-col items-center space-y-4 mb-10">
      <div className="flex p-1 bg-stone-200/50 rounded-full relative">
        {items.map((item) => {
          const isActive = currentMethod === item.id;
          return (
            <button
              key={item.id}
              onClick={() => !disabled && setMethod(item.id)}
              disabled={disabled}
              className={`
                relative z-10 px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-500
                ${isActive ? 'text-stone-50' : 'text-stone-500 hover:text-stone-800'}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {item.icon}
              <span className="font-serif tracking-widest text-sm font-bold">{item.label}</span>
              {isActive && (
                <div className="absolute inset-0 bg-stone-800 rounded-full -z-10 shadow-md" />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="h-6 text-stone-500 text-xs tracking-[0.2em] font-light fade-in">
        {METHOD_DESCRIPTIONS[currentMethod]}
      </div>
    </div>
  );
};

export default Nav;