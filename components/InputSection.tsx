
import React, { useState, useRef } from 'react';
import { Image as ImageIcon, FileText, Mic, X, Loader2, Upload, StopCircle } from 'lucide-react';
import { fileToGenerativePart } from '../services/geminiService';

interface InputSectionProps {
  onAnalyze: (text: string, useDeepContext: boolean, imageBase64?: string, imageMimeType?: string, audioBase64?: string, audioMimeType?: string) => void;
  isAnalyzing: boolean;
  t: any;
  theme: 'light' | 'dark';
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing, t, theme }) => {
  const [mode, setMode] = useState<'selection' | 'text' | 'image' | 'audio'>('selection');
  const [text, setText] = useState('');
  
  // File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'audio' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob, mimeType: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Styles based on theme
  const buttonBase = `
    w-full p-6 rounded-2xl flex items-center gap-4 transition-all duration-200 border text-left group
    ${theme === 'dark' 
      ? 'bg-[#2C2C2C] border-[#383838] hover:border-indigo-500/50 hover:bg-[#333]' 
      : 'bg-white border-stone-100 shadow-sm hover:border-indigo-100 hover:shadow-md'
    }
  `;
  const iconBox = `
    w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0
    ${theme === 'dark' ? 'bg-[#383838] text-indigo-400 group-hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}
  `;
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-stone-800';
  const textSecondary = theme === 'dark' ? 'text-stone-400' : 'text-stone-500';

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFilePreview(url);
        setFileType('image');
        setMode('image');
      } else if (file.type.startsWith('audio/')) {
        setFileType('audio');
        setMode('audio');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedAudio({ blob: audioBlob, mimeType });
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetSelection = () => {
    setMode('selection');
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    setRecordedAudio(null);
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    let imgBase64 = undefined;
    let imgMimeType = undefined;
    let audioBase64 = undefined;
    let audioMimeType = undefined;

    // Handle Image File
    if (fileType === 'image' && selectedFile) {
      imgBase64 = await fileToGenerativePart(selectedFile);
      imgMimeType = selectedFile.type;
    }

    // Handle Audio File
    if (fileType === 'audio' && selectedFile) {
       audioBase64 = await fileToGenerativePart(selectedFile);
       audioMimeType = selectedFile.type;
    }

    // Handle Recorded Audio (Dictation in Text Mode)
    if (recordedAudio) {
      const reader = new FileReader();
      reader.readAsDataURL(recordedAudio.blob);
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          audioBase64 = base64String.split(',')[1];
          audioMimeType = recordedAudio.mimeType;
          resolve();
        };
      });
    }

    onAnalyze(text, false, imgBase64, imgMimeType, audioBase64, audioMimeType);
  };

  // --- Render Modes ---

  if (mode === 'selection') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
        <p className={`mb-6 ${textSecondary}`}>Let's make sense of this together.</p>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className={buttonBase}
        >
          <div className={iconBox}>
            <Upload size={24} />
          </div>
          <div>
            <span className={`block font-bold text-lg ${textPrimary}`}>Upload screenshot or audio</span>
            <span className={`text-sm ${textSecondary}`}>Instant analysis of visual chat or voice</span>
          </div>
        </button>

        <button 
          onClick={() => setMode('text')}
          className={buttonBase}
        >
          <div className={iconBox}>
            <FileText size={24} />
          </div>
          <div>
            <span className={`block font-bold text-lg ${textPrimary}`}>Paste chat text</span>
            <span className={`text-sm ${textSecondary}`}>Type, paste content, or use microphone</span>
          </div>
        </button>

        {/* Hidden File Input: Accepts Images AND Audio */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,audio/*"
            className="hidden"
        />

        {/* Toggle example (Visual only for now per mockup) */}
        <div className={`mt-8 flex items-center justify-between p-4 rounded-xl ${theme === 'dark' ? 'bg-[#2C2C2C]' : 'bg-stone-50'}`}>
           <span className={`font-medium ${textPrimary}`}>Plain language mode</span>
           <div className={`w-12 h-6 rounded-full relative ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
              <div className="absolute right-1 top-1 w-4 h-4 bg-indigo-500 rounded-full"></div>
           </div>
        </div>
      </div>
    );
  }

  // Text Entry Mode (with Mic)
  if (mode === 'text') {
    return (
      <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4">
        <div className={`relative flex-grow rounded-2xl mb-4 overflow-hidden ${theme === 'dark' ? 'bg-[#2C2C2C]' : 'bg-stone-50'}`}>
           
           <textarea
            autoFocus
            className={`
              w-full h-full p-6 text-lg resize-none outline-none bg-transparent
              ${theme === 'dark' ? 'text-white placeholder-stone-500' : 'text-stone-800 placeholder-stone-400'}
            `}
            placeholder="Paste the message here or click the mic to read it out..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Microphone Trigger / status */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {recordedAudio && !isRecording && (
               <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                 Audio Attached <X size={12} className="cursor-pointer" onClick={() => setRecordedAudio(null)}/>
               </div>
            )}

            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="p-3 rounded-full bg-red-500 text-white animate-pulse shadow-lg hover:bg-red-600 transition-colors"
                title="Stop Recording"
              >
                <StopCircle size={24} />
              </button>
            ) : (
              <button 
                onClick={startRecording}
                className={`p-3 rounded-full transition-all shadow-sm ${theme === 'dark' ? 'bg-[#383838] text-indigo-400 hover:bg-[#454545]' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-stone-200'}`}
                title="Read message (Record Audio)"
              >
                <Mic size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={resetSelection}
            className={`px-6 py-4 rounded-2xl font-bold transition-colors ${theme === 'dark' ? 'bg-[#2C2C2C] text-stone-300 hover:bg-[#383838]' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={(!text.trim() && !recordedAudio)}
            className="flex-grow py-4 rounded-2xl bg-[#6366F1] hover:bg-[#5558DD] text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Analyze {recordedAudio ? 'Audio & Text' : 'Text'}
          </button>
        </div>
      </div>
    );
  }

  // Image Preview Mode
  if (mode === 'image' && filePreview) {
    return (
      <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4">
        <div className="relative flex-grow bg-black/5 rounded-2xl overflow-hidden mb-4 border border-stone-200/10 min-h-[300px]">
          <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
          <button 
            onClick={resetSelection}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl bg-[#6366F1] hover:bg-[#5558DD] text-white font-bold text-lg shadow-lg transition-all"
        >
          Analyze Screenshot
        </button>
      </div>
    );
  }

  // Audio File Preview Mode
  if (mode === 'audio' && selectedFile) {
     return (
      <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 justify-between">
         <div className={`flex-grow flex flex-col items-center justify-center rounded-2xl mb-4 border border-dashed ${theme === 'dark' ? 'bg-[#2C2C2C] border-[#383838]' : 'bg-stone-50 border-stone-200'} min-h-[200px]`}>
            <div className={`p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-[#383838] text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Mic size={48} />
            </div>
            <p className={`font-medium ${textPrimary} mb-1`}>{selectedFile.name}</p>
            <p className={`text-sm ${textSecondary}`}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
         </div>

         <div className="flex gap-3">
          <button 
            onClick={resetSelection}
            className={`px-6 py-4 rounded-2xl font-bold transition-colors ${theme === 'dark' ? 'bg-[#2C2C2C] text-stone-300 hover:bg-[#383838]' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-grow py-4 rounded-2xl bg-[#6366F1] hover:bg-[#5558DD] text-white font-bold text-lg shadow-lg transition-all"
          >
            Analyze Audio
          </button>
        </div>
      </div>
     )
  }

  return null;
};

export default InputSection;
