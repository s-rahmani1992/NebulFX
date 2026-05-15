import { ColorValueProps } from "./ColorValueProps";
import { Emitter } from "./Emitter";
import { FloatValueProps } from "./FloatValueProps";

export class ParticleProps{
    public startSize: FloatValueProps = new FloatValueProps();
    public startColor: ColorValueProps = new ColorValueProps();
    public emitter: Emitter = new Emitter();
}