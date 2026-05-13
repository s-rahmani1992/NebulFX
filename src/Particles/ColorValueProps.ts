const ColorGenerationMode = {
    Constant: 0,
    Range: 1,
    BetweenTwoConstants: 2,
} as const;

type ColorGenerationMode = typeof ColorGenerationMode[keyof typeof ColorGenerationMode];

export { ColorGenerationMode };

export class ColorValueProps{
    public generationMode: ColorGenerationMode = ColorGenerationMode.Constant;
    public color : { r: number; g: number; b: number; a: number } = { r: 1, g: 1, b: 1, a: 1 };
    public color1 : { r: number; g: number; b: number; a: number } = { r: 1, g: 0, b: 1, a: 1 };
    public probability : number = 0.5;
    public isChanged: boolean = true;
}