import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { AuthServiceError, loginWithGoogle, register } from '../../services/auth';
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
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setServerError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setServerError(
        err instanceof AuthServiceError
          ? err.message
          : 'Não foi possível iniciar o login com o Google.',
      );
      setGoogleLoading(false);
    }
  };

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

        <div className="flex justify-center mt-2">
          <Button
            type="submit"
            disabled={loading || googleLoading}
            style={{ width: 143, borderRadius: 8 }}
          >
            {loading ? 'Criando...' : 'Continuar →'}
          </Button>
        </div>

        {/* Divisor */}
        <div className="flex items-center my-4 gap-3">
          <div className="flex-1 h-px bg-[#40493D]" />
          <span className="text-[#9FB7D6] text-[12px] font-medium">ou</span>
          <div className="flex-1 h-px bg-[#40493D]" />
        </div>

        {/* Botão Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 py-[12px] px-4 rounded-[10px] bg-white text-[#1A1C1E] font-medium text-[14px] hover:bg-gray-100 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
        >
          <GoogleIcon />
          {googleLoading ? 'Conectando...' : 'Cadastrar com o Google'}
        </button>
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
