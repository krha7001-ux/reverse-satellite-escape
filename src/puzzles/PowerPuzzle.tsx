import { useEffect, useRef, useState } from 'react';
import type { PuzzleProps } from '../types/game';
import type { PanelState, SatelliteSystem } from '../data/powerPuzzle';
import {
  CORRECT_CODE_4,
  FAULT_MESSAGE_4,
  FEEDBACK_30,
  FEEDBACK_70,
  FEEDBACK_CORRECT_4,
  FEEDBACK_MISSING_4,
  FEEDBACK_WRONG_CODE_4,
  HINTS_4,
  MISSION_MESSAGE_4,
  PANEL_STATES,
  POWER_FINDING,
  SCIENCE_NOTE_4,
  SHADE_FEEDBACK,
  SUCCESS_MESSAGE_4,
  SYSTEMS,
  TERMINAL_TITLE_4,
  TRANSITION_MESSAGE_4,
} from '../data/powerPuzzle';

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

/**
 * סצנת האנרגיה: שמש, קרני אור, לוח סולארי מסתובב, סוללה ומערכות.
 * shade — הלוויין בצל: הלוח לא מייצר והסוללה מזינה את המערכות.
 */
function SolarScene({
  panel,
  shade,
  charging,
}: {
  panel: PanelState;
  shade: boolean;
  /** זרימת אנרגיה מהלוח לסוללה */
  charging: boolean;
}) {
  return (
    <svg
      className="solar-svg"
      viewBox="0 0 560 250"
      role="img"
      aria-label="הדמיית הלוח הסולארי"
    >
      {/* שמש (ימין למעלה); בצל — מעומעמת */}
      <g className={`solar-sun${shade ? ' dimmed' : ''}`}>
        <circle cx={478} cy={54} r={26} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1={478 + 34 * Math.cos((deg * Math.PI) / 180)}
            y1={54 + 34 * Math.sin((deg * Math.PI) / 180)}
            x2={478 + 44 * Math.cos((deg * Math.PI) / 180)}
            y2={54 + 44 * Math.sin((deg * Math.PI) / 180)}
          />
        ))}
      </g>
      {shade && (
        <text x={478} y={116} textAnchor="middle" className="chamber-warning">
          צל
        </text>
      )}

      {/* קרני אור מהשמש אל הלוח */}
      {!shade &&
        [0, 1, 2].map((i) => (
          <line
            key={i}
            className="sun-ray"
            x1={452 - i * 10}
            y1={78 + i * 6}
            x2={330 - i * 12}
            y2={150 - i * 8}
          />
        ))}

      {/* הלוח הסולארי — מסתובב לפי המצב */}
      <g
        className="solar-panel"
        style={{
          transform: `rotate(${panel.angle}deg)`,
          transformOrigin: '308px 148px',
        }}
      >
        <rect x={260} y={140} width={96} height={16} rx={3} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={278 + i * 20} y1={140} x2={278 + i * 20} y2={156} />
        ))}
      </g>
      <line x1={308} y1={156} x2={308} y2={196} className="panel-pole" />
      <text x={308} y={216} textAnchor="middle" className="chamber-label">
        לוח סולארי
      </text>

      {/* סוללה (שמאל) */}
      <g className="battery-group">
        <rect x={70} y={120} width={64} height={34} rx={6} className="battery-body" />
        <rect x={62} y={130} width={8} height={14} rx={2} className="battery-cap" />
        <rect
          x={76}
          y={126}
          width={52}
          height={22}
          rx={3}
          className={`battery-fill${charging && !shade ? ' charging' : ''}${shade ? ' draining' : ''}`}
        />
        <text x={102} y={176} textAnchor="middle" className="chamber-label">
          סוללה
        </text>
      </g>

      {/* זרימת אנרגיה: לוח → סוללה (טעינה) או סוללה → מערכות (צל) */}
      {charging && !shade && (
        <path d="M 262 150 L 140 138" className="energy-flow" />
      )}
      {shade && <path d="M 102 158 L 102 196 L 180 210" className="energy-flow reverse" />}

      {/* בצל: הסוללה מזינה את המערכות */}
      {shade && (
        <g>
          <rect x={180} y={200} width={72} height={26} rx={6} className="systems-box" />
          <text x={216} y={218} textAnchor="middle" className="chamber-label">
            מערכות
          </text>
        </g>
      )}
    </svg>
  );
}

/** חידה 4: מקור הכוח — אנרגיה סולארית */
export function PowerPuzzle({
  hintsUsed,
  onSolve,
  onUseHint,
  onAddFinding,
  onClose,
}: PuzzleProps) {
  const [step, setStep] = useState<Step>(1);
  // שלב 2: מצב הלוח, צל, ומעקב אחר מה שנבדק
  const [panelIndex, setPanelIndex] = useState(0);
  const [shade, setShade] = useState(false);
  const [testedStates, setTestedStates] = useState<string[]>([PANEL_STATES[0].id]);
  const [testedShade, setTestedShade] = useState(false);
  // שלב 3: מערכות פעילות, קוד ומשוב
  const [activeSystems, setActiveSystems] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  // שלב 4
  const [restoring, setRestoring] = useState(true);
  const [litSystems, setLitSystems] = useState(0);
  const solvedRef = useRef(false);

  // גישה יציבה ל-callbacks — ההורה מתרנדר כל שנייה בגלל הטיימר
  const callbacksRef = useRef({ onAddFinding, onSolve });
  callbacksRef.current = { onAddFinding, onSolve };

  // נקודת הפעלה לאפקטים (סבב ליטוש): כניסה לחידה
  useEffect(() => {
    // כאן ניתן לחבר צליל/אפקט פתיחה בעתיד
  }, []);

  const panel = PANEL_STATES[panelIndex];

  const setPanelByIndex = (index: number) => {
    setPanelIndex(index);
    if (!shade) {
      setTestedStates((prev) =>
        prev.includes(PANEL_STATES[index].id)
          ? prev
          : [...prev, PANEL_STATES[index].id],
      );
    }
  };

  const toggleShade = () => {
    setShade((s) => {
      if (!s) setTestedShade(true);
      return !s;
    });
  };

  const exploreDone =
    testedStates.length === PANEL_STATES.length && testedShade;

  const production = shade ? 0 : panel.watts;
  const consumption = SYSTEMS.filter((s) => activeSystems.includes(s.id)).reduce(
    (sum, s) => sum + s.watts,
    0,
  );
  const deficit = consumption > production;

  const toggleSystem = (sys: SatelliteSystem) => {
    setActiveSystems((prev) =>
      prev.includes(sys.id)
        ? prev.filter((id) => id !== sys.id)
        : [...prev, sys.id],
    );
  };

  const activeList = SYSTEMS.filter((s) => activeSystems.includes(s.id));
  const calcText =
    activeList.length === 0
      ? 'לא הופעלו מערכות — 0 ואט'
      : `${activeList.map((s) => s.watts).join(' + ')} = ${consumption} ואט`;

  const pressKey = (digit: string) => {
    if (code.length >= 3) return;
    setCode(code + digit);
  };

  const submit = () => {
    if (code === '') {
      setFeedback(FEEDBACK_MISSING_4);
    } else if (panel.watts === 30) {
      setFeedback(FEEDBACK_30);
    } else if (panel.watts === 70) {
      setFeedback(FEEDBACK_70);
    } else if (Number(code) !== CORRECT_CODE_4) {
      setFeedback(FEEDBACK_WRONG_CODE_4);
    } else {
      // נקודת הפעלה לאפקטים (סבב ליטוש): פתרון נכון
      setFeedback(FEEDBACK_CORRECT_4);
      setTimeout(() => setStep(4), 1400);
    }
  };

  // שלב 4: הלוח פונה לשמש, הסוללה נטענת והמערכות נדלקות בהדרגה
  useEffect(() => {
    if (step !== 4) return;
    setRestoring(true);
    setLitSystems(0);
    const timers = SYSTEMS.map((_, i) =>
      setTimeout(() => setLitSystems(i + 1), 900 + i * 550),
    );
    const done = setTimeout(() => {
      if (!solvedRef.current) {
        solvedRef.current = true;
        callbacksRef.current.onAddFinding(POWER_FINDING);
        callbacksRef.current.onSolve();
      }
      setRestoring(false);
    }, 900 + SYSTEMS.length * 550 + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [step]);

  const currentHint =
    hintsUsed > 0 ? HINTS_4[Math.min(hintsUsed, HINTS_4.length) - 1] : null;

  const exploreFeedback = shade
    ? SHADE_FEEDBACK
    : `${panel.label} — ${panel.watts} ואט`;

  return (
    <div className="puzzle-overlay">
      {/* התקרבות קולנועית מכיוון עמדת הכוח והלוח הסולארי */}
      <div className="terminal" style={{ transformOrigin: '58% 47%' }}>
        <header className="terminal-header">
          <span className="terminal-title">
            <span aria-hidden="true">🔋</span>
            {TERMINAL_TITLE_4}
          </span>
          <span className="step-chip">שלב {step} מתוך {TOTAL_STEPS}</span>
          <button type="button" className="modal-button" onClick={onClose}>
            חזרה לחדר הבקרה
          </button>
        </header>

        {/* שלב 1 — הפסקת החשמל: המסך מחשיך בהדרגה */}
        {step === 1 && (
          <div className="terminal-step step-boot power-blackout">
            <div className="static-noise" aria-hidden="true" />
            <div className="blackout-veil" aria-hidden="true" />
            <p className="boot-message">{FAULT_MESSAGE_4}</p>
            <button
              type="button"
              className="modal-button primary step-next"
              onClick={() => setStep(2)}
            >
              הפעילו את מעבדת האנרגיה
            </button>
          </div>
        )}

        {/* שלב 2 — התנסות בלוח הסולארי */}
        {step === 2 && (
          <div className="terminal-step step-bench step-solar">
            <div className="bench-area">
              <SolarScene panel={panel} shade={shade} charging={!shade} />
              <div className="power-meter-row">
                <span className="power-meter-label">מד הספק:</span>
                <div className="power-meter">
                  <div
                    className="power-meter-fill"
                    style={{ width: `${production}%` }}
                  />
                </div>
                <span className="power-meter-value">{production} ואט</span>
              </div>
              <p className="bench-feedback">{exploreFeedback}</p>
            </div>

            <div className="bench-side">
              <label className="slider-label" htmlFor="panel-slider">
                סיבוב הלוח הסולארי
              </label>
              <input
                id="panel-slider"
                className="resolution-slider"
                type="range"
                min={0}
                max={PANEL_STATES.length - 1}
                step={1}
                value={panelIndex}
                onChange={(e) => setPanelByIndex(Number(e.target.value))}
              />
              <div className="slider-ticks" aria-hidden="true">
                {PANEL_STATES.map((state, i) => (
                  <span
                    key={state.id}
                    className={i === panelIndex ? 'tick current' : 'tick'}
                  >
                    {state.watts} ואט
                  </span>
                ))}
              </div>

              <button
                type="button"
                className={`modal-button shade-toggle${shade ? ' active' : ''}`}
                onClick={toggleShade}
                aria-pressed={shade}
              >
                {shade ? '☀️ חזרה לאור שמש' : '🌑 מעבר לצל'}
              </button>

              <p className="science-note">{SCIENCE_NOTE_4}</p>

              {exploreDone ? (
                <button
                  type="button"
                  className="modal-button primary step-next"
                  onClick={() => setStep(3)}
                >
                  עברו לתקציב האנרגיה
                </button>
              ) : (
                <p className="choice-progress">
                  בדקו את שלושת מצבי הלוח ואת מצב הצל ({testedStates.length}/3
                  מצבים, צל: {testedShade ? 'נבדק' : 'טרם'})
                </p>
              )}
            </div>
          </div>
        )}

        {/* שלב 3 — תקציב האנרגיה */}
        {step === 3 && (
          <div className="terminal-step step-mission step-budget">
            <div className="bench-area budget-bench">
              <SolarScene
                panel={panel}
                shade={false}
                charging={!deficit && activeList.length > 0}
              />
              <label className="slider-label" htmlFor="budget-slider">
                סיבוב הלוח הסולארי
              </label>
              <input
                id="budget-slider"
                className="resolution-slider"
                type="range"
                min={0}
                max={PANEL_STATES.length - 1}
                step={1}
                value={panelIndex}
                onChange={(e) => setPanelIndex(Number(e.target.value))}
              />
              <div className="power-meter-row">
                <span className="power-meter-label">
                  צריכה {consumption} / תפוקה {production} ואט
                </span>
                <div className={`power-meter${deficit ? ' danger' : ' ok'}`}>
                  <div
                    className="power-meter-fill"
                    style={{
                      width: `${Math.min(100, (consumption / Math.max(production, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="pixel-count budget-calc" aria-live="polite">
                {calcText}
              </p>
            </div>

            <div className="mission-side">
              <p className="mission-message">{MISSION_MESSAGE_4}</p>

              <div className="element-row" role="group" aria-label="מערכות הלוויין">
                {SYSTEMS.map((sys) => (
                  <button
                    key={sys.id}
                    type="button"
                    className={`element-card system-card${
                      activeSystems.includes(sys.id) ? ' placed' : ''
                    }${deficit && activeSystems.includes(sys.id) ? ' blink' : ''}`}
                    onClick={() => toggleSystem(sys)}
                    aria-pressed={activeSystems.includes(sys.id)}
                  >
                    <span className="medium-icon" aria-hidden="true">{sys.icon}</span>
                    <span>{sys.label}</span>
                    <span className="system-watts">{sys.watts} ואט</span>
                  </button>
                ))}
              </div>

              <div className="status-area">
                <p
                  className={`status-feedback${feedback ? '' : ' empty'}`}
                  role={feedback ? 'alert' : undefined}
                >
                  {feedback ??
                    'הפעילו את המערכות, כוונו את הלוח והזינו את ההספק הדרוש.'}
                </p>
                <div className="status-hint">
                  <button
                    type="button"
                    className="modal-button hint-button"
                    onClick={onUseHint}
                    disabled={hintsUsed >= HINTS_4.length}
                  >
                    רמז ({hintsUsed}/{HINTS_4.length})
                  </button>
                  <span className={`hint-text${currentHint ? '' : ' empty'}`}>
                    {currentHint ?? 'זקוקים לכיוון? בקשו רמז.'}
                  </span>
                </div>
              </div>

              <div className="keypad-block compact">
                <div className="keypad-display" aria-live="polite">
                  {code === '' ? 'ההספק המינימלי בוואט' : code}
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
                  חיבור המערכות לחשמל
                </button>
              </div>
            </div>
          </div>
        )}

        {/* שלב 4 — הצלחה */}
        {step === 4 && (
          <div className="terminal-step step-success">
            <div className="success-bench">
              <SolarScene panel={PANEL_STATES[2]} shade={false} charging />
            </div>
            <div className="lit-systems-row">
              {SYSTEMS.map((sys, i) => (
                <span
                  key={sys.id}
                  className={`lit-system${i < litSystems ? ' on' : ''}`}
                >
                  {sys.icon} {sys.label}
                </span>
              ))}
            </div>
            {restoring ? (
              <p className="instruction-line">מחברים את המערכות לחשמל…</p>
            ) : (
              <div className="success-panel">
                <p className="success-message">✔ {SUCCESS_MESSAGE_4}</p>
                <div className="finding-card">
                  <span className="finding-title">{POWER_FINDING.title}</span>
                  <p>{POWER_FINDING.content}</p>
                </div>
                <p className="transition-message">{TRANSITION_MESSAGE_4}</p>
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
