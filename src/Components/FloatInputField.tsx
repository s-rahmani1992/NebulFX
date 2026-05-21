import { useState, useEffect } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function FloatInputField({
    className = "",
    label,
    value,
    min = 0.0,
    max,
    onValueChanged,
}: {
    className?: string;
    label: string;
    value: number;
    min?: number;
    max: number;
    onValueChanged: (v: number) => void;
}) {
    const [localValue, setLocalValue] = useState(value.toString());

    // Keep localValue synced with parent when parent changes
    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const commitValue = () => {
        const parsed = parseFloat(localValue);

        // Reject invalid or out-of-range values → rollback
        if (isNaN(parsed) || parsed < min || parsed > max) {
            setLocalValue(value.toString());
            return;
        }

        // Only notify parent if value actually changed
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
                    // Remove arrows in all browsers
                    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                )}
                type="number"
                step="0.001"
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
