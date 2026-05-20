const IntGenerationType = {
    Constant: 0,
    RandomRange: 1,
    BetweenTwoConstants: 2,
} as const;

type IntGenerationType = typeof IntGenerationType[keyof typeof IntGenerationType];

export {IntGenerationType};

export class IntValueProps{
    public generationType: IntGenerationType = IntGenerationType.Constant;
    public value : number = 60;
    public value1 : number = 300;
    public probability : number = 0.5;

    Generate() : number {
        switch(this.generationType){
            case IntGenerationType.Constant:
                return this.value;
            case IntGenerationType.RandomRange:
                return Math.floor(Math.random() * (this.value1 - this.value + 1) + this.value);
            case IntGenerationType.BetweenTwoConstants:
                {
                    const r = Math.random();
                    return (r < this.probability ? this.value : this.value1);
                }
            default:
                return 0;
        }
    }
}

export class Emitter{
    public spawnRate : IntValueProps = new IntValueProps();
    private m_totalParticlesSpawned: number = 0.0;

    Spawn(deltaTime:number) : number{
        this.m_totalParticlesSpawned += this.spawnRate.Generate() * deltaTime;

        let particlesTospawn = Math.floor(this.m_totalParticlesSpawned);
        this.m_totalParticlesSpawned -= particlesTospawn;
        return particlesTospawn;
    }

    Reset():void{
        this.m_totalParticlesSpawned = 0.0;
    }

    static FromJSON(json: any) : Emitter{
        const e = new Emitter();
        Object.assign(e, json);

        // Rehydrate nested classes too
        e.spawnRate = Object.assign(new IntValueProps(), json.spawnRate);
        e.m_totalParticlesSpawned = 0.0;
        return e;
    }
}