/**
 * בדיקת פריסה אוטומטית: מוודאת שבכל שלבי החידות כפתור הפעולה
 * נגיש (נראה או ניתן להגעה בגלילה), שאין גלילה אופקית ושאין תוכן חתוך.
 *
 * הרצה:  node scripts/layout-check.mjs <baseUrl> [--full]
 *   מצב רגיל — סריקת חידה 1 וההרכבה הסופית בכל הרזולוציות.
 *   ‎--full — פתרון מלא של כל שש החידות וחידת הסיום ב-1280×720.
 * דרישות: חבילת playwright זמינה (NODE_PATH) ודפדפן Chromium.
 */
import { createRequire } from 'module';

// טעינת playwright גם מהתקנה גלובלית (דרך NODE_PATH)
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:4173/reverse-satellite-escape/';
const FULL = process.argv.includes('--full');
const KEY = 'reverse-satellite-escape/game-state/v1';

const RESOLUTIONS = [
  [1920, 1080],
  [1366, 768],
  [1280, 720],
  [1024, 768],
  [768, 1024],
  // שקילות לזום דפדפן 200% על מסך 1366×768
  [683, 384],
];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error('  ❌', msg);
};
const ok = (msg) => console.log('  ✓', msg);

/** מאמת שהאלמנט נגיש: גלילה אליו ואז בדיקת גבולות בתוך אזור התצוגה */
async function assertReachable(page, selector, label) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) return fail(`${label}: לא נמצא (${selector})`);
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  const vp = page.viewportSize();
  if (!box) return fail(`${label}: ללא boundingBox`);
  if (box.y < -2 || box.y + box.height > vp.height + 2 || box.x < -2 || box.x + box.width > vp.width + 2) {
    return fail(`${label}: מחוץ לתצוגה גם אחרי גלילה (${Math.round(box.y)},${Math.round(box.height)})`);
  }
  ok(label);
}

/** בדיקות כלליות לשלב חידה פתוח */
async function checkStep(page, label, actionSelectors) {
  const noHScroll = await page.evaluate(() => {
    const el = document.querySelector('.terminal-step');
    return el ? el.scrollWidth <= el.clientWidth + 1 : true;
  });
  if (!noHScroll) fail(`${label}: גלילה אופקית בתוך השלב`);
  const scrollable = await page.evaluate(() => {
    const el = document.querySelector('.terminal-step');
    if (!el) return true;
    if (el.scrollHeight <= el.clientHeight + 1) return true;
    return getComputedStyle(el).overflowY === 'auto';
  });
  if (!scrollable) fail(`${label}: תוכן גולש ללא אפשרות גלילה (חתוך!)`);
  for (const [sel, name] of actionSelectors) {
    await assertReachable(page, sel, `${label} → ${name}`);
  }
}

async function seed(page, solved, final = false) {
  await page.evaluate(
    ([key, s, f]) => {
      localStorage.setItem(key, JSON.stringify({
        phase: 'playing', teamName: 'בדיקת פריסה', startedAt: Date.now(),
        solvedStations: s, openStation: null, hintsUsed: {}, findings: [],
        muted: true, finalAssembly: { completed: f, remainingSeconds: f ? 1800 : null },
        effectsPlayed: Object.fromEntries(s.map((id) => [id, true])),
      }));
    },
    [KEY, solved, final],
  );
  await page.reload({ waitUntil: 'networkidle' });
}

/** פתיחת התחנה הפעילה: דרך נקודת החדר, ואם חסומה — דרך סרגל התחנות */
async function openActiveStation(page) {
  try {
    await page.click('.hotspot.active', { timeout: 4000 });
  } catch {
    await page.click('.station-button.active');
  }
}

/** מעבר על ארבעת שלבי חידה 1 עם אימות כפתורי הפעולה */
async function sweepPuzzle1(page) {
  await openActiveStation(page);
  // דילוג על אנימציית הכניסה אם מופיעה
  try { await page.click('.skip-entry-button', { timeout: 1600 }); } catch { /* reduced או מהיר */ }
  await page.waitForSelector('.step-boot', { timeout: 4000 });
  await checkStep(page, 'חידה 1 שלב 1', [
    ['.step-boot .step-next', 'התחילו בשחזור'],
    ['.terminal-header .modal-button', 'חזרה לחדר'],
  ]);
  await page.click('.step-boot .step-next');
  await page.waitForSelector('.step-explore');
  await checkStep(page, 'חידה 1 שלב 2', [['.step-explore .step-next', 'עברו למשימה']]);
  await page.click('.step-explore .step-next');
  await page.waitForSelector('.step-mission');
  await page.click('.option-button:has-text("32×32")');
  await page.waitForSelector('.keypad');
  await checkStep(page, 'חידה 1 שלב 3', [
    ['.keypad-display', 'תצוגת הקודן'],
    ['.keypad-key:has-text("9")', 'מקש 9'],
    ['.submit-button', 'שידור לתחנת הקרקע'],
    ['.hint-button', 'רמז'],
  ]);
  for (const d of ['1', '0', '2', '4']) await page.click(`.keypad-key:has-text("${d}")`);
  await page.click('.submit-button');
  await page.waitForSelector('.success-panel', { timeout: 8000 });
  await checkStep(page, 'חידה 1 שלב 4', [
    ['.success-panel .modal-button.primary', 'חזרה לחדר הבקרה'],
  ]);
  await page.click('.success-panel .modal-button.primary');
  await page.waitForTimeout(300);
}

/** ההרכבה הסופית: ארבעת השלבים עם אימות כפתורים */
async function sweepFinal(page) {
  await page.click('.final-hotspot');
  await page.waitForSelector('.step-review');
  await checkStep(page, 'סיום שלב 1', [['.step-review .step-next', 'הפכו את כיוון הפיתוח']]);
  await page.click('.step-review .step-next');
  await page.waitForSelector('.step-chain');
  await checkStep(page, 'סיום שלב 2', [['.chain-status .modal-button.primary', 'בדיקת השרשרת']]);
  // סידור נכון בהחלפות
  const target = ['צורך מקורי', 'החלטה הנדסית', 'עקרונות מדעיים', 'מערכות', 'יכולת', 'תוצר'];
  for (let i = 0; i < 6; i++) {
    const now = await page.locator('.chain-card strong').allTextContents();
    if (now[i] !== target[i]) {
      await page.click(`.chain-card:has(strong:text-is("${target[i]}"))`);
      await page.click(`.chain-card:has(strong:text-is("${now[i]}"))`);
    }
  }
  await page.click('.chain-status .modal-button.primary');
  await page.waitForSelector('.chain-row.solved');
  await page.click('button:has-text("המשיכו לבדיקת המערכות")');
  await page.waitForSelector('.step-systems');
  await checkStep(page, 'סיום שלב 3', [['.relaunch-button', 'הפעלת הלוויין מחדש']]);
  for (let i = 0; i < 5; i++) {
    await page.locator('.system-row:not(.ok) .verify-button').first().click();
  }
  await page.click('.relaunch-button');
  await page.waitForSelector('.step-final-success', { timeout: 25000 });
  await checkStep(page, 'מסך ההצלחה הסופי', [
    ['.final-actions .modal-button.danger', 'משחק חדש'],
  ]);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
});

for (const [w, h] of RESOLUTIONS) {
  console.log(`\n=== ${w}×${h} ===`);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await seed(page, []);
  await sweepPuzzle1(page);
  await seed(page, ['last-photo', 'camera-system', 'transmission-system', 'power-source', 'orbit', 'mission-file']);
  await sweepFinal(page);
  await page.close();
}

if (FULL) {
  console.log('\n=== פתרון מלא 1280×720 ===');
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await seed(page, []);
  const open = async () => {
    await page.click('.hotspot.active');
    try { await page.click('.skip-entry-button', { timeout: 1800 }); } catch { /* מהיר */ }
    await page.waitForSelector('.terminal');
  };
  const done = async () => {
    await page.waitForSelector('.success-panel', { timeout: 20000 });
    await assertReachable(page, '.success-panel .modal-button.primary', 'חזרה לחדר');
    await page.click('.success-panel .modal-button.primary');
    await page.waitForTimeout(2900);
  };
  // חידה 1
  await open();
  await page.click('.step-boot .step-next');
  await page.click('.step-explore .step-next');
  await page.click('.option-button:has-text("32×32")');
  for (const d of ['1', '0', '2', '4']) await page.click(`.keypad-key:has-text("${d}")`);
  await page.click('.submit-button');
  await done();
  ok('חידה 1 נפתרה');
  // חידה 2
  await open();
  await page.click('button:has-text("הפעילו את המעבדה")');
  for (const n of ['זכוכית שטוחה', 'עדשה קעורה', 'עדשה קמורה']) {
    await page.click(`.element-card:has-text("${n}")`);
    await page.waitForTimeout(60);
  }
  await page.click('.step-bench .step-next');
  await page.click('.option-button:has-text("עדשה B")');
  for (const d of ['2', '0']) await page.click(`.keypad-key:has-text("${d}")`);
  await page.click('button:has-text("כיול מערכת הצילום")');
  await done();
  ok('חידה 2 נפתרה');
  // חידה 3
  await open();
  await page.click('button:has-text("הפעילו את ניסוי התקשורת")');
  for (const n of ['רמקול', 'כבל', 'אנטנה']) {
    await page.click(`.element-card:has-text("${n}")`);
    await page.waitForTimeout(60);
  }
  await page.click('.choice-block .option-button:has-text("אנטנה")');
  await page.click('.choice-block .step-next');
  await page.click('.keypad-key:has-text("4")');
  await page.click('button:has-text("שידור התצלום")');
  await done();
  ok('חידה 3 נפתרה');
  // חידה 4
  await open();
  await page.click('button:has-text("הפעילו את מעבדת האנרגיה")');
  await page.waitForSelector('#panel-slider');
  await page.fill('#panel-slider', '1');
  await page.fill('#panel-slider', '2');
  await page.click('.shade-toggle');
  await page.click('.shade-toggle');
  await page.click('.step-solar .step-next');
  await page.waitForSelector('.step-budget');
  await page.fill('#budget-slider', '2');
  await page.click('.keypad-key:has-text("9")');
  await page.click('.keypad-key:has-text("0")');
  await page.click('button:has-text("חיבור המערכות לחשמל")');
  await done();
  ok('חידה 4 נפתרה');
  // חידה 5
  await open();
  await page.click('button:has-text("הפעילו את סימולטור המסלול")');
  const waitOutcome = async (expected, t) => {
    const start = Date.now();
    while (Date.now() - start < t) {
      if ((await page.getAttribute('.orbit-sim', 'data-outcome')) === expected) return;
      await page.waitForTimeout(250);
    }
    throw new Error('timeout ' + expected);
  };
  for (const [s, o] of [['0', 'fall'], ['4,000', 'impact'], ['11,000', 'escape'], ['7,600', 'stable']]) {
    await page.click(`.speed-button:has-text("${s}")`);
    await waitOutcome(o, 25000);
  }
  await page.click('.step-orbit .step-next');
  await page.click('.mission-speeds .speed-button:has-text("7,600")');
  await waitOutcome('stable', 25000);
  for (const d of ['7', '6', '0', '0']) await page.click(`.keypad-key:has-text("${d}")`);
  await page.click('button:has-text("קיבוע נתוני המסלול")');
  await done();
  ok('חידה 5 נפתרה');
  // חידה 6
  await open();
  const cards = page.locator('.step-evidence .evidence-card');
  for (let i = 0; i < 5; i++) await cards.nth(i).click();
  await page.click('.step-evidence .step-next');
  await page.click('.capability-option:has-text("צילום חוזר")');
  await page.click('.step-capability .step-next');
  await page.click('.file-option:has-text("צילום מפורט וחוזר")');
  const ev = page.locator('.evidence-card.small');
  for (const i of [0, 1, 2]) await ev.nth(i).click();
  await page.click('button:has-text("אישור תיק המשימה")');
  await page.waitForSelector('.step-verify');
  await page.click('.keypad-key:has-text("3")');
  await page.click('button:has-text("בדיקת הקוד")');
  await done();
  ok('חידה 6 נפתרה');
  // ההרכבה הסופית
  await sweepFinal(page);
  ok('ההרכבה הסופית הושלמה');
  await page.close();
}

await browser.close();
console.log(failures === 0 ? '\n✅ כל בדיקות הפריסה עברו' : `\n❌ ${failures} כשלים`);
process.exit(failures === 0 ? 0 : 1);
