interface RadioGroupProps {
  label?: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

/**
 * RadioGroup component reutilizável.
 * Exibe um conjunto de botões de seleção exclusiva.
 * Opção ativa: bg #C6FF00, texto #102A43.
 * Opção inativa: bg branco, borda #EDF1F3.
 */
export function RadioGroup({
  label,
  options,
  value,
  onChange,
  error,
  className = '',
}: RadioGroupProps) {
  return (
    <div className={`flex flex-col gap-[2px] ${className}`}>
      {label && (
        <span className="text-[#6C7278] font-medium text-[12px] leading-[1.6em] tracking-[-0.02em] font-['Plus_Jakarta_Sans']">
          {label}
        </span>
      )}

      <div className="flex gap-3">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 py-[13.5px] px-4 rounded-[10px] border text-[14px] font-medium leading-[1.4em] transition-colors
                ${
                  isActive
                    ? 'bg-[#C6FF00] text-[#102A43] border-[#C6FF00]'
                    : 'bg-white text-[#1A1C1E] border-[#EDF1F3] hover:border-[#C6FF00]'
                }`}
              style={isActive ? {} : { boxShadow: '0px 1px 2px 0px rgba(228, 229, 231, 0.24)' }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {error && (
        <span className="text-red-500 text-[12px] font-medium mt-1">{error}</span>
      )}
    </div>
  );
}
