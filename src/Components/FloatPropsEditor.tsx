import React, { useReducer } from 'react';
import { FloatGenerationType, FloatValueProps } from '../Particles/FloatValueProps';
import { FloatInputField } from './FloatInputField';

const inputCss = "mr-4 pt-1 pb-1"

export default function FloatPropsEditor({ label, floatProps }: { label: string, floatProps: FloatValueProps }) {
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
                    className={inputCss}
                    label='value'
                    value={floatProps.value}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value: val }) }} />
            </div>);
    }
    else if (floatProps.generationType === FloatGenerationType.RandomRange) {
        content = (
            <div className="flex">
                <FloatInputField
                    className={inputCss}
                    label='value1'
                    value={floatProps.value}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value: val }) }}
                />
                <FloatInputField
                    className={inputCss}
                    label='value2'
                    value={floatProps.value1}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value1: val }) }}
                />
            </div>);
    } else {
        content = (
            <div className='flex flex-wrap'>
                <FloatInputField
                    className={inputCss}
                    label='value1'
                    value={floatProps.value}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value: val }) }}
                />
                <FloatInputField
                    className={inputCss}
                    label='value2'
                    value={floatProps.value1}
                    max={10000.0}
                    onValueChanged={val => { update({ isChanged: true, value1: val }) }}
                />
                <FloatInputField
                    className={inputCss}
                    label='probability'
                    value={floatProps.probability}
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
            <label className='mr-3 font-bold'>{label}:</label>
            <label className="mr-1">mode</label>
            <select className="bg-emerald-200 w-35" value={floatProps.generationType} onChange={SelectionChanged}>
                <option value={FloatGenerationType.Constant}>Constant</option>
                <option value={FloatGenerationType.RandomRange}>Range</option>
                <option value={FloatGenerationType.BetweenTwoConstants}>Two Constants</option>
            </select>
            {content}
        </>
    );
}