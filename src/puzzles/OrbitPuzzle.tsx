import { useEffect, useRef, useState } from 'react';
import type { PuzzleProps } from '../types/game';
import {
  CLARIFICATION_5,
  CORRECT_CODE_5,
  CORRECT_SPEED,
  FAULT_MESSAGE_5,
  FEEDBACK_MISSING_5,
  HINTS_5,
  MISSION_MESSAGE_5,
  ORBIT_ALTITUDE_KM,
  ORBIT_FINDING,
  SCALE_NOTE,
  SCIENCE_NOTE_5,
  SPEED_OPTIONS,
  SUCCESS_MESSAGE_5,
  TERMINAL_TITLE_5,
  TRANSITION_MESSAGE_5,
} from '../data/orbitPuzzle';
import type { LaunchRequest } from './OrbitSim';
import { OrbitSim } from './OrbitSim';

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

const fmt = (n: number) => n.toLocaleString('he-IL');

/** חידה 5: המסלול — נופלים סביב כדור הארץ */
export function OrbitPuzzle({
  hintsUsed,
  onSolve,
  onUseHint,
  onAddFinding,
  onClose,
}: PuzzleProps) {
  const [step, setStep] = useState<Step>(1);
  // שלב 2: השיגור הנוכחי והמהירויות שנוסו
  const [launch, setLaunch] = useState<LaunchRequest | null>(null);
  const [running, setRunning] = useState(false);
  const [tested, setTested] = useState<number[]>([]);
  const [lastObservation, setLastObservation] = useState<string | null>(null);
  // שלב 3
  const [chosenSpeed, setChosenSpeed] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  // שלב 4
  const [restoring, setRestoring] = useState(true);
  const [satAngle, setSatAngle] = useState(-90);
  const solvedRef = useRef(false);
  const seqRef = useRef(0);

  // גישה יציבה ל-callbacks — ההורה מתרנדר כל שנייה בגלל הטיימר
  const callbacksRef = useRef({ onAddFinding, onSolve });
  callbacksRef.current = { onAddFinding, onSolve };

  // נקודת הפעלה לאפקטים (סבב ליטוש): כניסה לחידה
  useEffect(() => {
    // כאן ניתן לחבר צליל/אפקט פתיחה בעתיד
  }, []);

  const fireLaunch = (speed: number) => {
    seqRef.current += 1;
    setLaunch({ speed, seq: seqRef.current });
    setRunning(true);
    setLastObservation(null);
  };

  const onSimFinished = (speed: number) => {
    setRunning(false);
    setTested((prev) => (prev.includes(speed) ? prev : [...prev, speed]));
    const option = SPEED_OPTIONS.find((o) => o.value === speed);
    setLastObservation(option?.observation ?? null);
  };

  const exploreDone = tested.length === SPEED_OPTIONS.length;

  const pressKey = (digit: string) => {
    if (code.length >= 5) return;
    setCode(code + digit);
  };

  const submit = () => {
    if (chosenSpeed === null || code === '') {
      setFeedback(FEEDBACK_MISSING_5);
      return;
    }
    const option = SPEED_OPTIONS.find((o) => o.value === chosenSpeed);
    if (!option) return;
    if (chosenSpeed !== CORRECT_SPEED) {
      setFeedback(option.feedback);
    } else if (Number(code) !== CORRECT_CODE_5) {
      setFeedback(option.feedback);
    } else {
      // נקודת הפעלה לאפקטים (סבב ליטוש): פתרון נכון
      setFeedback(null);
      setStep(4);
    }
  };

  // שלב 4: המסלול הזוהר נמשך והלוויין נע לאורכו
  useEffect(() => {
    if (step !== 4) return;
    setRestoring(true);
    const move = setInterval(() => setSatAngle((a) => a + 3.2), 30);
    const done = setTimeout(() => {
      if (!solvedRef.current) {
        solvedRef.current = true;
        callbacksRef.current.onAddFinding(ORBIT_FINDING);
        callbacksRef.current.onSolve();
      }
      setRestoring(false);
    }, 2600);
    return () => {
      clearInterval(move);
      clearTimeout(done);
    };
  }, [step]);

  const currentHint =
    hintsUsed > 0 ? HINTS_5[Math.min(hintsUsed, HINTS_5.length) - 1] : null;

  const satX = 240 + 110 * Math.cos((satAngle * Math.PI) / 180);
  const satY = 200 + 110 * Math.sin((satAngle * Math.PI) / 180);

  return (
    <div className="puzzle-overlay">
      {/* התקרבות קולנועית מכיוון מסך כדור הארץ והמסלול */}
      <div className="terminal" style={{ transformOrigin: '70% 44%' }}>
        <header className="terminal-header">
          <span className="terminal-title">
            <span aria-hidden="true">🌍</span>
            {TERMINAL_TITLE_5}
          </span>
          <span className="step-chip">שלב {step} מתוך {TOTAL_STEPS}</span>
          <button type="button" className="modal-button" onClick={onClose}>
            חזרה לחדר הבקרה
          </button>
        </header>

        {/* שלב 1 — אובדן המסלול */}
        {step === 1 && (
          <div className="terminal-step step-boot">
            <div className="static-noise" aria-hidden="true" />
            <p className="boot-message">{FAULT_MESSAGE_5}</p>
            <button
              type="button"
              className="modal-button primary step-next"
              onClick={() => setStep(2)}
            >
              הפעילו את סימולטור המסלול
            </button>
          </div>
        )}

        {/* שלב 2 — כוח הכבידה ומהירות */}
        {step === 2 && (
          <div className="terminal-step step-bench step-orbit">
            <div className="bench-area orbit-bench">
              <OrbitSim launch={launch} keepTrails onFinished={onSimFinished} />
              <p className={`bench-feedback${lastObservation || running ? '' : ' empty'}`}>
                {running
                  ? 'ההדמיה פועלת — עקבו אחרי הנתיב ומד המרחק…'
                  : lastObservation ??
                    'בחרו מהירות שיגור וצפו במסלול שנוצר.'}
              </p>
            </div>

            <div className="bench-side">
              <p className="instruction-line scale-note">⚠️ {SCALE_NOTE}</p>
              <p className="slider-label">
                מהירות השיגור (גובה {fmt(ORBIT_ALTITUDE_KM)} ק"מ):
              </p>
              <div className="speed-grid" role="group" aria-label="בחירת מהירות">
                {SPEED_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`option-button speed-button${
                      launch?.speed === option.value ? ' chosen' : ''
                    }${tested.includes(option.value) ? ' tested' : ''}`}
                    style={{ borderInlineStartColor: option.color }}
                    disabled={running}
                    onClick={() => fireLaunch(option.value)}
                  >
                    {fmt(option.value)}
                    <small>מטר בשנייה</small>
                    {tested.includes(option.value) && (
                      <span className="tried-mark" aria-label="נוסה">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <p className="science-note">{SCIENCE_NOTE_5}</p>

              {exploreDone ? (
                <button
                  type="button"
                  className="modal-button primary step-next"
                  onClick={() => setStep(3)}
                >
                  עברו לשחזור נתוני המסלול
                </button>
              ) : (
                <p className="choice-progress">
                  נבדקו {tested.length} מתוך {SPEED_OPTIONS.length} מהירויות
                </p>
              )}
            </div>
          </div>
        )}

        {/* שלב 3 — שחזור נתוני המסלול */}
        {step === 3 && (
          <div className="terminal-step step-mission step-orbit-mission">
            <div className="bench-area orbit-bench compact">
              <OrbitSim
                launch={launch}
                keepTrails={false}
                onFinished={() => setRunning(false)}
              />
              <div className="speed-grid mission-speeds" role="group" aria-label="בחירת מהירות">
                {SPEED_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`option-button speed-button${
                      chosenSpeed === option.value ? ' chosen' : ''
                    }`}
                    disabled={running}
                    onClick={() => {
                      setChosenSpeed(option.value);
                      setFeedback(null);
                      fireLaunch(option.value);
                    }}
                  >
                    {fmt(option.value)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mission-side">
              <p className="mission-message">{MISSION_MESSAGE_5}</p>
              <p className="science-note">{CLARIFICATION_5}</p>

              <div className="status-area">
                <p
                  className={`status-feedback${feedback ? '' : ' empty'}`}
                  role={feedback ? 'alert' : undefined}
                >
                  {feedback ?? 'בחרו מהירות, צפו במד המרחק והזינו את המהירות.'}
                </p>
                <div className="status-hint">
                  <button
                    type="button"
                    className="modal-button hint-button"
                    onClick={onUseHint}
                    disabled={hintsUsed >= HINTS_5.length}
                  >
                    רמז ({hintsUsed}/{HINTS_5.length})
                  </button>
                  <span className={`hint-text${currentHint ? '' : ' empty'}`}>
                    {currentHint ?? 'זקוקים לכיוון? בקשו רמז.'}
                  </span>
                </div>
              </div>

              <div className="keypad-block compact">
                <div className="keypad-display" aria-live="polite">
                  {code === '' ? 'המהירות במטרים לשנייה' : code}
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
                  קיבוע נתוני המסלול
                </button>
              </div>
            </div>
          </div>
        )}

        {/* שלב 4 — הצלחה */}
        {step === 4 && (
          <div className="terminal-step step-success">
            <div className="success-bench orbit-success">
              <svg viewBox="0 0 480 400" className="orbit-svg" role="img" aria-label="המסלול המשוחזר">
                <circle cx={240} cy={200} r={70} className="earth-body" />
                <circle cx={240} cy={200} r={70} className="earth-glow" />
                <text x={240} y={205} textAnchor="middle" className="earth-label">
                  כדור הארץ
                </text>
                {/* המסלול הזוהר נמשך בהדרגה */}
                <circle cx={240} cy={200} r={110} className="orbit-final" />
                {/* הלוויין נע לאורך המסלול */}
                <g className="orbit-satellite">
                  <rect x={satX - 7} y={satY - 5} width={14} height={10} rx={2} />
                  <line x1={satX - 12} y1={satY} x2={satX - 7} y2={satY} />
                  <line x1={satX + 7} y1={satY} x2={satX + 12} y2={satY} />
                </g>
              </svg>
            </div>
            {restoring ? (
              <p className="instruction-line">מקבע את נתוני המסלול…</p>
            ) : (
              <div className="success-panel">
                <p className="success-message">✔ {SUCCESS_MESSAGE_5}</p>
                <div className="finding-card">
                  <span className="finding-title">{ORBIT_FINDING.title}</span>
                  <p>{ORBIT_FINDING.content}</p>
                </div>
                <p className="transition-message">{TRANSITION_MESSAGE_5}</p>
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
