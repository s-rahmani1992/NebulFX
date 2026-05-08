import { useRef } from 'react';

import packageJson from '../package.json';
import RenderContext from './Components/RenderContext'

import ParticleEngine from './Rendering/ParticleEngine';
import WebGPUParticleEngine from './Rendering/WebGPU/WebGPUParticleEngine';

import './index.css'

function App() {
  const particleEngineRef = useRef<ParticleEngine | null>(null);

  if (!particleEngineRef.current) {
    particleEngineRef.current = new WebGPUParticleEngine();
  }

  return (
    <>
      <div>
        <h1 className="text-4xl text-center font-bold mt-10">NebulFX</h1>
        <h2 className="text-2xl text-center text-gray-800">version: {packageJson.version}</h2>
      </div>
      <div className="flex flex-row h-screen justify-center gap-10">
        <div className=" flex items-center justify-center bg-gray-800 min-w-100 m-10 rounded-3xl">
          <p className="text-gray-300 mt-4 align text-2xl">Particle Control Panel</p>
        </div>
        <div className="p-10">
            <RenderContext engine={particleEngineRef.current}/>
        </div>
      </div>
    </>
  )
}

export default App
