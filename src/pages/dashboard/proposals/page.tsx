import ProposalCard from '@components/Pages/ACEDashboard/Proposals/ProposalCard'
import FilterSort from '@components/Shared/FilterSort'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import useFilterSort from '@hooks/useFilterSort'
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
    const filterSortData = useFilterSort('proposal')

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <FilterSort {...filterSortData} />
            <InfiniteScrollWrapper
                LayoutComponent={({ items }) => (
                    <div className="gap-medium flex w-full flex-wrap justify-center">
                        {items.map((item, i) => (
                            <ProposalCard key={i} item={item} />
                        ))}
                    </div>
                )}
                name="proposal"
                hardFilter={filterSortData.filter}
                hardSort={filterSortData.sort}
                query={DAO.call(agent, true).getProposalsPagination}
                className="h-full"
                size={4n}
            />
        </>
    )
}

export default ProposalsPage
