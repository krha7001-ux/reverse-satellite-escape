import type { FindingCard } from '../types/game';

export const TERMINAL_TITLE_4 = 'מערכת האנרגיה · מקור הכוח';

export const FAULT_MESSAGE_4 =
  'המצלמה והמשדר שוחזרו, אך אין די חשמל להפעלתם. שחזרו את מקור האנרגיה של הלוויין.';

/** שלושת מצבי הלוח הסולארי */
export interface PanelState {
  id: 'side' | 'partial' | 'direct';
  label: string;
  watts: number;
  /** זווית הלוח במעלות (0 = פונה ישירות לשמש) */
  angle: number;
}

export const PANEL_STATES: readonly PanelState[] = [
  { id: 'side', label: 'הלוח פונה הצידה', watts: 30, angle: 72 },
  { id: 'partial', label: 'הלוח פונה חלקית לשמש', watts: 70, angle: 38 },
  { id: 'direct', label: 'פני הלוח מכוונים ישירות אל השמש', watts: 100, angle: 0 },
];

export const SHADE_FEEDBACK =
  'צל: תפוקת הלוח 0 ואט — הסוללה מספקת חשמל למערכות.';

export const SCIENCE_NOTE_4 =
  'תאים סולאריים ממירים את אנרגיית הקרינה של השמש לאנרגיה חשמלית. כיוון הלוח משפיע על כמות האור הפוגעת בו. חלק מהאנרגיה נשמר בסוללה לשימוש בזמן שהלוויין נמצא בצל.';

/** שלוש המערכות בתקציב האנרגיה */
export interface SatelliteSystem {
  id: 'camera' | 'transmitter' | 'computer';
  label: string;
  watts: number;
  icon: string;
}

export const SYSTEMS: readonly SatelliteSystem[] = [
  { id: 'camera', label: 'מצלמה', watts: 30, icon: '📷' },
  { id: 'transmitter', label: 'משדר', watts: 40, icon: '📡' },
  { id: 'computer', label: 'מחשב הלוויין', watts: 20, icon: '💻' },
];

export const TOTAL_CONSUMPTION = 90; // 30 + 40 + 20

export const MISSION_MESSAGE_4 =
  'כל שלוש המערכות חייבות לפעול יחד. כוונו את הלוח למצב המתאים והזינו בקודן את ההספק המינימלי הדרוש.';

export const CORRECT_CODE_4 = 90;

export const FEEDBACK_30 = 'ההספק מספיק רק לחלק מן המערכות.';
export const FEEDBACK_70 = 'חסרים 20 ואט להפעלת כל המערכות.';
export const FEEDBACK_WRONG_CODE_4 =
  'חברו את צריכת המצלמה, המשדר והמחשב.';
export const FEEDBACK_CORRECT_4 =
  'הלוח מפיק די חשמל להפעלת המערכות ועודף האנרגיה יכול להישמר בסוללה.';
export const FEEDBACK_MISSING_4 =
  'כוונו את הלוח והזינו בקודן את ההספק המינימלי הדרוש.';

/** שלושה רמזים מדורגים */
export const HINTS_4 = [
  'חברו את צריכת החשמל של כל שלוש המערכות.',
  'חשבו: 30 + 40 + 20.',
  'המערכות זקוקות ל-90 ואט; בחרו מצב שמפיק לפחות כמות זו.',
] as const;

export const SUCCESS_MESSAGE_4 =
  'מערכת האנרגיה שוחזרה — נדרשים 90 ואט, והלוח מפיק 100 ואט.';

export const TRANSITION_MESSAGE_4 =
  'המערכות חזרו לפעול. כעת שחזרו כיצד הלוויין נשאר בתנועה סביב כדור הארץ.';

export const POWER_FINDING: FindingCard = {
  stationId: 'power-source',
  title: 'ממצא 4 — מקור הכוח',
  content:
    'הלוחות הסולאריים ממירים את קרינת השמש לחשמל. כיוון הלוחות משפיע על כמות האנרגיה, והסוללה מאפשרת פעולה גם בזמן מעבר באזור מוצל.',
};
