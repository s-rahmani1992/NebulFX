export class Vector2{
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Vertex2D{
    position: Vector2;
    uv: Vector2;

    constructor(position: Vector2, uv: Vector2) {
        this.position = position;
        this.uv = uv;
    }
}