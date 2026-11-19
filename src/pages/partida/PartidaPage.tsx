import { useEffect, useState } from 'react';
import { SelectPlayerModal, type EtapaModal } from '../../components/match/SelectPlayerModal';
import { EditTeamsModal } from '../../components/match/EditTeamsModal';
import {
  GOLS_PADRAO,
  atualizarEstatisticasJogador,
  formatarTempo,
  getRegrasRacha,
  getSessaoPartidaAtiva,
  proximoConfronto,
  registrarPartidasConcluidas,
  salvarSessaoPartidaAtiva,
  type EventoPartida,
  type Jogador,
  type OpcaoDesempate,
  type PartidaConcluida,
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
  const sessaoSalva = getSessaoPartidaAtiva();
  const timesIniciais = state?.retomarSessao
    ? sessaoSalva?.fila
    : state?.times ?? sessaoSalva?.fila;

  if (!timesIniciais || timesIniciais.length < 2) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[#102A43]">
        <header
          className="w-full flex items-center px-4"
          style={{ backgroundColor: '#000F1E', borderBottom: '1px solid #40493D', height: 56 }}
        >
          <button
            type="button"
            onClick={() => navigate('detalhe-grupo')}
            className="flex items-center gap-2 text-[#BFCABA] hover:text-white transition-colors text-[14px] font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
        </header>
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
  const usarSessao = Boolean(state?.retomarSessao && sessaoSalva) || (!state?.times && Boolean(sessaoSalva));

  return (
    <Partida
      navigate={navigate}
      timesIniciais={timesIniciais}
      sessaoRestaurada={usarSessao ? sessaoSalva : null}
      tempoMinutos={state?.regras?.tempoMinutos ?? sessaoSalva?.regras.tempoMinutos ?? regrasPadrao.tempoMinutos}
      maxGolsRegra={state?.regras?.maxGols ?? sessaoSalva?.regras.maxGols ?? regrasPadrao.maxGols}
      vagasPorTime={state?.regras?.vagasPorTime ?? sessaoSalva?.regras.vagasPorTime ?? regrasPadrao.vagasPorTime}
    />
  );
}

function Partida({
  navigate,
  timesIniciais,
  sessaoRestaurada,
  tempoMinutos,
  maxGolsRegra,
  vagasPorTime,
}: {
  navigate: PartidaPageProps['navigate'];
  timesIniciais: Time[];
  sessaoRestaurada: ReturnType<typeof getSessaoPartidaAtiva>;
  tempoMinutos: number;
  maxGolsRegra: number;
  vagasPorTime: number;
}) {
  const duracaoSegundos = (tempoMinutos > 0 ? tempoMinutos : 10) * 60;
  const maxGols = maxGolsRegra > 0 ? maxGolsRegra : GOLS_PADRAO;

  // fila[0] x fila[1] estão em quadra; o restante aguarda
  const [fila, setFila] = useState<Time[]>(() => sessaoRestaurada?.fila ?? timesIniciais);
  const [jogadoresAusentes, setJogadoresAusentes] = useState<Jogador[]>(
    () => sessaoRestaurada?.jogadoresAusentes ?? [],
  );
  const [partidasConcluidas, setPartidasConcluidas] = useState<PartidaConcluida[]>(
    () => sessaoRestaurada?.partidasConcluidas ?? [],
  );
  const [numeroPartida, setNumeroPartida] = useState(() => sessaoRestaurada?.numeroPartida ?? 1);
  const [gols, setGols] = useState<[number, number]>(() => sessaoRestaurada?.gols ?? [0, 0]);
  const [eventos, setEventos] = useState<EventoPartida[]>(() => sessaoRestaurada?.eventos ?? []);
  const [decorrido, setDecorrido] = useState(() => sessaoRestaurada?.decorrido ?? 0);
  const [rodando, setRodando] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Modais de fluxo
  const [modalAberto, setModalAberto] = useState(false);
  const [ladoGol, setLadoGol] = useState<Lado>(0);
  const [etapaModal, setEtapaModal] = useState<EtapaModal>('selecionar_autor');
  const [autorTemp, setAutorTemp] = useState<Jogador | null>(null);

  const [modalEditarTimes, setModalEditarTimes] = useState(false);
  const [modalVoltarAberto, setModalVoltarAberto] = useState(false);
  const [modalEmpateAberto, setModalEmpateAberto] = useState(false);
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);

  const confronto: [Time, Time] = [fila[0], fila[1]];
  const atingiuLimiteGols = gols[0] >= maxGols || gols[1] >= maxGols;
  const tempoEsgotado = decorrido >= duracaoSegundos;
  const acabou = tempoEsgotado || atingiuLimiteGols;
  const emAndamento = rodando && !acabou;

  const algumTimeEmQuadraDesfalcado =
    confronto[0].jogadores.length < vagasPorTime ||
    confronto[1].jogadores.length < vagasPorTime;

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
  const handleSelecionarAutor = (jogador: Jogador) => {
    setAutorTemp(jogador);
    setEtapaModal('selecionar_assistencia');
  };

  const handleIrParaGolContra = () => {
    setEtapaModal('selecionar_gol_contra');
  };

  const handleConfirmarGolContra = (jogadorAdversario: Jogador) => {
    const novoGols =
      ladoGol === 0
        ? ([gols[0] + 1, gols[1]] as [number, number])
        : ([gols[0], gols[1] + 1] as [number, number]);
    setGols(novoGols);

    if (novoGols[ladoGol] >= maxGols) {
      setRodando(false);
    }

    atualizarEstatisticasJogador(jogadorAdversario.id, {
      gols: 1,
      golsContra: 1,
      deltaRating: -0.2,
    });

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
      })),
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

  const handleConfirmarAssistencia = (assistenciaPor: Jogador | null) => {
    if (!autorTemp) return;

    const autorId = autorTemp.id;
    const assistId = assistenciaPor?.id;

    const novoGols =
      ladoGol === 0
        ? ([gols[0] + 1, gols[1]] as [number, number])
        : ([gols[0], gols[1] + 1] as [number, number]);
    setGols(novoGols);

    if (novoGols[ladoGol] >= maxGols) {
      setRodando(false);
    }

    atualizarEstatisticasJogador(autorId, { gols: 1, deltaRating: 0.05 });
    if (assistId) {
      atualizarEstatisticasJogador(assistId, { assistencias: 1, deltaRating: 0.03 });
    }

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
      })),
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

  /* ── Desfazer / Excluir evento registrado por engano ────────────────── */
  const handleDesfazerEvento = (evento: EventoPartida) => {
    setEventos((prev) => prev.filter((e) => e.id !== evento.id));
    setGols((prev) =>
      evento.lado === 0
        ? [Math.max(0, prev[0] - 1), prev[1]]
        : [prev[0], Math.max(0, prev[1] - 1)],
    );

    if (evento.tipo === 'gol_contra') {
      atualizarEstatisticasJogador(evento.jogador.id, {
        gols: -1,
        golsContra: -1,
        deltaRating: 0.2,
      });
      setFila((prevFila) =>
        prevFila.map((t) => ({
          ...t,
          jogadores: t.jogadores.map((j) =>
            j.id === evento.jogador.id
              ? {
                  ...j,
                  gols: Math.max(0, (j.gols || 0) - 1),
                  golsContra: Math.max(0, (j.golsContra || 0) - 1),
                  rating: Math.min(5.0, +(j.rating + 0.2).toFixed(1)),
                }
              : j,
          ),
        })),
      );
    } else {
      atualizarEstatisticasJogador(evento.jogador.id, {
        gols: -1,
        deltaRating: -0.05,
      });
      if (evento.assistenciaPor) {
        atualizarEstatisticasJogador(evento.assistenciaPor.id, {
          assistencias: -1,
          deltaRating: -0.03,
        });
      }
      setFila((prevFila) =>
        prevFila.map((t) => ({
          ...t,
          jogadores: t.jogadores.map((j) => {
            if (j.id === evento.jogador.id) {
              return {
                ...j,
                gols: Math.max(0, (j.gols || 0) - 1),
                rating: Math.max(1.0, +(j.rating - 0.05).toFixed(1)),
              };
            }
            if (evento.assistenciaPor && j.id === evento.assistenciaPor.id) {
              return {
                ...j,
                assistencias: Math.max(0, (j.assistencias || 0) - 1),
                rating: Math.max(1.0, +(j.rating - 0.03).toFixed(1)),
              };
            }
            return j;
          }),
        })),
      );
    }
  };

  /* ── Edição de Times (Saída antecipada, Realocação, Atrasados) ──────── */
  const handleMoverJogador = (jogadorId: string, timeOrigemId: string, timeDestinoId: string) => {
    if (timeOrigemId === timeDestinoId) return;
    setFila((prev) => {
      let movido: Jogador | null = null;
      const semOrigem = prev.map((t) => {
        if (t.id !== timeOrigemId) return t;
        const encontrado = t.jogadores.find((j) => j.id === jogadorId);
        if (encontrado) movido = encontrado;
        return { ...t, jogadores: t.jogadores.filter((j) => j.id !== jogadorId) };
      });
      if (!movido) return prev;
      return semOrigem.map((t) =>
        t.id === timeDestinoId ? { ...t, jogadores: [...t.jogadores, movido!] } : t,
      );
    });
  };

  const handleRemoverJogador = (jogadorId: string, timeOrigemId: string) => {
    setFila((prev) =>
      prev.map((t) => {
        if (t.id !== timeOrigemId) return t;
        const saindo = t.jogadores.find((j) => j.id === jogadorId);
        if (saindo) {
          setJogadoresAusentes((aus) =>
            aus.some((x) => x.id === saindo.id) ? aus : [...aus, saindo],
          );
        }
        return { ...t, jogadores: t.jogadores.filter((j) => j.id !== jogadorId) };
      }),
    );
  };

  const handleReintegrarAusente = (jogadorId: string, timeDestinoId: string) => {
    const jogador = jogadoresAusentes.find((j) => j.id === jogadorId);
    if (!jogador) return;
    setJogadoresAusentes((prev) => prev.filter((j) => j.id !== jogadorId));
    setFila((prev) =>
      prev.map((t) =>
        t.id === timeDestinoId ? { ...t, jogadores: [...t.jogadores, jogador] } : t,
      ),
    );
  };

  const handleAdicionarAtrasado = (novoJogador: Jogador, timeDestinoId: string) => {
    setFila((prev) =>
      prev.map((t) =>
        t.id === timeDestinoId ? { ...t, jogadores: [...t.jogadores, novoJogador] } : t,
      ),
    );
  };

  /* ── Controles de Partida e Navegação (Voltar / Pausar / Encerrar) ─── */
  const resetarPartida = () => {
    setGols([0, 0]);
    setEventos([]);
    setDecorrido(0);
    setRodando(false);
    setMostrarTodos(false);
  };

  const montarRegistroPartidaAtual = (): PartidaConcluida => ({
    id: `partida-${Date.now()}-${numeroPartida}`,
    numero: numeroPartida,
    nomeTimeEsq: confronto[0].nome,
    nomeTimeDir: confronto[1].nome,
    golsEsq: gols[0],
    golsDir: gols[1],
    eventos,
    duracaoSegundos: decorrido,
  });

  const avancarParaProximaPartida = (desempate?: OpcaoDesempate) => {
    const concluida = montarRegistroPartidaAtual();
    const novasConcluidas = [...partidasConcluidas, concluida];
    setPartidasConcluidas(novasConcluidas);
    registrarPartidasConcluidas([concluida]);

    const novaFila = proximoConfronto(fila, gols[0], gols[1], desempate);
    setFila(novaFila);
    setNumeroPartida((n) => n + 1);
    setModalEmpateAberto(false);
    resetarPartida();
  };

  const handleClicarProximaPartida = () => {
    setRodando(false);
    if (gols[0] === gols[1]) {
      setModalEmpateAberto(true);
      return;
    }
    avancarParaProximaPartida();
  };

  const handleClicarVoltarTopo = () => {
    setRodando(false);
    setModalVoltarAberto(true);
  };

  const handlePausarEVoltarAoGrupo = () => {
    salvarSessaoPartidaAtiva({
      fila,
      numeroPartida,
      gols,
      eventos,
      decorrido,
      regras: { tempoMinutos, maxGols, vagasPorTime },
      partidasConcluidas,
      jogadoresAusentes,
    });
    setModalVoltarAberto(false);
    navigate('detalhe-grupo');
  };

  const handleEncerrarRacha = () => {
    const temDadosNaAtual = decorrido > 0 || eventos.length > 0;
    const todas = temDadosNaAtual
      ? [...partidasConcluidas, montarRegistroPartidaAtual()]
      : partidasConcluidas;
    registrarPartidasConcluidas(todas);
    salvarSessaoPartidaAtiva(null);
    setModalVoltarAberto(false);
    navigate('detalhe-grupo');
  };

  const eventosVisiveis = mostrarTodos ? eventos : eventos.slice(0, EVENTOS_VISIVEIS);
  const corPlacar = (lado: Lado) => (gols[lado] > gols[lado === 0 ? 1 : 0] ? '#88D982' : '#BFCABA');
  const tempoRestante = Math.max(0, duracaoSegundos - decorrido);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#102A43]">
      {/* ── Barra Superior com botão Voltar e Editar Times ────────────── */}
      <header
        className="w-full flex items-center justify-between px-4"
        style={{ backgroundColor: '#000F1E', borderBottom: '1px solid #40493D', height: 56 }}
      >
        <button
          type="button"
          onClick={handleClicarVoltarTopo}
          className="flex items-center gap-1.5 text-[#BFCABA] hover:text-white transition-colors text-[14px] font-medium"
          aria-label="Voltar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </button>

        <h1 className="text-white font-semibold text-[15px]">
          Partida {numeroPartida}
        </h1>

        <button
          type="button"
          onClick={() => {
            setRodando(false);
            setModalEditarTimes(true);
          }}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#1B374F] hover:bg-[#314863] text-[#CEE5FF] text-[12px] font-semibold transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Times
          {algumTimeEmQuadraDesfalcado && (
            <span
              className="w-2 h-2 rounded-full bg-[#FF8080]"
              title="Há time em quadra com jogador a menos"
            />
          )}
        </button>
      </header>

      <main className="flex-1 w-full max-w-[402px] mx-auto flex flex-col gap-6 px-[22px] pt-6 pb-[120px]">
        {/* Alerta caso algum time em quadra esteja desfalcado */}
        {algumTimeEmQuadraDesfalcado && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-[8px] bg-[#3a1a1d] border border-[#7D2E2F] text-[#FFC2C2] text-[12px]">
            <span>
              Desfalque em quadra ({confronto[0].nome}: {confronto[0].jogadores.length}/{vagasPorTime} · {confronto[1].nome}: {confronto[1].jogadores.length}/{vagasPorTime})
            </span>
            <button
              type="button"
              onClick={() => {
                setRodando(false);
                setModalEditarTimes(true);
              }}
              className="px-2 py-1 rounded-[4px] bg-[#7D2E2F] text-white font-semibold text-[11px] flex-shrink-0"
            >
              Completar
            </button>
          </div>
        )}

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
                <div key={ev.id} className="flex items-center gap-2.5 py-2 border-b border-[rgba(64,73,61,0.5)] last:border-b-0">
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
                  <button
                    type="button"
                    onClick={() => handleDesfazerEvento(ev)}
                    aria-label="Desfazer gol"
                    title="Desfazer este gol"
                    className="w-6 h-6 rounded-[6px] bg-[#1B374F] hover:bg-[#7D2E2F] text-[#BFCABA] hover:text-white text-[13px] flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    ×
                  </button>
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
            onClick={() => {
              setRodando(false);
              setModalCancelarAberto(true);
            }}
            className="flex-1 h-[52px] rounded-[4px] bg-[#7D2E2F] text-[#CBFFC2] text-[14px] font-semibold leading-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:brightness-110"
          >
            CANCELAR
            <br />
            PARTIDA
          </button>
          <button
            type="button"
            onClick={handleClicarProximaPartida}
            className="flex-1 h-[52px] rounded-[4px] bg-[#2E7D32] text-[#CBFFC2] text-[14px] font-semibold leading-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:brightness-110"
          >
            PRÓXIMA
            <br />
            PARTIDA
          </button>
        </div>
      </footer>

      {/* ── Modal 1: Gol / Assistência / Gol Contra ───────────────────── */}
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

      {/* ── Modal 2: Editar Times (Saída antecipada / Realocação / Atrasados) */}
      {modalEditarTimes && (
        <EditTeamsModal
          times={fila}
          jogadoresAusentes={jogadoresAusentes}
          vagasPorTime={vagasPorTime}
          partidaEmCurso
          onMoverJogador={handleMoverJogador}
          onRemoverJogador={handleRemoverJogador}
          onReintegrarAusente={handleReintegrarAusente}
          onAdicionarAtrasado={handleAdicionarAtrasado}
          onClose={() => setModalEditarTimes(false)}
        />
      )}

      {/* ── Modal 3: Botão Voltar (Pausar ou Encerrar Racha do dia) ───── */}
      {modalVoltarAberto && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center px-6 bg-[rgba(0,15,30,0.75)] backdrop-blur-[4px]"
          onClick={() => setModalVoltarAberto(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-[340px] rounded-[12px] bg-[#000F1E] border border-[#40493D] p-5 flex flex-col gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-white text-[16px] leading-5"
              style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800 }}
            >
              Sair da tela de partida?
            </h2>
            <p className="text-[#9FB7D6] text-[13px] leading-5">
              Você pode pausar para consultar o grupo e retomar depois, ou encerrar o racha do dia salvando as partidas realizadas.
            </p>

            <button
              type="button"
              onClick={handlePausarEVoltarAoGrupo}
              className="w-full py-3 px-4 rounded-[8px] bg-[#314863] hover:brightness-110 text-white text-[13px] font-semibold text-left flex flex-col gap-0.5"
            >
              <span>⏸ Pausar e voltar ao grupo</span>
              <span className="text-[#9FB7D6] text-[11px] font-normal">
                Mantém o placar ({gols[0]} x {gols[1]}) e o tempo para retomar depois
              </span>
            </button>

            <button
              type="button"
              onClick={handleEncerrarRacha}
              className="w-full py-3 px-4 rounded-[8px] bg-[#2E7D32] hover:brightness-110 text-[#CBFFC2] text-[13px] font-semibold text-left flex flex-col gap-0.5"
            >
              <span>✓ Encerrar Racha do dia</span>
              <span className="text-[#E6EEF7] text-[11px] font-normal">
                Finaliza o racha, salva {partidasConcluidas.length + (decorrido > 0 || eventos.length > 0 ? 1 : 0)} partida(s) no histórico e volta ao grupo
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModalVoltarAberto(false)}
              className="w-full py-2.5 rounded-[8px] border border-[#40493D] text-[#BFCABA] hover:text-white text-[13px] font-medium"
            >
              Continuar na partida
            </button>
          </div>
        </div>
      )}

      {/* ── Modal 4: Cancelar Partida Atual ──────────────────────────── */}
      {modalCancelarAberto && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center px-6 bg-[rgba(0,15,30,0.75)] backdrop-blur-[4px]"
          onClick={() => setModalCancelarAberto(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-[340px] rounded-[12px] bg-[#000F1E] border border-[#40493D] p-5 flex flex-col gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-white text-[16px] leading-5"
              style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800 }}
            >
              Cancelar Partida {numeroPartida}?
            </h2>
            <p className="text-[#9FB7D6] text-[13px] leading-5">
              Escolha se deseja apenas reiniciar os gols e o tempo desta partida ou voltar para a tela de sorteio.
            </p>

            <button
              type="button"
              onClick={() => {
                eventsRevertAll(eventos, handleDesfazerEvento);
                resetarPartida();
                setModalCancelarAberto(false);
              }}
              className="w-full py-3 px-4 rounded-[8px] bg-[#314863] hover:brightness-110 text-white text-[13px] font-semibold"
            >
              Reiniciar Partida {numeroPartida} (zerar placar e tempo)
            </button>

            <button
              type="button"
              onClick={() => {
                eventsRevertAll(eventos, handleDesfazerEvento);
                salvarSessaoPartidaAtiva(null);
                setModalCancelarAberto(false);
                navigate('sorteio');
              }}
              className="w-full py-3 px-4 rounded-[8px] bg-[#7D2E2F] hover:brightness-110 text-[#FFC2C2] text-[13px] font-semibold"
            >
              Cancelar e voltar ao Sorteio de Times
            </button>

            <button
              type="button"
              onClick={() => setModalCancelarAberto(false)}
              className="w-full py-2.5 rounded-[8px] border border-[#40493D] text-[#BFCABA] hover:text-white text-[13px] font-medium"
            >
              Voltar ao jogo
            </button>
          </div>
        </div>
      )}

      {/* ── Modal 5: Desempate ao avançar para a Próxima Partida ─────── */}
      {modalEmpateAberto && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center px-6 bg-[rgba(0,15,30,0.75)] backdrop-blur-[4px]"
          onClick={() => setModalEmpateAberto(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-[340px] rounded-[12px] bg-[#000F1E] border border-[#40493D] p-5 flex flex-col gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-white text-[16px] leading-5"
              style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800 }}
            >
              Partida Empatada ({gols[0]} x {gols[1]})
            </h2>
            <p className="text-[#9FB7D6] text-[13px] leading-5">
              Quem permanece em quadra para enfrentar {fila[2]?.nome ?? 'o próximo time'}?
            </p>

            <button
              type="button"
              onClick={() => avancarParaProximaPartida('esq')}
              className="w-full py-3 px-4 rounded-[8px] bg-[#2E7D32] hover:brightness-110 text-[#CBFFC2] text-[13px] font-semibold"
            >
              {confronto[0].nome} permanece em quadra
            </button>

            <button
              type="button"
              onClick={() => avancarParaProximaPartida('dir')}
              className="w-full py-3 px-4 rounded-[8px] bg-[#314863] hover:brightness-110 text-[#CEE5FF] text-[13px] font-semibold"
            >
              {confronto[1].nome} permanece em quadra
            </button>

            {fila.length > 2 && (
              <button
                type="button"
                onClick={() => avancarParaProximaPartida('ambos_saem')}
                className="w-full py-2.5 px-4 rounded-[8px] bg-[#001D32] border border-[#40493D] hover:bg-[#012138] text-[#CEE5FF] text-[13px] font-semibold"
              >
                Ambos saem ({fila[2].nome} entra)
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalEmpateAberto(false)}
              className="w-full py-2 rounded-[8px] text-[#9FB7D6] hover:text-white text-[12px]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Reverte as estatísticas de todos os eventos da partida quando ela é anulada. */
function eventsRevertAll(
  eventos: EventoPartida[],
  desfazer: (ev: EventoPartida) => void,
) {
  eventos.forEach((ev) => desfazer(ev));
}
