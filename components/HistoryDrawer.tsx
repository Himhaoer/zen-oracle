import React from 'react';
import { ReadingResult } from '../types';
import { METHOD_NAMES } from '../constants';
import { Trash2, ChevronRight, Clock } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ReadingResult[];
  onSelect: (r: ReadingResult) => void;
  onDelete: (id: string) => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, history, onSelect, onDelete }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-[#f9f8f6] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-stone-200
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-stone-400" />
            命理记录
          </h2>
          
          <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-3">
            {history.length === 0 ? (
              <div className="text-center text-stone-400 mt-10 text-sm italic">
                暂无记录。
                <br/>未来可期。
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-white p-4 rounded-sm border border-stone-100 hover:border-stone-300 transition-all cursor-pointer shadow-sm relative"
                  onClick={() => onSelect(item)}
                >
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">{METHOD_NAMES[item.method]}</span>
                      <span className="text-[10px] text-stone-400">{new Date(item.timestamp).toLocaleDateString('zh-CN')}</span>
                   </div>
                   <p className="text-sm text-stone-800 font-serif line-clamp-2 mb-2">
                     {item.query}
                   </p>
                   
                   <button 
                     onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                     className="absolute bottom-2 right-2 p-1 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryDrawer;