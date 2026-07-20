/**
 * מפת האזורים הפונקציונליים של קונסולת „התצלום האחרון” — באחוזים מגודל
 * תמונת הרקע (16:9). הערכים חייבים להתאים לתמונה שנוצרת על ידי
 * scripts/generate-cinematic-asset.mjs — כל שינוי כאן מחייב עדכון שם ולהפך.
 * כיול חזותי: פתיחת המשחק עם ?cinematicDebug=1 מציגה את הגבולות והאחוזים.
 */

export interface ConsoleRegion {
  /** אחוז מקצה שמאל הפיזי של התמונה (0–100) */
  left: number;
  /** אחוז מהקצה העליון של התמונה (0–100) */
  top: number;
  width: number;
  height: number;
}

/** יחס הרוחב־גובה של תמונת הקונסולה */
export const CONSOLE_ASPECT = 16 / 9;

export const CONSOLE_REGIONS = {
  /** אזור המכשיר שחייב להישאר גלוי גם בחיתוך cover במסכים רחבים */
  safe: { left: 1.5, top: 3, width: 97, height: 94 },
  /** זכוכית המסך הפיזי — התוכן הדינמי מוצג רק בתוכה */
  screen: { left: 10.8, top: 14.5, width: 50.4, height: 63 },
  /** צוהר התצוגה הקטן שמעל המקלדת (קוד / מונה פיקסלים) */
  codeDisplay: { left: 66, top: 20.5, width: 14.6, height: 8 },
  /** שקע המקלדת המספרית שמימין למסך */
  keypad: { left: 66, top: 31.5, width: 14.6, height: 35.5 },
  /** החוגה הפיזית לבחירת רזולוציה */
  dial: { left: 83.2, top: 55.5, width: 8.6, height: 15.28 },
  /** הסמן הקטן שליד החוגה — מציג את הערך הנבחר */
  dialReadout: { left: 82.4, top: 73.5, width: 10.2, height: 5.6 },
  /** עמודת נורות מצב השלבים בדופן השמאלית */
  stepLamps: { left: 3.3, top: 42, width: 2.8, height: 22 },
  /** חריץ מגירת הממצא שמתחת למסך */
  drawer: { left: 18, top: 80.5, width: 30, height: 15 },
} satisfies Record<string, ConsoleRegion>;

/** סגנון מיקום מוחלט לאזור נתון, לשימוש שכבות התוכן שמעל התמונה */
export function regionStyle(region: ConsoleRegion) {
  return {
    position: 'absolute' as const,
    left: `${region.left}%`,
    top: `${region.top}%`,
    width: `${region.width}%`,
    height: `${region.height}%`,
  };
}
