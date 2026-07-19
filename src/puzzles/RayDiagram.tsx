import type { OpticalElement } from '../data/cameraPuzzle';

/** ממדי הדיאגרמה (viewBox) */
export const DIAGRAM_W = 640;
export const DIAGRAM_H = 260;
/** ציר אופטי אנכי (מרכז) */
const AXIS_Y = 130;
/** מיקום הרכיב האופטי */
export const LENS_X = 250;
/** קצה הדיאגרמה שאליו נמשכות הקרניים */
const END_X = 620;
/** קנה מידה: פיקסלים לס"מ */
export const PX_PER_CM = 10;

/** היסטי הקרניים המקבילות מהציר */
const RAY_OFFSETS = [-56, -28, 0, 28, 56];

interface RayDiagramProps {
  /** הרכיב המוצב במסלול האור (null = מסלול ריק עם חריץ הצבה) */
  element: OpticalElement | null;
  /** מרחק מיקוד בפיקסלים (לעדשה קמורה) */
  focalPx?: number;
  /** הצגת חיישן במרחק נתון מהעדשה (בפיקסלים) */
  sensorPx?: number;
  /** תווית לחיישן */
  sensorLabel?: string;
  /** אנימציית ציור קרניים */
  animate?: boolean;
}

/** נקודות polyline של קרן בודדת לפי הרכיב שבמסלול */
function rayPoints(y0: number, element: OpticalElement | null, focalPx: number): string {
  const start = `10,${y0} ${LENS_X},${y0}`;
  const d = y0 - AXIS_Y;
  switch (element) {
    case null:
      return `${start} ${END_X},${y0}`;
    case 'flat': {
      // הקרניים ממשיכות כמעט באותו כיוון — הסטה מקבילה זעירה
      const shifted = y0 + (d === 0 ? 0 : d > 0 ? 4 : -4);
      return `${start} ${LENS_X + 14},${shifted} ${END_X},${shifted}`;
    }
    case 'concave':
      // התבדרות: הקרן מתרחקת מהציר אחרי העדשה
      return `${start} ${END_X},${AXIS_Y + d * 2.4}`;
    case 'convex': {
      // התכנסות לנקודת המיקוד והמשך בקו ישר מעבר לה
      const yEnd = AXIS_Y + d * (1 - (END_X - LENS_X) / focalPx);
      return `${start} ${END_X},${yEnd}`;
    }
  }
}

/** צורת הרכיב האופטי במיקום LENS_X */
function ElementGlyph({ element }: { element: OpticalElement }) {
  switch (element) {
    case 'flat':
      return (
        <rect
          x={LENS_X - 5}
          y={AXIS_Y - 74}
          width={10}
          height={148}
          rx={3}
          className="glyph-flat"
        />
      );
    case 'concave':
      return (
        <path
          className="glyph-lens"
          d={`M ${LENS_X - 11} ${AXIS_Y - 74}
              Q ${LENS_X} ${AXIS_Y - 58} ${LENS_X + 11} ${AXIS_Y - 74}
              L ${LENS_X + 11} ${AXIS_Y + 74}
              Q ${LENS_X} ${AXIS_Y + 58} ${LENS_X - 11} ${AXIS_Y + 74}
              Z`}
        />
      );
    case 'convex':
      return (
        <ellipse
          className="glyph-lens"
          cx={LENS_X}
          cy={AXIS_Y}
          rx={12}
          ry={76}
        />
      );
  }
}

/**
 * ספסל אופטי: קרני אור מקבילות, רכיב במסלול, ואופציונלית חיישן.
 * הקרניים מחושבות בפועל לפי הרכיב ומרחק המיקוד.
 */
export function RayDiagram({
  element,
  focalPx = 200,
  sensorPx,
  sensorLabel,
  animate = false,
}: RayDiagramProps) {
  const sensorX = sensorPx !== undefined ? LENS_X + sensorPx : null;
  const focusX = element === 'convex' ? LENS_X + focalPx : null;

  return (
    <svg
      className={`ray-diagram${animate ? ' rays-animate' : ''}`}
      viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`}
      role="img"
      aria-label="הדמיית מסלול קרני האור"
    >
      {/* ציר אופטי */}
      <line
        x1={10}
        y1={AXIS_Y}
        x2={END_X}
        y2={AXIS_Y}
        className="optical-axis"
      />

      {/* מקור האור: עצם רחוק */}
      <g className="light-source">
        <circle cx={20} cy={AXIS_Y - 92} r={7} />
        <text x={88} y={AXIS_Y - 88} textAnchor="middle">
          עצם רחוק
        </text>
      </g>

      {/* חריץ הצבה כשאין רכיב */}
      {element === null && (
        <rect
          x={LENS_X - 16}
          y={AXIS_Y - 80}
          width={32}
          height={160}
          rx={8}
          className="bench-slot"
        />
      )}

      {/* קרני האור */}
      {RAY_OFFSETS.map((d) => (
        <polyline
          key={d}
          className="light-ray"
          points={rayPoints(AXIS_Y + d, element, focalPx)}
        />
      ))}

      {/* הרכיב האופטי */}
      {element !== null && <ElementGlyph element={element} />}

      {/* נקודת המיקוד */}
      {focusX !== null && focusX <= END_X && (
        <circle cx={focusX} cy={AXIS_Y} r={5} className="focus-point" />
      )}

      {/* חיישן */}
      {sensorX !== null && (
        <g className="sensor-group">
          <rect x={sensorX - 5} y={AXIS_Y - 62} width={10} height={124} rx={3} />
          {sensorLabel && (
            <text x={sensorX} y={AXIS_Y + 86} textAnchor="middle">
              {sensorLabel}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
