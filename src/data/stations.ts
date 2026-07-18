import type { Station } from '../types/game';

/** משך המשימה בשניות — 60 דקות */
export const MISSION_DURATION_SECONDS = 60 * 60;

/** תמונת חדר הבקרה (נטענת מ-public/assets) */
export const CONTROL_ROOM_IMAGE = `${import.meta.env.BASE_URL}assets/satellite-control-room.png`;

/** יחס רוחב־גובה של תמונת חדר הבקרה (1774×887) */
export const CONTROL_ROOM_ASPECT = 1774 / 887;

/**
 * שש תחנות המשחק, לפי סדר ההתקדמות לאחור.
 * hotspot — מיקום נקודת הלחיצה על התמונה באחוזים (x מקצה שמאל, y מקצה עליון).
 */
export const STATIONS: Station[] = [
  // מסך התצלום בצד שמאל
  { id: 'last-photo', order: 1, title: 'התצלום האחרון', icon: '🛰️', hotspot: { x: 13.5, y: 44 } },
  // ארון העדשות והמצלמה
  { id: 'camera-system', order: 2, title: 'מערכת הצילום', icon: '📷', hotspot: { x: 29.5, y: 47 } },
  // עמדת התקשורת
  { id: 'transmission-system', order: 3, title: 'מערכת השידור', icon: '📡', hotspot: { x: 45, y: 46 } },
  // עמדת הכוח והלוח הסולארי
  { id: 'power-source', order: 4, title: 'מקור הכוח', icon: '🔋', hotspot: { x: 58, y: 47 } },
  // מסך כדור הארץ והמסלול
  { id: 'orbit', order: 5, title: 'המסלול', icon: '🌍', hotspot: { x: 70, y: 44 } },
  // הכספת בצד ימין
  { id: 'mission-file', order: 6, title: 'תיק המשימה', icon: '🗂️', hotspot: { x: 86, y: 46 } },
];

export const MISSION_BRIEF =
  'לוויין הריגול קשת–8 הפסיק לשדר, וכל תיקי הפיתוח שלו נמחקו. אתם צוות ההנדסה ההפוכה. התחילו בתצלום האחרון והתקדמו לאחור כדי לשחזר את המערכות, העקרונות המדעיים והצורך שהוביל לפיתוח הלוויין.';
