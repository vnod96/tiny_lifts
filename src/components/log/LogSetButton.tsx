interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function LogSetButton({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-14 rounded-2xl bg-atlas-accent text-white font-bold text-lg
                 active:bg-atlas-accent-hover transition-colors
                 disabled:opacity-40 disabled:cursor-not-allowed
                 min-h-[44px] shadow-lg shadow-atlas-accent/20"
    >
      Log Set
    </button>
  );
}
