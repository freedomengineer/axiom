import { Principal } from '@dfinity/principal'

import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import useAuth from '@hooks/useAuth'
import { DAO } from 'shared/utils/services'

import ProposalCard from '../ACEDashboard/Proposals/ProposalCard'

const ProposalsTab = ({ principal, type }: { principal: Principal; type: 'Opened' | 'Voted' }) => {
    const { agent } = useAuth()

    return (
        <InfiniteScrollWrapper
            LayoutComponent={({ items }) => (
                <div className="gap-medium flex w-full flex-wrap justify-center">
                    {items.map((item, i) => (
                        <ProposalCard key={i} item={item} />
                    ))}
                </div>
            )}
            name="proposal"
            hardFilter={
                type === 'Opened' ? { proposer: principal.toText() } : { voter: principal.toText() }
            }
            hardSort={{ by: 'recent', order: 'descending' }}
            query={DAO.call(agent, true).getProposalsPagination}
            className="h-full"
            size={3n}
        />
    )
}

export default ProposalsTab
