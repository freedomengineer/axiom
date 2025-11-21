'use client'

import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'

import { AlphaStage } from '@components/Shared/Alerts'
import { deleteAllConfigsCache } from '@hooks/useConfigs'
import useLocalStorage from '@hooks/useLocalStorage'
import { deleteAllNotificationsCache } from '@hooks/useNotification'
import { deleteAllPackagesCache } from '@hooks/usePackages'
import { deleteAllStatusCache } from '@hooks/useStatus'
import { deleteAllTopCache } from '@hooks/useTop'
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
        const oldDomain = 'zcdoa-uyaaa-aaaap-qpztq-cai.icp0.io'
        const newDomain = 'axiom.info'

        const currentUrl = new URL(window.location.href)
        if (process.env.DFX_NETWORK === 'ic' && currentUrl.hostname === oldDomain) {
            currentUrl.hostname = newDomain
            window.location.replace(currentUrl.toString())
        }

        if (version !== '0.0.2') {
            deleteAllStatusCache()
            localStorage.clear()
            setVersion('0.0.2')
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
                    <div className="w-full">
                        {!noMiddleWare ? <Middleware>{children}</Middleware> : children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default LayoutWrapper
