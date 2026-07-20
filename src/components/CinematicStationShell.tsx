import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { ConsoleRegion } from '../puzzles/cinematic/consoleLayout';

/** גודל הבמה בפיקסלים — לשכבות שזקוקות לחישובי פרספקטיבה (matrix3d) */
export const CineStageSizeContext = createContext<{ width: number; height: number }>({
  width: 0,
  height: 0,
});

/**
 * מעטפת קולנועית לחידות: תמונת מכשיר פוטוריאליסטית ביחס 16:9,
 * עם שכבות תוכן ממוקמות באחוזים מעל אזורי המכשיר.
 *
 * התנהגות גודל:
 * - מסך רחב מהתמונה — cover: התמונה ממלאת את הרוחב ונחתכת אנכית,
 *   אך רק עד הגבול שבו אזור המכשיר (safe) נשאר גלוי במלואו.
 * - מסך צר מהתמונה — contain על רקע כהה; אם הבמה גבוהה מהאזור,
 *   כל אזור החידה נגלל אנכית (overflow-y: auto) והפעולה הראשית דביקה בתחתית.
 *
 * אפקטים: זום כניסה 1.06→1 בכ-900ms, parallax עדין בעקבות הסמן,
 * תאורה והשתקפות זכוכית. כולם כבויים תחת prefers-reduced-motion.
 *
 * ‎?cinematicDebug=1 מציג שכבת כיול: גבולות אזורים, אחוזים ומתגי שכבות.
 */

interface CinematicStationShellProps {
  imageUrl: string;
  aspect: number;
  /** האזור בתמונה שאסור שייחתך בחיתוך cover */
  safe: ConsoleRegion;
  ariaTitle: string;
  /** רצועת ההוראות הצרה (זכוכית) — דביקה למעלה, אינה מכסה את המכשיר */
  topStrip?: ReactNode;
  /** סרגל הפעולה הראשי — דביק לתחתית אזור הגלילה */
  bottomBar?: ReactNode;
  /** אזורים להצגה במצב הכיול */
  debugRegions?: Record<string, ConsoleRegion>;
  /** שכבות התוכן שמעל התמונה, ממוקמות באחוזים */
  children: ReactNode;
}

/** האם המשתמש ביקש להפחית תנועה */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** האם מצב הכיול פעיל (?cinematicDebug=1) */
export function isCinematicDebug(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('cinematicDebug') === '1';
}

interface StageBox {
  width: number;
  height: number;
  /** כמה מהבמה חתוך מלמעלה במצב cover (px) */
  cropTop: number;
  /** גובה חלון החיתוך (px) */
  viewHeight: number;
}

/** חישוב גודל הבמה לפי גודל האזור הזמין, יחס התמונה ואזור המכשיר */
function computeStage(
  availW: number,
  availH: number,
  aspect: number,
  safe: ConsoleRegion,
): StageBox {
  if (availW <= 0 || availH <= 0) {
    return { width: 0, height: 0, cropTop: 0, viewHeight: 0 };
  }
  const wide = availW / availH >= aspect;
  if (!wide) {
    // מסך צר: contain לרוחב; במה גבוהה מהאזור נגללת אנכית
    const width = availW;
    const height = width / aspect;
    return { width, height, cropTop: 0, viewHeight: height };
  }
  // מסך רחב: cover עד הגבול שבו אזור המכשיר נשאר גלוי
  const topMargin = safe.top / 100;
  const bottomMargin = 1 - (safe.top + safe.height) / 100;
  const cropAllowance = 2 * Math.min(topMargin, bottomMargin);
  const coverHeight = availW / aspect;
  const maxHeight = availH / (1 - cropAllowance);
  const height = Math.min(coverHeight, maxHeight);
  const width = height * aspect;
  const viewHeight = Math.min(height, availH);
  const cropTop = (height - viewHeight) / 2;
  return { width, height, cropTop, viewHeight };
}

export function CinematicStationShell({
  imageUrl,
  aspect,
  safe,
  ariaTitle,
  topStrip,
  bottomBar,
  debugRegions,
  children,
}: CinematicStationShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<StageBox>({
    width: 0,
    height: 0,
    cropTop: 0,
    viewHeight: 0,
  });
  const debug = isCinematicDebug();
  const [showImage, setShowImage] = useState(true);
  const [showLighting, setShowLighting] = useState(true);
  const [showContent, setShowContent] = useState(true);

  // מדידת האזור הזמין וחישוב גודל הבמה בכל שינוי גודל
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () =>
      setStage(computeStage(el.clientWidth, el.clientHeight, aspect, safe));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [aspect, safe]);

  // parallax עדין בעקבות הסמן — דרך משתני CSS, מרוסן ב-rAF
  const rafRef = useRef(0);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (prefersReducedMotion()) return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = Math.min(1, Math.max(-1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
    const ny = Math.min(1, Math.max(-1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--par-x', nx.toFixed(3));
      el.style.setProperty('--par-y', ny.toFixed(3));
    });
  }, []);
  const onPointerLeave = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.setProperty('--par-x', '0');
    el.style.setProperty('--par-y', '0');
  }, []);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="puzzle-overlay cine-overlay" role="dialog" aria-label={ariaTitle}>
      <div className="cine-scroll" ref={scrollRef}>
        {topStrip && <div className="cine-top-strip">{topStrip}</div>}
        <div className="cine-viewport">
          <div
            className="cine-crop"
            style={{ width: stage.width, height: stage.viewHeight }}
          >
            <div
              className="cine-stage"
              ref={stageRef}
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
              style={{
                width: stage.width,
                height: stage.height,
                marginTop: -stage.cropTop,
                // כל טיפוגרפיית השכבות נמדדת ב-em — מתכווננת לגודל הבמה
                fontSize: Math.max(9, stage.height / 46),
              }}
            >
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                className="cine-image"
                style={showImage ? undefined : { visibility: 'hidden' }}
              />
              <div
                className="cine-content"
                style={showContent ? undefined : { visibility: 'hidden' }}
              >
                <CineStageSizeContext.Provider
                  value={{ width: stage.width, height: stage.height }}
                >
                  {children}
                </CineStageSizeContext.Provider>
              </div>
              {showLighting && (
                <div className="cine-lighting" aria-hidden="true">
                  <div className="cine-glass-reflection" />
                  <div className="cine-light-sweep" />
                  <div className="cine-vignette" />
                </div>
              )}
              {debug && debugRegions && (
                <div className="cine-debug-grid" aria-hidden="true">
                  {Object.entries(debugRegions).map(([name, r]) => (
                    <div
                      key={name}
                      className="cine-debug-region"
                      style={{
                        left: `${r.left}%`,
                        top: `${r.top}%`,
                        width: `${r.width}%`,
                        height: `${r.height}%`,
                      }}
                    >
                      <span className="cine-debug-label">
                        {name} · L{r.left}% T{r.top}% W{r.width}% H{r.height}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {bottomBar && <div className="cine-bottom-bar">{bottomBar}</div>}
      </div>
      {debug && (
        <div className="cine-debug-panel">
          <strong>מצב כיול</strong>
          <label>
            <input
              type="checkbox"
              checked={showImage}
              onChange={(e) => setShowImage(e.target.checked)}
            />
            תמונת הקונסולה
          </label>
          <label>
            <input
              type="checkbox"
              checked={showLighting}
              onChange={(e) => setShowLighting(e.target.checked)}
            />
            תאורה והשתקפויות
          </label>
          <label>
            <input
              type="checkbox"
              checked={showContent}
              onChange={(e) => setShowContent(e.target.checked)}
            />
            שכבות אינטראקטיביות
          </label>
          <span className="cine-debug-size">
            במה: {Math.round(stage.width)}×{Math.round(stage.height)}px · חיתוך עליון:{' '}
            {Math.round(stage.cropTop)}px
          </span>
        </div>
      )}
    </div>
  );
}
