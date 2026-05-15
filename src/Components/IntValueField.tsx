import { useState } from "react";

export function IntInputField({
    label,
    value,
    min,
    max,
    onValueChanged
}: {
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
        <div className="flex pt-3 pb-3">
            <h1 className="pr-2">{label}</h1>
            <input className="bg-green-300 w-30"
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