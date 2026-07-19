/** גודל תמונת המקור בפיקסלים */
export const SOURCE_SIZE = 256;

/**
 * מצייר תצלום אווירי בדיוני של תחנת מחקר על קנבס 256×256:
 * מבנים, דרכים, עצים, צלחת תקשורת — וסימון משולש קטן על אחד הגגות.
 * הכול מצויר בקוד, ללא תמונה חיצונית.
 */
export function drawAerialScene(ctx: CanvasRenderingContext2D) {
  const S = SOURCE_SIZE;

  // קרקע
  const ground = ctx.createLinearGradient(0, 0, S, S);
  ground.addColorStop(0, '#5a6b41');
  ground.addColorStop(1, '#4c5c38');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, S, S);

  // כתמי צמחייה וקרקע חשופה
  const patches: Array<[number, number, number, number, string]> = [
    [30, 90, 46, 26, '#51643c'],
    [200, 30, 40, 24, '#61724a'],
    [130, 220, 56, 24, '#556747'],
    [220, 200, 30, 20, '#6b7451'],
    [10, 10, 40, 22, '#617048'],
  ];
  for (const [x, y, rx, ry, color] of patches) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // דרכים: ראשית אופקית ומשנית אנכית
  ctx.fillStyle = '#8b8b82';
  ctx.fillRect(0, 146, S, 24);
  ctx.fillRect(102, 0, 20, S);
  // שולי דרך
  ctx.fillStyle = '#75756d';
  ctx.fillRect(0, 144, S, 2);
  ctx.fillRect(0, 170, S, 2);
  // קו הפרדה מקווקו
  ctx.strokeStyle = '#d9d9cd';
  ctx.lineWidth = 2;
  ctx.setLineDash([9, 9]);
  ctx.beginPath();
  ctx.moveTo(0, 158);
  ctx.lineTo(S, 158);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(112, 0);
  ctx.lineTo(112, S);
  ctx.stroke();
  ctx.setLineDash([]);

  // מבנה עזר לציור בניין עם צל וגג
  const building = (
    x: number,
    y: number,
    w: number,
    h: number,
    wall: string,
    roof: string,
  ) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(x + 4, y + 4, w, h);
    ctx.fillStyle = wall;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = roof;
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
  };

  // מבני התחנה
  building(26, 34, 62, 46, '#6f7b92', '#828ea6'); // מעבדה ראשית
  building(148, 42, 58, 42, '#88919f', '#9aa4b4'); // מבנה התצפית — עם הסימון
  building(158, 188, 54, 34, '#67727f', '#78838f'); // מחסן
  building(34, 194, 32, 24, '#7f8873', '#8f9884'); // ביתן קטן

  // משטח חנייה ליד המעבדה
  ctx.fillStyle = '#7d7d75';
  ctx.fillRect(30, 96, 44, 30);
  ctx.strokeStyle = '#b9b9ad';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(38 + i * 12, 100);
    ctx.lineTo(38 + i * 12, 122);
    ctx.stroke();
  }

  // צלחת תקשורת עגולה
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.arc(224, 116, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cfd4d6';
  ctx.beginPath();
  ctx.arc(221, 113, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9aa2a6';
  ctx.beginPath();
  ctx.arc(221, 113, 6, 0, Math.PI * 2);
  ctx.fill();

  // עצים
  const trees: Array<[number, number, number]> = [
    [16, 130, 8], [58, 136, 7], [88, 96, 6], [140, 20, 8],
    [232, 60, 7], [244, 150, 8], [136, 130, 6], [20, 236, 8],
    [100, 236, 7], [236, 236, 8], [130, 96, 5], [214, 20, 6],
  ];
  for (const [x, y, r] of trees) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f4d2a';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3e6335';
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  // הסימון: משולש ענברי קטן על גג מבנה התצפית.
  // גודלו כוון כך שברזולוציית 8/16 הוא נבלע בממוצע עם צבע הגג,
  // ב-32 הוא מופיע ככתם ענברי מזוהה, וב-64 צורתו ברורה.
  ctx.fillStyle = '#ffb62e';
  ctx.strokeStyle = '#7a4c00';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(177, 55);
  ctx.lineTo(186, 72);
  ctx.lineTo(168, 72);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
