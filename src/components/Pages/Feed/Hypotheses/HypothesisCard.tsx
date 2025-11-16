'use client'

import { PieChart } from '@mui/x-charts/PieChart'
import { useState } from 'react'

import AdoptIcon from '@components/Assets/adopt.svg'
import BookmarkIcon from '@components/Assets/bookmark.svg'
import DateTimeIcon from '@components/Assets/date_time.svg'
import DoneIcon from '@components/Assets/done.svg'
import EvidenceIcon from '@components/Assets/evidence.svg'
import FieldIcon from '@components/Assets/field.svg'
import FlagIcon from '@components/Assets/flag.svg'
import HypothesisIcon from '@components/Assets/hypothesis.svg'
import ShareIcon from '@components/Assets/share.svg'
import Spinner from '@components/Primitives/Spinner'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import { Symbol } from '@components/Shared/Username'
import useAuth from '@hooks/useAuth'
import useHypothesisDetails from '@hooks/useHypothesisDetails'
import useVoteColors from '@hooks/useVoteColors'
import cn from '@libs/class'
import { formatDate } from '@libs/date'
import { success } from '@libs/toastify'
import { build } from '@libs/url'
import { EVote, VOTES } from '@utils/feed/hypothesis'
import { DAxioms } from 'shared/types/services'
import { Variant } from 'shared/utils/typings'

import HypothesisDetail from './HypothesisDetail'
import HypothesisVote from './HypothesisVote'
import RequestFlag from '../Flags/RequestFlag'

enum EPopup {
    RequestFlag,
    HypothesisDetail,
    HypothesisEvidence,
}

const HypothesisCard = ({
    item,
    className,
}: {
    item: DAxioms.SharableHypothesis
    className?: string
}) => {
    const { principal } = useAuth()
    const { colors } = useVoteColors()
    const {
        publisher,
        localItem,
        vote,
        axiom,
        bookmark,
        votesLoading,
        axiomLoading,
        bookmarkLoading,
        handleVote,
        handleAxiom,
        handleBookmark,
        setLocalItem,
    } = useHypothesisDetails(item)
    const [open, setOpen] = useState<EPopup>()
    const [copied, setCopied] = useState<boolean>()

    const handleCopy = () => {
        navigator.clipboard.writeText(
            build(['feed', item.id], { ref: principal?.toText() ?? null }, true)
        )
        setCopied(true)
        success('Copied share link to clipboard')
        setTimeout(() => setCopied(false), 3000)
    }

    const voteKeys = Object.keys(VOTES) as EVote[]
    const regularVotes = localItem.votes.regular.map((vote: bigint, index: number) => {
        const voteKey = voteKeys[index]

        const customColor =
            voteKey === EVote.Positive
                ? colors.positive
                : voteKey === EVote.Neutral
                  ? colors.neutral
                  : voteKey === EVote.Negative
                    ? colors.negative
                    : VOTES[voteKey].hexColor

        return {
            label: voteKey,
            value: Number(vote),
            color: customColor,
        }
    })
    const someVote = localItem.votes.regular.some((vote) => vote !== 0n)

    return (
        <div
            className={cn(
                'flex w-full flex-col rounded-lg border border-cold-600 border-opacity-50 hover:border-opacity-100 md:w-[350px]',
                className
            )}
        >
            <Popup
                open={open === EPopup.RequestFlag}
                onClose={() => setOpen(undefined)}
                title="Request Flag"
                className="w-full md:w-auto"
                Icon={<FlagIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <RequestFlag
                    header={{ id: item.id, category: Variant('Hypothesis') }}
                    onSubmit={() => setOpen(undefined)}
                />
            </Popup>

            <Popup
                open={open === EPopup.HypothesisEvidence}
                onClose={() => setOpen(undefined)}
                title={`Hypothesis ${item.id}`}
                className="w-full md:w-4/5"
                secondaryClassname="p-0"
                href={build(['feed', item.id])}
                Icon={<HypothesisIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <HypothesisDetail item={localItem} setLocalItem={setLocalItem} hideHypothesis />
            </Popup>

            <Popup
                open={open === EPopup.HypothesisDetail}
                onClose={() => setOpen(undefined)}
                title={`Hypothesis ${item.id}`}
                className="w-full md:w-4/5"
                secondaryClassname="p-0"
                href={build(['feed', item.id])}
                Icon={<HypothesisIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <HypothesisDetail item={localItem} setLocalItem={setLocalItem} hideEvidences />
            </Popup>

            <button
                className="gap-medium group relative flex h-[110px] place-items-center items-center bg-hypothesis md:h-[125px] xl:h-[140px]"
                title={localItem.content.trim()}
                onClick={() => setOpen(EPopup.HypothesisDetail)}
            >
                <div className="absolute h-full w-full bg-black opacity-0 group-hover:opacity-10" />
                <p className="text-medium p-truncate-4 p-tiny my-auto h-min max-h-full w-full -translate-y-1 whitespace-pre-line break-words text-center font-semibold text-primary-900/85 md:translate-y-0">
                    {localItem.content.trim()}
                </p>
            </button>
            <div className="text-tiny grid grid-cols-7 font-normal text-white">
                <HypothesisVote
                    choice={EVote.Positive}
                    vote={vote}
                    handleVote={(custom) => handleVote(EVote.Positive, custom)}
                    loading={votesLoading[EVote.Positive]}
                />
                <HypothesisVote
                    choice={EVote.Neutral}
                    vote={vote}
                    handleVote={(custom) => handleVote(EVote.Neutral, custom)}
                    loading={votesLoading[EVote.Neutral]}
                />
                <HypothesisVote
                    choice={EVote.Negative}
                    vote={vote}
                    handleVote={(custom) => handleVote(EVote.Negative, custom)}
                    loading={votesLoading[EVote.Negative]}
                />
            </div>
            {someVote && (
                <div className="gap-medium flex h-[85px] place-items-center items-center justify-between overflow-hidden md:h-[90px]">
                    <PieChart
                        series={[{ data: regularVotes, innerRadius: 34, outerRadius: 40 }]}
                        width={175}
                        height={125}
                        slotProps={{ legend: { hidden: true } }}
                        className="translate-x-20"
                    />
                    <div className="flex w-1/2 -translate-y-1 flex-col">
                        <p className="text-normal text-cold-800">Members</p>
                        <div className="text-tiny gap-tiny grid grid-rows-3 text-nowrap font-normal">
                            {Object.entries(VOTES).map(([key, { bgColor, textColor }], index) => {
                                const voteType =
                                    key === 'Positive'
                                        ? 'positive'
                                        : key === 'Neutral'
                                          ? 'neutral'
                                          : key === 'Negative'
                                            ? 'negative'
                                            : 'delegated'
                                const customColor = colors[voteType as keyof typeof colors]

                                return (
                                    <div
                                        key={key}
                                        className="gap-small flex h-3 items-center justify-start"
                                        style={{ color: customColor }}
                                    >
                                        <div
                                            className="mr-tiny h-2.5 w-5 rounded-full md:h-3"
                                            style={{ backgroundColor: customColor }}
                                        />
                                        <span>
                                            {regularVotes[index].value} (
                                            {parseFloat(
                                                (
                                                    (regularVotes[index].value /
                                                        regularVotes.reduce(
                                                            (a, b) => a + b.value,
                                                            0
                                                        )) *
                                                    100
                                                ).toString()
                                            ).toFixed(0)}
                                            %)
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
            <div className="px-small py-tiny mt-auto flex flex-col rounded-b-lg bg-cold-900">
                <div className="grid grid-cols-7 grid-rows-3 place-items-center items-center text-white">
                    <Link
                        className="!gap-small col-span-4 mr-auto flex h-5 items-center text-left hover:opacity-75"
                        href={build(['feed', 'fields', item.fieldId])}
                    >
                        <FieldIcon className="h-4 w-4 stroke-[1.5px]" />
                        <span className="text-tiny truncate font-light text-white">
                            {item.fieldId}
                        </span>
                    </Link>
                    <button
                        className="!text-extratiny !gap-small col-span-3 row-span-2 flex h-4/5 w-full items-center justify-center rounded-lg bg-white font-normal text-cold-700 hover:bg-cold-100"
                        onClick={() => setOpen(EPopup.HypothesisEvidence)}
                    >
                        <EvidenceIcon className="h-4 w-4 stroke-[2px]" />
                        VIEW EVIDENCE ({localItem.evidenceIds.length})
                    </button>
                    <Link
                        className="!gap-small col-span-4 row-start-2 mr-auto flex h-5 items-center text-left hover:opacity-75"
                        href={build(['profile', item.publisher.toText()])}
                    >
                        <Symbol
                            capitalRaised={publisher.capitalRaised.toString()}
                            className="mr-0 h-4 w-4"
                        />
                        <span className="text-tiny truncate font-light text-white">
                            {publisher.username}
                        </span>
                    </Link>
                    <div className="!gap-small col-span-4 row-start-3 mr-auto flex h-5 items-center text-left">
                        <DateTimeIcon className="h-4 w-4 stroke-[1.5px]" />
                        <span className="text-tiny truncate font-light text-white">
                            {formatDate({ nano: item.publishDate }, true)}
                        </span>
                    </div>
                    <div className="col-span-3 row-start-3 grid h-full w-full grid-cols-4 place-items-center items-center">
                        {axiomLoading ? (
                            <Spinner className="h-4 stroke-[1.5px] text-white/50" color="white" />
                        ) : (
                            <AdoptIcon
                                className="h-4 w-4 cursor-pointer stroke-[1.5px] hover:h-5 hover:w-5 hover:fill-white hover:text-cold-900 aria-selected:h-5 aria-selected:w-5 aria-selected:fill-white aria-selected:text-cold-900 aria-selected:hover:h-4 aria-selected:hover:w-4 aria-selected:hover:fill-none aria-selected:hover:text-white"
                                onClick={() => handleAxiom()}
                                aria-selected={!!axiom}
                            />
                        )}
                        {bookmarkLoading ? (
                            <Spinner
                                className="h-4 w-4 stroke-[1.5px] text-white/50"
                                color="white"
                            />
                        ) : (
                            <BookmarkIcon
                                className="h-4 w-4 cursor-pointer stroke-[1.5px] hover:h-5 hover:w-5 hover:fill-white hover:text-cold-900 aria-selected:h-5 aria-selected:w-5 aria-selected:fill-white aria-selected:text-cold-900 aria-selected:hover:h-4 aria-selected:hover:w-4 aria-selected:hover:fill-none aria-selected:hover:text-white"
                                onClick={() => handleBookmark()}
                                aria-selected={!!bookmark}
                            />
                        )}
                        <button
                            className="hover:opacity-75 disabled:pointer-events-none"
                            onClick={() => setOpen(EPopup.RequestFlag)}
                        >
                            <FlagIcon className="h-4 w-4 stroke-[1.5px]" />
                        </button>
                        <button
                            className="hover:opacity-75 disabled:pointer-events-none"
                            onClick={handleCopy}
                            disabled={copied}
                        >
                            {copied ? (
                                <DoneIcon className="h-4 w-4 stroke-[1.5px]" />
                            ) : (
                                <ShareIcon className="h-4 w-4 stroke-[1.5px]" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HypothesisCard
