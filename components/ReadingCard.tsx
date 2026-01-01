import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ReadingResult } from '../types';
import { X, Save, Share2 } from 'lucide-react';
import { METHOD_NAMES } from '../constants';

interface ReadingCardProps {
  result: ReadingResult;
  onClose: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const ReadingCard: React.FC<ReadingCardProps> = ({ result, onClose, onSave, isSaved }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-[#fcfbf9] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-sm shadow-2xl flex flex-col relative animate-[fadeIn_0.5s_ease-out]">
        
        {/* Header / Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 z-10 bg-[#fcfbf9]">
          <div className="text-xs font-bold tracking-widest text-stone-400 uppercase">
            {new Date(result.timestamp).toLocaleDateString('zh-CN')} • {METHOD_NAMES[result.method]}
          </div>
          <div className="flex gap-4">
            {onSave && (
              <button 
                onClick={onSave} 
                className={`transition-colors ${isSaved ? 'text-stone-800' : 'text-stone-300 hover:text-stone-600'}`}
                title="收藏判词"
              >
                <Save size={20} fill={isSaved ? "currentColor" : "none"} />
              </button>
            )}
            <button onClick={onClose} className="text-stone-400 hover:text-stone-800 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar">
          
          {/* Visual Portrait */}
          {result.imageUrl ? (
            <div className="w-full h-64 md:h-80 relative overflow-hidden bg-stone-100">
               <img 
                src={result.imageUrl} 
                alt="Fate Portrait" 
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700 hover:scale-105 transform"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9] to-transparent opacity-80"></div>
               <div className="absolute bottom-4 left-0 right-0 text-center">
                 <p className="text-xs text-stone-500 tracking-[0.4em] uppercase">此刻心境 • 灵韵成像</p>
               </div>
            </div>
          ) : (
             <div className="w-full h-24 bg-stone-50 flex items-center justify-center">
               <span className="text-stone-300 text-sm">灵像未显</span>
             </div>
          )}

          <div className="p-8 md:p-12 pt-4">
            <div className="mb-8 text-center border-b border-stone-200 pb-8">
              <h2 className="text-sm text-stone-500 uppercase tracking-[0.3em] mb-2">所求之事</h2>
              <p className="text-xl font-serif text-stone-800 italic">“{result.query}”</p>
            </div>

            <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:font-serif prose-p:text-stone-700 prose-p:leading-loose prose-li:text-stone-700">
              <ReactMarkdown>{result.content}</ReactMarkdown>
            </div>
            
            <div className="mt-12 pt-8 border-t border-stone-100 flex justify-center">
               <div className="w-16 h-16 border border-stone-200 rounded-full flex items-center justify-center opacity-50">
                  <span className="font-serif text-2xl text-stone-300">易</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReadingCard;