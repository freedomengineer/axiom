import { Helmet } from 'react-helmet-async'

import siteMetadata from '@data/siteMetadata.json'

export const PageMetadata = ({
    url,
    title,
    description,
    image = siteMetadata.siteUrl + siteMetadata.siteBanner,
}: Metadata) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />

            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={image} />

            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    )
}

export default PageMetadata
