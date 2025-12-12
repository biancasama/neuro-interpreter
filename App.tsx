
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, Language, Memory } from './types';
import { analyzeMessageContext } from './services/geminiService';
import InputSection from './components/InputSection';
import AnalysisDashboard from './components/AnalysisDashboard';
import Header, { BrainLogo } from './components/Header';
import { translations } from './utils/translations';
import { Moon, Sun, ArrowRight, Youtube, Instagram, Twitter, MessageCircle, Music } from 'lucide-react';
import { PhoneMockupIllustration } from './components/Illustrations';

// Footer Component tailored for the App Card
const Footer = ({ theme }: { theme: 'light' | 'dark' }) => {
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-stone-900';
  const textSecondary = theme === 'dark' ? 'text-stone-400' : 'text-stone-500';
  const borderCol = theme === 'dark' ? 'border-white/10' : 'border-stone-200';

  return (
    <footer className={`w-full py-8 mt-12 border-t ${borderCol} transition-colors duration-500`}>
      <div className="flex flex-col gap-8 text-left">
        
        {/* Brand Section */}
        <div className="flex flex-col items-start">
           <div className="flex items-center gap-2 mb-2">
             <BrainLogo size={24} />
             <span className={`font-bold text-lg ${textPrimary}`}>Neuro-Sense</span>
           </div>
           <p className={`text-xs ${textSecondary} mb-4 leading-relaxed`}>
             Magical context decoder.<br/>Understand tone, reply with confidence.
           </p>
        </div>

        {/* Links Grid - Mobile Friendly */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
           {/* Column 1 */}
           <div>
             <h4 className={`font-bold text-sm mb-3 ${textPrimary}`}>Use Cases</h4>
             <ul className={`space-y-2 text-xs ${textSecondary}`}>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Individuals</a></li>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Couples</a></li>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Workplace</a></li>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Therapy Support</a></li>
             </ul>
           </div>

           {/* Column 2 */}
           <div>
             <h4 className={`font-bold text-sm mb-3 ${textPrimary}`}>Company</h4>
             <ul className={`space-y-2 text-xs ${textSecondary}`}>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Careers</a></li>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Blog</a></li>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Influencer program</a></li>
             </ul>
           </div>

           {/* Column 3 (Span 2 to center or fill) */}
           <div className="col-span-2">
             <h4 className={`font-bold text-sm mb-3 ${textPrimary}`}>Legal</h4>
             <ul className={`space-y-2 text-xs ${textSecondary} flex flex-col`}>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Terms of Service</a></li>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-indigo-500 transition-colors">Refund Policy</a></li>
             </ul>
           </div>
        </div>

        {/* Divider */}
        <div className={`h-px w-full ${theme === 'dark' ? 'bg-white/10' : 'bg-stone-200'}`}></div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col gap-4">
          
          <div className={`text-xs ${textSecondary}`}>
             Copyright © 2025 Neuro-Sense, Inc.<br/> All rights reserved.
          </div>

          <div className={`flex items-center gap-4 ${textSecondary}`}>
            <a href="#" className="hover:text-indigo-500 transition-colors"><Youtube size={18} /></a>
            <a href="#" className="hover:text-indigo-500 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="hover:text-indigo-500 transition-colors"><Music size={18} /></a>
            <a href="#" className="hover:text-indigo-500 transition-colors"><Twitter size={18} /></a>
            <a href="#" className="hover:text-indigo-500 transition-colors"><MessageCircle size={18} /></a>
          </div>
        </div>

      </div>
    </footer>
  );
};

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Navigation State: 'home' (includes hero + input) | 'results'
  const [view, setView] = useState<'home' | 'results'>('home');
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const decodeSectionRef = useRef<HTMLDivElement>(null);

  // Load theme preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  const t = translations[language];

  const handleAnalyze = async (
    text: string, 
    useDeepContext: boolean, 
    imageBase64?: string, 
    imageMimeType?: string,
    audioBase64?: string,
    audioMimeType?: string
  ) => {
    setIsAnalyzing(true);
    setError(null);
    
    // Move to results view immediately to show loading state
    setView('results');

    try {
      const data = await analyzeMessageContext(
        text, 
        useDeepContext, 
        'English', 
        imageBase64, 
        imageMimeType,
        audioBase64, 
        audioMimeType
      );
      setResult(data);
    } catch (err: any) {
      setError(t.error);
      setView('home'); // Go back on error
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setView('home');
  };

  const scrollToDecode = () => {
    decodeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Common Container Classes for the "Mobile App" look
  const containerClass = `
    min-h-screen transition-colors duration-500 ease-in-out font-sans flex flex-col items-center justify-center p-4
    ${theme === 'dark' ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-[#F2F4F8] text-[#1F2937]'}
  `;

  const cardClass = `
    w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden relative flex flex-col shadow-2xl transition-all duration-500
    ${theme === 'dark' ? 'bg-[#1E1E1E] shadow-black/40' : 'bg-white shadow-stone-200'}
    max-h-[90vh] h-[800px]
  `;

  return (
    <div className={containerClass}>
      
      {/* Theme Toggle (Floating) */}
      <button 
        onClick={toggleTheme}
        className={`fixed top-6 left-6 z-50 p-3 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-[#2C2C2C] text-yellow-400 hover:bg-[#383838]' : 'bg-white text-stone-600 shadow-md hover:bg-stone-50'}`}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Main App Card */}
      <div className={cardClass}>
        
        {/* Header - Fixed at top */}
        <div className="flex-none z-10 bg-inherit border-b border-transparent">
           <Header 
            view={view} 
            onBack={view === 'results' ? handleReset : undefined}
            theme={theme}
          />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar px-8 pb-8 scroll-smooth">
          
          {/* VIEW 1: HOME (Hero + Input stacked) */}
          {view === 'home' && (
            <div className="flex flex-col min-h-full pt-4">
               {/* Main Hero Content */}
               <div className="flex flex-col items-center text-center justify-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
                  <div className="mb-6 flex flex-col items-center">
                    <BrainLogo size={80} className="mb-6" />
                    <h1 className={`text-4xl font-bold mb-3 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                      Neuro-Sense
                    </h1>
                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                      Understand tone. Reply with confidence.
                    </p>
                  </div>

                  <div className="mb-8 w-full flex justify-center transform scale-90">
                      <PhoneMockupIllustration className="w-64 h-64 drop-shadow-lg" />
                  </div>

                  <button 
                    onClick={scrollToDecode}
                    className="w-full py-4 rounded-2xl bg-[#6366F1] hover:bg-[#5558DD] text-white font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Get started
                  </button>
               </div>

               {/* Separator / Scroll Indicator */}
               <div className="flex justify-center mb-16 opacity-20">
                 <div className="w-1 h-8 bg-current rounded-full"></div>
               </div>

               {/* INPUT SECTION ("The second frame") */}
               <div id="decode-section" ref={decodeSectionRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700 mb-12 scroll-mt-24">
                  <div className="mb-8">
                    <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>Decode</h2>
                    <p className={`text-lg ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                      Paste the confusing text or upload a screenshot.
                    </p>
                  </div>
                  
                  <InputSection 
                    onAnalyze={handleAnalyze} 
                    isAnalyzing={isAnalyzing} 
                    t={t} 
                    theme={theme}
                  />
               </div>

               {/* Footer */}
               <Footer theme={theme} />
            </div>
          )}

          {/* VIEW 2: RESULTS */}
          {view === 'results' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col pt-8">
               {isAnalyzing ? (
                 <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>Analyzing...</h3>
                      <p className={`mt-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>Reading between the lines</p>
                    </div>
                 </div>
               ) : (
                 <AnalysisDashboard 
                   result={result} 
                   onSave={() => {}} 
                   t={t} 
                   theme={theme}
                 />
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;
