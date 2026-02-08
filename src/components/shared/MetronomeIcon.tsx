interface Props {
  size?: number;
  className?: string;
}

/** A triangular metronome with a swinging pendulum arm. */
export function MetronomeIcon({ size = 24, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Metronome body — trapezoid / triangle shape */}
      <path d="M6 22 L10 4 L14 4 L18 22 Z" />
      {/* Pendulum arm tilted */}
      <line x1="12" y1="18" x2="8" y2="6" />
      {/* Pendulum weight */}
      <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
      {/* Base line */}
      <line x1="5" y1="22" x2="19" y2="22" />
    </svg>
  );
}
