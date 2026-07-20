import type { StationId } from '../types/game';
import { STATIONS } from '../data/stations';

/** סוגי האפקטים של עוגני החדר */
export type AnchorEffect =
  | 'screen'      // מסך: קווי סריקה, אור כחול נע, נורות LED
  | 'cabinet'     // ארון תצוגה: זוהר פנימי ונורות
  | 'console'     // עמדת בקרה: נורות LED מהבהבות
  | 'vault'       // דלת הכספת: נורית סטטוס ענברית
  | 'satellite'   // הלוויין התלוי: נצנוץ החזר אור עדין
  | 'ceiling'     // אזור התקרה: חלקיקי אבק באור
  | 'floor';      // הרצפה: תאורת התעוררות לפי התקדמות

/**
 * עוגן אפקט: מיקום וגודל יחסיים (באחוזים) במערכת הקואורדינטות
 * של תמונת חדר הבקרה — כך שהאפקט נע יחד עם גרירה וזום.
 */
export interface EffectAnchor {
  id: string;
  /** אחוזים מקצה שמאל/עליון של התמונה */
  left: number;
  top: number;
  width: number;
  height: number;
  transformOrigin: string;
  zIndex: number;
  effect: AnchorEffect;
  /** תחנה שמצבה קובע את המצב החזותי של העוגן */
  stationId?: StationId;
}

/** מרכז נקודת הלחיצה של תחנה — לשימוש חוזר במיקומי העוגנים */
const hotspotOf = (id: StationId) =>
  STATIONS.find((s) => s.id === id)!.hotspot;

/**
 * עוגני האפקטים של החדר. הגדלים כוילו מול התמונה (1774×887);
 * מרכזי התחנות נגזרים ממיקומי ה-hotspots הקיימים כדי למנוע כפילות.
 */
export const EFFECT_ANCHORS: readonly EffectAnchor[] = [
  {
    id: 'last-photo-screen',
    left: hotspotOf('last-photo').x - 8.5,
    top: hotspotOf('last-photo').y - 14,
    width: 17,
    height: 24,
    transformOrigin: '50% 50%',
    zIndex: 3,
    effect: 'screen',
    stationId: 'last-photo',
  },
  {
    id: 'camera-cabinet',
    left: hotspotOf('camera-system').x - 5.5,
    top: hotspotOf('camera-system').y - 16,
    width: 11,
    height: 32,
    transformOrigin: '50% 50%',
    zIndex: 3,
    effect: 'cabinet',
    stationId: 'camera-system',
  },
  {
    id: 'transmission-console',
    left: hotspotOf('transmission-system').x - 7,
    top: hotspotOf('transmission-system').y - 13,
    width: 14,
    height: 20,
    transformOrigin: '50% 50%',
    zIndex: 3,
    effect: 'screen',
    stationId: 'transmission-system',
  },
  {
    id: 'power-console',
    left: hotspotOf('power-source').x - 5.5,
    top: hotspotOf('power-source').y - 13,
    width: 11,
    height: 22,
    transformOrigin: '50% 50%',
    zIndex: 3,
    effect: 'console',
    stationId: 'power-source',
  },
  {
    id: 'orbit-screen',
    left: hotspotOf('orbit').x - 8,
    top: hotspotOf('orbit').y - 13,
    width: 16,
    height: 22,
    transformOrigin: '50% 50%',
    zIndex: 3,
    effect: 'screen',
    stationId: 'orbit',
  },
  {
    id: 'mission-vault',
    left: hotspotOf('mission-file').x - 5,
    top: hotspotOf('mission-file').y - 15,
    width: 10,
    height: 30,
    transformOrigin: '50% 50%',
    zIndex: 3,
    effect: 'vault',
    stationId: 'mission-file',
  },
  {
    id: 'hanging-satellite',
    left: 36,
    top: 4,
    width: 26,
    height: 32,
    transformOrigin: '50% 0%',
    zIndex: 2,
    effect: 'satellite',
  },
  {
    id: 'ceiling-zone',
    left: 15,
    top: 0,
    width: 70,
    height: 14,
    transformOrigin: '50% 0%',
    zIndex: 2,
    effect: 'ceiling',
  },
  {
    id: 'floor-zone',
    left: 18,
    top: 60,
    width: 64,
    height: 34,
    transformOrigin: '50% 100%',
    zIndex: 2,
    effect: 'floor',
  },
];

/** מספר חלקיקי האבק (מוגבל לביצועים) */
export const DUST_PARTICLES = 7;

/** מספר נורות ה-LED לעוגן */
export const LEDS_PER_ANCHOR = 3;
