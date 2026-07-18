import { STATIONS } from '../data/stations';
import { getStationStatus } from '../hooks/useGameState';
import type { StationId } from '../types/game';

interface StationsBarProps {
  solvedStations: StationId[];
  onOpenStation: (stationId: StationId) => void;
}

/** סרגל שש התחנות: פתורות, פעילה ונעולות */
export function StationsBar({ solvedStations, onOpenStation }: StationsBarProps) {
  return (
    <nav className="stations-bar" aria-label="תחנות המשימה">
      {STATIONS.map((station) => {
        const status = getStationStatus(station.id, solvedStations);
        const isClickable = status === 'active';
        return (
          <button
            key={station.id}
            type="button"
            className={`station-button ${status}`}
            disabled={!isClickable}
            onClick={() => isClickable && onOpenStation(station.id)}
            aria-label={
              status === 'locked'
                ? `${station.title} — נעולה`
                : status === 'solved'
                  ? `${station.title} — הושלמה`
                  : `${station.title} — פתיחת החידה`
            }
          >
            <span className="station-order">{station.order}</span>
            {status === 'locked' && (
              <span className="station-lock" aria-hidden="true">
                🔒
              </span>
            )}
            {status === 'solved' && (
              <span className="station-lock" aria-hidden="true">
                ✅
              </span>
            )}
            <span className="station-icon" aria-hidden="true">
              {station.icon}
            </span>
            <span>{station.title}</span>
          </button>
        );
      })}
    </nav>
  );
}
