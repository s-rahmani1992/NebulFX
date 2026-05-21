import { useState, useEffect } from "react";
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
    className?: string;
    label: string;
    value: number;
    min: number;
    max: number;
    onValueChanged: (v: number) => void;
}) {
    const [localValue, setLocalValue] = useState(value.toString());

    // keep local in sync with parent
    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const commitValue = () => {
        // strict integer string: optional minus, then digits
        const isIntString = /^-?\d+$/.test(localValue.trim());
        if (!isIntString) {
            // invalid → rollback
            setLocalValue(value.toString());
            return;
        }

        const parsed = parseInt(localValue, 10);

        // range check
        if (parsed < min || parsed > max) {
            setLocalValue(value.toString());
            return;
        }

        if (parsed !== value) {
            onValueChanged(parsed);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            commitValue();
            e.currentTarget.blur();
        }
    };

    const handleBlur = () => {
        commitValue();
    };

    return (
        <div className={twMerge(clsx("flex items-center", className))}>
            <h1 className="mr-1">{label}</h1>
            <input
                className={twMerge(
                    "bg-green-300 w-20",
                    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                )}
                type="number"
                step="1"
                value={localValue}
                min={min}
                max={max}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
            />
        </div>
    );
}
