import { useEffect, useRef, useState } from 'react';
import type { PuzzleProps } from '../types/game';
import {
  CAPABILITY_OPTIONS,
  CAPABILITY_QUESTION,
  CAPABILITY_SUCCESS,
  CODE_PROMPT,
  CORRECT_CAPABILITY,
  CORRECT_CODE_6,
  CORRECT_MISSION,
  DECISIVE_EVIDENCE,
  EVIDENCE_CARDS,
  EVIDENCE_PROMPT,
  FEEDBACK_MISSING_6,
  FEEDBACK_WRONG_CODE_6,
  FEEDBACK_WRONG_EVIDENCE,
  FEEDBACK_WRONG_MISSION,
  FILE_INTRO,
  HINTS_6,
  MISSION_FILES,
  MISSION_FILE_FINDING,
  NEED_TEXT,
  SUCCESS_MESSAGE_6,
  TERMINAL_TITLE_6,
} from '../data/missionFilePuzzle';

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

/** חידה 6: תיק המשימה המקורי — למה נבנה הלוויין? */
export function MissionFilePuzzle({
  hintsUsed,
  onSolve,
  onUseHint,
  onAddFinding,
  onClose,
}: PuzzleProps) {
  const [step, setStep] = useState<Step>(1);
  // שלב 1: ראיות שנבדקו
  const [reviewed, setReviewed] = useState<string[]>([]);
  // שלב 2: לוח החקירה
  const [capability, setCapability] = useState<string | null>(null);
  const [capabilitySolved, setCapabilitySolved] = useState(false);
  // שלב 3: תיק וראיות מכריעות
  const [mission, setMission] = useState<number | null>(null);
  const [decisive, setDecisive] = useState<string[]>([]);
  // שלב 4: קוד וחשיפה
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [solved, setSolved] = useState(false);
  const solvedRef = useRef(false);

  // גישה יציבה ל-callbacks — ההורה מתרנדר כל שנייה בגלל הטיימר
  const callbacksRef = useRef({ onAddFinding, onSolve });
  callbacksRef.current = { onAddFinding, onSolve };

  // נקודת חיבור לאפקטים (פתיחת כספת/תיק מסווג): כניסה לחידה
  useEffect(() => {
    // כאן יחובר אפקט פתיחת הכספת בסבב האפקטים
  }, []);

  const reviewEvidence = (id: string) => {
    setReviewed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const chooseCapability = (id: string) => {
    setCapability(id);
    if (id === CORRECT_CAPABILITY) {
      setCapabilitySolved(true);
      setFeedback(null);
    } else {
      const option = CAPABILITY_OPTIONS.find((o) => o.id === id);
      setFeedback(option?.feedback ?? null);
    }
  };

  const toggleDecisive = (id: string) => {
    setDecisive((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
    setFeedback(null);
  };

  const submitFile = () => {
    if (mission === null || decisive.length !== 3) {
      setFeedback(FEEDBACK_MISSING_6);
    } else if (mission !== CORRECT_MISSION) {
      setFeedback(FEEDBACK_WRONG_MISSION);
    } else if (
      !DECISIVE_EVIDENCE.every((id) => decisive.includes(id))
    ) {
      setFeedback(FEEDBACK_WRONG_EVIDENCE);
    } else {
      setFeedback(null);
      setStep(4);
    }
  };

  const pressKey = (digit: string) => {
    if (code.length >= 2) return;
    setCode(code + digit);
  };

  const submitCode = () => {
    if (code === '') {
      setFeedback(CODE_PROMPT);
    } else if (Number(code) !== CORRECT_CODE_6) {
      setFeedback(FEEDBACK_WRONG_CODE_6);
    } else {
      // נקודת חיבור לאפקטים: אישור תיק המשימה ופתרון החידה האחרונה
      setFeedback(null);
      setRevealing(true);
    }
  };

  // אנימציית חשיפת התיק, ואז סימון הפתרון
  useEffect(() => {
    if (!revealing) return;
    const done = setTimeout(() => {
      if (!solvedRef.current) {
        solvedRef.current = true;
        callbacksRef.current.onAddFinding(MISSION_FILE_FINDING);
        // אחרי הקריאה הזו solvedStations יכיל את כל שש התחנות —
        // isMissionComplete (hooks/useGameState) הוא נקודת החיבור לחידת הסיום
        callbacksRef.current.onSolve();
      }
      setRevealing(false);
      setSolved(true);
    }, 1700);
    return () => clearTimeout(done);
  }, [revealing]);

  const currentHint =
    hintsUsed > 0 ? HINTS_6[Math.min(hintsUsed, HINTS_6.length) - 1] : null;

  return (
    <div className="puzzle-overlay">
      {/* התקרבות קולנועית מכיוון הכספת שבצד ימין של החדר */}
      <div className="terminal" style={{ transformOrigin: '86% 46%' }}>
        <header className="terminal-header">
          <span className="terminal-title">
            <span aria-hidden="true">🗂️</span>
            {TERMINAL_TITLE_6}
          </span>
          <span className="step-chip">שלב {step} מתוך {TOTAL_STEPS}</span>
          <button type="button" className="modal-button" onClick={onClose}>
            חזרה לחדר הבקרה
          </button>
        </header>

        {/* שלב 1 — פתיחת תיק המשימה: חמש ראיות */}
        {step === 1 && (
          <div className="terminal-step step-evidence">
            <div className="file-header">
              <span className="classified-stamp">מסווג</span>
              <p className="instruction-line">{FILE_INTRO}</p>
            </div>
            <div className="evidence-grid" role="group" aria-label="ראיות התיק">
              {EVIDENCE_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`evidence-card${reviewed.includes(card.id) ? ' reviewed' : ''}`}
                  onClick={() => reviewEvidence(card.id)}
                  aria-pressed={reviewed.includes(card.id)}
                  aria-label={`ראיה: ${card.text}`}
                >
                  <span className="evidence-icon" aria-hidden="true">{card.icon}</span>
                  <span className="evidence-text">{card.text}</span>
                  {reviewed.includes(card.id) && (
                    <span className="tried-mark" aria-label="נבדקה">✓</span>
                  )}
                </button>
              ))}
            </div>
            {reviewed.length === EVIDENCE_CARDS.length ? (
              <button
                type="button"
                className="modal-button primary step-next"
                onClick={() => setStep(2)}
              >
                עברו ללוח החקירה
              </button>
            ) : (
              <p className="choice-progress">
                נבדקו {reviewed.length} מתוך {EVIDENCE_CARDS.length} ראיות — לחצו על כל ראיה כדי לבדוק אותה
              </p>
            )}
          </div>
        )}

        {/* שלב 2 — לוח החקירה */}
        {step === 2 && (
          <div className="terminal-step step-capability">
            <p className="mission-message capability-question">
              {CAPABILITY_QUESTION}
            </p>
            <div className="capability-list" role="group" aria-label="יכולות אפשריות">
              {CAPABILITY_OPTIONS.map((option, i) => (
                <button
                  key={option.id}
                  type="button"
                  className={`capability-option${capability === option.id ? ' chosen' : ''}${
                    capabilitySolved && option.id === CORRECT_CAPABILITY ? ' correct' : ''
                  }`}
                  onClick={() => chooseCapability(option.id)}
                  disabled={capabilitySolved}
                >
                  <span className="capability-letter" aria-hidden="true">
                    {['א', 'ב', 'ג', 'ד'][i]}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
            <p
              className={`status-feedback${feedback || capabilitySolved ? '' : ' empty'}`}
              role={feedback ? 'alert' : undefined}
            >
              {capabilitySolved
                ? CAPABILITY_SUCCESS
                : feedback ?? 'בחרו את היכולת המשותפת. אפשר לנסות שוב.'}
            </p>
            {capabilitySolved && (
              <button
                type="button"
                className="modal-button primary step-next"
                onClick={() => {
                  setFeedback(null);
                  setStep(3);
                }}
              >
                עברו לשחזור הצורך המקורי
              </button>
            )}
          </div>
        )}

        {/* שלב 3 — שחזור הצורך המקורי */}
        {step === 3 && (
          <div className="terminal-step step-mission step-file-mission">
            <div className="mission-side files-side">
              <p className="instruction-line">{EVIDENCE_PROMPT}</p>
              <div className="mission-files" role="group" aria-label="תיקי משימה">
                {MISSION_FILES.map((file) => (
                  <button
                    key={file.num}
                    type="button"
                    className={`capability-option file-option${mission === file.num ? ' chosen' : ''}`}
                    onClick={() => {
                      setMission(file.num);
                      setFeedback(null);
                    }}
                    aria-pressed={mission === file.num}
                  >
                    <span className="capability-letter" aria-hidden="true">{file.num}</span>
                    {file.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mission-side">
              <p className="slider-label">ראיות מכריעות (בחרו שלוש):</p>
              <div className="evidence-grid compact" role="group" aria-label="בחירת ראיות מכריעות">
                {EVIDENCE_CARDS.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className={`evidence-card small${decisive.includes(card.id) ? ' reviewed' : ''}`}
                    onClick={() => toggleDecisive(card.id)}
                    aria-pressed={decisive.includes(card.id)}
                  >
                    <span className="evidence-icon" aria-hidden="true">{card.icon}</span>
                    <span className="evidence-text">{card.text}</span>
                    {decisive.includes(card.id) && (
                      <span className="tried-mark" aria-label="נבחרה">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p
                className={`status-feedback${feedback ? '' : ' empty'}`}
                role={feedback ? 'alert' : undefined}
              >
                {feedback ?? `נבחרו ${decisive.length} מתוך 3 ראיות מכריעות.`}
              </p>
              <button
                type="button"
                className="modal-button primary step-next"
                onClick={submitFile}
              >
                אישור תיק המשימה
              </button>
            </div>
          </div>
        )}

        {/* שלב 4 — אימות תיק המשימה */}
        {step === 4 && !solved && (
          <div className="terminal-step step-mission step-verify">
            <div className="mission-side">
              <div className={`classified-file${revealing ? ' opening' : ''}`}>
                <span className="classified-stamp">מסווג · שוחזר</span>
                <p className="need-text">{NEED_TEXT}</p>
              </div>
              <div className="status-area">
                <p
                  className={`status-feedback${feedback ? '' : ' empty'}`}
                  role={feedback ? 'alert' : undefined}
                >
                  {feedback ?? CODE_PROMPT}
                </p>
                <div className="status-hint">
                  <button
                    type="button"
                    className="modal-button hint-button"
                    onClick={onUseHint}
                    disabled={hintsUsed >= HINTS_6.length}
                  >
                    רמז ({hintsUsed}/{HINTS_6.length})
                  </button>
                  <span className={`hint-text${currentHint ? '' : ' empty'}`}>
                    {currentHint ?? 'זקוקים לכיוון? בקשו רמז.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mission-side keypad-side">
              <div className="keypad-block compact">
                <div className="keypad-display" aria-live="polite">
                  {code === '' ? 'מספר תיק המשימה' : code}
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
                  onClick={submitCode}
                  disabled={revealing}
                >
                  {revealing ? 'חושף את התיק…' : 'בדיקת הקוד'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* הצלחה — התיק נחשף */}
        {step === 4 && solved && (
          <div className="terminal-step step-success">
            <div className="classified-file open">
              <span className="classified-stamp approved">תיק מס' 3 · אושר</span>
              <p className="need-text">{NEED_TEXT}</p>
            </div>
            <div className="success-panel">
              <p className="success-message">✔ {SUCCESS_MESSAGE_6}</p>
              <div className="finding-card">
                <span className="finding-title">{MISSION_FILE_FINDING.title}</span>
                <p>{MISSION_FILE_FINDING.content}</p>
              </div>
              <button
                type="button"
                className="modal-button primary"
                onClick={onClose}
              >
                חזרה לחדר הבקרה
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
