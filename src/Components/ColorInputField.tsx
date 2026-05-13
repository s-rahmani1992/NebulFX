import { useState, useRef, useEffect } from "react";
import { RgbaColorPicker } from "react-colorful";

export function ColorInputField(
    {label, color}: {label: string, color:{ r: number; g: number; b: number; a: number }}) {
    const [localColor, setLocalColor] = useState(color)
    const [open, setOpen] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);
    const fieldRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
        <div className="flex pt-3 pb-3" style={{...(open && {position: "relative"}) }}>
            <h1 className="pr-2">{label}</h1>
            <div
                ref={fieldRef}
                onClick={() => setOpen(!open)}
                className="w-12 h-6 rounded cursor-pointer border-2 border-black-600"
                style={{
                    background: `rgba(${localColor.r}, ${localColor.g}, ${localColor.b}, ${localColor.a})`,
                }}
            />

            {open && (
                <div
                    ref={popupRef}
                    className="absolute top-8 left-0 p-2 rounded-md shadow-lg z-50 bg-neutral-800"
                >
                    <div style={{ transformOrigin: "top left" }}>
                        <RgbaColorPicker color={localColor} onChange={colorVal => {
                            Object.assign(color, {
                                r: colorVal.r / 255,
                                g: colorVal.g / 255,
                                b: colorVal.b / 255,
                                a: colorVal.a
                            });
                            setLocalColor(colorVal);
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}
