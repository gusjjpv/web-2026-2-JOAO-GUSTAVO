import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { AuthServiceError, login } from '../../services/auth';
import logoImg from '../../assets/Logo.svg';
import type { Route } from '../../App';

interface LoginPageProps {
  navigate: (route: Route, state?: unknown) => void;
  /** Mensagem de sucesso exibida acima do formulário (ex: e-mail confirmado). */
  notice?: string;
}

/**
 * Página de Login — RachaoApp
 * Figma node: 18-198
 *
 * Autenticação via Amazon Cognito (RF-01): login por username + senha.
 */
export function LoginPage({ navigate, notice }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Informe seu usuário e sua senha.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);

      if (result === 'CONFIRM_SIGN_UP') {
        // Conta criada mas e-mail ainda não confirmado.
        navigate('confirm-code', { username: username.trim(), resendOnOpen: true });
        return;
      }
      navigate('home');
    } catch (err) {
      setError(err instanceof AuthServiceError ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* Logo */}
      <div
        className="flex flex-col items-center"
        style={{ width: 293, marginBottom: 88 }}
      >
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

      {notice && (
        <p className="text-[#88D982] text-[13px] font-medium text-center mb-6" role="status">
          {notice}
        </p>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full"
        style={{ maxWidth: 327 }}
        noValidate
      >
        <InputField
          label="Usuário"
          type="text"
          placeholder="seu_usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />

        <InputField
          label="Senha"
          type="password"
          placeholder="**********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-[47px]"
        />

        {error && (
          <span className="text-red-400 text-[12px] font-medium mt-4 text-center" role="alert">
            {error}
          </span>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="mt-[67px] mx-auto"
          style={{ width: 173 }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      {/* Rodapé — link de cadastro */}
      <p
        className="mt-[132px] text-white text-[14px] font-semibold leading-5 text-center"
        style={{ width: 231 }}
      >
        Não tem uma conta?{' '}
        <button
          type="button"
          onClick={() => navigate('register')}
          className="underline text-[#0978F5] hover:opacity-80 transition-opacity"
        >
          Criar
        </button>
      </p>
    </div>
  );
}
