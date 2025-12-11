import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import AnalysisDashboard from './components/AnalysisDashboard';
import PanicButton from './components/PanicButton';
import { AnalysisResult } from './types';
import { analyzeMessageContext } from './services/geminiService';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { DecodingIllustration } from './components/Illustrations';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string, useDeepContext: boolean, imageBase64?: string, mimeType?: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeMessageContext(text, useDeepContext, imageBase64, mimeType);
      setResult(data);
    } catch (err: any) {
      setError("We couldn't decode that message right now. Please try again or check your API key.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cream-50 font-sans pb-24 relative text-left">
      <Header />

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start h-full">
          
          {/* Left Column: Input / Tools */}
          <section className="space-y-6" aria-label="Input Tools">
             <div className="bg-cream-50 lg:sticky lg:top-24">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-sage-800 mb-2 text-left">Input Context</h2>
                  <p className="text-base text-sage-600 leading-relaxed text-left">
                    Upload a screenshot or paste the text. We will analyze the tone to help you understand what is really being said.
                  </p>
                </div>
                <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
             </div>
          </section>

          {/* Right Column: Analysis Results */}
          <section className="min-h-[500px] flex flex-col" aria-label="Decoder Results">
             
             {error && (
              <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-r-lg flex items-start gap-3 animate-in fade-in" role="alert">
                <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

             {isAnalyzing ? (
                <div className="flex-grow flex flex-col items-center justify-center text-sage-500 space-y-6 animate-pulse p-12 bg-white rounded-3xl border border-sage-100">
                   <DecodingIllustration className="w-32 h-32 opacity-50 grayscale" />
                   <p className="text-lg font-medium text-left">Processing context...</p>
                </div>
             ) : result ? (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm font-semibold text-sage-600 hover:text-sage-900 transition-colors mb-4 lg:hidden"
                  >
                    <ArrowLeft size={16} /> Back to Input
                  </button>
                  <AnalysisDashboard result={result} />
               </div>
             ) : (
               /* Empty State / Placeholder */
               <div className="flex-grow flex flex-col items-center justify-center p-12 border-2 border-dashed border-sage-200 rounded-3xl bg-white">
                  <div className="w-64 h-64 mb-6 text-sage-300">
                      {/* The "Nano Banana" Placeholder */}
                      <DecodingIllustration className="w-full h-full" />
                      <span className="sr-only">Illustration of a character decoding a message.</span>
                  </div>
                  <p className="text-sage-400 font-medium text-lg text-left">
                    Results will appear here.
                  </p>
               </div>
             )}
          </section>

        </div>
      </main>

      <PanicButton />
    </div>
  );
};

export default App;