import type { PuzzleProps } from '../types/game';
import { Modal } from '../components/Modal';

/**
 * רכיב חידה זמני (placeholder).
 * כל חידה אמיתית תמומש כרכיב נפרד עם אותו ממשק PuzzleProps,
 * ותהיה אחראית גם על מעטפת התצוגה שלה.
 */
export function PuzzlePlaceholder({ station, onClose }: PuzzleProps) {
  return (
    <Modal
      title={
        <>
          <span aria-hidden="true">{station.icon}</span>
          תחנה {station.order}: {station.title}
        </>
      }
      onClose={onClose}
    >
      <div className="placeholder-note">
        <span className="placeholder-icon" aria-hidden="true">
          {station.icon}
        </span>
        <p>חידת {station.title} תתווסף בשלב הבא</p>
        <button type="button" className="modal-button primary" onClick={onClose}>
          הבנתי, נחזור לחדר הבקרה
        </button>
      </div>
    </Modal>
  );
}
