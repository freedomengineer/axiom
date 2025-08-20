import { useEffect, useRef, useState } from 'react'

import CheckIcon from '@components/Assets/check.svg'
import DeleteIcon from '@components/Assets/delete.svg'
import { VoteColorType } from '@hooks/useVoteColors'
import cn from '@libs/class'

interface VoteColorPickerProps {
    label: string
    type: VoteColorType
    color: string
    isCustomized: boolean
    onColorChange: (type: VoteColorType, color: string) => void
    onPreviewChange: (type: VoteColorType, color: string) => void
    onRestore: (type: VoteColorType) => void
    className?: string
}

const VoteColorPicker = ({
    label,
    type,
    color,
    isCustomized,
    onColorChange,
    onPreviewChange,
    onRestore,
    className,
}: VoteColorPickerProps) => {
    const [inputValue, setInputValue] = useState(color)
    const colorInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setInputValue(color)
    }, [color])

    const handleColorChange = (newColor: string) => {
        setInputValue(newColor)
        onPreviewChange(type, newColor)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)

        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
            onPreviewChange(type, value)
        }
    }

    const handleInputBlur = () => {
        if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue)) {
            setInputValue(color)
        }
    }

    const handleColorPreviewClick = () => {
        colorInputRef.current?.click()
    }

    return (
        <div className={cn('gap-small flex flex-col', className)}>
            <label className="text-sm font-medium capitalize text-cold-700">{label}</label>

            <div className="gap-small flex items-center">
                <div
                    className="relative h-8 w-8 flex-shrink-0 rounded-lg transition-colors"
                    style={{ backgroundColor: inputValue }}
                >
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={inputValue}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        aria-label={`${label} color`}
                    />
                </div>

                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="#FFFFFF"
                    className={cn(
                        'input flex-1 font-mono text-sm',
                        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue)
                            ? 'border-green-400 focus:ring-green-600'
                            : inputValue !== color
                              ? 'border-red-400 focus:ring-red-600'
                              : 'border-cold-400 focus:ring-cold-600'
                    )}
                />

                <button
                    type="button"
                    onClick={() => onRestore(type)}
                    className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                    disabled={!isCustomized}
                >
                    {isCustomized ? (
                        <DeleteIcon className="h-3.5 w-3.5 stroke-[2px] text-primary-700 md:h-4 md:w-4" />
                    ) : (
                        <CheckIcon className="h-3.5 w-3.5 stroke-[2px] text-cold-800 md:h-4 md:w-4" />
                    )}
                </button>
            </div>
        </div>
    )
}

export default VoteColorPicker
