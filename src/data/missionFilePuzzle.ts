import type { FindingCard } from '../types/game';

export const TERMINAL_TITLE_6 = 'תיק המשימה המקורי · למה נבנה הלוויין?';

/** שלב 1 — חמש הראיות מהחידות הקודמות */
export interface EvidenceCard {
  id: string;
  icon: string;
  text: string;
}

export const EVIDENCE_CARDS: readonly EvidenceCard[] = [
  { id: 'camera-res', icon: '📷', text: 'מצלמה בעלת רזולוציה גבוהה.' },
  { id: 'earth-optics', icon: '🔭', text: 'מערכת אופטית המכוונת אל פני כדור הארץ.' },
  { id: 'radio', icon: '📡', text: 'משדר רדיו להעברת מידע לתחנת קרקע.' },
  { id: 'solar', icon: '🔆', text: 'לוחות סולאריים המאפשרים פעולה ממושכת.' },
  { id: 'orbit', icon: '🌍', text: 'מסלול נמוך סביב כדור הארץ המאפשר מעבר חוזר מעל אזורים שונים.' },
];

export const FILE_INTRO =
  'תיק מסווג ששוחזר חלקית. בדקו כל אחת מחמש הראיות שנאספו מהחידות הקודמות.';

/** שלב 2 — לוח החקירה */
export const CAPABILITY_QUESTION =
  'איזו יכולת משותפת נוצרת מחיבור כל המערכות?';

export interface CapabilityOption {
  id: 'a' | 'b' | 'c' | 'd';
  label: string;
  /** משוב לימודי לתשובה שגויה (אין לנכונה) */
  feedback?: string;
}

export const CAPABILITY_OPTIONS: readonly CapabilityOption[] = [
  {
    id: 'a',
    label: 'נשיאת אנשים וציוד לחלל.',
    feedback: 'נשיאת אנשים דורשת תא נוסעים ומערכות קיום שלא נמצאו.',
  },
  {
    id: 'b',
    label: 'צילום חוזר של אזורים מרוחקים והעברת התמונות במהירות לקרקע.',
  },
  {
    id: 'c',
    label: 'יצירת אור וחום עבור תחנת החלל.',
    feedback: 'יצירת חשמל היא אמצעי להפעלת הלוויין ולא הצורך המקורי.',
  },
  {
    id: 'd',
    label: 'צפייה בכוכבים רחוקים כשהמצלמה מופנית מהארץ.',
    feedback:
      'טלסקופ אסטרונומי אמור להיות מכוון לחלל, אך המצלמה כאן מכוונת לכדור הארץ.',
  },
];

export const CORRECT_CAPABILITY = 'b';

export const CAPABILITY_SUCCESS =
  'המערכות מתחברות ליכולת אחת: תצפית חוזרת על פני כדור הארץ ושליחת התמונות לתחנת קרקע.';

/** שלב 3 — ארבעה תיקי משימה אפשריים */
export interface MissionFileOption {
  num: number;
  label: string;
}

export const MISSION_FILES: readonly MissionFileOption[] = [
  { num: 1, label: 'העברת שיחות תקשורת בין יבשות.' },
  { num: 2, label: 'הובלת אנשים וציוד למסלול.' },
  { num: 3, label: 'צילום מפורט וחוזר של אזורים מרוחקים והעברת התמונות במהירות למרכז בקרה.' },
  { num: 4, label: 'חקר כוכבים וגלקסיות כשהמצלמה מופנית הרחק מכדור הארץ.' },
];

export const CORRECT_MISSION = 3;

/** שלוש הראיות המכריעות הנדרשות */
export const DECISIVE_EVIDENCE: readonly string[] = [
  'camera-res',
  'earth-optics',
  'radio',
];

export const EVIDENCE_PROMPT =
  'בחרו משימה, ולצידה שלוש ראיות מכריעות שתומכות בה.';

export const FEEDBACK_WRONG_MISSION =
  'המשימה שנבחרה אינה תואמת את הראיות. חשבו איזו משימה משתמשת בכל המערכות שגיליתם.';

export const FEEDBACK_WRONG_EVIDENCE =
  'המשימה נכונה, אך הראיות המכריעות צריכות להצביע על צילום, על כיוון לכדור הארץ ועל העברת התמונות לקרקע.';

export const FEEDBACK_MISSING_6 =
  'בחרו תיק משימה וסמנו בדיוק שלוש ראיות מכריעות.';

/** שלב 4 — אימות תיק המשימה */
export const NEED_TEXT =
  'הצורך המקורי: לקבל שוב ושוב מידע חזותי מפורט על אזורים מרוחקים בכדור הארץ ולהעביר אותו במהירות למרכז הבקרה.';

export const CODE_PROMPT = 'הזינו את מספר תיק המשימה הנכון.';

export const CORRECT_CODE_6 = 3;

export const FEEDBACK_WRONG_CODE_6 =
  'בדקו איזה מספר תיק מתאר את הצורך ששוחזר.';

/** שלושה רמזים מדורגים */
export const HINTS_6 = [
  'חפשו משימה שמשתמשת גם במצלמה וגם במשדר.',
  'הלוויין מכוון לכדור הארץ ועובר שוב מעל אזורים שונים.',
  'מספר התיק הנכון הוא מספר האפשרות המתארת צילום חוזר והעברה מהירה לקרקע.',
] as const;

export const SUCCESS_MESSAGE_6 =
  'כל ששת הממצאים שוחזרו. שלב ההרכבה הסופית מוכן.';

export const MISSION_FILE_FINDING: FindingCard = {
  stationId: 'mission-file',
  title: 'ממצא 6 — הצורך המקורי',
  content: 'צורך: תצפית חוזרת על אזורים מרוחקים וקבלת תמונות מפורטות במהירות.',
};
