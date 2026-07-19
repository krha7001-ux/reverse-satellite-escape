import { useEffect, useRef, useState } from 'react';
import type { OrbitOutcome } from '../data/orbitPuzzle';
import { ORBIT_ALTITUDE_KM, SPEED_OPTIONS } from '../data/orbitPuzzle';

/** ממדי הסימולציה */
export const SIM_W = 480;
export const SIM_H = 400;
const CX = 240;
const CY = 200;
/** רדיוס כדור הארץ בפיקסלים */
const EARTH_R = 70;
/** רדיוס המסלול ההתחלתי (גובה 500 ק"מ בהדמיה) */
const START_R = 110;
/** קבוע הכבידה של ההדמיה — נבחר כך שמהירות מעגלית תואמת 7,600 מ"ש */
const GM = 900;
/** המהירות המעגלית בפיקסלים ליחידת זמן */
const V_CIRC = Math.sqrt(GM / START_R);
/** מהירות ההדמיה עבור ערך במטרים לשנייה */
const simSpeed = (metersPerSecond: number) =>
  (metersPerSecond / 7600) * V_CIRC;

interface SimState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angleTravelled: number;
  trail: string[];
}

export interface LaunchRequest {
  speed: number;
  /** מזהה רץ — כל שיגור מקבל מספר חדש כדי להפעיל את האנימציה מחדש */
  seq: number;
}

interface OrbitSimProps {
  launch: LaunchRequest | null;
  /** שמירת קווי נתיב מניסיונות קודמים */
  keepTrails?: boolean;
  onFinished?: (speed: number, outcome: OrbitOutcome) => void;
}

/**
 * סימולטור המסלול: אינטגרציה נומרית של כוח הכבידה.
 * ההדמיה מואטת ואינה בקנה מידה אמיתי.
 */
export function OrbitSim({ launch, keepTrails = true, onFinished }: OrbitSimProps) {
  const [running, setRunning] = useState(false);
  const [pos, setPos] = useState({ x: CX, y: CY - START_R, vx: 0, vy: 0 });
  const [trail, setTrail] = useState('');
  const [pastTrails, setPastTrails] = useState<Array<{ points: string; color: string }>>([]);
  const [outcome, setOutcome] = useState<OrbitOutcome | null>(null);
  const simRef = useRef<SimState | null>(null);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!launch) return;
    const option = SPEED_OPTIONS.find((o) => o.value === launch.speed);
    if (!option) return;

    // אתחול: הלוויין בראש המסלול, מהירות משיקה (ימינה)
    const sim: SimState = {
      x: CX,
      y: CY - START_R,
      vx: simSpeed(launch.speed),
      vy: 0,
      angleTravelled: 0,
      trail: [`${CX},${CY - START_R}`],
    };
    simRef.current = sim;
    setOutcome(null);
    setRunning(true);
    setTrail('');
    setPos({ x: sim.x, y: sim.y, vx: sim.vx, vy: sim.vy });

    const finish = (result: OrbitOutcome) => {
      clearInterval(interval);
      setRunning(false);
      setOutcome(result);
      if (keepTrails) {
        setPastTrails((prev) => [
          ...prev.filter((t) => t.color !== option.color),
          { points: sim.trail.join(' '), color: option.color },
        ]);
      }
      onFinishedRef.current?.(launch.speed, result);
    };

    const interval = setInterval(() => {
      // שלושה תת-צעדים של אינטגרציה בכל פריים
      for (let s = 0; s < 3; s++) {
        const dt = 0.35;
        const dx = sim.x - CX;
        const dy = sim.y - CY;
        const r = Math.hypot(dx, dy);
        const a = -GM / (r * r * r);
        sim.vx += a * dx * dt;
        sim.vy += a * dy * dt;
        const prevAngle = Math.atan2(dy, dx);
        sim.x += sim.vx * dt;
        sim.y += sim.vy * dt;
        const newAngle = Math.atan2(sim.y - CY, sim.x - CX);
        let dAngle = newAngle - prevAngle;
        if (dAngle > Math.PI) dAngle -= 2 * Math.PI;
        if (dAngle < -Math.PI) dAngle += 2 * Math.PI;
        sim.angleTravelled += Math.abs(dAngle);
      }
      sim.trail.push(`${Math.round(sim.x)},${Math.round(sim.y)}`);
      if (sim.trail.length > 600) sim.trail.shift();
      setPos({ x: sim.x, y: sim.y, vx: sim.vx, vy: sim.vy });
      setTrail(sim.trail.join(' '));

      const r = Math.hypot(sim.x - CX, sim.y - CY);
      if (r <= EARTH_R + 5) finish(launch.speed === 0 ? 'fall' : 'impact');
      else if (r > 330) finish('escape');
      else if (sim.angleTravelled > Math.PI * 2.3) finish('stable');
    }, 30);

    return () => clearInterval(interval);
  }, [launch, keepTrails]);

  // מד המרחק מפני כדור הארץ, מתורגם לק"מ של ההדמיה
  const r = Math.hypot(pos.x - CX, pos.y - CY);
  const distanceKm = Math.max(
    0,
    Math.round(((r - EARTH_R) / (START_R - EARTH_R)) * ORBIT_ALTITUDE_KM),
  );

  // חיצי כבידה ומהירות
  const gLen = 34;
  const gx = (CX - pos.x) / r;
  const gy = (CY - pos.y) / r;
  const vMag = Math.hypot(pos.vx, pos.vy);
  const vLen = vMag > 0.01 ? 18 + vMag * 8 : 0;
  const vx = vMag > 0.01 ? pos.vx / vMag : 0;
  const vy = vMag > 0.01 ? pos.vy / vMag : 0;

  return (
    <div className="orbit-sim" data-outcome={outcome ?? (running ? 'running' : 'idle')}>
      <svg
        className="orbit-svg"
        viewBox={`0 0 ${SIM_W} ${SIM_H}`}
        role="img"
        aria-label="סימולטור המסלול"
      >
        <defs>
          <marker
            id="arrow-g"
            viewBox="0 0 8 8"
            refX={7}
            refY={4}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 8 4 L 0 8 Z" fill="#e05656" />
          </marker>
          <marker
            id="arrow-v"
            viewBox="0 0 8 8"
            refX={7}
            refY={4}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 8 4 L 0 8 Z" fill="#2dd4c8" />
          </marker>
        </defs>

        {/* כדור הארץ */}
        <circle cx={CX} cy={CY} r={EARTH_R} className="earth-body" />
        <circle cx={CX} cy={CY} r={EARTH_R} className="earth-glow" />
        <text x={CX} y={CY + 5} textAnchor="middle" className="earth-label">
          כדור הארץ
        </text>

        {/* טבעת הגובה ההתחלתי */}
        <circle cx={CX} cy={CY} r={START_R} className="altitude-ring" />

        {/* נתיבי ניסיונות קודמים */}
        {pastTrails.map((t) => (
          <polyline
            key={t.color}
            points={t.points}
            className="orbit-trail past"
            style={{ stroke: t.color }}
          />
        ))}

        {/* הנתיב הנוכחי */}
        {trail && <polyline points={trail} className="orbit-trail current" />}

        {/* חץ הכבידה */}
        <line
          x1={pos.x}
          y1={pos.y}
          x2={pos.x + gx * gLen}
          y2={pos.y + gy * gLen}
          className="gravity-arrow"
          markerEnd="url(#arrow-g)"
        />
        {/* חץ המהירות */}
        {vLen > 0 && (
          <line
            x1={pos.x}
            y1={pos.y}
            x2={pos.x + vx * vLen}
            y2={pos.y + vy * vLen}
            className="velocity-arrow"
            markerEnd="url(#arrow-v)"
          />
        )}

        {/* הלוויין */}
        <g className="orbit-satellite">
          <rect x={pos.x - 7} y={pos.y - 5} width={14} height={10} rx={2} />
          <line x1={pos.x - 12} y1={pos.y} x2={pos.x - 7} y2={pos.y} />
          <line x1={pos.x + 7} y1={pos.y} x2={pos.x + 12} y2={pos.y} />
        </g>

        {/* מקרא החצים — textAnchor=end כדי שהטקסט יימשך ימינה ב-RTL */}
        <g className="orbit-legend">
          <line x1={20} y1={22} x2={48} y2={22} className="gravity-arrow" markerEnd="url(#arrow-g)" />
          <text x={56} y={26} textAnchor="end">כבידה</text>
          <line x1={20} y1={44} x2={48} y2={44} className="velocity-arrow" markerEnd="url(#arrow-v)" />
          <text x={56} y={48} textAnchor="end">מהירות</text>
        </g>
      </svg>

      <div className="power-meter-row">
        <span className="power-meter-label">מרחק מכדור הארץ:</span>
        <div className="power-meter">
          <div
            className="power-meter-fill"
            style={{ width: `${Math.min(100, (distanceKm / (ORBIT_ALTITUDE_KM * 2)) * 100)}%` }}
          />
        </div>
        <span className="power-meter-value">{distanceKm.toLocaleString('he-IL')} ק"מ</span>
      </div>
    </div>
  );
}
