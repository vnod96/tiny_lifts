import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { VolumeInfo } from '../../hooks/useSessionVolume';

interface Props {
  volume: VolumeInfo;
}

export function VolumeComparison({ volume }: Props) {
  const { currentVolume, previousVolume, volumeDelta, percentChange } = volume;

  let icon = <Minus size={14} />;
  let color = 'text-atlas-text-muted';
  let bgColor = 'bg-atlas-surface-alt';

  if (volumeDelta > 0) {
    icon = <TrendingUp size={14} />;
    color = 'text-atlas-success';
    bgColor = 'bg-atlas-success/10';
  } else if (volumeDelta < 0) {
    icon = <TrendingDown size={14} />;
    color = 'text-atlas-danger';
    bgColor = 'bg-atlas-danger/10';
  }

  return (
    <div className={`animate-fade-slide-up rounded-xl ${bgColor} px-4 py-3 flex items-center justify-between transition-all duration-300`}>
      <div>
        <span className="text-xs text-atlas-text-muted uppercase tracking-wide font-medium">
          Volume
        </span>
        <div className="text-xl font-bold text-atlas-text tabular-nums">
          {currentVolume.toLocaleString()}
          <span className="text-sm text-atlas-text-muted ml-1">kg</span>
        </div>
      </div>

      {previousVolume > 0 && (
        <div className={`flex items-center gap-1 ${color}`}>
          {icon}
          <span className="text-sm font-semibold">
            {volumeDelta > 0 ? '+' : ''}
            {percentChange}%
          </span>
          <span className="text-xs text-atlas-text-muted">vs last</span>
        </div>
      )}
    </div>
  );
}
