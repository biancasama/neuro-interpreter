import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import AnalysisDashboard from './components/AnalysisDashboard';
import PanicButton from './components/PanicButton';
import { AnalysisResult } from './types';
import { analyzeMessageContext } from './services/geminiService';
import { AlertCircle } from 'lucide-react';
import { IntroIllustration } from './components/Illustrations';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string, imageBase64?: string, mimeType?: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeMessageContext(text, imageBase64, mimeType);
      setResult(data);
    } catch (err: any) {
      setError("We couldn't decode that message right now. Please try again or check your API key.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 font-sans pb-24 relative">
      <Header />

      <main className="container mx-auto px-4 pt-8 md:pt-12 space-y-12 max-w-5xl">
        
        {/* Intro Text & Visual Anchor */}
        {!result && !isAnalyzing && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex-1 text-center md:text-left space-y-4">
                <h2 className="text-3xl md:text-4xl font-semibold text-sage-800 tracking-tight">
                  Decode the hidden meaning.
                </h2>
                <p className="text-sage-600 text-lg leading-relaxed">
                  Not sure if they're mad, busy, or just joking? Upload a screenshot or paste text to get a clear translation.
                </p>
             </div>
             <div className="hidden md:block opacity-80 text-sage-700">
                <IntroIllustration className="w-40 h-40" />
             </div>
          </div>
        )}

        <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

        {error && (
          <div className="max-w-xl mx-auto bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in" role="alert">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="min-h-[200px]">
          <AnalysisDashboard result={result} />
        </div>

      </main>

      <PanicButton />
    </div>
  );
};

export default App;
