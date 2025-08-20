import Spinner from '@components/Primitives/Spinner'
import { Displayer } from '@hooks/useUsername'
import useVoteColors from '@hooks/useVoteColors'
import cn from '@libs/class'
import { EVote, VOTES } from '@utils/dashboard/proposal'
import { mapVoteTypeFromString } from '@utils/voteColors'
import { DDAO } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

const ProposalVote = ({
    choice,
    vote,
    handleVote,
    loading,
    className = '',
    customColor,
}: {
    choice: EVote
    vote: [Opt<DDAO.Delegable__2>, Displayer | null]
    handleVote: () => void
    loading: boolean
    className?: string
    customColor?: string
}) => {
    const { colors } = useVoteColors()
    const { Icon, bgColor, textColor, borderColor, name } = VOTES[choice]
    const isCurrentVote = !!(
        vote[0] &&
        'Default' in vote[0] &&
        UnwrapVariant(vote[0].Default.choice) === choice
    )

    const voteType = mapVoteTypeFromString(choice)
    const finalCustomColor = customColor || colors[voteType]

    return (
        <button
            className={cn(
                'py-normal gap-small !text-tiny disabled:border-[var(--vote-color)]/0 disabled:bg-[var(--vote-color)]/50 col-span-1 flex transform items-center justify-center border-2 border-[var(--vote-color)] outline-none transition-all duration-200 ease-in-out disabled:pointer-events-none aria-checked:pointer-events-none',
                !isCurrentVote &&
                    `bg-[var(--vote-color)]/0 text-[var(--vote-color)] hover:bg-[var(--vote-color)] hover:text-white`,
                isCurrentVote &&
                    `hover:bg-[var(--vote-color)]/75 hover:border-[var(--vote-color)]/0 bg-[var(--vote-color)] text-white`,
                className
            )}
            style={{
                ['--vote-color' as any]: finalCustomColor,
            }}
            onClick={() => handleVote()}
            aria-checked={isCurrentVote}
            disabled={loading}
        >
            {loading ? (
                <Spinner className="h-5 text-white/50 md:h-6" color="white" />
            ) : (
                <div className="gap-small flex items-center">
                    <Icon className="h-5 stroke-[1.5px] md:h-6" />
                    <span>{name}</span>
                </div>
            )}
        </button>
    )
}

export default ProposalVote
