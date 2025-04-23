'use client'
import { PieChart } from '@mui/x-charts/PieChart'
import { useRef, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import AdoptIcon from '@components/Assets/adopt.svg'
import AtIcon from '@components/Assets/at.svg'
import BookmarkIcon from '@components/Assets/bookmark.svg'
import DateTimeIcon from '@components/Assets/date_time.svg'
import DoneIcon from '@components/Assets/done.svg'
import EditIcon from '@components/Assets/edit.svg'
import EvidenceIcon from '@components/Assets/evidence.svg'
import FieldIcon from '@components/Assets/field.svg'
import FieldMembersIcon from '@components/Assets/field_members.svg'
import FlagIcon from '@components/Assets/flag.svg'
import ShareIcon from '@components/Assets/share.svg'
import Spinner from '@components/Primitives/Spinner'
import Divider from '@components/Shared/Divider'
import InfiniteScrollWrapper, {
    InfiniteScrollWrapperHandle,
} from '@components/Shared/InfiniteScrollWrapper'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import useAuth from '@hooks/useAuth'
import useHypothesisDetails from '@hooks/useHypothesisDetails'
import cn from '@libs/class'
import { formatDate } from '@libs/date'
import { success } from '@libs/toastify'
import { build } from '@libs/url'
import { EVote as EEvidenceVote } from '@utils/feed/evidence'
import { EVote, VOTES } from '@utils/feed/hypothesis'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'
import { Variant } from 'shared/utils/typings'

import EvidencesLayout from './EvidencesLayout'
import HypothesisVote from './HypothesisVote'
import PostEvidence from '../Evidences/PostEvidence'
import RequestFlag from '../Flags/RequestFlag'

const HypothesisDetail = ({ item }: { item: DAxioms.SharableHypothesis }) => {
    const { agent, principal } = useAuth()
    const positiveEvidencesRef = useRef<InfiniteScrollWrapperHandle>(null)
    const negativeEvidencesRef = useRef<InfiniteScrollWrapperHandle>(null)

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
    } = useHypothesisDetails(item)
    const [postEvidenceOpen, setPostEvidenceOpen] = useState<EEvidenceVote | undefined | null>(null)
    const [flagOpen, setFlagOpen] = useState(false)
    const [copied, setCopied] = useState<boolean>()

    const handleCopy = () => {
        navigator.clipboard.writeText(
            build(['feed', localItem.id], { ref: principal?.toText() ?? null }, true)
        )
        setCopied(true)
        success('Copied share link to clipboard')
        setTimeout(() => setCopied(false), 3000)
    }

    const voteKeys = Object.keys(VOTES) as EVote[]
    const regularVotes = localItem.votes.regular.map((vote: bigint, index: number) => ({
        label: voteKeys[index],
        value: Number(vote),
        color: VOTES[voteKeys[index]].hexColor,
    }))
    const poweredVotes = localItem.votes.powered.map((vote: bigint, index: number) => ({
        label: voteKeys[index],
        value: valueOf(vote),
        color: VOTES[voteKeys[index]].hexColor,
    }))
    const someVote = localItem.votes.regular.some((vote) => vote !== 0n)

    return (
        <>
            <Popup
                open={postEvidenceOpen !== null}
                onClose={() => setPostEvidenceOpen(null)}
                title="Post Evidence"
                href={build(['feed', localItem.id, 'evidences', 'post'], {
                    side: postEvidenceOpen,
                })}
                className="w-full md:w-4/5"
                Icon={<EditIcon className="h-6 stroke-[1.5px]" />}
            >
                <PostEvidence
                    id={localItem.id}
                    side={postEvidenceOpen}
                    onSubmit={(side) => {
                        side === EEvidenceVote.Positive
                            ? positiveEvidencesRef.current?.refresh()
                            : negativeEvidencesRef.current?.refresh(),
                            setPostEvidenceOpen(null)
                    }}
                />
            </Popup>
            <Popup
                open={flagOpen}
                onClose={() => setFlagOpen(false)}
                title="Request Flag"
                className="w-full md:w-auto"
                Icon={<FlagIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <RequestFlag
                    header={{ id: localItem.id, category: Variant('Hypothesis') }}
                    onSubmit={() => setFlagOpen(false)}
                />
            </Popup>
            <div className="gap-medium flex h-full w-full flex-col overflow-x-hidden rounded-lg border border-cold-600 border-opacity-50 hover:border-opacity-100">
                <div className="max-h-auto flex min-h-60 flex-col place-items-center items-center bg-hypothesis">
                    <p className="text-medium p-normal my-auto flex h-full items-center whitespace-pre-line break-words text-center font-semibold text-primary-900/80 hover:text-primary-800">
                        {localItem?.content.trim()}
                    </p>
                    <Divider
                        bgColor="bg-cold-800"
                        borderColor="border-cold-800"
                        direction="horizontal"
                        className="text-large h-1 w-4/5 translate-y-0.5"
                    />
                </div>

                <div className="px-medium gap-normal grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
                    <div className="text-tiny gap-small grid grid-cols-7 font-normal text-white">
                        <HypothesisVote
                            choice={EVote.Positive}
                            vote={vote}
                            className="rounded-lg"
                            handleVote={() => handleVote(EVote.Positive)}
                            loading={votesLoading[EVote.Positive]}
                        />
                        <HypothesisVote
                            choice={EVote.Neutral}
                            vote={vote}
                            className="rounded-lg"
                            handleVote={() => handleVote(EVote.Neutral)}
                            loading={votesLoading[EVote.Neutral]}
                        />
                        <HypothesisVote
                            choice={EVote.Negative}
                            vote={vote}
                            className="rounded-lg"
                            handleVote={() => handleVote(EVote.Negative)}
                            loading={votesLoading[EVote.Negative]}
                        />
                    </div>
                    <button
                        onClick={() => setPostEvidenceOpen(undefined)}
                        className="py-normal text-tiny gap-small flex items-center justify-center rounded-lg border border-cold-700 bg-white font-normal text-cold-700 hover:bg-cold-100"
                    >
                        <EditIcon className="h-5 stroke-[1.5px] md:h-6" />
                        <span>POST EVIDENCE</span>
                    </button>
                </div>

                {someVote && (
                    <div className="gap-medium flex h-[80px] place-items-center items-center justify-between overflow-hidden md:h-[95px] xl:h-[110px]">
                        <PieChart
                            series={[{ data: regularVotes, innerRadius: 43, outerRadius: 53 }]}
                            width={200}
                            height={150}
                            slotProps={{ legend: { hidden: true } }}
                            className="translate-x-4 overflow-hidden"
                        />
                        <div className="gap-small flex flex-col">
                            <div className="text-tiny gap-normal flex w-min justify-center text-nowrap font-light">
                                <div className="text-tiny grid grid-rows-3 place-items-end items-end text-nowrap font-normal">
                                    {Object.values(VOTES).map(({ textColor }, index) => (
                                        <p
                                            className={`${textColor} gap-small flex h-5 items-center md:h-6 xl:h-7`}
                                            key={index}
                                        >
                                            <span className="hidden md:block">
                                                (
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
                                            <span className="text-small font-medium">
                                                {regularVotes[index].value}
                                            </span>
                                            <FieldMembersIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                        </p>
                                    ))}
                                </div>
                                <div className="flex flex-col justify-center">
                                    {Object.values(VOTES).map(({ bgColor, textColor }, index) => (
                                        <div
                                            className={`${textColor} gap-small flex h-5 items-center md:h-6 xl:h-7`}
                                            key={index}
                                        >
                                            <div
                                                className={cn(
                                                    `${bgColor} ${textColor} h-4 w-7 rounded-full`
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col place-items-start items-start">
                                    {Object.values(VOTES).map(({ textColor }, index) => (
                                        <p
                                            className={`${textColor} gap-small flex h-5 items-center md:h-6 xl:h-7`}
                                            key={index}
                                        >
                                            <AcornIcon className="h-5 w-5 -translate-y-[2px] stroke-2 md:h-6 md:w-6" />
                                            <span className="text-small font-medium">
                                                {poweredVotes[index].value}
                                            </span>
                                            <span className="hidden md:block">
                                                (
                                                {parseFloat(
                                                    (
                                                        (poweredVotes[index].value /
                                                            poweredVotes.reduce(
                                                                (a, b) => a + b.value,
                                                                0
                                                            )) *
                                                        100
                                                    ).toString()
                                                ).toFixed(0)}
                                                %)
                                            </span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <PieChart
                            series={[{ data: poweredVotes, innerRadius: 43, outerRadius: 53 }]}
                            width={200}
                            height={150}
                            slotProps={{ legend: { hidden: true } }}
                            className="translate-x-[40px] md:translate-x-[60px] xl:translate-x-[80px]"
                        />
                    </div>
                )}
                <div className="px-medium py-small gap-tiny grid w-full grid-cols-2 grid-rows-2 bg-cold-900 text-white md:flex">
                    <Link
                        className="gap-small order-1 flex items-center hover:opacity-75"
                        href={build(['feed', 'fields', localItem.fieldId])}
                    >
                        <FieldIcon className="h-5 w-5 stroke-[1.5px]" />
                        <span className="text-small md:mr-medium text-nowrap font-light text-white">
                            {localItem.fieldId}
                        </span>
                    </Link>
                    <Link
                        className="gap-small order-3 flex items-center hover:opacity-75 md:order-2"
                        href={build(['profile', localItem.publisher.toText()])}
                    >
                        <AtIcon className="h-5 w-5 stroke-[1.5px]" />
                        <span className="text-small md:mr-medium text-nowrap font-light text-white">
                            {publisher}
                        </span>
                    </Link>
                    <div className="gap-small order-2 ml-auto flex items-center md:order-3 md:ml-0">
                        <DateTimeIcon className="h-5 w-5 stroke-[1.5px]" />
                        <span className="text-small md:mr-medium text-nowrap font-light text-white">
                            {formatDate({ nano: localItem.publishDate })}
                        </span>
                    </div>
                    <div className="hidden w-full md:order-4 md:block" />
                    <div className="order-4 ml-auto grid h-6 w-32 flex-shrink-0 grid-cols-4 place-items-center items-center md:order-5 md:ml-0 md:w-40">
                        <div className="w-8 md:w-10">
                            {axiomLoading ? (
                                <Spinner
                                    className="mx-auto h-5 w-5 stroke-[1.5px] text-white/50"
                                    color="white"
                                />
                            ) : (
                                <AdoptIcon
                                    className="mx-auto h-5 w-5 cursor-pointer stroke-[1.5px] hover:h-6 hover:w-6 hover:fill-white hover:text-cold-900 aria-selected:h-6 aria-selected:w-6 aria-selected:fill-white aria-selected:text-cold-900 aria-selected:hover:h-5 aria-selected:hover:w-5 aria-selected:hover:fill-none aria-selected:hover:text-white"
                                    onClick={handleAxiom}
                                    aria-selected={!!axiom}
                                />
                            )}
                        </div>
                        <div className="w-8 md:w-10">
                            {bookmarkLoading ? (
                                <Spinner
                                    className="mx-auto h-5 w-5 stroke-[1.5px] text-white/50"
                                    color="white"
                                />
                            ) : (
                                <BookmarkIcon
                                    className="mx-auto h-5 w-5 cursor-pointer stroke-[1.5px] hover:h-6 hover:w-6 hover:fill-white hover:text-cold-900 aria-selected:h-6 aria-selected:w-6 aria-selected:fill-white aria-selected:text-cold-900 aria-selected:hover:h-5 aria-selected:hover:w-5 aria-selected:hover:fill-none aria-selected:hover:text-white"
                                    onClick={handleBookmark}
                                    aria-selected={!!bookmark}
                                />
                            )}
                        </div>
                        <button
                            className="w-8 hover:opacity-75 md:w-10"
                            onClick={() => setFlagOpen(true)}
                        >
                            <FlagIcon className="mx-auto h-5 w-5 stroke-[1.5px]" />
                        </button>
                        <button
                            className="w-8 hover:opacity-75 disabled:pointer-events-none md:w-10"
                            onClick={handleCopy}
                            disabled={copied}
                        >
                            {copied ? (
                                <DoneIcon className="mx-auto h-5 w-5 stroke-[1.5px]" />
                            ) : (
                                <ShareIcon className="mx-auto h-5 w-5 stroke-[1.5px]" />
                            )}
                        </button>
                    </div>
                </div>
                <div className="gap-medium flex h-full w-full flex-col items-center">
                    <div className="text-tiny gap-normal px-medium grid w-full grid-cols-7 items-center font-normal text-white md:w-2/3">
                        {Object.entries(VOTES).map(
                            ([name, { bgColor, borderColor, textColor, Icon }], index) =>
                                index === 1 ? (
                                    <div
                                        key={index}
                                        className={cn(
                                            'py-normal text-tiny gap-small col-span-3 flex w-full items-center justify-center rounded-lg border',
                                            borderColor,
                                            textColor
                                        )}
                                    >
                                        <EvidenceIcon className="h-5 stroke-[1.5px] md:h-6" />
                                        <span>THE EVIDENCE ({localItem.evidenceIds.length})</span>
                                    </div>
                                ) : (
                                    <button
                                        key={index}
                                        className={cn(
                                            'py-normal text-tiny gap-small col-span-2 flex w-full items-center justify-center rounded-lg border transition-all duration-300 ease-in-out hover:bg-opacity-80',
                                            bgColor
                                        )}
                                        onClick={() => setPostEvidenceOpen(name as EEvidenceVote)}
                                    >
                                        <div className="gap-small flex items-center">
                                            <Icon className="h-5 stroke-[1.5px] md:h-6" />
                                            <span>{VOTES[voteKeys[index]].name}</span>
                                        </div>
                                    </button>
                                )
                        )}
                    </div>
                    <div className="px-normal mb-normal gap-normal flex w-full items-stretch justify-between">
                        <div className="gap-normal flex w-1/2 flex-col items-center">
                            <InfiniteScrollWrapper<DAxioms.SharableEvidence>
                                ref={positiveEvidencesRef}
                                query={Axioms.call(agent, true).getEvidencesPagination}
                                name="evidence"
                                hardFilter={{ onSide: 'Positive', publishedIn: localItem.id }}
                                hardSort={{ sortBy: 'positivity', order: 'descending' }}
                                size={2n}
                                LayoutComponent={EvidencesLayout}
                                className="h-full w-full"
                            />
                        </div>
                        <Divider
                            direction="vertical"
                            bgColor="bg-cold-800"
                            borderColor="border-cold-800"
                        />
                        <div className="gap-normal flex w-1/2 flex-col items-center">
                            <InfiniteScrollWrapper<DAxioms.SharableEvidence>
                                ref={negativeEvidencesRef}
                                query={Axioms.call(agent, true).getEvidencesPagination}
                                name="evidence"
                                hardFilter={{ onSide: 'Negative', publishedIn: localItem.id }}
                                hardSort={{ sortBy: 'positivity', order: 'descending' }}
                                size={2n}
                                LayoutComponent={EvidencesLayout}
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HypothesisDetail
