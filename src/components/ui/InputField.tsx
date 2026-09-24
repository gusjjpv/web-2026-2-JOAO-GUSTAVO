import { useState, type InputHTMLAttributes } from 'react';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: string;
}

/**
 * InputField component reutilizável.
 * Suporta label, ícones à esquerda/direita, estado de erro e toggle de senha.
 */
export function InputField({
  label,
  type = 'text',
  iconLeft,
  iconRight,
  error,
  className = '',
  id,
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-[2px] ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[#6C7278] font-medium text-[12px] leading-[1.6em] tracking-[-0.02em] font-['Plus_Jakarta_Sans']"
        >
          {label}
        </label>
      )}

      <div
        className="flex flex-row items-center gap-[10px] px-[14px] py-[13.5px] bg-white border border-[#EDF1F3] rounded-[10px]"
        style={{ boxShadow: '0px 1px 2px 0px rgba(228, 229, 231, 0.24)' }}
      >
        {iconLeft && (
          <span className="flex-shrink-0 text-[#6C7278]">{iconLeft}</span>
        )}

        <input
          id={inputId}
          type={inputType}
          className="flex-1 text-[#1A1C1E] font-medium text-[14px] leading-[1.4em] tracking-[-0.01em] outline-none border-none bg-transparent placeholder:text-[#6C7278] w-full"
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="flex-shrink-0 text-[#6C7278] hover:text-[#1A1C1E] transition-colors"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        ) : (
          iconRight && (
            <span className="flex-shrink-0 text-[#6C7278]">{iconRight}</span>
          )
        )}
      </div>

      {error && (
        <span className="text-red-500 text-[12px] font-medium mt-1">{error}</span>
      )}
    </div>
  );
}

/* ─── Inline SVG icons ─────────────────────────────────────────────────────── */

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
