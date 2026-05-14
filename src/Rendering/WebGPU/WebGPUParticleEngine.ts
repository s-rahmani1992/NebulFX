import ParticleEngine from "../ParticleEngine";

import particleRasterizationProgramWGSL from "./Shaders/particle.raster.wgsl?raw";

import {Vertex2D, Vector2} from "../Vertices"
import { ComputePipeline } from "./ComputePipeline";
import { ShaderCompiler } from "./ShaderCompiler";
import { ParticleData } from "../Particles";
import particleResetComputeProgramWGSL from "./Shaders/particle_reset.compute.wgsl?raw";
import particleSpawnComputeProgramWGSL from "./Shaders/particle_spawn.compute.wgsl?raw";
import particleUpdateComputeProgramWGSL from "./Shaders/particle_update.compute.wgsl?raw";
import type { FloatValueProps } from "../../Particles/FloatValueProps";
import type { ColorValueProps } from "../../Particles/ColorValueProps";

class FrameData{
    deltaTime: number = 0.0;
    seed: number = 0;
    particleCount: number = 0;
}

export default class WebGPUParticleEngine extends ParticleEngine {

    async Initialize(canvas: HTMLCanvasElement, error: { message: string }): Promise<boolean> {
        let success = await this.CreateGPUVariables(error);
        if (!success) {
            return false;
        }

        if (!this.AttachCanvas(canvas, error)) {
            return false;
        }

        success = await this.LoadShaders(error);
        if (!success) {
            return false;
        }

        success = await this.CreatePipelines(error);
        if (!success) {
            return false;
        }

        await this.CreateParticleBuffers();
        
        await this.ResetBuffers();
        return true;
    }

    AttachCanvas(canvas: HTMLCanvasElement, error: { message: string }): boolean {
        const context = canvas.getContext("webgpu");
        if (!context) {
            error.message = "Failed to get WebGPU context from canvas.";
            return false;
        }

        this.m_gpuContext = context;

        const format = navigator.gpu.getPreferredCanvasFormat();
        this.m_gpuContext.configure({
            device: this.m_gpuDevice,
            format: format,
            alphaMode: "opaque",
        });
        this.m_gpuFormat = navigator.gpu.getPreferredCanvasFormat();
        return true;
    }

    async Update(deltaTime: number): Promise<void> {
        // Update particle data

        await this.UpdateFloatPropsBuffer(this.properties.startSize, this.m_startSizeBuffer);
        await this.UpdateColorPropsBuffer(this.properties.startColor, this.m_startColorBuffer)
        this.m_frameData.deltaTime = deltaTime;
        this.m_frameData.seed = performance.now() / 1000;
        this.m_gpuDevice.queue.writeBuffer(this.m_frameDataBuffer, 0, new Float32Array([
            this.m_frameData.deltaTime,
            this.m_frameData.seed
        ]));
        await this.m_gpuDevice.queue.onSubmittedWorkDone();

        this.m_totalParticlesSpawned += this.m_spawnRate * deltaTime;

        let particlesTospawn = Math.floor(this.m_totalParticlesSpawned);
        if (particlesTospawn > 0) {
            const commandEncoder = this.m_gpuDevice.createCommandEncoder();
            const computePass = commandEncoder.beginComputePass();
            this.m_spawnComputePipeline.Execute(computePass, particlesTospawn);
            computePass.end();
            this.m_gpuDevice.queue.submit([commandEncoder.finish()]);   
            this.m_totalParticlesSpawned -= particlesTospawn;
            await this.m_gpuDevice.queue.onSubmittedWorkDone();
        }

        const commandEncoder = this.m_gpuDevice.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();
        this.m_updateComputePipeline.Execute(computePass, Math.ceil(this.m_maxParticles));
        computePass.end();
        this.m_gpuDevice.queue.submit([commandEncoder.finish()]);
        await this.m_gpuDevice.queue.onSubmittedWorkDone();
    }

    async Render(): Promise<void> {

        const commandEncoder = this.m_gpuDevice.createCommandEncoder();
        const pass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.m_gpuContext.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: this.clearColor,
                },
            ],
        });
        pass.setPipeline(this.m_particleRasterizationPipeline);
        pass.setVertexBuffer(0, this.m_particleVertexBuffer);
        pass.setIndexBuffer(this.m_particleIndexBuffer, "uint16");
        pass.setBindGroup(0, this.m_particleBindGroup);
        pass.drawIndexed(6, this.m_maxParticles, 0, 0, 0);

        pass.end();
        this.m_gpuDevice.queue.submit([commandEncoder.finish()]);

        await this.m_gpuDevice.queue.onSubmittedWorkDone();
    }

    async Stop() : Promise<void> {
        this.m_totalParticlesSpawned = 0.0;
        await this.ResetBuffers();
        const commandEncoder = this.m_gpuDevice.createCommandEncoder();
        const pass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.m_gpuContext.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: this.clearColor,
                },
            ],
        });
        pass.end();
        this.m_gpuDevice.queue.submit([commandEncoder.finish()]);

        await this.m_gpuDevice.queue.onSubmittedWorkDone();
    }

    async CreateGPUVariables(error: { message: string }): Promise<boolean> {
        const gpu = navigator.gpu;
        if (!gpu) {
            error.message = "WebGPU is not supported in this browser.";
            return false;
        }

        this.m_gpuAdapter = await navigator.gpu.requestAdapter({
            powerPreference: "high-performance",
        });
        if (!this.m_gpuAdapter) {
            error.message = "Failed to request a proper GPU adapter.";
            return false;
        }

        this.m_gpuDevice = await this.m_gpuAdapter.requestDevice();
        if (!this.m_gpuDevice) {
            error.message = "Failed to request a GPU device.";
            return false;
        }

        return true;
    }

    async LoadShaders(error: { message: string }): Promise<boolean> {
        this.m_particleRasterizationProgram = await ShaderCompiler.CompileShader(this.m_gpuDevice, particleRasterizationProgramWGSL, error);
        
        if (!this.m_particleRasterizationProgram) {
            return false;  
        }

        return true;
    }

    async CreatePipelines(error: { message: string }): Promise<boolean> {
        if(!this.m_particleRasterizationProgram) {
            error.message = "Particle rasterization shader program is not loaded.";
            return false;
        }

        try {
            this.m_particleRasterizationPipeline = await this.m_gpuDevice.createRenderPipelineAsync({
                vertex: {
                    module: this.m_particleRasterizationProgram,
                    entryPoint: "vs_main",
                    buffers: [
                        {
                            arrayStride: 4 * 4,
                            attributes: [
                                {
                                    shaderLocation: 0,
                                    offset: 0,
                                    format: "float32x2",
                                },
                                {
                                    shaderLocation: 1,
                                    offset: 2 * 4,
                                    format: "float32x2",
                                }
                            ],
                        },
                    ],
                },
                fragment: {
                    module: this.m_particleRasterizationProgram,
                    entryPoint: "fs_main",
                    targets: [{ 
                        format: this.m_gpuFormat,
                        blend: {
                color: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                },
                alpha: {
                    srcFactor: "one",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                }
            },
            writeMask: GPUColorWrite.ALL,
                    }],
                },
                primitive: { topology: "triangle-list" },
                layout: "auto",
            });
        } catch (e) {
            error.message = "Failed to create render pipeline: " + (e instanceof Error ? e.message : String(e));
            return false;
        }
        this.m_resetComputePipeline = new ComputePipeline(this.m_gpuDevice);
        this.m_spawnComputePipeline = new ComputePipeline(this.m_gpuDevice);
        this.m_updateComputePipeline = new ComputePipeline(this.m_gpuDevice);

        let success = await this.m_resetComputePipeline.Initialize(particleResetComputeProgramWGSL, error);
        if (!success) {
            return false;
        }

        success = await this.m_spawnComputePipeline.Initialize(particleSpawnComputeProgramWGSL, error);
        if (!success) {
            return false;
        }

        success = await this.m_updateComputePipeline.Initialize(particleUpdateComputeProgramWGSL, error);
        if (!success) {
            return false;
        }

        return true;
    }

    async CreateParticleBuffers():Promise<void> {
        // Create a simple quad for particle rendering
        const vertices: Vertex2D[] = [
            new Vertex2D(new Vector2(-1.0, -1.0), new Vector2(0, 0)),
            new Vertex2D(new Vector2(1.0, -1.0), new Vector2(1, 0)),
            new Vertex2D(new Vector2(1.0, 1.0), new Vector2(1, 1)),
            new Vertex2D(new Vector2(-1.0, 1.0), new Vector2(0, 1)),
        ];

        const indices = [0, 1, 2, 0, 2, 3];

        this.m_particleVertexBuffer = this.m_gpuDevice.createBuffer({
            size: vertices.length * 4 * 4,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.m_gpuDevice.queue.writeBuffer(this.m_particleVertexBuffer, 0, new Float32Array(vertices.flatMap(v => [v.position.x, v.position.y, v.uv.x, v.uv.y])));

        this.m_particleIndexBuffer = this.m_gpuDevice.createBuffer({
            size: indices.length * 2,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        this.m_gpuDevice.queue.writeBuffer(this.m_particleIndexBuffer, 0, new Uint16Array(indices));

        this.m_particleBuffer = this.m_gpuDevice.createBuffer({
            size: this.m_maxParticles * ParticleData.SizeInBytes,
            usage: GPUBufferUsage.STORAGE,
        });

        this.m_freeIndicesBuffer = this.m_gpuDevice.createBuffer({
            size: this.m_maxParticles * 4,
            usage: GPUBufferUsage.STORAGE,
        });

        this.m_frameDataBuffer = this.m_gpuDevice.createBuffer({
            size: 3 * 4, // deltaTime, seed, particleCount
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.m_startSizeBuffer = this.m_gpuDevice.createBuffer({
            size: 32, // not 16 because of alignment rules
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        this.m_startColorBuffer = this.m_gpuDevice.createBuffer({
            size : 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        // Pack data with proper alignment and types
        
        this.m_particleBindGroup = this.m_gpuDevice.createBindGroup({
            layout: this.m_particleRasterizationPipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.m_particleBuffer },
                },
            ],
        });

        this.m_resetComputePipeline.SetVariables([
            {
                name: "particles",
                buffer: this.m_particleBuffer,
            },
            {
                name: "freeIndices",
                buffer: this.m_freeIndicesBuffer,
            },
        ]);

        this.m_spawnComputePipeline.SetVariables([
            {
                name: "particles", 
                buffer: this.m_particleBuffer,
            },
            {
                name: "freeIndices",
                buffer: this.m_freeIndicesBuffer,
            },
            {
                name: "frameData",
                buffer: this.m_frameDataBuffer,
            },
        ]);

        this.m_updateComputePipeline.SetVariables([
            {
                name: "particles",
                buffer: this.m_particleBuffer,
            },
            {
                name: "freeIndices",
                buffer: this.m_freeIndicesBuffer,
            },
            {
                name: "frameData",
                buffer: this.m_frameDataBuffer,
            },
            {
                name: "startSize",
                buffer: this.m_startSizeBuffer
            },
            {
                name:"startColor",
                buffer:this.m_startColorBuffer
            }
        ]);
    }

    async UpdateFloatPropsBuffer(floatProps: FloatValueProps, buffer: GPUBuffer):Promise<void>{
        if(!floatProps.isChanged)
            return;

        const data = new ArrayBuffer(32);
        const view = new DataView(data);

        view.setUint32(0, floatProps.generationType, true);
        view.setFloat32(4, floatProps.value, true);
        view.setFloat32(8, floatProps.value1, true);
        view.setFloat32(12, floatProps.probability, true);

        floatProps.isChanged = false;
        this.m_gpuDevice.queue.writeBuffer(buffer, 0, data);
        await this.m_gpuDevice.queue.onSubmittedWorkDone();
    }

    async UpdateColorPropsBuffer(colorProps: ColorValueProps, buffer: GPUBuffer):Promise<void>{
        if(!colorProps.isChanged)
            return;

        console.log(colorProps);
        const data = new ArrayBuffer(64);
        const view = new DataView(data);
        this.WriteColorToView(colorProps.color, view, 0);
        this.WriteColorToView(colorProps.color1, view, 16);
        view.setUint32(32, colorProps.generationMode, true);
        view.setFloat32(36, colorProps.probability, true);

        colorProps.isChanged = false;
        this.m_gpuDevice.queue.writeBuffer(buffer, 0, data);
        await this.m_gpuDevice.queue.onSubmittedWorkDone();
    }

    WriteColorToView(color: { r: number; g: number; b: number; a: number }, view:DataView, offset:number){
        view.setFloat32(offset, color.r, true);
        view.setFloat32(offset + 4, color.g, true);
        view.setFloat32(offset + 8, color.b, true);
        view.setFloat32(offset + 12, color.a, true);
    }

    async ResetBuffers():Promise<void>{
        const commandEncoder = this.m_gpuDevice.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();
        this.m_resetComputePipeline.Execute(computePass, Math.ceil(this.m_maxParticles));
        computePass.end();
        this.m_gpuDevice.queue.submit([commandEncoder.finish()]);
        await this.m_gpuDevice.queue.onSubmittedWorkDone();
    }

    private m_gpuAdapter!: GPUAdapter | null;
    private m_gpuDevice!: GPUDevice;
    private m_gpuContext!: GPUCanvasContext;
    private m_gpuFormat!: GPUTextureFormat;

    private m_particleRasterizationProgram!: GPUShaderModule | null;
    private m_particleRasterizationPipeline!: GPURenderPipeline;

    private m_particleVertexBuffer!: GPUBuffer;
    private m_particleIndexBuffer!: GPUBuffer;

    private m_particleBuffer!: GPUBuffer;
    private m_freeIndicesBuffer!: GPUBuffer;

    private m_particleBindGroup!: GPUBindGroup;
    private m_maxParticles: number = 1024;

    private m_resetComputePipeline!: ComputePipeline;
    private m_spawnComputePipeline!: ComputePipeline;
    private m_updateComputePipeline!: ComputePipeline;
    private m_frameDataBuffer!: GPUBuffer;
    private m_frameData: FrameData = new FrameData();

    private m_spawnRate: number = 60; // Particles per second
    private m_totalParticlesSpawned: number = 0.0;

    private m_startSizeBuffer!: GPUBuffer;
    private m_startColorBuffer!:GPUBuffer;
}