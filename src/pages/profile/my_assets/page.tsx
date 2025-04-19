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
        <>
            <PageMetadata {...metadataPage} />
            <MyAssetsLayout />
        </>
    )
}

export default MyAssetsPage
