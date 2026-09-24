import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
}

/**
 * Button component reutilizável.
 * variant="primary" → botão amarelo/verde-limão com texto escuro (padrão do design)
 * variant="outline" → botão com borda
 */
export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-[4px] px-6 py-2 text-sm font-semibold leading-5 text-center cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#C6FF00] text-[#102A43]',
    outline: 'border border-[#C6FF00] text-[#C6FF00] bg-transparent',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
