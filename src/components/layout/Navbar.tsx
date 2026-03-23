import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, MessageSquare, FileText, Leaf,
  Globe, Check, Menu, X, Sun, Moon, LogOut, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, languageOptions } from '@/hooks/useLanguage';
import { useMarqueeData } from '@/hooks/useDataSources';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { key: 'dashboard',  icon: LayoutDashboard, path: '/' },
  { key: 'market',     icon: TrendingUp,       path: '/market' },
  { key: 'advisory',  icon: MessageSquare,    path: '/advisory' },
  { key: 'schemes',   icon: FileText,         path: '/schemes' },
  { key: 'diagnosis', icon: Leaf,             path: '/diagnosis' },
];

interface NavbarProps {
  user: { name: string; email: string; phone: string };
  onLogout: () => void;
}

export const Navbar = ({ user, onLogout }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { data: marqueeData } = useMarqueeData();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="glass-card border-b border-primary/20 rounded-none">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-neon">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold neon-text leading-none">KrishiSahay</h1>
                <p className="text-[10px] text-muted-foreground">Agricultural Intelligence</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link key={item.key} to={item.path}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all',
                      active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{t(item.key)}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1.5">
              {/* Theme */}
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-primary" />}
              </button>

              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/50 hover:bg-accent text-sm transition-colors">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono text-xs">{languageOptions.find(l => l.code === language)?.label}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-primary/30">
                  {languageOptions.map(lang => (
                    <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}
                      className="flex items-center gap-3 cursor-pointer">
                      <span className="font-mono text-primary w-6 text-sm">{lang.label}</span>
                      <span className="text-sm">{lang.native}</span>
                      {language === lang.code && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="hidden sm:block text-xs font-medium text-foreground truncate max-w-[80px]">
                    {user.name}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-primary/30 w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu toggle */}
              <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-accent">
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-primary/20 py-2 px-4 animate-fade-in">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link key={item.key} to={item.path} onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent'
                  )}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{t(item.key)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Live Price Ticker */}
      {marqueeData && marqueeData.length > 0 && (
        <div className="glass-card border-b border-primary/10 py-1.5 rounded-none overflow-hidden bg-background/80">
          <div className="marquee">
            {[0, 1].map(copy => (
              <div key={copy} className="marquee-content" aria-hidden={copy === 1}>
                {marqueeData.map((item, i) => (
                  <span key={i} className="flex items-center gap-2 px-5 text-xs font-mono whitespace-nowrap">
                    <span className="text-muted-foreground">{item.commodity}</span>
                    <span className="text-primary font-semibold">₹{item.price.toLocaleString()}</span>
                    <span className={item.change >= 0 ? 'text-primary' : 'text-destructive'}>
                      {item.change >= 0 ? '↑' : '↓'}{Math.abs(item.change).toFixed(1)}%
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
