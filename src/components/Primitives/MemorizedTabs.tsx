import { motion } from 'framer-motion'
import React, {
    Children,
    createContext,
    isValidElement,
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
    activeHeight: number | 'auto'
    setActiveHeight: React.Dispatch<React.SetStateAction<number | 'auto'>>
}

const TabsContext = createContext<TabsContextType | null>(null)

const useTabs = () => {
    const context = useContext(TabsContext)
    if (!context) {
        throw new Error('useTabs hook phải được dùng bên trong một component <Tabs>')
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
    const [activeHeight, setActiveHeight] = useState<number | 'auto'>('auto')

    const onTabChange = (id: string) => {
        if (onValueChange) {
            onValueChange(id)
        }
    }

    const contextValue = useMemo(
        () => ({
            activeTab: value,
            onTabChange,
            indicatorStyle,
            setIndicatorStyle,
            variant,
            activeHeight,
            setActiveHeight,
        }),
        [value, onValueChange, indicatorStyle, variant, activeHeight]
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
                        'absolute z-0 bg-cold-800 drop-shadow-2xl',
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
    const { activeHeight } = useTabs()

    return (
        <motion.div
            animate={{ height: activeHeight || 'auto' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className={cn('relative overflow-hidden', className)}
        >
            {Children.map(children, (child) => {
                if (!isValidElement(child)) return null
                return child
            })}
        </motion.div>
    )
}

export function TabPanel({ value, children, className }: TabPanelProps) {
    const { activeTab, setActiveHeight } = useTabs()
    const isActive = activeTab === value

    const panelRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const node = panelRef.current
        if (!node) return

        const resizeObserver = new ResizeObserver((entries) => {
            if (isActive) {
                const height = entries[0].target.scrollHeight
                setActiveHeight(height)
            }
        })

        resizeObserver.observe(node)

        return () => resizeObserver.disconnect()
    }, [isActive, setActiveHeight])

    return (
        <motion.div
            ref={panelRef}
            key={value}
            role="tabpanel"
            id={`panel-${value}`}
            aria-labelledby={`tab-${value}`}
            tabIndex={0}
            aria-hidden={!isActive}
            className={cn(
                'outline-none',
                {
                    relative: isActive,
                    'invisible absolute inset-0 w-full': !isActive,
                },
                className
            )}
        >
            {children}
        </motion.div>
    )
}
