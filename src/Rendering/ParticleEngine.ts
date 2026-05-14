import { ParticleProps } from "../Particles/ParticleProperties"

export default abstract class ParticleEngine{
    abstract Initialize(error: { message: string }): Promise<boolean>;
    abstract AttachCanvas(canvas: HTMLCanvasElement, error: { message: string }) : Promise<boolean>;
    abstract Update(deltaTime: number): Promise<void>;
    abstract Render(): Promise<void>;
    abstract Stop() : Promise<void>;
    abstract ActiveParticles() : Promise<number>;

    public clearColor: { r: number; g: number; b: number; a: number } = { r: 0, g: 0, b: 0, a: 1 };
    public properties: ParticleProps = new ParticleProps();
}