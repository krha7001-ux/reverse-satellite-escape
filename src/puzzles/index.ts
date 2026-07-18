import type { ComponentType } from 'react';
import type { PuzzleProps, StationId } from '../types/game';
import { PuzzlePlaceholder } from './PuzzlePlaceholder';

/**
 * רישום רכיבי החידות לפי תחנה.
 * כשכל חידה תמומש, מחליפים כאן את ה-placeholder ברכיב האמיתי, למשל:
 *   'last-photo': LastPhotoPuzzle,
 */
export const PUZZLE_COMPONENTS: Record<StationId, ComponentType<PuzzleProps>> = {
  'last-photo': PuzzlePlaceholder,
  'camera-system': PuzzlePlaceholder,
  'transmission-system': PuzzlePlaceholder,
  'power-source': PuzzlePlaceholder,
  'orbit': PuzzlePlaceholder,
  'mission-file': PuzzlePlaceholder,
};
