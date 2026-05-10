import { WgslReflect } from "wgsl_reflect";

export class VariableInput{
    name: string;
    buffer: GPUBuffer;

    constructor(name: string, buffer: GPUBuffer) {
        this.name = name;
        this.buffer = buffer;
    }
}

export class ComputePipeline {
    private m_device!: GPUDevice;
    private m_pipeline!: GPUComputePipeline;
    private m_reflect!: WgslReflect;
    private m_bindGroupMap: Map<number, GPUBindGroup> = new Map();
    private m_threadCount: number = 1;

    constructor(device?: GPUDevice) {
        if (device) {
            this.m_device = device;
        }
    }

    async Initialize(shaderCode: string, error: { message: string }) : Promise<boolean>     {
        const shaderModule = this.m_device.createShaderModule({
            code: shaderCode,
        });

        const compilationInfo = await shaderModule.getCompilationInfo();
        if (compilationInfo.messages.length > 0) {
            console.error("Shader compilation messages:", compilationInfo.messages);
            error.message = "Shader compilation failed";
            return false;
        }

        this.m_reflect = new WgslReflect(shaderCode);
        let attributes = this.m_reflect.entry.compute[0].attributes;

        for (const attr of attributes!) {
            if (attr.name === "workgroup_size") {
                this.m_threadCount = parseInt(attr.value! as string);
                break;
            }   
        }

        try {
            this.m_pipeline = await this.m_device.createComputePipelineAsync({
                compute: {
                    module: shaderModule,
                    entryPoint: this.m_reflect.entry.compute[0].name,
                },
                layout: "auto",
            });
        } catch (e) {
            error.message = "Failed to create compute pipeline";
            return false;
        }

        return true;
    }

    Execute(computeEncoder: GPUComputePassEncoder, x: number) {
        computeEncoder.setPipeline(this.m_pipeline);

        for (const [groupIndex, bindGroup] of this.m_bindGroupMap) {
            computeEncoder.setBindGroup(groupIndex, bindGroup);
        }
        computeEncoder.dispatchWorkgroups(Math.ceil(x / this.m_threadCount), 1, 1);
    }

    SetVariables(inputs: VariableInput[]) {
        this.m_bindGroupMap.clear();

        const variableGroups = this.m_reflect.getBindGroups();

        for (const variables of variableGroups) {
            if (variables.length === 0)
                continue;

            const descriptor: GPUBindGroupDescriptor = {
                layout: this.m_pipeline.getBindGroupLayout(variables[0].group),
                entries: [],
            };

            variables.forEach(variable => {
                const input = inputs.find(input => input.name === variable.name);
                if (input) {
                    descriptor.entries.push({
                        binding: variable.binding,
                        resource: input.buffer,
                    });
                }
            });

            const bindGroup = this.m_device.createBindGroup(descriptor);
            this.m_bindGroupMap.set(variables[0].group, bindGroup);
        }
    }
}