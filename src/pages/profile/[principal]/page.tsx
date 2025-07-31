import { Principal } from '@dfinity/principal'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ProfileLayout from '@components/Pages/Profile/ProfileLayout'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import { getUsername } from '@hooks/useUsername'
import { Facade } from 'shared/utils/services'

const title = 'My Profile'
const metadata = siteMetadata.routes[title]

const PublicProfilePage = () => {
    const { principal } = useParams<{ principal: string }>()
    const navigate = useNavigate()
    const { principal: authPrincipal, setPageStatus } = useAuth()
    const [fetched, setFetched] = useState<{ principal: Principal; username: string }>()

    useEffect(() => {
        try {
            const p = principal ? Principal.fromText(principal) : authPrincipal!
            getUsername(p).then((u) => {
                setFetched({ principal: p, username: u.username! })
            })
        } catch {
            try {
                Facade.call()
                    .getUserIdentifier({ Username: principal! })
                    .then((u) => {
                        setFetched({ principal: u.principal, username: u.username! })
                        navigate(`/profile/${u.principal.toText()}`, { replace: true })
                    })
            } catch {
                setPageStatus(PageStatus.NotFound)
            }
        }
    }, [principal])

    if (!fetched) return null

    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Public Profile of ${fetched.username} | ${siteMetadata.title}`,
        description: metadata.description,
    }

    return (
        <div className="md:p-semilarge p-0">
            <PageMetadata {...pageMetadata} />
            <ProfileLayout key={principal} profilePrincipal={fetched.principal} />
        </div>
    )
}

export default PublicProfilePage
