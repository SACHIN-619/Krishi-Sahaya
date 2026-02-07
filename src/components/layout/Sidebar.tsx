import { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Leaf,
  ChevronLeft,
  ChevronRight,
  Globe,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, languageOptions } from '@/hooks/useLanguage';
import { useMarqueeData } from '@/hooks/useDataSources';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'market', icon: TrendingUp },
  { key: 'advisory', icon: MessageSquare },
  { key: 'schemes', icon: FileText },
  { key: 'diagnosis', icon: Leaf },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const { language, setLanguage, t } = useLanguage();
  const { data: marqueeData, loading: marqueeLoading } = useMarqueeData();
  
  return (
    <aside 
      className={cn(
        'glass-card h-screen flex flex-col transition-all duration-300 border-r border-primary/20',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-neon flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold neon-text">KrishiSahay</h1>
              <p className="text-xs text-muted-foreground">Agricultural Intelligence</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Live Price Marquee */}
      {!collapsed && (
        <div className="border-b border-primary/20 py-2 overflow-hidden">
          <div className="marquee">
            <div className="marquee-content">
              {marqueeLoading ? (
                <span className="text-xs text-muted-foreground px-4">Loading prices...</span>
              ) : (
                marqueeData?.map((item, i) => (
                  <span key={i} className="flex items-center gap-2 px-4 text-xs font-mono">
                    <span className="text-foreground">{item.commodity}</span>
                    <span className="text-primary">₹{item.price.toLocaleString()}</span>
                    <span className={item.change >= 0 ? 'text-primary' : 'text-destructive'}>
                      {item.change >= 0 ? '↑' : '↓'}{Math.abs(item.change).toFixed(1)}%
                    </span>
                  </span>
                ))
              )}
            </div>
            <div className="marquee-content" aria-hidden>
              {marqueeData?.map((item, i) => (
                <span key={`dup-${i}`} className="flex items-center gap-2 px-4 text-xs font-mono">
                  <span className="text-foreground">{item.commodity}</span>
                  <span className="text-primary">₹{item.price.toLocaleString()}</span>
                  <span className={item.change >= 0 ? 'text-primary' : 'text-destructive'}>
                    {item.change >= 0 ? '↑' : '↓'}{Math.abs(item.change).toFixed(1)}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => setActiveItem(item.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive 
                  ? 'bg-primary/20 text-primary neon-border' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'neon-text')} />
              {!collapsed && (
                <span className="text-sm font-medium">{t(item.key)}</span>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Language Selector */}
      <div className="p-3 border-t border-primary/20">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
            'bg-accent/50 hover:bg-accent transition-colors'
          )}>
            <Globe className="w-5 h-5 text-primary" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm font-mono">
                  {languageOptions.find(l => l.code === language)?.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {languageOptions.find(l => l.code === language)?.native}
                </span>
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-primary/30">
            {languageOptions.map(lang => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <span className="font-mono text-primary w-6">{lang.label}</span>
                <span className="text-sm">{lang.native}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-primary ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-neon"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};
