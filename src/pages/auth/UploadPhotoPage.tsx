import { useRef, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';

/**
 * Página de Upload de Foto — RachaoApp
 * Figma node: 44-256
 *
 * Exibe um avatar circular (placeholder cinza), título "Envie sua foto"
 * e botão "Continuar →".
 */
export function UploadPhotoPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: fazer upload da imagem
    console.log('Arquivo selecionado:', file.name);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: avançar para próxima etapa
    console.log('Foto enviada');
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* Área do avatar — ocupa parte superior */}
      <div
        className="w-full flex flex-col items-center justify-center"
        style={{ paddingTop: 344 }}
      >
        {/* Avatar circular clicável */}
        <button
          type="button"
          onClick={handleAvatarClick}
          className="flex items-center justify-center rounded-full overflow-hidden hover:opacity-80 transition-opacity"
          style={{
            width: 175,
            height: 168,
            backgroundColor: '#D9D9D9',
          }}
          aria-label="Clique para selecionar foto"
        >
          {/* Ícone de câmera */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6C7278"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        {/* Input file oculto */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Título */}
        <p
          className="mt-4 text-white text-center"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            lineHeight: '56px',
            letterSpacing: '-0.06em',
          }}
        >
          Envie sua foto
        </p>

        {/* Botão */}
        <form onSubmit={handleSubmit} className="mt-6">
          <Button
            type="submit"
            style={{ width: 143, borderRadius: 8 }}
          >
            Continuar →
          </Button>
        </form>
      </div>
    </div>
  );
}
