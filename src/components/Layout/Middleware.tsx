'use client'

import { useNavigate } from 'react-router-dom'

import useAuth, { PageStatus } from '@hooks/useAuth'

import NotFound from './NotFound'
import Restricted from './Restricted'

const Middleware = ({ children }: { children: React.ReactNode }) => {
    const { pageStatus } = useAuth()
    const navigate = useNavigate()

    switch (pageStatus) {
        case PageStatus.Loading:
            return null
        case PageStatus.Restricted:
            return <Restricted />
        case PageStatus.NotFound:
            return <NotFound />
        case PageStatus.LoginRequired:
            navigate('/login', { replace: true })
            return null
        default:
            return children
    }
}

export default Middleware
