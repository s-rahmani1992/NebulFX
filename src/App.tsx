import { useRef } from 'react';

import packageJson from '../package.json';
import RenderContext from './Components/RenderContext'
import FloatPropsModifier from './Components/FloatPropsModifier';
import ColorPropsModifier from './Components/ColorPropsModifier';

import { ParticleProps } from './Particles/ParticleProperties';
import { ColorInputField } from './Components/ColorInputField';

import './index.css'
import ParticlePlayPanel from './Components/ParticlePlayPanel';
import { GraphicAPI, ParticleSimulator } from './ParticleSimulator';

function App() {
  let particleSimulatorRef = useRef<ParticleSimulator | null>(null);
  let particlePropertiesRef = useRef<ParticleProps>(null);

  if (!particleSimulatorRef.current) {
    particleSimulatorRef.current = new ParticleSimulator(GraphicAPI.WebGPU);
  }

  if (!particlePropertiesRef.current) {
    particlePropertiesRef.current = new ParticleProps();
    particleSimulatorRef.current.engine.properties = particlePropertiesRef.current;
  }

  return (
    <>
      <div>
        <h1 className="text-4xl text-center font-bold mt-10">NebulFX</h1>
        <h2 className="text-2xl text-center text-gray-800">version: {packageJson.version}</h2>
      </div>
      <div className="flex flex-row h-screen justify-center gap-10">
        <div className="p-2 items-center justify-center min-w-100 m-10 rounded-2xl border-2 bg-cyan-900">
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
          <ColorInputField label='Background' color={particleSimulatorRef.current.engine.clearColor} onChanged={c=>{}} />
          <ParticlePlayPanel simulator={particleSimulatorRef.current}/>
          <RenderContext simulator={particleSimulatorRef.current} />
        </div>
      </div>
    </>
  )
}

export default App
