import type { FindingCard } from '../types/game';

/** רמות הרזולוציה של המחוון */
export const RESOLUTION_LEVELS: readonly number[] = [8, 16, 32, 64];

/** מגבלת מערכת השידור בפיקסלים */
export const PIXEL_LIMIT = 1200;

/** הרזולוציה הנכונה והקוד הנכון */
export const CORRECT_RESOLUTION = 32;
export const CORRECT_CODE = 1024;

/** אפשרויות הבחירה במשימה */
export const MISSION_OPTIONS = [16, 32, 64] as const;

/** הודעת שלב א — קליטת השידור */
export const BOOT_MESSAGE =
  'התקבל התצלום האחרון. איכות השידור נפגעה.';

/** שורת ההנחיה שנלווית לשלב ההתנסות */
export const RESTORE_INSTRUCTION = 'שחזרו את הרזולוציה המתאימה.';

export const SCIENCE_NOTE =
  'תמונה דיגיטלית מורכבת מפיקסלים — נקודות צבע זעירות. במערכת ההדמיה הזו, הגדלת מספר הפיקסלים מאפשרת להציג פרטים נוספים, אך מגדילה את כמות המידע שיש לשדר.';

export const MISSION_MESSAGE =
  'מערכת השידור יכולה להעביר לכל היותר 1,200 פיקסלים. בחרו ברזולוציה הגבוהה ביותר שאפשר להעביר במסגרת המגבלה.';

export const FEEDBACK_16 =
  'אפשר להעביר את התמונה, אך קיימת רזולוציה גבוהה יותר שעדיין עומדת במגבלה.';

export const FEEDBACK_64 =
  'התמונה ברורה, אך כמות המידע גדולה מ-1,200 פיקסלים.';

export const FEEDBACK_WRONG_CODE =
  'בדקו כיצד מחשבים את מספר הפיקסלים הכולל.';

export const FEEDBACK_MISSING =
  'בחרו רזולוציה ולאחר מכן הזינו בקודן את מספר הפיקסלים הכולל.';

/** שלושה רמזים מדורגים — נחשף אחד בכל לחיצה */
export const HINTS = [
  'הכפילו את מספר הפיקסלים לרוחב במספר הפיקסלים לגובה.',
  'חשבו כמה פיקסלים יש ב-32×32 וב-64×64.',
  'חפשו את התוצאה הגבוהה ביותר שאינה עוברת 1,200.',
] as const;

export const SUCCESS_MESSAGE =
  'התצלום שוחזר — 32×32 פיקסלים, 1,024 פיקסלים בסך הכול.';

export const TRANSITION_MESSAGE =
  'הרזולוציה מסבירה את מבנה התצלום. כעת גלו איזו מערכת אספה את האור ויצרה אותו.';

export const LAST_PHOTO_FINDING: FindingCard = {
  stationId: 'last-photo',
  title: 'ממצא 1 — התוצר האחרון',
  content:
    'תצלום מפורט מורכב מפיקסלים. מספר גדול יותר של פיקסלים מאפשר להציג פרטים נוספים, אך מגדיל את כמות המידע.',
};
