import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, ScanLine, Maximize, Info } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { VisionResult } from '../types';

export const VisionView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const mimeType = image.split(';')[0].split(':')[1];
      const base64Data = image.split(',')[1];
      const data = await analyzeImage(base64Data, mimeType);
      setResult(data);
    } catch (error) {
      alert("Signal lost. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in max-w-xl mx-auto">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Visual Scan</h2>
          <p className="text-sm text-cosmic-subtext">Decode the matrix.</p>
        </div>
        <div className="p-2 bg-neon-cyan/10 rounded-lg">
           <Maximize size={20} className="text-neon-cyan" />
        </div>
      </header>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-3xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden min-h-[400px]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="w-20 h-20 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-neon-cyan/30 shadow-neon-cyan">
             <Camera size={32} className="text-neon-cyan" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Tap to Capture</h3>
          <p className="text-xs text-cosmic-subtext max-w-[200px] text-center">
            Upload an image of a symbol, deity, or ritual object.
          </p>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {/* Viewfinder */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-black shadow-2xl border border-white/10">
            <img src={image} alt="Preview" className="w-full h-full object-cover opacity-80" />
            
            <div className="absolute top-4 right-4">
              <button onClick={() => { setImage(null); setResult(null); }} className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            {/* Scanning Overlay */}
            {!result && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-neon-cyan"></div>
                    <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-neon-cyan"></div>
                    <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-neon-cyan"></div>
                    <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-neon-cyan"></div>
                    
                    {isLoading ? (
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neon-cyan shadow-[0_0_20px_#2AE3FF] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button 
                                onClick={handleAnalyze}
                                className="pointer-events-auto bg-neon-cyan text-black font-bold px-8 py-3 rounded-full shadow-neon-cyan hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <ScanLine size={18} /> Identify
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {/* Result Overlay */}
            {result && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
                    <h3 className="text-2xl font-bold text-white mb-2 text-gradient-cyan">{result.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-3">{result.explanation}</p>
                </div>
            )}
          </div>

          {/* Details Cards */}
          {result && (
            <div className="space-y-4 animate-slide-up pb-20">
               <div className="glass-panel p-5 rounded-2xl border-l-4 border-neon-cyan">
                  <div className="flex items-center gap-2 mb-2 text-neon-cyan">
                      <Info size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Symbolism</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{result.symbolism}</p>
               </div>
               
               <div className="glass-panel p-5 rounded-2xl border-l-4 border-neon-purple">
                  <div className="flex items-center gap-2 mb-2 text-neon-purple">
                      <Info size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Origin Story</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{result.history}</p>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};