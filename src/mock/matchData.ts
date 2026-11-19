/**
 * Dados mock e regras de sorteio/partida — substituem a API enquanto o backend não existe.
 * Quando integrado, os jogadores confirmados virão da ocorrência do racha (RF-06).
 */

export interface Jogador {
  id: string;
  nome: string;
  /** Nota de 0 a 5 usada para equilibrar os times */
  rating: number;
  goleiro: boolean;
  foto: string | null;
  /** Estatísticas acumuladas no racha */
  gols?: number;
  golsContra?: number;
  assistencias?: number;
}

export interface Time {
  id: string;
  nome: string;
  jogadores: Jogador[];
}

export type TipoEvento = 'gol' | 'gol_contra' | 'assistencia';

export interface EventoPartida {
  id: string;
  tipo: TipoEvento;
  jogador: Jogador;
  assistenciaPor?: Jogador;
  /** Índice do time que pontuou (no placar): 0 = lado esquerdo, 1 = lado direito */
  lado: 0 | 1;
  nomeTime: string;
  /** Tempo de jogo decorrido em segundos */
  segundos: number;
}

export interface RegrasRacha {
  tempoMinutos?: number;
  maxGols?: number;
  vagasPorTime?: number;
}

/** Dados repassados da tela de sorteio para a tela de partida (via routeState). */
export interface PartidaNavState {
  times: Time[];
  regras?: RegrasRacha;
}

export const JOGADORES_POR_TIME = 5;
export const DURACAO_PADRAO_SEG = 10 * 60;
export const GOLS_PADRAO = 2;

/* ── Store em memória das regras do racha atual ─────────────────────────── */

let _regrasAtuais: Required<RegrasRacha> = {
  tempoMinutos: 10,
  maxGols: GOLS_PADRAO,
  vagasPorTime: JOGADORES_POR_TIME,
};

export function getRegrasRacha(): Required<RegrasRacha> {
  return { ..._regrasAtuais };
}

export function setRegrasRacha(regras: RegrasRacha): Required<RegrasRacha> {
  _regrasAtuais = {
    tempoMinutos:
      regras.tempoMinutos && regras.tempoMinutos > 0
        ? regras.tempoMinutos
        : _regrasAtuais.tempoMinutos,
    maxGols:
      regras.maxGols && regras.maxGols > 0 ? regras.maxGols : _regrasAtuais.maxGols,
    vagasPorTime:
      regras.vagasPorTime && regras.vagasPorTime > 0
        ? regras.vagasPorTime
        : _regrasAtuais.vagasPorTime,
  };
  return getRegrasRacha();
}

/**
 * Atualiza estatísticas e rating de um jogador no mock em memória
 * (ex: gol marcado, assistência ou gol contra com punição no rating).
 */
export function atualizarEstatisticasJogador(
  jogadorId: string,
  delta: { gols?: number; golsContra?: number; assistencias?: number; deltaRating?: number },
): void {
  const idx = mockJogadoresConfirmados.findIndex((j) => j.id === jogadorId);
  if (idx === -1) return;
  const atual = mockJogadoresConfirmados[idx];
  const novoRating =
    delta.deltaRating !== undefined
      ? Math.min(5.0, Math.max(1.0, +(atual.rating + delta.deltaRating).toFixed(1)))
      : atual.rating;

  mockJogadoresConfirmados[idx] = {
    ...atual,
    gols: (atual.gols ?? 0) + (delta.gols ?? 0),
    golsContra: (atual.golsContra ?? 0) + (delta.golsContra ?? 0),
    assistencias: (atual.assistencias ?? 0) + (delta.assistencias ?? 0),
    rating: novoRating,
  };
}

/* ── Mock: jogadores confirmados no racha ───────────────────────────────── */

export const mockJogadoresConfirmados: Jogador[] = [
  { id: 'j01', nome: 'Carlos S.', rating: 4.8, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j02', nome: 'João M.', rating: 4.5, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j03', nome: 'Rafael T.', rating: 4.2, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j04', nome: 'Pedro H.', rating: 4.0, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j05', nome: 'Luiz G.', rating: 3.9, goleiro: true, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j06', nome: 'André P.', rating: 4.7, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j07', nome: 'Bruno A.', rating: 4.6, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j08', nome: 'Marcos V.', rating: 4.1, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j09', nome: 'Felipe L.', rating: 4.1, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j10', nome: 'Thiago R.', rating: 4.0, goleiro: true, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j11', nome: 'Gabriel F.', rating: 4.9, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j12', nome: 'Lucas C.', rating: 4.4, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j13', nome: 'Diego S.', rating: 4.3, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j14', nome: 'Vitor K.', rating: 4.0, goleiro: false, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
  { id: 'j15', nome: 'Eduardo N.', rating: 3.7, goleiro: true, foto: null, gols: 0, golsContra: 0, assistencias: 0 },
];

/* ── Sorteio ────────────────────────────────────────────────────────────── */

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function ratingTotal(time: Time): number {
  return time.jogadores.reduce((soma, j) => soma + j.rating, 0);
}

/** Linha → goleiro por último; demais por rating decrescente. */
function ordenarJogadores(jogadores: Jogador[]): Jogador[] {
  return [...jogadores].sort((a, b) => Number(a.goleiro) - Number(b.goleiro) || b.rating - a.rating);
}

/**
 * Sorteia os times.
 *  - equilibrar = true: distribui um goleiro por time e, em seguida, coloca cada jogador
 *    (do maior para o menor rating, com leve aleatoriedade) no time com menor rating total.
 *  - equilibrar = false: sorteio totalmente aleatório.
 */
export function sortearTimes(
  jogadores: Jogador[],
  porTime = JOGADORES_POR_TIME,
  equilibrar = true,
): Time[] {
  const qtdTimes = Math.max(2, Math.floor(jogadores.length / porTime));
  const capacidade = Math.ceil(jogadores.length / qtdTimes);
  const times: Time[] = Array.from({ length: qtdTimes }, (_, i) => ({
    id: `time-${i}`,
    nome: `Time ${String.fromCharCode(65 + i)}`,
    jogadores: [],
  }));

  if (!equilibrar) {
    embaralhar(jogadores).forEach((j, i) => times[i % qtdTimes].jogadores.push(j));
  } else {
    // Ruído pequeno para que "Refazer Sorteio" gere combinações diferentes e equilibradas.
    const porRating = (lista: Jogador[]) =>
      lista
        .map((j) => ({ j, peso: j.rating + (Math.random() - 0.5) * 0.4 }))
        .sort((a, b) => b.peso - a.peso)
        .map(({ j }) => j);

    const goleiros = porRating(jogadores.filter((j) => j.goleiro));
    const linha = porRating(jogadores.filter((j) => !j.goleiro));

    const alocar = (j: Jogador, apenasSemGoleiro = false) => {
      const candidatos = times.filter(
        (t) =>
          t.jogadores.length < capacidade &&
          (!apenasSemGoleiro || !t.jogadores.some((x) => x.goleiro)),
      );
      const lista = candidatos.length ? candidatos : times.filter((t) => t.jogadores.length < capacidade);
      lista.sort((a, b) => ratingTotal(a) - ratingTotal(b) || a.jogadores.length - b.jogadores.length);
      lista[0].jogadores.push(j);
    };

    goleiros.forEach((g) => alocar(g, true));
    linha.forEach((j) => alocar(j));
  }

  return times.map((t) => ({ ...t, jogadores: ordenarJogadores(t.jogadores) }));
}

/* ── Utilitários de partida ─────────────────────────────────────────────── */

export function formatarTempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Regra "quem ganha fica": o vencedor permanece e enfrenta o próximo da fila;
 * o perdedor vai para o fim da fila. Em caso de empate, sai o time que já estava
 * em quadra (lado esquerdo) e o desafiante permanece.
 */
export function proximoConfronto(fila: Time[], golsEsq: number, golsDir: number): Time[] {
  const [esq, dir, ...resto] = fila;
  const vencedor = golsEsq > golsDir ? esq : dir;
  const perdedor = vencedor === esq ? dir : esq;
  if (resto.length === 0) return [vencedor, perdedor];
  const [proximo, ...demais] = resto;
  return [vencedor, proximo, ...demais, perdedor];
}
