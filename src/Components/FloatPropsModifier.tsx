import React, { useReducer } from 'react';
import { FloatGenerationType, FloatValueProps } from '../Particles/FloatValueProps';
import { FloatInputField } from './FloatInputField';

export default function FloatPropsModifier({ floatProps }: { floatProps: FloatValueProps }) {
    const forceUpdate = useReducer(x => x + 1, 0)[1];

    const update = (patch: Partial<FloatValueProps>) => {
        Object.assign(floatProps, patch);
        forceUpdate(); // re-render UI
    };

    let content;

    if (floatProps.generationType === FloatGenerationType.Constant) {
        content = (
            <div>
                <FloatInputField
                    label='value'
                    value={floatProps.value}
                    min={0.0}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value: val }) }} />
            </div>);
    }
    else if (floatProps.generationType === FloatGenerationType.RandomRange) {
        content = (
            <div>
                <FloatInputField
                    label='Value1'
                    value={floatProps.value}
                    min={0.0}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value: val }) }}
                />
                <FloatInputField
                    label='Value2'
                    value={floatProps.value1}
                    min={0.0}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value1: val }) }}
                />
            </div>);
    } else {
        content = (
            <div>
                <FloatInputField
                    label='Value1'
                    value={floatProps.value}
                    min={0.0}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value: val }) }}
                />
                <FloatInputField
                    label='Value2'
                    value={floatProps.value1}
                    min={0.0}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value1: val }) }}
                />
                <FloatInputField
                    label='Probability'
                    value={floatProps.probability}
                    min={0.0}
                    max={1.0}
                    onValueChanged={val => { update({ isChanged: true, probability: val }) }}
                />
            </div>);
    }

    const SelectionChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newGenerationType = parseInt(e.target.value) as FloatGenerationType;
        update({ isChanged: true, generationType: newGenerationType });
    }

    return (
        <>
            <label className="pr-2">Generation Type:</label>
            <select className="bg-emerald-200" value={floatProps.generationType} onChange={SelectionChanged}>
                <option value={FloatGenerationType.Constant}>Constant</option>
                <option value={FloatGenerationType.RandomRange}>Random Range</option>
                <option value={FloatGenerationType.BetweenTwoConstants}>Between Two Constants</option>
            </select>
            {content}
        </>
    );
}