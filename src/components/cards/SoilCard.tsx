import { Layers, Droplet } from 'lucide-react';
import { useSoilData } from '@/hooks/useDataSources';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { cn } from '@/lib/utils';

export const SoilCard = () => {
  const { data, loading, error, isDemo } = useSoilData();
  const { t } = useLanguage();
  
  if (loading) return <SkeletonCard className="min-h-[140px]" />;
  
  if (error || !data) {
    return (
      <div className="glass-card p-4 min-h-[140px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('noData')}</p>
      </div>
    );
  }
  
  const npkValues = [
    { label: 'N', value: data.nitrogen, color: 'text-primary' },
    { label: 'P', value: data.phosphorus, color: 'text-alert' },
    { label: 'K', value: data.potassium, color: 'text-chart-3' },
  ];
  
  return (
    <div className="glass-card-hover p-4 min-h-[140px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('soilIntelligence')}</span>
        </div>
        {isDemo && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-alert/20 text-alert font-mono">
            DEMO
          </span>
        )}
      </div>
      
      {/* NPK Values */}
      <div className="flex gap-4 mb-3">
        {npkValues.map(item => (
          <div key={item.label} className="text-center">
            <span className={cn('text-lg font-bold font-mono', item.color)}>
              {item.value}
            </span>
            <p className="text-[10px] text-muted-foreground">{item.label} kg/ha</p>
          </div>
        ))}
      </div>
      
      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">pH:</span>
          <span className={cn(
            'font-mono font-medium',
            data.ph >= 6 && data.ph <= 7 ? 'text-primary' : 'text-alert'
          )}>
            {data.ph}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplet className="w-3 h-3 text-chart-3" />
          <span className="font-mono">{data.moisture}%</span>
        </div>
      </div>
    </div>
  );
};
