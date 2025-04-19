import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuth, { PageStatus } from '@hooks/useAuth'

const ProfilePage = () => {
    const { principal, setPageStatus } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (principal) {
            navigate(`/profile/${principal.toText()}`, { replace: true })
        } else {
            setPageStatus(PageStatus.LoginRequired)
        }
    }, [])

    return null
}

export default ProfilePage
