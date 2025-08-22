import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import DownIcon from '@components/Assets/down.svg'
import cn from '@libs/class'

type Option = {
    label: string
    value?: string
}

type SearchableSelectProps = {
    options: Option[]
    placeholder?: string
    value?: string
    onChange: (value: string) => void
    customizable?: boolean
    disabled?: boolean
    className?: string
    usePortal?: boolean
}

const SearchableSelect = memo(
    ({
        options,
        placeholder,
        value,
        onChange,
        disabled,
        customizable = true,
        className = '',
        usePortal = true,
    }: SearchableSelectProps) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const dropdownRef = useRef<HTMLDivElement>(null)
        const inputRef = useRef<HTMLInputElement>(null)
        const isMouseDownRef = useRef(false)

        const [searchValue, setSearchValue] = useState<string>('')
        const [displayValue, setDisplayValue] = useState<string>('')
        const [isOpen, setIsOpen] = useState(false)
        const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
        const [userHasTyped, setUserHasTyped] = useState(false)
        const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

        const updateDropdownPosition = useCallback(() => {
            if (!containerRef.current || !isOpen) return

            const rect = containerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            })
        }, [isOpen])

        useEffect(() => {
            if (!isOpen || !usePortal) return

            updateDropdownPosition()

            const handleScroll = () => {
                updateDropdownPosition()
            }

            const handleResize = () => {
                updateDropdownPosition()
            }

            window.addEventListener('scroll', handleScroll, true)
            window.addEventListener('resize', handleResize)

            return () => {
                window.removeEventListener('scroll', handleScroll, true)
                window.removeEventListener('resize', handleResize)
            }
        }, [isOpen, updateDropdownPosition, usePortal])

        const findOptionLabel = useCallback(
            (val: string): string => {
                const option = options.find((opt) => (opt.value ?? opt.label) === val)
                return option ? option.label : val
            },
            [options]
        )

        const findOptionValue = useCallback(
            (labelToFind: string): string | undefined => {
                const option = options.find(
                    (opt) => opt.label.toLowerCase() === labelToFind.toLowerCase()
                )
                return option ? (option.value ?? option.label) : undefined
            },
            [options]
        )

        useEffect(() => {
            if (value) {
                const label = findOptionLabel(value)
                setDisplayValue(label)
                if (!userHasTyped && isOpen) {
                    setSearchValue(label)
                }
            } else {
                setDisplayValue('')
                if (!userHasTyped) {
                    setSearchValue('')
                }
            }
        }, [value, isOpen, findOptionLabel, userHasTyped])

        useEffect(() => {
            if (userHasTyped && searchValue) {
                const matchedValue = findOptionValue(searchValue)
                if (matchedValue && matchedValue !== value) {
                    onChange(matchedValue)
                }
            }
        }, [searchValue, userHasTyped, findOptionValue, onChange, value])

        const filteredOptions = useMemo(() => {
            if (!isOpen) return []

            const searchTerm = userHasTyped ? searchValue : displayValue

            const filtered = options.filter((opt) =>
                opt.label.toLowerCase().includes(searchTerm.toLowerCase())
            )

            if (
                searchValue &&
                customizable &&
                !options.some(
                    (opt) =>
                        opt.label.toLowerCase() === searchValue.toLowerCase() ||
                        (opt.value && opt.value.toLowerCase() === searchValue.toLowerCase())
                )
            ) {
                return [...filtered, { label: `"${searchValue}"`, value: searchValue }]
            }

            return filtered
        }, [searchValue, displayValue, options, isOpen, customizable, userHasTyped])

        useEffect(() => {
            const handleMouseDown = () => {
                isMouseDownRef.current = true
            }

            const handleMouseUp = (event: MouseEvent) => {
                if (isMouseDownRef.current) {
                    const isOutsideContainer =
                        containerRef.current && !containerRef.current.contains(event.target as Node)

                    const isOutsideDropdown =
                        !dropdownRef.current || !dropdownRef.current.contains(event.target as Node)

                    if (isOutsideContainer && isOutsideDropdown) {
                        closeDropdown()
                    }
                }
                isMouseDownRef.current = false
            }

            document.addEventListener('mousedown', handleMouseDown)
            document.addEventListener('mouseup', handleMouseUp)

            return () => {
                document.removeEventListener('mousedown', handleMouseDown)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }, [])

        const handleKeyDown = useCallback(
            (e: KeyboardEvent) => {
                if (!isOpen) return

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault()
                        setHighlightedIndex((prev) =>
                            prev < filteredOptions.length - 1 ? prev + 1 : 0
                        )
                        break
                    case 'ArrowUp':
                        e.preventDefault()
                        setHighlightedIndex((prev) =>
                            prev > 0 ? prev - 1 : filteredOptions.length - 1
                        )
                        break
                    case 'Enter':
                        e.preventDefault()
                        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                            const selected = filteredOptions[highlightedIndex]
                            handleOptionClick(selected.value ?? selected.label, selected.label)
                        }
                        break
                    case 'Escape':
                        e.preventDefault()
                        closeDropdown()
                        break
                }
            },
            [isOpen, highlightedIndex, filteredOptions]
        )

        useEffect(() => {
            if (isOpen) {
                document.addEventListener('keydown', handleKeyDown)
            }

            return () => document.removeEventListener('keydown', handleKeyDown)
        }, [isOpen, handleKeyDown])

        const closeDropdown = useCallback(() => {
            setIsOpen(false)
            setUserHasTyped(false)

            if (
                searchValue &&
                customizable &&
                !options.some(
                    (opt) =>
                        opt.label.toLowerCase() === searchValue.toLowerCase() ||
                        (opt.value && opt.value.toLowerCase() === searchValue.toLowerCase())
                )
            ) {
                onChange(searchValue)
                setDisplayValue(searchValue)
            } else if (value) {
                setDisplayValue(findOptionLabel(value))
            }
        }, [searchValue, options, onChange, value, customizable, findOptionLabel])

        const handleToggle = useCallback(() => {
            if (disabled) return

            const newIsOpen = !isOpen
            setIsOpen(newIsOpen)

            if (newIsOpen) {
                if (value) {
                    setSearchValue(findOptionLabel(value))
                }
                setUserHasTyped(false)
                setTimeout(() => {
                    inputRef.current?.focus()
                    if (usePortal) updateDropdownPosition()
                }, 0)
            } else {
                closeDropdown()
            }
        }, [
            isOpen,
            disabled,
            value,
            findOptionLabel,
            closeDropdown,
            usePortal,
            updateDropdownPosition,
        ])

        const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value
            setSearchValue(newValue)
            setUserHasTyped(true)

            setHighlightedIndex(-1)
        }, [])

        const handleOptionClick = useCallback(
            (optionValue: string, optionLabel: string) => {
                onChange(optionValue)
                setDisplayValue(optionLabel)
                setSearchValue(optionLabel)
                setIsOpen(false)
                setUserHasTyped(false)
                setHighlightedIndex(-1)
            },
            [onChange]
        )

        const handleInputClick = useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation()
                if (!isOpen) {
                    setIsOpen(true)
                    setTimeout(() => {
                        inputRef.current?.focus()
                        if (usePortal) updateDropdownPosition()
                    }, 0)
                }
            },
            [isOpen, usePortal, updateDropdownPosition]
        )

        const renderDropdown = () => {
            if (!isOpen) return null

            const dropdownContent = (
                <div
                    ref={dropdownRef}
                    className="mt-extratiny text-small max-h-96 w-full overflow-y-auto rounded-lg border border-cold-200 bg-white shadow-lg"
                    role="listbox"
                    style={
                        usePortal
                            ? {
                                  position: 'absolute',
                                  top: `${dropdownPosition.top}px`,
                                  left: `${dropdownPosition.left}px`,
                                  width: `${dropdownPosition.width}px`,
                                  zIndex: 9999,
                              }
                            : {}
                    }
                >
                    {placeholder && (
                        <p className="px-medium py-small w-full select-none truncate text-left font-medium text-cold-800/50">
                            {placeholder}
                        </p>
                    )}
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, i) => (
                            <div
                                key={i}
                                onClick={() =>
                                    handleOptionClick(option.value ?? option.label, option.label)
                                }
                                className={cn(
                                    'px-medium py-small w-full cursor-pointer truncate text-left',
                                    i === highlightedIndex ? 'bg-cold-200' : 'hover:bg-cold-100'
                                )}
                                role="option"
                                aria-selected={i === highlightedIndex}
                                data-value={option.value}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="px-medium py-small italic text-cold-800/50">
                            No options found
                        </div>
                    )}
                </div>
            )

            return usePortal ? createPortal(dropdownContent, document.body) : dropdownContent
        }

        return (
            <div
                className={cn(
                    'text-small relative w-full',
                    className,
                    disabled && 'pointer-events-none bg-cold-900/10'
                )}
                ref={containerRef}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <div
                    className="input flex items-center justify-between"
                    onClick={handleToggle}
                    aria-selected={!!value}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={isOpen ? searchValue : displayValue}
                        onChange={handleInputChange}
                        onClick={handleInputClick}
                        placeholder={placeholder}
                        disabled={disabled}
                        aria-autocomplete="list"
                        className="w-full bg-transparent outline-none placeholder:text-cold-800/50"
                    />
                    <DownIcon
                        className={cn(
                            'h-3.5 w-3.5 stroke-[1.5px] text-cold-800/50 transition-transform md:h-4 md:w-4',
                            {
                                'rotate-180 transform': isOpen,
                            }
                        )}
                        aria-hidden="true"
                    />
                </div>
                {renderDropdown()}
            </div>
        )
    }
)

SearchableSelect.displayName = 'SearchableSelect'

export default SearchableSelect
