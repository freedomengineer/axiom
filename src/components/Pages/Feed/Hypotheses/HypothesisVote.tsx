import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import CustomVotes from '@components/Shared/CustomVotes'
import useVoteColors from '@hooks/useVoteColors'
import cn from '@libs/class'
import { EVote, VOTES } from '@utils/feed/hypothesis'
import { mapVoteTypeFromString } from '@utils/voteColors'
import { DAxioms } from 'shared/types/services'
import { valueOf } from 'shared/utils/tokens'
import { UnwrapVariant } from 'shared/utils/typings'

const HypothesisVote = ({
    choice,
    vote,
    handleVote,
    loading,
    className = '',
}: {
    choice: EVote
    vote: Opt<DAxioms.TernaryVote__1>
    handleVote: (custom?: DAxioms.CustomValue) => void
    loading: boolean
    className?: string
}) => {
    const { colors } = useVoteColors()
    const { Icon, bgColor, name } = VOTES[choice]
    const isCurrentVote = UnwrapVariant(vote?.choice) === choice

    const voteType = mapVoteTypeFromString(choice)
    const customColor = colors[voteType]

    return (
        <CustomVotes
            callback={(custom) => handleVote(custom)}
            onClose={() => {}}
            className={cn(
                choice === EVote.Neutral ? 'col-span-3' : 'col-span-2',
                isCurrentVote && 'col-span-7',
                !!vote && !isCurrentVote && 'hidden'
            )}
        >
            <button
                className={cn(
                    'py-normal text-tiny gap-small flex w-full transform select-none items-center justify-center border border-transparent text-white transition-all duration-300 ease-in-out hover:bg-opacity-80 hover:opacity-75 disabled:pointer-events-none disabled:bg-opacity-50',
                    bgColor,
                    className
                )}
                style={{
                    backgroundColor: customColor,
                    borderColor: customColor,
                }}
                onClick={() => handleVote()}
                disabled={loading}
            >
                {loading ? (
                    <Spinner className="h-5 text-white/50 md:h-6" color="white" />
                ) : (
                    <div className="gap-medium flex items-center">
                        <div className="gap-small flex items-center">
                            <Icon className="h-5 stroke-[1.5px] md:h-6" />
                            <span>{name}</span>
                        </div>
                        {isCurrentVote && (
                            <>
                                <hr className="h-5 w-[2px] bg-white md:h-6" />
                                <div className="gap-small flex items-center">
                                    <span>{valueOf(vote!.value)}</span>
                                    <AcornIcon className="h-5 stroke-[1.5px] md:h-6" />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </button>
        </CustomVotes>
    )
}

export default HypothesisVote
