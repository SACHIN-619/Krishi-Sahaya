import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ChevronDown, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'system' | 'ai';
  content: string;
  timestamp: Date;
  source?: string;
}

interface PredefinedQuestion {
  label: string;
  question: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
  placeholder: string;
  predefinedQuestions: PredefinedQuestion[];
  headerContent: React.ReactNode;
  loadingText?: string;
  variant?: 'primary' | 'accent';
}

export const ChatPanel = ({
  messages,
  onSendMessage,
  loading,
  placeholder,
  predefinedQuestions,
  headerContent,
  loadingText = 'Thinking...',
  variant = 'primary',
}: ChatPanelProps) => {
  const [query, setQuery] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSendMessage(query);
    setQuery('');
  };

  const handlePredefinedClick = (question: string) => {
    if (loading) return;
    onSendMessage(question);
  };

  const borderColor = variant === 'accent' ? 'border-alert/20' : 'border-primary/20';
  const buttonBg = variant === 'accent' 
    ? 'bg-gradient-to-r from-alert to-primary' 
    : 'bg-primary';

  return (
    <div className={cn('glass-card h-full flex flex-col', borderColor)}>
      {/* Header */}
      <div className={cn('p-4 border-b', borderColor)}>
        {headerContent}
      </div>

      {/* Predefined Questions */}
      {messages.length <= 1 && predefinedQuestions.length > 0 && (
        <div className="p-4 border-b border-primary/10">
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
        className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth"
        style={{ maxHeight: '400px' }}
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
                📁 {msg.source}
              </p>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{loadingText}</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={cn(
            'absolute bottom-20 left-1/2 -translate-x-1/2 z-10',
            'p-2 rounded-full shadow-lg transition-all',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'animate-fade-in'
          )}
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className={cn('p-4 border-t', borderColor)}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'w-full pl-4 pr-12 py-2.5 rounded-lg text-sm',
              'bg-accent/50 border text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:border-primary/50 transition-colors',
              borderColor
            )}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded',
              buttonBg,
              'text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
