import React, { useCallback, useEffect, useRef, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import useLocalStorage from '@hooks/useLocalStorage'
import cn from '@libs/class'
import { N_DECIMALS } from 'shared/constants'
import { DAxioms } from 'shared/types/services'
import e8s from 'shared/utils/e8s'

interface CustomVotesProps {
    callback: (custom: DAxioms.CustomValue) => void
    onClose: () => void
    children: React.ReactElement<{ onClick?: () => void }>
    className?: string
}

const CustomVotes = ({ callback, onClose, children, className = '' }: CustomVotesProps) => {
    const [isVisible, setIsVisible] = useState(false)
    const [customVoteValues, setCustomVoteValues] = useLocalStorage('customVoteValues')
    const [scaleInput, setScaleInput] = useState('')
    const [valueInput, setValueInput] = useState('')
    const [loadingScale, setLoadingScale] = useState<number | null>(null)
    const [loadingValue, setLoadingValue] = useState<number | null>(null)
    const [loadingInputs, setLoadingInputs] = useState(false)

    const hoverTimeoutRef = useRef<number | null>(null)
    const holdTimeoutRef = useRef<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const closePopup = () => {
        setIsVisible(false)
        onClose()
    }

    const handleMouseEnter = useCallback(() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = window.setTimeout(() => {
            setIsVisible(true)
        }, 500)
    }, [])

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        setIsVisible(false)
    }, [])

    const handleTouchStart = useCallback(() => {
        holdTimeoutRef.current = window.setTimeout(() => {
            setIsVisible(true)
        }, 500)
    }, [])

    const handleTouchEnd = useCallback(() => {
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current)
            holdTimeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closePopup()
            }
        }

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isVisible])

    const childrenWithProps = React.cloneElement(children, {
        onClick: () => {
            if (children.props.onClick) {
                children.props.onClick()
            }

            closePopup()
        },
    })

    const handleScaleVote = async (percentage: number) => {
        setLoadingScale(percentage)
        try {
            await callback({ Scale: BigInt(percentage) })

            const newScaleValues = [
                percentage,
                ...customVoteValues.Scale.filter((v) => v !== percentage),
            ]
            if (newScaleValues.length > 5) {
                newScaleValues.pop()
            }
            setCustomVoteValues({
                ...customVoteValues,
                Scale: newScaleValues,
            })
        } catch (error) {
            console.error('Scale vote error:', error)
        } finally {
            setLoadingScale(null)
        }
    }

    const handleValueVote = async (value: number) => {
        setLoadingValue(value)
        try {
            await callback({ Value: e8s.fromNumber(value) })

            const newCustomValues = [value, ...customVoteValues.Custom.filter((v) => v !== value)]
            if (newCustomValues.length > 2) {
                newCustomValues.pop()
            }
            setCustomVoteValues({
                ...customVoteValues,
                Custom: newCustomValues,
            })
        } catch (error) {
            console.error('Value vote error:', error)
        } finally {
            setLoadingValue(null)
        }
    }

    const handleScaleInputVote = async () => {
        const value = parseInt(scaleInput)
        if (isNaN(value) || value < 0 || value > 100) return

        setLoadingInputs(true)
        try {
            await callback({ Scale: BigInt(value) })

            const newScaleValues = [value, ...customVoteValues.Scale.filter((v) => v !== value)]
            if (newScaleValues.length > 5) {
                newScaleValues.pop()
            }
            setCustomVoteValues({
                ...customVoteValues,
                Scale: newScaleValues,
            })
            setScaleInput('')
        } catch (error) {
            console.error('Scale input vote error:', error)
        } finally {
            setLoadingInputs(false)
        }
    }

    const handleValueInputVote = async () => {
        const value = parseFloat(valueInput)
        if (isNaN(value) || value <= 0) return

        setLoadingInputs(true)
        try {
            await callback({ Value: e8s.fromNumber(value) })

            const newCustomValues = [value, ...customVoteValues.Custom.filter((v) => v !== value)]
            if (newCustomValues.length > 2) {
                newCustomValues.pop()
            }
            setCustomVoteValues({
                ...customVoteValues,
                Custom: newCustomValues,
            })
            setValueInput('')
        } catch (error) {
            console.error('Value input vote error:', error)
        } finally {
            setLoadingInputs(false)
        }
    }

    const handleScaleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value

        if (!/^\d*$/.test(val)) return
        const num = parseInt(val)
        if (val !== '' && (num < 0 || num > 100)) return
        setScaleInput(val)
    }

    const handleValueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/,/g, '.')
        if (!/^\d*\.?\d*$/.test(val)) return
        const [intPart, decPart] = val.split('.')
        if (decPart && decPart.length > N_DECIMALS) {
            const newVal = `${intPart}.${decPart.slice(0, N_DECIMALS)}`
            setValueInput(newVal)
            return
        }
        setValueInput(val)
    }

    return (
        <div
            ref={containerRef}
            className={cn('relative w-full', className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {childrenWithProps}

            {isVisible && (
                <>
                    <div className="absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 transform md:block">
                        <div className="absolute bottom-full left-0 right-0 h-4 bg-transparent"></div>

                        <div className="min-w-80 rounded-lg border border-cold-700 bg-white p-4 text-cold-700 shadow-lg">
                            <div className="mb-3 w-full text-center text-sm font-medium">
                                Choose a % to scale your voting power
                            </div>

                            <div className="mb-2 grid grid-cols-4 gap-2">
                                {customVoteValues.Scale.slice(0, 4).map((percentage, index) => (
                                    <button
                                        key={`scale-${percentage}-${index}`}
                                        onClick={() => handleScaleVote(percentage)}
                                        disabled={loadingScale !== null || loadingInputs}
                                        className="flex h-10 w-full items-center justify-center rounded bg-cold-700 text-center text-sm font-medium text-white hover:bg-cold-800 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {loadingScale === percentage ? (
                                            <Spinner
                                                className="h-4 w-4 md:h-5 md:w-5"
                                                color="white"
                                            />
                                        ) : (
                                            `${percentage}%`
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-4 grid grid-cols-4 gap-2">
                                {customVoteValues.Scale[4] && (
                                    <button
                                        onClick={() => handleScaleVote(customVoteValues.Scale[4])}
                                        disabled={loadingScale !== null || loadingInputs}
                                        className="flex h-10 w-full items-center justify-center rounded bg-cold-700 text-center text-sm font-medium text-white hover:bg-cold-800 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {loadingScale === customVoteValues.Scale[4] ? (
                                            <Spinner
                                                className="h-4 w-4 md:h-5 md:w-5"
                                                color="white"
                                            />
                                        ) : (
                                            `${customVoteValues.Scale[4]}%`
                                        )}
                                    </button>
                                )}

                                <input
                                    type="text"
                                    placeholder="0-100"
                                    value={scaleInput}
                                    onChange={handleScaleInputChange}
                                    disabled={loadingScale !== null || loadingInputs}
                                    className="h-10 rounded border border-cold-700 bg-white px-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-50"
                                />

                                <button
                                    onClick={handleScaleInputVote}
                                    disabled={!scaleInput || loadingScale !== null || loadingInputs}
                                    className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary-700 text-center text-sm font-medium text-white hover:bg-primary-800 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {loadingInputs ? (
                                        <Spinner className="h-4 w-4 md:h-5 md:w-5" color="white" />
                                    ) : (
                                        <>Vote</>
                                    )}
                                </button>
                            </div>

                            <div className="mb-3 w-full text-center text-sm font-medium">
                                Or choose a specific voting power
                            </div>

                            <div className="mb-2 grid grid-cols-4 gap-2">
                                {customVoteValues.Custom.slice(0, 2).map((value, index) => (
                                    <button
                                        key={`value-${value}-${index}`}
                                        onClick={() => handleValueVote(value)}
                                        disabled={loadingValue !== null || loadingInputs}
                                        className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-cold-700 text-center text-sm font-medium text-white hover:bg-cold-800 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {loadingValue === value ? (
                                            <Spinner
                                                className="h-4 w-4 md:h-5 md:w-5"
                                                color="white"
                                            />
                                        ) : (
                                            <>
                                                {value}
                                                <AcornIcon className="h-4 w-4 md:h-5 md:w-5" />
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <input
                                    type="text"
                                    placeholder="Amount"
                                    value={valueInput}
                                    onChange={handleValueInputChange}
                                    disabled={loadingValue !== null || loadingInputs}
                                    className="col-span-2 h-10 rounded border border-cold-700 bg-white px-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-50"
                                />

                                <button
                                    onClick={handleValueInputVote}
                                    disabled={!valueInput || loadingValue !== null || loadingInputs}
                                    className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary-700 text-center text-sm font-medium text-white hover:bg-primary-800 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {loadingInputs ? (
                                        <Spinner className="h-4 w-4 md:h-5 md:w-5" color="white" />
                                    ) : (
                                        <>Vote</>
                                    )}
                                </button>
                            </div>

                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 translate-y-px transform">
                                <div className="h-0 w-0 border-b-[9px] border-l-[9px] border-r-[9px] border-b-cold-700 border-l-transparent border-r-transparent"></div>
                                <div className="absolute left-1/2 top-[1px] h-0 w-0 -translate-x-1/2 transform border-b-8 border-l-8 border-r-8 border-b-white border-l-transparent border-r-transparent"></div>
                            </div>
                        </div>
                    </div>

                    <div className="fixed left-1/2 top-1/2 z-50 block w-screen -translate-x-1/2 -translate-y-1/2 transform px-4 md:hidden">
                        <div className="mx-auto w-full max-w-sm rounded-lg border border-cold-700 bg-white p-4 text-cold-700 shadow-lg">
                            <div className="mb-3 w-full text-center text-sm font-medium">
                                Choose a % to scale your voting power
                            </div>

                            <div className="mb-2 grid grid-cols-4 gap-2">
                                {customVoteValues.Scale.slice(0, 4).map((percentage, index) => (
                                    <button
                                        key={`scale-mobile-${percentage}-${index}`}
                                        onClick={() => handleScaleVote(percentage)}
                                        disabled={loadingScale !== null || loadingInputs}
                                        className="flex h-10 w-full items-center justify-center rounded bg-cold-700 text-center text-sm font-medium text-white hover:bg-cold-800 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {loadingScale === percentage ? (
                                            <Spinner
                                                className="h-4 w-4 md:h-5 md:w-5"
                                                color="white"
                                            />
                                        ) : (
                                            `${percentage}%`
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-4 grid grid-cols-4 gap-2">
                                {customVoteValues.Scale[4] && (
                                    <button
                                        onClick={() => handleScaleVote(customVoteValues.Scale[4])}
                                        disabled={loadingScale !== null || loadingInputs}
                                        className="flex h-10 w-full items-center justify-center rounded bg-cold-700 text-center text-sm font-medium text-white hover:bg-cold-800 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {loadingScale === customVoteValues.Scale[4] ? (
                                            <Spinner
                                                className="h-4 w-4 md:h-5 md:w-5"
                                                color="white"
                                            />
                                        ) : (
                                            `${customVoteValues.Scale[4]}%`
                                        )}
                                    </button>
                                )}

                                <input
                                    type="text"
                                    placeholder="0-100"
                                    value={scaleInput}
                                    onChange={handleScaleInputChange}
                                    disabled={loadingScale !== null || loadingInputs}
                                    className="h-10 rounded border border-cold-700 bg-white px-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-50"
                                />

                                <button
                                    onClick={handleScaleInputVote}
                                    disabled={!scaleInput || loadingScale !== null || loadingInputs}
                                    className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary-700 text-center text-sm font-medium text-white hover:bg-primary-800 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {loadingInputs ? (
                                        <Spinner className="h-4 w-4 md:h-5 md:w-5" color="white" />
                                    ) : (
                                        <>Vote</>
                                    )}
                                </button>
                            </div>

                            <div className="mb-3 w-full text-center text-sm font-medium">
                                Or choose a specific voting power
                            </div>

                            <div className="mb-2 grid grid-cols-4 gap-2">
                                {customVoteValues.Custom.slice(0, 2).map((value, index) => (
                                    <button
                                        key={`value-mobile-${value}-${index}`}
                                        onClick={() => handleValueVote(value)}
                                        disabled={loadingValue !== null || loadingInputs}
                                        className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-cold-700 text-center text-sm font-medium text-white hover:bg-cold-800 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {loadingValue === value ? (
                                            <Spinner
                                                className="h-4 w-4 md:h-5 md:w-5"
                                                color="white"
                                            />
                                        ) : (
                                            <>{value}</>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <input
                                    type="text"
                                    placeholder="Amount"
                                    value={valueInput}
                                    onChange={handleValueInputChange}
                                    disabled={loadingValue !== null || loadingInputs}
                                    className="col-span-2 h-10 rounded border border-cold-700 bg-white px-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-50"
                                />

                                <button
                                    onClick={handleValueInputVote}
                                    disabled={!valueInput || loadingValue !== null || loadingInputs}
                                    className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary-700 text-center text-sm font-medium text-white hover:bg-primary-800 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {loadingInputs ? (
                                        <Spinner className="h-4 w-4 md:h-5 md:w-5" color="white" />
                                    ) : (
                                        <>Vote</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default CustomVotes
