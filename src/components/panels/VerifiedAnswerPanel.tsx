import { useState, useRef, useEffect } from 'react';
import { Database, Search, Send, Loader2, ArrowDown, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: Date;
  source?: string;
  error?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  gemini:      '✨ Gemini AI',
  huggingface: '🤗 HuggingFace',
  offline_kb:  '📚 Knowledge Base',
};

const QUICK = [
  { label: '🐛 Pest Control', q: 'How to control aphids and whitefly in vegetable crops?' },
  { label: '🌱 NPK Guide',    q: 'What is the correct NPK fertilizer schedule for rice?' },
  { label: '🌧️ Monsoon Prep', q: 'How to protect crops before the monsoon season?' },
  { label: '🔄 Crop Rotation',q: 'Best crop rotation to improve soil health and yield?' },
];

export const VerifiedAnswerPanel = () => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', type: 'system',
      content: 'Welcome to KrishiSahay Knowledge Base — powered by Gemini AI with verified agricultural data from ICAR, KCC, and government sources. Ask any farming question.',
      timestamp: new Date(), source: 'system',
    },
  ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), timestamp: new Date() }]);
  };

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;
    addMessage({ type: 'user', content: question });
    setLoading(true);

    try {
      // Use a verified/factual prompt prefix
      const result = await api.ai.advice(
        `Provide verified, factual agricultural advice based on ICAR research: ${question}`,
        language
      );
      addMessage({
        type: 'system',
        content: result.response,
        source: result.source,
      });
    } catch (err: unknown) {
      const isNetwork = err instanceof TypeError && err.message.includes('fetch');
      addMessage({
        type: 'system', error: true, source: 'error',
        content: isNetwork
          ? '❌ Cannot reach backend server. Make sure it is running on port 8000.'
          : `❌ Error: ${err instanceof Error ? err.message : 'Request failed'}. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setQuery('');
    sendMessage(q);
  };

  return (
    <div className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{t('verifiedAnswer')}</h2>
            <p className="text-xs text-muted-foreground">ICAR • KCC • Govt Sources via Gemini AI</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">15K+ Records</span>
        </div>
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="p-3 border-b border-primary/10">
          <p className="text-xs text-muted-foreground mb-2">Common questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((pq, i) => (
              <button key={i} onClick={() => sendMessage(pq.q)} disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full bg-accent/50 hover:bg-accent text-foreground border border-primary/20 hover:border-primary/40 disabled:opacity-50 transition-all">
                {pq.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={containerRef}
        onScroll={() => {
          if (!containerRef.current) return;
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          setShowScroll(scrollHeight - scrollTop - clientHeight > 80);
        }}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: '340px' }}>
        {messages.map(msg => (
          <div key={msg.id} className={cn('max-w-[88%] animate-fade-in', msg.type === 'user' ? 'ml-auto' : 'mr-auto')}>
            <div className={cn(
              'rounded-xl p-3 text-sm leading-relaxed',
              msg.type === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : msg.error
                  ? 'bg-destructive/10 border border-destructive/20 rounded-bl-sm'
                  : 'bg-accent/50 border border-primary/20 rounded-bl-sm'
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.source && msg.source !== 'system' && msg.source !== 'error' && (
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Database className="w-2.5 h-2.5" />
                {SOURCE_LABELS[msg.source] || msg.source}
              </p>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-xs animate-pulse">Querying Gemini AI…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showScroll && (
        <div className="flex justify-center -mt-7 mb-1 z-10 relative">
          <button onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-primary/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder={t('askQuestion')} disabled={loading}
            className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-accent/50 border border-primary/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-60 transition-colors" />
          <button type="submit" disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-40">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
