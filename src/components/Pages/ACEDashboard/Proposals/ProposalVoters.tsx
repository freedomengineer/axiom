import cn from '@libs/class'
import { EVote, VOTES } from '@utils/dashboard/proposal'
import { DFacade } from 'shared/types/services'

import ProposalVoter from './ProposalVoter'

const ProposalVoters = ({
    voters,
    choice,
    totalVoters,
    displayPercentage,
    customColor,
}: {
    voters: DFacade.Identifier[]
    choice?: EVote
    totalVoters: number
    displayPercentage: boolean
    customColor?: string
}) => {
    if (voters.length === 0) return null

    return (
        <>
            <div className="col-span-7 flex flex-col">
                {voters.map((voter, index) => (
                    <ProposalVoter
                        key={index}
                        voter={voter}
                        choice={choice}
                        customColor={customColor}
                    />
                ))}
            </div>
            <div
                className="col-span-1 w-1"
                style={{
                    backgroundColor:
                        customColor || (choice ? VOTES[choice].bgColor : 'rgba(31, 41, 55, 0.15)'),
                }}
            ></div>
            <p
                className={cn(
                    'text-small col-span-2 my-auto',
                    choice && 'font-semibold',
                    displayPercentage ? 'visible' : 'invisible'
                )}
                style={{
                    color:
                        customColor || (choice ? VOTES[choice].textColor : 'rgba(31, 41, 55, 0.5)'),
                }}
            >
                {((voters.length / totalVoters) * 100).toFixed(2)}%
            </p>
        </>
    )
}

export default ProposalVoters
