import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  message?: string;
}

export const SkeletonLoader = ({ className, message }: SkeletonLoaderProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="skeleton-pulse h-4 w-3/4" />
      <div className="skeleton-pulse h-4 w-1/2" />
      <div className="skeleton-pulse h-4 w-5/6" />
      {message && (
        <p className="text-xs text-muted-foreground mt-2 font-mono">{message}</p>
      )}
    </div>
  );
};

export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn('glass-card p-4 space-y-3', className)}>
      <div className="skeleton-pulse h-5 w-1/3" />
      <div className="skeleton-pulse h-8 w-1/2" />
      <div className="skeleton-pulse h-4 w-2/3" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton-pulse h-6 flex-1" />
          <div className="skeleton-pulse h-6 w-24" />
          <div className="skeleton-pulse h-6 w-20" />
        </div>
      ))}
    </div>
  );
};
