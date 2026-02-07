import { useState, useRef, useCallback } from 'react';
import { Upload, Scan, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string;
  prevention: string;
}

export const DiagnosisPortal = () => {
  const { t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);
  
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      startScanning();
    };
    reader.readAsDataURL(file);
  };
  
  const startScanning = async () => {
    setScanning(true);
    setResult(null);
    
    // Simulate vision model processing
    await new Promise(r => setTimeout(r, 3000));
    
    // Mock result - to be replaced with actual IBM Watsonx Vision API
    setResult({
      disease: 'Late Blight (Phytophthora infestans)',
      confidence: 94.5,
      severity: 'high',
      treatment: 'Apply Metalaxyl + Mancozeb @ 2.5g/L immediately. Repeat after 7 days. Remove and destroy severely affected plants.',
      prevention: 'Use resistant varieties. Avoid overhead irrigation. Maintain proper plant spacing for air circulation.',
    });
    
    setScanning(false);
  };
  
  const handleClear = () => {
    setImage(null);
    setResult(null);
    setScanning(false);
  };
  
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Scan className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{t('diagnosis')}</h2>
            <p className="text-xs text-muted-foreground">{t('uploadImage')}</p>
          </div>
        </div>
        {image && (
          <button onClick={handleClear} className="p-1.5 rounded hover:bg-accent">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {!image ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer',
            dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-primary/30 hover:border-primary/50 hover:bg-accent/30'
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
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t('dragDrop')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview with Scan Animation */}
          <div className={cn('relative rounded-xl overflow-hidden', scanning && 'laser-scan')}>
            <img 
              src={image} 
              alt="Uploaded crop" 
              className="w-full h-48 object-cover"
            />
            {scanning && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <p className="text-sm text-primary mt-2 font-mono">{t('scanning')}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Results */}
          {result && (
            <div className="animate-fade-in space-y-3">
              {/* Disease Name & Confidence */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn(
                    'w-5 h-5 shrink-0',
                    result.severity === 'high' ? 'text-destructive' :
                    result.severity === 'medium' ? 'text-alert' : 'text-primary'
                  )} />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{result.disease}</h3>
                    <p className={cn(
                      'text-xs font-mono',
                      result.severity === 'high' ? 'text-destructive' :
                      result.severity === 'medium' ? 'text-alert' : 'text-primary'
                    )}>
                      {result.severity.toUpperCase()} SEVERITY
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-primary bg-primary/20 px-2 py-1 rounded">
                  {result.confidence}% match
                </span>
              </div>
              
              {/* Treatment */}
              <div className="p-3 rounded-lg bg-accent/50 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">VERIFIED TREATMENT</span>
                </div>
                <p className="text-sm text-foreground">{result.treatment}</p>
              </div>
              
              {/* Prevention */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Prevention Tips</p>
                <p className="text-xs text-muted-foreground">{result.prevention}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
