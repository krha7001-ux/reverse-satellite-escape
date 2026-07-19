import type { ComponentType } from 'react';
import type { PuzzleProps, StationId } from '../types/game';
import { PuzzlePlaceholder } from './PuzzlePlaceholder';
import { LastPhotoPuzzle } from './LastPhotoPuzzle';
import { CameraPuzzle } from './CameraPuzzle';

/**
 * רישום רכיבי החידות לפי תחנה.
 * כל רכיב חידה אחראי גם על מעטפת התצוגה שלו (מסוף, חלון וכדומה).
 * כשחידה ממומשת, מחליפים כאן את ה-placeholder ברכיב האמיתי.
 */
export const PUZZLE_COMPONENTS: Record<StationId, ComponentType<PuzzleProps>> = {
  'last-photo': LastPhotoPuzzle,
  'camera-system': CameraPuzzle,
  'transmission-system': PuzzlePlaceholder,
  'power-source': PuzzlePlaceholder,
  'orbit': PuzzlePlaceholder,
  'mission-file': PuzzlePlaceholder,
};
