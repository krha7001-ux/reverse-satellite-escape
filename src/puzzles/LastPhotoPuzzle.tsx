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
  SCIENCE_NOTE,
  SUCCESS_MESSAGE,
  TRANSITION_MESSAGE,
} from '../data/lastPhotoPuzzle';
import { drawAerialScene, SOURCE_SIZE } from './aerialPhoto';

type Phase = 'boot' | 'play' | 'restoring' | 'solved';

const formatNumber = (n: number) => n.toLocaleString('he-IL');

/** התצלום האווירי, מפוקסל בפועל לפי הרזולוציה הנבחרת */
function PixelatedPhoto({ resolution }: { resolution: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!sourceRef.current) {
      const source = document.createElement('canvas');
      source.width = SOURCE_SIZE;
      source.height = SOURCE_SIZE;
      drawAerialScene(source.getContext('2d')!);
      sourceRef.current = source;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // דגימה לרזולוציה הנמוכה ואז הגדלה ללא החלקה — פיקסול אמיתי
    const small = document.createElement('canvas');
    small.width = resolution;
    small.height = resolution;
    const smallCtx = small.getContext('2d')!;
    smallCtx.imageSmoothingEnabled = true;
    smallCtx.drawImage(sourceRef.current, 0, 0, resolution, resolution);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
  }, [resolution]);

  return (
    <canvas
      ref={canvasRef}
      className="photo-canvas"
      width={512}
      height={512}
      aria-label={`תצלום אווירי ברזולוציה ${resolution}×${resolution}`}
    />
  );
}

/** חידה 1: התצלום האחרון — רזולוציה ופיקסלים */
export function LastPhotoPuzzle({
  hintsUsed,
  onSolve,
  onUseHint,
  onAddFinding,
  onClose,
}: PuzzleProps) {
  const [phase, setPhase] = useState<Phase>('boot');
  const [resolution, setResolution] = useState<number>(RESOLUTION_LEVELS[0]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const solvedRef = useRef(false);

  // אפקט הפרעת השידור בפתיחה
  useEffect(() => {
    if (phase !== 'boot') return;
    const timer = setTimeout(() => setPhase('play'), 1800);
    return () => clearTimeout(timer);
  }, [phase]);

  // גישה יציבה ל-callbacks — הרכיב ההורה מתרנדר כל שנייה בגלל הטיימר,
  // ותלות ישירה בהם הייתה מאפסת את אנימציית השחזור שוב ושוב
  const callbacksRef = useRef({ onAddFinding, onSolve });
  callbacksRef.current = { onAddFinding, onSolve };

  // אנימציית השחזור: התמונה מתחדדת בהדרגה עד לרזולוציה הנכונה
  useEffect(() => {
    if (phase !== 'restoring') return;
    const steps: Array<[number, number]> = [
      [8, 0],
      [16, 450],
      [CORRECT_RESOLUTION, 900],
    ];
    const timers = steps.map(([res, delay]) =>
      setTimeout(() => setResolution(res), delay),
    );
    const done = setTimeout(() => {
      if (!solvedRef.current) {
        solvedRef.current = true;
        callbacksRef.current.onAddFinding(LAST_PHOTO_FINDING);
        callbacksRef.current.onSolve();
      }
      setPhase('solved');
    }, 1700);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [phase]);

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
      setResolution(8);
      setPhase('restoring');
    }
  };

  const revealedHints = HINTS.slice(0, Math.min(hintsUsed, HINTS.length));

  return (
    <div className="puzzle-overlay">
      <div className="terminal">
        <header className="terminal-header">
          <span className="terminal-title">
            <span aria-hidden="true">🛰️</span>
            מסוף הדמיה · התצלום האחרון
          </span>
          <button type="button" className="modal-button" onClick={onClose}>
            חזרה לחדר הבקרה
          </button>
        </header>

        {phase === 'boot' && (
          <div className="terminal-boot">
            <div className="static-noise" aria-hidden="true" />
            <p className="boot-message">{BOOT_MESSAGE}</p>
          </div>
        )}

        {phase === 'play' && (
          <div className="terminal-body">
            <p className="system-line">{BOOT_MESSAGE}</p>

            <div className="terminal-grid">
              <section className="photo-panel">
                <PixelatedPhoto resolution={resolution} />

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
              </section>

              <section className="control-panel">
                <p className="science-note">{SCIENCE_NOTE}</p>
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

                <div className="keypad-block">
                  <div className="keypad-display" aria-live="polite">
                    {code === '' ? 'הזינו את מספר הפיקסלים הכולל' : code}
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
                  <button type="button" className="modal-button primary submit-button" onClick={submit}>
                    שידור לתחנת הקרקע
                  </button>
                </div>

                {feedback && (
                  <p className="feedback-line" role="alert">
                    {feedback}
                  </p>
                )}

                <div className="hints-block">
                  <button
                    type="button"
                    className="modal-button hint-button"
                    onClick={onUseHint}
                    disabled={hintsUsed >= HINTS.length}
                  >
                    רמז ({hintsUsed}/{HINTS.length})
                  </button>
                  {revealedHints.length > 0 && (
                    <ul className="hints-list">
                      {revealedHints.map((hint, i) => (
                        <li key={i}>{hint}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {(phase === 'restoring' || phase === 'solved') && (
          <div className="terminal-body success-body">
            <div className={`photo-restore${phase === 'solved' ? ' done' : ''}`}>
              <PixelatedPhoto resolution={resolution} />
            </div>
            {phase === 'restoring' && (
              <p className="system-line">משחזר את התצלום…</p>
            )}
            {phase === 'solved' && (
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
