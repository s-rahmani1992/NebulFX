import React, { useReducer } from 'react';
import { FloatGenerationType} from '../Particles/FloatValueProps';
import { FloatInputField } from './FloatInputField';
import { IntGenerationType, IntValueProps, type Emitter } from '../Particles/Emitter';
import { IntInputField } from './IntValueField';

const inputCss = "mr-4 pt-1 pb-1"

export default function EmitterPropsEditor({ emitter }: { emitter: Emitter }) {
    const forceUpdate = useReducer(x => x + 1, 0)[1];

    const update = (patch: Partial<IntValueProps>) => {
        Object.assign(emitter.spawnRate, patch);
        forceUpdate(); // re-render UI
    };

    let spawnContent;

    if (emitter.spawnRate.generationType === IntGenerationType.Constant) {
        spawnContent = (
            <div>
                <IntInputField
                    className={inputCss}
                    label='value'
                    value={emitter.spawnRate.value}
                    min={1}
                    max={10000}
                    onValueChanged={val => { update({ value: val }) }} />
            </div>);
    }
    else if (emitter.spawnRate.generationType === IntGenerationType.RandomRange) {
        spawnContent = (
            <div className='flex flex-wrap'>
                <IntInputField
                    className={inputCss}
                    label='Value1'
                    value={emitter.spawnRate.value}
                    min={1}
                    max={10000}
                    onValueChanged={val => { update({ value: val }) }}
                />
                <IntInputField
                    className={inputCss}
                    label='Value2'
                    value={emitter.spawnRate.value1}
                    min={1}
                    max={10000}
                    onValueChanged={val => { update({ value1: val }) }}
                />
            </div>);
    } else {
        spawnContent = (
            <div className='flex flex-wrap'>
                <IntInputField
                    className={inputCss}
                    label='Value1'
                    value={emitter.spawnRate.value}
                    min={1}
                    max={10000}
                    onValueChanged={val => { update({ value: val }) }}
                />
                <IntInputField
                    className={inputCss}
                    label='Value2'
                    value={emitter.spawnRate.value1}
                    min={1}
                    max={10000}
                    onValueChanged={val => { update({ value1: val }) }}
                />
                <FloatInputField
                    className={inputCss}
                    label='Probability'
                    value={emitter.spawnRate.probability}
                    min={0.0}
                    max={1.0}
                    onValueChanged={val => { update({ probability: val }) }}
                />
            </div>);
    }

    const SelectionChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newGenerationType = parseInt(e.target.value) as IntGenerationType;
        update({ generationType: newGenerationType });
    }

    return (
        <>
            <label className='mr-3 font-bold'>Spawn Rate</label>
            <label className="mr-1">mode</label>
            <select className="bg-emerald-200 w-35" value={emitter.spawnRate.generationType} onChange={SelectionChanged}>
                <option value={FloatGenerationType.Constant}>Constant</option>
                <option value={FloatGenerationType.RandomRange}>Range</option>
                <option value={FloatGenerationType.BetweenTwoConstants}>Two Constants</option>
            </select>
            {spawnContent}
        </>
    );
}