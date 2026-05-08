import ParticleEngine  from "../ParticleEngine";

export default class WebGPUParticleEngine extends ParticleEngine {
    
    async Initialize(canvas: HTMLCanvasElement,error: { message: string }): Promise<boolean> {
        let success = await this.CreateGPUVariables(error);
        if (!success) {
            return false;
        }

        if (!this.AttachCanvas(canvas, error)) {
            return false;
        }

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

        return true;
    }

    Update(deltaTime: number): void {
        this.m_cValue += 0.5 * this.m_sign * deltaTime;
        if (this.m_cValue > 1) {
            this.m_cValue = 1;
            this.m_sign = -1;
        } else if (this.m_cValue < 0) {
            this.m_cValue = 0;
            this.m_sign = 1;
        }
        this.m_color = { r: this.m_cValue, g: this.m_cValue, b: 1 - this.m_cValue, a: 1 };
    }

    Render(): void {

        const commandEncoder = this.m_gpuDevice.createCommandEncoder();
        const pass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.m_gpuContext.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: this.m_color,
                },
            ],
        });

        pass.end();
        this.m_gpuDevice.queue.submit([commandEncoder.finish()]);
    }

    async CreateGPUVariables(error: { message: string }) : Promise<boolean> {
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

    private m_gpuAdapter!: GPUAdapter | null;
    private m_gpuDevice!: GPUDevice;
    private m_gpuContext!: GPUCanvasContext;

    private m_cValue = 0;
    private m_sign = 1;
    private m_color : GPUColor = { r: 0, g: 0, b: 0, a: 1 };
}