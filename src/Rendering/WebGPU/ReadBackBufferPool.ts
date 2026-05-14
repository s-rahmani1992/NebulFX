import Denque from "denque";

export class ReadBackBufferPool{
    private m_pool: Denque<GPUBuffer> = new Denque<GPUBuffer>();
    private m_gpuDevice: GPUDevice;

    constructor(device: GPUDevice){
        this.m_gpuDevice = device;
    }

    PullBufferForReadBack(): GPUBuffer {
        let buffer = this.m_pool.pop();

        if (!buffer) {
            console.log("Read Back Buffer Created");
            buffer = this.m_gpuDevice.createBuffer({
                size: 3 * 4,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            })
        }

        return buffer;
    }

    PushReadBackBuffer(buffer:GPUBuffer){
        this.m_pool.unshift(buffer);
    }
    
    PullBufferForWrite(): GPUBuffer {
        let buffer = this.m_pool.shift();

        if (!buffer) {
            console.log("Read Back Buffer Created");
            buffer = this.m_gpuDevice.createBuffer({
                size: 3 * 4,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            })
        }

        return buffer;
    }

    PushWriteBuffer(buffer:GPUBuffer){
        this.m_pool.push(buffer);
    }
}