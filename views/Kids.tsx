
import React, { useState, useRef } from 'react';
import { Star, Loader2, Sparkles, Clapperboard, Image as ImageIcon, X, PlayCircle, Palette, Wand2 } from 'lucide-react';
import { generateKidsStory, generateStoryImage, generateVideoPlan } from '../services/geminiService';
import { VideoPlanResult } from '../types';

type Mode = 'STORY' | 'VIDEO';
type AgeGroup = 'KIDS' | 'TEENS' | 'GENZ';

interface CreatorsAtelierProps {
    onAddXp: (amount: number) => void;
}

const AGE_PROMPTS = {
    KIDS: [
        { label: "🦊 Animal Tales", prompt: "A story about a brave fox learning kindness." },
        { label: "🙏 Why We Pray", prompt: "Explain prayer simply with magic sparkles." },
        { label: "🌳 Forest Magic", prompt: "A magical tree that grants wisdom." },
    ],
    TEENS: [
        { label: "⚡ Myth Hero", prompt: "Create a modern profile of a mythological hero." },
        { label: "🎉 Festival Vibe", prompt: "Explain the colors of Holi festival." },
        { label: "🧬 Spirit X Science", prompt: "Connect meditation with brain science." },
    ],
    GENZ: [
        { label: "🎥 Cinematic Wisdom", prompt: "A 10s cinematic script about inner peace." },
        { label: "🔮 Gratitude Viz", prompt: "A cosmic visualization script for gratitude." },
        { label: "🌌 Cyber Mantra", prompt: "Explain 'Om' in a cyber-spiritual aesthetic." },
    ]
};

export const KidsView: React.FC<CreatorsAtelierProps> = ({ onAddXp }) => {
  const [mode, setMode] = useState<Mode>('STORY');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('GENZ');
  const [topic, setTopic] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [storyData, setStoryData] = useState<{title: string, story: string, image: string} | null>(null);
  const [videoPlan, setVideoPlan] = useState<VideoPlanResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !attachedImage) return;
    setIsLoading(true);
    setStoryData(null);
    setVideoPlan(null);

    try {
      if (mode === 'STORY') {
        const { story, prompt } = await generateKidsStory(topic);
        const imageUrl = await generateStoryImage(prompt);
        setStoryData({ title: topic || "New Legend", story, image: imageUrl });
      } else {
        const plan = await generateVideoPlan(topic, attachedImage || undefined);
        setVideoPlan(plan);
      }
      onAddXp(15); // Reward for creation
    } catch (error) {
      alert("Creative block. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setStoryData(null);
    setVideoPlan(null);
    setAttachedImage(null);
    setTopic('');
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-xl mx-auto animate-fade-in pb-32">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
                <Palette className="text-neon-gold" />
                Creator's Atelier
            </h2>
            
            <div className="glass-panel p-1 rounded-full flex gap-1">
                <button 
                onClick={() => { setMode('STORY'); clearResults(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'STORY' ? 'bg-neon-cyan text-black shadow-neon-cyan' : 'text-gray-400'}`}
                >
                Story
                </button>
                <button 
                onClick={() => { setMode('VIDEO'); clearResults(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'VIDEO' ? 'bg-neon-purple text-white shadow-neon-purple' : 'text-gray-400'}`}
                >
                Video
                </button>
            </div>
         </div>
         
         {/* Age Selector */}
         <div className="flex justify-center">
            <div className="bg-white/5 rounded-xl p-1 flex gap-1">
                {(['KIDS', 'TEENS', 'GENZ'] as AgeGroup[]).map((age) => (
                    <button
                        key={age}
                        onClick={() => setAgeGroup(age)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all ${
                            ageGroup === age ? 'bg-white/10 text-white border border-white/20 shadow-sm' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {age === 'KIDS' ? '< 10' : age === 'TEENS' ? '10-15' : '16+'}
                    </button>
                ))}
            </div>
         </div>
      </header>

      {/* Input */}
      {!storyData && !videoPlan && (
        <div className="flex-1 flex flex-col justify-start">
          <div className="glass-panel p-6 rounded-3xl border border-neon-gold/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-white font-display mb-1">
                    {mode === 'STORY' ? 'Weave a Tale' : 'Direct a Vision'}
                </h3>
                <p className="text-xs text-cosmic-subtext">Use AI to spark your imagination.</p>
            </div>

            <div className="space-y-4">
               {/* Prompt Suggestions */}
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                   {AGE_PROMPTS[ageGroup].map((p, i) => (
                       <button
                         key={i}
                         onClick={() => setTopic(p.prompt)}
                         className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-gold/50 transition-all text-xs text-gray-300 flex items-center gap-2"
                       >
                           {p.label}
                       </button>
                   ))}
               </div>

              <div className="relative">
                 <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={mode === 'STORY' ? "Once upon a time..." : "Video concept..."}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-neon-gold/50 transition-all"
                />
                {mode === 'VIDEO' && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <ImageIcon size={20} />
                  </button>
                )}
              </div>
              
              {attachedImage && (
                <div className="relative w-full h-20 rounded-xl overflow-hidden">
                    <img src={attachedImage} className="w-full h-full object-cover opacity-60" alt="Reference" />
                    <button onClick={() => setAttachedImage(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><X size={12} className="text-white"/></button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

              <button 
                onClick={handleGenerate}
                disabled={isLoading || (!topic && !attachedImage)}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all flex justify-center items-center gap-2 ${
                  mode === 'STORY' 
                    ? 'bg-gradient-to-r from-neon-cyan to-blue-500 text-black hover:scale-[1.02] shadow-neon-cyan/50' 
                    : 'bg-gradient-to-r from-neon-purple to-pink-600 text-white hover:scale-[1.02] shadow-neon-purple/50'
                } disabled:opacity-50 disabled:cursor-not-allowed border-0`}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 size={16} /> Generate</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Result */}
      {storyData && (
        <div className="animate-fade-in space-y-6">
           <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl group border border-white/10">
              <img src={storyData.image} alt="Art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <h3 className="absolute bottom-6 left-6 right-6 text-2xl font-bold text-white font-display drop-shadow-lg">{storyData.title}</h3>
           </div>
           
           <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <p className="text-gray-300 leading-loose font-light text-lg">{storyData.story}</p>
           </div>
           
           <button onClick={clearResults} className="w-full py-3 text-cosmic-subtext text-xs uppercase tracking-widest hover:text-white">Start Over</button>
        </div>
      )}

      {/* Video Plan Result */}
      {videoPlan && (
        <div className="animate-fade-in space-y-6">
           <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-neon-purple/20 blur-[60px] rounded-full"></div>
              <span className="text-neon-purple text-[10px] font-bold uppercase tracking-widest mb-2 block">Script Generated</span>
              <h3 className="text-3xl font-bold text-white mb-4">{videoPlan.title}</h3>
              <p className="text-gray-400 italic text-sm border-l-2 border-neon-purple pl-4">{videoPlan.visualStyle}</p>
           </div>

           <div className="space-y-3">
              {videoPlan.scenes.map((scene) => (
                 <div key={scene.sceneNumber} className="glass-panel p-4 rounded-2xl flex gap-4 items-start border border-white/5 hover:bg-white/5 transition-colors">
                    <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                       {scene.sceneNumber}
                    </div>
                    <div>
                       <p className="text-gray-200 text-sm mb-1">{scene.visual}</p>
                       <p className="text-xs text-gray-500 font-mono">{scene.audio}</p>
                    </div>
                 </div>
              ))}
           </div>
           
           <button onClick={clearResults} className="w-full py-3 text-cosmic-subtext text-xs uppercase tracking-widest hover:text-white">New Project</button>
        </div>
      )}
    </div>
  );
};