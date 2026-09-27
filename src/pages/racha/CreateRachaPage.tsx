import { useState, type FormEvent } from 'react';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import type { Route } from '../../App';

interface CreateRachaPageProps {
  navigate: (route: Route, state?: unknown) => void;
  /** Dados do grupo pai (passados via routeState) */
  groupData?: { nome: string };
}

type Modalidade = 'futsal' | 'society';

interface RachaForm {
  titulo: string;
  data: string;       // 'YYYY-MM-DD'
  hora: string;       // 'HH:MM'
  local: string;
  maxJogadores: string;
  vagasPorTime: string;
  modalidade: Modalidade | '';
  observacoes: string;
}

type FormErrors = Partial<Record<keyof RachaForm, string>>;

const MODALIDADES: { label: string; value: Modalidade }[] = [
  { label: 'Futsal', value: 'futsal' },
  { label: 'Society', value: 'society' },
];

/**
 * Tela de Criação de Racha (Ocorrência Agendada) — RachaoApp
 *
 * RF-06: O administrador cria uma ocorrência com:
 *  - Título
 *  - Data e Hora
 *  - Local (campo texto — mapa interativo a integrar futuramente)
 *  - Limite máximo de jogadores
 *  - Vagas por time
 *  - Modalidade
 *  - Observações (opcional)
 */
export function CreateRachaPage({ navigate, groupData }: CreateRachaPageProps) {
  const [form, setForm] = useState<RachaForm>({
    titulo: '',
    data: '',
    hora: '',
    local: '',
    maxJogadores: '',
    vagasPorTime: '',
    modalidade: '',
    observacoes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const setField = <K extends keyof RachaForm>(key: K, value: RachaForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /* ── Validação ───────────────────────────────────────────────────────── */
  const validate = (): FormErrors => {
    const e: FormErrors = {};

    if (!form.titulo.trim() || form.titulo.trim().length < 3)
      e.titulo = 'Título deve ter pelo menos 3 caracteres';
    else if (form.titulo.trim().length > 60)
      e.titulo = 'Título deve ter no máximo 60 caracteres';

    if (!form.data)
      e.data = 'Informe a data do racha';
    else if (new Date(form.data) < new Date(new Date().toDateString()))
      e.data = 'A data não pode ser no passado';

    if (!form.hora)
      e.hora = 'Informe o horário do racha';

    if (!form.local.trim())
      e.local = 'Informe o local do racha';

    const max = parseInt(form.maxJogadores, 10);
    if (!form.maxJogadores || isNaN(max) || max < 2)
      e.maxJogadores = 'Mínimo de 2 jogadores';
    else if (max > 100)
      e.maxJogadores = 'Máximo de 100 jogadores';

    const vpt = parseInt(form.vagasPorTime, 10);
    if (!form.vagasPorTime || isNaN(vpt) || vpt < 1)
      e.vagasPorTime = 'Informe as vagas por time';
    else if (!isNaN(max) && vpt >= max)
      e.vagasPorTime = 'Vagas por time deve ser menor que o total';

    if (!form.modalidade)
      e.modalidade = 'Selecione a modalidade';

    return e;
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // TODO: POST /rachas via API Gateway → L_Racha Lambda
    const rachaData = {
      titulo: form.titulo.trim(),
      data: form.data,
      hora: form.hora,
      local: form.local.trim(),
      maxJogadores: parseInt(form.maxJogadores, 10),
      vagasPorTime: parseInt(form.vagasPorTime, 10),
      modalidade: form.modalidade,
      observacoes: form.observacoes.trim() || null,
    };

    console.log('Racha criado:', rachaData);
    navigate('detalhe-grupo');
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="w-full flex items-center px-4"
        style={{ backgroundColor: '#000F1E', borderBottom: '1px solid #40493D', height: 56 }}
      >
        <button
          type="button"
          onClick={() => navigate('detalhe-grupo')}
          className="flex items-center gap-2 text-[#BFCABA] hover:text-white transition-colors text-[14px] font-medium"
          aria-label="Voltar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </button>
        <h1 className="flex-1 text-center text-white font-semibold text-[16px]" style={{ marginRight: 52 }}>
          Criar Racha
        </h1>
      </header>

      {/* ── Subtítulo do grupo ─────────────────────────────────────────── */}
      {groupData?.nome && (
        <div
          className="px-5 py-2 flex items-center gap-2"
          style={{ backgroundColor: '#000F1E', borderBottom: '1px solid #1A3A5C' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-[#9FB7D6] text-[12px] font-medium">{groupData.nome}</span>
        </div>
      )}

      {/* ── Formulário ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-6 pt-6 pb-10 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 w-full"
          style={{ maxWidth: 327 }}
          noValidate
        >

          {/* Título do Racha */}
          <InputField
            label="Título do racha"
            type="text"
            placeholder="Ex: Racha da Sexta — Arena X"
            value={form.titulo}
            onChange={(e) => setField('titulo', e.target.value)}
            error={errors.titulo}
            maxLength={60}
          />

          {/* Data e Hora — linha dupla */}
          <div className="flex gap-3">
            {/* Data */}
            <div className="flex flex-col gap-[2px] flex-1">
              <label
                htmlFor="racha-data"
                className="text-[#6C7278] font-medium text-[12px] leading-[1.6em] tracking-[-0.02em] font-['Plus_Jakarta_Sans']"
              >
                Data
              </label>
              <div
                className="flex flex-row items-center gap-[10px] px-[14px] py-[13.5px] bg-white border rounded-[10px]"
                style={{
                  borderColor: errors.data ? '#EF4444' : '#EDF1F3',
                  boxShadow: '0px 1px 2px 0px rgba(228, 229, 231, 0.24)',
                }}
              >
                <input
                  id="racha-data"
                  type="date"
                  value={form.data}
                  onChange={(e) => setField('data', e.target.value)}
                  className="flex-1 text-[#1A1C1E] font-medium text-[14px] leading-[1.4em] tracking-[-0.01em] outline-none border-none bg-transparent w-full"
                />
              </div>
              {errors.data && (
                <span className="text-red-500 text-[12px] font-medium mt-1">{errors.data}</span>
              )}
            </div>

            {/* Hora */}
            <div className="flex flex-col gap-[2px] flex-1">
              <label
                htmlFor="racha-hora"
                className="text-[#6C7278] font-medium text-[12px] leading-[1.6em] tracking-[-0.02em] font-['Plus_Jakarta_Sans']"
              >
                Horário
              </label>
              <div
                className="flex flex-row items-center gap-[10px] px-[14px] py-[13.5px] bg-white border rounded-[10px]"
                style={{
                  borderColor: errors.hora ? '#EF4444' : '#EDF1F3',
                  boxShadow: '0px 1px 2px 0px rgba(228, 229, 231, 0.24)',
                }}
              >
                <input
                  id="racha-hora"
                  type="time"
                  value={form.hora}
                  onChange={(e) => setField('hora', e.target.value)}
                  className="flex-1 text-[#1A1C1E] font-medium text-[14px] leading-[1.4em] tracking-[-0.01em] outline-none border-none bg-transparent w-full"
                />
              </div>
              {errors.hora && (
                <span className="text-red-500 text-[12px] font-medium mt-1">{errors.hora}</span>
              )}
            </div>
          </div>

          {/* Local */}
          <div className="flex flex-col gap-[2px]">
            <InputField
              label="Local"
              type="text"
              placeholder="Ex: Arena X — Rua das Flores, 123"
              value={form.local}
              onChange={(e) => setField('local', e.target.value)}
              error={errors.local}
              iconLeft={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
            />

            {/* Mapa placeholder — RF-06: localização apresentada por mapa */}
            <div
              className="w-full rounded-[12px] flex flex-col items-center justify-center gap-2 mt-1"
              style={{
                height: 120,
                backgroundColor: '#000F1E',
                border: '1px dashed #40493D',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#40493D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
              <span className="text-[#40493D] text-[11px] font-medium text-center px-4">
                Visualização do mapa em breve
              </span>
            </div>
          </div>

          {/* Vagas */}
          <div className="flex gap-3">
            <InputField
              label="Máx. jogadores"
              type="number"
              placeholder="Ex: 20"
              value={form.maxJogadores}
              onChange={(e) => setField('maxJogadores', e.target.value)}
              error={errors.maxJogadores}
              className="flex-1"
            />
            <InputField
              label="Vagas por time"
              type="number"
              placeholder="Ex: 5"
              value={form.vagasPorTime}
              onChange={(e) => setField('vagasPorTime', e.target.value)}
              error={errors.vagasPorTime}
              className="flex-1"
            />
          </div>

          {/* Modalidade */}
          <div className="flex flex-col gap-[2px]">
            <span className="text-[#6C7278] font-medium text-[12px] leading-[1.6em] tracking-[-0.02em] font-['Plus_Jakarta_Sans']">
              Modalidade
            </span>

            <div className="flex gap-3">
              {MODALIDADES.map((mod) => {
                const isActive = form.modalidade === mod.value;
                return (
                  <button
                    key={mod.value}
                    type="button"
                    onClick={() => setField('modalidade', mod.value)}
                    className="flex-1 py-[13.5px] px-4 rounded-[10px] border text-[14px] font-medium leading-[1.4em] transition-colors"
                    style={{
                      backgroundColor: isActive ? '#C6FF00' : '#FFFFFF',
                      color: isActive ? '#102A43' : '#1A1C1E',
                      borderColor: isActive ? '#C6FF00' : '#EDF1F3',
                      boxShadow: isActive ? 'none' : '0px 1px 2px 0px rgba(228, 229, 231, 0.24)',
                    }}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>

            {errors.modalidade && (
              <span className="text-red-500 text-[12px] font-medium mt-1">{errors.modalidade}</span>
            )}
          </div>

          {/* Observações (opcional) */}
          <div className="flex flex-col gap-[2px]">
            <label
              htmlFor="racha-obs"
              className="text-[#6C7278] font-medium text-[12px] leading-[1.6em] tracking-[-0.02em] font-['Plus_Jakarta_Sans']"
            >
              Observações <span style={{ color: '#40493D' }}>(opcional)</span>
            </label>
            <div
              className="flex bg-white border border-[#EDF1F3] rounded-[10px] px-[14px] py-[13.5px]"
              style={{ boxShadow: '0px 1px 2px 0px rgba(228, 229, 231, 0.24)' }}
            >
              <textarea
                id="racha-obs"
                rows={3}
                placeholder="Ex: Levar colete, água cobrada separado..."
                value={form.observacoes}
                onChange={(e) => setField('observacoes', e.target.value)}
                maxLength={300}
                className="flex-1 text-[#1A1C1E] font-medium text-[14px] leading-[1.4em] tracking-[-0.01em] outline-none border-none bg-transparent placeholder:text-[#6C7278] resize-none w-full"
              />
            </div>
          </div>

          {/* Resumo rápido (vagas por time) */}
          {form.maxJogadores && form.vagasPorTime && !errors.maxJogadores && !errors.vagasPorTime && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-[10px]"
              style={{ backgroundColor: '#000F1E', border: '1px solid #1A3A5C' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-[#9FB7D6] text-[12px]">
                {Math.floor(parseInt(form.maxJogadores) / parseInt(form.vagasPorTime))} time(s) de {form.vagasPorTime} — {form.maxJogadores} jogadores no total
              </span>
            </div>
          )}

          {/* Botão de submit */}
          <div className="flex justify-center mt-2">
            <Button type="submit" style={{ width: 200, borderRadius: 8 }}>
              Agendar Racha →
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
