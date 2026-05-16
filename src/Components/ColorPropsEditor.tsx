import React, { useReducer } from 'react';
import { ColorGenerationMode, ColorValueProps } from '../Particles/ColorValueProps';
import { ColorInputField } from './ColorInputField';
import { FloatInputField } from './FloatInputField';

const inputCss = "mr-4 pt-1 pb-1"

export default function ColorPropsEditor({ label, colorProps }: { label:string; colorProps: ColorValueProps }) {
    const forceUpdate = useReducer(x => x + 1, 0)[1];

    const update = (patch: Partial<ColorValueProps>) => {
        Object.assign(colorProps, patch);
        forceUpdate(); // re-render UI
    };

    let content;

    if (colorProps.generationMode === ColorGenerationMode.Constant) {
        content = (
            <div>
                <ColorInputField
                    className={inputCss}
                    label='Color'
                    color={colorProps.color}
                    onChanged={c=>{update({isChanged:true, color: c})}}/>
            </div>);
    }
    else if (colorProps.generationMode === ColorGenerationMode.Range) {
        content = (
            <div className='flex flex-wrap'>
                <ColorInputField
                    className={inputCss}
                    label='color1'
                    color={colorProps.color}
                    onChanged={c=>{update({isChanged:true, color: c})}}
                />
                <ColorInputField
                    className={inputCss}
                    label='color2'
                    color={colorProps.color1}
                    onChanged={c=>{update({isChanged:true, color1: c})}}
                />
            </div>);
    } else {
        content = (
            <div className='flex flex-wrap'>
                <ColorInputField
                    className={inputCss}
                    label='color1'
                    color={colorProps.color}
                    onChanged={c=>{update({isChanged:true, color: c})}}
                />
                <ColorInputField
                    className={inputCss}
                    label='color2'
                    color={colorProps.color1}
                    onChanged={c=>{update({isChanged:true, color1: c})}}
                />
                <FloatInputField
                    className={inputCss}
                    label='probability'
                    value={colorProps.probability}
                    min={0.0}
                    max={1.0}
                    onValueChanged={val => { update({ isChanged: true, probability: val }) }}
                />
            </div>);
    }

    const SelectionChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newGenerationType = parseInt(e.target.value) as ColorGenerationMode;
        update({ isChanged: true, generationMode: newGenerationType });
    }

    return (
        <>
            <label className='mr-3 font-bold'>{label}:</label>
            <label className="mr-1">mode</label>
            <select className="bg-emerald-200 w-35" value={colorProps.generationMode} onChange={SelectionChanged}>
                <option value={ColorGenerationMode.Constant}>Constant</option>
                <option value={ColorGenerationMode.Range}>Range</option>
                <option value={ColorGenerationMode.BetweenTwoConstants}>Two Constants</option>
            </select>
            {content}
        </>
    );
}