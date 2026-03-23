import { useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

export const VoiceButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { t } = useLanguage();
  
  const toggleListening = () => {
    if (!isListening) {
      // Start speech recognition
      setIsListening(true);
      // TODO: Integrate with Web Speech API or external service
      
      // Simulate listening for 5 seconds
      setTimeout(() => {
        setIsListening(false);
      }, 5000);
    } else {
      setIsListening(false);
    }
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 glass-card p-4 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{t('voiceAssistant')}</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-accent"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          {/* Waveform */}
          <div className="flex items-center justify-center py-6">
            {isListening ? (
              <div className="waveform h-12">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="waveform-bar w-1.5"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      height: `${Math.random() * 30 + 10}px` 
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center">
                <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t('askQuestion')}</p>
              </div>
            )}
          </div>
          
          {/* Status */}
          <div className="text-center">
            {isListening && (
              <p className="text-sm text-primary animate-pulse">{t('listening')}</p>
            )}
          </div>
          
          {/* Mic Button */}
          <button
            onClick={toggleListening}
            className={cn(
              'w-full mt-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all',
              isListening 
                ? 'bg-destructive text-destructive-foreground'
                : 'cta-glow text-primary-foreground'
            )}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Speaking
              </>
            )}
          </button>
          
          {/* Language hint */}
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Supports Hindi, English, Telugu, Tamil
          </p>
        </div>
      )}
      
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center transition-all',
          'shadow-neon hover:shadow-neon-lg',
          isOpen || isListening
            ? 'bg-gradient-to-br from-alert to-primary'
            : 'bg-gradient-neon'
        )}
      >
        {isListening ? (
          <div className="waveform h-6">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="waveform-bar w-1 bg-primary-foreground"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <Mic className="w-6 h-6 text-primary-foreground" />
        )}
      </button>
    </div>
  );
};
