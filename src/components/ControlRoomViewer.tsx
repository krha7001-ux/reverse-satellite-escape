import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONTROL_ROOM_ASPECT,
  CONTROL_ROOM_IMAGE,
  STATIONS,
} from '../data/stations';
import { getStationStatus } from '../hooks/useGameState';
import type { StationId } from '../types/game';

interface ControlRoomViewerProps {
  solvedStations: StationId[];
  onOpenStation: (stationId: StationId) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

/**
 * חדר הבקרה האינטראקטיבי: תמונה רחבה עם גרירה אופקית, הגדלה/הקטנה
 * ושכבת נקודות לחיצה שצמודה לתמונה וזזה יחד איתה.
 */
export function ControlRoomViewer({
  solvedStations,
  onOpenStation,
}: ControlRoomViewerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState<number | null>(null);
  const dragRef = useRef({ dragging: false, lastX: 0 });

  // מעקב אחרי גודל אזור התצוגה (רספונסיבי)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // גודל הבמה: התמונה מכסה תמיד את כל אזור התצוגה, מוכפלת בזום
  const baseHeight = Math.max(
    viewport.height,
    viewport.width / CONTROL_ROOM_ASPECT,
  );
  const stageHeight = baseHeight * zoom;
  const stageWidth = stageHeight * CONTROL_ROOM_ASPECT;
  const minOffsetX = Math.min(0, viewport.width - stageWidth);
  const offsetY = (viewport.height - stageHeight) / 2;

  const clampX = useCallback(
    (x: number) => Math.min(0, Math.max(minOffsetX, x)),
    [minOffsetX],
  );

  // מיקום פתיחה: מרכז החדר; שמירת התיחום בשינויי גודל וזום
  const effectiveOffsetX = clampX(offsetX ?? minOffsetX / 2);

  const applyZoom = (direction: 1 | -1) => {
    const nextZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, zoom + direction * ZOOM_STEP),
    );
    if (nextZoom === zoom) return;
    // שמירה על מרכז התצוגה יציב בזמן שינוי הזום
    const scale = nextZoom / zoom;
    const center = viewport.width / 2;
    const nextOffset = center - (center - effectiveOffsetX) * scale;
    setZoom(nextZoom);
    setOffsetX(nextOffset);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // לחיצה על נקודת תחנה או כפתור זום אינה מתחילה גרירה —
    // לכידת המצביע הייתה מנתבת את אירוע ה-click הרחק מהכפתור
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = { dragging: true, lastX: e.clientX };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.dragging) return;
    const dx = e.clientX - drag.lastX;
    drag.lastX = e.clientX;
    setOffsetX(clampX(effectiveOffsetX + dx));
  };

  const endDrag = () => {
    dragRef.current.dragging = false;
  };

  return (
    <div
      ref={viewportRef}
      className="control-room-viewport"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="control-room-stage"
        style={{
          width: stageWidth,
          height: stageHeight,
          transform: `translate(${effectiveOffsetX}px, ${offsetY}px)`,
        }}
      >
        <img
          className="control-room-img"
          src={CONTROL_ROOM_IMAGE}
          alt="חדר הבקרה של לוויין הריגול קשת–8"
          draggable={false}
        />
        {STATIONS.map((station) => {
          const status = getStationStatus(station.id, solvedStations);
          const isClickable = status === 'active';
          return (
            <button
              key={station.id}
              type="button"
              className={`hotspot ${status}`}
              style={{
                left: `${station.hotspot.x}%`,
                top: `${station.hotspot.y}%`,
              }}
              disabled={!isClickable}
              onClick={() => isClickable && onOpenStation(station.id)}
              aria-label={
                status === 'locked'
                  ? `${station.title} — עמדה נעולה`
                  : status === 'solved'
                    ? `${station.title} — עמדה שהושלמה`
                    : `${station.title} — פתיחת העמדה הפעילה`
              }
            >
              <span className="hotspot-ring" aria-hidden="true" />
              <span className="hotspot-icon" aria-hidden="true">
                {status === 'locked' ? '🔒' : status === 'solved' ? '✓' : station.icon}
              </span>
              <span className="hotspot-label">{station.title}</span>
            </button>
          );
        })}
      </div>

      <div className="zoom-controls">
        <button
          type="button"
          className="zoom-button"
          onClick={() => applyZoom(1)}
          disabled={zoom >= MAX_ZOOM}
          aria-label="הגדלה"
        >
          +
        </button>
        <button
          type="button"
          className="zoom-button"
          onClick={() => applyZoom(-1)}
          disabled={zoom <= MIN_ZOOM}
          aria-label="הקטנה"
        >
          −
        </button>
      </div>

      <div className="drag-hint">
        <span aria-hidden="true">🖐️</span>
        <span>גררו כדי לסרוק את חדר הבקרה ולחצו על העמדה הפעילה</span>
      </div>
    </div>
  );
}
