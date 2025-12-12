import React, { useState, useEffect, useRef } from 'react';
import { View, UserStats } from './types';
import { Navigation } from './components/Navigation';
import { HomeView } from './views/Home';
import { VisionView } from './views/Vision';
import { AudioView } from './views/Audio';
import { ChatView } from './views/Chat';
import { KidsView } from './views/Kids';
import { Trophy } from 'lucide-react';

// Interactive Particle Background Component
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string }[] = [];
    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const particleCount = window.innerWidth < 768 ? 40 : 80;
      for (let i = 0; i < particleCount; i++) {
        // Mix of Gold and White dust
        const isGold = Math.random() > 0.7;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + (isGold ? 0.5 : 0),
          speedX: (Math.random() - 0.5) * 0.1,
          speedY: (Math.random() - 0.5) * 0.1,
          opacity: Math.random() * 0.4 + 0.1,
          color: isGold ? '212, 175, 55' : '255, 255, 255'
        });
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        // Simple mouse interaction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) {
           p.x -= dx * 0.002;
           p.y -= dy * 0.002;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-50" />;
};

// Level Up Notification Component
const LevelUpNotification: React.FC<{ level: number, onClose: () => void }> = ({ level, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="bg-[#0B0C15]/90 backdrop-blur-xl border border-solar-gold/50 rounded-3xl p-10 flex flex-col items-center animate-slide-up shadow-glow-gold pointer-events-auto">
        <div className="w-24 h-24 rounded-full bg-solar-gold/10 flex items-center justify-center mb-6 border border-solar-gold animate-bounce">
          <Trophy size={48} className="text-solar-gold" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">Inner Garden Grows</h2>
        <p className="text-solar-gold text-lg tracking-widest font-bold">LEVEL {level} REACHED</p>
        <p className="text-gray-400 text-xs mt-4 uppercase tracking-wider">Wisdom Expanded</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  
  // Gamification State
  const [stats, setStats] = useState<UserStats>({
    xp: 35,
    level: 1,
    streak: 3
  });
  const [showLevelUp, setShowLevelUp] = useState(false);

  const handleAddXp = (amount: number) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      const xpForNextLevel = prev.level * 100;
      let newLevel = prev.level;
      
      if (newXp >= xpForNextLevel) {
        newLevel += 1;
        setShowLevelUp(true);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  };

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return <HomeView setView={setCurrentView} userStats={stats} onAddXp={handleAddXp} />;
      case View.VISION:
        return <VisionView />;
      case View.AUDIO:
        return <AudioView />;
      case View.CHAT:
        return <ChatView />;
      case View.KIDS:
        return <KidsView onAddXp={handleAddXp} />;
      default:
        return <HomeView setView={setCurrentView} userStats={stats} onAddXp={handleAddXp} />;
    }
  };

  return (
    <div className="relative h-screen w-full bg-solar-bg text-solar-text font-sans overflow-hidden selection:bg-solar-gold/30">
      
      {/* Background Layers */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1E1B4B_0%,_#0B0C15_100%)] z-0"></div>
      
      {/* Ambient Orbs - Deeper, subtler colors */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-solar-indigo/20 rounded-full blur-[120px] animate-float z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-solar-gold/5 rounded-full blur-[100px] animate-float z-0 pointer-events-none" style={{ animationDelay: '-2s' }}></div>
      
      <ParticleBackground />

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full overflow-y-auto no-scrollbar pb-24">
        {renderView()}
      </main>

      {/* Navigation */}
      <Navigation currentView={currentView} setView={setCurrentView} />

      {/* Level Up Overlay */}
      {showLevelUp && <LevelUpNotification level={stats.level} onClose={() => setShowLevelUp(false)} />}
    </div>
  );
};

export default App;