import { mat4 } from "gl-matrix";
import { Vector2 } from "./Rendering/Vertices";

export class Camera2D{
    public position: Vector2 = new Vector2(0.0, 0.0);
    public zoom: number = 20.0;

    private m_zoomStep: number = 2;
    private m_projMatrix : mat4 = mat4.create();
    private m_aspect: number = 1.0;
    private m_moveStep: number  = 0.05;

    GetMatrix(): mat4{
        return this.m_projMatrix;
    }

    UpdateMatrix(){
        mat4.ortho(this.m_projMatrix, this.position.x - this.zoom * this.m_aspect/2, this.position.x + this.zoom * this.m_aspect/2, this.position.y + 0.5 * this.zoom, this.position.y - 0.5 * this.zoom, -1, 1);
    }

    SetProjectionParameters(width:number, height: number){
        this.m_aspect = width/height;
        this.UpdateMatrix();
    }

    Zoom(isZoomin: boolean){
        if(isZoomin){
            this.zoom *= this.m_zoomStep;

            if(this.zoom > 1600)
                this.zoom = 1600;
        }
        else{
            this.zoom /= this.m_zoomStep;

            if(this.zoom < 2)
                this.zoom = 2;
        }
        
        this.m_moveStep = this.zoom / 400;
        this.UpdateMatrix();
    }

    Move(deltaX:number, deltaY:number){
        this.position = new Vector2(this.position.x - deltaX * this.m_moveStep, this.position.y - deltaY * this.m_moveStep);
        this.UpdateMatrix();
    }
}