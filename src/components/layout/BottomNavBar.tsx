type NavTab = 'home' | 'groups' | 'alerts' | 'profile';

interface BottomNavBarProps {
  active?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  /** URL ou base64 da foto do usuário — exibida na aba "Você" quando ativa */
  userPhoto?: string | null;
}

/**
 * BottomNavBar component — barra de navegação inferior reutilizável.
 * Abas: Home | Groups | Alerts | Você
 *
 * Quando ativa, a aba "Você" exibe o avatar do usuário no lugar do ícone genérico.
 */
export function BottomNavBar({
  active = 'home',
  onTabChange,
  userPhoto,
}: BottomNavBarProps) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: (
        <svg width="22" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: (
        <svg width="16" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Você',
      icon: null, // tratado separadamente abaixo
    },
  ];

  return (
    <nav
      className="w-full flex items-center justify-around"
      style={{
        backgroundColor: '#000F1E',
        borderTop: '1px solid #40493D',
        height: 55,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const isProfile = tab.id === 'profile';

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-[12px] transition-colors ${
              isActive ? 'bg-[#314863]' : ''
            }`}
            style={{ color: isActive ? '#9FB7D6' : '#BFCABA' }}
            aria-label={tab.label}
          >
            {/* Aba Você: avatar ou ícone genérico */}
            {isProfile ? (
              <div
                className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ width: 20, height: 20, backgroundColor: '#1A3A5C' }}
              >
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt="Você"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                )}
              </div>
            ) : (
              tab.icon
            )}
            <span className="text-[12px] font-medium leading-4">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
