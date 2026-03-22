import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import api from '../../utils/api';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I'm your AI Resume Assistant. How can I help you improve your resume today? You can ask me to write a summary, suggest skills, or just give general advice." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/generate', {
        prompt: userMsg,
        type: 'chat'
      });
      
      setMessages(prev => [...prev, { role: 'bot', content: data.result || "I'm sorry, I couldn't process that request." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Oops! Something went wrong while connecting to the AI service." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-indigo-600 p-3 flex items-center space-x-2 text-white shadow-sm">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-sm font-bold tracking-tight">AI Assistant</h3>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex space-x-2 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`flex-none w-7 h-7 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white border text-slate-400 border-slate-200 shadow-sm'}`}>
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-100 text-slate-700 shadow-sm'}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 text-slate-400 px-3 py-2 rounded-2xl text-xs flex items-center space-x-2 shadow-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            placeholder="Ask AI anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-1 top-1 bottom-1 px-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
