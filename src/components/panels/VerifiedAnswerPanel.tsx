import { useState, useRef, useEffect } from 'react';
import { Database, Search, Send, Loader2, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: Date;
  source?: string;
}

const predefinedQuestions = [
  { label: '🐛 Pest Control', question: 'How to control pests in my crops?' },
  { label: '🌱 Fertilizer Guide', question: 'What is the best fertilizer application method?' },
  { label: '🌧️ Weather Advisory', question: 'How should I prepare for rain season?' },
  { label: '🌾 Crop Rotation', question: 'What crops should I rotate for better yield?' },
];

export const VerifiedAnswerPanel = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to KrishiSahay Verified Database. Ask any question about farming practices, pest control, or crop management. Responses are strictly grounded in verified agricultural knowledge.',
      timestamp: new Date(),
      source: 'FAISS Knowledge Base',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    await sendMessage(query);
    setQuery('');
  };

  const sendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    // Simulate FAISS lookup
    await new Promise(r => setTimeout(r, 1500));

    const systemResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'system',
      content: `Based on verified agricultural data:\n\n${getMockResponse(message)}`,
      timestamp: new Date(),
      source: 'FAISS + KCC Database',
    };

    setMessages(prev => [...prev, systemResponse]);
    setLoading(false);
  };

  const handlePredefinedClick = (question: string) => {
    if (loading) return;
    sendMessage(question);
  };

  return (
    <div className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{t('verifiedAnswer')}</h2>
            <p className="text-xs text-muted-foreground">{t('fromFaiss')}</p>
          </div>
        </div>
      </div>

      {/* Predefined Questions */}
      {messages.length <= 1 && (
        <div className="p-3 border-b border-primary/10">
          <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedQuestions.map((pq, i) => (
              <button
                key={i}
                onClick={() => handlePredefinedClick(pq.question)}
                disabled={loading}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full transition-all',
                  'bg-accent/50 hover:bg-accent text-foreground',
                  'border border-primary/20 hover:border-primary/40',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {pq.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages with Scroll */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        style={{ maxHeight: '350px' }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              'max-w-[85%] animate-fade-in',
              msg.type === 'user' ? 'ml-auto' : 'mr-auto'
            )}
          >
            <div className={cn(
              'rounded-lg p-3',
              msg.type === 'user' 
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent/50 border border-primary/20'
            )}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.source && (
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Database className="w-3 h-3" />
                {msg.source}
              </p>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Searching knowledge base...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="flex justify-center -mt-8 mb-2 relative z-10">
          <button
            onClick={scrollToBottom}
            className={cn(
              'p-2 rounded-full shadow-lg transition-all',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'animate-fade-in'
            )}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-primary/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('askQuestion')}
            className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-accent/50 border border-primary/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

// Mock response generator - to be replaced with actual FAISS integration
const getMockResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('pest') || lowerQuery.includes('kide') || lowerQuery.includes('keet') || lowerQuery.includes('control')) {
    return `**Integrated Pest Management (IPM) Recommendations:**

1. **Biological Control**: Use Trichogramma cards (50,000/ha) for stem borer control
2. **Cultural Practices**: Remove and destroy affected plant parts
3. **Chemical Control**: Apply Chlorantraniliprole @ 0.3ml/L only when pest population exceeds Economic Threshold Level (ETL)

⚠️ Always use protective equipment when handling pesticides.`;
  }

  if (lowerQuery.includes('fertilizer') || lowerQuery.includes('khad') || lowerQuery.includes('urea') || lowerQuery.includes('application')) {
    return `**Fertilizer Application Guide:**

Based on your soil test results:
- **Nitrogen (N)**: Apply in 3 splits - 50% basal, 25% at tillering, 25% at panicle initiation
- **Phosphorus (P)**: Full dose as basal application
- **Potassium (K)**: 50% basal, 50% at panicle initiation

💡 Consider foliar spray of 2% Urea during grain filling stage for better yield.`;
  }

  if (lowerQuery.includes('weather') || lowerQuery.includes('mausam') || lowerQuery.includes('rain') || lowerQuery.includes('prepare')) {
    return `**Weather-Based Advisory:**

Current conditions suggest:
- Delay irrigation if rain is expected within 48 hours
- Apply fungicide preventively before prolonged wet spells
- Ensure proper drainage to prevent waterlogging

📊 Check Market Intelligence for price forecasts considering weather patterns.`;
  }

  if (lowerQuery.includes('rotation') || lowerQuery.includes('yield') || lowerQuery.includes('crop')) {
    return `**Crop Rotation Guidelines:**

Recommended rotation for better yield:
- **Year 1**: Rice/Wheat (cereal)
- **Year 2**: Legumes (Gram, Lentil) - fixes nitrogen
- **Year 3**: Oilseeds (Mustard, Groundnut)
- **Year 4**: Return to cereals

🌱 Benefits: Improved soil fertility, pest control, and 15-20% higher yields.`;
  }

  return `**Agricultural Advisory:**

Your query has been processed against our verified knowledge base containing 15,000+ agricultural records from KCC, ICAR, and State Agricultural Universities.

For more specific guidance, please provide:
- Crop name
- Current growth stage
- Specific problem symptoms

🌱 All recommendations follow Good Agricultural Practices (GAP) guidelines.`;
};
