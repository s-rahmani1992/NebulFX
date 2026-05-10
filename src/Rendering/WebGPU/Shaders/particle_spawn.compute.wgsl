
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
    position: vec2f,
    color: vec4f,
    scale: vec2f,
    state: u32, // 0: dead, 1: just spawned, 2: alive
}

struct ParticleFrameData {
    deltaTime: f32,
    seed: u32,
    particleCount: atomic<u32>,
}

@group(0) @binding(0) var<storage, read_write> particles : array<ParticleData>;
@group(0) @binding(1) var<storage, read_write> freeIndices : array<u32>;
@group(0) @binding(2) var<storage, read_write> frameData : ParticleFrameData;

@compute @workgroup_size(1)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = atomicAdd(&frameData.particleCount, 1u);

    if (index < arrayLength(&particles)) {
        let particleIndex = freeIndices[index];
        particles[particleIndex].position = vec2f(random_range_f32(frameData.seed + index, -0.4, 0.4), random_range_f32(frameData.seed + index + 1u, -0.4, 0.4)); // Spawn at random position
        particles[particleIndex].color = vec4f(random_range_f32(frameData.seed + index + 4u, 0.0, 1.0), random_range_f32(frameData.seed + index + 5u, 0.0, 1.0), random_range_f32(frameData.seed + index + 6u, 0.0, 1.0), 1.0); // White color
        let scale = random_range_f32(frameData.seed + index + 2u, 0.1, 0.2);
        particles[particleIndex].scale = vec2f(scale, scale); // Default scale
        particles[particleIndex].state = 1u;
    }

}