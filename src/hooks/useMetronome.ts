import { useState, useCallback, useRef, useEffect } from 'react';

export type Phase = 'up' | 'down';

export interface MetronomeState {
  phase: Phase;
  /** 0–1 progress within current phase */
  progress: number;
  /** Total elapsed seconds in current phase */
  elapsed: number;
  /** Current rep number (1-based, increments each up+down cycle) */
  currentRep: number;
  /** Total reps to perform */
  totalReps: number;
  isActive: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

const PHASE_DURATION = 5; // 5 seconds per phase
const TICK_MS = 50; // 50ms ticks for smooth animation
const TOTAL_REPS = 5; // 5 up+down cycles

export function useMetronome(): MetronomeState {
  const [phase, setPhase] = useState<Phase>('up');
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentRep, setCurrentRep] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const phaseStartRef = useRef(Date.now());
  const currentPhaseRef = useRef<Phase>('up');
  const currentRepRef = useRef(1);

  const beep = useCallback((frequency: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not available
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setProgress(0);
    setElapsed(0);
    setPhase('up');
    setCurrentRep(1);
    currentRepRef.current = 1;
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    currentPhaseRef.current = 'up';
    currentRepRef.current = 1;
    phaseStartRef.current = Date.now();
    setPhase('up');
    setProgress(0);
    setElapsed(0);
    setCurrentRep(1);
    setIsActive(true);
    beep(880); // High beep for UP start
  }, [clearTimer, beep]);

  const toggle = useCallback(() => {
    if (isActive) stop();
    else start();
  }, [isActive, start, stop]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const dt = (now - phaseStartRef.current) / 1000;
      const p = Math.min(dt / PHASE_DURATION, 1);

      setProgress(p);
      setElapsed(Math.min(dt, PHASE_DURATION));

      if (dt >= PHASE_DURATION) {
        const wasPhase = currentPhaseRef.current;
        const next: Phase = wasPhase === 'up' ? 'down' : 'up';

        // A full rep completes at the end of a "down" phase
        if (wasPhase === 'down') {
          const finishedRep = currentRepRef.current;
          if (finishedRep >= TOTAL_REPS) {
            // All reps done — auto-stop
            stop();
            return;
          }
          // Move to next rep
          currentRepRef.current = finishedRep + 1;
          setCurrentRep(finishedRep + 1);
        }

        currentPhaseRef.current = next;
        phaseStartRef.current = now;
        setPhase(next);
        setProgress(0);
        setElapsed(0);
        beep(next === 'up' ? 880 : 440);
      }
    }, TICK_MS);

    return clearTimer;
  }, [isActive, clearTimer, beep, stop]);

  return {
    phase,
    progress,
    elapsed,
    currentRep,
    totalReps: TOTAL_REPS,
    isActive,
    start,
    stop,
    toggle,
  };
}
