
@group(0) @binding(0) var<storage, read_write> particles : array<ParticleData>;
@group(0) @binding(1) var<storage, read_write> freeIndices : array<u32>;
@group(0) @binding(2) var<storage, read_write> frameData : ParticleFrameData;

@compute @workgroup_size(1)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = atomicAdd(&frameData.particleCount, 1u);

    if (index < arrayLength(&particles)) {
        let particleIndex = freeIndices[index];
        particles[particleIndex].state = 1u;
    }
}