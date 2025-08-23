import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

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
    isExternalLoading?: boolean
}

const CustomVotes = ({
    callback,
    onClose,
    children,
    className = '',
    isExternalLoading = false,
}: CustomVotesProps) => {
    const [isVisible, setIsVisible] = useState(false)
    const [customVoteValues, setCustomVoteValues] = useLocalStorage('customVoteValues')
    const [scaleInput, setScaleInput] = useState('')
    const [valueInput, setValueInput] = useState('')
    const [loadingScale, setLoadingScale] = useState<number | null>(null)
    const [loadingValue, setLoadingValue] = useState<number | null>(null)
    const [loadingInputs, setLoadingInputs] = useState(false)

    const hoverTimeoutRef = useRef<number | null>(null)
    const holdTimeoutRef = useRef<number | null>(null)
    const closingTimeoutRef = useRef<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const lastTouchEnd = useRef(0)
    const desktopPopupRef = useRef<HTMLDivElement>(null)
    const mobilePopupRef = useRef<HTMLDivElement>(null)

    const [desktopPopupStyle, setDesktopPopupStyle] = useState<React.CSSProperties>({})
    const [desktopArrowStyle, setDesktopArrowStyle] = useState<React.CSSProperties>({})
    const [mobilePopupStyle, setMobilePopupStyle] = useState<React.CSSProperties>({})
    const [mobileArrowStyle, setMobileArrowStyle] = useState<React.CSSProperties>({})
    const [isPopupBelow, setIsPopupBelow] = useState(true)
    const [isAnimatingIn, setIsAnimatingIn] = useState(false)

    const isExternalLoadingRef = useRef(isExternalLoading)
    useEffect(() => {
        isExternalLoadingRef.current = isExternalLoading
    }, [isExternalLoading])

    const closePopup = useCallback(() => {
        setIsVisible(false)
        onClose()
    }, [onClose])

    useEffect(() => {
        if (isVisible) {
            const id = requestAnimationFrame(() => {
                setIsAnimatingIn(true)
            })
            return () => {
                cancelAnimationFrame(id)
                setIsAnimatingIn(false)
            }
        } else {
            setIsAnimatingIn(false)
        }
    }, [isVisible])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node

            if (
                (containerRef.current && containerRef.current.contains(target)) ||
                (desktopPopupRef.current && desktopPopupRef.current.contains(target)) ||
                (mobilePopupRef.current && mobilePopupRef.current.contains(target))
            ) {
                return
            }

            closePopup()
        }

        const handleScroll = () => {
            closePopup()
        }

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside)
            window.addEventListener('scroll', handleScroll, { capture: true })
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('scroll', handleScroll, { capture: true })
        }
    }, [isVisible, closePopup])

    useLayoutEffect(() => {
        if (!isVisible) return

        const buttonRect = containerRef.current?.getBoundingClientRect()
        if (!buttonRect) return

        const desktopPopupNode = desktopPopupRef.current
        if (desktopPopupNode) {
            const observer = new ResizeObserver(() => {
                const buttonRect = containerRef.current?.getBoundingClientRect()
                if (!buttonRect) return

                const popupHeight = desktopPopupNode.offsetHeight
                const spaceBelow = window.innerHeight - buttonRect.bottom
                const popupIsBelow = spaceBelow >= popupHeight || spaceBelow > buttonRect.top
                setIsPopupBelow(popupIsBelow)

                const popupWidth = desktopPopupNode.offsetWidth
                const viewportWidth = window.innerWidth
                const buttonCenterViewport = buttonRect.left + buttonRect.width / 2

                let popupLeftViewport = buttonCenterViewport - popupWidth / 2
                if (popupLeftViewport < 16) {
                    popupLeftViewport = 16
                } else if (popupLeftViewport + popupWidth > viewportWidth - 16) {
                    popupLeftViewport = viewportWidth - 16 - popupWidth
                }

                const newPopupStyle: React.CSSProperties = {
                    position: 'fixed',
                    left: `${popupLeftViewport}px`,
                }

                if (popupIsBelow) {
                    newPopupStyle.top = `${buttonRect.bottom + 6}px`
                } else {
                    newPopupStyle.top = `${buttonRect.top - popupHeight - 6}px`
                }
                setDesktopPopupStyle(newPopupStyle)

                const arrowLeftRelativeToPopup = buttonCenterViewport - popupLeftViewport
                const newArrowStyle = {
                    left: `${arrowLeftRelativeToPopup}px`,
                    transform: 'translateX(-50%)',
                }
                setDesktopArrowStyle(newArrowStyle)
            })

            observer.observe(desktopPopupNode)
            return () => observer.disconnect()
        }
    }, [isVisible])

    useLayoutEffect(() => {
        if (!isVisible) return

        const mobilePopupNode = mobilePopupRef.current
        if (mobilePopupNode) {
            const observer = new ResizeObserver(() => {
                const buttonRect = containerRef.current?.getBoundingClientRect()
                if (!buttonRect) return

                const popupHeight = mobilePopupNode.offsetHeight
                const spaceBelow = window.innerHeight - buttonRect.bottom
                const popupIsBelow = spaceBelow >= popupHeight || spaceBelow > buttonRect.top
                setIsPopupBelow(popupIsBelow)

                const newPopupStyle: React.CSSProperties = {}
                if (popupIsBelow) {
                    newPopupStyle.top = `${buttonRect.bottom + 6}px`
                } else {
                    newPopupStyle.top = `${buttonRect.top - popupHeight - 6}px`
                }
                setMobilePopupStyle(newPopupStyle)

                const buttonCenterViewport = buttonRect.left + buttonRect.width / 2
                const mobilePopupWidth = mobilePopupNode.offsetWidth
                const popupLeftViewport = (window.innerWidth - mobilePopupWidth) / 2

                const arrowLeftRelativeToPopup = buttonCenterViewport - popupLeftViewport
                const newArrowStyle = {
                    left: `${arrowLeftRelativeToPopup}px`,
                    transform: 'translateX(-50%)',
                }
                setMobileArrowStyle(newArrowStyle)
            })

            observer.observe(mobilePopupNode)
            return () => observer.disconnect()
        }
    }, [isVisible])

    const handleMouseEnter = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (
                event.relatedTarget &&
                containerRef.current?.contains(event.relatedTarget as Node)
            ) {
                return
            }

            if (closingTimeoutRef.current) {
                clearTimeout(closingTimeoutRef.current)
                closingTimeoutRef.current = null
            }
            if (Date.now() - lastTouchEnd.current < 500) {
                return
            }
            if (isExternalLoading) {
                if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current)
                    hoverTimeoutRef.current = null
                }
                return
            }
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = window.setTimeout(() => {
                if (!isExternalLoadingRef.current) {
                    setIsVisible(true)
                }
            }, 500)
        },
        [isExternalLoading]
    )

    const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (event.relatedTarget && containerRef.current?.contains(event.relatedTarget as Node)) {
            return
        }

        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        closingTimeoutRef.current = window.setTimeout(() => {
            setIsVisible(false)
        }, 200)
    }, [])

    const handlePopupMouseEnter = () => {
        if (closingTimeoutRef.current) {
            clearTimeout(closingTimeoutRef.current)
            closingTimeoutRef.current = null
        }
    }

    const handlePopupMouseLeave = () => {
        closingTimeoutRef.current = window.setTimeout(() => {
            setIsVisible(false)
        }, 200)
    }

    const handleTouchStart = useCallback(() => {
        if (isExternalLoadingRef.current) {
            if (holdTimeoutRef.current) {
                clearTimeout(holdTimeoutRef.current)
                holdTimeoutRef.current = null
            }
            return
        }

        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }

        holdTimeoutRef.current = window.setTimeout(() => {
            if (!isExternalLoadingRef.current) {
                setIsVisible(true)
            }
        }, 500)
    }, [isExternalLoading])

    const handleTouchEnd = useCallback(() => {
        lastTouchEnd.current = Date.now()
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current)
            holdTimeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        if (isExternalLoadingRef.current) {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
                hoverTimeoutRef.current = null
            }
            if (holdTimeoutRef.current) {
                clearTimeout(holdTimeoutRef.current)
                holdTimeoutRef.current = null
            }
            if (isVisible) {
                closePopup()
            }
        }
    }, [isExternalLoading, isVisible, closePopup])

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
            className={cn('relative w-full select-none', className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {childrenWithProps}

            {isVisible && (
                <>
                    {typeof window !== 'undefined' &&
                        createPortal(
                            <div
                                ref={desktopPopupRef}
                                style={desktopPopupStyle}
                                className={cn(
                                    'z-[999999] hidden transform md:block',
                                    'transition-all duration-200 ease-out',
                                    isAnimatingIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                                )}
                                onMouseEnter={handlePopupMouseEnter}
                                onMouseLeave={handlePopupMouseLeave}
                            >
                                <div className="relative min-w-80 rounded-lg border border-cold-700 bg-white p-4 text-cold-700 shadow-lg">
                                    <div
                                        style={desktopArrowStyle}
                                        className={cn(
                                            'absolute',
                                            isPopupBelow ? 'bottom-full' : 'top-full'
                                        )}
                                    >
                                        {isPopupBelow ? (
                                            <div className="translate-y-px transform">
                                                <div className="h-0 w-0 border-b-[9px] border-l-[9px] border-r-[9px] border-b-cold-700 border-l-transparent border-r-transparent"></div>
                                                <div className="absolute left-1/2 top-[1px] h-0 w-0 -translate-x-1/2 transform border-b-8 border-l-8 border-r-8 border-b-white border-l-transparent border-r-transparent"></div>
                                            </div>
                                        ) : (
                                            <div className="-translate-y-px transform">
                                                <div className="h-0 w-0 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-cold-700" />
                                                <div className="absolute bottom-[1px] left-1/2 h-0 w-0 -translate-x-1/2 transform border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3 w-full text-center text-sm font-medium">
                                        Choose a % to scale your voting power
                                    </div>

                                    <div className="mb-2 grid grid-cols-4 gap-2">
                                        {customVoteValues.Scale.slice(0, 4).map(
                                            (percentage, index) => (
                                                <button
                                                    key={`scale-${percentage}-${index}`}
                                                    onClick={() => handleScaleVote(percentage)}
                                                    disabled={
                                                        loadingScale !== null || loadingInputs
                                                    }
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
                                            )
                                        )}
                                    </div>

                                    <div className="mb-4 grid grid-cols-4 gap-2">
                                        {customVoteValues.Scale[4] !== undefined && (
                                            <button
                                                onClick={() =>
                                                    handleScaleVote(customVoteValues.Scale[4])
                                                }
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
                                            disabled={
                                                !scaleInput ||
                                                loadingScale !== null ||
                                                loadingInputs
                                            }
                                            className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary-700 text-center text-sm font-medium text-white hover:bg-primary-800 disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            {loadingInputs ? (
                                                <Spinner
                                                    className="h-4 w-4 md:h-5 md:w-5"
                                                    color="white"
                                                />
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
                                            disabled={
                                                !valueInput ||
                                                loadingValue !== null ||
                                                loadingInputs
                                            }
                                            className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary-700 text-center text-sm font-medium text-white hover:bg-primary-800 disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            {loadingInputs ? (
                                                <Spinner
                                                    className="h-4 w-4 md:h-5 md:w-5"
                                                    color="white"
                                                />
                                            ) : (
                                                <>Vote</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )}

                    {typeof window !== 'undefined' &&
                        createPortal(
                            <div
                                style={mobilePopupStyle}
                                className={cn(
                                    'fixed left-1/2 z-[999999] block w-[90vw] -translate-x-1/2 transform md:hidden',
                                    'transition-all duration-200 ease-out',
                                    isAnimatingIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                                )}
                            >
                                <div
                                    ref={mobilePopupRef}
                                    className="relative mx-auto w-full rounded-lg border border-cold-700 bg-white p-4 text-cold-700 shadow-lg"
                                >
                                    <div
                                        style={mobileArrowStyle}
                                        className={cn(
                                            'absolute',
                                            isPopupBelow ? 'bottom-full' : 'top-full'
                                        )}
                                    >
                                        {isPopupBelow ? (
                                            <div className="translate-y-px transform">
                                                <div className="h-0 w-0 border-b-[9px] border-l-[9px] border-r-[9px] border-b-cold-700 border-l-transparent border-r-transparent"></div>
                                                <div className="absolute left-1/2 top-[1px] h-0 w-0 -translate-x-1/2 transform border-b-8 border-l-8 border-r-8 border-b-white border-l-transparent border-r-transparent"></div>
                                            </div>
                                        ) : (
                                            <div className="-translate-y-px transform">
                                                <div className="h-0 w-0 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-cold-700" />
                                                <div className="absolute bottom-[1px] left-1/2 h-0 w-0 -translate-x-1/2 transform border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3 w-full text-center text-sm font-medium">
                                        Choose a % to scale your voting power
                                    </div>

                                    <div className="mb-2 grid grid-cols-4 gap-2">
                                        {customVoteValues.Scale.slice(0, 4).map(
                                            (percentage, index) => (
                                                <button
                                                    key={`scale-mobile-${percentage}-${index}`}
                                                    onClick={() => handleScaleVote(percentage)}
                                                    disabled={
                                                        loadingScale !== null || loadingInputs
                                                    }
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
                                            )
                                        )}
                                    </div>

                                    <div className="mb-4 grid grid-cols-4 gap-2">
                                        {customVoteValues.Scale[4] !== undefined && (
                                            <button
                                                onClick={() =>
                                                    handleScaleVote(customVoteValues.Scale[4])
                                                }
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
                                            disabled={
                                                !scaleInput ||
                                                loadingScale !== null ||
                                                loadingInputs
                                            }
                                            className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary-700 text-center text-sm font-medium text-white hover:bg-primary-800 disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            {loadingInputs ? (
                                                <Spinner
                                                    className="h-4 w-4 md:h-5 md:w-5"
                                                    color="white"
                                                />
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
                                            disabled={
                                                !valueInput ||
                                                loadingValue !== null ||
                                                loadingInputs
                                            }
                                            className="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary-700 text-center text-sm font-medium text-white hover:bg-primary-800 disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            {loadingInputs ? (
                                                <Spinner
                                                    className="h-4 w-4 md:h-5 md:w-5"
                                                    color="white"
                                                />
                                            ) : (
                                                <>Vote</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )}
                </>
            )}
        </div>
    )
}

export default CustomVotes
