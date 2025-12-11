import React, { useState } from 'react';
import { AnalysisResult, RiskLevel } from '../types';
import { Check, Copy, AlertTriangle, ShieldCheck, Zap, BrainCircuit, MessageSquare, BookOpen, Heart } from 'lucide-react';

interface Props {
  result: AnalysisResult | null;
}

const AnalysisDashboard: React.FC<Props> = ({ result }) => {
  if (!result) return null;

  const getRiskColors = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          icon: <ShieldCheck className="w-5 h-5" />,
          barColor: 'bg-emerald-500'
        };
      case RiskLevel.CAUTION:
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: <AlertTriangle className="w-5 h-5" />,
          barColor: 'bg-amber-500'
        };
      case RiskLevel.CONFLICT:
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-800',
          icon: <Zap className="w-5 h-5" />,
          barColor: 'bg-rose-500'
        };
    }
  };

  const theme = getRiskColors(result.riskLevel);

  return (
    <div className="w-full space-y-8">
      
      {/* 1. Literal Meaning Section */}
      <section className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
        <h3 className="text-lg font-bold text-sage-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-sage-500" />
          Literal Meaning
        </h3>
        <p className="text-sage-800 text-base leading-relaxed text-left">
          {result.literalMeaning}
        </p>
      </section>

      {/* 2. Emotional Subtext Section */}
      <section className={`rounded-2xl p-6 border ${theme.bg} ${theme.border} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
           <h3 className={`text-lg font-bold ${theme.text} flex items-center gap-2`}>
            <Heart size={20} />
            Emotional Subtext
          </h3>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full text-xs font-semibold">
             <span>Confidence: {result.confidenceScore}%</span>
             <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className={`h-full ${theme.barColor}`} style={{ width: `${result.confidenceScore}%` }}></div>
             </div>
          </div>
        </div>
        <p className={`${theme.text} text-base leading-relaxed text-left`}>
          {result.emotionalSubtext}
        </p>
      </section>

      {/* 3. Suggested Response Section */}
      <section className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
        <h3 className="text-lg font-bold text-sage-800 mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-sage-500" />
          Suggested Response
        </h3>
        <div className="space-y-4">
          {result.suggestedResponse.map((reply, index) => (
            <ReplyCard key={index} text={reply} />
          ))}
        </div>
      </section>

    </div>
  );
};

const ReplyCard: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-cream-50 rounded-xl p-4 border border-sage-100 hover:border-sage-300 transition-colors group">
      <p className="text-sage-800 text-base leading-relaxed mb-3 text-left">
        {text}
      </p>
      <div className="flex justify-end">
        <button 
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-sage-200 text-sage-600 hover:bg-sage-100'}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default AnalysisDashboard;