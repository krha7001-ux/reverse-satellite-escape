import { useEffect, useRef } from 'react';
import { drawAerialScene, SOURCE_SIZE } from './aerialPhoto';

/** התצלום האווירי, מפוקסל בפועל לפי הרזולוציה הנבחרת */
export function PixelatedPhoto({ resolution }: { resolution: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!sourceRef.current) {
      const source = document.createElement('canvas');
      source.width = SOURCE_SIZE;
      source.height = SOURCE_SIZE;
      drawAerialScene(source.getContext('2d')!);
      sourceRef.current = source;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // דגימה לרזולוציה הנמוכה ואז הגדלה ללא החלקה — פיקסול אמיתי
    const small = document.createElement('canvas');
    small.width = resolution;
    small.height = resolution;
    const smallCtx = small.getContext('2d')!;
    smallCtx.imageSmoothingEnabled = true;
    smallCtx.drawImage(sourceRef.current, 0, 0, resolution, resolution);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
  }, [resolution]);

  return (
    <canvas
      ref={canvasRef}
      className="photo-canvas"
      width={512}
      height={512}
      aria-label={`תצלום אווירי ברזולוציה ${resolution}×${resolution}`}
    />
  );
}
