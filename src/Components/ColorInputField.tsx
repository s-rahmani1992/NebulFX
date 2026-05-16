import { useState, useRef, useEffect } from "react";
import { RgbaColorPicker } from "react-colorful";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function ColorInputField(
    {className="",label, color, onChanged}: 
    {
        className?: string;
        label: string, 
        color:{ r: number; g: number; b: number; a: number };
        onChanged: (c: { r: number; g: number; b: number; a: number }) => void
    }){
    const [localColor, setLocalColor] = useState(color)
    const [open, setOpen] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);
    const fieldRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalColor({r:color.r*255, g:color.g*255, b:color.b*255, a:color.a});

        function handleClickOutside(e: MouseEvent) {
            const popup = popupRef.current;
            const field = fieldRef.current;

            if (!popup || !field) return;

            const target = e.target as Node;

            // If click is outside popup AND outside the field → close
            if (!popup.contains(target) && !field.contains(target)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div className={twMerge(clsx("flex", className))} style={{...(open && {position: "relative"}) }}>
            <h1 className="mr-1">{label}</h1>
            <div
                ref={fieldRef}
                onClick={() => setOpen(!open)}
                className="w-15 h-6 rounded cursor-pointer border-3 border-black-600"
                style={{
                    background: `rgba(${localColor.r}, ${localColor.g}, ${localColor.b}, ${localColor.a})`,
                }}
            />

            {open && (
                <div
                    ref={popupRef}
                    className="absolute top-8 left-0 p-2 rounded-md shadow-lg z-50 bg-neutral-800">
                    <div style={{ transformOrigin: "top left" }}>
                        <RgbaColorPicker color={localColor} onChange={colorVal => {
                            let newColor = {
                                r: colorVal.r / 255,
                                g: colorVal.g / 255,
                                b: colorVal.b / 255,
                                a: colorVal.a
                            };
                            Object.assign(color, newColor);
                            onChanged(newColor);
                            setLocalColor(colorVal);
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}
