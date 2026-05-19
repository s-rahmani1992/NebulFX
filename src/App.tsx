import { useRef, useState, useEffect } from 'react';

import './index.css'

import packageJson from '../package.json';

// Components
import RenderContext from './Components/RenderContext'
import FloatPropsEditor from './Components/FloatPropsEditor';
import ColorPropsEditor from './Components/ColorPropsEditor';
import { ColorInputField } from './Components/ColorInputField';
import ParticlePlayPanel from './Components/ParticlePlayPanel';
import ParticleStatsPanel from './Components/ParticleStatsPanel';
import { FloatInputField } from './Components/FloatInputField';
import EmitterPropsEditor from './Components/EmitterPropsEditor';
import RenderContextScroller from './Components/RenderContextScroller';

import { ParticleProps } from './Particles/ParticleProperties';
import { GraphicAPI, ParticleSimulator } from './ParticleSimulator';

const sectionTitleCSS = "mb-1 text-center text-2xl font-bold"

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
      <div className="flex flex-row h-140 justify-center gap-10">
        {/* Particle Properties Panel */}
        <div className="overflow-x-hidden overflow-y-auto p-2 min-w-100 w-100 m-10 rounded-2xl border-2 bg-cyan-900">
          <div className="mb-2 pr-2 pl-2 pt-1 pb-2 bg-emerald-100 rounded-2xl">
            <h2 className={sectionTitleCSS} >General Settings</h2>
            <FloatInputField label='Maximum Particles' min={1} max={1000000} value={simulator.engine.maxParticles} onValueChanged={value => {
              simulator.maxParticleFlag = value;
            }} />
            <ColorInputField className='mt-1' label='Background' color={simulator.engine.clearColor} onChanged={() => { }} />
          </div>
          <div className="mb-2 pr-2 pl-2 pt-1 pb-2 bg-emerald-100 rounded-2xl">
            <h2 className={sectionTitleCSS} >Emission</h2>
            <EmitterPropsEditor emitter={particlePropertiesRef.current.emitter} />
          </div>
          <div className="mb-2 pr-2 pl-2 pt-1 pb-2 bg-emerald-100 rounded-2xl">
            <h2 className={sectionTitleCSS} >Startup Properties</h2>
            <FloatPropsEditor label='Start Size' floatProps={particlePropertiesRef.current.startSize} />
            <hr className="border-gray-400 my-2 border-1" />
            <ColorPropsEditor label='Start Color' colorProps={particlePropertiesRef.current.startColor} />
            <hr className="border-gray-400 my-2 border-1" />
            <FloatPropsEditor label='Start Lifetime' floatProps={particlePropertiesRef.current.startLifetime} />
            <hr className="border-gray-400 my-2 border-1" />
            <FloatPropsEditor label='Start Speed' floatProps={particlePropertiesRef.current.startSpeed} />
          </div>
        </div>

        {/* Particle Scene and Context Panel */}
        <div className="p-10">
          <ParticlePlayPanel simulator={simulator} />
          <ParticleStatsPanel simulator={simulator} />
          <div className='relative w-100 h-100'>
            <div className="absolute inset-0">
              <RenderContext simulator={simulator} />
            </div>
            <div className="absolute inset-0">
              <RenderContextScroller camera={simulator.engine.camera} />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl text-center text-gray-800">version: {packageJson.version}</h2>
      </div>
    </>
  )
}

export default App
