import { useEffect } from 'react';
import type { Jogador } from '../../mock/matchData';
import { PlayerRow } from './PlayerRow';

export type EtapaModal = 'selecionar_autor' | 'selecionar_gol_contra' | 'selecionar_assistencia';

interface SelectPlayerModalProps {
  etapa: EtapaModal;
  nomeTimeBeneficiado: string;
  nomeTimeAdversario: string;
  jogadoresTime: Jogador[];
  jogadoresAdversarios: Jogador[];
  autorSelecionado?: Jogador | null;
  onSelecionarAutor: (jogador: Jogador) => void;
  onSelecionarGolContra: (jogador: Jogador) => void;
  onSelecionarAssistencia: (jogador: Jogador | null) => void;
  onIrParaGolContra: () => void;
  onVoltarParaAutor?: () => void;
  onClose: () => void;
}

/**
 * Modal dinâmico de registro de gol:
 * 1. Autor do gol (do time beneficiado) + opção no final "Gol Contra (adversário)"
 * 2. Se gol contra: lista dos jogadores do outro time (sem assistência)
 * 3. Se autor normal: lista de quem deu assistência + opção "Sem assistência"
 */
export function SelectPlayerModal({
  etapa,
  nomeTimeBeneficiado,
  nomeTimeAdversario,
  jogadoresTime,
  jogadoresAdversarios,
  autorSelecionado,
  onSelecionarAutor,
  onSelecionarGolContra,
  onSelecionarAssistencia,
  onIrParaGolContra,
  onVoltarParaAutor,
  onClose,
}: SelectPlayerModalProps) {
  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const titulo =
    etapa === 'selecionar_autor'
      ? 'Selecione quem marcou o gol'
      : etapa === 'selecionar_gol_contra'
      ? 'Quem marcou gol contra?'
      : 'Quem deu a assistência?';

  const subtitulo =
    etapa === 'selecionar_autor'
      ? `Gol para ${nomeTimeBeneficiado}`
      : etapa === 'selecionar_gol_contra'
      ? `Jogador de ${nomeTimeAdversario} (sofrerá penalidade no rating)`
      : `Gol marcado por ${autorSelecionado?.nome ?? 'Jogador'}`;

  // Se estiver na etapa de assistência, remove o próprio autor da lista de opções
  const listaAssistencia = jogadoresTime.filter((j) => j.id !== autorSelecionado?.id);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-[30px] bg-[rgba(0,15,30,0.6)] backdrop-blur-[4px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className="w-full max-w-[341px] max-h-[85vh] flex flex-col rounded-[10px] bg-[#000F1E] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-[18px] pb-5 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2
              className="text-white text-[16px] leading-5"
              style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800 }}
            >
              {titulo}
            </h2>
            <p className="text-[#9FB7D6] text-[12px] font-medium mt-1 truncate">
              {subtitulo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#BFCABA] hover:text-white text-[22px] leading-none px-1"
          >
            ×
          </button>
        </div>

        {/* ── ETAPA 1: SELECIONAR AUTOR DO GOL ──────────────────────── */}
        {etapa === 'selecionar_autor' && (
          <div className="overflow-y-auto rounded-[7px] bg-[#1F3B54] p-2 flex flex-col gap-2">
            {jogadoresTime.map((j) => (
              <PlayerRow
                key={j.id}
                jogador={j}
                onClick={() => onSelecionarAutor(j)}
                badge={
                  <span className="flex-shrink-0 px-2 py-1 rounded-[12px] bg-[#88D982] text-[#003909] text-[14px] font-semibold leading-5">
                    + Gol
                  </span>
                }
              />
            ))}

            {/* Opção especial: Gol Contra */}
            <button
              type="button"
              onClick={onIrParaGolContra}
              className="w-full flex items-center justify-between gap-2 p-2 mt-1 rounded-[6px] border border-[#7D2E2F] bg-[#3a1a1d] text-left hover:bg-[#4d1f23] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-[12px] bg-[#7D2E2F] text-[#CBFFC2] flex items-center justify-center text-[16px]">
                  ⚠️
                </span>
                <div className="flex flex-col">
                  <span className="text-[#FFC2C2] text-[14px] font-bold leading-5">
                    Gol Contra (adversário)
                  </span>
                  <span className="text-[#E0A0A0] text-[11px] leading-3">
                    Marcar jogador de {nomeTimeAdversario}
                  </span>
                </div>
              </div>
              <span className="text-[#FFC2C2] text-[16px]">➔</span>
            </button>
          </div>
        )}

        {/* ── ETAPA 2: GOL CONTRA (JOGADORES ADVERSÁRIOS) ─────────────── */}
        {etapa === 'selecionar_gol_contra' && (
          <div className="overflow-y-auto rounded-[7px] bg-[#1F3B54] p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <button
                type="button"
                onClick={onVoltarParaAutor}
                className="text-[#9FB7D6] hover:text-white text-[12px] flex items-center gap-1"
              >
                ← Voltar
              </button>
              <span className="text-[#FF8080] text-[11px] font-semibold">
                Penalidade no Rating
              </span>
            </div>

            {jogadoresAdversarios.map((j) => (
              <PlayerRow
                key={j.id}
                jogador={j}
                onClick={() => onSelecionarGolContra(j)}
                badge={
                  <span className="flex-shrink-0 px-2 py-1 rounded-[12px] bg-[#7D2E2F] text-[#FFC2C2] text-[12px] font-bold leading-5">
                    Gol Contra
                  </span>
                }
              />
            ))}
          </div>
        )}

        {/* ── ETAPA 3: SELECIONAR QUEM DEU A ASSISTÊNCIA ──────────────── */}
        {etapa === 'selecionar_assistencia' && (
          <div className="overflow-y-auto rounded-[7px] bg-[#1F3B54] p-2 flex flex-col gap-2">
            {/* Opção sem assistência */}
            <button
              type="button"
              onClick={() => onSelecionarAssistencia(null)}
              className="w-full flex items-center justify-between p-2 rounded-[6px] bg-[#001D32] border border-[#40493D] hover:bg-[#012138] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-[12px] bg-[#1B374F] text-[#9FB7D6] flex items-center justify-center text-[12px] font-bold">
                  Ø
                </span>
                <span className="text-[#CEE5FF] text-[14px] font-semibold">
                  Sem assistência (jogada individual)
                </span>
              </div>
              <span className="text-[#88D982] text-[13px] font-bold">Confirmar</span>
            </button>

            <div className="px-1 pt-1 text-[#9FB7D6] text-[11px] font-medium">
              Ou escolha o jogador que deu o passe:
            </div>

            {listaAssistencia.map((j) => (
              <PlayerRow
                key={j.id}
                jogador={j}
                onClick={() => onSelecionarAssistencia(j)}
                badge={
                  <span className="flex-shrink-0 px-2 py-1 rounded-[12px] bg-[#314863] text-[#CEE5FF] text-[13px] font-semibold leading-5">
                    + Assist.
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
