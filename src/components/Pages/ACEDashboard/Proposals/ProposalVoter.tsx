import AtIcon from '@components/Assets/at.svg'
import Link from '@components/Shared/Link'
import useUsername from '@hooks/useUsername'
import cn from '@libs/class'
import { build } from '@libs/url'
import { EVote, VOTES } from '@utils/dashboard/proposal'
import { DFacade } from 'shared/types/services'

const ProposalVoter = ({ voter, choice }: { voter: DFacade.Identifier; choice?: EVote }) => {
    return (
        <div
            className={cn(
                'flex w-full justify-between',
                choice && 'font-semibold',
                choice ? VOTES[choice].textColor : 'text-cold-800/50'
            )}
        >
            <Link
                className="gap-small flex items-center hover:opacity-75"
                href={build(['profile', voter.principal.toText()])}
            >
                <AtIcon
                    className={cn('h-4 w-4 md:h-5 md:w-5', choice ? 'stroke-2' : 'stroke-[1.5px]')}
                />
                <span className="text-small">{voter.username}</span>
            </Link>
        </div>
    )
}

export default ProposalVoter
