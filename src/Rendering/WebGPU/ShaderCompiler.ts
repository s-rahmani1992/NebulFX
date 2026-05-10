import commonShaderCode from "./Shaders/common.wgsl?raw";

export class ShaderCompiler {
    static async CompileShader(device: GPUDevice, shaderCode: string, error: { message: string }) : Promise<GPUShaderModule | null> {
        const fullShaderCode = commonShaderCode + "\n" + shaderCode;
        console.log("Compiling shader with code:\n", fullShaderCode);
        const shaderModule = device.createShaderModule({
            code: fullShaderCode,
        });

        const compilationInfo = await shaderModule.getCompilationInfo();
        if (compilationInfo.messages.length > 0) {
            error.message = "Shader compilation failed";
            return null;
        }

        return shaderModule;   
    }
}