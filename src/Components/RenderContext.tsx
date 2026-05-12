import { useEffect, useRef } from "react";
import type ParticleEngine from "../Rendering/ParticleEngine";

export default function RenderContext({ engine }: { engine: ParticleEngine }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetFps = 60;
  const frameDuration = 1000 / targetFps; // 60 FPS
  const lastFrameTimeRef = useRef<number>(performance.now());
  let dt = 0;

  useEffect(() => {
    console.log("Render Context UseEffect called");
    // --- 1. Setup (runs once) ---
    const Run = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas element not found");
        return;
      }
      const error = { message: "" };

      if (!await engine.Initialize(canvas,error)) {
        console.error("Failed to initialize particle engine: " + error.message);
        return;
      }

      // --- 2. infinite loop ---

      let running = true;
      lastFrameTimeRef.current = performance.now();
      async function Render() {
        if (!running) return;

        while(performance.now() - lastFrameTimeRef.current < frameDuration) {
        }

        dt = (performance.now() - lastFrameTimeRef.current)/1000;
        lastFrameTimeRef.current = performance.now();
        
        await engine.Update(dt);
        await engine.Render();

        requestAnimationFrame(Render);
      }

      // Start the loop once
      requestAnimationFrame(Render);
    
      // --- 3. Cleanup (runs on unmount) ---
      return () => {
        running = false;
      };
    };

    Run();
  }, [engine]);
    
  return (
    <canvas className="border-2 border-gray-300 rounded-lg shadow-lg"
      ref={canvasRef}
      id="webgpu-canvas"
      width={500}
      height={500}
    />
  )
}