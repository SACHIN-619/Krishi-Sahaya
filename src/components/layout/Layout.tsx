import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { VoiceButton } from '@/components/ui/VoiceButton';

interface LayoutProps {
  children: ReactNode;
  user: { name: string; phone: string; email: string };
  onLogout: () => void;
}

export const Layout = ({ children, user, onLogout }: LayoutProps) => (
  <div className="min-h-screen w-full flex flex-col">
    <Navbar user={user} onLogout={onLogout} />
    <main className="flex-1 overflow-auto grid-pattern">
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {children}
      </div>
    </main>
    <VoiceButton />
  </div>
);
