import logoImg from '../../assets/Logo.svg';

interface TopBarProps {
  onNotificationClick?: () => void;
}

/**
 * TopBar component — barra superior reutilizável.
 * Figma node: 33:1239
 */
export function TopBar({ onNotificationClick }: TopBarProps) {
  return (
    <header
      className="w-full flex items-center justify-between px-4 py-2"
      style={{
        backgroundColor: '#000F1E',
        borderBottom: '1px solid #40493D',
        height: 96,
      }}
    >
      {/* Logo + nome */}
      <div className="flex items-center gap-2">
        <img
          src={logoImg}
          alt="RachaoApp"
          className="w-[50px] h-[50px] object-contain"
        />
        <span
          style={{
            fontFamily: "'Unbounded', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            lineHeight: '56px',
            letterSpacing: '-0.08em',
            color: '#009951',
          }}
        >
          RachaoApp
        </span>
      </div>

      {/* Ícone de notificação */}
      <button
        type="button"
        onClick={onNotificationClick}
        className="flex items-center justify-center w-9 h-9 rounded-[12px] text-[#009951] hover:opacity-80 transition-opacity"
        aria-label="Notificações"
      >
        <svg width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </header>
  );
}
