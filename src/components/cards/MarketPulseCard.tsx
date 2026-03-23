import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useMarketPrices } from '@/hooks/useDataSources';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { cn } from '@/lib/utils';

export const MarketPulseCard = () => {
  const { data, loading, error, isDemo } = useMarketPrices();
  const { t } = useLanguage();
  
  if (loading) return <SkeletonCard className="min-h-[140px]" />;
  
  if (error || !data || data.length === 0) {
    return (
      <div className="glass-card p-4 min-h-[140px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('noData')}</p>
      </div>
    );
  }
  
  // Get the most significant price movement
  const topMover = data.reduce((prev, curr) => 
    Math.abs(curr.deltaPercent) > Math.abs(prev.deltaPercent) ? curr : prev
  );
  
  const isPositive = topMover.deltaPercent >= 0;
  
  return (
    <div className="glass-card-hover p-4 min-h-[140px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('marketPulse')}</span>
        </div>
        {isDemo && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-alert/20 text-alert font-mono">
            DEMO
          </span>
        )}
      </div>
      
      {/* Commodity Name */}
      <p className="text-xs text-muted-foreground mb-1">{topMover.commodity}</p>
      
      {/* Main Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold font-mono neon-text">
          ₹{topMover.currentPrice.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">/quintal</span>
      </div>
      
      {/* Delta */}
      <div className="flex items-center gap-2">
        <div className={cn(
          'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono',
          isPositive ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{topMover.deltaPercent.toFixed(1)}%
        </div>
        <span className="text-[10px] text-muted-foreground">{t('vs3YearAvg')}</span>
      </div>
      
      {/* Signal */}
      <div className="flex items-center justify-between mt-2">
        <span className={cn(
          'text-xs font-bold font-mono',
          topMover.signal === 'SELL' ? 'text-primary' : 
          topMover.signal === 'BUY' ? 'alert-glow' : 'text-muted-foreground'
        )}>
          {topMover.signal}
        </span>
        <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
          {topMover.market}
        </span>
      </div>
    </div>
  );
};
