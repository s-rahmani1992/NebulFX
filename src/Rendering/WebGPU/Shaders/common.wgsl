
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