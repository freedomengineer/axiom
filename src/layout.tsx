import { Outlet } from 'react-router-dom'

import LayoutWrapper from '@components/Layout/LayoutWrapper'
import AuthProvider from '@providers/AuthProvider'

const RootLayout = () => {
    return (
        <AuthProvider>
            <LayoutWrapper>
                <Outlet />
            </LayoutWrapper>
        </AuthProvider>
    )
}

export default RootLayout
