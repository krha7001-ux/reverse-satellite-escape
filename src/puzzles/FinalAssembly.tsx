import { useEffect, useRef, useState } from 'react';
import {
  BACK_TO_ROOM_BUTTON,
  CHAIN_CARDS,
  CHAIN_INSTRUCTION,
  CHAIN_ORDER,
  CHAIN_SUCCESS,
  CHECK_CHAIN_BUTTON,
  DISCOVERY_CAPTION,
  DISCOVERY_ORDER,
  FEEDBACK_WRONG_CHAIN,
  FINAL_TERMINAL_TITLE,
  HINTS_FINAL,
  NEW_GAME_BUTTON,
  NEW_GAME_CONFIRM,
  RELAUNCH_BUTTON,
  REPLAY_BUTTON,
  REVERSE_BUTTON,
  SHUFFLED_ORDER,
  SUCCESS_SUBTITLE,
  SUCCESS_TITLE,
  SYSTEM_CHECKS,
  VERIFIED_LABEL,
  VERIFY_BUTTON,
} from '../data/finalAssembly';
import type { UiSound } from '../hooks/useUiSounds';
import { Modal } from '../components/Modal';

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

interface FinalAssemblyProps {
  teamName: string;
  /** סך הרמזים שנוצלו בשש החידות (נתון אמין מ-localStorage) */
  hintsTotal: number;
  /** הזמן שנותר כרגע (חי) */
  liveRemainingSeconds: number;
  /** האם חידת הסיום כבר הושלמה, והזמן שנשמר בעת ההשלמה */
  completed: boolean;
  completedRemainingSeconds: number | null;
  playSound: (sound: UiSound) => void;
  onComplete: (remainingSeconds: number) => void;
  onClose: () => void;
  onNewGame: () => void;
}

/** רצף ההפעלה: מספר השלב הקולנועי הנוכחי (0 = טרם החל) */
const LAUNCH_STAGES = 7;

/** חידת הסיום: שחזור שרשרת הפיתוח והפעלה מחדש של הלוויין */
export function FinalAssembly({
  teamName,
  hintsTotal,
  liveRemainingSeconds,
  completed,
  completedRemainingSeconds,
  playSound,
  onComplete,
  onClose,
  onNewGame,
}: FinalAssemblyProps) {
  // אם החידה כבר הושלמה (למשל אחרי רענון) — ישר למסך ההצלחה
  const [mode, setMode] = useState<'steps' | 'launch' | 'success'>(
    completed ? 'success' : 'steps',
  );
  const [step, setStep] = useState<Step>(1);
  // שלב 2: סדר הכרטיסים, בחירה להחלפה, גרירה
  const [order, setOrder] = useState<string[]>([...SHUFFLED_ORDER]);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [chainSolved, setChainSolved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  // שלב 3: מערכות מאומתות
  const [verified, setVerified] = useState<string[]>([]);
  // שלב 4: רצף ההפעלה
  const [launchStage, setLaunchStage] = useState(0);
  const [confirmNewGame, setConfirmNewGame] = useState(false);
  const completeRef = useRef(false);
  const liveRemainingRef = useRef(liveRemainingSeconds);
  liveRemainingRef.current = liveRemainingSeconds;
  const callbacksRef = useRef({ onComplete, playSound });
  callbacksRef.current = { onComplete, playSound };

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- שלב 2: סידור השרשרת ---------- */

  const swap = (a: number, b: number) => {
    if (chainSolved || a === b) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
    setFeedback(null);
  };

  const moveCard = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    swap(index, target);
  };

  const cardClick = (index: number) => {
    if (chainSolved) return;
    if (selected === null) {
      setSelected(index);
    } else {
      swap(selected, index);
      setSelected(null);
    }
  };

  // גרירה בהתאמה אישית: שחרור מעל כרטיס אחר מחליף ביניהם
  const startDrag = (index: number, e: React.PointerEvent) => {
    if (chainSolved) return;
    if ((e.target as HTMLElement).closest('.chain-move')) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragIndex(index);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const moveDrag = (e: React.PointerEvent) => {
    if (dragIndex === null) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (dragIndex === null) return;
    const el = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest('[data-chain-index]');
    if (el) {
      const target = Number((el as HTMLElement).dataset.chainIndex);
      if (target !== dragIndex) {
        swap(dragIndex, target);
      } else {
        // שחרור במקום = לחיצה לבחירה
        cardClick(dragIndex);
      }
    }
    setDragIndex(null);
  };

  const checkChain = () => {
    if (order.every((id, i) => id === CHAIN_ORDER[i])) {
      setFeedback(null);
      setChainSolved(true);
      callbacksRef.current.playSound('success');
    } else {
      setFeedback(FEEDBACK_WRONG_CHAIN);
    }
  };

  /* ---------- שלב 3: אימות מערכות ---------- */

  const verifySystem = (id: string, sound: UiSound) => {
    setVerified((prev) => {
      if (prev.includes(id)) return prev;
      callbacksRef.current.playSound(sound);
      return [...prev, id];
    });
  };

  /* ---------- שלב 4: רצף ההפעלה ---------- */

  const startLaunch = () => {
    setMode('launch');
    setLaunchStage(0);
    callbacksRef.current.playSound('power');
  };

  useEffect(() => {
    if (mode !== 'launch') return;
    // רצף קולנועי של ~10 שניות; בגרסה מקוצרת (prefers-reduced-motion) ~2.5 שניות
    const stageMs = reducedMotion ? 320 : 1350;
    const sounds: Array<UiSound | null> = [
      null, 'power', 'power', 'verify', 'rotate', 'rotate', 'transmit',
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let stage = 1; stage <= LAUNCH_STAGES; stage++) {
      timers.push(
        setTimeout(() => {
          setLaunchStage(stage);
          const s = sounds[stage - 1];
          if (s) callbacksRef.current.playSound(s);
        }, stage * stageMs),
      );
    }
    timers.push(
      setTimeout(() => {
        // נקודת חיבור לאפקטים: השלמת רצף ההפעלה — הטיימר נעצר כאן
        if (!completeRef.current && !completed) {
          completeRef.current = true;
          callbacksRef.current.onComplete(liveRemainingRef.current);
        }
        callbacksRef.current.playSound('success');
        setMode('success');
      }, (LAUNCH_STAGES + 1) * stageMs + (reducedMotion ? 200 : 600)),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, reducedMotion]);

  const currentHint =
    hintsUsed > 0 ? HINTS_FINAL[Math.min(hintsUsed, HINTS_FINAL.length) - 1] : null;

  const shownRemaining = completedRemainingSeconds ?? liveRemainingSeconds;

  return (
    <div className="puzzle-overlay">
      <div className="terminal final-terminal" style={{ transformOrigin: '50% 60%' }}>
        <header className="terminal-header">
          <span className="terminal-title">
            <span aria-hidden="true">🛰️</span>
            {FINAL_TERMINAL_TITLE}
          </span>
          {mode === 'steps' && (
            <span className="step-chip">שלב {step} מתוך {TOTAL_STEPS}</span>
          )}
          <button type="button" className="modal-button" onClick={onClose}>
            {BACK_TO_ROOM_BUTTON}
          </button>
        </header>

        {/* שלב 1 — סקירת הממצאים */}
        {mode === 'steps' && step === 1 && (
          <div className="terminal-step step-review">
            <p className="instruction-line">{DISCOVERY_CAPTION}</p>
            <div className="discovery-row" role="list" aria-label="הממצאים בסדר הגילוי">
              {DISCOVERY_ORDER.map((item, i) => (
                <div className="discovery-item" role="listitem" key={item.id}>
                  <div className="discovery-card">
                    <span className="discovery-num">{i + 1}</span>
                    <span className="evidence-icon" aria-hidden="true">{item.icon}</span>
                    <strong>{item.title}</strong>
                    <span className="discovery-text">{item.text}</span>
                  </div>
                  {i < DISCOVERY_ORDER.length - 1 && (
                    <span className="discovery-arrow" aria-hidden="true">←</span>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="modal-button primary step-next"
              onClick={() => setStep(2)}
            >
              {REVERSE_BUTTON}
            </button>
          </div>
        )}

        {/* שלב 2 — הרכבת שרשרת הפיתוח */}
        {mode === 'steps' && step === 2 && (
          <div
            className="terminal-step step-chain"
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={() => setDragIndex(null)}
          >
            <p className="instruction-line">{CHAIN_INSTRUCTION}</p>
            <div
              className={`chain-row${chainSolved ? ' solved' : ''}`}
              role="list"
              aria-label="כרטיסי שרשרת הפיתוח"
            >
              {order.map((id, index) => {
                const card = CHAIN_CARDS.find((c) => c.id === id)!;
                return (
                  <div className="chain-slot" role="listitem" key={id}>
                    <div
                      className={`chain-card${selected === index ? ' selected' : ''}${
                        dragIndex === index ? ' dragging' : ''
                      }`}
                      data-chain-index={index}
                      tabIndex={0}
                      role="button"
                      aria-label={`כרטיס ${card.title}, מיקום ${index + 1} מתוך 6`}
                      style={chainSolved ? { transitionDelay: `${index * 0.18}s` } : undefined}
                      onPointerDown={(e) => startDrag(index, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          cardClick(index);
                        }
                      }}
                    >
                      <span className="evidence-icon" aria-hidden="true">{card.icon}</span>
                      <strong>{card.title}</strong>
                      <span className="chain-text">{card.text}</span>
                      {!chainSolved && (
                        <span className="chain-moves">
                          <button
                            type="button"
                            className="chain-move"
                            aria-label={`הזזת ${card.title} מיקום אחד אחורה`}
                            disabled={index === 0}
                            onClick={() => moveCard(index, -1)}
                          >
                            ▶
                          </button>
                          <button
                            type="button"
                            className="chain-move"
                            aria-label={`הזזת ${card.title} מיקום אחד קדימה`}
                            disabled={index === order.length - 1}
                            onClick={() => moveCard(index, 1)}
                          >
                            ◀
                          </button>
                        </span>
                      )}
                    </div>
                    {index < order.length - 1 && (
                      <span className="chain-link" aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="status-area chain-status">
              <p
                className={`status-feedback${feedback || chainSolved ? '' : ' empty'}`}
                role={feedback ? 'alert' : undefined}
              >
                {chainSolved ? `✔ ${CHAIN_SUCCESS}` : feedback ?? 'סדרו את השרשרת ולחצו על בדיקה.'}
              </p>
              <div className="status-hint">
                <button
                  type="button"
                  className="modal-button hint-button"
                  onClick={() => setHintsUsed((h) => Math.min(h + 1, HINTS_FINAL.length))}
                  disabled={chainSolved || hintsUsed >= HINTS_FINAL.length}
                >
                  רמז ({hintsUsed}/{HINTS_FINAL.length})
                </button>
                <span className={`hint-text${currentHint ? '' : ' empty'}`}>
                  {currentHint ?? 'זקוקים לכיוון? בקשו רמז.'}
                </span>
                {chainSolved ? (
                  <button
                    type="button"
                    className="modal-button primary"
                    onClick={() => setStep(3)}
                  >
                    המשיכו לבדיקת המערכות
                  </button>
                ) : (
                  <button
                    type="button"
                    className="modal-button primary"
                    onClick={checkChain}
                  >
                    {CHECK_CHAIN_BUTTON}
                  </button>
                )}
              </div>
            </div>

            {dragIndex !== null && (
              <div
                className="drag-ghost chain-ghost"
                style={{ left: dragPos.x, top: dragPos.y }}
                aria-hidden="true"
              >
                {CHAIN_CARDS.find((c) => c.id === order[dragIndex])?.title}
              </div>
            )}
          </div>
        )}

        {/* שלב 3 — בדיקת מערכות הלוויין */}
        {mode === 'steps' && step === 3 && (
          <div className="terminal-step step-systems">
            <p className="instruction-line">
              אמתו את חמש המערכות המשוחזרות כדי לאפשר הפעלה מחדש.
            </p>
            <div className="systems-board" role="list" aria-label="מערכות הלוויין">
              {SYSTEM_CHECKS.map((sys) => {
                const ok = verified.includes(sys.id);
                return (
                  <div
                    key={sys.id}
                    className={`system-row${ok ? ' ok' : ''}`}
                    role="listitem"
                  >
                    <span className="medium-icon" aria-hidden="true">{sys.icon}</span>
                    <span className="system-info">
                      <strong>{sys.title}</strong>
                      <span className="system-fact">{sys.fact}</span>
                    </span>
                    <span
                      className={`system-status${ok ? ' ok' : ''}`}
                      aria-live="polite"
                    >
                      {ok ? VERIFIED_LABEL : 'כבוי'}
                    </span>
                    <button
                      type="button"
                      className={`modal-button verify-button${ok ? ' done' : ''}`}
                      onClick={() => verifySystem(sys.id, sys.sound)}
                      disabled={ok}
                      aria-label={`${VERIFY_BUTTON} ${sys.title}`}
                    >
                      {ok ? '✓' : VERIFY_BUTTON}
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className="modal-button primary relaunch-button"
              disabled={verified.length < SYSTEM_CHECKS.length}
              onClick={() => {
                setStep(4);
                startLaunch();
              }}
            >
              🚀 {RELAUNCH_BUTTON}
              {verified.length < SYSTEM_CHECKS.length &&
                ` (אומתו ${verified.length} מתוך ${SYSTEM_CHECKS.length})`}
            </button>
          </div>
        )}

        {/* שלב 4 — רצף ההפעלה הקולנועי */}
        {mode === 'launch' && (
          <div
            className={`terminal-step step-launch stage-${launchStage}`}
            data-launch-stage={launchStage}
          >
            <svg
              className="launch-svg"
              viewBox="0 0 900 430"
              role="img"
              aria-label="רצף הפעלת הלוויין מחדש"
            >
              {/* תאורת חדר הבקרה נדלקת (שלב 1) */}
              <rect
                x={0} y={0} width={900} height={430}
                className={`launch-bg${launchStage >= 1 ? ' on' : ''}`}
              />

              {/* כדור הארץ */}
              <circle cx={450} cy={560} r={260} className="earth-body launch-earth" />

              {/* מסלול זוהר (שלב 6) */}
              <ellipse
                cx={450} cy={520} rx={330} ry={200}
                className={`launch-orbit${launchStage >= 6 ? ' on' : ''}`}
              />

              {/* קווי חשמל זוהרים אל הלוויין (שלב 2) */}
              <path
                d="M 130 380 C 240 300 330 240 430 190"
                className={`power-line${launchStage >= 2 ? ' on' : ''}`}
              />
              <path
                d="M 770 380 C 660 300 570 240 470 190"
                className={`power-line${launchStage >= 2 ? ' on' : ''}`}
              />

              {/* תחנת קרקע */}
              <g className="launch-station">
                <rect x={120} y={368} width={54} height={30} rx={5} />
                <path d="M 132 368 A 18 18 0 0 1 160 368 Z" />
                <text x={147} y={416} textAnchor="middle" className="chamber-label">
                  תחנת קרקע
                </text>
              </g>

              {/* אלומת השידור (שלב 7) */}
              <path
                d="M 440 200 L 160 370 L 480 215 Z"
                className={`beam${launchStage >= 7 ? ' on' : ''}`}
              />

              {/* הלוויין */}
              <g className="launch-sat">
                <rect x={415} y={160} width={70} height={52} rx={8} className="sat-body" />
                {/* פאנלים סולאריים נפתחים (שלב 3) */}
                <g
                  className={`launch-panel panel-right${launchStage >= 3 ? ' open' : ''}`}
                  style={{ transformOrigin: '489px 186px' }}
                >
                  <rect x={489} y={170} width={78} height={32} rx={4} />
                </g>
                <g
                  className={`launch-panel panel-left${launchStage >= 3 ? ' open' : ''}`}
                  style={{ transformOrigin: '411px 186px' }}
                >
                  <rect x={333} y={170} width={78} height={32} rx={4} />
                </g>
                {/* עדשת המצלמה נדלקת (שלב 4) */}
                <circle
                  cx={450} cy={218} r={11}
                  className={`cam-lens${launchStage >= 4 ? ' on' : ''}`}
                />
                {/* צלחת השידור מתכווננת (שלב 5) */}
                <g
                  className={`sat-dish${launchStage >= 5 ? ' aimed' : ''}`}
                  style={{ transformOrigin: '450px 158px' }}
                >
                  <path d="M 432 158 A 18 18 0 0 1 468 158 Z" />
                  <line x1={450} y1={158} x2={450} y2={144} />
                </g>
              </g>
            </svg>
            <p className="launch-caption" aria-live="polite">
              {[
                'מכינים את רצף ההפעלה…',
                'תאורת חדר הבקרה נדלקת…',
                'קווי החשמל נטענים…',
                'הפאנלים הסולאריים נפתחים…',
                'עדשת המצלמה נדלקת…',
                'צלחת השידור מתכווננת…',
                'המסלול משוחזר…',
                'אלומת השידור נשלחת לתחנת הקרקע…',
              ][launchStage]}
            </p>
          </div>
        )}

        {/* מסך ההצלחה */}
        {mode === 'success' && (
          <div className="terminal-step step-final-success">
            <h2 className="final-title">🛰️ {SUCCESS_TITLE}</h2>
            <p className="transition-message">{SUCCESS_SUBTITLE}</p>

            <div className="final-stats" role="list" aria-label="נתוני הסיום">
              <div className="final-stat" role="listitem">
                <span className="final-stat-label">צוות</span>
                <strong>{teamName}</strong>
              </div>
              <div className="final-stat" role="listitem">
                <span className="final-stat-label">חידות</span>
                <strong>6 מתוך 6 הושלמו</strong>
              </div>
              <div className="final-stat" role="listitem">
                <span className="final-stat-label">זמן שנותר</span>
                <strong>{formatTime(shownRemaining)}</strong>
              </div>
              <div className="final-stat" role="listitem">
                <span className="final-stat-label">רמזים שנוצלו</span>
                <strong>{hintsTotal}</strong>
              </div>
            </div>

            <div className="final-chain" aria-label="שרשרת הפיתוח המלאה">
              {CHAIN_ORDER.map((id, i) => {
                const card = CHAIN_CARDS.find((c) => c.id === id)!;
                return (
                  <span key={id} className="final-chain-item">
                    <span className="final-chip">
                      {card.icon} {card.title}
                    </span>
                    {i < CHAIN_ORDER.length - 1 && (
                      <span className="discovery-arrow" aria-hidden="true">←</span>
                    )}
                  </span>
                );
              })}
            </div>

            <div className="final-actions">
              <button
                type="button"
                className="modal-button"
                onClick={() => {
                  // צפייה מחדש: מריצה את הרצף בלבד, בלי לגעת בזמן או בנתונים
                  startLaunch();
                }}
              >
                ▶ {REPLAY_BUTTON}
              </button>
              <button type="button" className="modal-button" onClick={onClose}>
                {BACK_TO_ROOM_BUTTON}
              </button>
              <button
                type="button"
                className="modal-button danger"
                onClick={() => setConfirmNewGame(true)}
              >
                {NEW_GAME_BUTTON}
              </button>
            </div>
          </div>
        )}

        {confirmNewGame && (
          <Modal
            title={<><span aria-hidden="true">⚠️</span>משחק חדש</>}
            onClose={() => setConfirmNewGame(false)}
            actions={
              <>
                <button
                  type="button"
                  className="modal-button danger"
                  onClick={onNewGame}
                >
                  כן, להתחיל מחדש
                </button>
                <button
                  type="button"
                  className="modal-button"
                  onClick={() => setConfirmNewGame(false)}
                >
                  ביטול
                </button>
              </>
            }
          >
            {NEW_GAME_CONFIRM}
          </Modal>
        )}
      </div>
    </div>
  );
}
