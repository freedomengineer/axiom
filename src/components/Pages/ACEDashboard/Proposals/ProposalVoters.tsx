import cn from '@libs/class'
import { EVote, VOTES } from '@utils/dashboard/proposal'
import { DFacade } from 'shared/types/services'

import ProposalVoter from './ProposalVoter'

const ProposalVoters = ({
    voters,
    choice,
    totalVoters,
    displayPercentage,
}: {
    voters: DFacade.Identifier[]
    choice?: EVote
    totalVoters: number
    displayPercentage: boolean
}) => {
    if (voters.length === 0) return null

    return (
        <>
            <div className="col-span-7 flex flex-col">
                {voters.map((voter, index) => (
                    <ProposalVoter key={index} voter={voter} choice={choice} />
                ))}
            </div>
            <div
                className={cn('col-span-1 w-1', choice ? VOTES[choice].bgColor : 'bg-cold-800/15')}
            ></div>
            <p
                className={cn(
                    'text-small col-span-2 my-auto',
                    choice && 'font-semibold',
                    choice ? VOTES[choice].textColor : 'text-cold-800/50',
                    displayPercentage ? 'visible' : 'invisible'
                )}
            >
                {((voters.length / totalVoters) * 100).toFixed(2)}%
            </p>
        </>
    )
}

export default ProposalVoters
