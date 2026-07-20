import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
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
import {
  CinematicStationShell,
  CineStageSizeContext,
} from '../components/CinematicStationShell';
import {
  CONSOLE_ASPECT,
  CONSOLE_REGIONS,
  SCREEN_QUAD,
  quadBounds,
  regionStyle,
  screenQuadStyle,
} from './cinematic/consoleLayout';
import { soundManager } from '../effects/soundManager';

/** שלבי החידה: קליטה → התנסות → משימה → הצלחה */
type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

const formatNumber = (n: number) => n.toLocaleString('he-IL');

const CONSOLE_IMAGE = `${import.meta.env.BASE_URL}assets/cinematic/station-01-last-photo.png`;

// טעינה מוקדמת של תמונת הקונסולה — הפתיחה הראשונה חלקה
if (typeof window !== 'undefined') {
  const preload = new Image();
  preload.src = CONSOLE_IMAGE;
}

/** המסך הפיזי: ממופה אל המרובע הפרספקטיבי של זכוכית התצלום ב-matrix3d */
function ConsoleScreen({ children }: { children: ReactNode }) {
  const { width, height } = useContext(CineStageSizeContext);
  const style = useMemo(() => screenQuadStyle(width, height), [width, height]);
  return (
    <div className="cine-screen" style={style}>
      {children}
    </div>
  );
}

/** חוגה פיזית: role=slider עם חיצים במקלדת; לחיצה מסובבת לערך הבא */
function ConsoleDial({
  values,
  value,
  onChange,
  disabled,
  label,
}: {
  values: readonly number[];
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  label: string;
}) {
  const index = Math.max(0, values.indexOf(value));
  const count = values.length;
  const angleFor = (i: number) => -70 + (140 / (count - 1)) * i;

  const setIndex = (next: number) => {
    if (disabled) return;
    const clamped = Math.min(count - 1, Math.max(0, next));
    if (clamped === index) return;
    soundManager.play('vaultBolt');
    onChange(values[clamped]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      setIndex(index + 1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setIndex(index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setIndex(count - 1);
    }
  };

  return (
    <div
      className={`cine-dial${disabled ? ' disabled' : ''}`}
      style={regionStyle(CONSOLE_REGIONS.dial)}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={count - 1}
      aria-valuenow={index}
      aria-valuetext={`${value}×${value}`}
      aria-disabled={disabled}
      onKeyDown={onKeyDown}
      onClick={() => {
        if (disabled) return;
        // לחיצה מסובבת את החוגה לערך הבא (מחזורי)
        const next = (index + 1) % count;
        soundManager.play('vaultBolt');
        onChange(values[next]);
      }}
    >
      <div className="cine-dial-ticks" aria-hidden="true">
        {values.map((v, i) => (
          <span
            key={v}
            className={`cine-dial-tick${i === index ? ' current' : ''}`}
            style={{ transform: `rotate(${angleFor(i)}deg)` }}
          >
            <i />
          </span>
        ))}
      </div>
      <div
        className="cine-dial-knob"
        style={{ transform: `rotate(${angleFor(index)}deg)` }}
        aria-hidden="true"
      >
        <span className="cine-dial-pointer" />
      </div>
    </div>
  );
}

/** חידה 1: התצלום האחרון — אב־טיפוס קולנועי בתוך קונסולה פוטוריאליסטית */
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
  // מגירת המידע/רמזים הצרה שבצד הקונסולה
  const [drawerOpen, setDrawerOpen] = useState(false);
  const solvedRef = useRef(false);
  const findingSoundRef = useRef(false);

  // גישה יציבה ל-callbacks — הרכיב ההורה מתרנדר כל שנייה בגלל הטיימר,
  // ותלות ישירה בהם הייתה מאפסת את אנימציית השחזור שוב ושוב
  const callbacksRef = useRef({ onAddFinding, onSolve });
  callbacksRef.current = { onAddFinding, onSolve };

  // שלב ד: אנימציית שחזור קצרה — התמונה מתחדדת עד לרזולוציה הנכונה
  useEffect(() => {
    if (step !== 4) return;
    setRestoring(true);
    soundManager.play('radioWave'); // קו הסריקה עובר על המסך
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

  // פתיחת מגירת „ממצא 1” בסיום השחזור — צליל מגירה חד-פעמי
  useEffect(() => {
    if (step === 4 && !restoring && !findingSoundRef.current) {
      findingSoundRef.current = true;
      soundManager.play('drawer');
    }
  }, [step, restoring]);

  const chooseOption = (option: number) => {
    setChosen(option);
    setResolution(option);
    setFeedback(null);
  };

  const pressKey = (digit: string) => {
    if (code.length >= 5) return;
    soundManager.play('click');
    setCode(code + digit);
  };

  const submit = () => {
    if (chosen === null || code === '') {
      soundManager.play('lockedClick');
      setFeedback(FEEDBACK_MISSING);
    } else if (chosen === 16) {
      soundManager.play('lockedClick');
      setFeedback(FEEDBACK_16);
    } else if (chosen === 64) {
      soundManager.play('lockedClick');
      setFeedback(FEEDBACK_64);
    } else if (Number(code) !== CORRECT_CODE) {
      soundManager.play('lockedClick');
      setFeedback(FEEDBACK_WRONG_CODE);
    } else {
      soundManager.play('unlock');
      setFeedback(null);
      setStep(4);
    }
  };

  // קלט מקלדת רגיל לקודן בשלב ג — ספרות, מחיקה ושליחה
  useEffect(() => {
    if (step !== 3) return;
    const onKey = (e: KeyboardEvent) => {
      if (chosen === null) return; // הקודן כבוי עד בחירת רזולוציה
      if (/^[0-9]$/.test(e.key)) {
        if (code.length < 5) {
          soundManager.play('click');
          setCode((c) => (c.length < 5 ? c + e.key : c));
        }
      } else if (e.key === 'Backspace') {
        setCode((c) => c.slice(0, -1));
      } else if (e.key === 'Delete') {
        setCode('');
      } else if (
        e.key === 'Enter' &&
        !(e.target instanceof HTMLButtonElement) &&
        !(e.target instanceof HTMLInputElement)
      ) {
        submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, chosen, code]);

  // המגירה נסגרת במעבר שלב; בשלב ב היא מציגה מידע, בשלב ג רמזים
  useEffect(() => {
    setDrawerOpen(false);
  }, [step]);

  const currentHint = hintsUsed > 0 ? HINTS[Math.min(hintsUsed, HINTS.length) - 1] : null;
  const keypadActive = step === 3 && chosen !== null;
  const dialValues: readonly number[] = step === 3 ? MISSION_OPTIONS : RESOLUTION_LEVELS;
  const dialEnabled = step === 2 || step === 3;

  // תוכן צוהר התצוגה הקטן שמעל המקלדת
  let lcdContent: ReactNode;
  if (step === 1) {
    lcdContent = <span className="cine-lcd-idle">· · ·</span>;
  } else if (step === 2) {
    lcdContent = (
      <>
        <span className="cine-lcd-label">מספר הפיקסלים</span>
        <span className="cine-lcd-value">
          {resolution}×{resolution} = {formatNumber(resolution * resolution)}
        </span>
      </>
    );
  } else if (step === 3) {
    lcdContent =
      chosen === null ? (
        <span className="cine-lcd-waiting keypad-waiting">
          בחרו רזולוציה כדי להפעיל את הקודן
        </span>
      ) : (
        <span className="cine-lcd-code">{code === '' ? 'מספר הפיקסלים הכולל' : code}</span>
      );
  } else {
    lcdContent = <span className="cine-lcd-code ok">{CORRECT_CODE}</span>;
  }

  // רצועת ההוראות העליונה — לכל היותר שני משפטים בכל רגע
  let stripContent: ReactNode = null;
  if (step === 2) {
    stripContent = <p className="cine-strip-text">{RESTORE_INSTRUCTION}</p>;
  } else if (step === 3) {
    stripContent = feedback ? (
      <p className="cine-strip-text alert" role="alert">
        {feedback}
      </p>
    ) : (
      <p className="cine-strip-text">{MISSION_MESSAGE}</p>
    );
  } else if (step === 4) {
    stripContent = (
      <p className="cine-strip-text success">
        {restoring ? 'משחזר את התצלום…' : `✔ ${SUCCESS_MESSAGE}`}
      </p>
    );
  }

  // הפעולה הראשית של כל שלב — מתג פיזי מואר, דביק בתחתית בעת הצורך
  let primaryAction: ReactNode = null;
  if (step === 1) {
    primaryAction = (
      <button
        type="button"
        className="cine-switch primary step-next"
        onClick={() => setStep(2)}
      >
        <span className="cine-switch-lamp" aria-hidden="true" />
        התחילו בשחזור
      </button>
    );
  } else if (step === 2) {
    primaryAction = (
      <button
        type="button"
        className="cine-switch primary step-next"
        onClick={() => {
          setResolution(chosen ?? 64);
          setStep(3);
        }}
      >
        <span className="cine-switch-lamp" aria-hidden="true" />
        עברו למשימה
      </button>
    );
  } else if (step === 3) {
    primaryAction = (
      <button type="button" className="cine-switch primary submit-button" onClick={submit}>
        <span className="cine-switch-lamp" aria-hidden="true" />
        שידור לתחנת הקרקע
      </button>
    );
  } else if (!restoring) {
    primaryAction = (
      <div className="success-panel cine-success-actions">
        <button type="button" className="modal-button primary cine-switch" onClick={onClose}>
          <span className="cine-switch-lamp" aria-hidden="true" />
          חזרה לחדר הבקרה
        </button>
      </div>
    );
  }

  const drawerTitle = step === 3 ? 'רמזים' : 'מידע';
  const drawerBody =
    step === 3 ? (
      <>
        <p className={`cine-side-drawer-text${currentHint ? '' : ' dim'}`}>
          {currentHint ?? 'זקוקים לכיוון? בקשו רמז.'}
        </p>
        <span className="cine-side-drawer-count">רמזים שנוצלו: {hintsUsed}/{HINTS.length}</span>
      </>
    ) : (
      <p className="cine-side-drawer-text">{SCIENCE_NOTE}</p>
    );

  return (
    <CinematicStationShell
      imageUrl={CONSOLE_IMAGE}
      aspect={CONSOLE_ASPECT}
      safe={CONSOLE_REGIONS.safe}
      ariaTitle="מסוף הדמיה · התצלום האחרון"
      debugRegions={{ screen: quadBounds(SCREEN_QUAD), ...CONSOLE_REGIONS }}
      topStrip={
        <>
          <span className="cine-strip-title">
            מסוף הדמיה · התצלום האחרון
            <span className="visually-hidden">
              , שלב {step} מתוך {TOTAL_STEPS}
            </span>
          </span>
          {stripContent}
          <button type="button" className="cine-back" onClick={onClose}>
            חזרה לחדר הבקרה
          </button>
        </>
      }
      bottomBar={
        <>
          {step === 2 && (
            <button
              type="button"
              className="cine-glass-button"
              onClick={() => {
                soundManager.play('tray');
                setDrawerOpen((open) => !open);
              }}
            >
              מידע
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              className="cine-glass-button hint-button"
              onClick={() => {
                soundManager.play('tray');
                if (hintsUsed < HINTS.length) onUseHint();
                setDrawerOpen(true);
              }}
            >
              רמז ({hintsUsed}/{HINTS.length})
            </button>
          )}
          {primaryAction}
        </>
      }
    >
      {/* המסך הפיזי — התוכן הדינמי מחליף את תוכן המסך המצולם */}
      <ConsoleScreen>
        {step === 1 ? (
          <div className="cine-screen-boot">
            <div className="static-noise" aria-hidden="true" />
            <p className="cine-boot-message">{BOOT_MESSAGE}</p>
          </div>
        ) : (
          <div className="cine-screen-square">
            <PixelatedPhoto resolution={resolution} />
          </div>
        )}
        {step === 4 && <div className="cine-scan" aria-hidden="true" />}
        {step === 4 && !restoring && (
          <span className="cine-finding-badge">ממצא 1</span>
        )}
        <div className="cine-screen-glass" aria-hidden="true" />
      </ConsoleScreen>

      {/* נורות מצב השלבים בדופן השמאלית */}
      <div
        className="cine-step-lamps"
        style={regionStyle(CONSOLE_REGIONS.stepLamps)}
        role="status"
        aria-label={`שלב ${step} מתוך ${TOTAL_STEPS}`}
      >
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`cine-lamp${n === step ? ' on' : n < step ? ' done' : ''}`}
            aria-hidden="true"
          >
            <i>{n}</i>
          </span>
        ))}
      </div>

      {/* צוהר התצוגה הקטן שמעל המקלדת */}
      <div
        className={`cine-lcd${step === 3 && chosen !== null ? ' keypad-display' : ''}`}
        style={regionStyle(CONSOLE_REGIONS.codeDisplay)}
        aria-live="polite"
      >
        {lcdContent}
      </div>

      {/* המקלדת הפיזית — פעילה רק בשלב ג לאחר בחירת רזולוציה */}
      <div
        className={`cine-keypad keypad${keypadActive ? ' active' : ''}`}
        style={regionStyle(CONSOLE_REGIONS.keypad)}
        role="group"
        aria-label="קודן מספרי"
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            className="cine-key keypad-key"
            disabled={!keypadActive}
            onClick={() => pressKey(d)}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="cine-key keypad-key action"
          disabled={!keypadActive}
          onClick={() => {
            soundManager.play('click');
            setCode('');
          }}
        >
          נקה
        </button>
        <button
          type="button"
          className="cine-key keypad-key"
          disabled={!keypadActive}
          onClick={() => pressKey('0')}
        >
          0
        </button>
        <button
          type="button"
          className="cine-key keypad-key action"
          disabled={!keypadActive}
          onClick={() => {
            soundManager.play('click');
            setCode(code.slice(0, -1));
          }}
        >
          ⌫
        </button>
      </div>

      {/* החוגה הפיזית לבחירת רזולוציה */}
      <ConsoleDial
        values={dialValues}
        value={resolution}
        onChange={(v) => {
          if (step === 3) chooseOption(v);
          else setResolution(v);
        }}
        disabled={!dialEnabled}
        label="רמת רזולוציה"
      />

      {/* הסמן הקטן שליד החוגה — הערך הנבחר */}
      <div
        className="cine-dial-readout"
        style={regionStyle(CONSOLE_REGIONS.dialReadout)}
        aria-hidden="true"
      >
        {resolution}×{resolution}
      </div>

      {/* מגירת „ממצא 1” — נפתחת מהקונסולה בסיום, כרטיס הנתונים עולה ממנה */}
      {step === 4 && (
        <div
          className={`cine-drawer${restoring ? '' : ' open'}`}
          style={regionStyle(CONSOLE_REGIONS.drawer)}
        >
          <div className="cine-drawer-face" aria-hidden="true" />
          {!restoring && (
            <div className="finding-card cine-finding-card">
              <span className="finding-title">{LAST_PHOTO_FINDING.title}</span>
              <p>{LAST_PHOTO_FINDING.content}</p>
              <p className="cine-transition-message">{TRANSITION_MESSAGE}</p>
            </div>
          )}
        </div>
      )}

      {/* מגירת המידע/הרמזים הצרה — נשלפת מתוך הדופן הימנית של הקונסולה */}
      <div className="cine-side-drawer-clip" aria-hidden={!drawerOpen}>
        <div className={`cine-side-drawer${drawerOpen ? ' open' : ''}`}>
          <div className="cine-side-drawer-head">
            <span>{drawerTitle}</span>
            <button
              type="button"
              className="cine-side-drawer-close"
              onClick={() => setDrawerOpen(false)}
              tabIndex={drawerOpen ? 0 : -1}
            >
              ✕
            </button>
          </div>
          {drawerBody}
        </div>
      </div>
    </CinematicStationShell>
  );
}
