import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, ToggleRight, ToggleLeft, BrainCircuit } from 'lucide-react';
import { fileToGenerativePart } from '../services/geminiService';

interface InputSectionProps {
  onAnalyze: (text: string, useDeepContext: boolean, imageBase64?: string, mimeType?: string) => void;
  isAnalyzing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [useDeepContext, setUseDeepContext] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!text && !imageFile) return;

    let base64 = undefined;
    let mimeType = undefined;

    if (imageFile) {
      base64 = await fileToGenerativePart(imageFile);
      mimeType = imageFile.type;
    }

    onAnalyze(text, useDeepContext, base64, mimeType);
  };

  return (
    <div className="w-full space-y-6">
        
        {/* Text Input */}
        <div className="space-y-2">
          <label htmlFor="message-input" className="block text-sm font-semibold text-sage-800">
            Paste Message Text
          </label>
          <textarea
            id="message-input"
            className="w-full h-48 p-4 rounded-xl bg-white text-sage-900 placeholder-sage-400 border-2 border-neutral-600 focus:border-sage-600 focus:ring-0 resize-none text-base leading-relaxed transition-all outline-none"
            placeholder="e.g., 'Fine, do whatever you want.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
           <label className="block text-sm font-semibold text-sage-800">
            Or Upload Screenshot
          </label>
          
          {imagePreview ? (
            <div className="relative w-full h-48 bg-cream-100 rounded-xl overflow-hidden border-2 border-neutral-300">
              <img src={imagePreview} alt="Uploaded chat screenshot" className="w-full h-full object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-white border border-neutral-300 rounded-full text-neutral-800 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                disabled={isAnalyzing}
                aria-label="Remove image"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Click to upload a screenshot"
              className="w-full h-24 border-2 border-dashed border-sage-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white hover:border-sage-500 transition-colors bg-sage-50"
            >
              <div className="flex items-center gap-2 text-sage-600 font-medium">
                <ImageIcon size={20} aria-hidden="true" />
                <span>Upload Screenshot</span>
              </div>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          aria-hidden="true"
        />

        {/* Gemini 3 Toggle */}
        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-sage-200">
           <div className="flex items-center gap-2">
              <BrainCircuit size={18} className={useDeepContext ? "text-sage-600" : "text-sage-400"} />
              <label htmlFor="deep-context-toggle" className="text-sm font-semibold text-sage-800 cursor-pointer select-none">
                Enable Deep Context (Gemini 3 Pro)
              </label>
           </div>
           <button 
             id="deep-context-toggle"
             onClick={() => setUseDeepContext(!useDeepContext)}
             className="focus:outline-none text-sage-600 hover:text-sage-800 transition-colors"
             aria-pressed={useDeepContext}
           >
             {useDeepContext ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-sage-300" />}
           </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={(!text && !imageFile) || isAnalyzing}
          className={`
            w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2
            transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-sage-200
            ${(!text && !imageFile) || isAnalyzing 
              ? 'bg-neutral-400 cursor-not-allowed' 
              : 'bg-sage-600 hover:-translate-y-1 shadow-md hover:shadow-lg'
            }
          `}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={20} aria-hidden="true" />
              <span>Decoding...</span>
            </>
          ) : (
            <>
              <Upload size={20} aria-hidden="true" />
              <span>Analyze Message</span>
            </>
          )}
        </button>

    </div>
  );
};

export default InputSection;