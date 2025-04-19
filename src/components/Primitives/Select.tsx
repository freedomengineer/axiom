import { useEffect, useRef, useState } from 'react'

import DownIcon from '@components/Assets/down.svg'
import cn from '@libs/class'

const Select = ({
    options,
    placeholder,
    value,
    onChange,
    disabled,
    className = '',
}: {
    options: { label: string; value?: string }[]
    onChange: (value: string) => void
    placeholder?: string
    value?: string
    disabled?: boolean
    className?: string
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null)
    const prevValueRef = useRef<string | null | undefined>(value)
    const prevOptionsRef = useRef(options)

    const [selectedValue, setSelectedValue] = useState<string | null>(value || null)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    useEffect(() => {
        const valueChanged = prevValueRef.current !== value
        const optionsChanged = prevOptionsRef.current !== options
        if (valueChanged || optionsChanged) {
            prevValueRef.current = value
            prevOptionsRef.current = options
            const newSelectedValue =
                !value || !options.some((opt) => (opt.value ?? opt.label) === value) ? null : value
            if (selectedValue !== newSelectedValue) {
                setSelectedValue(newSelectedValue)
            }
        }
    }, [value, options, selectedValue])

    const handleToggle = () => {
        setIsOpen(!isOpen)
    }
    const handleOptionClick = (value: string) => {
        setSelectedValue(value)
        onChange(value)
        setIsOpen(false)
    }

    return (
        <div
            className={cn(
                'text-small relative w-full',
                className,
                disabled && 'pointer-events-none bg-cold-900/10'
            )}
            ref={dropdownRef}
        >
            <button
                onClick={handleToggle}
                className="input flex items-center justify-between"
                aria-selected={!!selectedValue}
            >
                {selectedValue ? (
                    <span className="truncate text-cold-800">
                        {options.find((opt) => (opt.value ?? opt.label) === selectedValue)?.label}
                    </span>
                ) : (
                    <span className="truncate text-cold-800/50">{placeholder}</span>
                )}
                <DownIcon
                    className={cn('h-4 w-4 stroke-[1.5px] text-cold-800/50 transition-transform', {
                        'rotate-180 transform': isOpen,
                    })}
                />
            </button>
            {isOpen && (
                <div className="mt-extratiny absolute z-10 max-h-96 w-full overflow-y-auto rounded-lg border border-cold-300 bg-white shadow-lg">
                    <p className="px-medium py-small w-full select-none truncate text-left font-medium text-cold-800/50">
                        {placeholder}
                    </p>
                    {options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => handleOptionClick(option.value ?? option.label)}
                            className="px-medium py-small w-full truncate text-left hover:bg-cold-100 focus:bg-cold-200 focus:outline-none"
                            data-value={option.value}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Select
