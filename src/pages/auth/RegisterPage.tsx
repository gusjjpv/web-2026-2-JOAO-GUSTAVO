import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { AuthServiceError, register } from '../../services/auth';
import { normalizePhoneBR } from '../../lib/phone';
import logoImg from '../../assets/Logo.svg';
import type { Route } from '../../App';

interface RegisterPageProps {
  navigate: (route: Route, state?: unknown) => void;
}

type Field = 'nome' | 'username' | 'email' | 'telefone' | 'senha';
type FormErrors = Partial<Record<Field, string>>;

const USERNAME_REGEX = /^[A-Za-z0-9_.-]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Página de Cadastro (Cria conta) — RachaoApp
 * Figma node: 20-445
 *
 * Campos: Nome, Usuário, Email, Telefone (opcional), Senha
 * O usuário é criado no Amazon Cognito (RF-01). O e-mail recebe um código
 * de verificação, confirmado na tela seguinte (confirm-code).
 */
export function RegisterPage({ navigate }: RegisterPageProps) {
  const [form, setForm] = useState<Record<Field, string>>({
    nome: '',
    username: '',
    email: '',
    telefone: '',
    senha: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (form.nome.trim().length < 2) e.nome = 'Informe seu nome';
    if (!USERNAME_REGEX.test(form.username.trim())) {
      e.username = 'Use de 3 a 30 caracteres: letras, números, ponto, hífen ou underline';
    }
    if (!EMAIL_REGEX.test(form.email.trim())) e.email = 'E-mail inválido';
    if (form.telefone.trim() && !normalizePhoneBR(form.telefone)) {
      e.telefone = 'Telefone inválido. Use DDD + número';
    }
    if (form.senha.length < 8) e.senha = 'A senha deve ter pelo menos 8 caracteres';
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        username: form.username,
        password: form.senha,
        email: form.email,
        nome: form.nome,
        telefone: form.telefone,
      });

      if (result.nextStep === 'CONFIRM_SIGN_UP') {
        navigate('confirm-code', {
          username: form.username.trim(),
          destination: result.destination ?? form.email.trim(),
        });
      } else {
        navigate('login', { notice: 'Conta criada! Faça login para continuar.' });
      }
    } catch (err) {
      setServerError(
        err instanceof AuthServiceError ? err.message : 'Não foi possível criar a conta. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start px-6 pb-10"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center" style={{ marginTop: 80, marginBottom: 60 }}>
        <img
          src={logoImg}
          alt="RachaoApp mascote"
          className="w-[211px] h-[211px] object-contain"
        />
        <span
          style={{
            fontFamily: "'Unbounded', sans-serif",
            fontWeight: 800,
            fontSize: 40,
            lineHeight: '56px',
            letterSpacing: '-0.03em',
            color: '#009951',
          }}
        >
          RachaoApp
        </span>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[18px] w-full"
        style={{ maxWidth: 327 }}
        noValidate
      >
        <InputField
          label="Nome"
          type="text"
          placeholder="Nome"
          value={form.nome}
          onChange={handleChange('nome')}
          error={errors.nome}
          autoComplete="name"
        />

        <InputField
          label="Usuário"
          type="text"
          placeholder="seu_usuario"
          value={form.username}
          onChange={handleChange('username')}
          error={errors.username}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={30}
        />

        <InputField
          label="Email"
          type="email"
          placeholder="seuemail@gmail.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <InputField
          label="Telefone (opcional)"
          type="tel"
          placeholder="(DDD)99999-9999"
          value={form.telefone}
          onChange={handleChange('telefone')}
          error={errors.telefone}
          autoComplete="tel"
        />

        <InputField
          label="Senha"
          type="password"
          placeholder="*******"
          value={form.senha}
          onChange={handleChange('senha')}
          error={errors.senha}
          autoComplete="new-password"
        />

        {serverError && (
          <span className="text-red-400 text-[12px] font-medium text-center" role="alert">
            {serverError}
          </span>
        )}

        <div className="flex justify-center mt-4">
          <Button type="submit" disabled={loading} style={{ width: 143, borderRadius: 8 }}>
            {loading ? 'Criando...' : 'Continuar →'}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-white text-[14px] font-semibold text-center">
        Já tem uma conta?{' '}
        <button
          type="button"
          onClick={() => navigate('login')}
          className="underline text-[#0978F5] hover:opacity-80 transition-opacity"
        >
          Entrar
        </button>
      </p>
    </div>
  );
}
