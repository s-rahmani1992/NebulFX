import {Vector2} from "./Vertices"

export class ParticleData{
    position: Vector2;
    color: { r: number; g: number; b: number; a: number };
    scale: Vector2;
    isAlive: boolean;

    constructor(position: Vector2, color: { r: number; g: number; b: number; a: number }, scale: Vector2, isAlive: boolean) {
        this.position = position;
        this.color = color;
        this.scale = scale;
        this.isAlive = isAlive;
    }
}