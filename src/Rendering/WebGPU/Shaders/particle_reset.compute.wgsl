
struct ParticleData {
    state: u32, // 0: dead, 1: just spawned, 2: alive
    age: f32,
    lifeTime: f32,
    position: vec2f,
    scale: vec2f,
    color: vec4f,
}

@group(0) @binding(0) var<storage, read_write> particles : array<ParticleData>;
@group(0) @binding(1) var<storage, read_write> freeIndices : array<u32>;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;
    particles[index].state = 0u;
    freeIndices[index] = index;
}