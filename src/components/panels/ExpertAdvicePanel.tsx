import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, ArrowDown, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  source?: string;
  error?: boolean;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  gemini:      { label: '✨ Gemini AI',      color: 'text-blue-500' },
  huggingface: { label: '🤗 HuggingFace',    color: 'text-orange-500' },
  offline_kb:  { label: '📚 Knowledge Base', color: 'text-muted-foreground' },
  error:       { label: '⚠️ Error',           color: 'text-destructive' },
};

const QUICK = [
  { label: '💰 Sell Now?',    q: 'Should I sell my cotton crop now or wait for better prices?' },
  { label: '🌾 Wheat Rust',   q: 'How to protect wheat from yellow rust disease this season?' },
  { label: '🔬 Yellow Spots', q: 'My crop leaves have yellow spots — what disease could this be?' },
  { label: '🏛️ PM-KISAN',    q: 'How do I apply for PM-KISAN scheme? What documents are needed?' },
];

const WELCOME: Record<string, string> = {
  en: "Hello! I'm KrishiSahay Expert powered by Gemini AI. Ask me anything about crops, diseases, market prices, or government schemes! 🌾",
  hi: "नमस्ते! मैं KrishiSahay विशेषज्ञ हूं। फसल, रोग, बाजार भाव या सरकारी योजनाओं के बारे में कुछ भी पूछें! 🌾",
  te: "నమస్కారం! నేను KrishiSahay నిపుణుడిని. పంటలు, వ్యాధులు, మార్కెట్ ధరలు లేదా ప్రభుత్వ పథకాల గురించి అడగండి! 🌾",
  ta: "வணக்கம்! நான் KrishiSahay நிபுணர். பயிர்கள், நோய்கள், சந்தை விலைகள் பற்றி கேளுங்கள்! 🌾",
};

export const ExpertAdvicePanel = () => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', type: 'ai', content: WELCOME[language] || WELCOME.en, timestamp: new Date(), source: 'system' },
  ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check backend on mount
    api.system.health()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), timestamp: new Date() }]);
  };

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;

    addMessage({ type: 'user', content: question });
    setLoading(true);

    try {
      const result = await api.ai.advice(question, language);
      setBackendOk(true);
      addMessage({
        type: 'ai',
        content: result.response,
        source: result.source,
      });
    } catch (err: unknown) {
      setBackendOk(false);
      const isNetwork = err instanceof TypeError && err.message.includes('fetch');
      addMessage({
        type: 'ai',
        error: true,
        source: 'error',
        content: isNetwork
          ? '❌ Cannot reach the backend server.\n\nMake sure the backend is running:\n```\ncd backend\nuvicorn app.app:app --reload --port 8000\n```\nOr check that VITE_API_URL points to your Render deployment.'
          : `❌ Server error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
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
    <div className="glass-card h-full flex flex-col border-yellow-500/20">
      {/* Header */}
      <div className="p-4 border-b border-yellow-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/30 to-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground">{t('expertAdvice')}</h2>
            <p className="text-xs text-muted-foreground">Gemini AI → HuggingFace → Knowledge Base</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {backendOk === true && <Wifi className="w-3.5 h-3.5 text-primary" />}
            {backendOk === false && <WifiOff className="w-3.5 h-3.5 text-destructive" />}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-mono">
              AI LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Backend offline warning */}
      {backendOk === false && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">
            Backend server not reachable. Start it with <code className="bg-destructive/10 px-1 rounded">uvicorn app.app:app --port 8000</code> or deploy to Render.
          </p>
        </div>
      )}

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="p-3 border-b border-yellow-500/10">
          <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((pq, i) => (
              <button
                key={i}
                onClick={() => sendMessage(pq.q)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full bg-accent/50 hover:bg-accent text-foreground border border-yellow-500/20 hover:border-yellow-500/40 disabled:opacity-50 transition-all"
              >
                {pq.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={() => {
          if (!containerRef.current) return;
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          setShowScroll(scrollHeight - scrollTop - clientHeight > 80);
        }}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: '340px' }}
      >
        {messages.map(msg => (
          <div key={msg.id} className={cn('max-w-[88%] animate-fade-in', msg.type === 'user' ? 'ml-auto' : 'mr-auto')}>
            {msg.type === 'ai' && (
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">KrishiSahay Expert</span>
                {msg.source && msg.source !== 'system' && (
                  <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/50',
                    SOURCE_LABELS[msg.source]?.color || 'text-muted-foreground')}>
                    {SOURCE_LABELS[msg.source]?.label || msg.source}
                  </span>
                )}
              </div>
            )}
            <div className={cn(
              'rounded-xl p-3 text-sm leading-relaxed',
              msg.type === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : msg.error
                  ? 'bg-destructive/10 border border-destructive/20 rounded-bl-sm'
                  : 'bg-gradient-to-br from-accent/80 to-accent/40 border border-yellow-500/20 rounded-bl-sm'
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mr-auto">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs animate-pulse">Consulting Gemini AI…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showScroll && (
        <div className="flex justify-center -mt-7 mb-1 z-10 relative">
          <button onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="p-1.5 rounded-full bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 transition-colors">
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-yellow-500/20">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('askQuestion')}
            disabled={loading}
            className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-accent/50 border border-yellow-500/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-500/50 disabled:opacity-60 transition-colors"
          />
          <button type="submit" disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-primary text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Gemini AI → HuggingFace → Offline KB (in order of availability)
        </p>
      </form>
    </div>
  );
};
