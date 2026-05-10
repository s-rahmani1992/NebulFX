
struct VertexInput {
    @location(0) position : vec2f,
    @location(1) uv : vec2f,
    @builtin(instance_index) instanceIndex: u32,
}

struct VertexOutput {
    @builtin(position) position : vec4f,
    @location(0) uv : vec2f,
    @location(1) @interpolate(flat) instanceIndex : u32,
}

struct ParticleData {
    state: u32, // 0: dead, 1: just spawned, 2: alive
    age: f32,
    lifeTime: f32,
    position: vec2f,
    scale: vec2f,
    color: vec4f,
}

@group(0) @binding(0) var<storage, read> particles : array<ParticleData>;

@vertex
fn vs_main(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;
    var particle = particles[input.instanceIndex];

    var w = 0.0;
    if(particle.state > 0u) {
        w = 1.0;
    }
    output.position = vec4f(particle.scale * input.position + particle.position, 0.0, w);
    output.uv = input.uv;
    output.instanceIndex = input.instanceIndex;
    return output;
}

@fragment
fn fs_main(input : VertexOutput) -> @location(0) vec4f {
    var particle = particles[input.instanceIndex];
    return particle.color;
}
