import { useState, useRef, type FormEvent } from 'react';
import { InputField } from '../../components/ui/InputField';
import { RadioGroup } from '../../components/ui/RadioGroup';
import { Button } from '../../components/ui/Button';
import type { Route } from '../../App';

interface CreateGroupPageProps {
  navigate: (route: Route, state?: unknown) => void;
}

interface GroupForm {
  nome: string;
  modalidade: 'futsal' | 'society';
  limiteVagas: string;
  fotoCapa: string | null; // base64 preview
}

type FormErrors = Partial<Record<'nome' | 'modalidade' | 'limiteVagas', string>>;

const MODALIDADES = [
  { label: 'Futsal', value: 'futsal' },
  { label: 'Society', value: 'society' },
];

/**
 * Página de Criação de Grupo — RachaoApp
 *
 * Campos:
 *  - Foto de capa (opcional)
 *  - Nome do grupo (obrigatório, 3–50 chars)
 *  - Modalidade (Futsal / Society)
 *  - Limite padrão de vagas (≥ 2)
 */
export function CreateGroupPage({ navigate }: CreateGroupPageProps) {
  const [form, setForm] = useState<GroupForm>({
    nome: '',
    modalidade: 'futsal',
    limiteVagas: '',
    fotoCapa: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, fotoCapa: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange =
    (field: 'nome' | 'limiteVagas') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.nome.trim() || form.nome.trim().length < 3)
      e.nome = 'Nome deve ter pelo menos 3 caracteres';
    else if (form.nome.trim().length > 50)
      e.nome = 'Nome deve ter no máximo 50 caracteres';
    const vagas = Number(form.limiteVagas);
    if (!form.limiteVagas || isNaN(vagas) || vagas < 2)
      e.limiteVagas = 'O limite mínimo é de 2 vagas';
    return e;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // TODO: POST /grupos (API)
    const groupData = {
      nome: form.nome.trim(),
      modalidade: form.modalidade,
      limiteVagas: Number(form.limiteVagas),
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
        style={{
          backgroundColor: '#000F1E',
          borderBottom: '1px solid #40493D',
          height: 56,
        }}
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Nome do grupo */}
          <InputField
            label="Nome do grupo"
            type="text"
            placeholder="Ex: Racha da Sexta"
            value={form.nome}
            onChange={handleChange('nome')}
            error={errors.nome}
            maxLength={50}
          />

          {/* Modalidade */}
          <RadioGroup
            label="Modalidade"
            options={MODALIDADES}
            value={form.modalidade}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, modalidade: val as GroupForm['modalidade'] }))
            }
            error={errors.modalidade}
          />

          {/* Limite de vagas */}
          <InputField
            label="Limite padrão de vagas"
            type="number"
            placeholder="Ex: 20"
            value={form.limiteVagas}
            onChange={handleChange('limiteVagas')}
            error={errors.limiteVagas}
          />

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
