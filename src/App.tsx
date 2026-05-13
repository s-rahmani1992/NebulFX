import { useRef } from 'react';

import packageJson from '../package.json';
import RenderContext from './Components/RenderContext'
import FloatPropsModifier from './Components/FloatPropsModifier';
import ColorPropsModifier from './Components/ColorPropsModifier';

import ParticleEngine from './Rendering/ParticleEngine';
import WebGPUParticleEngine from './Rendering/WebGPU/WebGPUParticleEngine';
import { ParticleProps } from './Particles/ParticleProperties';
import { ColorInputField } from './Components/ColorInputField';

import './index.css'

function App() {
  const particleEngineRef = useRef<ParticleEngine | null>(null);
  let particlePropertiesRef = useRef<ParticleProps>(null);

  if (!particleEngineRef.current) {
    particleEngineRef.current = new WebGPUParticleEngine();
  }

  if (!particlePropertiesRef.current) {
    particlePropertiesRef.current = new ParticleProps();
    particleEngineRef.current.properties = particlePropertiesRef.current;
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
          <ColorInputField label='Background' color={particleEngineRef.current.clearColor} onChanged={c=>{}} />
          <RenderContext engine={particleEngineRef.current} />
        </div>
      </div>
    </>
  )
}

export default App
