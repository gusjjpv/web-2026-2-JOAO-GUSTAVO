import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { TopBar } from '../../components/layout/TopBar';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import type { Route } from '../../App';

type NavTab = 'home' | 'groups' | 'alerts' | 'profile';

interface HomePageProps {
  navigate: (route: Route, state?: unknown) => void;
}

/**
 * Tela inicial vazia — RachaoApp
 * Figma node: 44-312
 */
export function HomePage({ navigate }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const handleNavChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'profile') navigate('perfil');
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#102A43' }}
    >
      <TopBar />

      <main
        className="flex-1 flex flex-col items-center justify-center gap-[18px]"
        style={{ paddingBottom: 55 }}
      >
        <Button
          style={{ width: 196, borderRadius: 8 }}
          onClick={() => console.log('Encontre um Racha')}
        >
          Encontre um Racha
        </Button>

        <Button
          style={{ width: 194, borderRadius: 4 }}
          onClick={() => navigate('criar-grupo')}
        >
          Criar um Racha
        </Button>
      </main>

      <BottomNavBar active={activeTab} onTabChange={handleNavChange} />
    </div>
  );
}
