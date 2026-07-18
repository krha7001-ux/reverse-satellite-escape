import { useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types/game';
import { STATIONS } from '../data/stations';
import { useTimer } from '../hooks/useTimer';
import { PUZZLE_COMPONENTS } from '../puzzles';
import { TopBar } from './TopBar';
import { PanoramaViewer } from './PanoramaViewer';
import { StationsBar } from './StationsBar';
import { Modal } from './Modal';

interface GameScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

/** מסך המשחק הראשי: סרגל עליון, פנורמה, סרגל תחנות וחלונות חידה */
export function GameScreen({ state, dispatch }: GameScreenProps) {
  const timer = useTimer(state.startedAt);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const openStation =
    state.openStation !== null
      ? STATIONS.find((s) => s.id === state.openStation) ?? null
      : null;
  const OpenPuzzle = openStation ? PUZZLE_COMPONENTS[openStation.id] : null;

  return (
    <div className="game-screen">
      <TopBar
        teamName={state.teamName}
        timer={timer}
        solvedCount={state.solvedStations.length}
        muted={state.muted}
        onToggleMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
        onRequestReset={() => setShowResetConfirm(true)}
      />

      <PanoramaViewer />

      <StationsBar
        solvedStations={state.solvedStations}
        onOpenStation={(stationId) =>
          dispatch({ type: 'OPEN_STATION', stationId })
        }
      />

      {openStation && OpenPuzzle && (
        <Modal
          title={
            <>
              <span aria-hidden="true">{openStation.icon}</span>
              תחנה {openStation.order}: {openStation.title}
            </>
          }
          onClose={() => dispatch({ type: 'CLOSE_STATION' })}
        >
          <OpenPuzzle
            station={openStation}
            hintsUsed={state.hintsUsed[openStation.id] ?? 0}
            onSolve={() =>
              dispatch({ type: 'SOLVE_STATION', stationId: openStation.id })
            }
            onUseHint={() =>
              dispatch({ type: 'USE_HINT', stationId: openStation.id })
            }
            onClose={() => dispatch({ type: 'CLOSE_STATION' })}
          />
        </Modal>
      )}

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
