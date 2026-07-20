import { useCallback, useRef } from 'react';
import { getSharedAudioContext, soundManager } from '../effects/soundManager';

export type UiSound = 'verify' | 'power' | 'rotate' | 'transmit' | 'success';

/**
 * צלילי ממשק קצרים באמצעות Web Audio API — ללא קובצי קול חיצוניים.
 * משתמש ב-AudioContext המשותף של soundManager (יחיד לכל המשחק);
 * ההשתקה נבדקת בכל השמעה.
 */
export function useUiSounds(muted: boolean) {
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const play = useCallback((sound: UiSound) => {
    if (mutedRef.current) return;
    try {
      // ההשמעה מגיעה תמיד מפעולת משתמש — מסמנים זאת ל-soundManager
      soundManager.userGesture();
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const tone = (
        freqFrom: number,
        freqTo: number,
        start: number,
        duration: number,
        type: OscillatorType = 'sine',
        peak = 0.12,
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freqFrom, now + start);
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, freqTo),
          now + start + duration,
        );
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(peak, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + duration + 0.05);
      };

      switch (sound) {
        case 'verify': // מתג מערכת: בליפ כפול עולה
          tone(660, 660, 0, 0.07, 'square', 0.08);
          tone(990, 990, 0.09, 0.09, 'square', 0.08);
          break;
        case 'power': // טעינת כוח: סינוס עולה
          tone(160, 640, 0, 0.5, 'sine', 0.14);
          break;
        case 'rotate': // סיבוב מנגנון: זמזום נמוך גולש
          tone(120, 90, 0, 0.45, 'sawtooth', 0.07);
          tone(240, 180, 0.05, 0.4, 'triangle', 0.05);
          break;
        case 'transmit': // שידור: פינג גבוה יורד
          tone(1400, 900, 0, 0.18, 'sine', 0.1);
          tone(1400, 900, 0.22, 0.18, 'sine', 0.07);
          break;
        case 'success': // הצלחת משימה: ארפג׳ו עולה
          tone(523, 523, 0, 0.16, 'triangle', 0.12);
          tone(659, 659, 0.16, 0.16, 'triangle', 0.12);
          tone(784, 784, 0.32, 0.16, 'triangle', 0.12);
          tone(1047, 1047, 0.48, 0.4, 'triangle', 0.14);
          break;
      }
    } catch {
      // סביבה ללא Web Audio — ממשיכים בשקט
    }
  }, []);

  return play;
}
