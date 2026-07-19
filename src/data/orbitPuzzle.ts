import type { FindingCard } from '../types/game';

export const TERMINAL_TITLE_5 = 'בקרת מסלול · תנועת הלוויין';

export const FAULT_MESSAGE_5 =
  'כל מערכות הלוויין פועלות, אך נתוני התנועה שלו נמחקו. ללא מהירות מתאימה הוא יסטה מן המסלול ולא יוכל להשלים את משימת הצילום.';

/** הבהרת קנה המידה של ההדמיה */
export const SCALE_NOTE =
  'ההדמיה מואטת ואינה מוצגת בקנה מידה אמיתי.';

/** תוצאות אפשריות של ניסיון שיגור */
export type OrbitOutcome = 'fall' | 'impact' | 'stable' | 'escape';

export interface SpeedOption {
  /** מהירות במטרים לשנייה */
  value: number;
  outcome: OrbitOutcome;
  /** מה רואים בהדמיה (שלב ההתנסות) */
  observation: string;
  /** משוב המשימה (שלב 3) */
  feedback: string;
  /** צבע קו הנתיב שנשאר מאחור */
  color: string;
}

export const SPEED_OPTIONS: readonly SpeedOption[] = [
  {
    value: 0,
    outcome: 'fall',
    observation: 'הלוויין נע לכיוון כדור הארץ.',
    feedback: 'ללא מהירות קדימה, כוח הכבידה מושך את הלוויין לכיוון כדור הארץ.',
    color: '#e05656',
  },
  {
    value: 4000,
    outcome: 'impact',
    observation: 'המסלול מתעקם ופוגש את כדור הארץ.',
    feedback: 'המהירות נמוכה מדי והנתיב פוגש את כדור הארץ.',
    color: '#f0a842',
  },
  {
    value: 7600,
    outcome: 'stable',
    observation: 'הלוויין משלים מסלול יציב בקירוב סביב כדור הארץ.',
    feedback: 'המסלול יציב. הזינו בקודן את המהירות במטרים לשנייה.',
    color: '#2dd4c8',
  },
  {
    value: 11000,
    outcome: 'escape',
    observation: 'הלוויין מתרחק מן המסלול שנבחר.',
    feedback: 'המהירות גבוהה מדי למסלול שנבחר והלוויין מתרחק.',
    color: '#a78bfa',
  },
];

/** גובה המסלול בק"מ (לתצוגה) */
export const ORBIT_ALTITUDE_KM = 500;

export const SCIENCE_NOTE_5 =
  'כוח הכבידה מושך את הלוויין לכיוון כדור הארץ, ומהירותו מניעה אותו קדימה. במהירות מתאימה הוא ממשיך ליפול סביב כדור הארץ מבלי להגיע אל הקרקע. במסלול יציב אין צורך בהפעלת מנוע רציפה.';

export const MISSION_MESSAGE_5 =
  'הלוויין נמצא בגובה 500 ק"מ. בחרו את המהירות שבה המרחק מכדור הארץ נשאר כמעט קבוע והזינו אותה בקודן במטרים לשנייה.';

export const CLARIFICATION_5 =
  'המהירות המתאימה תלויה בגובה המסלול. המספר במשימה מתייחס למסלול המוצג בהדמיה.';

export const CORRECT_SPEED = 7600;
export const CORRECT_CODE_5 = 7600;

export const FEEDBACK_MISSING_5 =
  'בחרו מהירות ולאחר מכן הזינו אותה בקודן במטרים לשנייה.';

/** שלושה רמזים מדורגים */
export const HINTS_5 = [
  'חפשו שילוב בין משיכה פנימה לבין תנועה קדימה.',
  'בחרו במהירות שבה מד המרחק נשאר כמעט קבוע.',
  'בהדמיה, המסלול היציב מתקבל במהירות 7,600 מטר בשנייה.',
] as const;

export const SUCCESS_MESSAGE_5 =
  'המסלול שוחזר — בגובה 500 ק"מ הלוויין נע בהדמיה במהירות 7,600 מטר בשנייה.';

export const TRANSITION_MESSAGE_5 =
  'המערכות שוחזרו. נותרה השאלה הראשונה של כל תהליך פיתוח: מדוע היה צורך בלוויין?';

export const ORBIT_FINDING: FindingCard = {
  stationId: 'orbit',
  title: 'ממצא 5 — תנועה ומסלול',
  content:
    'מסלול נוצר משילוב בין משיכת הכבידה לבין מהירות הלוויין קדימה. בחירת הגובה והמהירות מאפשרת לו לחלוף שוב ושוב מעל כדור הארץ.',
};
