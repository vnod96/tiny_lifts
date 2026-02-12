import { X, Pause, Play, RotateCcw, Plus, Minus } from 'lucide-react';
import type { RestTimerState } from '../../hooks/useRestTimer';

interface Props {
  timer: RestTimerState;
  onDismiss: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function RestTimerModal({ timer, onDismiss }: Props) {
  const visible = timer.secondsLeft > 0 || timer.isRunning;

  const pct =
    timer.totalSeconds > 0
      ? ((timer.totalSeconds - timer.secondsLeft) / timer.totalSeconds) * 100
      : 0;

  const intensityColors = {
    light: 'text-atlas-success',
    moderate: 'text-atlas-accent',
    heavy: 'text-atlas-danger',
  };

  const intensityBg = {
    light: 'bg-atlas-success',
    moderate: 'bg-atlas-accent',
    heavy: 'bg-atlas-danger',
  };

  return (
    <>
      {/* Backdrop — above content but below tab bar */}
      <div
        className={`fixed inset-0 bottom-16 z-40 bg-black/50 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onDismiss}
      />

      {/* Bottom sheet — sits above the 64px tab bar */}
      <div
        className={`fixed inset-x-0 bottom-16 z-45 transition-transform duration-300 ease-out pb-safe ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%+4rem)] opacity-0'
        }`}
      >
        <div className="max-w-lg mx-auto bg-atlas-surface rounded-3xl shadow-2xl">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-atlas-border" />
          </div>

          <div className="px-6 pb-6 pt-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-atlas-text">
                  Rest Timer
                </span>
                <span
                  className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${intensityColors[timer.intensity]} ${intensityBg[timer.intensity]}/15`}
                >
                  {timer.intensity}
                </span>
              </div>
              <button
                onClick={onDismiss}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-atlas-surface-alt text-atlas-text-muted hover:text-atlas-text active:bg-atlas-border transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Circular progress + time */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-40 h-40">
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-atlas-surface-alt"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
                    className={`${intensityColors[timer.intensity]} transition-all duration-1000`}
                  />
                </svg>
                {/* Time in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-atlas-text tabular-nums">
                    {formatTime(timer.secondsLeft)}
                  </span>
                  <span className="text-xs text-atlas-text-muted mt-1">remaining</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => timer.adjustTime(-15)}
                className="ripple w-12 h-12 flex items-center justify-center rounded-2xl bg-atlas-surface-alt text-atlas-text-muted active:bg-atlas-border active:scale-90 transition-all duration-150"
                aria-label="Subtract 15 seconds"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={timer.isRunning ? timer.pause : timer.resume}
                className="ripple w-16 h-16 flex items-center justify-center rounded-full bg-atlas-accent text-white active:bg-atlas-accent-hover active:scale-95 transition-all duration-200 shadow-lg shadow-atlas-accent/25"
                aria-label={timer.isRunning ? 'Pause' : 'Resume'}
              >
                {timer.isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
              </button>
              <button
                onClick={() => timer.adjustTime(15)}
                className="ripple w-12 h-12 flex items-center justify-center rounded-2xl bg-atlas-surface-alt text-atlas-text-muted active:bg-atlas-border active:scale-90 transition-all duration-150"
                aria-label="Add 15 seconds"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={timer.reset}
                className="ripple w-12 h-12 flex items-center justify-center rounded-2xl bg-atlas-surface-alt text-atlas-text-muted active:bg-atlas-border active:scale-90 transition-all duration-150"
                aria-label="Reset timer"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
