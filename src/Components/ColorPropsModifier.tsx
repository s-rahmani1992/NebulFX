import React, { useReducer } from 'react';
import { ColorGenerationMode, ColorValueProps } from '../Particles/ColorValueProps';
import { ColorInputField } from './ColorInputField';
import { FloatInputField } from './FloatInputField';

export default function ColorPropsModifier({ colorProps }: { colorProps: ColorValueProps }) {
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
                    label='Color'
                    color={colorProps.color}
                    onChanged={c=>{update({isChanged:true, color: c})}}/>
            </div>);
    }
    else if (colorProps.generationMode === ColorGenerationMode.Range) {
        content = (
            <div>
                <ColorInputField
                    label='Color1'
                    color={colorProps.color}
                    onChanged={c=>{update({isChanged:true, color: c})}}
                />
                <ColorInputField
                    label='Color2'
                    color={colorProps.color1}
                    onChanged={c=>{update({isChanged:true, color1: c})}}
                />
            </div>);
    } else {
        content = (
            <div>
                <ColorInputField
                    label='Color1'
                    color={colorProps.color}
                    onChanged={c=>{update({isChanged:true, color: c})}}
                />
                <ColorInputField
                    label='Color2'
                    color={colorProps.color1}
                    onChanged={c=>{update({isChanged:true, color1: c})}}
                />
                <FloatInputField
                    label='Probability'
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
            <label className="pr-2">Generation Type:</label>
            <select className="bg-emerald-200" value={colorProps.generationMode} onChange={SelectionChanged}>
                <option value={ColorGenerationMode.Constant}>Constant</option>
                <option value={ColorGenerationMode.Range}>Random Range</option>
                <option value={ColorGenerationMode.BetweenTwoConstants}>Between Two Constants</option>
            </select>
            {content}
        </>
    );
}