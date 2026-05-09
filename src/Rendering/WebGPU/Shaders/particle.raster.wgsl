
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

@vertex
fn vs_main(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;

    var xOffset = 0.0;
    var yOffset = 0.0;
    var instanceIndex = input.instanceIndex % 4u; // Ensure instanceIndex is between 0 and 3

    if(instanceIndex == 0) {
        xOffset = -0.5;
        yOffset = -0.5;
    } else if(instanceIndex == 1) {
        xOffset = 0.5;
        yOffset = -0.5;
    } else if(instanceIndex == 2) {
        xOffset = -0.5;
        yOffset = 0.5;
    } else if(instanceIndex == 3) {
        xOffset = 0.5;
        yOffset = 0.5;
    }

    output.position = vec4f(0.1 *input.position + vec2f(xOffset, yOffset), 0.0, 1.0);
    output.uv = input.uv;
    output.instanceIndex = input.instanceIndex;
    return output;
}

@fragment
fn fs_main(input : VertexOutput) -> @location(0) vec4f {
    var factor = 1.0 / f32(input.instanceIndex + 1u);

    return vec4f(1.0, 0.0, factor, 1.0);
}
