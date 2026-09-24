import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import logoImg from '../../assets/logo.png';

/**
 * Página de Cadastro (Cria conta) — RachaoApp
 * Figma node: 20-445
 *
 * Campos: Nome, Email, Telefone, Senha
 * Botão: "Continuar →"
 */
export function RegisterPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
  });

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: integrar com serviço de cadastro
    console.log('Cadastro:', form);
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
          className="w-[211px] h-[211px] object-cover rounded-full"
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
          autoComplete="name"
        />

        <InputField
          label="Email"
          type="email"
          placeholder="seuemail@gmail.com"
          value={form.email}
          onChange={handleChange('email')}
          autoComplete="email"
        />

        <InputField
          label="Telefone"
          type="tel"
          placeholder="(DDD)99999-9999"
          value={form.telefone}
          onChange={handleChange('telefone')}
          autoComplete="tel"
        />

        <InputField
          label="Senha"
          type="password"
          placeholder="*******"
          value={form.senha}
          onChange={handleChange('senha')}
          autoComplete="new-password"
        />

        {/* Botão Continuar */}
        <div className="flex justify-center mt-4">
          <Button
            type="submit"
            style={{ width: 143, borderRadius: 8 }}
          >
            Continuar →
          </Button>
        </div>
      </form>
    </div>
  );
}
