import { useSearchParams } from 'react-router-dom'

import PostHypothesis from '@components/Pages/Feed/Hypotheses/PostHypothesis'
import Heading from '@components/Shared/Heading'
import Link from '@components/Shared/Link'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'

const title = 'Post Hypothesis'
const metadata = siteMetadata.routes['Truth Feed'].routes[title]

const PostHypothesisPage = () => {
    const [searchParams] = useSearchParams()

    const field = searchParams.get('field') ?? undefined
    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `${field ? `Post Hypothesis in ${field}` : title} | ${siteMetadata.title}`,
        description: metadata.description,
    }

    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium mb-medium relative flex flex-col">
                <Link
                    href="/feed"
                    className="!text-tiny pre-underline text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100 md:absolute md:inset-y-0 md:left-0"
                    icon="backward"
                    size="small"
                >
                    Back to Feed
                </Link>
                <Heading text="Post Hypothesis" />
            </div>
            <PostHypothesis id={field} />
        </div>
    )
}

export default PostHypothesisPage
