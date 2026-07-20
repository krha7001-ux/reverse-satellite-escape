import type { StationId } from '../types/game';
import type { RoomSound } from './soundManager';

interface SoundStep {
  sound: RoomSound;
  delay: number;
}

/** רצפי הצלילים של אנימציות הכניסה, לפי תחנה */
export const ENTRY_SOUNDS: Record<StationId, SoundStep[]> = {
  'last-photo': [
    { sound: 'stationOpen', delay: 0 },
    { sound: 'radioWave', delay: 350 },
  ],
  'camera-system': [
    { sound: 'glassDoor', delay: 0 },
    { sound: 'tray', delay: 450 },
  ],
  'transmission-system': [
    { sound: 'radioWave', delay: 0 },
    { sound: 'motor', delay: 300 },
  ],
  'power-source': [
    { sound: 'motor', delay: 0 },
    { sound: 'powerCharge', delay: 400 },
  ],
  'orbit': [
    { sound: 'stationOpen', delay: 0 },
    { sound: 'motor', delay: 350 },
  ],
  'mission-file': [
    { sound: 'vaultWheel', delay: 0 },
    { sound: 'vaultBolt', delay: 500 },
    { sound: 'vaultBolt', delay: 700 },
    { sound: 'vaultBolt', delay: 900 },
    { sound: 'metalDoor', delay: 1050 },
  ],
};

/** רצפי הצלילים של אנימציות ההצלחה בחזרה לחדר */
export const SUCCESS_SOUNDS: Record<StationId, SoundStep[]> = {
  'last-photo': [
    { sound: 'drawer', delay: 100 },
    { sound: 'correct', delay: 700 },
  ],
  'camera-system': [
    { sound: 'tray', delay: 100 },
    { sound: 'orbitLock', delay: 800 },
    { sound: 'correct', delay: 1200 },
  ],
  'transmission-system': [
    { sound: 'radioWave', delay: 100 },
    { sound: 'radioWave', delay: 600 },
    { sound: 'correct', delay: 1200 },
  ],
  'power-source': [
    { sound: 'motor', delay: 0 },
    { sound: 'powerCharge', delay: 400 },
    { sound: 'correct', delay: 1300 },
  ],
  'orbit': [
    { sound: 'orbitLock', delay: 300 },
    { sound: 'correct', delay: 1100 },
  ],
  'mission-file': [
    { sound: 'metalDoor', delay: 0 },
    { sound: 'correct', delay: 1200 },
  ],
};
