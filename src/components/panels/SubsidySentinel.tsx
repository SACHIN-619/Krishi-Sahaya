import { FileText, ExternalLink, Clock, ArrowRight } from 'lucide-react';
import { useSchemes } from '@/hooks/useDataSources';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { cn } from '@/lib/utils';

export const SubsidySentinel = () => {
  const { data: schemes, loading, error, isDemo } = useSchemes();
  const { t } = useLanguage();
  
  if (loading) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-alert/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-alert" />
          </div>
          <h2 className="font-semibold text-foreground">⚡ {t('subsidySentinel')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }
  
  if (error || !schemes) {
    return (
      <div className="glass-card p-4">
        <p className="text-muted-foreground text-sm">{t('noData')}</p>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-4 border-alert/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-alert/30 to-primary/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-alert" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              ⚡ {t('subsidySentinel')}
            </h2>
            <p className="text-xs text-muted-foreground">High-impact Government Schemes</p>
          </div>
        </div>
        {isDemo && (
          <span className="text-[10px] px-2 py-1 rounded bg-alert/20 text-alert font-mono">
            DEMO
          </span>
        )}
      </div>
      
      {/* Scheme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {schemes.map((scheme, index) => (
          <div 
            key={scheme.id}
            className="group glass-card-hover p-4 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Category Badge */}
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono mb-2">
              {scheme.category}
            </span>
            
            {/* Scheme Name */}
            <h3 className="font-semibold text-foreground mb-1">{scheme.name}</h3>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {scheme.description}
            </p>
            
            {/* Benefit */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground">Benefit:</p>
              <p className="text-sm font-medium neon-text">{scheme.benefit}</p>
            </div>
            
            {/* Deadline if exists */}
            {scheme.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-alert mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Deadline: {new Date(scheme.deadline).toLocaleDateString()}</span>
              </div>
            )}
            
            {/* Apply Button */}
            <a
              href={scheme.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-center gap-2 w-full py-2 rounded-lg',
                'cta-glow text-primary-foreground font-medium text-sm',
                'group-hover:shadow-neon-lg transition-all'
              )}
            >
              {t('applyNow')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
