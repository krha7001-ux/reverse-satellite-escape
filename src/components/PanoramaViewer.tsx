import { PANORAMA_URL } from '../data/stations';

/** פנורמת 360° של חדר הבקרה + מחוון גרירה */
export function PanoramaViewer() {
  return (
    <div className="panorama-wrap">
      <iframe
        className="panorama-frame"
        src={PANORAMA_URL}
        allow="fullscreen"
        title="פנורמת חדר הבקרה — גררו כדי להסתובב"
      />
      <div className="drag-hint">
        <span aria-hidden="true">🖐️</span>
        <span>גררו את החדר כדי להסתובב ולהביט סביב</span>
      </div>
    </div>
  );
}
