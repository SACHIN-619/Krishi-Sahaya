import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { VerifiedAnswerPanel } from '@/components/panels/VerifiedAnswerPanel';
import { ExpertAdvicePanel } from '@/components/panels/ExpertAdvicePanel';
import { cn } from '@/lib/utils';

const AdvisoryPage = () => {
  const { t } = useLanguage();
  const [verifiedCollapsed, setVerifiedCollapsed] = useState(false);
  const [expertCollapsed, setExpertCollapsed] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('advisory')}</h1>
          <p className="text-muted-foreground text-sm">AI-powered agricultural consultation</p>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="relative rounded-xl overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=200&fit=crop"
          alt="Advisory"
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent flex items-center">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground">Ask Anything About Farming</h2>
            <p className="text-sm text-muted-foreground">Get verified answers and expert AI advice in your language</p>
          </div>
        </div>
      </div>
      
      {/* Chat Panels with Collapse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Database Panel */}
        <div className="flex flex-col">
          <button
            onClick={() => setVerifiedCollapsed(!verifiedCollapsed)}
            className="lg:hidden flex items-center justify-between glass-card p-4 rounded-t-xl border-b-0"
          >
            <span className="font-semibold text-foreground">{t('verifiedAnswer')}</span>
            {verifiedCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
          <div className={cn(
            'transition-all duration-300 overflow-hidden',
            verifiedCollapsed ? 'max-h-0 lg:max-h-none' : 'max-h-[600px]',
            'lg:block'
          )}>
            <div className="h-[500px] lg:h-[600px]">
              <VerifiedAnswerPanel />
            </div>
          </div>
        </div>
        
        {/* Expert Advice Panel */}
        <div className="flex flex-col">
          <button
            onClick={() => setExpertCollapsed(!expertCollapsed)}
            className="lg:hidden flex items-center justify-between glass-card p-4 rounded-t-xl border-b-0"
          >
            <span className="font-semibold text-foreground">{t('expertAdvice')}</span>
            {expertCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
          <div className={cn(
            'transition-all duration-300 overflow-hidden',
            expertCollapsed ? 'max-h-0 lg:max-h-none' : 'max-h-[600px]',
            'lg:block'
          )}>
            <div className="h-[500px] lg:h-[600px]">
              <ExpertAdvicePanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryPage;
