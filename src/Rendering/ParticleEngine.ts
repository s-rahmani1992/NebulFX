import { ParticleProps } from "../Particles/ParticleProperties"

export default abstract class ParticleEngine{
    abstract Initialize(canvas: HTMLCanvasElement, error: { message: string }): Promise<boolean>;
    abstract Update(deltaTime: number): Promise<void>;
    abstract Render(): Promise<void>;

    public properties: ParticleProps = new ParticleProps();
}