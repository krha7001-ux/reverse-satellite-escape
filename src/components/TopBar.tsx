import type { TimerInfo } from '../hooks/useTimer';
import { STATIONS } from '../data/stations';

interface TopBarProps {
  teamName: string;
  timer: TimerInfo;
  solvedCount: number;
  muted: boolean;
  onToggleMute: () => void;
  onRequestReset: () => void;
}

/** סרגל עליון: שם קבוצה, טיימר, התקדמות, השתקה ואיפוס */
export function TopBar({
  teamName,
  timer,
  solvedCount,
  muted,
  onToggleMute,
  onRequestReset,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="team-name">
        <span className="team-label">צוות:</span>
        <span>{teamName}</span>
      </div>
      <div
        className={`timer${timer.isCritical || timer.isTimeUp ? ' critical' : ''}`}
        title="הזמן שנותר למשימה"
      >
        ⏱ {timer.display}
      </div>
      <div className="progress-chip">
        התקדמות: <strong>{solvedCount}</strong> מתוך {STATIONS.length}
      </div>
      <div className="top-bar-spacer" />
      <button
        type="button"
        className="icon-button"
        onClick={onToggleMute}
        aria-pressed={muted}
        title={muted ? 'הפעלת צלילים' : 'השתקת צלילים'}
      >
        {muted ? '🔇' : '🔊'}
        <span>{muted ? 'ביטול השתקה' : 'השתקה'}</span>
      </button>
      <button
        type="button"
        className="icon-button danger"
        onClick={onRequestReset}
        title="איפוס המשחק מההתחלה"
      >
        ↺ <span>איפוס</span>
      </button>
    </header>
  );
}
