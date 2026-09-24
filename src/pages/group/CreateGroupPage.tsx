import { useState, type FormEvent } from 'react';
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
}

type FormErrors = Partial<Record<keyof GroupForm, string>>;

const MODALIDADES = [
  { label: 'Futsal', value: 'futsal' },
  { label: 'Society', value: 'society' },
];

/**
 * Tela de Criação de Grupo — RachaoApp
 * Sem Figma — baseada no design system existente.
 *
 * Campos (RF-04):
 *  - Nome do grupo (obrigatório, 3–50 chars)
 *  - Modalidade (Futsal / Society)
 *  - Limite padrão de vagas (≥ 2)
 *
 * Após submit navega para GroupDetailPage com os dados do grupo.
 */
export function CreateGroupPage({ navigate }: CreateGroupPageProps) {
  const [form, setForm] = useState<GroupForm>({
    nome: '',
    modalidade: 'futsal',
    limiteVagas: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange =
    (field: keyof GroupForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): FormErrors => {
    const e: FormErrors = {};

    if (!form.nome.trim() || form.nome.trim().length < 3)
      e.nome = 'Nome deve ter pelo menos 3 caracteres';
    else if (form.nome.trim().length > 50)
      e.nome = 'Nome deve ter no máximo 50 caracteres';

    if (!form.modalidade) e.modalidade = 'Selecione uma modalidade';

    const vagas = Number(form.limiteVagas);
    if (!form.limiteVagas || isNaN(vagas) || vagas < 2)
      e.limiteVagas = 'O limite mínimo é de 2 vagas';

    return e;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // TODO: POST /grupos (API)
    const groupData = {
      nome: form.nome.trim(),
      modalidade: form.modalidade,
      limiteVagas: Number(form.limiteVagas),
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

        <h1
          className="flex-1 text-center text-white font-semibold text-[16px]"
          style={{ marginRight: 52 }} // compensar largura do botão voltar
        >
          Criar Grupo
        </h1>
      </header>

      {/* Formulário */}
      <main className="flex-1 flex flex-col items-center px-6 pt-8 pb-10">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 w-full"
          style={{ maxWidth: 327 }}
          noValidate
        >
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

          {/* Botão */}
          <div className="flex justify-center mt-4">
            <Button type="submit" style={{ width: 175, borderRadius: 8 }}>
              Criar Grupo →
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
