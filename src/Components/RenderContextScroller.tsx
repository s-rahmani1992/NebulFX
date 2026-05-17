import { useState, useEffect, useRef } from "react";
import type { Camera2D } from "../Camera2D";

export default function RenderContextScroller({ camera }: { camera: Camera2D }) {
    const divRef = useRef<HTMLDivElement>(null);

    const [isPanning, setIsPanning] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let divElement = divRef.current;

        if (!divElement) return;

      const onMouseDown = (e: MouseEvent) => {
        if (e.button === 1) {            // MIDDLE MOUSE
          e.preventDefault();            // Prevent browser auto-scroll
          setIsPanning(true);
          setLastPos({ x: e.clientX, y: e.clientY });
        }
      };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;

      camera.Move(dx, dy);

      setLastPos({ x: e.clientX, y: e.clientY });
    };

    const onMouseUp = () => setIsPanning(false);

    const onWheel = (e:WheelEvent) => {
      e.preventDefault();
      camera.Zoom(e.deltaY < 0);
    };

    divElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    divElement.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      divElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      divElement.removeEventListener("wheel", onWheel);
    };
  }, [isPanning, lastPos, camera]);

  return (
    <div  className="w-full h-full" ref={divRef}/>
    )
}