/** תוכן חידת הסיום: שחזור שרשרת הפיתוח והפעלה מחדש */

export const FINAL_HOTSPOT_LABEL = 'הרכבה סופית';

export const FINAL_BANNER =
  'כל ששת הממצאים שוחזרו. הגיע הזמן להרכיב את שרשרת הפיתוח.';

export const FINAL_TERMINAL_TITLE =
  'הרכבה סופית · שחזור שרשרת הפיתוח';

/** שלב 1 — ששת הממצאים בסדר הגילוי (מהתוצר אל הצורך) */
export interface DiscoveryItem {
  id: string;
  title: string;
  text: string;
  icon: string;
}

export const DISCOVERY_ORDER: readonly DiscoveryItem[] = [
  { id: 'product', icon: '🖼️', title: 'תוצר', text: 'תצלום דיגיטלי מפורט שהתקבל במרכז הבקרה.' },
  { id: 'capability', icon: '🎯', title: 'יכולת', text: 'צילום חוזר של אזורים ושליחת התמונות לקרקע.' },
  { id: 'systems', icon: '🛰️', title: 'מערכות', text: 'מצלמה, מערכת אופטית, משדר, לוחות סולאריים ומסלול.' },
  { id: 'science', icon: '🔬', title: 'עקרונות מדעיים', text: 'פיקסלים, אור ועדשות, גלים, אנרגיה סולארית, כבידה ותנועה.' },
  { id: 'decision', icon: '📐', title: 'החלטה הנדסית', text: 'בניית לוויין תצפית במסלול נמוך עם מערכות צילום, תקשורת וכוח.' },
  { id: 'need', icon: '❓', title: 'צורך מקורי', text: 'קבלת מידע חזותי מפורט וחוזר על אזורים מרוחקים.' },
];

export const DISCOVERY_CAPTION =
  'כך חקרתם את הלוויין: מהתוצר בחזרה אל הצורך.';

export const REVERSE_BUTTON = 'הפכו את כיוון הפיתוח';

/** שלב 2 — כרטיסי שרשרת הפיתוח (בכיוון ההנדסי) */
export interface ChainCard {
  id: string;
  title: string;
  text: string;
  icon: string;
}

export const CHAIN_CARDS: readonly ChainCard[] = [
  { id: 'need', icon: '❓', title: 'צורך מקורי', text: 'לקבל שוב ושוב מידע חזותי מפורט על אזורים מרוחקים.' },
  { id: 'decision', icon: '📐', title: 'החלטה הנדסית', text: 'לפתח לוויין תצפית במסלול נמוך סביב כדור הארץ.' },
  { id: 'science', icon: '🔬', title: 'עקרונות מדעיים', text: 'פיקסלים ומידע דיגיטלי, שבירת אור, גלי רדיו, המרת אנרגיית שמש וכבידה.' },
  { id: 'systems', icon: '🛰️', title: 'מערכות', text: 'מצלמה ועדשות, משדר, לוחות סולאריים ומערכת מסלול.' },
  { id: 'capability', icon: '🎯', title: 'יכולת', text: 'לצלם אזורים שוב ושוב ולהעביר את המידע במהירות לקרקע.' },
  { id: 'product', icon: '🖼️', title: 'תוצר', text: 'תצלום דיגיטלי מפורט שהתקבל במרכז הבקרה.' },
];

/** הסדר הנכון של השרשרת */
export const CHAIN_ORDER: readonly string[] = [
  'need', 'decision', 'science', 'systems', 'capability', 'product',
];

/** סדר פתיחה מעורבב (לעולם לא נכון) */
export const SHUFFLED_ORDER: readonly string[] = [
  'systems', 'product', 'need', 'capability', 'science', 'decision',
];

export const CHAIN_INSTRUCTION =
  'סדרו את הכרטיסים בכיוון שבו מהנדסים מפתחים מוצר: גררו כרטיס אל כרטיס אחר כדי להחליף ביניהם, לחצו על שניים ברצף, או השתמשו בחיצים.';

export const CHECK_CHAIN_BUTTON = 'בדיקת השרשרת';

export const FEEDBACK_WRONG_CHAIN =
  'יש חוליה שאינה מובילה באופן הגיוני לחוליה הבאה. בדקו מה מתחיל את תהליך הפיתוח.';

export const CHAIN_SUCCESS = 'שרשרת הפיתוח שוחזרה בהצלחה.';

export const HINTS_FINAL = [
  'פיתוח הנדסי מתחיל בבעיה או בצורך.',
  'העקרונות המדעיים מסבירים כיצד המערכות יכולות לפעול.',
  'הסדר מתחיל בצורך ומסתיים בתוצר.',
] as const;

/** שלב 3 — חמש מערכות הלוויין לאימות */
export interface SatSystemCheck {
  id: string;
  icon: string;
  title: string;
  fact: string;
  /** סוג הצליל בעת האימות */
  sound: 'verify' | 'power' | 'rotate' | 'transmit';
}

export const SYSTEM_CHECKS: readonly SatSystemCheck[] = [
  { id: 'orbit', icon: '🌍', title: 'מסלול', fact: 'מהירות מסלול משוחזרת: 7,600 מטר לשנייה.', sound: 'rotate' },
  { id: 'power', icon: '🔋', title: 'מקור כוח', fact: 'פאנל מכוון לשמש: 100 ואט זמינים.', sound: 'power' },
  { id: 'camera', icon: '📷', title: 'מערכת צילום', fact: 'עדשה מרכזת את האור על החיישן.', sound: 'verify' },
  { id: 'transmission', icon: '📡', title: 'מערכת שידור', fact: 'גלי רדיו מוכנים להעברת המידע בחלל.', sound: 'transmit' },
  { id: 'photo', icon: '🖼️', title: 'תצלום', fact: 'רזולוציה מאושרת: 32×32 = 1,024 פיקסלים.', sound: 'verify' },
];

export const VERIFY_BUTTON = 'אימות';
export const VERIFIED_LABEL = 'תקין';
export const RELAUNCH_BUTTON = 'הפעלת הלוויין מחדש';

/** שלב 4 — רצף ההפעלה ומסך ההצלחה */
export const SUCCESS_TITLE = 'הלוויין הופעל מחדש!';
export const SUCCESS_SUBTITLE =
  'שחזרתם את תהליך הפיתוח מן הצורך המקורי ועד לתוצר הסופי.';

export const REPLAY_BUTTON = 'צפייה מחדש בהפעלה';
export const BACK_TO_ROOM_BUTTON = 'חזרה לחדר';
export const NEW_GAME_BUTTON = 'משחק חדש';

export const NEW_GAME_CONFIRM =
  'האם להתחיל משחק חדש? כל ההתקדמות, הממצאים והזמן יימחקו.';
