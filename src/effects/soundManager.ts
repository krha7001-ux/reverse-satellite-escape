/**
 * מנהל קול מרכזי — AudioContext יחיד לכל המשחק, Web Audio API בלבד.
 * הקול מתחיל רק אחרי פעולת משתמש ראשונה, מציית להשתקה,
 * וזמזום הרקע נעצר כאשר הכרטיסייה אינה גלויה.
 */

export type RoomSound =
  | 'click'        // לחיצת ממשק
  | 'stationOpen'  // תחנה שנפתחה
  | 'unlock'       // מנעול שהשתחרר
  | 'correct'      // תשובה נכונה
  | 'newStation'   // תחנה חדשה שנפתחה
  | 'lockedClick'  // קליק נעילה עדין (תחנה נעולה)
  | 'drawer'       // מגירה מחליקה
  | 'glassDoor'    // דלת זכוכית
  | 'tray'         // מגש מחליק
  | 'motor'        // מנוע סיבוב
  | 'radioWave'    // גל רדיו
  | 'powerCharge'  // טעינת כוח
  | 'orbitLock'    // נעילת מסלול
  | 'vaultWheel'   // גלגל כספת
  | 'vaultBolt'    // בריח כספת (קליק מכני)
  | 'metalDoor';   // דלת מתכת נפתחת

let ctx: AudioContext | null = null;
let muted = false;
let userInteracted = false;
let humOsc: OscillatorNode | null = null;
let humOsc2: OscillatorNode | null = null;
let humGain: GainNode | null = null;
let visibilityHooked = false;

/** ה-AudioContext המשותף (נוצר עצלנית); משמש גם את צלילי חידת הסיום */
export function getSharedAudioContext(): AudioContext | null {
  if (!userInteracted) return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function hookVisibility() {
  if (visibilityHooked || typeof document === 'undefined') return;
  visibilityHooked = true;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHum();
    else if (!muted && userInteracted) startHum();
  });
}

/** צליל בסיסי: אוסצילטור עם מעטפת רכה */
function tone(
  audio: AudioContext,
  freqFrom: number,
  freqTo: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  peak = 0.06,
) {
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, now + start);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(1, freqTo),
    now + start + duration,
  );
  gain.gain.setValueAtTime(0.0001, now + start);
  gain.gain.exponentialRampToValueAtTime(peak, now + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(now + start);
  osc.stop(now + start + duration + 0.05);
}

/** זמזום רקע חלש של חדר בקרה */
function startHum() {
  const audio = getSharedAudioContext();
  if (!audio || humOsc) return;
  try {
    humGain = audio.createGain();
    humGain.gain.setValueAtTime(0.0001, audio.currentTime);
    humGain.gain.exponentialRampToValueAtTime(0.014, audio.currentTime + 1.5);
    humOsc = audio.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.value = 55;
    humOsc2 = audio.createOscillator();
    humOsc2.type = 'triangle';
    humOsc2.frequency.value = 110.7;
    const gain2 = audio.createGain();
    gain2.gain.value = 0.35;
    humOsc.connect(humGain);
    humOsc2.connect(gain2).connect(humGain);
    humGain.connect(audio.destination);
    humOsc.start();
    humOsc2.start();
  } catch {
    humOsc = null;
  }
}

function stopHum() {
  try {
    if (humGain && ctx) {
      humGain.gain.cancelScheduledValues(ctx.currentTime);
      humGain.gain.setValueAtTime(humGain.gain.value || 0.0001, ctx.currentTime);
      humGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    }
    const osc1 = humOsc;
    const osc2 = humOsc2;
    setTimeout(() => {
      try { osc1?.stop(); osc2?.stop(); } catch { /* כבר נעצר */ }
    }, 500);
  } catch { /* התעלמות */ }
  humOsc = null;
  humOsc2 = null;
  humGain = null;
}

export const soundManager = {
  /** פעולת משתמש ראשונה — מאפשרת יצירת AudioContext ומתחילה זמזום */
  userGesture() {
    if (userInteracted) return;
    userInteracted = true;
    hookVisibility();
    if (!muted && !document.hidden) startHum();
  },

  /** כפתור ההשתקה הקיים שולט בכל הצלילים, כולל זמזום הרקע */
  setMuted(next: boolean) {
    muted = next;
    if (muted) stopHum();
    else if (userInteracted && !document.hidden) startHum();
  },

  isMuted() {
    return muted;
  },

  play(sound: RoomSound) {
    if (muted) return;
    const audio = getSharedAudioContext();
    if (!audio) return;
    switch (sound) {
      case 'click':
        tone(audio, 880, 880, 0, 0.05, 'sine', 0.05);
        break;
      case 'stationOpen':
        tone(audio, 520, 780, 0, 0.14, 'sine', 0.07);
        break;
      case 'unlock':
        tone(audio, 300, 300, 0, 0.07, 'square', 0.05);
        tone(audio, 620, 620, 0.09, 0.12, 'sine', 0.07);
        break;
      case 'correct':
        tone(audio, 587, 587, 0, 0.12, 'triangle', 0.07);
        tone(audio, 880, 880, 0.13, 0.18, 'triangle', 0.08);
        break;
      case 'newStation':
        tone(audio, 660, 990, 0, 0.16, 'sine', 0.07);
        tone(audio, 1320, 1320, 0.18, 0.1, 'sine', 0.05);
        break;
      case 'lockedClick':
        tone(audio, 220, 180, 0, 0.06, 'square', 0.04);
        break;
      case 'drawer':
        tone(audio, 140, 90, 0, 0.28, 'sawtooth', 0.045);
        tone(audio, 480, 480, 0.26, 0.05, 'square', 0.04);
        break;
      case 'glassDoor':
        tone(audio, 900, 1250, 0, 0.22, 'sine', 0.035);
        tone(audio, 1600, 1600, 0.2, 0.06, 'triangle', 0.03);
        break;
      case 'tray':
        tone(audio, 200, 150, 0, 0.18, 'triangle', 0.045);
        break;
      case 'motor':
        tone(audio, 95, 130, 0, 0.5, 'sawtooth', 0.04);
        tone(audio, 190, 260, 0.05, 0.45, 'triangle', 0.03);
        break;
      case 'radioWave':
        tone(audio, 1100, 1500, 0, 0.14, 'sine', 0.05);
        tone(audio, 1500, 1100, 0.16, 0.14, 'sine', 0.04);
        break;
      case 'powerCharge':
        tone(audio, 180, 720, 0, 0.6, 'sine', 0.06);
        break;
      case 'orbitLock':
        tone(audio, 500, 500, 0, 0.08, 'square', 0.05);
        tone(audio, 750, 750, 0.1, 0.14, 'sine', 0.06);
        break;
      case 'vaultWheel':
        tone(audio, 110, 80, 0, 0.45, 'sawtooth', 0.05);
        tone(audio, 330, 240, 0.04, 0.4, 'triangle', 0.03);
        break;
      case 'vaultBolt':
        tone(audio, 260, 200, 0, 0.05, 'square', 0.06);
        tone(audio, 130, 110, 0.05, 0.07, 'square', 0.04);
        break;
      case 'metalDoor':
        tone(audio, 90, 60, 0, 0.55, 'sawtooth', 0.05);
        tone(audio, 45, 40, 0.1, 0.5, 'sine', 0.05);
        break;
    }
  },

  /** רצף צלילים עם השהיות (מנוקה אוטומטית — טיימרים חד-פעמיים) */
  playSequence(steps: Array<{ sound: RoomSound; delay: number }>) {
    for (const step of steps) {
      if (step.delay <= 0) this.play(step.sound);
      else setTimeout(() => this.play(step.sound), step.delay);
    }
  },

  /** ניקוי מלא (לבדיקות/סגירה) */
  dispose() {
    stopHum();
    try { void ctx?.close(); } catch { /* התעלמות */ }
    ctx = null;
    userInteracted = false;
  },
};
