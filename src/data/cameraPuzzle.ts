import type { FindingCard } from '../types/game';

/** רכיבי הספסל האופטי בשלב ההתנסות */
export type OpticalElement = 'flat' | 'concave' | 'convex';

export const ELEMENT_LABELS: Record<OpticalElement, string> = {
  flat: 'זכוכית שטוחה',
  concave: 'עדשה קעורה',
  convex: 'עדשה קמורה',
};

/** משוב קצר ליד ההדמיה לאחר הצבת כל רכיב */
export const ELEMENT_FEEDBACK: Record<OpticalElement, string> = {
  flat: 'זכוכית שטוחה: הקרניים ממשיכות כמעט באותו כיוון.',
  concave: 'עדשה קעורה: הקרניים מתפזרות.',
  convex: 'עדשה קמורה: הקרניים מתכנסות לנקודה.',
};

/** כותרת המסוף */
export const TERMINAL_TITLE = 'מעבדת האופטיקה · מערכת הצילום';

/** שלב 1 — התקלה */
export const FAULT_MESSAGE =
  'התצלום שוחזר, אך תיק התכנון של המצלמה נמחק. שחזרו כיצד קרני האור הגיעו אל חיישן הלוויין ויצרו תמונה ברורה.';

/** הסבר מדעי — שלב ההתנסות */
export const SCIENCE_NOTE_2 =
  'כאשר אור עובר בין חומרים, כיוון תנועתו עשוי להשתנות. תופעה זו נקראת שבירה. עדשה קמורה מרכזת את קרני האור ויכולה למקד אותן על חיישן הצילום.';

/** מרחק החיישן מהעדשה בס"מ */
export const SENSOR_DISTANCE_CM = 20;

/** עדשות המשימה: מרחקי מיקוד בס"מ */
export const LENS_OPTIONS = [
  { id: 'A', focalCm: 10, preview: 'עדשה A: התמונה מטושטשת, הקרניים נפגשות לפני החיישן.' },
  { id: 'B', focalCm: 20, preview: 'עדשה B: התמונה חדה, הקרניים נפגשות על החיישן.' },
  { id: 'C', focalCm: 35, preview: 'עדשה C: התמונה מטושטשת, הקרניים עדיין לא נפגשו כשהן מגיעות לחיישן.' },
] as const;

export type LensId = (typeof LENS_OPTIONS)[number]['id'];

export const MISSION_MESSAGE_2 =
  'בחרו את העדשה שממקדת את האור בדיוק על החיישן והזינו בקודן את מרחק המיקוד שלה.';

export const CORRECT_LENS: LensId = 'B';
export const CORRECT_CODE_2 = 20;

export const FEEDBACK_A = 'קרני האור נפגשות לפני החיישן.';
export const FEEDBACK_C = 'נקודת המיקוד נמצאת מעבר לחיישן.';
export const FEEDBACK_WRONG_CODE_2 =
  'התאימו בין מרחק החיישן לבין מרחק המיקוד.';
export const FEEDBACK_MISSING_2 =
  'בחרו עדשה ולאחר מכן הזינו בקודן את מרחק המיקוד שלה.';

/** שלושה רמזים מדורגים */
export const HINTS_2 = [
  'חפשו את הרכיב שמרכז את קרני האור.',
  'החיישן צריך להימצא במקום שבו הקרניים נפגשות.',
  'מרחק החיישן הוא 20 ס"מ. בחרו עדשה בעלת מרחק מיקוד זהה.',
] as const;

export const SUCCESS_MESSAGE_2 =
  'מערכת הצילום שוחזרה — עדשה B, מרחק מיקוד 20 ס"מ.';

export const TRANSITION_MESSAGE_2 =
  'התמונה נוצרה במצלמה, אך כיצד היא הגיעה מן הלוויין אל תחנת הקרקע?';

export const CAMERA_FINDING: FindingCard = {
  stationId: 'camera-system',
  title: 'ממצא 2 — מערכת הצילום',
  content:
    'עדשה קמורה שוברת ומרכזת את קרני האור. הצבת החיישן בנקודת המיקוד מאפשרת ליצור תמונה ברורה.',
};
