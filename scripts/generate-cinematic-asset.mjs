/**
 * מחולל תמונת הקונסולה הקולנועית של חידה 1 („התצלום האחרון”).
 *
 * מצייר קונסולת מתכת כהה בסגנון פוטוריאליסטי — מסך, מקלדת מספרית, חוגה,
 * נורות חיווי, פתחי אוורור וברגים — ושומר אותה אל:
 *   public/assets/cinematic/station-01-last-photo.png
 *
 * חשוב: מיקומי האזורים הפונקציונליים חייבים להתאים ל-
 *   src/puzzles/cinematic/consoleLayout.ts  (CONSOLE_REGIONS)
 * כיול חזותי: ?cinematicDebug=1 במשחק מציג את הגבולות.
 *
 * הרצה:  node scripts/generate-cinematic-asset.mjs
 * דרישות: חבילת playwright זמינה (NODE_PATH) ודפדפן Chromium.
 */
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const W = 1792;
const H = 1008;

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../public/assets/cinematic/station-01-last-photo.png',
);

// האזורים הפונקציונליים בפיקסלים — נגזרים מהאחוזים שב-consoleLayout.ts
const pct = (l, t, w, h) => ({
  x: (l / 100) * W,
  y: (t / 100) * H,
  w: (w / 100) * W,
  h: (h / 100) * H,
});
const REGIONS = {
  screen: pct(10.8, 14.5, 50.4, 63),
  codeDisplay: pct(66, 20.5, 14.6, 8),
  keypad: pct(66, 31.5, 14.6, 35.5),
  dial: pct(83.2, 55.5, 8.6, 15.28),
  dialReadout: pct(82.4, 73.5, 10.2, 5.6),
  stepLamps: pct(3.3, 42, 2.8, 22),
  drawer: pct(18, 80.5, 30, 15),
};

const DRAW_SCRIPT = `
const W = ${W}, H = ${H};
const R = ${JSON.stringify(REGIONS)};
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

/* --- עזרים --- */
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function lg(x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
function rg(x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
// מחולל אקראי דטרמיניסטי — אותה תמונה בכל הרצה
let seed = 20260720;
function rnd() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

/* --- רקע החדר: כחול-אפור עמוק, לא ממוקד --- */
ctx.fillStyle = lg(0, 0, 0, H, [[0, '#1b2430'], [0.55, '#121820'], [1, '#0a0d12']]);
ctx.fillRect(0, 0, W, H);
for (let i = 0; i < 9; i++) {
  const x = rnd() * W, y = rnd() * H * 0.7, r = 120 + rnd() * 320;
  ctx.fillStyle = rg(x, y, 0, r, [
    [0, 'rgba(70,110,150,' + (0.05 + rnd() * 0.05).toFixed(3) + ')'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/* --- גוף הקונסולה --- */
const BX = 24, BY = 30, BW = W - 48, BH = H - 60, BR = 30;

// צל חיצוני
ctx.save();
ctx.shadowColor = 'rgba(0,0,0,0.85)';
ctx.shadowBlur = 60;
ctx.shadowOffsetY = 22;
rr(BX, BY, BW, BH, BR);
ctx.fillStyle = '#101318';
ctx.fill();
ctx.restore();

// מתכת גרפיט עם גרדיאנט אנכי
rr(BX, BY, BW, BH, BR);
ctx.fillStyle = lg(0, BY, 0, BY + BH, [
  [0, '#434a56'], [0.12, '#3a414c'], [0.55, '#2a2f38'], [1, '#1c2027'],
]);
ctx.fill();

// טקסטורת מתכת מוברשת — קווים אופקיים דקים
ctx.save();
rr(BX, BY, BW, BH, BR);
ctx.clip();
ctx.globalAlpha = 0.05;
for (let y = BY; y < BY + BH; y += 2) {
  const v = 200 + Math.floor(rnd() * 55);
  ctx.fillStyle = 'rgb(' + v + ',' + (v + 4) + ',' + (v + 10) + ')';
  ctx.fillRect(BX, y, BW, 1);
}
ctx.globalAlpha = 1;

// תאורת חלל: קריר משמאל-מעלה, כתום עדין מימין-מטה
ctx.fillStyle = rg(W * 0.22, H * 0.06, 0, W * 0.75, [
  [0, 'rgba(150,195,235,0.17)'], [1, 'rgba(0,0,0,0)'],
]);
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = rg(W * 0.94, H * 0.94, 0, W * 0.5, [
  [0, 'rgba(240,168,66,0.08)'], [1, 'rgba(0,0,0,0)'],
]);
ctx.fillRect(0, 0, W, H);

// שריטות דקות אקראיות
ctx.globalAlpha = 0.06;
for (let i = 0; i < 26; i++) {
  const x = BX + rnd() * BW, y = BY + rnd() * BH;
  const len = 12 + rnd() * 70, a = rnd() * Math.PI;
  ctx.strokeStyle = rnd() > 0.5 ? '#cfd6de' : '#05070a';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
  ctx.stroke();
}
ctx.globalAlpha = 1;
ctx.restore();

// פס אור עליון (rim light) וקצה תחתון כהה
rr(BX, BY, BW, BH, BR);
ctx.strokeStyle = 'rgba(200,222,245,0.35)';
ctx.lineWidth = 1.6;
ctx.stroke();
rr(BX + 1.5, BY + 1.5, BW - 3, BH - 3, BR - 1);
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.lineWidth = 1;
ctx.stroke();

// לוח פנימי שקוע — bevel עדין
const IX = BX + 18, IY = BY + 18, IW = BW - 36, IH = BH - 36;
rr(IX, IY, IW, IH, 20);
ctx.fillStyle = lg(0, IY, 0, IY + IH, [
  [0, '#333944'], [0.5, '#282d36'], [1, '#1d2129'],
]);
ctx.fill();
rr(IX, IY, IW, IH, 20);
ctx.strokeStyle = 'rgba(0,0,0,0.55)';
ctx.lineWidth = 2;
ctx.stroke();
rr(IX, IY + 1.5, IW, IH, 20);
ctx.strokeStyle = 'rgba(200,220,240,0.07)';
ctx.lineWidth = 1;
ctx.stroke();

/* --- ברגים --- */
function screw(x, y, r) {
  ctx.fillStyle = rg(x - r * 0.3, y - r * 0.3, 0, r * 1.6, [
    [0, '#5a6270'], [0.55, '#2a2f37'], [1, '#14171c'],
  ]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.65)';
  ctx.lineWidth = 1;
  ctx.stroke();
  const a = rnd() * Math.PI;
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = r * 0.22;
  ctx.beginPath();
  ctx.moveTo(x - Math.cos(a) * r * 0.62, y - Math.sin(a) * r * 0.62);
  ctx.lineTo(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62);
  ctx.stroke();
}
for (const [sx, sy] of [
  [BX + 34, BY + 34], [BX + BW - 34, BY + 34],
  [BX + 34, BY + BH - 34], [BX + BW - 34, BY + BH - 34],
  [W * 0.5, BY + 34], [W * 0.5, BY + BH - 30],
]) screw(sx, sy, 8);

/* --- פתחי אוורור --- */
function vents(x, y, w, count, gap, slotH) {
  for (let i = 0; i < count; i++) {
    const yy = y + i * gap;
    rr(x, yy, w, slotH, slotH / 2);
    ctx.fillStyle = lg(0, yy, 0, yy + slotH, [[0, '#07090c'], [1, '#101319']]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,220,240,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 3, yy + slotH + 0.5);
    ctx.lineTo(x + w - 3, yy + slotH + 0.5);
    ctx.stroke();
  }
}
vents(60, 118, 106, 8, 22, 9);           // דופן שמאל עליון
vents(W - 150, 118, 92, 7, 22, 9);       // דופן ימין עליון

/* --- אשכול נוריות דקורטיבי (דופן שמאל) --- */
for (let col = 0; col < 2; col++) {
  for (let row = 0; row < 3; row++) {
    const x = 72 + col * 30, y = 336 + row * 26;
    ctx.fillStyle = rg(x, y, 0, 9, [
      [0, 'rgba(255,205,120,0.95)'], [0.4, 'rgba(240,168,66,0.75)'], [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffdda0';
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* --- שקעי נורות מצב השלבים (הנורות עצמן מוצגות בשכבת התוכן) --- */
{
  const { x, y, w, h } = R.stepLamps;
  const cx = x + w / 2;
  rr(x - 8, y - 12, w + 16, h + 24, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const cy = y + (h / 4) * (i + 0.5);
    const r = w * 0.46;
    ctx.fillStyle = rg(cx, cy, 0, r * 1.5, [
      [0, 'rgba(0,0,0,0.8)'], [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,200,220,0.16)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/* --- מכלול המסך --- */
{
  const { x, y, w, h } = R.screen;
  // מסגרת שקועה
  rr(x - 24, y - 24, w + 48, h + 48, 20);
  ctx.fillStyle = lg(0, y - 24, 0, y + h + 24, [
    [0, '#191d24'], [0.5, '#22262e'], [1, '#12151a'],
  ]);
  ctx.fill();
  // צל שקע (AO) סביב המסגרת
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 26;
  rr(x - 24, y - 24, w + 48, h + 48, 20);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  // קצה מסגרת מלוטש
  rr(x - 24, y - 24, w + 48, h + 48, 20);
  ctx.strokeStyle = 'rgba(170,195,225,0.14)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // זכוכית המסך — כמעט שחורה עם נשימה כחולה
  rr(x, y, w, h, 10);
  ctx.fillStyle = lg(0, y, 0, y + h, [
    [0, '#0a121c'], [0.5, '#060b12'], [1, '#04070c'],
  ]);
  ctx.fill();
  ctx.save();
  rr(x, y, w, h, 10);
  ctx.clip();
  // הדהוד תאורה פנימי
  ctx.fillStyle = rg(x + w * 0.5, y + h * 1.15, 0, h, [
    [0, 'rgba(45,212,200,0.06)'], [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillRect(x, y, w, h);
  // פס השתקפות אלכסוני עדין
  ctx.fillStyle = lg(x, y, x + w * 0.5, y + h, [
    [0, 'rgba(210,230,255,0.05)'], [0.25, 'rgba(210,230,255,0.015)'], [0.5, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillRect(x, y, w, h);
  // סימוני טלמטריה בשולי הזכוכית — סוגריים בפינות וקווי מידה בצדדים
  ctx.strokeStyle = 'rgba(45,212,200,0.32)';
  ctx.lineWidth = 2;
  const m = 16, L = 30;
  for (const [cx, cy, dx, dy] of [
    [x + m, y + m, 1, 1], [x + w - m, y + m, -1, 1],
    [x + m, y + h - m, 1, -1], [x + w - m, y + h - m, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * L, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * L);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(45,212,200,0.18)';
  for (let i = 1; i <= 7; i++) {
    const ty = y + (h / 8) * i;
    for (const tx of [x + 8, x + w - 8]) {
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + (tx < x + w / 2 ? 10 : -10), ty);
      ctx.stroke();
    }
  }
  ctx.restore();
  // אור בזכוכית מלמעלה (inner shadow הפוך)
  rr(x, y, w, h, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // נורית הפעלה כחולה בפינת המסגרת העליונה
  const px = x - 2, py = y - 40;
  ctx.fillStyle = rg(px, py, 0, 12, [
    [0, 'rgba(120,200,255,0.95)'], [0.4, 'rgba(60,140,220,0.6)'], [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillRect(px - 12, py - 12, 24, 24);
  ctx.fillStyle = '#bfe4ff';
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fill();
}

/* --- צוהר התצוגה (LCD) מעל המקלדת --- */
function recessedWindow(x, y, w, h, tint) {
  rr(x - 8, y - 8, w + 16, h + 16, 10);
  ctx.fillStyle = lg(0, y - 8, 0, y + h + 8, [[0, '#0c0e12'], [1, '#14171d']]);
  ctx.fill();
  rr(x - 8, y - 8, w + 16, h + 16, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  rr(x, y, w, h, 6);
  ctx.fillStyle = lg(0, y, 0, y + h, [[0, tint[0]], [1, tint[1]]]);
  ctx.fill();
  rr(x, y, w, h, 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 3;
  ctx.stroke();
  rr(x + 1, y + 1, w - 2, h - 2, 5);
  ctx.strokeStyle = 'rgba(200,220,240,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();
}
recessedWindow(R.codeDisplay.x, R.codeDisplay.y, R.codeDisplay.w, R.codeDisplay.h, ['#171307', '#0c0a04']);
recessedWindow(R.dialReadout.x, R.dialReadout.y, R.dialReadout.w, R.dialReadout.h, ['#0a1512', '#060d0b']);

/* --- שקע המקלדת עם רמזי מקשים --- */
{
  const { x, y, w, h } = R.keypad;
  rr(x - 12, y - 12, w + 24, h + 24, 14);
  ctx.fillStyle = lg(0, y - 12, 0, y + h + 12, [[0, '#171b21'], [1, '#20242c']]);
  ctx.fill();
  rr(x - 12, y - 12, w + 24, h + 24, 14);
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  rr(x - 12, y - 11, w + 24, h + 24, 14);
  ctx.strokeStyle = 'rgba(200,220,240,0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // רמזי שקעים למקשים — בדיוק ברשת של שכבת המקשים (padding 5.5% רוחב, gap 4.5%/5.5%)
  const pad = w * 0.055;
  const colGap = w * 0.055, rowGap = h * 0.045;
  const keyW = (w - pad * 2 - colGap * 2) / 3;
  const keyH = (h - pad * 2 - rowGap * 3) / 4;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const kx = x + pad + col * (keyW + colGap);
      const ky = y + pad + row * (keyH + rowGap);
      rr(kx + 2, ky + 2, keyW - 4, keyH - 4, 8);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();
    }
  }
}

/* --- החוגה --- */
{
  const { x, y, w } = R.dial;
  const cx = x + w / 2, cy = y + w / 2, r = w / 2;
  // שקע AO
  ctx.fillStyle = rg(cx, cy, r * 0.5, r * 1.45, [
    [0, 'rgba(0,0,0,0)'], [0.7, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.45, 0, Math.PI * 2);
  ctx.fill();
  // טבעת בסיס
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = lg(0, cy - r, 0, cy + r, [[0, '#4a515c'], [0.5, '#2b3038'], [1, '#181c22']]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // גוף החוגה (הידית האינטראקטיבית מוצגת בשכבת התוכן באותו מקום)
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = rg(cx - r * 0.3, cy - r * 0.35, 0, r * 1.5, [
    [0, '#5b6370'], [0.5, '#333944'], [0.82, '#1e222a'], [1, '#12151a'],
  ]);
  ctx.fill();
  // ליטוש רדיאלי
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    ctx.strokeStyle = i % 2 ? '#dfe6ee' : '#05070a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3);
    ctx.lineTo(cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82);
    ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(190,215,240,0.14)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

/* --- חריץ מגירת הממצא --- */
{
  const { x, y, w, h } = R.drawer;
  // קו חריץ עליון
  rr(x, y, w, 4, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 5.5);
  ctx.lineTo(x + w - 2, y + 5.5);
  ctx.stroke();
  // חריצים אנכיים בצדדים
  for (const sx of [x, x + w]) {
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, y + 2);
    ctx.lineTo(sx, y + h * 0.82);
    ctx.stroke();
  }
  // חריץ אחיזה במרכז
  rr(x + w / 2 - 40, y + h * 0.62, 80, 10, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fill();
}

/* --- פסי חיווי תחתונים מימין --- */
{
  const y0 = H * 0.86;
  for (let i = 0; i < 3; i++) {
    rr(W * 0.68 + i * 64, y0, 44, 10, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
  }
}

/* --- גרעון פילם + וינייטה --- */
ctx.globalAlpha = 0.05;
for (let i = 0; i < 4200; i++) {
  const x = rnd() * W, y = rnd() * H;
  const v = Math.floor(rnd() * 255);
  ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
  ctx.fillRect(x, y, 1.1, 1.1);
}
ctx.globalAlpha = 1;
ctx.fillStyle = rg(W * 0.5, H * 0.46, H * 0.35, H * 0.95, [
  [0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.3)'],
]);
ctx.fillRect(0, 0, W, H);

window.__dataUrl = canvas.toDataURL('image/png');
`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
});
const page = await browser.newPage();
await page.setContent(
  `<canvas id="c" width="${W}" height="${H}"></canvas><script>${DRAW_SCRIPT}</script>`,
);
await page.waitForFunction('typeof window.__dataUrl === "string"');
const dataUrl = await page.evaluate('window.__dataUrl');
await browser.close();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log('נשמר:', OUT);
