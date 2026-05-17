fn hash_u32(x: u32) -> u32 {
    var h = x;
    h ^= h >> 16u;
    h *= 0x7feb352du;
    h ^= h >> 15u;
    h *= 0x846ca68bu;
    h ^= h >> 16u;
    return h;
}

fn RandomRange(seed: ptr<function,u32>, min: f32, max: f32) -> f32 {
    let h = hash_u32(*seed);
    let r = f32(h) / 4294967296.0; // 2^32
    (*seed) = (*seed) * 1664525u + 1013904223u;
    return mix(min, max, r);
}

struct FloatValueProps{
    generationMode: u32,
    value: f32,
    value1: f32,
    probability: f32,
}

fn GenerateValue(props: FloatValueProps, seed: ptr<function, u32>) -> f32 {
    switch props.generationMode {
        case 0u: { // Constant
            return props.value;
        }
        case 1u: { // Random Range
            return RandomRange(seed, props.value, props.value1);
        }
        case 2u: { // Between Range
            let r = RandomRange(seed, 0.0, 1.0);
            return select(props.value1, props.value, r < props.probability);
        }
        default: {
            return 0.01;
        }
    }
}

struct ColorValueProps{
    color: vec4f,
    color1: vec4f,
    generationMode: u32,
    probability: f32,
}

fn GenerateColor(props: ColorValueProps, seed: ptr<function, u32>) -> vec4f {
    switch props.generationMode {
        case 0u: { // Constant
            return props.color;
        }
        case 1u: { // Random Range
            let t = RandomRange(seed, 0.0, 1.0);
            return t * props.color + (1 - t ) * props.color1;
        }
        case 2u: { // Between Range
            let r = RandomRange(seed, 0.0, 1.0);
            return select(props.color1, props.color, r < props.probability);
        }
        default: {
            return vec4(1.0,1.0,1.0,1.0);
        }
    }
}

@group(0) @binding(0) var<storage, read_write> particles : array<ParticleData>;
@group(0) @binding(1) var<storage, read_write> freeIndices : array<u32>;
@group(0) @binding(2) var<storage, read_write> frameData : ParticleFrameData;

@group(1) @binding(0) var<uniform> startSize : FloatValueProps;
@group(1) @binding(1) var<uniform> startColor : ColorValueProps;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
    if(particles[id.x].state == 0u){ // Dead particle, skip
        return; 
    }

    var seed = frameData.seed + id.x; // Update seed for randomness

    if(particles[id.x].state == 1u) { // Just spawned, transition to alive and initialize properties
        let index = id.x;
        
        particles[index].state = 2u;
        particles[index].age = 0.0;
        particles[index].lifeTime = 1.0; 
        particles[index].position = vec2f(0.0, 0.0);
        var radious = RandomRange(&seed, 4.0, 6.0);
        var angle = RandomRange(&seed, 0.0, 6.28318530718); // 0 to 2*PI
        particles[index].velocity = radious * vec2f(cos(angle), sin(angle)); // Random velocity
        particles[index].color = GenerateColor(startColor, &seed);
        let scale = GenerateValue(startSize, &seed);
        particles[index].scale = vec2f(scale, scale); // Default scale
        return;
    } 

    particles[id.x].age += frameData.deltaTime;

    if(particles[id.x].age > particles[id.x].lifeTime) { //particle is dead, reset and add to free list
        
        let freeIndex = atomicSub(&frameData.particleCount, 1u); // Get next free index
        particles[id.x].state = 0u;
        freeIndices[freeIndex - 1] = id.x; // Add to free list
        return;
    }

    // Update position based on velocity
    particles[id.x].position += particles[id.x].velocity * frameData.deltaTime;
}