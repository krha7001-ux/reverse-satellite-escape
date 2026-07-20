import { useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types/game';
import { STATIONS } from '../data/stations';
import { useTimer } from '../hooks/useTimer';
import type { TimerInfo } from '../hooks/useTimer';
import { isMissionComplete } from '../hooks/useGameState';
import { useUiSounds } from '../hooks/useUiSounds';
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
    <div className="game-screen">
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
          onOpenStation={(stationId) =>
            dispatch({ type: 'OPEN_STATION', stationId })
          }
          showFinalHotspot={missionComplete}
          onOpenFinal={() => setFinalOpen(true)}
        />

        <StationsBar
          solvedStations={state.solvedStations}
          onOpenStation={(stationId) =>
            dispatch({ type: 'OPEN_STATION', stationId })
          }
        />

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
