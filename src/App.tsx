import { useRef, useState, useEffect } from 'react';

import packageJson from '../package.json';

// Components
import RenderContext from './Components/RenderContext'
import FloatPropsModifier from './Components/FloatPropsModifier';
import ColorPropsModifier from './Components/ColorPropsModifier';
import { ColorInputField } from './Components/ColorInputField';
import ParticlePlayPanel from './Components/ParticlePlayPanel';
import ParticleStatsPanel from './Components/ParticleStatsPanel';

import { ParticleProps } from './Particles/ParticleProperties';

import './index.css'

import { GraphicAPI, ParticleSimulator } from './ParticleSimulator';
import { FloatInputField } from './Components/FloatInputField';


function App() {
  const [simulator, SetSimulator] = useState<ParticleSimulator | null>(null)
  let particlePropertiesRef = useRef<ParticleProps>(null);

  if (!particlePropertiesRef.current) {
    particlePropertiesRef.current = new ParticleProps();
  }

  const error = { message: "" };

  useEffect(() => {
  let mounted = true;

  async function init() {
    let particleSim = new ParticleSimulator(GraphicAPI.WebGPU);

    const ok = await particleSim.engine.Initialize(error);
    console.log(error.message);
    if (mounted && ok) {
      console.log("simulator initialized")
      particleSim.engine.properties = particlePropertiesRef.current!;
      SetSimulator(particleSim);
    }
  }

  init();
  return () => { mounted = false };
}, []);


  if(!simulator) return <div>{error.message}</div>;

  return (
    <>
      <div>
        <h1 className="text-4xl text-center font-bold mt-10">NebulFX</h1>
        <h2 className="text-2xl text-center text-gray-800">version: {packageJson.version}</h2>
      </div>
      <div className="flex flex-row h-screen justify-center gap-10">
        <div className="p-2 items-center justify-center min-w-100 m-10 rounded-2xl border-2 bg-cyan-900">
          <div className="mb-2 p-2 bg-emerald-100 rounded-2xl">
            <h2 className="text-center text-3xl text-" >General Settings</h2>
            <FloatInputField label='Maximum Particles' min={1} max={1000000} value={simulator.engine.maxParticles} onValueChanged={value=>{
            simulator.maxParticleFlag = value;
          }}/>
          </div>
          <div className="mb-2 p-2 bg-emerald-100 rounded-2xl">
            <h2 className="text-center text-3xl text-" >Start Size</h2>
            <FloatPropsModifier floatProps={particlePropertiesRef.current.startSize} />
          </div>
          <div className="p-2 bg-emerald-100 rounded-2xl">
            <h2 className="text-center text-3xl text-" >Start Color</h2>
            <ColorPropsModifier colorProps={particlePropertiesRef.current.startColor} />
          </div>
        </div>
        <div className="p-10">
          <ColorInputField label='Background' color={simulator.engine.clearColor} onChanged={c=>{}} />
          <ParticlePlayPanel simulator={simulator}/>
          <RenderContext simulator={simulator} />
          <ParticleStatsPanel simulator={simulator}/>
        </div>
      </div>
    </>
  )
}

export default App
