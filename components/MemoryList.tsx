
import React from 'react';
import { Memory } from '../types';
import { X, Trash2, Calendar, MessageSquare } from 'lucide-react';

interface Props {
  memories: Memory[];
  onClose: () => void;
  onDelete: (id: string) => void;
  t: any;
}

const MemoryList: React.FC<Props> = ({ memories, onClose, onDelete, t }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} />
       
       {/* Drawer */}
       <div className="relative w-full max-w-md h-full bg-stone-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white">
            <h2 className="text-xl font-bold text-stone-800">{t.memoriesTitle}</h2>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-stone-400 mt-20 gap-4">
                <div className="p-4 bg-stone-100 rounded-full">
                  <MessageSquare size={32} className="opacity-50" />
                </div>
                <p>{t.noMemories}</p>
              </div>
            ) : (
              memories.map(m => (
                <div key={m.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(m.timestamp).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => onDelete(m.id)} 
                      className="text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title={t.delete}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-stone-600 italic border-l-2 border-stone-200 pl-3 line-clamp-3">
                      "{m.originalText}"
                    </p>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-lg text-sm border border-stone-100">
                    <p className="font-semibold text-stone-700 mb-1 text-xs uppercase tracking-wide">{t.subtext}</p>
                    <p className="text-stone-600 leading-relaxed">{m.analysis.emotionalSubtext}</p>
                  </div>
                </div>
              ))
            )}
          </div>
       </div>
    </div>
  );
}
export default MemoryList;
