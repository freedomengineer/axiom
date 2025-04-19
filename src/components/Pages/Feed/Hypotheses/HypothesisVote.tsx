import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import cn from '@libs/class'
import { EVote, VOTES } from '@utils/feed/hypothesis'
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
    handleVote: () => void
    loading: boolean
    className?: string
}) => {
    const { Icon, bgColor, name } = VOTES[choice]
    const isCurrentVote = UnwrapVariant(vote?.choice) === choice

    return (
        <button
            className={cn(
                choice === EVote.Neutral ? 'col-span-3' : 'col-span-2',
                'py-normal text-tiny gap-small flex transform items-center justify-center text-white transition-all duration-300 ease-in-out hover:bg-opacity-80 disabled:pointer-events-none disabled:bg-opacity-50 aria-checked:col-span-7 aria-hidden:hidden',
                bgColor,
                className
            )}
            onClick={() => handleVote()}
            disabled={loading}
            aria-hidden={!!vote && !isCurrentVote}
            aria-checked={!!vote && isCurrentVote}
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
    )
}

export default HypothesisVote
