'use client'

import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'

import { AlphaStage } from '@components/Shared/Alerts'
import { deleteAllConfigsCache } from '@hooks/useConfigs'
import useLocalStorage from '@hooks/useLocalStorage'
import { deleteAllNotificationsCache } from '@hooks/useNotification'
import { deleteAllPackagesCache } from '@hooks/usePackages'
import { deleteAllStatusCache } from '@hooks/useStatus'
import { deleteAllUsernamesCache } from '@hooks/useUsername'

import Header from './Header'
import Middleware from './Middleware'
import Sidebar from './Sidebar'

const LayoutWrapper = ({
    children,
    noMiddleWare,
}: Readonly<{
    children: React.ReactNode
    noMiddleWare?: boolean
}>) => {
    const [open, setOpen] = useState<boolean>(false)
    const [showAlert, setShowAlert] = useLocalStorage('alphaStageAlert')
    const [version, setVersion] = useLocalStorage('version')

    useEffect(() => {
        if (version !== '0.0.1') {
            deleteAllConfigsCache()
            deleteAllPackagesCache()
            deleteAllStatusCache()
            deleteAllUsernamesCache()
            deleteAllNotificationsCache()
            localStorage.clear()
            setVersion('0.0.1')
        }
    }, [version])

    return (
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col">
            <Header openSidebar={open} setOpenSidebar={setOpen} />
            <ToastContainer />
            <div className="relative flex min-h-0 flex-1">
                <Sidebar open={open} onClose={() => setOpen(false)} />
                {showAlert && <AlphaStage onConfirm={() => setShowAlert(false)} />}
                <main className="scroll-container min-w-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
                    <div className="p-semilarge w-full">
                        {!noMiddleWare ? <Middleware>{children}</Middleware> : children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default LayoutWrapper
