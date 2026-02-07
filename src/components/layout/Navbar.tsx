import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Leaf,
  Globe,
  Check,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, languageOptions } from '@/hooks/useLanguage';
import { useMarqueeData } from '@/hooks/useDataSources';
import { useTheme } from '@/hooks/useTheme';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'market', icon: TrendingUp, path: '/market' },
  { key: 'advisory', icon: MessageSquare, path: '/advisory' },
  { key: 'schemes', icon: FileText, path: '/schemes' },
  { key: 'diagnosis', icon: Leaf, path: '/diagnosis' },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { data: marqueeData, loading: marqueeLoading } = useMarqueeData();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Navbar */}
      <nav className="glass-card border-b border-primary/20 rounded-none">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-neon flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=80&h=80&fit=crop" 
                  alt="KrishiSahay"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold neon-text">KrishiSahay</h1>
                <p className="text-[10px] text-muted-foreground">Agricultural Intelligence</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                      isActive 
                        ? 'bg-primary/20 text-primary neon-border' 
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive && 'neon-text')} />
                    <span className="text-sm font-medium">{t(item.key)}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Right Side - Theme Toggle, Language & Mobile Menu */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'bg-accent/50 hover:bg-accent'
                )}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-alert" />
                ) : (
                  <Moon className="w-5 h-5 text-primary" />
                )}
              </button>
              
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg',
                  'bg-accent/50 hover:bg-accent transition-colors'
                )}>
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono">
                    {languageOptions.find(l => l.code === language)?.label}
                  </span>
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
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-accent"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary/20 py-2 px-4 animate-fade-in">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{t(item.key)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
      
      {/* Live Price Marquee */}
      <div className="glass-card border-b border-primary/20 py-1.5 rounded-none overflow-hidden">
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
    </header>
  );
};
