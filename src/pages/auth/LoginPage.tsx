import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import logoImg from '../../assets/Logo.svg';

/**
 * Página de Login — RachaoApp
 * Fiel ao design do Figma: node-id 18-198
 *
 * Estrutura:
 *  - Fundo escuro (#102A43)
 *  - Logo centralizado (imagem + "RachaoApp")
 *  - Campo de Email
 *  - Campo de Senha (com toggle)
 *  - Botão "Entrar"
 *  - Link "Não tem uma conta? Criar"
 */
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: integrar com o serviço de autenticação
    console.log('Login:', { email, password });
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
        {/* Imagem do mascote */}
        <img
          src={logoImg}
          alt="RachaoApp mascote"
          className="w-[200px] h-[200px] object-cover rounded-full"
        />

        {/* Nome do app */}
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
        className="flex flex-col w-full"
        style={{ maxWidth: 327 }}
        noValidate
      >
        {/* Campo Email */}
        <InputField
          label="Email"
          type="email"
          placeholder="seuemail@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        {/* Campo Senha */}
        <InputField
          label="Senha"
          type="password"
          placeholder="**********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-[47px]"
        />

        {/* Botão Entrar */}
        <Button
          type="submit"
          className="mt-[67px] mx-auto"
          style={{ width: 173 }}
        >
          Entrar
        </Button>
      </form>

      {/* Rodapé — link de cadastro */}
      <p
        className="mt-[132px] text-white text-[14px] font-semibold leading-5 text-center"
        style={{ width: 231 }}
      >
        Não tem uma conta?{' '}
        <a
          href="/register"
          className="underline text-[#0978F5] hover:opacity-80 transition-opacity"
        >
          Criar
        </a>
      </p>
    </div>
  );
}
