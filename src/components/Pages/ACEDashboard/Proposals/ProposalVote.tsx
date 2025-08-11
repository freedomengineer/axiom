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

    // Use custom color if provided, otherwise fall back to colors from useVoteColors
    const voteType = mapVoteTypeFromString(choice)
    const finalCustomColor = customColor || colors[voteType]

    return (
        <button
            className={cn(
                'py-normal gap-small !text-tiny col-span-1 flex transform items-center justify-center border-2 outline-none transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:border-opacity-0 disabled:bg-opacity-50 aria-checked:pointer-events-none',
                borderColor,
                bgColor,
                !isCurrentVote && `${textColor} bg-opacity-0 hover:bg-opacity-100 hover:text-white`,
                isCurrentVote &&
                    `${bgColor} bg-opacity-100 text-white hover:border-opacity-0 hover:bg-opacity-80`,
                className
            )}
            style={{
                backgroundColor: isCurrentVote ? finalCustomColor : 'transparent',
                borderColor: finalCustomColor,
                color: isCurrentVote ? 'white' : finalCustomColor,
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
