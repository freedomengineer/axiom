import MySettingsLayout from '@components/Pages/Profile/MySettings/MySettingsLayout'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'

const title = 'My Settings'
const metadata = siteMetadata.routes['My Profile'].routes[title]
const metadataPage: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const MySettingsPage = () => {
    return (
        <div className="p-semilarge">
            <PageMetadata {...metadataPage} />
            <MySettingsLayout />
        </div>
    )
}

export default MySettingsPage
