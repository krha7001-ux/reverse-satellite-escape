import { useEffect, useMemo, useRef, useState } from 'react';
import type { StationId } from '../types/game';
import { STATIONS } from '../data/stations';
import { getStationStatus } from '../hooks/useGameState';
import {
  DUST_PARTICLES,
  EFFECT_ANCHORS,
  LEDS_PER_ANCHOR,
} from '../effects/roomEffectsConfig';
import type { EffectAnchor } from '../effects/roomEffectsConfig';

/** מצב חזותי של עוגן תחנה */
type VisualState = 'locked' | 'available' | 'active' | 'solved' | 'completed';

interface RoomEffectsLayerProps {
  solvedStations: StationId[];
  /** התחנה שהחידה שלה פתוחה כרגע */
  openStationId: StationId | null;
  /** חידת הסיום הושלמה — החדר ער במלואו */
  finalCompleted: boolean;
}

/** ערך קודם של prop — לזיהוי מעברים (פתרון, חזרה לחדר) */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/** מיקום מרכז עוגן התחנה באחוזים */
function anchorCenter(anchor: EffectAnchor) {
  return {
    x: anchor.left + anchor.width / 2,
    y: anchor.top + anchor.height / 2,
  };
}

/**
 * שכבת האפקטים של חדר הבקרה.
 * ממוקמת בתוך שכבת ה-pan/zoom (control-room-stage) כך שכל אפקט
 * נשאר צמוד לעצם שלו; pointer-events: none — אינה חוסמת אינטראקציה.
 */
export function RoomEffectsLayer({
  solvedStations,
  openStationId,
  finalCompleted,
}: RoomEffectsLayerProps) {
  // מצב בדיקה לכיול: ?effectsDebug=1
  const debug = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('effectsDebug') === '1',
    [],
  );

  // עצירת אנימציות כשהעמוד אינו גלוי
  const [pageHidden, setPageHidden] = useState(
    typeof document !== 'undefined' && document.hidden,
  );
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // מעברים: תחנה שנפתרה זה עתה + נתיב אור לתחנה הבאה בחזרה לחדר
  const prevSolved = usePrevious(solvedStations);
  const prevOpen = usePrevious(openStationId);
  const [justSolved, setJustSolved] = useState<StationId | null>(null);
  const [unlockPath, setUnlockPath] = useState<{
    from: StationId;
    to: StationId;
  } | null>(null);
  const lastSolvedRef = useRef<StationId | null>(null);
  // הטיימרים נשמרים ב-ref: תלויות ה-effect משתנות בכל רינדור בגלל
  // usePrevious, ולכן cleanup רגיל היה מבטל אותם מיד
  const solvedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pathTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // תחנה נפתרה: פעימת אור ירוקה קצרה (גם אם חלון החידה עדיין פתוח)
  useEffect(() => {
    if (!prevSolved) return;
    const added = solvedStations.find((id) => !prevSolved.includes(id));
    if (!added) return;
    lastSolvedRef.current = added;
    setJustSolved(added);
    clearTimeout(solvedTimerRef.current);
    solvedTimerRef.current = setTimeout(() => setJustSolved(null), 2400);
  }, [solvedStations, prevSolved]);

  // חזרה לחדר אחרי פתרון: מסלול אור מהתחנה שהושלמה אל החדשה + פעימת הכוונה
  useEffect(() => {
    if (prevOpen === undefined || prevOpen === null || openStationId !== null) return;
    const solved = lastSolvedRef.current;
    if (!solved || prevOpen !== solved) return;
    const nextActive = STATIONS.find(
      (s) => getStationStatus(s.id, solvedStations) === 'active',
    );
    if (!nextActive) return;
    lastSolvedRef.current = null;
    setUnlockPath({ from: solved, to: nextActive.id });
    clearTimeout(pathTimerRef.current);
    pathTimerRef.current = setTimeout(() => setUnlockPath(null), 2600);
  }, [openStationId, prevOpen, solvedStations]);

  // ניקוי הטיימרים רק בעת פירוק הרכיב
  useEffect(
    () => () => {
      clearTimeout(solvedTimerRef.current);
      clearTimeout(pathTimerRef.current);
    },
    [],
  );

  const stationState = (stationId: StationId): VisualState => {
    if (justSolved === stationId) return 'solved';
    if (openStationId === stationId) return 'active';
    const status = getStationStatus(stationId, solvedStations);
    if (status === 'solved') return 'completed';
    if (status === 'active') return 'available';
    return 'locked';
  };

  // התעוררות החדר: תאורה עדינה שגוברת עם ההתקדמות
  const wakeLevel = finalCompleted ? 7 : solvedStations.length;

  const pathAnchors =
    unlockPath &&
    (() => {
      const from = EFFECT_ANCHORS.find((a) => a.stationId === unlockPath.from);
      const to = EFFECT_ANCHORS.find((a) => a.stationId === unlockPath.to);
      return from && to ? { from: anchorCenter(from), to: anchorCenter(to) } : null;
    })();

  return (
    <div
      className={`room-effects${debug ? ' effects-debug' : ''}${
        pageHidden ? ' paused' : ''
      }`}
      data-wake-level={wakeLevel}
      aria-hidden="true"
    >
      {/* תאורת התעוררות הדרגתית של החדר */}
      <div
        className="room-wake"
        style={{ opacity: 0.035 * wakeLevel }}
      />

      {/* הבהוב אלקטרוני נדיר ועדין */}
      <div className="room-flicker" />

      {EFFECT_ANCHORS.map((anchor) => {
        const state = anchor.stationId ? stationState(anchor.stationId) : null;
        return (
          <div
            key={anchor.id}
            className={`effect-anchor effect-${anchor.effect}${
              state ? ` state-${state}` : ''
            }`}
            style={{
              left: `${anchor.left}%`,
              top: `${anchor.top}%`,
              width: `${anchor.width}%`,
              height: `${anchor.height}%`,
              transformOrigin: anchor.transformOrigin,
              zIndex: anchor.zIndex,
            }}
            data-anchor-id={anchor.id}
          >
            {/* מסכים: קווי סריקה + אור כחול נע */}
            {(anchor.effect === 'screen' || anchor.effect === 'console') && (
              <>
                <div className="fx-scanlines" />
                <div className="fx-screen-sweep" />
              </>
            )}

            {/* נורות LED מהבהבות בלוחות הבקרה */}
            {(anchor.effect === 'screen' ||
              anchor.effect === 'console' ||
              anchor.effect === 'cabinet' ||
              anchor.effect === 'vault') &&
              Array.from({ length: LEDS_PER_ANCHOR }, (_, i) => (
                <span
                  key={i}
                  className={`fx-led led-${i}${anchor.effect === 'vault' ? ' amber' : ''}`}
                />
              ))}

            {/* ארון: זוהר פנימי עדין */}
            {anchor.effect === 'cabinet' && <div className="fx-cabinet-glow" />}

            {/* הלוויין: נצנוץ החזר אור איטי */}
            {anchor.effect === 'satellite' && <div className="fx-sat-glint" />}

            {/* תקרה: חלקיקי אבק באור */}
            {anchor.effect === 'ceiling' &&
              Array.from({ length: DUST_PARTICLES }, (_, i) => (
                <span key={i} className={`fx-dust dust-${i}`} />
              ))}

            {/* רצפה: השתקפות תאורה שמתחזקת עם ההתקדמות */}
            {anchor.effect === 'floor' && (
              <div
                className="fx-floor-glow"
                style={{ opacity: 0.05 + wakeLevel * 0.03 }}
              />
            )}

            {/* אפקטי מצב תחנה */}
            {state === 'available' && <div className="fx-available-glow" />}
            {state === 'active' && (
              <>
                <div className="fx-open-flash" />
                <div className="fx-click-ring" />
              </>
            )}
            {state === 'solved' && <div className="fx-solved-pulse" />}
            {state === 'completed' && <div className="fx-completed-light" />}
            {unlockPath?.to === anchor.stationId && (
              <div className="fx-guide-pulse" />
            )}

            {/* מצב כיול */}
            {debug && (
              <>
                <span className="debug-label">{anchor.id}</span>
                <span className="debug-origin" />
              </>
            )}
          </div>
        );
      })}

      {/* מסלול אור קצר מהתחנה שהושלמה אל התחנה החדשה */}
      {pathAnchors && (
        <svg className="fx-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line
            x1={pathAnchors.from.x}
            y1={pathAnchors.from.y}
            x2={pathAnchors.to.x}
            y2={pathAnchors.to.y}
            className="fx-path-line"
          />
        </svg>
      )}
    </div>
  );
}
