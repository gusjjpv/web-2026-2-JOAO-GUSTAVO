import { useEffect, useState } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { SelectPlayerModal, type EtapaModal } from '../../components/match/SelectPlayerModal';
import {
  GOLS_PADRAO,
  atualizarEstatisticasJogador,
  formatarTempo,
  getRegrasRacha,
  proximoConfronto,
  type EventoPartida,
  type Jogador,
  type PartidaNavState,
  type Time,
} from '../../mock/matchData';
import type { Route } from '../../App';

interface PartidaPageProps {
  navigate: (route: Route, state?: unknown) => void;
  state?: PartidaNavState | null;
}

type Lado = 0 | 1;

/** Cores por lado do confronto (esquerda = verde, direita = azul), conforme o Figma. */
const CORES: Record<Lado, { bg: string; fg: string }> = {
  0: { bg: '#2E7D32', fg: '#CBFFC2' },
  1: { bg: '#314863', fg: '#9FB7D6' },
};

const EVENTOS_VISIVEIS = 4;

/* ── Ícones ─────────────────────────────────────────────────────────────── */

function IconBola({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="m12 7 4.5 3.3-1.7 5.2H9.2l-1.7-5.2z" />
      <path d="M12 2v5M21.5 9.5l-5 .8M18 20l-3.2-4.5M6 20l3.2-4.5M2.5 9.5l5 .8" />
    </svg>
  );
}

function IconAssistencia({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── Página ─────────────────────────────────────────────────────────────── */

/**
 * Tela de Partida — RachaoApp
 * Figma nodes: 33-1268 (jogo) e 64-249 (modal de seleção de jogador)
 */
export function PartidaPage({ navigate, state }: PartidaPageProps) {
  if (!state?.times || state.times.length < 2) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[#102A43]">
        <TopBar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-[#BFCABA] text-[14px]">Nenhum sorteio encontrado para iniciar a partida.</p>
          <button
            type="button"
            onClick={() => navigate('sorteio')}
            className="px-6 py-3 rounded-[4px] bg-[#C6FF00] text-[#102A43] text-[14px] font-bold"
          >
            Ir para o sorteio
          </button>
        </main>
      </div>
    );
  }

  const regrasPadrao = getRegrasRacha();

  return (
    <Partida
      navigate={navigate}
      timesIniciais={state.times}
      tempoMinutos={state.regras?.tempoMinutos ?? regrasPadrao.tempoMinutos}
      maxGolsRegra={state.regras?.maxGols ?? regrasPadrao.maxGols}
    />
  );
}

function Partida({
  navigate,
  timesIniciais,
  tempoMinutos,
  maxGolsRegra,
}: {
  navigate: PartidaPageProps['navigate'];
  timesIniciais: Time[];
  tempoMinutos?: number;
  maxGolsRegra?: number;
}) {
  // Duração configurada ou padrão
  const duracaoSegundos = (tempoMinutos && tempoMinutos > 0 ? tempoMinutos : 10) * 60;
  const maxGols = maxGolsRegra && maxGolsRegra > 0 ? maxGolsRegra : GOLS_PADRAO;

  // fila[0] x fila[1] estão em quadra; o restante aguarda
  const [fila, setFila] = useState<Time[]>(timesIniciais);
  const [numeroPartida, setNumeroPartida] = useState(1);
  const [gols, setGols] = useState<[number, number]>([0, 0]);
  const [eventos, setEventos] = useState<EventoPartida[]>([]);
  const [decorrido, setDecorrido] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Estado do fluxo de modal de gol
  const [modalAberto, setModalAberto] = useState(false);
  const [ladoGol, setLadoGol] = useState<Lado>(0);
  const [etapaModal, setEtapaModal] = useState<EtapaModal>('selecionar_autor');
  const [autorTemp, setAutorTemp] = useState<Jogador | null>(null);

  const confronto: [Time, Time] = [fila[0], fila[1]];
  const atingiuLimiteGols = gols[0] >= maxGols || gols[1] >= maxGols;
  const tempoEsgotado = decorrido >= duracaoSegundos;
  const acabou = tempoEsgotado || atingiuLimiteGols;
  const emAndamento = rodando && !acabou;

  /* ── Cronômetro ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!emAndamento) return;
    const id = window.setInterval(() => {
      setDecorrido((d) => {
        const prox = d + 1;
        if (prox >= duracaoSegundos) {
          setRodando(false);
          return duracaoSegundos;
        }
        return prox;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [emAndamento, duracaoSegundos]);

  /* ── Controle de abertura de modal de Gol ───────────────────────────── */
  const abrirModalGol = (lado: Lado) => {
    // Só pode ser marcado quando o tempo estiver contando
    if (!emAndamento) return;
    setLadoGol(lado);
    setAutorTemp(null);
    setEtapaModal('selecionar_autor');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAutorTemp(null);
    setEtapaModal('selecionar_autor');
  };

  /* ── Fluxo de Registro de Gol ───────────────────────────────────────── */
  // 1. Autor normal selecionado -> avança para selecionar assistência
  const handleSelecionarAutor = (jogador: Jogador) => {
    setAutorTemp(jogador);
    setEtapaModal('selecionar_assistencia');
  };

  // 2. Opção de ir para gol contra clicada -> troca para lista de adversários
  const handleIrParaGolContra = () => {
    setEtapaModal('selecionar_gol_contra');
  };

  // 3. Confirmar Gol Contra
  const handleConfirmarGolContra = (jogadorAdversario: Jogador) => {
    const novoGols = ladoGol === 0 ? [gols[0] + 1, gols[1]] as [number, number] : [gols[0], gols[1] + 1] as [number, number];
    setGols(novoGols);

    // Se atingiu maxGols, pausa o jogo
    if (novoGols[ladoGol] >= maxGols) {
      setRodando(false);
    }

    // Contabiliza o gol nas estatísticas do jogador e aplica punição no rating (-0.2)
    atualizarEstatisticasJogador(jogadorAdversario.id, {
      gols: 1,
      golsContra: 1,
      deltaRating: -0.2,
    });

    // Atualiza jogador na fila de forma imutável (penalidade de rating e contagem de gol/gol contra)
    setFila((prevFila) =>
      prevFila.map((time) => ({
        ...time,
        jogadores: time.jogadores.map((j) => {
          if (j.id === jogadorAdversario.id) {
            return {
              ...j,
              rating: Math.max(1.0, +(j.rating - 0.2).toFixed(1)),
              gols: (j.gols || 0) + 1,
              golsContra: (j.golsContra || 0) + 1,
            };
          }
          return j;
        }),
      }))
    );

    setEventos((prev) => [
      {
        id: `${Date.now()}-${prev.length}`,
        tipo: 'gol_contra',
        jogador: jogadorAdversario,
        lado: ladoGol,
        nomeTime: confronto[ladoGol].nome,
        segundos: decorrido,
      },
      ...prev,
    ]);

    fecharModal();
  };

  // 4. Confirmar assistência (ou sem assistência) e finalizar o gol
  const handleConfirmarAssistencia = (assistenciaPor: Jogador | null) => {
    if (!autorTemp) return;

    const autorId = autorTemp.id;
    const assistId = assistenciaPor?.id;

    const novoGols = ladoGol === 0 ? [gols[0] + 1, gols[1]] as [number, number] : [gols[0], gols[1] + 1] as [number, number];
    setGols(novoGols);

    if (novoGols[ladoGol] >= maxGols) {
      setRodando(false);
    }

    atualizarEstatisticasJogador(autorId, { gols: 1, deltaRating: 0.05 });
    if (assistId) {
      atualizarEstatisticasJogador(assistId, { assistencias: 1, deltaRating: 0.03 });
    }

    // Atualiza estatísticas e rating de forma imutável
    setFila((prevFila) =>
      prevFila.map((time) => ({
        ...time,
        jogadores: time.jogadores.map((j) => {
          if (j.id === autorId) {
            return {
              ...j,
              gols: (j.gols || 0) + 1,
              rating: Math.min(5.0, +(j.rating + 0.05).toFixed(1)),
            };
          }
          if (assistId && j.id === assistId) {
            return {
              ...j,
              assistencias: (j.assistencias || 0) + 1,
              rating: Math.min(5.0, +(j.rating + 0.03).toFixed(1)),
            };
          }
          return j;
        }),
      }))
    );

    setEventos((prev) => [
      {
        id: `${Date.now()}-${prev.length}`,
        tipo: 'gol',
        jogador: autorTemp,
        assistenciaPor: assistenciaPor ?? undefined,
        lado: ladoGol,
        nomeTime: confronto[ladoGol].nome,
        segundos: decorrido,
      },
      ...prev,
    ]);

    fecharModal();
  };

  /* ── Rodapé ─────────────────────────────────────────────────────────── */
  const resetarPartida = () => {
    setGols([0, 0]);
    setEventos([]);
    setDecorrido(0);
    setRodando(false);
    setMostrarTodos(false);
  };

  const cancelarPartida = () => {
    if (!window.confirm('Cancelar a partida? O placar e os eventos serão perdidos.')) return;
    navigate('sorteio');
  };

  const proximaPartida = () => {
    const iniciada = decorrido > 0 || eventos.length > 0;
    if (!acabou && iniciada && !window.confirm('Encerrar a partida atual e iniciar a próxima?')) return;

    console.log('Partida encerrada:', {
      numero: numeroPartida,
      placar: `${confronto[0].nome} ${gols[0]} x ${gols[1]} ${confronto[1].nome}`,
      eventos,
    });
    setFila((f) => proximoConfronto(f, gols[0], gols[1]));
    setNumeroPartida((n) => n + 1);
    resetarPartida();
  };

  const eventosVisiveis = mostrarTodos ? eventos : eventos.slice(0, EVENTOS_VISIVEIS);
  const corPlacar = (lado: Lado) => (gols[lado] > gols[lado === 0 ? 1 : 0] ? '#88D982' : '#BFCABA');

  const tempoRestante = Math.max(0, duracaoSegundos - decorrido);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#102A43]">
      <TopBar />

      <main className="flex-1 w-full max-w-[402px] mx-auto flex flex-col gap-6 px-[22px] pt-6 pb-[120px]">
        {/* ── Bloco 1: Cronômetro e placar ────────────────────────────── */}
        <section
          className="relative rounded-[8px] bg-[#000F1E] border border-[#40493D] overflow-hidden"
          style={{ boxShadow: '0px 4px 12px rgba(13, 99, 27, 0.08)' }}
        >
          {/* Faixas do gramado */}
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(90deg, rgba(13,99,27,0) 0 11%, rgba(13,99,27,0.03) 11% 22%)',
            }}
          />
          <div className="relative flex flex-col items-center p-6 gap-6">
            <div className="flex flex-col items-center gap-2">
              {/* O elemento que mostrava '1° tempo' agora mostra os times que estão jogando */}
              <div className="px-6 py-2 rounded-[12px] bg-[#012138] border border-[rgba(136,217,130,0.2)] text-[#88D982] text-[12px] font-semibold leading-4 tracking-[0.05em] uppercase shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)] flex items-center gap-2">
                <span>{confronto[0].nome}</span>
                <span className="text-[#CEE5FF] font-bold">VS</span>
                <span>{confronto[1].nome}</span>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className="text-[#CEE5FF] text-[64px] leading-[64px] tracking-[-0.05em] tabular-nums"
                  aria-live="polite"
                >
                  {formatarTempo(tempoRestante)}
                </span>
                <button
                  type="button"
                  onClick={() => setRodando((r) => !r)}
                  disabled={acabou}
                  aria-label={emAndamento ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
                  className="w-12 h-12 rounded-[12px] bg-[#2E7D32] flex items-center justify-center shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:brightness-110 disabled:opacity-40"
                >
                  {emAndamento ? (
                    <svg width="16" height="19" viewBox="0 0 16 19" fill="#CBFFC2" aria-hidden>
                      <rect x="1" y="0" width="5" height="19" rx="1" />
                      <rect x="10" y="0" width="5" height="19" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="19" viewBox="0 0 16 19" fill="#CBFFC2" aria-hidden>
                      <path d="M1 0v19l15-9.5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Placar */}
            <div className="w-full flex items-center justify-between p-4 rounded-[4px] bg-[#001D32] border border-[rgba(64,73,61,0.5)]">
              {[0, 1].map((lado) => (
                <div key={lado} className={`flex-1 flex flex-col items-center gap-1 ${lado === 1 ? 'order-3' : ''}`}>
                  <span className="text-[#CEE5FF] text-[20px] font-semibold leading-7 text-center">
                    {confronto[lado as Lado].nome}
                  </span>
                  <span className="text-[32px] leading-10 tabular-nums font-bold" style={{ color: corPlacar(lado as Lado) }}>
                    {gols[lado as Lado]}
                  </span>
                </div>
              ))}
              <span className="order-2 px-4 text-[#8A9485] text-[24px] font-bold leading-8 opacity-50">X</span>
            </div>

            <p className="-mt-3 text-[#9FB7D6] text-[12px] font-medium">
              Partida {numeroPartida}
              {fila.length > 2 && ` · Próximo a entrar: ${fila[2].nome}`}
            </p>
          </div>
        </section>

        {/* ── Bloco 2: Ações rápidas ──────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-4">
          {([0, 1] as Lado[]).map((lado) => {
            const podeMarcar = emAndamento;

            return (
              <div
                key={lado}
                className="flex flex-col gap-2 p-4 rounded-[8px] bg-[#000F1E] border border-[#40493D] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                style={{ borderLeftWidth: 4 }}
              >
                <h3 className="pb-1 text-[#CEE5FF] text-[14px] font-semibold leading-5 truncate">
                  {confronto[lado].nome}
                </h3>

                <button
                  type="button"
                  onClick={() => abrirModalGol(lado)}
                  disabled={!podeMarcar}
                  title={!podeMarcar ? 'Inicie o cronômetro para poder marcar gol' : `Marcar gol para ${confronto[lado].nome}`}
                  className="flex items-center justify-center gap-2 py-4 rounded-[4px] text-[15px] font-bold leading-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: CORES[lado].bg, color: CORES[lado].fg }}
                >
                  <IconBola size={18} color={CORES[lado].fg} />
                  GOL
                </button>
              </div>
            );
          })}
        </section>

        {/* ── Bloco 3: Histórico de eventos ───────────────────────────── */}
        <section className="flex flex-col gap-2 p-4 rounded-[8px] bg-[#000F1E] border border-[#40493D] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A9485" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h2 className="text-[#CEE5FF] text-[20px] font-semibold leading-7">Histórico de Eventos</h2>
          </div>

          <div className="flex flex-col pt-2">
            {eventos.length === 0 && (
              <p className="py-4 text-center text-[#8A9485] text-[13px]">
                Nenhum evento registrado nesta partida.
              </p>
            )}
            {eventosVisiveis.map((ev) => {
              const isGolContra = ev.tipo === 'gol_contra';

              return (
                <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-[rgba(64,73,61,0.5)] last:border-b-0">
                  <span
                    className="w-7 h-7 flex-shrink-0 rounded-[12px] flex items-center justify-center font-bold text-[12px]"
                    style={
                      isGolContra
                        ? { backgroundColor: '#7D2E2F', color: '#FFC2C2' }
                        : { backgroundColor: CORES[ev.lado].bg }
                    }
                  >
                    {isGolContra ? (
                      'GC'
                    ) : (
                      <IconBola size={14} color={CORES[ev.lado].fg} />
                    )}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[#CEE5FF] text-[13px] font-semibold truncate">
                      {isGolContra ? (
                        <span className="text-[#FF9E9E]">GOL CONTRA - {ev.jogador.nome}</span>
                      ) : (
                        `GOL - ${ev.jogador.nome} (${ev.nomeTime})`
                      )}
                    </span>
                    {ev.assistenciaPor && (
                      <span className="text-[#9FB7D6] text-[11px] truncate flex items-center gap-1">
                        <IconAssistencia size={10} color="#9FB7D6" />
                        Assistência: {ev.assistenciaPor.nome}
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-1 rounded-[6px] bg-[#012138] text-[#BFCABA] text-[12px] font-medium leading-4 tabular-nums">
                    {formatarTempo(ev.segundos)}
                  </span>
                </div>
              );
            })}
          </div>

          {eventos.length > EVENTOS_VISIVEIS && (
            <button
              type="button"
              onClick={() => setMostrarTodos((v) => !v)}
              className="py-2 rounded-[4px] text-[#88D982] text-[14px] font-semibold leading-5 hover:bg-[#001D32]"
            >
              {mostrarTodos ? 'Mostrar menos' : `Ver todos (${eventos.length})`}
            </button>
          )}
        </section>
      </main>

      {/* ── Rodapé fixo: controles administrativos ───────────────────── */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[#40493D] backdrop-blur-[6px]"
        style={{ backgroundColor: 'rgba(0, 21, 38, 0.9)', boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.05)' }}
      >
        <div className="max-w-[402px] mx-auto flex gap-4 px-8 py-4">
          <button
            type="button"
            onClick={cancelarPartida}
            className="flex-1 h-[52px] rounded-[4px] bg-[#7D2E2F] text-[#CBFFC2] text-[14px] font-semibold leading-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:brightness-110"
          >
            CANCELAR
            <br />
            PARTIDA
          </button>
          <button
            type="button"
            onClick={proximaPartida}
            className="flex-1 h-[52px] rounded-[4px] bg-[#2E7D32] text-[#CBFFC2] text-[14px] font-semibold leading-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:brightness-110"
          >
            PRÓXIMA
            <br />
            PARTIDA
          </button>
        </div>
      </footer>

      {/* ── Modal de Gol e Assistência / Gol Contra ────────────────────── */}
      {modalAberto && (
        <SelectPlayerModal
          etapa={etapaModal}
          nomeTimeBeneficiado={confronto[ladoGol].nome}
          nomeTimeAdversario={confronto[ladoGol === 0 ? 1 : 0].nome}
          jogadoresTime={confronto[ladoGol].jogadores}
          jogadoresAdversarios={confronto[ladoGol === 0 ? 1 : 0].jogadores}
          autorSelecionado={autorTemp}
          onSelecionarAutor={handleSelecionarAutor}
          onIrParaGolContra={handleIrParaGolContra}
          onVoltarParaAutor={() => setEtapaModal('selecionar_autor')}
          onSelecionarGolContra={handleConfirmarGolContra}
          onSelecionarAssistencia={handleConfirmarAssistencia}
          onClose={fecharModal}
        />
      )}
    </div>
  );
}
