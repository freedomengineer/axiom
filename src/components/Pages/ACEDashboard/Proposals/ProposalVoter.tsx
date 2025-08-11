import Link from '@components/Shared/Link'
import { Symbol } from '@components/Shared/Username'
import cn from '@libs/class'
import { build } from '@libs/url'
import { EVote, VOTES } from '@utils/dashboard/proposal'
import { DFacade } from 'shared/types/services'

const ProposalVoter = ({
    voter,
    choice,
    customColor,
}: {
    voter: DFacade.Identifier
    choice?: EVote
    customColor?: string
}) => {
    return (
        <div
            className={cn('flex w-full justify-between', choice && 'font-semibold')}
            style={{
                color: customColor || (choice ? VOTES[choice].textColor : 'rgba(31, 41, 55, 0.5)'),
            }}
        >
            <Link
                className="gap-small flex items-center hover:opacity-75"
                href={build(['profile', voter.principal.toText()])}
            >
                <Symbol
                    capitalRaised={voter.capitalRaised.toString()}
                    className={cn(
                        'h-4 w-4 md:h-5 md:w-5',
                        choice ? 'stroke-[3px]' : 'stroke-[2px]'
                    )}
                />
                <span className="text-small">{voter.username}</span>
            </Link>
        </div>
    )
}

export default ProposalVoter
