import { useEffect, useReducer } from 'react';
import type { GameAction, GameState, StationId } from '../types/game';
import { MISSION_DURATION_SECONDS, STATIONS } from '../data/stations';

const STORAGE_KEY = 'reverse-satellite-escape/game-state/v1';

export const INITIAL_STATE: GameState = {
  phase: 'start',
  teamName: '',
  startedAt: null,
  solvedStations: [],
  openStation: null,
  hintsUsed: {},
  findings: [],
  muted: false,
  finalAssembly: { completed: false, remainingSeconds: null },
};

/** הזמן שנותר למשימה בשניות, נגזר מזמן ההתחלה */
export function remainingSecondsFor(startedAt: number | null): number {
  if (startedAt === null) return MISSION_DURATION_SECONDS;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, MISSION_DURATION_SECONDS - elapsed);
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    // מיזוג עם מצב ההתחלה כדי לשרוד שינויי מבנה עתידיים,
    // כולל שמירות ישנות שנוצרו לפני חידת הסיום
    return {
      ...INITIAL_STATE,
      ...parsed,
      openStation: null,
      finalAssembly: {
        ...INITIAL_STATE.finalAssembly,
        ...(parsed.finalAssembly ?? {}),
      },
    };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: GameState) {
  try {
    // זמן ההתחלה והזמן שנותר נשמרים יחד, כצילום מצב עקבי
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        remainingSeconds: remainingSecondsFor(state.startedAt),
      }),
    );
  } catch {
    // אין אחסון זמין — ממשיכים בלי שמירה
  }
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_MISSION': {
      // משחק חדש (או משחק שמור שפג תוקפו) מתחיל תמיד ב-60:00 מלאות
      const isStale =
        state.startedAt !== null && remainingSecondsFor(state.startedAt) <= 0;
      return {
        ...state,
        phase: 'playing',
        teamName: action.teamName.trim(),
        startedAt: state.startedAt === null || isStale ? Date.now() : state.startedAt,
      };
    }
    case 'OPEN_STATION':
      return { ...state, openStation: action.stationId };
    case 'CLOSE_STATION':
      return { ...state, openStation: null };
    case 'SOLVE_STATION':
      if (state.solvedStations.includes(action.stationId)) return state;
      return {
        ...state,
        solvedStations: [...state.solvedStations, action.stationId],
      };
    case 'USE_HINT':
      return {
        ...state,
        hintsUsed: {
          ...state.hintsUsed,
          [action.stationId]: (state.hintsUsed[action.stationId] ?? 0) + 1,
        },
      };
    case 'ADD_FINDING':
      if (state.findings.some((f) => f.stationId === action.finding.stationId)) {
        return state;
      }
      return { ...state, findings: [...state.findings, action.finding] };
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted };
    case 'COMPLETE_FINAL_ASSEMBLY':
      if (state.finalAssembly.completed) return state;
      return {
        ...state,
        finalAssembly: {
          completed: true,
          remainingSeconds: action.remainingSeconds,
        },
      };
    case 'RESET':
      return INITIAL_STATE;
  }
}

/** מצב מרכזי של המשחק, נשמר אוטומטית ב-localStorage */
export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return { state, dispatch };
}

/**
 * האם כל שש החידות נפתרו.
 * נקודת החיבור לחידת ההרכבה הסופית: כשהערך הופך true אפשר להפעיל אותה.
 */
export function isMissionComplete(solvedStations: StationId[]): boolean {
  return STATIONS.every((station) => solvedStations.includes(station.id));
}

/** סטטוס תחנה: פתורה, פעילה (הבאה בתור) או נעולה */
export function getStationStatus(
  stationId: StationId,
  solvedStations: StationId[],
): 'locked' | 'active' | 'solved' {
  if (solvedStations.includes(stationId)) return 'solved';
  const index = STATIONS.findIndex((s) => s.id === stationId);
  const firstUnsolved = STATIONS.findIndex(
    (s) => !solvedStations.includes(s.id),
  );
  return index === firstUnsolved ? 'active' : 'locked';
}
