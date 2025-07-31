import Spinner from '@components/Primitives/Spinner'
import CustomVotes from '@components/Shared/CustomVotes'
import cn from '@libs/class'
import { EVote, VOTES } from '@utils/feed/evidence'
import { DAxioms } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

const EvidenceVote = ({
    choice,
    vote,
    handleVote,
    loading,
    className = '',
}: {
    choice: EVote
    vote: Opt<DAxioms.BinaryVote__1>
    handleVote: (custom?: DAxioms.CustomValue) => void
    loading: boolean
    className?: string
}) => {
    const { Icon, fillColor } = VOTES[choice]
    const isCurrentVote = UnwrapVariant(vote?.choice) === choice

    return (
        <CustomVotes
            callback={(custom) => handleVote(custom)}
            onClose={() => {}}
            className={className}
        >
            <button
                className={className}
                onClick={() => handleVote()}
                disabled={loading}
                aria-hidden={!!vote && !isCurrentVote}
                aria-selected={!!vote && isCurrentVote}
            >
                {loading ? (
                    <Spinner className="h-3.5 w-3.5 text-white/50 md:h-4 md:w-4" color="white" />
                ) : (
                    <div className="gap-medium flex items-center hover:opacity-75">
                        <Icon
                            className={cn(
                                'h-3.5 w-3.5 stroke-[2px] md:h-4 md:w-4',
                                isCurrentVote && fillColor
                            )}
                        />
                    </div>
                )}
            </button>
        </CustomVotes>
    )
}

export default EvidenceVote
