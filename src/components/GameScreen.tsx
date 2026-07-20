import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types/game';
import { STATIONS } from '../data/stations';
import { useTimer } from '../hooks/useTimer';
import type { TimerInfo } from '../hooks/useTimer';
import { isMissionComplete } from '../hooks/useGameState';
import { useUiSounds } from '../hooks/useUiSounds';
import { soundManager } from '../effects/soundManager';
import { ENTRY_SOUNDS, SUCCESS_SOUNDS } from '../effects/stationSounds';
import type { StationId } from '../types/game';
import { PUZZLE_COMPONENTS } from '../puzzles';
import { FinalAssembly } from '../puzzles/FinalAssembly';
import { FINAL_BANNER } from '../data/finalAssembly';
import { TopBar } from './TopBar';
import { ControlRoomViewer } from './ControlRoomViewer';
import { StationsBar } from './StationsBar';
import { Modal } from './Modal';

interface GameScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

/** תצוגת טיימר קפוא — לאחר השלמת חידת הסיום */
function frozenTimer(remainingSeconds: number): TimerInfo {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return {
    remainingSeconds,
    display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    isTimeUp: false,
    isCritical: false,
  };
}

/** מסך המשחק הראשי: סרגל עליון, פנורמה, סרגל תחנות וחלונות חידה */
export function GameScreen({ state, dispatch }: GameScreenProps) {
  const timer = useTimer(state.startedAt);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const playSound = useUiSounds(state.muted);

  const missionComplete = isMissionComplete(state.solvedStations);
  // אחרי רענון בסיום — חוזרים ישירות למסך ההצלחה של חידת הסיום
  const [finalOpen, setFinalOpen] = useState(state.finalAssembly.completed);

  // קול: השתקה גלובלית + צליל מנעול/תחנה חדשה בחזרה לחדר אחרי פתרון
  useEffect(() => {
    soundManager.setMuted(state.muted);
  }, [state.muted]);

  // אנימציית כניסה לפני פתיחת חידה + אנימציית הצלחה חד-פעמית בחזרה
  const [pendingStation, setPendingStation] = useState<StationId | null>(null);
  const [successStation, setSuccessStation] = useState<StationId | null>(null);
  const [lockedPulse, setLockedPulse] = useState<{
    stationId: StationId;
    seq: number;
  } | null>(null);
  const [lockedToast, setLockedToast] = useState(false);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** משך אנימציית הכניסה לכל תחנה (הכספת ארוכה יותר) */
  const entryDuration = (stationId: StationId) =>
    stationId === 'mission-file' ? 1500 : 1200;

  const requestOpenStation = (stationId: StationId) => {
    if (pendingStation !== null) return;
    soundManager.play('click');
    // reduced motion: פתיחה כמעט מיידית עם מעבר opacity קצר בלבד
    if (reducedMotion) {
      dispatch({ type: 'OPEN_STATION', stationId });
      return;
    }
    soundManager.playSequence(ENTRY_SOUNDS[stationId]);
    setPendingStation(stationId);
    pendingTimerRef.current = setTimeout(() => {
      setPendingStation(null);
      dispatch({ type: 'OPEN_STATION', stationId });
    }, entryDuration(stationId));
  };

  const skipEntry = () => {
    if (pendingStation === null) return;
    clearTimeout(pendingTimerRef.current);
    const stationId = pendingStation;
    setPendingStation(null);
    dispatch({ type: 'OPEN_STATION', stationId });
  };

  // Enter או רווח מדלגים על אנימציית הכניסה
  useEffect(() => {
    if (pendingStation === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        skipEntry();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingStation]);

  const onLockedStation = (stationId: StationId) => {
    soundManager.play('lockedClick');
    setLockedPulse((prev) => ({ stationId, seq: (prev?.seq ?? 0) + 1 }));
    setLockedToast(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setLockedToast(false), 2600);
  };

  // מעברי מצב: תשובה נכונה + אנימציית הצלחה חד-פעמית בחזרה לחדר
  const prevOpenRef = useRef(state.openStation);
  const solvedCountRef = useRef(state.solvedStations.length);
  useEffect(() => {
    const prevOpen = prevOpenRef.current;
    prevOpenRef.current = state.openStation;
    const prevSolvedCount = solvedCountRef.current;
    solvedCountRef.current = state.solvedStations.length;
    // תשובה נכונה (תחנה נוספה לרשימת הפתורות)
    if (state.solvedStations.length > prevSolvedCount) {
      soundManager.play('correct');
    }
    // חזרה לחדר אחרי פתרון: אנימציית הצלחה פעם אחת בלבד (נשמר ב-localStorage)
    if (
      prevOpen !== null &&
      state.openStation === null &&
      state.solvedStations.includes(prevOpen) &&
      !state.effectsPlayed[prevOpen]
    ) {
      dispatch({ type: 'MARK_EFFECT_PLAYED', stationId: prevOpen });
      soundManager.playSequence(SUCCESS_SOUNDS[prevOpen]);
      if (!reducedMotion) {
        setSuccessStation(prevOpen);
        clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => setSuccessStation(null), 2800);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.openStation, state.solvedStations]);

  // ניקוי טיימרים בפירוק
  useEffect(
    () => () => {
      clearTimeout(pendingTimerRef.current);
      clearTimeout(successTimerRef.current);
      clearTimeout(toastTimerRef.current);
    },
    [],
  );

  // הטיימר נעצר לאחר השלמת רצף ההפעלה
  const displayTimer =
    state.finalAssembly.completed && state.finalAssembly.remainingSeconds !== null
      ? frozenTimer(state.finalAssembly.remainingSeconds)
      : timer;

  const hintsTotal = Object.values(state.hintsUsed).reduce(
    (sum, n) => sum + (n ?? 0),
    0,
  );

  const openStation =
    state.openStation !== null
      ? STATIONS.find((s) => s.id === state.openStation) ?? null
      : null;
  const OpenPuzzle = openStation ? PUZZLE_COMPONENTS[openStation.id] : null;

  return (
    // פעולת משתמש ראשונה מפעילה את הקול (AudioContext + זמזום רקע)
    <div
      className="game-screen"
      onPointerDown={() => soundManager.userGesture()}
    >
      <TopBar
        teamName={state.teamName}
        timer={displayTimer}
        solvedCount={state.solvedStations.length}
        muted={state.muted}
        onToggleMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
        onRequestReset={() => setShowResetConfirm(true)}
      />

      <div className="game-main">
        <ControlRoomViewer
          solvedStations={state.solvedStations}
          onOpenStation={requestOpenStation}
          onLockedStation={onLockedStation}
          showFinalHotspot={missionComplete}
          onOpenFinal={() => {
            soundManager.play('stationOpen');
            setFinalOpen(true);
          }}
          openStationId={state.openStation}
          finalCompleted={state.finalAssembly.completed}
          pendingStation={pendingStation}
          successStation={successStation}
          lockedPulse={lockedPulse}
        />

        <StationsBar
          solvedStations={state.solvedStations}
          onOpenStation={requestOpenStation}
        />

        {/* כפתור דילוג על אנימציית הכניסה (Enter/רווח מדלגים גם הם) */}
        {pendingStation !== null && (
          <button
            type="button"
            className="skip-entry-button"
            onClick={skipEntry}
          >
            דלג ⏭
          </button>
        )}

        {/* הודעת תחנה נעולה */}
        {lockedToast && (
          <div className="locked-toast" role="status">
            🔒 המערכת עדיין נעולה. השלימו את התחנה הקודמת.
          </div>
        )}

        {/* פס הודעה: כל הממצאים שוחזרו */}
        {missionComplete && !finalOpen && !state.finalAssembly.completed && (
          <div className="final-banner" role="status">
            ✨ {FINAL_BANNER}
          </div>
        )}

        {openStation && OpenPuzzle && (
          <OpenPuzzle
            station={openStation}
            hintsUsed={state.hintsUsed[openStation.id] ?? 0}
            onSolve={() =>
              dispatch({ type: 'SOLVE_STATION', stationId: openStation.id })
            }
            onUseHint={() =>
              dispatch({ type: 'USE_HINT', stationId: openStation.id })
            }
            onAddFinding={(finding) => dispatch({ type: 'ADD_FINDING', finding })}
            onClose={() => dispatch({ type: 'CLOSE_STATION' })}
          />
        )}

        {finalOpen && missionComplete && (
          <FinalAssembly
            teamName={state.teamName}
            hintsTotal={hintsTotal}
            liveRemainingSeconds={timer.remainingSeconds}
            completed={state.finalAssembly.completed}
            completedRemainingSeconds={state.finalAssembly.remainingSeconds}
            playSound={playSound}
            onComplete={(remainingSeconds) =>
              dispatch({ type: 'COMPLETE_FINAL_ASSEMBLY', remainingSeconds })
            }
            onClose={() => setFinalOpen(false)}
            onNewGame={() => dispatch({ type: 'RESET' })}
          />
        )}
      </div>

      {showResetConfirm && (
        <Modal
          title={
            <>
              <span aria-hidden="true">⚠️</span>
              איפוס המשחק
            </>
          }
          onClose={() => setShowResetConfirm(false)}
          actions={
            <>
              <button
                type="button"
                className="modal-button danger"
                onClick={() => {
                  setShowResetConfirm(false);
                  dispatch({ type: 'RESET' });
                }}
              >
                כן, לאפס הכול
              </button>
              <button
                type="button"
                className="modal-button"
                onClick={() => setShowResetConfirm(false)}
              >
                ביטול
              </button>
            </>
          }
        >
          האם אתם בטוחים שברצונכם לאפס את המשחק? כל ההתקדמות, הטיימר ושם הקבוצה
          יימחקו ותחזרו למסך הפתיחה.
        </Modal>
      )}
    </div>
  );
}
