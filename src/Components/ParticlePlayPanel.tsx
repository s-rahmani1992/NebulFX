import { useReducer } from "react";
import type { ParticleSimulator } from "../ParticleSimulator";

const buttonStyle = 'px-3 py-1 m-1 rounded text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60'

export default function ParticlePlayPanel({ simulator }: { simulator: ParticleSimulator }) {
    const forceUpdate = useReducer(x => x + 1, 0)[1];

    const update = (patch: Partial<ParticleSimulator>) => {
        Object.assign(simulator, patch);
        forceUpdate(); // re-render UI
    };

    return (
        <div className="flex border-2 justify-center border-gray-300 rounded-lg shadow-lg">
            <button
                disabled={simulator.isPlaying}
                onClick={() => { update({ isPlaying: true }) }}
                className= {buttonStyle}
            >Play</button>
            <button
                disabled={!simulator.isPlaying}
                onClick={() => { update({ isPlaying: false }) }}
                className= {buttonStyle}
            >Pause</button>
            <button
                onClick={() => { update({ isStopFlag: true, isPlaying: false }) }}
                className= {buttonStyle}
            >Stop</button>
            <button
                onClick={() => { update({ isStopFlag: true, isPlaying: true }) }}
                className= {buttonStyle}
            >Restart</button>
        </div>
    )
}