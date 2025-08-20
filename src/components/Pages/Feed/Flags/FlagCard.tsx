import Spinner from '@components/Primitives/Spinner'
import Link from '@components/Shared/Link'
import useConfigs from '@hooks/useConfigs'
import useFlagDetails from '@hooks/useFlagDetails'
import cn from '@libs/class'
import { formatDate } from '@libs/date'
import { build } from '@libs/url'
import { EVote } from '@utils/feed/evidence'
import { DAxioms } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import proportion from 'shared/utils/proportion'
import { UnwrapVariant } from 'shared/utils/typings'

const FlagCard = ({ item, className }: { item: DAxioms.SharableFlag; className?: string }) => {
    const configs = useConfigs('Axioms')
    const { requester, localItem, handleVote, votesLoading, vote } = useFlagDetails(item)

    const threshold = (configs?.['FLAG_REQUEST_ACCEPTANCE_THRESHOLD'][1] as bigint) ?? 1n

    return (
        <div
            className={cn(
                'gap-semilarge flex w-full flex-col items-center md:w-[700px]',
                className
            )}
        >
            <div className="w-full overflow-x-auto rounded-lg border border-cold-200 md:overflow-hidden">
                <table className="min-w-full border-collapse">
                    <tbody>
                        {[
                            ['ID', `${UnwrapVariant(localItem.category)} ${localItem.id}`],
                            ['Requester', requester],
                            [
                                'Requested Date',
                                `${formatDate({ nano: localItem.requestDate })} (${formatDate({ nano: localItem.requestDate }, true)})`,
                            ],
                            ['Reason', localItem.reason],
                            ['Status', UnwrapVariant(localItem.status)],
                            [
                                'Acceptance',
                                `${proportion.toFloat([localItem.votes.powered[0], threshold]) > 1 ? '100%' : proportion.toString([localItem.votes.powered[0], threshold])} (${e8s.toString(localItem.votes.powered[0])}/${e8s.toString(threshold)})`,
                                EVote.Positive,
                            ],
                            [
                                'Rejection',
                                `${proportion.toFloat([localItem.votes.powered[1], threshold]) > 1 ? '100%' : proportion.toString([localItem.votes.powered[1], threshold])} (${e8s.toString(localItem.votes.powered[1])}/${e8s.toString(threshold)})`,
                                EVote.Negative,
                            ],
                        ].map(([key, value, voteVariant], index) => {
                            const isLastRow = index === 6
                            return (
                                <tr key={index} className="group hover:bg-cold-50">
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                            'border-b border-r border-cold-200',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        {key}
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal w-full font-semibold text-cold-600',
                                            'border-b border-cold-200',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        {index === 0 ? (
                                            <Link
                                                openInNewTab
                                                href={build([
                                                    'feed',
                                                    `${UnwrapVariant(localItem.category) === 'Evidence' ? 'evidences/' : ''}${
                                                        localItem.id
                                                    }`,
                                                ])}
                                                color="cold-600"
                                                className="pre-underline !text-tiny group z-10 w-full justify-start font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                                icon="forward"
                                                size="small"
                                            >
                                                {value as string}
                                            </Link>
                                        ) : index === 1 ? (
                                            <Link
                                                openInNewTab
                                                href={build([
                                                    'profile',
                                                    localItem.requester.toText(),
                                                ])}
                                                color="cold-600"
                                                className="pre-underline !text-tiny group z-10 w-full justify-start font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                                icon="forward"
                                                size="small"
                                            >
                                                {value as string}
                                            </Link>
                                        ) : (
                                            <>
                                                {voteVariant ? (
                                                    <button
                                                        className="flex w-full justify-between disabled:pointer-events-none disabled:bg-cold-200"
                                                        onClick={() =>
                                                            handleVote(voteVariant as EVote)
                                                        }
                                                        disabled={
                                                            votesLoading[voteVariant as EVote]
                                                        }
                                                    >
                                                        {value}
                                                        <span className="text-tiny text-cold-400">
                                                            {votesLoading[voteVariant as EVote] ? (
                                                                <Spinner className="h-4 w-4 md:h-5 md:w-5" />
                                                            ) : vote &&
                                                              UnwrapVariant(vote.choice) ===
                                                                  voteVariant ? (
                                                                <>
                                                                    current vote:{' '}
                                                                    {e8s.toString(vote.value)}
                                                                </>
                                                            ) : (
                                                                <>Click to vote</>
                                                            )}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    value
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default FlagCard
