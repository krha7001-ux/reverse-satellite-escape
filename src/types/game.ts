/** מזהי התחנות במשחק, לפי סדר ההתקדמות */
export type StationId =
  | 'last-photo'
  | 'camera-system'
  | 'transmission-system'
  | 'power-source'
  | 'orbit'
  | 'mission-file';

export type StationStatus = 'locked' | 'active' | 'solved';

/** מיקום נקודת לחיצה על תמונת חדר הבקרה, באחוזים מגודל התמונה */
export interface Hotspot {
  /** אחוז אופקי מקצה שמאל של התמונה (0–100) */
  x: number;
  /** אחוז אנכי מקצה עליון של התמונה (0–100) */
  y: number;
}

export interface Station {
  id: StationId;
  /** מספר סידורי (1–6) */
  order: number;
  /** שם התחנה בעברית */
  title: string;
  /** אייקון מייצג */
  icon: string;
  /** נקודת הלחיצה של התחנה על תמונת חדר הבקרה */
  hotspot: Hotspot;
}

/** כרטיס ממצא שנחשף לאחר פתרון חידה */
export interface FindingCard {
  stationId: StationId;
  title: string;
  content: string;
}

export interface GameState {
  /** האם המשחק התחיל (מעבר ממסך פתיחה) */
  phase: 'start' | 'playing';
  teamName: string;
  /** חותמת זמן של תחילת המשימה (למדידת 60 דקות) */
  startedAt: number | null;
  /** תחנות שנפתרו, לפי סדר הפתרון */
  solvedStations: StationId[];
  /** התחנה שחלון החידה שלה פתוח כרגע (null = אין חלון פתוח) */
  openStation: StationId | null;
  /** מספר רמזים שנוצלו בכל תחנה */
  hintsUsed: Partial<Record<StationId, number>>;
  /** כרטיסי ממצא שנאספו */
  findings: FindingCard[];
  /** השתקת צלילים */
  muted: boolean;
}

export type GameAction =
  | { type: 'START_MISSION'; teamName: string }
  | { type: 'OPEN_STATION'; stationId: StationId }
  | { type: 'CLOSE_STATION' }
  | { type: 'SOLVE_STATION'; stationId: StationId }
  | { type: 'USE_HINT'; stationId: StationId }
  | { type: 'ADD_FINDING'; finding: FindingCard }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'RESET' };

/** Props אחידים שכל רכיב חידה עתידי יקבל */
export interface PuzzleProps {
  station: Station;
  hintsUsed: number;
  onSolve: () => void;
  onUseHint: () => void;
  onClose: () => void;
}
