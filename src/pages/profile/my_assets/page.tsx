import MyAssetsLayout from '@components/Pages/Profile/MyAssets/MyAssetsLayout'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'

const title = 'My Assets'
const metadata = siteMetadata.routes['My Profile'].routes[title]
const metadataPage: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const MyAssetsPage = () => {
    return (
        <div className="p-semilarge">
            <PageMetadata {...metadataPage} />
            <MyAssetsLayout />
        </div>
    )
}

export default MyAssetsPage
