
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

@group(0) @binding(0) var<storage, read> particles : array<ParticleData>;
@group(0) @binding(1) var<uniform> camera : mat4x4<f32>;
@group(0) @binding(2) var Sampler: sampler;
@group(0) @binding(3) var particleTexture: texture_2d<f32>;

@vertex
fn vs_main(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;
    var particle = particles[input.instanceIndex];

    var w = -1.0;
    if(particle.state > 0u) {
        w = 1.0;
    }
    output.position = vec4f(particle.scale * input.position + particle.position, 0.0, w);
    output.position = camera * output.position;
    output.uv = input.uv;
    output.instanceIndex = input.instanceIndex;
    return output;
}

@fragment
fn fs_main(input : VertexOutput) -> @location(0) vec4f {
    var particle = particles[input.instanceIndex];
    var texColor = textureSample(particleTexture, Sampler, input.uv);
    return texColor * particle.color;
}
