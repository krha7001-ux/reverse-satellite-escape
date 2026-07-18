import type { PuzzleProps } from '../types/game';

/**
 * רכיב חידה זמני (placeholder).
 * כל חידה אמיתית תמומש בעתיד כרכיב נפרד עם אותו ממשק PuzzleProps.
 */
export function PuzzlePlaceholder({ station, onClose }: PuzzleProps) {
  return (
    <div className="placeholder-note">
      <span className="placeholder-icon" aria-hidden="true">
        {station.icon}
      </span>
      <p>חידת {station.title} תתווסף בשלב הבא</p>
      <button type="button" className="modal-button primary" onClick={onClose}>
        הבנתי, נחזור לחדר הבקרה
      </button>
    </div>
  );
}
