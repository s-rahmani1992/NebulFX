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
    isAlive: u32,
}

@group(0) @binding(0) var<storage, read_write> particles : array<ParticleData>;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;
    particles[index].position = vec2f(random_range_f32(index, -1.0, 1.0), random_range_f32(index + 1, -1.0, 1.0));
    particles[index].color = vec4f(random_range_f32(index + 2, 0.0, 1.0), random_range_f32(index + 3, 0.0, 1.0), random_range_f32(index + 5, 0.0, 1.0)  , 1.0);
    let scale = random_range_f32(index + 4, 0.1, 0.2);
    particles[index].scale = vec2f(scale, scale);
    let r = random_range_f32(index + 9, -1.0, 1.0);
    var alive = 0u;

    if (r > 0.0) {
        alive = 1u;
    }

    particles[index].isAlive = alive;
}