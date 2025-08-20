import { AnimatePresence, motion } from 'framer-motion'
import React, {
    Children,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import cn from '@libs/class'

type TabVariant = 'background' | 'underline'

interface TabsContextType {
    activeTab: string
    onTabChange: (id: string) => void
    indicatorStyle: { left: number; width: number }
    setIndicatorStyle: React.Dispatch<React.SetStateAction<{ left: number; width: number }>>
    variant: TabVariant
}

const TabsContext = createContext<TabsContextType | null>(null)

const useTabs = () => {
    const context = useContext(TabsContext)
    if (!context) {
        throw new Error('useTabs hook must be used within a <Tabs> component')
    }
    return context
}

interface TabsProps {
    value: string
    onValueChange?: (value: string) => void
    variant?: TabVariant
    children: React.ReactNode
}
interface TabsHeaderProps {
    children: React.ReactNode
    className?: string
    indicatorProps?: { className?: string }
}
interface TabProps {
    value: string
    className?: string
    onClick?: () => void
    children: React.ReactNode
}
interface TabsBodyProps {
    children: React.ReactNode
    className?: string
}
interface TabPanelProps {
    value: string
    children: React.ReactNode
    className?: string
}

export function Tabs({ value, onValueChange, variant = 'background', children }: TabsProps) {
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

    const onTabChange = useCallback(
        (id: string) => {
            if (onValueChange) {
                onValueChange(id)
            }
        },
        [onValueChange]
    )

    const contextValue = useMemo(
        () => ({
            activeTab: value,
            indicatorStyle,
            variant,
            onTabChange,
            setIndicatorStyle,
        }),
        [value, indicatorStyle, variant, onTabChange]
    )

    return (
        <TabsContext.Provider value={contextValue}>
            <div className="relative w-full">{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsHeader({ children, className, indicatorProps = {} }: TabsHeaderProps) {
    const { indicatorStyle, variant } = useTabs()
    return (
        <div
            role="tablist"
            aria-orientation="horizontal"
            className="scrollbar-hide overflow-x-auto"
        >
            <div
                className={cn(
                    'relative inline-flex min-w-full items-center rounded-lg border border-cold-300 bg-cold-50 px-1 py-0.5',
                    className
                )}
            >
                <motion.div
                    className={cn(
                        'absolute z-0 bg-cold-800',
                        {
                            'bottom-1 top-1 rounded-md': variant === 'background',
                            'bottom-0 h-0.5': variant === 'underline',
                        },
                        indicatorProps.className
                    )}
                    animate={indicatorStyle}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                />
                {children}
            </div>
        </div>
    )
}

export function Tab({ value, className, children, onClick }: TabProps) {
    const { activeTab, onTabChange, setIndicatorStyle } = useTabs()
    const isActive = activeTab === value
    const ref = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        const tabNode = ref.current
        if (!tabNode) return
        const updateIndicator = () => {
            if (activeTab === value)
                setIndicatorStyle({ left: tabNode.offsetLeft, width: tabNode.offsetWidth })
        }
        updateIndicator()
        const resizeObserver = new ResizeObserver(updateIndicator)
        resizeObserver.observe(tabNode)
        return () => resizeObserver.disconnect()
    }, [isActive, activeTab, value, setIndicatorStyle])

    return (
        <button
            ref={ref}
            role="tab"
            id={`tab-${value}`}
            data-value={value}
            aria-selected={isActive}
            aria-controls={`panel-${value}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
                onTabChange(value)
                onClick?.()
            }}
            className={cn(
                'text-small px-medium py-small z-10 my-0.5 flex-1 whitespace-nowrap rounded-lg bg-transparent text-center font-normal outline-none transition-colors duration-200 ease-in-out',
                {
                    'text-cold-600 hover:bg-cold-200': !isActive,
                    'pointer-events-none text-white': isActive,
                },
                className
            )}
        >
            {children}
        </button>
    )
}

export function TabsBody({ children, className }: TabsBodyProps) {
    const { activeTab } = useTabs()

    const activeChild = useMemo(
        () =>
            Children.toArray(children).find(
                (child) => isValidElement(child) && (child.props as any).value === activeTab
            ),
        [children, activeTab]
    )

    return (
        <div className={cn(className)}>
            <AnimatePresence mode="wait">{activeChild}</AnimatePresence>
        </div>
    )
}

export function TabPanel({ value, children, className }: TabPanelProps) {
    return (
        <motion.div
            key={value}
            role="tabpanel"
            id={`panel-${value}`}
            aria-labelledby={`tab-${value}`}
            tabIndex={0}
            className={cn('outline-none', className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}
