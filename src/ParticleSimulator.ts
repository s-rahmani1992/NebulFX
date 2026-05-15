import type ParticleEngine from "./Rendering/ParticleEngine";
import WebGPUParticleEngine from "./Rendering/WebGPU/WebGPUParticleEngine";

const GraphicAPI = {
    WebGPU: 0,
} as const;

type GraphicAPI = typeof GraphicAPI[keyof typeof GraphicAPI];

export { GraphicAPI };

export class ParticleSimulator{
    public engine!: ParticleEngine
    public isPlaying : boolean = true;
    public isStopFlag : boolean = false;
    public maxParticleFlag : number = -1;

    constructor(graphicAPI : GraphicAPI){
        switch(graphicAPI){
            case GraphicAPI.WebGPU:
                this.engine = new WebGPUParticleEngine();
                break;
        }
    }
}