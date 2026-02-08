import { Minus, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
}

export function NumberStepper({
  value,
  onChange,
  step = 5,
  min = 0,
  max = 9999,
  label,
  unit,
}: Props) {
  const [bouncing, setBouncing] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setBouncing(true);
      prevValue.current = value;
      const t = setTimeout(() => setBouncing(false), 250);
      return () => clearTimeout(t);
    }
  }, [value]);

  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs font-medium text-atlas-text-muted uppercase tracking-wide">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          className="ripple flex items-center justify-center w-11 h-11 rounded-xl bg-atlas-surface-alt text-atlas-text
                     active:bg-atlas-border active:scale-90 transition-all duration-150"
          aria-label={`Decrease ${label ?? 'value'}`}
        >
          <Minus size={20} />
        </button>

        <input
          type="number"
          value={value}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
          }}
          className={`w-20 h-11 text-center text-xl font-bold bg-atlas-bg border border-atlas-border rounded-xl text-atlas-text
                      focus:outline-none focus:ring-2 focus:ring-atlas-accent focus:border-atlas-accent
                      transition-all duration-200
                      ${bouncing ? 'animate-value-bounce' : ''}`}
        />

        <button
          type="button"
          onClick={inc}
          className="ripple flex items-center justify-center w-11 h-11 rounded-xl bg-atlas-surface-alt text-atlas-text
                     active:bg-atlas-border active:scale-90 transition-all duration-150"
          aria-label={`Increase ${label ?? 'value'}`}
        >
          <Plus size={20} />
        </button>
      </div>
      {unit && (
        <span className="text-xs text-atlas-text-muted">{unit}</span>
      )}
    </div>
  );
}
