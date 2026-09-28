import { useState, useRef, type FormEvent } from 'react';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import type { Route } from '../../App';

interface CreateGroupPageProps {
  navigate: (route: Route, state?: unknown) => void;
}

type Modalidade = 'futsal' | 'society';

interface GroupForm {
  nome: string;
  modalidades: Modalidade[]; // multi-seleção
  fotoCapa: string | null;
}

type FormErrors = Partial<Record<'nome' | 'modalidades', string>>;

const MODALIDADES: { label: string; value: Modalidade }[] = [
  { label: 'Futsal', value: 'futsal' },
  { label: 'Society', value: 'society' },
];

/**
 * Página de Criação de Grupo — RachaoApp
 *
 * Campos:
 *  - Foto de capa (opcional)
 *  - Nome do grupo (obrigatório, 3–50 chars)
 *  - Modalidades (Futsal e/ou Society — multi-seleção)
 */
export function CreateGroupPage({ navigate }: CreateGroupPageProps) {
  const [form, setForm] = useState<GroupForm>({
    nome: '',
    modalidades: [],
    fotoCapa: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Foto de capa ────────────────────────────────────────────────────── */
  const handleCoverClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setForm((prev) => ({ ...prev, fotoCapa: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  /* ── Modalidade (toggle multi-select) ───────────────────────────────── */
  const toggleModalidade = (value: Modalidade) => {
    setForm((prev) => {
      const already = prev.modalidades.includes(value);
      return {
        ...prev,
        modalidades: already
          ? prev.modalidades.filter((m) => m !== value)
          : [...prev.modalidades, value],
      };
    });
    setErrors((prev) => ({ ...prev, modalidades: undefined }));
  };

  /* ── Validação ───────────────────────────────────────────────────────── */
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.nome.trim() || form.nome.trim().length < 3)
      e.nome = 'Nome deve ter pelo menos 3 caracteres';
    else if (form.nome.trim().length > 50)
      e.nome = 'Nome deve ter no máximo 50 caracteres';
    if (form.modalidades.length === 0)
      e.modalidades = 'Selecione pelo menos uma modalidade';
    return e;
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // TODO: POST /grupos (API)
    const groupData = {
      nome: form.nome.trim(),
      modalidades: form.modalidades,
      fotoCapa: form.fotoCapa,
    };

    navigate('detalhe-grupo', groupData);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* Header */}
      <header
        className="w-full flex items-center px-4"
        style={{ backgroundColor: '#000F1E', borderBottom: '1px solid #40493D', height: 56 }}
      >
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-[#BFCABA] hover:text-white transition-colors text-[14px] font-medium"
          aria-label="Voltar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </button>
        <h1 className="flex-1 text-center text-white font-semibold text-[16px]" style={{ marginRight: 52 }}>
          Criar Grupo
        </h1>
      </header>

      {/* Formulário */}
      <main className="flex-1 flex flex-col items-center px-6 pt-6 pb-10">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 w-full"
          style={{ maxWidth: 327 }}
          noValidate
        >
          {/* Foto de capa */}
          <div className="flex flex-col gap-[2px]">
            <span className="text-[#6C7278] font-medium text-[12px] leading-[1.6em] tracking-[-0.02em] font-['Plus_Jakarta_Sans']">
              Foto de capa <span className="text-[#40493D]">(opcional)</span>
            </span>

            <button
              type="button"
              onClick={handleCoverClick}
              className="w-full rounded-[12px] overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80"
              style={{
                height: 140,
                backgroundColor: '#000F1E',
                border: '1px dashed #40493D',
                backgroundImage: form.fotoCapa ? `url(${form.fotoCapa})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-label="Adicionar foto de capa"
            >
              {!form.fotoCapa && (
                <div className="flex flex-col items-center gap-2 text-[#40493D]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="text-[12px] font-medium">Adicionar foto de capa</span>
                </div>
              )}
            </button>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Nome do grupo */}
          <InputField
            label="Nome do grupo"
            type="text"
            placeholder="Ex: Racha da Sexta"
            value={form.nome}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, nome: e.target.value }));
              setErrors((prev) => ({ ...prev, nome: undefined }));
            }}
            error={errors.nome}
            maxLength={50}
          />

          {/* Modalidades — multi-seleção */}
          <div className="flex flex-col gap-[2px]">
            <span className="text-[#6C7278] font-medium text-[12px] leading-[1.6em] tracking-[-0.02em] font-['Plus_Jakarta_Sans']">
              Modalidade
            </span>

            <div className="flex gap-3">
              {MODALIDADES.map((mod) => {
                const isActive = form.modalidades.includes(mod.value);
                return (
                  <button
                    key={mod.value}
                    type="button"
                    onClick={() => toggleModalidade(mod.value)}
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

            {errors.modalidades && (
              <span className="text-red-500 text-[12px] font-medium mt-1">{errors.modalidades}</span>
            )}
          </div>

          <div className="flex justify-center mt-2">
            <Button type="submit" style={{ width: 175, borderRadius: 8 }}>
              Criar Grupo →
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
