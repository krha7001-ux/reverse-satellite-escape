import type { FindingCard } from '../types/game';

/** אמצעי ההעברה בניסוי התקשורת */
export type TransmissionMedium = 'sound' | 'cable' | 'radio';

export const MEDIUM_LABELS: Record<TransmissionMedium, string> = {
  sound: 'רמקול וגלי קול',
  cable: 'כבל תקשורת',
  radio: 'אנטנה וגלי רדיו',
};

/** משוב לכל אמצעי — משמש גם בבדיקה וגם בבחירה הסופית */
export const MEDIUM_FEEDBACK: Record<TransmissionMedium, string> = {
  sound: 'ככל שכמות האוויר פוחתת, תנודות הקול אינן יכולות לעבור.',
  cable: 'הלוויין נע סביב כדור הארץ ולכן אי אפשר לחבר אותו לתחנת הקרקע בכבל.',
  radio: 'האות האלקטרומגנטי הגיע למקלט. מערכת השידור נמצאה.',
};

export const TERMINAL_TITLE_3 = 'מרכז התקשורת · מערכת השידור';

export const FAULT_MESSAGE_3 =
  'המצלמה הצליחה ליצור תצלום, אך תיק מערכת התקשורת נמחק. שחזרו כיצד המידע עבר מן הלוויין אל תחנת הקרקע.';

export const SCIENCE_NOTE_3 =
  'גלי קול זקוקים לחומר, כמו אוויר, כדי לעבור ממקום למקום. גלי רדיו הם גלים אלקטרומגנטיים, ולכן הם יכולים להתפשט גם בחלל הריק ולשאת מידע דיגיטלי.';

export const CHOICE_PROMPT =
  'בחרו באמצעי שיכול להעביר את התצלום דרך החלל.';

export const CORRECT_MEDIUM: TransmissionMedium = 'radio';

/** ליד הכבל בתא הניסוי */
export const CABLE_NOTE = 'מחייב חיבור פיזי רציף';

/** שלב 3 — משימת השידור */
export const MISSION_MESSAGE_3 =
  'התצלום מכיל 1,024 יחידות מידע. המשדר מסוגל להעביר 256 יחידות בכל שנייה. כמה שניות נדרשות להעברת התצלום?';

export const CLARIFICATION_3 =
  'בהדמיה הפשוטה הזו כל פיקסל מייצג יחידת מידע אחת.';

export const TOTAL_UNITS = 1024;
export const UNITS_PER_SECOND = 256;
export const PACKET_COUNT = TOTAL_UNITS / UNITS_PER_SECOND; // 4

export const CORRECT_CODE_3 = 4;

export const FEEDBACK_WRONG_CODE_3 =
  'חשבו כמה קבוצות של 256 נכנסות בתוך 1,024.';

export const FEEDBACK_MISSING_3 =
  'הזינו בקודן את זמן השידור בשניות.';

/** שלושה רמזים מדורגים */
export const HINTS_3 = [
  'זמן השידור מתקבל מחלוקת כמות המידע בקצב ההעברה.',
  'חלקו 1,024 יחידות לחבילות של 256 יחידות.',
  '1,024 ÷ 256 = 4.',
] as const;

export const SUCCESS_MESSAGE_3 =
  'מערכת השידור שוחזרה — התצלום הועבר באמצעות גלי רדיו במשך 4 שניות.';

export const TRANSITION_MESSAGE_3 =
  'המצלמה והמשדר פועלים, אך שניהם זקוקים לאנרגיה. שחזרו את מקור הכוח של הלוויין.';

export const TRANSMISSION_FINDING: FindingCard = {
  stationId: 'transmission-system',
  title: 'ממצא 3 — מערכת השידור',
  content:
    'אנטנה ממירה מידע לאות רדיו. גלי הרדיו יכולים לנוע בחלל הריק ולהעביר את התצלום לתחנת הקרקע.',
};
