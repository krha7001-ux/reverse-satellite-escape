/**
 * מפת האזורים הפונקציונליים של קונסולת „התצלום האחרון” — באחוזים מגודל
 * תמונת הרקע (16:9). התמונה היא תצלום פוטוריאליסטי של המכשיר בזווית,
 * ולכן המסך מוגדר כמרובע פרספקטיבי (ארבע פינות) ושאר האזורים כמלבנים
 * עם נטייה קלה שמתאימה לפרספקטיבה.
 * כיול חזותי: פתיחת המשחק עם ?cinematicDebug=1 מציגה את הגבולות והאחוזים.
 */

export interface ConsoleRegion {
  /** אחוז מקצה שמאל הפיזי של התמונה (0–100) */
  left: number;
  /** אחוז מהקצה העליון של התמונה (0–100) */
  top: number;
  width: number;
  height: number;
  /** נטייה קלה (במעלות) להתאמה לפרספקטיבת התצלום */
  tilt?: number;
}

/** מרובע פרספקטיבי — ארבע פינות באחוזים מגודל התמונה */
export interface ConsoleQuad {
  tl: [number, number];
  tr: [number, number];
  br: [number, number];
  bl: [number, number];
}

/** יחס הרוחב־גובה של תמונת הקונסולה */
export const CONSOLE_ASPECT = 16 / 9;

/**
 * זכוכית המסך הפיזי בתצלום — מרובע פרספקטיבי. התוכן הדינמי ממופה אליו
 * באמצעות matrix3d ומחליף חזותית את תוכן המסך המצולם.
 * הפינות מורחבות מעט החוצה כדי שהשכבה תכסה את התוכן המצולם במלואו.
 */
export const SCREEN_QUAD: ConsoleQuad = {
  tl: [15.4, 17.0],
  tr: [71.0, 16.0],
  br: [77.4, 64.8],
  bl: [18.9, 77.3],
};

export const CONSOLE_REGIONS = {
  /** אזור המכשיר שחייב להישאר גלוי גם בחיתוך cover במסכים רחבים */
  safe: { left: 5, top: 10.5, width: 85, height: 87 },
  /** צוהר התצוגה הקטן שמעל המקלדת (קוד / מונה פיקסלים) */
  codeDisplay: { left: 74.6, top: 31.6, width: 6.2, height: 4.4, tilt: -7 },
  /** המקלדת הפיזית שמימין למסך (מוגדלת מעט ביחס לתצלום לנוחות שימוש) */
  keypad: { left: 75.35, top: 37.4, width: 9.5, height: 13.5, tilt: -7 },
  /** החוגה הפיזית — מעל הכפתור הסיבובי שבתצלום */
  dial: { left: 80.0, top: 50.9, width: 6.8, height: 12.09 },
  /** הסמן הקטן שליד החוגה — מציג את הערך הנבחר */
  dialReadout: { left: 77.8, top: 64.8, width: 5.6, height: 3.8, tilt: -8 },
  /** עמודת נורות מצב השלבים — בדופן השמאלית, מתחת לנוריות הענבר */
  stepLamps: { left: 15.2, top: 54.2, width: 2.3, height: 13, tilt: 10 },
  /** אזור מגירת הממצא — הסף התחתון של הקונסולה מתחת למסך */
  drawer: { left: 26, top: 77.8, width: 26, height: 12, tilt: -9 },
} satisfies Record<string, ConsoleRegion>;

/** סגנון מיקום מוחלט לאזור נתון, לשימוש שכבות התוכן שמעל התמונה */
export function regionStyle(region: ConsoleRegion) {
  return {
    position: 'absolute' as const,
    left: `${region.left}%`,
    top: `${region.top}%`,
    width: `${region.width}%`,
    height: `${region.height}%`,
    transform: region.tilt ? `rotate(${region.tilt}deg)` : undefined,
  };
}

/* ------------------------------------------------------------------
   הומוגרפיה: העתקת מלבן אל מרובע כללי עבור transform: matrix3d.
   מבוסס על פירוק הטלה פרויקטיבית דו-ממדית לשלוש נקודות בסיס + נקודה רביעית.
   ------------------------------------------------------------------ */

type Mat3 = [number, number, number, number, number, number, number, number, number];

function adjugate(m: Mat3): Mat3 {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
  ];
}

function multiplyMat(a: Mat3, b: Mat3): Mat3 {
  const r = new Array(9).fill(0) as Mat3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) r[3 * i + j] += a[3 * i + k] * b[3 * k + j];
    }
  }
  return r;
}

function multiplyVec(m: Mat3, v: [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

function basisToPoints(
  p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number],
): Mat3 {
  const m: Mat3 = [p1[0], p2[0], p3[0], p1[1], p2[1], p3[1], 1, 1, 1];
  const v = multiplyVec(adjugate(m), [p4[0], p4[1], 1]);
  return multiplyMat(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

/**
 * מחשב matrix3d שממפה אלמנט בגודל width×height (פיקסלים) אל מרובע היעד.
 * פינות היעד בפיקסלים, יחסיות לפינה השמאלית-עליונה של האלמנט.
 * יש להגדיר transform-origin: 0 0 על האלמנט.
 */
export function quadMatrix3d(
  width: number,
  height: number,
  corners: ConsoleQuad,
  originX: number,
  originY: number,
): string {
  const src = basisToPoints([0, 0], [width, 0], [0, height], [width, height]);
  const dst = basisToPoints(
    [corners.tl[0] - originX, corners.tl[1] - originY],
    [corners.tr[0] - originX, corners.tr[1] - originY],
    [corners.bl[0] - originX, corners.bl[1] - originY],
    [corners.br[0] - originX, corners.br[1] - originY],
  );
  const t = multiplyMat(dst, adjugate(src)).map((v) => v) as Mat3;
  for (let i = 0; i < 9; i++) t[i] /= t[8];
  const m = [
    t[0], t[3], 0, t[6],
    t[1], t[4], 0, t[7],
    0, 0, 1, 0,
    t[2], t[5], 0, t[8],
  ];
  return `matrix3d(${m.map((v) => v.toFixed(6)).join(',')})`;
}

/** תיבת הגבולות של מרובע, באחוזים */
export function quadBounds(q: ConsoleQuad): ConsoleRegion {
  const xs = [q.tl[0], q.tr[0], q.br[0], q.bl[0]];
  const ys = [q.tl[1], q.tr[1], q.br[1], q.bl[1]];
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
}

/**
 * סגנון עבור שכבת המסך: ממוקמת בתיבת הגבולות של המרובע וממופה אליו
 * ב-matrix3d לפי גודל הבמה בפיקסלים. ללא גודל במה — מיקום מלבני בלבד.
 */
export function screenQuadStyle(stageWidth: number, stageHeight: number) {
  const bounds = quadBounds(SCREEN_QUAD);
  const base = {
    position: 'absolute' as const,
    left: `${bounds.left}%`,
    top: `${bounds.top}%`,
    width: `${bounds.width}%`,
    height: `${bounds.height}%`,
    transformOrigin: '0 0',
  };
  if (stageWidth <= 0 || stageHeight <= 0) return base;
  const toPx = (p: [number, number]): [number, number] => [
    (p[0] / 100) * stageWidth,
    (p[1] / 100) * stageHeight,
  ];
  const cornersPx: ConsoleQuad = {
    tl: toPx(SCREEN_QUAD.tl),
    tr: toPx(SCREEN_QUAD.tr),
    br: toPx(SCREEN_QUAD.br),
    bl: toPx(SCREEN_QUAD.bl),
  };
  const originX = (bounds.left / 100) * stageWidth;
  const originY = (bounds.top / 100) * stageHeight;
  const w = (bounds.width / 100) * stageWidth;
  const h = (bounds.height / 100) * stageHeight;
  return {
    ...base,
    transform: quadMatrix3d(w, h, cornersPx, originX, originY),
  };
}
