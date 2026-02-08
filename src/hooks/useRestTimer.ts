import { useState, useCallback, useRef, useEffect } from 'react';

export type Intensity = 'light' | 'moderate' | 'heavy';

const DURATIONS: Record<Intensity, number> = {
  light: 60,
  moderate: 120,
  heavy: 240,
};

export interface RestTimerState {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  intensity: Intensity;
  start: (intensity?: Intensity) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  adjustTime: (delta: number) => void;
}

/**
 * Auto-classifies intensity based on weight relative to history.
 * light:    weight ≤ 60% of max
 * moderate: 60–85% of max
 * heavy:    >85% of max
 */
export function classifyIntensity(
  weight: number,
  maxWeight: number,
): Intensity {
  if (maxWeight === 0) return 'moderate';
  const ratio = weight / maxWeight;
  if (ratio <= 0.6) return 'light';
  if (ratio <= 0.85) return 'moderate';
  return 'heavy';
}

export function useRestTimer(): RestTimerState {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (int: Intensity = 'moderate') => {
      clearTimer();
      const dur = DURATIONS[int];
      setIntensity(int);
      setTotalSeconds(dur);
      setSecondsLeft(dur);
      setIsRunning(true);
    },
    [clearTimer],
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setSecondsLeft(0);
    setTotalSeconds(0);
    setIsRunning(false);
  }, [clearTimer]);

  const adjustTime = useCallback((delta: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + delta));
    setTotalSeconds((prev) => Math.max(0, prev + delta));
  }, []);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) {
      if (isRunning && secondsLeft <= 0) {
        setIsRunning(false);
        // Vibrate on finish if available
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, secondsLeft <= 0, clearTimer]);

  return {
    secondsLeft,
    totalSeconds,
    isRunning,
    intensity,
    start,
    pause,
    resume,
    reset,
    adjustTime,
  };
}
