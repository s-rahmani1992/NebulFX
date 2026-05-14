import { useReducer, useEffect, useRef } from "react";
import type { ParticleSimulator } from "../ParticleSimulator";

export default function ParticleStatsPanel({ simulator }: { simulator: ParticleSimulator }) {
    const forceUpdate = useReducer(x => x + 1, 0)[1];
    const lastFrameTimeRef = useRef<number>(performance.now());
    const particleCountRef = useRef<number>(0);

    let engine = simulator.engine;

    useEffect(() => {
        const Run = async () => {
          
          let running = true;
          lastFrameTimeRef.current = performance.now();
    
          async function Render() {
            if (!running) return;
    
            if (!simulator.isPlaying) {
              requestAnimationFrame(Render);
              return;
            }
    
            while (performance.now() - lastFrameTimeRef.current < 1) { }

            particleCountRef.current = await engine.ActiveParticles();
            forceUpdate();
            requestAnimationFrame(Render);
          }
    
          requestAnimationFrame(Render);
        
          return () => {
            running = false;
          };
        };
    
        Run();
      }, [engine]);

    return (
        <div className="flex border-2 border-gray-300 rounded-lg shadow-lg">
            <h1 className = "pl-2">Active Particles: {particleCountRef.current}</h1>
        </div>
    )
}