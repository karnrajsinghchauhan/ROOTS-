import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

export const ChatView: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hey! I\'m Roots 🌿. What\'s on your mind today? We can talk symbols, dreams, or just vibe.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const responseText = await sendChatMessage(userMsg.text, history);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "My connection to the cosmic cloud is glitching. Try again? 🌌"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto w-full relative">
      <header className="px-6 py-4 glass-panel sticky top-0 z-20 border-b border-white/5 backdrop-blur-xl flex items-center justify-between">
         <h2 className="text-lg font-bold text-white flex items-center gap-2">
           <Bot size={20} className="text-neon-purple" />
           Cosmic Guide
         </h2>
         <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_5px_#2AE3FF]"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-5 py-3 text-[15px] leading-relaxed backdrop-blur-md border shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-neon-purple/20 border-neon-purple/50 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white/5 border-white/10 text-gray-200 rounded-2xl rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
             <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-[90px] left-0 right-0 px-4">
        <div className="glass-panel p-2 rounded-full flex items-center gap-2 border-white/20 shadow-glass-hover">
          <div className="pl-4">
             <Sparkles size={18} className="text-neon-gold" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the universe..."
            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-500 text-sm h-10"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-white/10 text-white p-2.5 rounded-full hover:bg-white/20 transition-all disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};