import { DDAO } from 'shared/types/services'

import ProposalCard from '../ACEDashboard/Proposals/ProposalCard'

const ProposalsTab = ({
    proposals,
    type,
}: {
    proposals: DDAO.SharableProposal[]
    type: 'Opened' | 'Voted'
}) => {
    if (proposals.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <p className="text-tiny font-normal text-cold-700">
                    User has not {type === 'Opened' ? 'opened' : 'voted on'} any proposals yet.
                </p>
            </div>
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
