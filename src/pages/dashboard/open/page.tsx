import { useSearchParams } from 'react-router-dom'

import OpenProposal from '@components/Pages/ACEDashboard/Proposals/OpenProposal'
import Heading from '@components/Shared/Heading'
import Link from '@components/Shared/Link'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import { ECategory } from '@utils/dashboard/proposal'
import { isNullish } from 'shared/utils/typings'

const title = 'Open Proposal'
const metadata = siteMetadata.routes['ACE Dashboard'].routes[title]

const OpenProposalPage = () => {
    const { setPageStatus } = useAuth()
    const [searchParams] = useSearchParams()

    const proposalStr = searchParams.get('id')
    const categoryStr = searchParams.get('category')

    const category =
        categoryStr && categoryStr in ECategory ? (categoryStr as ECategory) : undefined

    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: isNullish(proposalStr)
            ? `Open ${category ? `${category} ` : ''}Proposal | ${siteMetadata.title}`
            : `Retry ${category ? `${category} ` : ''}Proposal #${proposalStr} | ${siteMetadata.title}`,
        description: metadata.description,
    }

    try {
        proposalStr && BigInt(proposalStr!)
    } catch {
        setPageStatus(PageStatus.NotFound)
    }

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium mb-medium relative flex flex-col">
                <Link
                    href="/dashboard/proposals"
                    className="!text-tiny pre-underline text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100 md:absolute md:inset-y-0 md:left-0"
                    icon="backward"
                    size="small"
                >
                    Back to Proposals
                </Link>
                <Heading text="Open Proposal" />
            </div>
            <OpenProposal id={proposalStr ? BigInt(proposalStr!) : undefined} category={category} />
        </>
    )
}

export default OpenProposalPage
