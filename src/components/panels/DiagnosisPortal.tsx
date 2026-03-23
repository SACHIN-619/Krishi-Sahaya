import { useState, useRef, useCallback } from 'react';
import { Upload, Scan, AlertTriangle, CheckCircle, Loader2, X, RefreshCw, Camera } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { api, DiseaseResult } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SEVERITY_CONFIG = {
  none: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', label: 'HEALTHY' },
  low: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', label: 'LOW RISK' },
  medium: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/20', label: 'MODERATE' },
  high: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', label: 'HIGH SEVERITY' },
};

const SOURCE_LABELS: Record<string, string> = {
  gemini_vision: 'Gemini AI Vision',
  plant_id: 'Plant.id API',
  mock: 'AI Analysis',
};

export const DiagnosisPortal = () => {
  const { t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB');
      return;
    }
    fileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      runAnalysis(file);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (file: File) => {
    setScanning(true);
    setResult(null);
    setError(null);
    try {
      const result = await api.disease.detect(file);
      setResult(result);
      const sev = result.severity;
      if (sev === 'high') toast.error(`⚠️ ${result.disease} detected - immediate action needed`);
      else if (sev === 'medium') toast.warning(`${result.disease} detected - treatment recommended`);
      else toast.success(`Analysis complete: ${result.disease}`);
    } catch (err) {
      setError('Analysis failed. Please check backend connection and try again.');
      toast.error('Disease detection failed. Check if backend is running.');
    } finally {
      setScanning(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setScanning(false);
    setError(null);
    fileRef.current = null;
  };

  const handleRetry = () => {
    if (fileRef.current) runAnalysis(fileRef.current);
  };

  const sev = result?.severity ?? 'low';
  const sevConfig = SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.low;

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Scan className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{t('diagnosis')}</h2>
            <p className="text-xs text-muted-foreground">Gemini AI Vision • Plant.id</p>
          </div>
        </div>
        {image && (
          <button onClick={handleClear} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Clear">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {!image ? (
        /* Upload Zone */
        <div
          className={cn(
            'flex-1 relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer min-h-[240px] flex items-center justify-center',
            dragActive
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-primary/30 hover:border-primary/60 hover:bg-accent/30'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={cn(
              'w-20 h-20 rounded-2xl flex items-center justify-center transition-all',
              dragActive ? 'bg-primary/30 scale-110' : 'bg-primary/20'
            )}>
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t('dragDrop')}</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 10MB</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Camera className="w-3 h-3" />
              <span>Or take a photo directly</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden bg-accent/20">
            <img src={image} alt="Crop analysis" className="w-full h-52 object-cover" />
            {scanning && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <Scan className="w-7 h-7 text-primary absolute inset-0 m-auto" />
                </div>
                <p className="text-sm font-medium text-foreground font-mono animate-pulse">
                  Analyzing with AI...
                </p>
                <p className="text-xs text-muted-foreground">Gemini Vision • Plant Pathology Model</p>
              </div>
            )}
          </div>

          {/* Error state */}
          {error && !scanning && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={handleRetry} className="mt-2 text-xs text-destructive underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Retry Analysis
              </button>
            </div>
          )}

          {/* Results */}
          {result && !scanning && (
            <div className="animate-fade-in space-y-3 flex-1">
              {/* Disease Header */}
              <div className={cn('flex items-start justify-between gap-2 p-3 rounded-lg border', sevConfig.bg, sevConfig.border)}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className={cn('w-5 h-5 shrink-0 mt-0.5', sevConfig.color)} />
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{result.disease}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-xs font-mono font-bold', sevConfig.color)}>
                        {sevConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {SOURCE_LABELS[result.source] || result.source}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-bold font-mono text-primary">{result.confidence}%</span>
                  <p className="text-[10px] text-muted-foreground">confidence</p>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">{result.confidence}%</span>
              </div>

              {/* Treatment */}
              <div className="p-3 rounded-lg bg-accent/50 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Treatment</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{result.treatment}</p>
              </div>

              {/* Prevention */}
              <div className="p-3 rounded-lg bg-muted/40">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Prevention</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.prevention}</p>
              </div>

              {/* Retry */}
              <button
                onClick={handleClear}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-3 h-3" />
                Analyze another crop
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
