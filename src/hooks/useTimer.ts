import { useEffect, useState } from 'react';
import { MISSION_DURATION_SECONDS } from '../data/stations';

export interface TimerInfo {
  /** שניות שנותרו (0 כשהזמן נגמר) */
  remainingSeconds: number;
  /** תצוגה בפורמט MM:SS */
  display: string;
  /** האם הזמן אזל */
  isTimeUp: boolean;
  /** האם נותרו פחות מ-5 דקות */
  isCritical: boolean;
}

/** טיימר ספירה לאחור של 60 דקות, מבוסס על חותמת זמן ההתחלה */
export function useTimer(startedAt: number | null): TimerInfo {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const elapsed = startedAt === null ? 0 : Math.floor((now - startedAt) / 1000);
  const remainingSeconds = Math.max(0, MISSION_DURATION_SECONDS - elapsed);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    remainingSeconds,
    display,
    isTimeUp: startedAt !== null && remainingSeconds === 0,
    isCritical: startedAt !== null && remainingSeconds > 0 && remainingSeconds <= 5 * 60,
  };
}
