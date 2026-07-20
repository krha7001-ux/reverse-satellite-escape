import type { ReactElement } from 'react';
import type { StationId } from '../types/game';

/**
 * שלב חזותי של תחנה בשכבת האפקטים:
 * locked / available / entry (אנימציית כניסה) / active (חידה פתוחה) /
 * success (אנימציית הצלחה חד-פעמית בחזרה לחדר) / completed (מצב קבוע).
 */
export type StationPhase =
  | 'locked'
  | 'available'
  | 'entry'
  | 'active'
  | 'success'
  | 'completed';

interface StationEffectProps {
  phase: StationPhase;
}

/* ---------- תחנה 1: התצלום האחרון — מסך + מגירת ממצא ---------- */

export function PhotoStationEffect({ phase }: StationEffectProps) {
  return (
    <div className={`stfx stfx-photo phase-${phase}`}>
      {/* המסך: glitch מבוקר, פס סריקה ופיקסלים מתחדדים בכניסה */}
      <div className="pfx-screen">
        <div className="pfx-glitch g-a" />
        <div className="pfx-glitch g-b" />
        <div className="pfx-scanbar" />
        <div className="pfx-pixels">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={`pfx-pixel px-${i}`} />
          ))}
        </div>
      </div>

      {/* עמדת הבקרה שמתחת למסך: מגירה עם כרטיס הממצא */}
      <div className="pfx-console-zone">
        <div className="pfx-drawer">
          <div className="pfx-drawer-cavity" />
          <div className="pfx-chip">ממצא 1</div>
          <div className="pfx-drawer-front" />
        </div>
        <span className="pfx-done-led" />
      </div>
    </div>
  );
}

/* ---------- תחנה 2: מערכת הצילום — ארון זכוכית, מגש ועדשה ---------- */

export function CameraStationEffect({ phase }: StationEffectProps) {
  return (
    <div className={`stfx stfx-camera phase-${phase}`}>
      <div className="cfx-doors">
        <div className="cfx-door door-right" />
        <div className="cfx-door door-left" />
      </div>
      <div className="cfx-tray">
        <span className="cfx-lens">
          <span className="cfx-lens-ring" />
        </span>
        <span className="cfx-focus-ring" />
        {/* קרני מיקוד מתכנסות */}
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={`cfx-ray ray-${i}`} />
        ))}
      </div>
      <div className="cfx-interior-glow" />
      <span className="cfx-ready-tag">אופטיקה תקינה</span>
    </div>
  );
}

/* ---------- תחנה 3: מערכת השידור — מסך גלים וצלחת ---------- */

export function TransmissionStationEffect({ phase }: StationEffectProps) {
  return (
    <div className={`stfx stfx-dish phase-${phase}`}>
      {/* המסך נדלק משמאל לימין */}
      <div className="dfx-screen-wipe" />
      {/* גלי רדיו קשתיים מהצלחת (הצלחת בתחתית האנכור, מעט שמאלה) */}
      <div className="dfx-arcs">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={`dfx-arc arc-${i}`} />
        ))}
      </div>
      {/* חבילות מידע מהמסך אל הצלחת */}
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} className={`dfx-packet pk-${i}`} />
      ))}
      {/* טבעות שידור כלפי מעלה */}
      <div className="dfx-uplink">
        <span className="dfx-ring r-0" />
        <span className="dfx-ring r-1" />
      </div>
      <span className="dfx-signal-led">SIGNAL</span>
    </div>
  );
}

/* ---------- תחנה 4: מקור הכוח — פאנל סולארי וזרם אנרגיה ---------- */

export function PowerStationEffect({ phase }: StationEffectProps) {
  return (
    <div className={`stfx stfx-power phase-${phase}`}>
      {/* קרן אור חמה אל הפאנל */}
      <div className="wfx-beam" />
      {/* שכבת פאנל: תאים שנדלקים ברצף; בהצלחה נפרשת לשניים */}
      <div className="wfx-panel">
        <div className="wfx-half half-a">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={`wfx-cell c-${i}`} />
          ))}
        </div>
        <div className="wfx-half half-b">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={`wfx-cell c-${i + 4}`} />
          ))}
        </div>
      </div>
      {/* זרם אנרגיה מהפאנל אל הלוח */}
      <svg className="wfx-flow" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 72 62 C 55 70 40 62 28 40" className="wfx-flow-line" />
      </svg>
      {/* מד כוח */}
      <div className="wfx-meter">
        <div className="wfx-meter-fill" />
      </div>
    </div>
  );
}

/* ---------- תחנה 5: המסלול — כדור הארץ ולוויין ---------- */

export function OrbitStationEffect({ phase }: StationEffectProps) {
  return (
    <div className={`stfx stfx-orbit phase-${phase}`}>
      {/* הילת סיבוב עדינה על כדור הארץ */}
      <div className="ofx-earth-spin" />
      {/* מסלול מקווקו (כניסה) ומסלול יציב זוהר (הצלחה) */}
      <span className="ofx-orbit dashed" />
      <span className="ofx-orbit solid" />
      {/* הלוויין הקטן נע במסלול */}
      <div className="ofx-carrier">
        <span className="ofx-sat-dot" />
      </div>
      <span className="ofx-speed">7,600 m/s</span>
      <div className="ofx-lock-flash" />
    </div>
  );
}

/* ---------- תחנה 6: תיק המשימה — דלת כספת נפתחת ---------- */

export function VaultStationEffect({ phase }: StationEffectProps) {
  return (
    <div className={`stfx stfx-vault phase-${phase}`}>
      {/* החלל הפנימי הכהה מאחורי הדלת */}
      <div className="vfx-cavity">
        <div className="vfx-cavity-glow" />
        <div className="vfx-case">
          <span className="vfx-case-handle" />
          <span className="vfx-stamp">משימה שוחזרה</span>
          <span className="vfx-need">הצורך המקורי</span>
        </div>
      </div>
      {/* שכבת הדלת: משתלבת בדלת שבתמונה כשהיא סגורה */}
      <div className="vfx-door">
        <div className="vfx-window" />
        <div className="vfx-wheel">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className={`vfx-spoke sp-${i}`} />
          ))}
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={`vfx-bolt b-${i}`} />
        ))}
        <div className="vfx-hinge" />
      </div>
      <div className="vfx-success-pulse" />
    </div>
  );
}

/* ---------- הלוויין התלוי: מצב לפי ההתקדמות הכוללת ---------- */

export function SatelliteProgressEffect({
  level,
  finalCompleted,
}: {
  /** מספר התחנות שהושלמו 0-6 */
  level: number;
  finalCompleted: boolean;
}) {
  return (
    <div
      className={`stfx stfx-satellite sat-level-${finalCompleted ? 7 : level}`}
    >
      {/* עדשת המצלמה (מהבהבת מ-1, טבעת מ-2) */}
      <span className="sfx-lens" />
      <span className="sfx-lens-ring" />
      {/* סמל שידור (מ-3) */}
      <span className="sfx-antenna" />
      {/* אור כחול על הפאנלים (מ-4) */}
      <span className="sfx-panel p-right" />
      <span className="sfx-panel p-left" />
      {/* קו מסלול קטן (מ-5) */}
      <span className="sfx-orbit-line" />
      {/* אלומת שידור קצרה (אחרי ההרכבה הסופית) */}
      <span className="sfx-beam" />
    </div>
  );
}

/** מיפוי רכיב האפקט לכל תחנה */
export const STATION_EFFECTS: Record<
  StationId,
  (props: StationEffectProps) => ReactElement
> = {
  'last-photo': PhotoStationEffect,
  'camera-system': CameraStationEffect,
  'transmission-system': TransmissionStationEffect,
  'power-source': PowerStationEffect,
  'orbit': OrbitStationEffect,
  'mission-file': VaultStationEffect,
};
