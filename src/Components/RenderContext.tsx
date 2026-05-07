import { useEffect, useRef } from "react";

export default function RenderContext() {
    useEffect(() => {
  // --- 1. Setup (runs once) ---

  let running = true;

  // --- 2. infinite loop ---
  function Render() {
    if (!running) return;

    requestAnimationFrame(Render);
  }

  // Start the loop once
  requestAnimationFrame(Render);

  // --- 3. Cleanup (runs on unmount) ---
  return () => {
    running = false;
  };
}, []);
    
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
  return (
    <canvas className="border-2 border-gray-300 rounded-lg shadow-lg"
      ref={canvasRef}
      id="webgpu-canvas"
      width={400}
      height={400}
    />
  )
}