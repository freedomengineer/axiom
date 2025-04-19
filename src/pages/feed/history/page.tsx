import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const HistoryPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        navigate(`/feed/history/0?age=${searchParams.get('age') ?? '1'}`, { replace: true })
    }, [])

    return null
}

export default HistoryPage
