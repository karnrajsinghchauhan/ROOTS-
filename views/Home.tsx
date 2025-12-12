import React, { useState, useEffect } from 'react';
import { View, MeditationResult, UserStats } from '../types';
import { ArrowRight, Sparkles, Zap, Aperture, Leaf, Play, RotateCw, X, Volume2, Loader2, Flame, Flower2 } from 'lucide-react';
import { generateMeditation, generateSpeech } from '../services/geminiService';

interface HomeProps {
  setView: (view: View) => void;
  userStats: UserStats;
  onAddXp: (amount: number) => void;
}

export const HomeView: React.FC<HomeProps> = ({ setView, userStats, onAddXp }) => {
  const [showMeditation, setShowMeditation] = useState(false);
  const [loadingMeditation, setLoadingMeditation] = useState(false);
  const [meditation, setMeditation] = useState<MeditationResult | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  
  // Breathing Animation State
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    if (showMeditation) {
        const inhaleTime = 4000;
        const holdTime = 4000; // Increased hold for calmer pace
        const exhaleTime = 4000;
        
        const cycle = () => {
            setBreathPhase('Inhale');
            setTimeout(() => {
                setBreathPhase('Hold');
                setTimeout(() => {
                    setBreathPhase('Exhale');
                }, holdTime);
            }, inhaleTime);
        };

        cycle(); // Start immediately
        const interval = setInterval(cycle, inhaleTime + holdTime + exhaleTime);
        
        return () => clearInterval(interval);
    }
  }, [showMeditation]);

  const handleStartMeditation = async () => {
    setShowMeditation(true);
    setLoadingMeditation(true);
    setMeditation(null);
    
    try {
      const result = await generateMeditation();
      setMeditation(result);
    } catch (e) {
      console.error(e);
      setShowMeditation(false);
    } finally {
      setLoadingMeditation(false);
    }
  };

  const handleFinishSession = () => {
    setShowMeditation(false);
    onAddXp(10);
  };

  const handlePlayAudio = async () => {
    if (!meditation || playingAudio) return;
    setPlayingAudio(true);
    try {
      const fullText = `${meditation.intro} ... ${meditation.visualization} ... ${meditation.reflection}`;
      await generateSpeech(fullText);
    } catch (e) {
      console.error(e);
    } finally {
      setPlayingAudio(false);
    }
  };

  const handleRegenerate = async () => {
      handleStartMeditation();
  };

  // Calculate Level Progress
  const progressPercent = (userStats.xp % 100);

  return (
    <div className="max-w-xl mx-auto px-6 py-8 animate-fade-in pb-32 relative">
      
      {/* Header & Stats */}
      <header className="flex items-center justify-between mb-10 mt-2">
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight text-white drop-shadow-md">
            ROOTS<span className="text-solar-gold text-4xl">.</span>
          </h1>
          <p className="text-solar-subtext text-xs tracking-widest uppercase mt-1">Wisdom Companion</p>
        </div>
        
        {/* Inner Garden Indicator */}
        <div className="flex flex-col items-end gap-1">
           <div className="flex items-center gap-2 mb-1">
             <div className="flex items-center gap-1 text-solar-gold bg-solar-gold/10 px-2 py-0.5 rounded-full border border-solar-gold/20">
                <Flame size={10} className="fill-solar-gold" />
                <span className="text-[9px] font-bold tracking-widest">{userStats.streak} DAY</span>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="text-right">
                 <div className="text-[10px] uppercase font-bold text-solar-subtext">Inner Garden</div>
                 <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-solar-green to-emerald-300 transition-all duration-1000" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-solar-green shadow-glow-green">
                  <Flower2 size={18} />
              </div>
           </div>
        </div>
      </header>

      {/* Main "Daily Meditate" Orb Trigger */}
      <div className="mb-12 relative group cursor-pointer" onClick={handleStartMeditation}>
        <div className="absolute inset-0 bg-solar-gold/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <div className="glass-panel p-8 rounded-[40px] border border-solar-gold/20 relative overflow-hidden transition-all duration-500 hover:border-solar-gold/40 hover:translate-y-[-4px]">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles size={120} className="text-solar-gold" strokeWidth={0.5} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-solar-gold/10 text-solar-gold text-[10px] font-bold tracking-widest uppercase border border-solar-gold/20">
                        Daily Practice
                    </span>
                </div>
                <h3 className="text-2xl font-display text-white leading-tight mb-6 max-w-[80%]">
                    Align your breath with the <span className="text-solar-green italic">rhythm</span> of the cosmos.
                </h3>
                
                <div className="flex items-center gap-3 text-sm font-medium text-solar-gold group-hover:gap-4 transition-all">
                    <span>Begin Session</span>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Vision Card */}
        <button 
          onClick={() => setView(View.VISION)}
          className="glass-panel p-6 rounded-3xl h-48 flex flex-col justify-between items-start text-left hover:bg-white/5 transition-all duration-300 group border-white/5 hover:border-solar-green/30 relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-solar-green/10 blur-[50px] rounded-full group-hover:bg-solar-green/20 transition-all"></div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
            <Aperture size={24} className="text-solar-green" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-white mb-1">Visual Decoder</h4>
            <p className="text-xs text-solar-subtext">Scan symbols & objects.</p>
          </div>
        </button>

        {/* Audio Card */}
        <button 
          onClick={() => setView(View.AUDIO)}
          className="glass-panel p-6 rounded-3xl h-48 flex flex-col justify-between items-start text-left hover:bg-white/5 transition-all duration-300 group border-white/5 hover:border-solar-gold/30 relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-solar-gold/10 blur-[50px] rounded-full group-hover:bg-solar-gold/20 transition-all"></div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
            <Zap size={24} className="text-solar-gold" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-white mb-1">Sonic Analysis</h4>
            <p className="text-xs text-solar-subtext">Interpret chants & mantras.</p>
          </div>
        </button>

        {/* Creators Atelier Card */}
        <button 
          onClick={() => setView(View.KIDS)}
          className="col-span-2 glass-panel p-6 rounded-3xl flex items-center justify-between text-left hover:bg-white/5 transition-all duration-300 group border-white/5 hover:border-white/20"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 group-hover:rotate-12 transition-transform duration-300">
              <Leaf size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-white">Creator's Atelier</h4>
              <p className="text-xs text-solar-subtext">Weave stories & cinematic visions.</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
            <ArrowRight size={16} className="text-white" />
          </div>
        </button>

      </div>
      
      {/* Footer Text */}
      <div className="mt-16 text-center opacity-30">
        <div className="w-1 h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto mb-4"></div>
        <p className="text-[10px] text-solar-subtext uppercase tracking-[0.4em]">Ancient Wisdom • Future Tech</p>
      </div>

      {/* Meditation Modal */}
      {showMeditation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
           {/* Immersive Backdrop */}
           <div className="absolute inset-0 bg-[#05060A]/95 transition-opacity duration-500 animate-fade-in">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1E1B4B_0%,_#000000_80%)] opacity-60"></div>
              {/* Floating Dust Particles */}
              {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="absolute w-1 h-1 bg-solar-gold rounded-full opacity-40 animate-dust-rise" 
                       style={{ 
                           left: `${Math.random() * 100}%`, 
                           top: `${Math.random() * 100}%`,
                           animationDelay: `${Math.random() * 5}s`,
                           animationDuration: `${10 + Math.random() * 10}s`
                       }} 
                  />
              ))}
           </div>

           {/* Content Card */}
           <div className="relative w-full max-w-lg glass-panel rounded-[32px] p-0 shadow-2xl animate-slide-up overflow-hidden border border-white/10 max-h-[90vh] flex flex-col">
              
              <button 
                onClick={handleFinishSession}
                className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors z-20 backdrop-blur-md"
              >
                <X size={20} />
              </button>

              {loadingMeditation ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-8">
                  <div className="relative">
                    <div className="w-20 h-20 border-2 border-solar-gold/20 border-t-solar-gold rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-2 h-2 bg-solar-gold rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-solar-gold font-bold tracking-widest text-xs uppercase animate-pulse">Consulting the Archives...</p>
                </div>
              ) : meditation ? (
                <div className="relative z-10 flex flex-col h-full overflow-hidden bg-gradient-to-b from-transparent to-black/40">
                   
                   {/* Breathing Visualization Section */}
                   <div className="flex-1 flex flex-col items-center justify-center py-10 min-h-[300px] relative">
                      
                      {/* Polished Bronze Orb */}
                      <div className="relative flex items-center justify-center w-64 h-64">
                         {/* Glow Layer */}
                         <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-[4000ms] ${breathPhase === 'Inhale' || breathPhase === 'Hold' ? 'bg-solar-green/30 scale-125' : 'bg-solar-gold/10 scale-90'}`}></div>
                         
                         {/* Main Orb */}
                         <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#B8860B] to-[#5D4037] shadow-[inset_0_2px_20px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.5)] animate-breathe relative overflow-hidden flex items-center justify-center border border-white/10">
                            {/* Inner Light Pulse */}
                            <div className={`absolute inset-0 bg-solar-green opacity-0 transition-opacity duration-[4000ms] mix-blend-overlay ${breathPhase === 'Inhale' || breathPhase === 'Hold' ? 'opacity-60' : 'opacity-0'}`}></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/90 drop-shadow-md relative z-10">{breathPhase}</span>
                         </div>

                         {/* Orbital Ring */}
                         <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.4] animate-spin-slow opacity-30"></div>
                      </div>
                   </div>

                   {/* Text Content */}
                   <div className="bg-black/20 backdrop-blur-xl border-t border-white/5 p-8 pb-10 space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-display font-medium text-white mb-4">{meditation.title}</h2>
                      </div>
                      
                      <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                          <p className="text-gray-300 text-sm leading-relaxed font-light">{meditation.intro}</p>
                          <p className="text-gray-300 text-sm leading-relaxed font-light">{meditation.visualization}</p>
                          <div className="pl-4 border-l-2 border-solar-gold/50 py-1">
                             <p className="text-solar-text text-sm italic">"{meditation.reflection}"</p>
                          </div>
                      </div>

                      {/* Controls */}
                      <div className="flex gap-3 pt-4">
                          <button 
                            onClick={handlePlayAudio}
                            disabled={playingAudio}
                            className="flex-1 bg-[#F3F4F6] hover:bg-white text-black font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                          >
                            {playingAudio ? <Loader2 className="animate-spin text-black" size={16} /> : <Volume2 size={16} />}
                            <span className="text-xs uppercase tracking-wider">Listen</span>
                          </button>
                          <button 
                            onClick={handleRegenerate}
                            className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 transition-colors"
                            title="New Session"
                          >
                            <RotateCw size={18} />
                          </button>
                      </div>
                   </div>
                </div>
              ) : null}
           </div>
        </div>
      )}

    </div>
  );
};