import ProposalCard from '@components/Pages/ACEDashboard/Proposals/ProposalCard'
import PageMetadata from '@components/Shared/PageMetadata'
import PaginationWrapper from '@components/Shared/PaginationWrapper'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import { PROPOSAL_FILTER, PROPOSAL_SORT } from 'shared/default/filter_sort'
import { DDAO } from 'shared/types/services'
import { DAO } from 'shared/utils/services'

const title = 'Proposals'
const metadata = siteMetadata.routes['ACE Dashboard'].routes['Proposals']
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ACE Dashboard | ${siteMetadata.title}`,
    description: metadata.description,
}

const ProposalsPage = () => {
    const { agent } = useAuth()

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <PaginationWrapper<DDAO.SharableProposal>
                LayoutComponent={({ items }) => (
                    <div className="gap-medium flex w-full flex-wrap justify-center">
                        {items.map((item, i) => (
                            <ProposalCard key={i} item={item} />
                        ))}
                    </div>
                )}
                query={DAO.call(agent, true).getProposalsPagination}
                filter={PROPOSAL_FILTER}
                sort={PROPOSAL_SORT}
            />
        </>
    )
}

export default ProposalsPage
