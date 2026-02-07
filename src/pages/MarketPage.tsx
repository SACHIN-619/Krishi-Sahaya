import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useMarketPrices } from '@/hooks/useDataSources';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonTable } from '@/components/ui/skeleton-loader';
import { cn } from '@/lib/utils';

const MarketPage = () => {
  const { data, loading, error, isDemo } = useMarketPrices();
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('market')}</h1>
            <p className="text-muted-foreground text-sm">Real-time mandi prices and market intelligence</p>
          </div>
        </div>
        {isDemo && (
          <span className="text-xs px-3 py-1 rounded-full bg-alert/20 text-alert font-mono">
            DEMO DATA
          </span>
        )}
      </div>
      
      {/* Market Overview Image */}
      <div className="relative rounded-xl overflow-hidden h-40">
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=300&fit=crop"
          alt="Market overview"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <p className="text-foreground font-semibold">Today's Market Trends</p>
          <p className="text-muted-foreground text-sm">Updated live from major APMCs</p>
        </div>
      </div>
      
      {/* Price Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={6} />
          </div>
        ) : error || !data ? (
          <div className="p-6 text-center text-muted-foreground">
            {t('noData')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Commodity</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Market</th>
                  <th className="text-right p-4 text-sm font-semibold text-foreground">Current Price</th>
                  <th className="text-right p-4 text-sm font-semibold text-foreground">3-Year Avg</th>
                  <th className="text-right p-4 text-sm font-semibold text-foreground">Change</th>
                  <th className="text-center p-4 text-sm font-semibold text-foreground">Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <span className="font-medium text-foreground">{item.commodity}</span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{item.market}</td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-bold neon-text">
                        ₹{item.currentPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right text-muted-foreground font-mono">
                      ₹{item.avgPrice.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono',
                        item.deltaPercent >= 0 ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
                      )}>
                        {item.deltaPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.deltaPercent >= 0 ? '+' : ''}{item.deltaPercent.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold font-mono',
                        item.signal === 'SELL' ? 'bg-primary/20 text-primary' :
                        item.signal === 'BUY' ? 'bg-alert/20 text-alert' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {item.signal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPage;
