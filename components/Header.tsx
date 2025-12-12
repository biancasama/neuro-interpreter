
import React, { useState } from 'react';
import { ChevronLeft, Globe, Check } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  view: 'home' | 'results'; 
  onBack?: () => void;
  theme: 'light' | 'dark';
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

// Re-introducing the BrainLogo for shared use
export const BrainLogo = ({ size = 48, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-label="Neuro-Sense Logo"
    role="img"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Sage Green - Top Left / Frontal Lobe */}
    <path d="M 28 55 C 18 40 25 20 50 22" stroke="#94B594" strokeWidth="7" />
    <path d="M 43 17 L 50 22 L 43 27" stroke="#94B594" strokeWidth="7" />

    {/* Coral/Orange - Top Right / Parietal */}
    <path d="M 60 22 C 75 22 88 30 82 52" stroke="#E89E84" strokeWidth="7" />
    <path d="M 87 46 L 82 52 L 77 46" stroke="#E89E84" strokeWidth="7" />

    {/* Pastel Yellow - Central */}
    <path d="M 75 58 C 65 65 50 65 35 55" stroke="#EBCB7A" strokeWidth="7" />
    <path d="M 41 51 L 35 55 L 41 59" stroke="#EBCB7A" strokeWidth="7" />

    {/* Soft Blue - Bottom */}
    <path d="M 30 70 C 35 85 65 85 70 75" stroke="#93C0DE" strokeWidth="7" />
    <path d="M 64 71 L 70 75 L 64 79" stroke="#93C0DE" strokeWidth="7" />
    
    <path d="M 50 88 L 50 94" stroke="#94B594" strokeWidth="7" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ view, onBack, theme, language, onLanguageChange }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-stone-900';
  const textSecondary = theme === 'dark' ? 'text-stone-400' : 'text-stone-600';
  const bg = theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-white';
  const border = theme === 'dark' ? 'border-[#383838]' : 'border-stone-200';

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  return (
    <div className="flex items-center justify-between p-6 md:p-8 mb-2 relative w-full">
      {/* Back Button (Left) - Only visible in Results view */}
      <div className="w-24">
        {view === 'results' && onBack && (
          <button 
            onClick={onBack}
            className={`p-2 -ml-2 rounded-full transition-colors flex items-center gap-1 group ${theme === 'dark' ? 'hover:bg-[#383838] text-stone-300' : 'hover:bg-stone-100 text-stone-600'}`}
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">{language === 'en' ? 'Back' : 'Back'}</span>
          </button>
        )}
      </div>
      
      {/* Center Logo */}
      <div className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${view === 'home' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
         <div className="flex items-center gap-3">
           <BrainLogo size={32} />
           <span className={`font-bold text-xl ${textPrimary}`}>Neuro-Sense</span>
         </div>
      </div>

      {/* Right: Language + Auth Buttons */}
      <div className="flex items-center justify-end gap-3 w-auto relative">
         
         {/* Language Selector */}
         <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-stone-300 hover:bg-[#383838]' : 'text-stone-600 hover:bg-stone-100'}`}
              title="Change Language"
            >
              <Globe size={20} />
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}></div>
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl z-50 overflow-hidden ${bg} ${border}`}>
                   {languages.map(l => (
                     <button
                       key={l.code}
                       onClick={() => { onLanguageChange(l.code); setShowLangMenu(false); }}
                       className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${theme === 'dark' ? 'hover:bg-[#333] text-stone-200' : 'hover:bg-stone-50 text-stone-700'}`}
                     >
                       <span className="flex items-center gap-2"><span>{l.flag}</span> {l.name}</span>
                       {language === l.code && <Check size={14} className="text-indigo-500" />}
                     </button>
                   ))}
                </div>
              </>
            )}
         </div>

         <button className={`text-sm md:text-base font-semibold px-4 py-2 rounded-xl transition-colors hidden md:block ${textSecondary} hover:text-indigo-500`}>
           Log in
         </button>
         <button className={`text-sm md:text-base font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm hover:shadow-md hidden md:block ${theme === 'dark' ? 'bg-white text-black hover:bg-stone-200' : 'bg-black text-white hover:bg-stone-800'}`}>
           Sign up
         </button>
      </div>
    </div>
  );
};

export default Header;
