import type { Station } from '../types/game';

/** משך המשימה בשניות — 60 דקות */
export const MISSION_DURATION_SECONDS = 60 * 60;

/** כתובת הפנורמה של חדר הבקרה (Blockade Labs) */
export const PANORAMA_URL =
  'https://skybox.blockadelabs.com/e/3f43b6bc135a67fa50ccb30e90214939';

/** שש תחנות המשחק, לפי סדר ההתקדמות לאחור */
export const STATIONS: Station[] = [
  { id: 'last-photo', order: 1, title: 'התצלום האחרון', icon: '🛰️' },
  { id: 'camera-system', order: 2, title: 'מערכת הצילום', icon: '📷' },
  { id: 'transmission-system', order: 3, title: 'מערכת השידור', icon: '📡' },
  { id: 'power-source', order: 4, title: 'מקור הכוח', icon: '🔋' },
  { id: 'orbit', order: 5, title: 'המסלול', icon: '🌍' },
  { id: 'mission-file', order: 6, title: 'תיק המשימה', icon: '🗂️' },
];

export const MISSION_BRIEF =
  'לוויין הריגול קשת–8 הפסיק לשדר, וכל תיקי הפיתוח שלו נמחקו. אתם צוות ההנדסה ההפוכה. התחילו בתצלום האחרון והתקדמו לאחור כדי לשחזר את המערכות, העקרונות המדעיים והצורך שהוביל לפיתוח הלוויין.';
