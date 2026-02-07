import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const predefinedQuestions = [
  { label: '💰 Sell Now?', question: 'Should I sell my crop now or wait?' },
  { label: '🌾 Market Trend', question: 'What is the current market trend for wheat?' },
  { label: '🔬 Disease Help', question: 'My crop leaves have yellow spots, what should I do?' },
  { label: '📈 Price Forecast', question: 'What will be the price of rice next month?' },
];

export const ExpertAdvicePanel = () => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: getWelcomeMessage(language),
      timestamp: new Date(),
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

    // Simulate AI response
    await new Promise(r => setTimeout(r, 2000));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: getMockAIResponse(message, language),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setLoading(false);
  };

  const handlePredefinedClick = (question: string) => {
    if (loading) return;
    sendMessage(question);
  };

  return (
    <div className="glass-card h-full flex flex-col border-alert/20">
      {/* Header */}
      <div className="p-4 border-b border-alert/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-alert/30 to-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-alert" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{t('expertAdvice')}</h2>
            <p className="text-xs text-muted-foreground">{t('poweredByWatsonx')}</p>
          </div>
          <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-alert/20 text-alert font-mono">
            EXPERT AI
          </span>
        </div>
      </div>

      {/* Predefined Questions */}
      {messages.length <= 1 && (
        <div className="p-3 border-b border-alert/10">
          <p className="text-xs text-muted-foreground mb-2">Ask the expert:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedQuestions.map((pq, i) => (
              <button
                key={i}
                onClick={() => handlePredefinedClick(pq.question)}
                disabled={loading}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full transition-all',
                  'bg-accent/50 hover:bg-accent text-foreground',
                  'border border-alert/20 hover:border-alert/40',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {pq.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
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
            {msg.type === 'ai' && (
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-4 h-4 text-alert" />
                <span className="text-xs text-alert font-medium">KrishiSahay Expert</span>
              </div>
            )}
            <div className={cn(
              'rounded-lg p-3',
              msg.type === 'user' 
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-br from-accent/80 to-accent/40 border border-alert/20'
            )}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-alert">
            <div className="waveform">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="waveform-bar bg-alert" />
              ))}
            </div>
            <span className="text-sm">Expert is thinking...</span>
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
              'bg-alert text-alert-foreground hover:bg-alert/90',
              'animate-fade-in'
            )}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-alert/20">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('askQuestion')}
            className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-accent/50 border border-alert/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-alert/50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded bg-gradient-to-r from-alert to-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

const getWelcomeMessage = (lang: string): string => {
  const messages: Record<string, string> = {
    en: "Hello! I'm your KrishiSahay Expert powered by IBM Watsonx. I can provide personalized farming advice, market insights, and help you make data-driven decisions. Ask me anything about your crops! 🌾",
    hi: "नमस्ते! मैं IBM Watsonx द्वारा संचालित आपका कृषिसहाय विशेषज्ञ हूं। मैं व्यक्तिगत खेती सलाह, बाजार अंतर्दृष्टि प्रदान कर सकता हूं और डेटा-संचालित निर्णय लेने में आपकी मदद कर सकता हूं। अपनी फसलों के बारे में कुछ भी पूछें! 🌾",
    te: "హలో! నేను IBM Watsonx ద్వారా నడిచే మీ కృషిసహాయ్ నిపుణుడిని. నేను వ్యక్తిగత వ్యవసాయ సలహా, మార్కెట్ అంతర్దృష్టులను అందించగలను మరియు డేటా-ఆధారిత నిర్ణయాలు తీసుకోవడంలో మీకు సహాయపడగలను. మీ పంటల గురించి ఏదైనా అడగండి! 🌾",
    ta: "வணக்கம்! நான் IBM Watsonx மூலம் இயங்கும் உங்கள் கிருஷிசஹாய் நிபுணர். தனிப்பயன் விவசாய ஆலோசனை, சந்தை நுண்ணறிவுகளை வழங்கலாம் மற்றும் தரவு அடிப்படையிலான முடிவுகளை எடுக்க உதவலாம். உங்கள் பயிர்களைப் பற்றி எதையும் கேளுங்கள்! 🌾",
  };
  return messages[lang] || messages.en;
};

const getMockAIResponse = (query: string, lang: string): string => {
  const lowerQuery = query.toLowerCase();

  // Price/Market/Sell queries
  if (lowerQuery.includes('price') || lowerQuery.includes('sell') || lowerQuery.includes('mandi') || lowerQuery.includes('rate') || lowerQuery.includes('wait') || lowerQuery.includes('trend') || lowerQuery.includes('forecast')) {
    return lang === 'hi' 
      ? `📊 **बाजार विश्लेषण:**

वर्तमान बाजार डेटा के आधार पर, मैं देख रहा हूं कि कीमतें 3-वर्षीय औसत से 15% ऊपर हैं। यह एक मजबूत बिक्री संकेत है।

**मेरी सिफारिश:**
- अगले 7-10 दिनों में बेचने पर विचार करें
- स्थानीय मंडी की तुलना में ई-नाम पोर्टल पर बेहतर दर मिल सकती है
- भंडारण लागत पर विचार करें यदि होल्ड करना चाहते हैं

⚠️ यह सलाह है, अंतिम निर्णय आपका है।`
      : `📊 **Market Analysis:**

Based on current market data, I can see prices are 15% above the 3-year average. This is a strong SELL signal.

**My Recommendation:**
- Consider selling within the next 7-10 days
- Check e-NAM portal for potentially better rates than local mandi
- Factor in storage costs if you plan to hold

⚠️ This is advisory - final decision rests with you.`;
  }

  // Disease/Pest queries
  if (lowerQuery.includes('disease') || lowerQuery.includes('pest') || lowerQuery.includes('yellow') || lowerQuery.includes('spot') || lowerQuery.includes('leaves')) {
    return lang === 'hi'
      ? `🔬 **रोग/कीट विश्लेषण:**

आपके विवरण के आधार पर, यह पत्ती धब्बा रोग (Leaf Spot) हो सकता है।

**तत्काल कार्रवाई:**
1. प्रभावित पत्तियों को तुरंत हटाएं
2. Mancozeb @ 2.5g/L का छिड़काव करें
3. 7 दिनों बाद दोहराएं

**रोकथाम:**
- फसल चक्र अपनाएं
- प्रमाणित बीज का उपयोग करें
- जल निकासी सुनिश्चित करें

📸 सटीक निदान के लिए Diagnosis Portal में फोटो अपलोड करें।`
      : `🔬 **Disease/Pest Analysis:**

Based on your description, this could be Leaf Spot disease.

**Immediate Action:**
1. Remove affected leaves immediately
2. Spray Mancozeb @ 2.5g/L
3. Repeat after 7 days

**Prevention:**
- Follow crop rotation
- Use certified seeds
- Ensure proper drainage

📸 Upload a photo in the Diagnosis Portal for accurate identification.`;
  }

  // Default response
  return lang === 'hi'
    ? `🌱 **कृषिसहाय विशेषज्ञ सलाह:**

आपके प्रश्न का विश्लेषण करते हुए, मैं आपको व्यक्तिगत सिफारिशें दे सकता हूं।

कृपया अधिक विशिष्ट जानकारी प्रदान करें:
• आपकी फसल का नाम
• वर्तमान समस्या (यदि कोई हो)
• आपका स्थान/जिला

मैं आपकी मदद के लिए यहां हूं! 🤝`
    : `🌱 **KrishiSahay Expert Advice:**

Analyzing your query, I can provide personalized recommendations.

Please provide more specific information:
• Your crop name
• Current problem (if any)
• Your location/district

I'm here to help! 🤝`;
};
