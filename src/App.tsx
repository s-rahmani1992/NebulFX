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
import EmitterPropsEditor from './Components/EmitterPropsEditor';
import RenderContextScroller from './Components/RenderContextScroller';

import { ParticleProps } from './Particles/ParticleProperties';
import { GraphicAPI, ParticleSimulator } from './ParticleSimulator';
import { Emitter } from './Particles/Emitter';
import { IntInputField } from './Components/IntValueField';

const sectionTitleCSS = "mb-1 text-center text-2xl font-bold"

function App() {
  const [simulator, SetSimulator] = useState<ParticleSimulator | null>(null)
  let particlePropertiesRef = useRef<ParticleProps>(null);
  let backgroundColorRef = useRef<{ r: number; g: number; b: number; a: number }>({ r: 0, g: 0, b: 0, a: 1 });

  if (!particlePropertiesRef.current) {
    [particlePropertiesRef.current, backgroundColorRef.current] = LoadUserData();
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
        particleSim.engine.clearColor = backgroundColorRef.current;
        particleSim.maxParticleFlag = particlePropertiesRef.current!.maxParticles;
        SetSimulator(particleSim);
      }
    }

    init();
    return () => {
      mounted = false
    };
  }, []);

  useEffect(() => { //TODO right now, the user data is saved every one second. it should be changed to be saved whenever the browser is closed
    const id = setInterval(() => {
      if (!simulator) {
        return;
      }
      const userObj: any = {};
      userObj["properties"] = simulator.engine.properties;
      const contextObj : any = {};
      contextObj["bg-color"] = simulator.engine.clearColor;
      userObj["context"] = contextObj;
      localStorage.setItem("userData", JSON.stringify(userObj));
    }, 1000); // 1 second

    return () => clearInterval(id);
  }, [simulator]);

  if (!simulator) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-700">
        <h1 className="text-2xl text-white">Loading...</h1>
      </div>
      )
  }

  return (
    <>
      <div className="flex flex-row h-150 min-w-250 w-screen m-5 justify-center gap-1">
        {/* Particle Properties Panel */}
        <div className="overflow-x-hidden overflow-y-auto h-full min-w-100 w-100 p-2 m-2 rounded-2xl border-2 bg-cyan-900">
          <div className="mb-2 pr-2 pl-2 pt-1 pb-2 bg-emerald-100 rounded-2xl">
            <h2 className={sectionTitleCSS} >General Settings</h2>
            <IntInputField label='Maximum Particles' min={1} max={1000000} value={particlePropertiesRef.current.maxParticles} onValueChanged={value => {
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
        <div className="m-2 h-full w-100 flex flex-col">
          <ParticlePlayPanel simulator={simulator} />
          <ParticleStatsPanel simulator={simulator} />

          <div className="relative flex-1">
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

function LoadUserData(): [ParticleProps, { r: number; g: number; b: number; a: number }] {
  const saved = localStorage.getItem("userData");
  if (!saved) {
    console.warn("save not found");
    return [new ParticleProps(), { r: 0, g: 0, b: 0, a: 1 }];
  }

  let savedObj;
  try {
    savedObj = JSON.parse(saved);
  }
  catch (e) {
    return [new ParticleProps(), { r: 0, g: 0, b: 0, a: 1 }];
  }

  // Particle Properties
  let properties: ParticleProps;

  try {
    const propertiesJson = savedObj["properties"];
    properties = propertiesJson as ParticleProps;
    properties.emitter = Emitter.FromJSON(propertiesJson["emitter"]);
    properties.startColor.isChanged = true;
    properties.startLifetime.isChanged = true;
    properties.startSize.isChanged = true;
    properties.startSpeed.isChanged = true;
  }
  catch (e) {
    properties = new ParticleProps();
  }

  let bgColor : { r: number; g: number; b: number; a: number };

  try {
    const contextJson = savedObj["context"];
    bgColor = contextJson["bg-color"] as { r: number; g: number; b: number; a: number };
  }
  catch (e) {
    bgColor = { r: 0, g: 1, b: 0, a: 1 };
  }

  return [properties, bgColor];
}