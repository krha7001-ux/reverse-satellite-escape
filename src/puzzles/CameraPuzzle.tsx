import { useEffect, useRef, useState } from 'react';
import type { PuzzleProps } from '../types/game';
import type { LensId, OpticalElement } from '../data/cameraPuzzle';
import {
  CAMERA_FINDING,
  CORRECT_CODE_2,
  CORRECT_LENS,
  ELEMENT_FEEDBACK,
  ELEMENT_LABELS,
  FAULT_MESSAGE,
  FEEDBACK_A,
  FEEDBACK_C,
  FEEDBACK_MISSING_2,
  FEEDBACK_WRONG_CODE_2,
  HINTS_2,
  LENS_OPTIONS,
  MISSION_MESSAGE_2,
  SCIENCE_NOTE_2,
  SENSOR_DISTANCE_CM,
  SUCCESS_MESSAGE_2,
  TERMINAL_TITLE,
  TRANSITION_MESSAGE_2,
} from '../data/cameraPuzzle';
import { RayDiagram, PX_PER_CM } from './RayDiagram';
import { PixelatedPhoto } from './PixelatedPhoto';

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

const ELEMENTS: OpticalElement[] = ['flat', 'concave', 'convex'];

/** אייקון מוקטן של רכיב אופטי לכרטיס הבחירה */
function ElementIcon({ element }: { element: OpticalElement }) {
  return (
    <svg viewBox="0 0 40 64" className="element-icon" aria-hidden="true">
      {element === 'flat' && <rect x={15} y={6} width={10} height={52} rx={3} />}
      {element === 'concave' && (
        <path d="M 10 6 Q 20 18 30 6 L 30 58 Q 20 46 10 58 Z" />
      )}
      {element === 'convex' && <ellipse cx={20} cy={32} rx={11} ry={27} />}
    </svg>
  );
}

/** חידה 2: מערכת הצילום — לוכדים את האור */
export function CameraPuzzle({
  hintsUsed,
  onSolve,
  onUseHint,
  onAddFinding,
  onClose,
}: PuzzleProps) {
  const [step, setStep] = useState<Step>(1);
  // שלב 2: הרכיב המוצב והרכיבים שנוסו
  const [placed, setPlaced] = useState<OpticalElement | null>(null);
  const [tried, setTried] = useState<OpticalElement[]>([]);
  // גרירת רכיב: מיקום רוח הרפאים על המסך
  const [dragging, setDragging] = useState<{
    element: OpticalElement;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const benchRef = useRef<HTMLDivElement>(null);
  // שלב 3: עדשה נבחרת, קוד ומשוב
  const [lens, setLens] = useState<LensId | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  // שלב 4: התחדדות התמונה
  // מאותחל ל-true כדי שכניסה לשלב 4 תתחיל באנימציית השחזור ללא הבזק
  const [resolution, setResolution] = useState(8);
  const [restoring, setRestoring] = useState(true);
  const solvedRef = useRef(false);

  // גישה יציבה ל-callbacks — ההורה מתרנדר כל שנייה בגלל הטיימר
  const callbacksRef = useRef({ onAddFinding, onSolve });
  callbacksRef.current = { onAddFinding, onSolve };

  const placeElement = (element: OpticalElement) => {
    setPlaced(element);
    setTried((prev) => (prev.includes(element) ? prev : [...prev, element]));
  };

  // גרירה בהתאמה אישית: עובדת בעכבר ובמגע, ולחיצה רגילה מציבה מיד
  const startDrag = (element: OpticalElement, e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging({
      element,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
    });
  };

  const moveDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging({ ...dragging, x: e.clientX, y: e.clientY });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    const moved =
      Math.hypot(e.clientX - dragging.startX, e.clientY - dragging.startY) > 8;
    const bench = benchRef.current?.getBoundingClientRect();
    const overBench =
      bench !== undefined &&
      e.clientX >= bench.left &&
      e.clientX <= bench.right &&
      e.clientY >= bench.top &&
      e.clientY <= bench.bottom;
    // לחיצה במקום מציבה מיד (טאבלט); גרירה מציבה רק אם שוחררה מעל הספסל
    if (!moved || overBench) {
      placeElement(dragging.element);
    }
    setDragging(null);
  };

  const chosenLens = LENS_OPTIONS.find((l) => l.id === lens) ?? null;

  const pressKey = (digit: string) => {
    if (code.length >= 4) return;
    setCode(code + digit);
  };

  const submit = () => {
    if (lens === null || code === '') {
      setFeedback(FEEDBACK_MISSING_2);
    } else if (lens === 'A') {
      setFeedback(FEEDBACK_A);
    } else if (lens === 'C') {
      setFeedback(FEEDBACK_C);
    } else if (Number(code) !== CORRECT_CODE_2) {
      setFeedback(FEEDBACK_WRONG_CODE_2);
    } else {
      setFeedback(null);
      setStep(4);
    }
  };

  // שלב 4: הקרניים מתכנסות על החיישן והתמונה מתחדדת בהדרגה
  useEffect(() => {
    if (step !== 4) return;
    setRestoring(true);
    const timers = [
      setTimeout(() => setResolution(16), 700),
      setTimeout(() => setResolution(32), 1100),
      setTimeout(() => setResolution(64), 1500),
    ];
    const done = setTimeout(() => {
      if (!solvedRef.current) {
        solvedRef.current = true;
        callbacksRef.current.onAddFinding(CAMERA_FINDING);
        callbacksRef.current.onSolve();
      }
      setRestoring(false);
    }, 2100);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [step]);

  const currentHint =
    hintsUsed > 0 ? HINTS_2[Math.min(hintsUsed, HINTS_2.length) - 1] : null;

  return (
    <div className="puzzle-overlay">
      {/* התקרבות קולנועית מכיוון ארון העדשות והמצלמה */}
      <div className="terminal" style={{ transformOrigin: '29.5% 47%' }}>
        <header className="terminal-header">
          <span className="terminal-title">
            <span aria-hidden="true">📷</span>
            {TERMINAL_TITLE}
          </span>
          <span className="step-chip">שלב {step} מתוך {TOTAL_STEPS}</span>
          <button type="button" className="modal-button" onClick={onClose}>
            חזרה לחדר הבקרה
          </button>
        </header>

        {/* שלב 1 — התקלה */}
        {step === 1 && (
          <div className="terminal-step step-boot">
            <div className="static-noise" aria-hidden="true" />
            <p className="boot-message">{FAULT_MESSAGE}</p>
            <button
              type="button"
              className="modal-button primary step-next"
              onClick={() => setStep(2)}
            >
              הפעילו את המעבדה
            </button>
          </div>
        )}

        {/* שלב 2 — התנסות בקרני אור */}
        {step === 2 && (
          <div
            className="terminal-step step-bench"
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={() => setDragging(null)}
          >
            <div className="bench-area" ref={benchRef}>
              <RayDiagram element={placed} focalPx={20 * PX_PER_CM} />
              <p className={`bench-feedback${placed ? '' : ' empty'}`}>
                {placed
                  ? ELEMENT_FEEDBACK[placed]
                  : 'גררו רכיב אל מסלול האור, או לחצו עליו כדי להציבו.'}
              </p>
            </div>

            <div className="bench-side">
              <p className="instruction-line">
                הציבו כל אחד מהרכיבים במסלול האור וצפו במסלול הקרניים.
              </p>
              <div className="element-row" role="group" aria-label="רכיבים אופטיים">
                {ELEMENTS.map((element) => (
                  <button
                    key={element}
                    type="button"
                    className={`element-card${placed === element ? ' placed' : ''}${
                      tried.includes(element) ? ' tried' : ''
                    }`}
                    onPointerDown={(e) => startDrag(element, e)}
                  >
                    <ElementIcon element={element} />
                    <span>{ELEMENT_LABELS[element]}</span>
                    {tried.includes(element) && (
                      <span className="tried-mark" aria-label="נוסה">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="science-note">{SCIENCE_NOTE_2}</p>
              <button
                type="button"
                className="modal-button primary step-next"
                disabled={tried.length < ELEMENTS.length}
                onClick={() => setStep(3)}
              >
                {tried.length < ELEMENTS.length
                  ? `עברו למשימה (נוסו ${tried.length} מתוך ${ELEMENTS.length})`
                  : 'עברו למשימה'}
              </button>
            </div>

            {dragging && (
              <div
                className="drag-ghost"
                style={{ left: dragging.x, top: dragging.y }}
                aria-hidden="true"
              >
                <ElementIcon element={dragging.element} />
              </div>
            )}
          </div>
        )}

        {/* שלב 3 — המשימה ההנדסית */}
        {step === 3 && (
          <div className="terminal-step step-mission step-lens-mission">
            <div className="bench-area mission-bench">
              <RayDiagram
                element={lens === null ? null : 'convex'}
                focalPx={(chosenLens?.focalCm ?? SENSOR_DISTANCE_CM) * PX_PER_CM}
                sensorPx={SENSOR_DISTANCE_CM * PX_PER_CM}
                sensorLabel={`חיישן · ${SENSOR_DISTANCE_CM} ס"מ`}
              />
              <div className="lens-preview">
                <div
                  className={`preview-frame${
                    lens === null ? '' : lens === CORRECT_LENS ? ' sharp' : ' blurred'
                  }`}
                >
                  <PixelatedPhoto resolution={64} />
                </div>
                <p className={`bench-feedback${chosenLens ? '' : ' empty'}`}>
                  {chosenLens
                    ? chosenLens.preview
                    : 'בחרו עדשה כדי לראות תצוגה מקדימה.'}
                </p>
              </div>
            </div>

            <div className="mission-side">
              <p className="mission-message">{MISSION_MESSAGE_2}</p>
              <div className="option-row" role="group" aria-label="בחירת עדשה">
                {LENS_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`option-button${lens === option.id ? ' chosen' : ''}`}
                    onClick={() => {
                      setLens(option.id);
                      setFeedback(null);
                    }}
                  >
                    עדשה {option.id}
                    <small>מיקוד {option.focalCm} ס"מ</small>
                  </button>
                ))}
              </div>

              <div className="status-area">
                <p
                  className={`status-feedback${feedback ? '' : ' empty'}`}
                  role={feedback ? 'alert' : undefined}
                >
                  {feedback ?? 'בחרו עדשה, הזינו את מרחק המיקוד ושדרו.'}
                </p>
                <div className="status-hint">
                  <button
                    type="button"
                    className="modal-button hint-button"
                    onClick={onUseHint}
                    disabled={hintsUsed >= HINTS_2.length}
                  >
                    רמז ({hintsUsed}/{HINTS_2.length})
                  </button>
                  <span className={`hint-text${currentHint ? '' : ' empty'}`}>
                    {currentHint ?? 'זקוקים לכיוון? בקשו רמז.'}
                  </span>
                </div>
              </div>

              {lens === null ? (
                <div className="keypad-waiting compact">
                  בחרו עדשה כדי להפעיל את הקודן
                </div>
              ) : (
                <div className="keypad-block compact">
                  <div className="keypad-display" aria-live="polite">
                    {code === '' ? 'מרחק המיקוד בס"מ' : code}
                  </div>
                  <div className="keypad">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        className="keypad-key"
                        onClick={() => pressKey(d)}
                      >
                        {d}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="keypad-key action"
                      onClick={() => setCode('')}
                    >
                      נקה
                    </button>
                    <button
                      type="button"
                      className="keypad-key"
                      onClick={() => pressKey('0')}
                    >
                      0
                    </button>
                    <button
                      type="button"
                      className="keypad-key action"
                      onClick={() => setCode(code.slice(0, -1))}
                    >
                      ⌫
                    </button>
                  </div>
                  <button
                    type="button"
                    className="modal-button primary submit-button"
                    onClick={submit}
                  >
                    כיול מערכת הצילום
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* שלב 4 — הצלחה */}
        {step === 4 && (
          <div className="terminal-step step-success">
            <div className="success-bench">
              <RayDiagram
                element="convex"
                focalPx={SENSOR_DISTANCE_CM * PX_PER_CM}
                sensorPx={SENSOR_DISTANCE_CM * PX_PER_CM}
                sensorLabel={`חיישן · ${SENSOR_DISTANCE_CM} ס"מ`}
                animate
              />
            </div>
            <div className={`photo-restore small${restoring ? '' : ' done'}`}>
              <PixelatedPhoto resolution={resolution} />
            </div>
            {restoring ? (
              <p className="instruction-line">ממקד את קרני האור…</p>
            ) : (
              <div className="success-panel">
                <p className="success-message">✔ {SUCCESS_MESSAGE_2}</p>
                <div className="finding-card">
                  <span className="finding-title">{CAMERA_FINDING.title}</span>
                  <p>{CAMERA_FINDING.content}</p>
                </div>
                <p className="transition-message">{TRANSITION_MESSAGE_2}</p>
                <button
                  type="button"
                  className="modal-button primary"
                  onClick={onClose}
                >
                  חזרה לחדר הבקרה
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
