export default abstract class ParticleEngine{
    abstract Initialize(canvas: HTMLCanvasElement, error: { message: string }): Promise<boolean>;
    abstract Update(deltaTime: number): void;
    abstract Render(): void;
}