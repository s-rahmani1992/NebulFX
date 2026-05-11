import {Vector2} from "./Vertices"

const ParticleState = {
    Dead: 0,
    JustSpawned: 1,
    Alive: 2,
} as const;

export type ParticleState = typeof ParticleState[keyof typeof ParticleState];

export class ParticleData{
    public age: number = 0;
    public lifeTime: number = 1;
    public state: ParticleState = ParticleState.Dead;
    public position: Vector2 = new Vector2(0, 0);
    public scale: Vector2 = new Vector2(1, 1);
    public color: { r: number; g: number; b: number; a: number } = { r: 1, g: 1, b: 1, a: 1 };
    public velocity: Vector2 = new Vector2(0, 0);

    static SizeInBytes: number = 4 * (1 + 1 + 1 + 1 + 2 + 2 + 4 + 2 + 2) // age, lifeTime, state, position, scale, color, velocity
}