import { Principal } from '@dfinity/principal'
import { useEffect, useState } from 'react'

import BookmarkIcon from '@components/Assets/bookmark.svg'
import DownIcon from '@components/Assets/down.svg'
import UpIcon from '@components/Assets/up.svg'
import Link from '@components/Shared/Link'
import { SortDirection, SortType } from '@components/Shared/TableWrapper'
import useAuth from '@hooks/useAuth'
import useUsername from '@hooks/useUsername'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'
import { DAxioms } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { Axioms } from 'shared/utils/services'

const Username = ({ principal }: { principal: Principal }) => {
    const username = useUsername(principal)
    return <>{username}</>
}

const COMPARE = [
    (a: DAxioms.SharableHypothesis, b: DAxioms.SharableHypothesis) =>
        a.id.toString().localeCompare(b.id.toString()),
    (a: DAxioms.SharableHypothesis, b: DAxioms.SharableHypothesis) =>
        a.publisher.toText().localeCompare(b.publisher.toText()),
    (a: DAxioms.SharableHypothesis, b: DAxioms.SharableHypothesis) =>
        a.content.localeCompare(b.content),
    (a: DAxioms.SharableHypothesis, b: DAxioms.SharableHypothesis) =>
        Number(a.votes.regular[0] + a.votes.regular[1] + a.votes.regular[2]) -
        Number(b.votes.regular[0] + b.votes.regular[1] + b.votes.regular[2]),
    (a: DAxioms.SharableHypothesis, b: DAxioms.SharableHypothesis) =>
        Number(a.votes.powered[0] + a.votes.powered[1] + a.votes.powered[2]) -
        Number(b.votes.powered[0] + b.votes.powered[1] + b.votes.powered[2]),
    (a: DAxioms.SharableHypothesis, b: DAxioms.SharableHypothesis) =>
        a.evidenceIds.length - b.evidenceIds.length,
]

const MyBookmarksLayout = () => {
    const { agent, principal } = useAuth()

    const [hypotheses, setHypotheses] = useState<DAxioms.SharableHypothesis[]>()
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
    const [sortType, setSortType] = useState<SortType>({
        column: 0,
        direction: SortDirection.DESC,
    })

    useEffect(() => {
        Axioms.call()
            .getHypotheses(
                parseFilterFromObj('hypothesis', { bookmarksFrom: principal!.toText() }),
                parseSortFromObj('hypothesis', { by: 'recent', order: 'descending' })
            )
            .then(setHypotheses)
    }, [])

    const handleBookmark = async (id: bigint) => {
        const idStr = id.toString()
        setLoading((prev) => ({ ...prev, [idStr]: true }))
        await promise(
            Axioms.call(agent).removeFromBookmarks(id),
            'Removing from Bookmarks',
            'Hypothesis removed from Bookmarks!'
        )
        setHypotheses((prev) => prev!.filter((hypothesis) => hypothesis.id !== id))
        setLoading((prev) => ({ ...prev, [idStr]: false }))
    }

    const handleSort = (column: number) => {
        const direction = sortType.column === column ? sortType.direction ^ 1 : SortDirection.ASC
        setSortType({ column, direction })
        switch (direction) {
            case SortDirection.ASC:
                setHypotheses((prev) => prev?.sort((a, b) => COMPARE[column](a, b)))
                break
            case SortDirection.DESC:
                setHypotheses((prev) => prev?.sort((a, b) => COMPARE[column](b, a)))
                break
        }
    }

    if (!hypotheses) return null

    if (hypotheses.length === 0)
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <p className="text-normal font-medium text-cold-700">No Bookmarks Found</p>
                <p className="text-small font-light text-cold-700">
                    You can save a hypothesis here by clicking the bookmark icon on the hypothesis.
                </p>
            </div>
        )

    return (
        <div className="">
            <div className="w-full overflow-x-auto rounded-lg border border-cold-300 md:overflow-hidden">
                <table className="min-w-full border-collapse">
                    <thead className="bg-cold-50">
                        <tr>
                            {[
                                'ID',
                                'Publisher',
                                'Content',
                                'Regular Votes',
                                'Powered Votes',
                                'Evidence',
                                'Action',
                            ].map((title, i) => (
                                <th
                                    key={i}
                                    scope="col"
                                    className={cn(
                                        'text-small px-normal py-small cursor-pointer select-none text-nowrap bg-cold-100 hover:bg-cold-700/20 aria-disabled:pointer-events-none aria-disabled:cursor-default',
                                        'border-b border-r border-cold-300',
                                        i === 0 && 'border-l-0',
                                        i === 6 && 'border-r-0'
                                    )}
                                    onClick={() => i !== 6 && handleSort(i)}
                                    aria-disabled={i === 6}
                                >
                                    <div className="gap-small flex w-full items-center justify-between font-semibold text-cold-700">
                                        <span
                                            className={cn(
                                                sortType.column === i
                                                    ? 'font-bold text-primary-700'
                                                    : 'font-semibold  text-cold-700'
                                            )}
                                        >
                                            {title}
                                        </span>
                                        {i !== 6 && (
                                            <div className="gap-tiny grid grid-rows-2">
                                                <UpIcon
                                                    className={cn(
                                                        'h-auto w-[10px] stroke-2 md:w-[12px]',
                                                        sortType.column === i &&
                                                            sortType.direction === SortDirection.ASC
                                                            ? 'text-primary-700'
                                                            : 'text-cold-700 opacity-25'
                                                    )}
                                                />
                                                <DownIcon
                                                    className={cn(
                                                        'h-auto w-[10px] stroke-2 md:w-[12px]',
                                                        sortType.column === i &&
                                                            sortType.direction ===
                                                                SortDirection.DESC
                                                            ? 'text-primary-700'
                                                            : 'text-cold-700 opacity-25'
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cold-200 bg-white text-left">
                        {hypotheses?.map((hypothesis, i) => {
                            const isLastRow = i === hypotheses.length - 1

                            return (
                                <tr key={i} className="group hover:bg-cold-50">
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                            'border-b border-r border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        <Link
                                            href={`/feed/${hypothesis.id}`}
                                            color="cold-600"
                                            className="pre-underline !text-tiny group z-10 w-full justify-start !font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                            icon="forward"
                                            size="small"
                                            openInNewTab
                                        >
                                            {hypothesis.id}
                                        </Link>
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                            'border-b border-r border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        <Link
                                            href={`/profile/${hypothesis.publisher.toText()}`}
                                            color="cold-600"
                                            className="pre-underline !text-tiny group z-10 w-full justify-start !font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                            icon="forward"
                                            size="small"
                                            openInNewTab
                                        >
                                            <Username principal={hypothesis.publisher} />
                                        </Link>
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-cold-600',
                                            'border-b border-r border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        <span className="p-truncate-3">{hypothesis.content}</span>
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                            'border-b border-r border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        {hypothesis.votes.regular[0] +
                                            hypothesis.votes.regular[1] +
                                            hypothesis.votes.regular[2]}
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                            'border-b border-r border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        {e8s.toString(
                                            hypothesis.votes.powered[0] +
                                                hypothesis.votes.powered[1] +
                                                hypothesis.votes.powered[2]
                                        )}
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                            'border-b border-r border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        {hypothesis.evidenceIds.length}
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                            'border-b border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        <button
                                            onClick={() => handleBookmark(hypothesis.id)}
                                            className="flex h-full w-full items-center justify-center disabled:opacity-25"
                                            disabled={loading[hypothesis.id.toString()]}
                                        >
                                            <BookmarkIcon
                                                className={cn(
                                                    'h-6 w-6 text-cold-800 md:h-7 md:w-7',
                                                    'fill-primary-400 text-primary-800'
                                                )}
                                            />
                                        </button>
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

export default MyBookmarksLayout
