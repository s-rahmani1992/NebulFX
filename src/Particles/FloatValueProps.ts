
const FloatGenerationType = {
    Constant: 0,
    RandomRange: 1,
    BetweenTwoConstants: 2,
} as const;

type FloatGenerationType = typeof FloatGenerationType[keyof typeof FloatGenerationType];

export { FloatGenerationType };

export class FloatValueProps{
    public generationType: FloatGenerationType = FloatGenerationType.Constant;
    public value : number = 1.0;
    public value1 : number = 1.5;
    public probability : number = 0.5;
    public isChanged: boolean = true;
}