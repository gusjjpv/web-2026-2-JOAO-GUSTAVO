import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Dropdown component reutilizável.
 * Exibe um select customizado com label, lista de opções e seta →.
 * Baseado no componente "dropdown" do Figma (node 21:643).
 */
export function Dropdown({
  label,
  options,
  value,
  onChange,
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative w-[281px] ${className}`}>
      {/* Label + trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between bg-[#D9D9D9] rounded-[12px] px-[18px] py-[16px] text-left"
      >
        <span className="text-[#000000] text-[14px] font-normal leading-[1.4em]">
          {selected ? selected.label : (
            <span className="text-[#000000] opacity-60">{label}</span>
          )}
        </span>
        <span className="text-[#000000] font-bold text-[24px] leading-[1.2em] tracking-[-0.02em]">
          →
        </span>
      </button>

      {/* Options panel */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-[#D9D9D9] rounded-[0px_0px_24px_24px] z-50 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className="w-full text-left px-[18px] py-[16px] text-[#000000] text-[14px] font-normal leading-[1.4em] hover:bg-black/10 transition-colors first:pt-4"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
