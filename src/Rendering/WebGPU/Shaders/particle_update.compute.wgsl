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

@group(0) @binding(0) var<storage, read_write> particles : array<ParticleData>;
@group(0) @binding(1) var<storage, read_write> freeIndices : array<u32>;
@group(0) @binding(2) var<storage, read_write> frameData : ParticleFrameData;

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
        var radious = RandomRange(&seed, 0.2, 0.8);
        var angle = RandomRange(&seed, 0.0, 6.28318530718); // 0 to 2*PI
        particles[index].velocity = radious * vec2f(cos(angle), sin(angle)); // Random velocity
        particles[index].color = vec4f(RandomRange(&seed, 0.0, 1.0), RandomRange(&seed, 0.0, 1.0), RandomRange(&seed, 0.0, 1.0), 1.0); // White color
        let scale = RandomRange(&seed, 0.02, 0.05);
        particles[index].scale = vec2f(scale, scale); // Default scale
        return;
    } 

    particles[id.x].age += frameData.deltaTime;

    if(particles[id.x].age > particles[id.x].lifeTime) { //particle is dead, reset and add to free list
        
        particles[id.x].state = 0u;
        let freeIndex = atomicSub(&frameData.particleCount, 1u); // Get next free index
        freeIndices[freeIndex - 1] = id.x; // Add to free list
        return;
    }

    // Update position based on velocity
    particles[id.x].position += particles[id.x].velocity * frameData.deltaTime;
}