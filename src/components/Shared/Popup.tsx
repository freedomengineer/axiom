import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import CloseIcon from '@components/Assets/close.svg'
import NewTabIcon from '@components/Assets/new_tab.svg'
import Link from '@components/Shared/Link'
import cn from '@libs/class'

const Popup = ({
    open,
    title,
    onClose,
    href,
    Icon,
    className,
    zIndex = 9999,
    children,
}: {
    open: boolean
    title: string
    onClose?: () => void
    href?: string
    Icon?: React.ReactNode
    className?: string
    zIndex?: number
    children: React.ReactNode
}) => {
    if (!open) return null

    const [visible, setVisible] = useState<boolean>(open)

    useEffect(() => {
        if (open) setVisible(true)
        else {
            const timeout = setTimeout(() => setVisible(false), 300)
            return () => clearTimeout(timeout)
        }
    }, [open])

    if (!visible) return null

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-cold-700"
            style={{ zIndex }}
        >
            <div
                className={cn(
                    'relative h-fit max-w-[95vw] rounded-lg bg-white shadow-lg md:max-w-[85vw]',
                    className
                )}
            >
                <div className="px-semilarge py-medium flex justify-between border-b border-gray-200">
                    <div className="gap-medium flex items-center">
                        {Icon}
                        <h2 className="text-medium font-light">{title}</h2>
                    </div>
                    <div className="gap-medium flex items-center justify-end">
                        {href && (
                            <Link
                                href={href}
                                className="gap-small !text-tiny flex h-min items-center border-b border-cold-700 border-opacity-50 hover:border-opacity-100"
                                size="tiny"
                                target="_blank"
                                rel="noreferrer"
                                passHref
                                prefetch
                                openInNewTab
                            >
                                <span className="font-light">Open in new tab</span>
                                <NewTabIcon className="h-3 w-3 stroke-[1.5px] md:h-4 md:w-4" />
                            </Link>
                        )}
                        {onClose && (
                            <button onClick={onClose}>
                                <CloseIcon className="p-small h-7 w-7 rounded-full stroke-1 hover:bg-cold-100 md:h-8 md:w-8 md:stroke-[1.5px]" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="py-semilarge px-extralarge mx-auto h-auto max-h-[80dvh] w-full max-w-[95vw] overflow-y-auto md:max-w-[85vw]">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}

export default Popup
