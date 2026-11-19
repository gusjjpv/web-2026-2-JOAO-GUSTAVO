import { useEffect, useState, type FormEvent } from 'react';
import {
  criarJogadorAtrasado,
  ratingTotal,
  type Jogador,
  type Time,
} from '../../mock/matchData';

interface EditTeamsModalProps {
  times: Time[];
  jogadoresAusentes: Jogador[];
  vagasPorTime: number;
  /** Se true, indica que times[0] e times[1] estão em quadra no momento */
  partidaEmCurso?: boolean;
  onMoverJogador: (jogadorId: string, timeOrigemId: string, timeDestinoId: string) => void;
  onRemoverJogador: (jogadorId: string, timeOrigemId: string) => void;
  onReintegrarAusente: (jogadorId: string, timeDestinoId: string) => void;
  onAdicionarAtrasado: (jogador: Jogador, timeDestinoId: string) => void;
  onClose: () => void;
}

/**
 * Modal de gerenciamento e edição de times durante o sorteio ou partida:
 * - Remover jogador que saiu antes do horário acabar (mantendo suas estatísticas)
 * - Realocar / mover jogadores entre times (ex: substituto da fila de espera)
 * - Adicionar jogador que chegou atrasado e alocá-lo em um time
 */
export function EditTeamsModal({
  times,
  jogadoresAusentes,
  vagasPorTime,
  partidaEmCurso = false,
  onMoverJogador,
  onRemoverJogador,
  onReintegrarAusente,
  onAdicionarAtrasado,
  onClose,
}: EditTeamsModalProps) {
  const [abaTimeId, setAbaTimeId] = useState<string>(times[0]?.id ?? '');
  const [mostrarFormAtrasado, setMostrarFormAtrasado] = useState(false);
  const [nomeAtrasado, setNomeAtrasado] = useState('');
  const [ratingAtrasado, setRatingAtrasado] = useState('4.0');
  const [goleiroAtrasado, setGoleiroAtrasado] = useState(false);
  const [timeDestinoAtrasado, setTimeDestinoAtrasado] = useState<string>(() => {
    // Sugere por padrão um time com vaga aberta ou o time que está esperando na fila
    const comVaga = times.find((t) => t.jogadores.length < vagasPorTime);
    if (comVaga) return comVaga.id;
    return times[2]?.id ?? times[times.length - 1]?.id ?? '';
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const timeAtual = times.find((t) => t.id === abaTimeId) ?? times[0];
  const outrosTimes = times.filter((t) => t.id !== timeAtual?.id);
  const desfalcado = timeAtual && timeAtual.jogadores.length < vagasPorTime;

  const handleCriarAtrasado = (e: FormEvent) => {
    e.preventDefault();
    if (!nomeAtrasado.trim() || !timeDestinoAtrasado) return;
    const nota = parseFloat(ratingAtrasado);
    const novo = criarJogadorAtrasado(
      nomeAtrasado,
      isNaN(nota) ? 4.0 : nota,
      goleiroAtrasado,
    );
    onAdicionarAtrasado(novo, timeDestinoAtrasado);
    setNomeAtrasado('');
    setRatingAtrasado('4.0');
    setGoleiroAtrasado(false);
    setMostrarFormAtrasado(false);
    setAbaTimeId(timeDestinoAtrasado);
  };

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center px-4 bg-[rgba(0,15,30,0.75)] backdrop-blur-[4px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Editar Times"
    >
      <div
        className="w-full max-w-[370px] max-h-[88vh] flex flex-col rounded-[12px] bg-[#000F1E] border border-[#40493D] shadow-2xl p-4 gap-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2
              className="text-white text-[16px] leading-5"
              style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800 }}
            >
              Editar Times
            </h2>
            <p className="text-[#9FB7D6] text-[12px] mt-1">
              Realocar jogadores, registrar saída ou chegada tardia.
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

        {/* Abas dos Times */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {times.map((t, idx) => {
            const ativo = t.id === timeAtual?.id;
            const emQuadra = partidaEmCurso && (idx === 0 || idx === 1);
            const falta = t.jogadores.length < vagasPorTime;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAbaTimeId(t.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border transition-colors flex flex-col items-start ${
                  ativo
                    ? 'bg-[#314863] border-[#88D982] text-white'
                    : 'bg-[#001D32] border-[#40493D] text-[#BFCABA]'
                }`}
              >
                <span className="flex items-center gap-1">
                  {t.nome}
                  {falta && (
                    <span className="w-2 h-2 rounded-full bg-[#FF8080]" title="Time desfalcado" />
                  )}
                </span>
                <span className="text-[10px] text-[#9FB7D6] font-normal">
                  {t.jogadores.length}/{vagasPorTime} · {emQuadra ? 'Jogando' : 'Na fila'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-0.5">
          {timeAtual && (
            <div className="rounded-[8px] bg-[#1F3B54] p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[#CEE5FF] text-[13px] font-semibold">
                  Jogadores — {timeAtual.nome}
                </span>
                <span className="text-[#88D982] text-[12px] font-bold">
                  Rating: {ratingTotal(timeAtual).toFixed(1)}
                </span>
              </div>

              {desfalcado && (
                <div className="px-2.5 py-1.5 rounded-[6px] bg-[#3a1a1d] border border-[#7D2E2F] text-[#FFC2C2] text-[11px]">
                  Time com {timeAtual.jogadores.length}/{vagasPorTime} jogadores. Você pode puxar um substituto de outro time abaixo ou adicionar quem chegou atrasado.
                </div>
              )}

              {timeAtual.jogadores.length === 0 && (
                <p className="text-[#9FB7D6] text-[12px] text-center py-3">
                  Nenhum jogador neste time.
                </p>
              )}

              {timeAtual.jogadores.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-col gap-1.5 p-2 rounded-[6px] bg-[#001D32] border border-[#40493D]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[#CEE5FF] text-[13px] font-semibold truncate">
                        {j.nome}
                        {j.goleiro && ' (G)'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-[8px] bg-[#88D982] text-[#003909] text-[11px] font-bold">
                        {j.rating.toFixed(1)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoverJogador(j.id, timeAtual.id)}
                      className="px-2 py-1 rounded-[4px] bg-[#7D2E2F] text-[#FFC2C2] text-[11px] font-semibold hover:brightness-110"
                      title="Marcar que o jogador saiu mais cedo (estatísticas são mantidas)"
                    >
                      Saiu
                    </button>
                  </div>

                  {/* Botões rápidos de realocação para outros times */}
                  {outrosTimes.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[rgba(64,73,61,0.5)]">
                      <span className="text-[#9FB7D6] text-[10px]">Mover para:</span>
                      {outrosTimes.map((dest) => (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={() => onMoverJogador(j.id, timeAtual.id, dest.id)}
                          className="px-2 py-0.5 rounded-[4px] bg-[#1B374F] hover:bg-[#314863] text-[#CEE5FF] text-[11px] font-medium transition-colors"
                        >
                          → {dest.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Atalho: Puxar substituto de outro time quando o time atual está desfalcado */}
          {timeAtual && desfalcado && outrosTimes.length > 0 && (
            <div className="rounded-[8px] bg-[#001D32] border border-[#40493D] p-2.5 flex flex-col gap-2">
              <span className="text-[#88D982] text-[12px] font-semibold">
                Puxar substituto para completar {timeAtual.nome}:
              </span>
              <div className="flex flex-col gap-1.5 max-h-[130px] overflow-y-auto">
                {outrosTimes.flatMap((origem) =>
                  origem.jogadores.map((j) => (
                    <div
                      key={`${origem.id}-${j.id}`}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[4px] bg-[#102A43]"
                    >
                      <span className="text-[#CEE5FF] text-[12px] truncate">
                        {j.nome} <span className="text-[#9FB7D6] text-[11px]">({origem.nome})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onMoverJogador(j.id, origem.id, timeAtual.id)}
                        className="px-2 py-0.5 rounded-[4px] bg-[#2E7D32] text-[#CBFFC2] text-[11px] font-semibold hover:brightness-110"
                      >
                        + Trazer
                      </button>
                    </div>
                  )),
                )}
              </div>
            </div>
          )}

          {/* Lista de jogadores que saíram (permite reintegrar caso voltem) */}
          {jogadoresAusentes.length > 0 && timeAtual && (
            <div className="rounded-[8px] bg-[#001D32] border border-[#40493D] p-2.5 flex flex-col gap-1.5">
              <span className="text-[#BFCABA] text-[12px] font-semibold">
                Jogadores que saíram ({jogadoresAusentes.length}):
              </span>
              {jogadoresAusentes.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[4px] bg-[#102A43]"
                >
                  <span className="text-[#CEE5FF] text-[12px] truncate">
                    {j.nome} · <span className="text-[#9FB7D6] text-[11px]">{j.gols ?? 0}G / {j.assistencias ?? 0}A</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onReintegrarAusente(j.id, timeAtual.id)}
                    className="px-2 py-0.5 rounded-[4px] bg-[#314863] text-[#CEE5FF] text-[11px] font-semibold hover:brightness-110"
                  >
                    Voltar p/ {timeAtual.nome}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar jogador que chegou atrasado */}
          {!mostrarFormAtrasado ? (
            <button
              type="button"
              onClick={() => {
                setTimeDestinoAtrasado(timeAtual?.id ?? times[0]?.id ?? '');
                setMostrarFormAtrasado(true);
              }}
              className="w-full py-2.5 rounded-[6px] border border-dashed border-[#88D982] text-[#88D982] text-[13px] font-semibold hover:bg-[#001D32] transition-colors"
            >
              + Adicionar jogador que chegou atrasado
            </button>
          ) : (
            <form
              onSubmit={handleCriarAtrasado}
              className="rounded-[8px] bg-[#001D32] border border-[#88D982] p-3 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#88D982] text-[12px] font-bold uppercase">
                  Novo jogador (chegou atrasado)
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarFormAtrasado(false)}
                  className="text-[#9FB7D6] text-[11px] hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <input
                type="text"
                placeholder="Nome do jogador (ex: Matheus R.)"
                value={nomeAtrasado}
                onChange={(e) => setNomeAtrasado(e.target.value)}
                maxLength={30}
                required
                className="w-full px-3 py-2 rounded-[6px] bg-[#102A43] border border-[#40493D] text-white text-[13px] outline-none"
              />

              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[#9FB7D6] text-[11px]">Alocar no time</label>
                  <select
                    value={timeDestinoAtrasado}
                    onChange={(e) => setTimeDestinoAtrasado(e.target.value)}
                    className="px-2.5 py-2 rounded-[6px] bg-[#102A43] border border-[#40493D] text-white text-[12px] outline-none"
                  >
                    {times.map((t, idx) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.jogadores.length}/{vagasPorTime}
                        {partidaEmCurso ? (idx < 2 ? ' · Jogando' : ' · Fila') : ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20 flex flex-col gap-1">
                  <label className="text-[#9FB7D6] text-[11px]">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={ratingAtrasado}
                    onChange={(e) => setRatingAtrasado(e.target.value)}
                    className="px-2.5 py-2 rounded-[6px] bg-[#102A43] border border-[#40493D] text-white text-[12px] outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-[#CEE5FF] text-[12px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={goleiroAtrasado}
                  onChange={(e) => setGoleiroAtrasado(e.target.checked)}
                />
                É goleiro (G)
              </label>

              <button
                type="submit"
                className="w-full py-2 rounded-[6px] bg-[#C6FF00] text-[#102A43] text-[13px] font-bold hover:opacity-90"
              >
                Confirmar e Alocar Jogador
              </button>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-[6px] bg-[#314863] text-white text-[13px] font-semibold hover:brightness-110"
        >
          Concluir Edição
        </button>
      </div>
    </div>
  );
}
