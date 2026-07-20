import { useEffect, useRef, useState } from 'react';
import type { PuzzleProps } from '../types/game';
import {
  BOOT_MESSAGE,
  CORRECT_CODE,
  CORRECT_RESOLUTION,
  FEEDBACK_16,
  FEEDBACK_64,
  FEEDBACK_MISSING,
  FEEDBACK_WRONG_CODE,
  HINTS,
  LAST_PHOTO_FINDING,
  MISSION_MESSAGE,
  MISSION_OPTIONS,
  RESOLUTION_LEVELS,
  RESTORE_INSTRUCTION,
  SCIENCE_NOTE,
  SUCCESS_MESSAGE,
  TRANSITION_MESSAGE,
} from '../data/lastPhotoPuzzle';
import { PixelatedPhoto } from './PixelatedPhoto';

/** שלבי החידה: קליטה → התנסות → משימה → הצלחה */
type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

const formatNumber = (n: number) => n.toLocaleString('he-IL');

/** חידה 1: התצלום האחרון — רזולוציה ופיקסלים, בארבעה שלבים */
export function LastPhotoPuzzle({
  hintsUsed,
  onSolve,
  onUseHint,
  onAddFinding,
  onClose,
}: PuzzleProps) {
  const [step, setStep] = useState<Step>(1);
  const [resolution, setResolution] = useState<number>(64);
  const [chosen, setChosen] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  // מאותחל ל-true כדי שכניסה לשלב 4 תתחיל באנימציית השחזור ללא הבזק
  const [restoring, setRestoring] = useState(true);
  const solvedRef = useRef(false);

  // גישה יציבה ל-callbacks — הרכיב ההורה מתרנדר כל שנייה בגלל הטיימר,
  // ותלות ישירה בהם הייתה מאפסת את אנימציית השחזור שוב ושוב
  const callbacksRef = useRef({ onAddFinding, onSolve });
  callbacksRef.current = { onAddFinding, onSolve };

  // שלב ד: אנימציית שחזור קצרה — התמונה מתחדדת עד לרזולוציה הנכונה
  useEffect(() => {
    if (step !== 4) return;
    setRestoring(true);
    const timers = [
      setTimeout(() => setResolution(8), 0),
      setTimeout(() => setResolution(16), 400),
      setTimeout(() => setResolution(CORRECT_RESOLUTION), 800),
    ];
    const done = setTimeout(() => {
      if (!solvedRef.current) {
        solvedRef.current = true;
        callbacksRef.current.onAddFinding(LAST_PHOTO_FINDING);
        callbacksRef.current.onSolve();
      }
      setRestoring(false);
    }, 1500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [step]);

  const chooseOption = (option: number) => {
    setChosen(option);
    setResolution(option);
    setFeedback(null);
  };

  const pressKey = (digit: string) => {
    if (code.length >= 5) return;
    setCode(code + digit);
  };

  const submit = () => {
    if (chosen === null || code === '') {
      setFeedback(FEEDBACK_MISSING);
    } else if (chosen === 16) {
      setFeedback(FEEDBACK_16);
    } else if (chosen === 64) {
      setFeedback(FEEDBACK_64);
    } else if (Number(code) !== CORRECT_CODE) {
      setFeedback(FEEDBACK_WRONG_CODE);
    } else {
      setFeedback(null);
      setStep(4);
    }
  };

  const currentHint = hintsUsed > 0 ? HINTS[Math.min(hintsUsed, HINTS.length) - 1] : null;

  return (
    <div className="puzzle-overlay">
      <div className="terminal">
        <header className="terminal-header">
          <span className="terminal-title">
            <span aria-hidden="true">🛰️</span>
            מסוף הדמיה · התצלום האחרון
          </span>
          <span className="step-chip">שלב {step} מתוך {TOTAL_STEPS}</span>
          <button type="button" className="modal-button" onClick={onClose}>
            חזרה לחדר הבקרה
          </button>
        </header>

        {/* שלב א — קליטת השידור */}
        {step === 1 && (
          <div className="terminal-step step-boot">
            <div className="static-noise" aria-hidden="true" />
            <p className="boot-message">{BOOT_MESSAGE}</p>
            <button
              type="button"
              className="modal-button primary step-next"
              onClick={() => setStep(2)}
            >
              התחילו בשחזור
            </button>
          </div>
        )}

        {/* שלב ב — התנסות */}
        {step === 2 && (
          <div className="terminal-step step-explore">
            <div className="explore-photo">
              <PixelatedPhoto resolution={resolution} />
            </div>
            <div className="explore-side">
              <p className="instruction-line">{RESTORE_INSTRUCTION}</p>
              <label className="slider-label" htmlFor="resolution-slider">
                רמת רזולוציה
              </label>
              <input
                id="resolution-slider"
                className="resolution-slider"
                type="range"
                min={0}
                max={RESOLUTION_LEVELS.length - 1}
                step={1}
                value={Math.max(0, RESOLUTION_LEVELS.indexOf(resolution))}
                onChange={(e) =>
                  setResolution(RESOLUTION_LEVELS[Number(e.target.value)])
                }
              />
              <div className="slider-ticks" aria-hidden="true">
                {RESOLUTION_LEVELS.map((level) => (
                  <span
                    key={level}
                    className={level === resolution ? 'tick current' : 'tick'}
                  >
                    {level}×{level}
                  </span>
                ))}
              </div>
              <p className="pixel-count" aria-live="polite">
                מספר הפיקסלים: {resolution} × {resolution} ={' '}
                <strong>{formatNumber(resolution * resolution)}</strong>
              </p>
              <p className="science-note">{SCIENCE_NOTE}</p>
              <button
                type="button"
                className="modal-button primary step-next"
                onClick={() => {
                  setResolution(chosen ?? 64);
                  setStep(3);
                }}
              >
                עברו למשימה
              </button>
            </div>
          </div>
        )}

        {/* שלב ג — המשימה */}
        {step === 3 && (
          <div className="terminal-step step-mission">
            <div className="mission-side">
              <p className="mission-message">{MISSION_MESSAGE}</p>
              <div className="option-row" role="group" aria-label="בחירת רזולוציה">
                {MISSION_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`option-button${chosen === option ? ' chosen' : ''}`}
                    onClick={() => chooseOption(option)}
                  >
                    {option}×{option}
                  </button>
                ))}
              </div>

              {/* אזור קבוע למשוב ולרמז — לא מזיז את יתר הממשק */}
              <div className="status-area">
                <p
                  className={`status-feedback${feedback ? '' : ' empty'}`}
                  role={feedback ? 'alert' : undefined}
                >
                  {feedback ?? 'בחרו רזולוציה, הזינו את מספר הפיקסלים ושדרו.'}
                </p>
                <div className="status-hint">
                  <button
                    type="button"
                    className="modal-button hint-button"
                    onClick={onUseHint}
                    disabled={hintsUsed >= HINTS.length}
                  >
                    רמז ({hintsUsed}/{HINTS.length})
                  </button>
                  <span className={`hint-text${currentHint ? '' : ' empty'}`}>
                    {currentHint ?? 'זקוקים לכיוון? בקשו רמז.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mission-side keypad-side">
              <div className="mission-photo">
                <PixelatedPhoto resolution={resolution} />
              </div>
              {chosen === null ? (
                <div className="keypad-waiting">
                  בחרו רזולוציה כדי להפעיל את הקודן
                </div>
              ) : (
                <div className="keypad-block">
                  <div className="keypad-display" aria-live="polite">
                    {code === '' ? 'מספר הפיקסלים הכולל' : code}
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
                    שידור לתחנת הקרקע
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* שלב ד — הצלחה */}
        {step === 4 && (
          <div className="terminal-step step-success">
            <div className={`photo-restore${restoring ? '' : ' done'}`}>
              <PixelatedPhoto resolution={resolution} />
            </div>
            {restoring ? (
              <p className="instruction-line">משחזר את התצלום…</p>
            ) : (
              <div className="success-panel">
                <p className="success-message">✔ {SUCCESS_MESSAGE}</p>
                <div className="finding-card">
                  <span className="finding-title">{LAST_PHOTO_FINDING.title}</span>
                  <p>{LAST_PHOTO_FINDING.content}</p>
                </div>
                <p className="transition-message">{TRANSITION_MESSAGE}</p>
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
