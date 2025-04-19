import { DDAO } from 'shared/types/services'

import ProposalCard from '../ACEDashboard/Proposals/ProposalCard'

const ProposalsTab = ({ proposals }: { proposals: DDAO.SharableProposal[] }) => {
    if (proposals.length === 0) {
        return (
            <p className="text-normal text-center font-light text-cold-800">
                User has no opened proposals yet
            </p>
        )
    }

    return (
        <div className="gap-medium flex w-full flex-col justify-center">
            {proposals.map((item, i) => (
                <ProposalCard key={i} item={item} />
            ))}
        </div>
    )
}

export default ProposalsTab
