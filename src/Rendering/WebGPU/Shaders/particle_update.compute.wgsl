fn hash_u32(x: u32) -> u32 {
    var h = x;
    h ^= h >> 16u;
    h *= 0x7feb352du;
    h ^= h >> 15u;
    h *= 0x846ca68bu;
    h ^= h >> 16u;
    return h;
}

fn random_f32(seed: u32) -> f32 {
    let h = hash_u32(seed);
    return f32(h) / 4294967296.0; // 2^32
}

fn random_range_f32(seed: u32, min: f32, max: f32) -> f32 {
    let r = random_f32(seed);
    return mix(min, max, r);
}

struct ParticleData {
    state: u32, // 0: dead, 1: just spawned, 2: alive
    age: f32,
    lifeTime: f32,
    position: vec2f,
    scale: vec2f,
    color: vec4f,
}

struct ParticleFrameData {
    deltaTime: f32,
    seed: u32,
    particleCount: atomic<u32>,
}

@group(0) @binding(0) var<storage, read_write> particles : array<ParticleData>;
@group(0) @binding(1) var<storage, read_write> freeIndices : array<u32>;
@group(0) @binding(2) var<storage, read_write> frameData : ParticleFrameData;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
    if(particles[id.x].state == 0u){ // Dead particle, skip
        return; 
    }

    if(particles[id.x].state == 1u) { // Just spawned, transition to alive and initialize properties
        let index = id.x;
        
        particles[index].state = 2u;
        particles[index].age = 0.0;
        particles[index].lifeTime = 1.0; 
        particles[index].position = vec2f(random_range_f32(frameData.seed + index, -0.4, 0.4), random_range_f32(frameData.seed + index + 1u, -0.4, 0.4)); // Spawn at random position
        particles[index].color = vec4f(random_range_f32(frameData.seed + index + 4u, 0.0, 1.0), random_range_f32(frameData.seed + index + 5u, 0.0, 1.0), random_range_f32(frameData.seed + index + 6u, 0.0, 1.0), 1.0); // White color
        let scale = random_range_f32(frameData.seed + index + 2u, 0.1, 0.2);
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
}