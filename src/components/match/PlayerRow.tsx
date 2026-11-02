import type { ReactNode } from 'react';
import type { Jogador } from '../../mock/matchData';

interface PlayerRowProps {
  jogador: Jogador;
  /** Conteúdo exibido à direita (rating, "+", etc.) */
  badge: ReactNode;
  onClick?: () => void;
}

/**
 * Linha de jogador (avatar + nome + badge) — usada no sorteio e no modal de seleção.
 * Figma: "Item - Player Row"
 */
export function PlayerRow({ jogador, badge, onClick }: PlayerRowProps) {
  const conteudo = (
    <>
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-[12px] overflow-hidden bg-[#1B374F] flex items-center justify-center">
            {jogador.foto ? (
              <img src={jogador.foto} alt={jogador.nome} className="w-full h-full object-cover" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#8A9485" aria-hidden>
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            )}
          </div>
          {jogador.goleiro && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#B0C9E8] border-2 border-[#1F3B54]" />
          )}
        </div>
        <span className="text-[#CEE5FF] text-[14px] font-semibold leading-5 truncate">
          {jogador.nome}
          {jogador.goleiro && ' (G)'}
        </span>
      </div>
      {badge}
    </>
  );

  const classes = 'w-full flex items-center justify-between gap-2 p-2 rounded-[4px]';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${classes} text-left transition-colors hover:bg-[#1B374F] active:bg-[#314863]`}
      >
        {conteudo}
      </button>
    );
  }
  return <div className={classes}>{conteudo}</div>;
}
