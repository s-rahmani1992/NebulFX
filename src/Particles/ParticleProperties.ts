import { ColorValueProps } from "./ColorValueProps";
import { FloatValueProps } from "./FloatValueProps";

export class ParticleProps{
    public startSize: FloatValueProps = new FloatValueProps();
    public startColor: ColorValueProps = new ColorValueProps();
}