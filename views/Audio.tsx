import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Loader2, Radio, Disc } from 'lucide-react';
import { analyzeAudio } from '../services/geminiService';
import { AudioAnalysisResult } from '../types';

export const AudioView: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AudioAnalysisResult | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAnalysis(null);
      setAudioBlob(null);
    } catch (err) {
      alert("Mic access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await analyzeAudio(base64Data, audioBlob.type);
        setAnalysis(result);
        setIsAnalyzing(false);
      };
    } catch (error) {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-xl mx-auto animate-fade-in">
      <header className="mb-12">
        <h2 className="text-3xl font-display font-bold text-white">Sonic Link</h2>
        <p className="text-sm text-cosmic-subtext">Analyze chants & vibrations.</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Visualizer Circle */}
        <div className="relative mb-12">
          {isRecording && (
            <div className="absolute inset-0 bg-neon-red/20 rounded-full blur-2xl animate-pulse"></div>
          )}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
              isRecording 
                ? 'border-neon-red bg-neon-red/10 scale-110' 
                : 'border-white/20 bg-white/5 hover:border-neon-purple hover:shadow-neon-purple'
            }`}
          >
            {isRecording ? (
              <div className="w-8 h-8 bg-neon-red rounded animate-pulse" />
            ) : (
              <Mic size={40} className="text-white opacity-80" />
            )}
          </button>
        </div>

        <div className="text-center space-y-2 h-20">
           <h3 className="text-xl font-bold text-white tracking-wide">
             {isRecording ? "Recording..." : audioBlob ? "Audio Captured" : "Tap to Record"}
           </h3>
           <p className="text-xs text-cosmic-subtext uppercase tracking-widest">
             {isRecording ? "Listening to frequency" : "Waiting for input"}
           </p>
        </div>

        {audioBlob && !isRecording && !analysis && (
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="mt-4 glass-button px-8 py-3 rounded-full text-white font-bold flex items-center gap-2 hover:bg-white/10 transition-all border-neon-purple/50"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" /> : <><Radio size={18} /> Analyze Frequency</>}
            </button>
        )}
      </div>

      {analysis && (
        <div className="pb-24 animate-slide-up">
           <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-purple/20 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                    <Disc className="text-neon-purple animate-spin-slow" />
                    <h3 className="text-xl font-bold text-white">{analysis.title}</h3>
                 </div>
                 <p className="text-gray-300 leading-relaxed mb-6 font-light">
                   {analysis.meaning}
                 </p>
                 <div className="pt-4 border-t border-white/10">
                    <span className="text-xs text-cosmic-subtext uppercase tracking-wider block mb-1">Origin</span>
                    <p className="text-neon-cyan">{analysis.origin}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};