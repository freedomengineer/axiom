import { useParams } from 'react-router-dom'

import ProfileLayout from '@components/Pages/Profile/ProfileLayout'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'

const title = 'My Profile'
const metadata = siteMetadata.routes[title]

const PublicProfilePage = () => {
    const { principal } = useParams<{ principal: string }>()

    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Public Profile of ${principal} | ${siteMetadata.title}`,
        description: metadata.description,
    }

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <ProfileLayout id={principal} key={principal} />
        </>
    )
}

export default PublicProfilePage
