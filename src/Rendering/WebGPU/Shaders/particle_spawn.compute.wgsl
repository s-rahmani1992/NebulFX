
@group(0) @binding(0) var<storage, read_write> particles : array<ParticleData>;
@group(0) @binding(1) var<storage, read_write> freeIndices : array<u32>;
@group(0) @binding(2) var<storage, read_write> frameData : ParticleFrameData;

@compute @workgroup_size(1)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
    loop {
        let old = atomicLoad(&frameData.particleCount);
        let max = arrayLength(&particles);

        if (old >= max) {
            // No space left
            return;
        }

        // Try to claim this index
        let result = atomicCompareExchangeWeak(
            &frameData.particleCount,
            old,
            old + 1u
        );

        if (result.exchanged) {
            // Successfully reserved index = old
            let particleIndex = freeIndices[old];
            particles[particleIndex].state = 1u;
            return;
        }
    }
}