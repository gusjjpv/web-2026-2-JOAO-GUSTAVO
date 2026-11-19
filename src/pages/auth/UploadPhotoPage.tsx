import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import {
  ALLOWED_IMAGE_TYPES,
  ProfileServiceError,
  saveUserProfile,
  validateProfileImage,
} from '../../services/profile';
import type { Route } from '../../App';

interface UploadPhotoPageProps {
  navigate: (route: Route) => void;
}

/**
 * Página de Upload de Foto — RachaoApp
 * Figma node: 44-256
 *
 * Avatar circular clicável, título "Envie sua foto" e botão "Continuar →" → envia ao S3 (PUT /profile) e navega para home
 */
export function UploadPhotoPage({ navigate }: UploadPhotoPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleAvatarClick = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateProfileImage(file);
    if (validationError) {
      setError(validationError);
      e.target.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      navigate('home');
      return;
    }

    setUploading(true);
    try {
      await saveUserProfile({}, selectedFile);
      navigate('home');
    } catch (err) {
      setError(
        err instanceof ProfileServiceError
          ? err.message
          : 'Não foi possível enviar a foto. Tente novamente.',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start px-6"
      style={{ backgroundColor: '#102A43' }}
    >
      <div
        className="w-full flex flex-col items-center justify-center"
        style={{ paddingTop: 260 }}
      >
        {/* Avatar circular clicável */}
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={uploading}
          className="flex items-center justify-center rounded-full overflow-hidden hover:opacity-80 transition-opacity disabled:opacity-60"
          style={{ width: 175, height: 168, backgroundColor: '#D9D9D9' }}
          aria-label="Clique para selecionar foto"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Prévia da foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
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
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={handleFileChange}
        />

        <p
          className="mt-4 text-white text-center"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            lineHeight: '40px',
            letterSpacing: '-0.06em',
          }}
        >
          Envie sua foto
        </p>

        <span className="text-[#9FB7D6] text-[12px] text-center">
          JPG, PNG ou WebP até 2 MB
        </span>

        {error && (
          <p className="mt-3 text-red-400 text-[13px] font-medium text-center max-w-[280px]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-3">
          <Button type="submit" disabled={uploading} style={{ width: 160, borderRadius: 8 }}>
            {uploading ? 'Enviando...' : 'Continuar →'}
          </Button>

          {selectedFile && !uploading && (
            <button
              type="button"
              onClick={() => navigate('home')}
              className="text-[#9FB7D6] text-[12px] hover:underline"
            >
              Pular por enquanto
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
