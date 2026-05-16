import { useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function IntInputField({
    className = "",
    label,
    value,
    min,
    max,
    onValueChanged
}: {
    className?:string
    label: string
    value: number;
    min: number;
    max: number;
    onValueChanged: (v: number) => void;
}) {
    
    const [localValue, setLocalValue] = useState(value.toString());
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const parsed = parseFloat(localValue);
            if (!isNaN(parsed)) {
                onValueChanged(parsed);
            }
            // optional: blur after commit
            e.currentTarget.blur();
        }
    };

    return (
        <div className={twMerge(clsx("flex", className))}>
            <h1 className="mr-1">{label}</h1>
            <input className="bg-green-300 w-20"
                type="number"
                step="1"
                value={localValue}
                min={min}
                max={max}
                onChange={e => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}