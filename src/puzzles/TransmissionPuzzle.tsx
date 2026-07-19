import { useEffect, useRef, useState } from 'react';
import type { PuzzleProps } from '../types/game';
import type { TransmissionMedium } from '../data/transmissionPuzzle';
import {
  CABLE_NOTE,
  CHOICE_PROMPT,
  CLARIFICATION_3,
  CORRECT_CODE_3,
  CORRECT_MEDIUM,
  FAULT_MESSAGE_3,
  FEEDBACK_MISSING_3,
  FEEDBACK_WRONG_CODE_3,
  HINTS_3,
  MEDIUM_FEEDBACK,
  MEDIUM_LABELS,
  MISSION_MESSAGE_3,
  PACKET_COUNT,
  SCIENCE_NOTE_3,
  SUCCESS_MESSAGE_3,
  TERMINAL_TITLE_3,
  TRANSITION_MESSAGE_3,
  TRANSMISSION_FINDING,
  UNITS_PER_SECOND,
} from '../data/transmissionPuzzle';

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;
const MEDIA: TransmissionMedium[] = ['sound', 'cable', 'radio'];

/** תא הניסוי: משדר מימין, מקלט משמאל, והאמצעי הפעיל ביניהם */
function VacuumChamber({
  air,
  medium,
}: {
  air: number;
  medium: TransmissionMedium | null;
}) {
  const soundOpacity = air / 100;
  return (
    <svg
      className="chamber-svg"
      viewBox="0 0 560 240"
      role="img"
      aria-label="תא ניסוי התקשורת"
    >
      {/* דופן התא; גוון הרקע מציין את כמות האוויר */}
      <rect x={8} y={8} width={544} height={224} rx={14} className="chamber-wall" />
      <rect
        x={8}
        y={8}
        width={544}
        height={224}
        rx={14}
        className="chamber-air"
        style={{ opacity: 0.06 + (air / 100) * 0.22 }}
      />

      {/* משדר (ימין) */}
      <g className="chamber-node">
        <rect x={462} y={84} width={58} height={72} rx={8} />
        <text x={491} y={176} textAnchor="middle" className="chamber-label">
          משדר
        </text>
        {medium === 'sound' && (
          <g className="speaker-glyph">
            <path d="M 470 108 L 458 118 L 458 122 L 470 132 Z" />
          </g>
        )}
        {medium === 'radio' && (
          <line x1={491} y1={84} x2={491} y2={54} className="antenna-mast" />
        )}
      </g>

      {/* מקלט (שמאל) */}
      <g className="chamber-node">
        <rect x={44} y={84} width={58} height={72} rx={8} />
        <text x={73} y={176} textAnchor="middle" className="chamber-label">
          מקלט
        </text>
      </g>

      {/* אין אמצעי — הנחיה */}
      {medium === null && (
        <text x={280} y={126} textAnchor="middle" className="chamber-hint">
          הפעילו אמצעי העברה כדי לבדוק אותו
        </text>
      )}

      {/* גלי קול: קשתות שנחלשות עם האוויר ונעלמות ב-0% */}
      {medium === 'sound' &&
        [0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            className="sound-wave"
            d={`M ${430 - i * 68} 90 Q ${400 - i * 68} 120 ${430 - i * 68} 150`}
            style={{
              opacity: soundOpacity * (1 - i * 0.12),
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      {medium === 'sound' && air === 0 && (
        <text x={280} y={70} textAnchor="middle" className="chamber-warning">
          אין אוויר — גלי הקול אינם עוברים
        </text>
      )}

      {/* כבל: קו פיזי עם תווית */}
      {medium === 'cable' && (
        <g>
          <path d="M 462 120 C 380 168 180 168 102 120" className="cable-line" />
          <rect x={190} y={182} width={180} height={30} rx={8} className="cable-note-bg" />
          <text x={280} y={202} textAnchor="middle" className="cable-note">
            {CABLE_NOTE}
          </text>
        </g>
      )}

      {/* גלי רדיו: מתקדמים אל המקלט ללא תלות באוויר */}
      {medium === 'radio' &&
        [0, 1, 2].map((i) => (
          <path
            key={i}
            className="radio-wave"
            d={`M 455 120 q -14 -18 -28 0 q -14 18 -28 0 q -14 -18 -28 0 q -14 18 -28 0 q -14 -18 -28 0 q -14 18 -28 0 q -14 -18 -28 0 q -14 18 -28 0 q -14 -18 -28 0 q -14 18 -28 0 q -14 -18 -28 0 q -14 18 -28 0 q -6 -8 -13 -4`}
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
    </svg>
  );
}

/** הדמיית השידור: חבילות מידע עוברות מהלוויין לתחנת הקרקע */
function PacketTransfer({
  delivered,
  lockAntenna,
}: {
  delivered: number;
  lockAntenna?: boolean;
}) {
  return (
    <svg
      className="transfer-svg"
      viewBox="0 0 560 190"
      role="img"
      aria-label="הדמיית שידור חבילות המידע"
    >
      {/* לוויין (ימין) */}
      <g className="transfer-node">
        <rect x={468} y={62} width={44} height={34} rx={6} />
        <rect x={452} y={70} width={14} height={18} rx={2} className="solar-cell" />
        <rect x={514} y={70} width={14} height={18} rx={2} className="solar-cell" />
        <text x={490} y={118} textAnchor="middle" className="chamber-label">
          לוויין
        </text>
      </g>

      {/* תחנת קרקע (שמאל) עם צלחת מסתובבת */}
      <g className="transfer-node">
        <rect x={52} y={96} width={44} height={30} rx={5} />
        <g
          className={`station-dish${lockAntenna ? ' lock' : ''}`}
          style={{ transformOrigin: '74px 96px' }}
        >
          <path d="M 60 96 A 20 20 0 0 1 88 96 Z" />
          <line x1={74} y1={96} x2={74} y2={80} />
        </g>
        <text x={74} y={146} textAnchor="middle" className="chamber-label">
          תחנת קרקע
        </text>
      </g>

      {/* מסילת השידור */}
      <line x1={110} y1={80} x2={450} y2={80} className="transfer-track" />

      {/* חבילות המידע */}
      {Array.from({ length: PACKET_COUNT }, (_, i) => {
        const atStation = i < delivered;
        // בתור ליד הלוויין (מדורג קלות) או זו לצד זו ליד התחנה
        const x = atStation ? 112 + i * 46 : 396 - i * 8;
        return (
          <g
            key={i}
            className={`packet${atStation ? ' delivered' : ''}`}
            style={{ transform: `translateX(${x - 396}px)` }}
          >
            <rect x={396} y={64} width={40} height={30} rx={6} />
            <text x={416} y={84} textAnchor="middle">
              {UNITS_PER_SECOND}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** חידה 3: מערכת השידור — מעבירים מידע בחלל */
export function TransmissionPuzzle({
  hintsUsed,
  onSolve,
  onUseHint,
  onAddFinding,
  onClose,
}: PuzzleProps) {
  const [step, setStep] = useState<Step>(1);
  // שלב 2
  const [air, setAir] = useState(100);
  const [medium, setMedium] = useState<TransmissionMedium | null>(null);
  const [tried, setTried] = useState<TransmissionMedium[]>([]);
  const [choice, setChoice] = useState<TransmissionMedium | null>(null);
  // שלב 3
  const [delivered, setDelivered] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  // שלב 4
  const [restoring, setRestoring] = useState(true);
  const [successDelivered, setSuccessDelivered] = useState(0);
  const solvedRef = useRef(false);

  // גישה יציבה ל-callbacks — ההורה מתרנדר כל שנייה בגלל הטיימר
  const callbacksRef = useRef({ onAddFinding, onSolve });
  callbacksRef.current = { onAddFinding, onSolve };

  const activateMedium = (m: TransmissionMedium) => {
    setMedium(m);
    setTried((prev) => (prev.includes(m) ? prev : [...prev, m]));
    setChoice(null);
  };

  // שלב 3: אנימציית השידור — חבילה אחת בכל שנייה
  useEffect(() => {
    if (step !== 3 || !playing) return;
    if (delivered >= PACKET_COUNT) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setDelivered((d) => d + 1), 950);
    return () => clearTimeout(timer);
  }, [step, playing, delivered]);

  const togglePlay = () => {
    if (delivered >= PACKET_COUNT) {
      // הפעלה מחדש
      setDelivered(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  const pressKey = (digit: string) => {
    if (code.length >= 3) return;
    setCode(code + digit);
  };

  const submit = () => {
    if (code === '') {
      setFeedback(FEEDBACK_MISSING_3);
    } else if (Number(code) !== CORRECT_CODE_3) {
      setFeedback(FEEDBACK_WRONG_CODE_3);
    } else {
      setFeedback(null);
      setStep(4);
    }
  };

  // שלב 4: האנטנה ננעלת וארבע החבילות עוברות, ואז החידה נפתרת
  useEffect(() => {
    if (step !== 4) return;
    setRestoring(true);
    setSuccessDelivered(0);
    const timers = Array.from({ length: PACKET_COUNT }, (_, i) =>
      setTimeout(() => setSuccessDelivered(i + 1), 800 + i * 700),
    );
    const done = setTimeout(() => {
      if (!solvedRef.current) {
        solvedRef.current = true;
        callbacksRef.current.onAddFinding(TRANSMISSION_FINDING);
        callbacksRef.current.onSolve();
      }
      setRestoring(false);
    }, 800 + PACKET_COUNT * 700 + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [step]);

  const currentHint =
    hintsUsed > 0 ? HINTS_3[Math.min(hintsUsed, HINTS_3.length) - 1] : null;

  const chamberFeedback =
    choice !== null
      ? MEDIUM_FEEDBACK[choice]
      : medium !== null
        ? MEDIUM_FEEDBACK[medium]
        : null;

  return (
    <div className="puzzle-overlay">
      {/* התקרבות קולנועית מכיוון עמדת התקשורת */}
      <div className="terminal" style={{ transformOrigin: '45% 46%' }}>
        <header className="terminal-header">
          <span className="terminal-title">
            <span aria-hidden="true">📡</span>
            {TERMINAL_TITLE_3}
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
            <p className="boot-message">{FAULT_MESSAGE_3}</p>
            <button
              type="button"
              className="modal-button primary step-next"
              onClick={() => setStep(2)}
            >
              הפעילו את ניסוי התקשורת
            </button>
          </div>
        )}

        {/* שלב 2 — אילו גלים עוברים בחלל? */}
        {step === 2 && (
          <div className="terminal-step step-bench step-chamber">
            <div className="bench-area">
              <VacuumChamber air={air} medium={medium} />
              <p className={`bench-feedback${chamberFeedback ? '' : ' empty'}`}>
                {chamberFeedback ??
                  'הפעילו כל אמצעי, שנו את כמות האוויר וצפו בתוצאה.'}
              </p>
            </div>

            <div className="bench-side">
              <label className="slider-label" htmlFor="air-slider">
                כמות האוויר: <strong>{air}%</strong>
              </label>
              <input
                id="air-slider"
                className="resolution-slider"
                type="range"
                min={0}
                max={100}
                step={10}
                value={air}
                onChange={(e) => setAir(Number(e.target.value))}
              />

              <div className="element-row" role="group" aria-label="אמצעי העברה">
                {MEDIA.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`element-card${medium === m ? ' placed' : ''}${
                      tried.includes(m) ? ' tried' : ''
                    }`}
                    onClick={() => activateMedium(m)}
                  >
                    <span className="medium-icon" aria-hidden="true">
                      {m === 'sound' ? '🔊' : m === 'cable' ? '🔌' : '📡'}
                    </span>
                    <span>{MEDIUM_LABELS[m]}</span>
                    {tried.includes(m) && (
                      <span className="tried-mark" aria-label="נבדק">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <p className="science-note">{SCIENCE_NOTE_3}</p>

              {tried.length < MEDIA.length ? (
                <p className="choice-progress">
                  נבדקו {tried.length} מתוך {MEDIA.length} אמצעים
                </p>
              ) : (
                <div className="choice-block">
                  <p className="instruction-line">{CHOICE_PROMPT}</p>
                  <div className="option-row">
                    {MEDIA.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`option-button${choice === m ? ' chosen' : ''}`}
                        onClick={() => {
                          setChoice(m);
                          setMedium(m);
                        }}
                      >
                        {MEDIUM_LABELS[m]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="modal-button primary step-next"
                    disabled={choice !== CORRECT_MEDIUM}
                    onClick={() => setStep(3)}
                  >
                    המשיכו למשימת השידור
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* שלב 3 — משימת השידור */}
        {step === 3 && (
          <div className="terminal-step step-mission step-transfer">
            <div className="bench-area transfer-area">
              <PacketTransfer delivered={delivered} />
              <div className="transfer-controls">
                <button
                  type="button"
                  className="modal-button"
                  onClick={togglePlay}
                >
                  {delivered >= PACKET_COUNT
                    ? '↺ הפעלה מחדש'
                    : playing
                      ? '⏸ עצירה'
                      : '▶ הפעלת השידור'}
                </button>
                <span className="transfer-counter">
                  {delivered > 0
                    ? `שנייה ${delivered} מתוך ${PACKET_COUNT} — הועברו ${delivered * UNITS_PER_SECOND} יחידות`
                    : 'השידור טרם החל'}
                </span>
              </div>
              <p className="science-note">{CLARIFICATION_3}</p>
            </div>

            <div className="mission-side">
              <p className="mission-message">{MISSION_MESSAGE_3}</p>

              <div className="status-area">
                <p
                  className={`status-feedback${feedback ? '' : ' empty'}`}
                  role={feedback ? 'alert' : undefined}
                >
                  {feedback ?? 'צפו בשידור, חשבו את הזמן והזינו אותו בקודן.'}
                </p>
                <div className="status-hint">
                  <button
                    type="button"
                    className="modal-button hint-button"
                    onClick={onUseHint}
                    disabled={hintsUsed >= HINTS_3.length}
                  >
                    רמז ({hintsUsed}/{HINTS_3.length})
                  </button>
                  <span className={`hint-text${currentHint ? '' : ' empty'}`}>
                    {currentHint ?? 'זקוקים לכיוון? בקשו רמז.'}
                  </span>
                </div>
              </div>

              <div className="keypad-block compact">
                <div className="keypad-display" aria-live="polite">
                  {code === '' ? 'זמן השידור בשניות' : code}
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
                  שידור התצלום
                </button>
              </div>
            </div>
          </div>
        )}

        {/* שלב 4 — הצלחה */}
        {step === 4 && (
          <div className="terminal-step step-success">
            <div className="success-bench">
              <PacketTransfer delivered={successDelivered} lockAntenna />
            </div>
            {restoring ? (
              <p className="instruction-line">משדר את התצלום לתחנת הקרקע…</p>
            ) : (
              <div className="success-panel">
                <p className="success-message">✔ {SUCCESS_MESSAGE_3}</p>
                <div className="finding-card">
                  <span className="finding-title">
                    {TRANSMISSION_FINDING.title}
                  </span>
                  <p>{TRANSMISSION_FINDING.content}</p>
                </div>
                <p className="transition-message">{TRANSITION_MESSAGE_3}</p>
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
