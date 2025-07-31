import { useParams, useSearchParams } from 'react-router-dom'

import PostEvidence from '@components/Pages/Feed/Evidences/PostEvidence'
import Heading from '@components/Shared/Heading'
import Link from '@components/Shared/Link'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import { build } from '@libs/url'
import { EVote } from '@utils/feed/evidence'

const title = 'Post Evidence'
const metadata = siteMetadata.routes['Truth Feed'].routes['Evidences'].routes[title]

const PostEvidencePage = () => {
    const { setPageStatus } = useAuth()
    const { hypothesis } = useParams<{ hypothesis: string }>()
    const [searchParams] = useSearchParams()

    const side = searchParams.get('side')
    const eSide = side && side in EVote ? (side as EVote) : undefined
    const replyTo = searchParams.get('replyTo')
    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Post ${eSide ? `${eSide} ` : ''}${replyTo ? 'Reply ' : ' '}Evidence | Hypothesis ${hypothesis} | ${siteMetadata.title}`,
        description: metadata.description,
    }

    try {
        BigInt(hypothesis!)
        if (replyTo) BigInt(replyTo)
    } catch {
        setPageStatus(PageStatus.NotFound)
    }

    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium mb-medium relative flex flex-col">
                <Link
                    href={build(['feed', hypothesis!])}
                    className="!text-tiny pre-underline text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100 md:absolute md:inset-y-0 md:left-0"
                    icon="backward"
                    size="small"
                >
                    Back to Hypothesis {hypothesis!}
                </Link>
                <Heading text={replyTo ? `Post Reply to Evidence ${replyTo}` : `Post Evidence`} />
            </div>
            <PostEvidence
                id={BigInt(hypothesis!)}
                side={eSide}
                replyTo={replyTo ? BigInt(replyTo) : undefined}
            />
        </div>
    )
}

export default PostEvidencePage
