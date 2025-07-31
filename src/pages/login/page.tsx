import LoginLayout from '@components/Pages/Login/LoginLayout'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'

const title = 'Login'
const metadata = siteMetadata.routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const LoginPage = () => {
    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} />
            <LoginLayout />
        </div>
    )
}

export default LoginPage
