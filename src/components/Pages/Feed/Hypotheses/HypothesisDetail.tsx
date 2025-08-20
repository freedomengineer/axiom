'use client'
import { PieChart } from '@mui/x-charts/PieChart'
import { useEffect, useMemo, useRef, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import AdoptIcon from '@components/Assets/adopt.svg'
import BookmarkIcon from '@components/Assets/bookmark.svg'
import DateTimeIcon from '@components/Assets/date_time.svg'
import DoneIcon from '@components/Assets/done.svg'
import EditIcon from '@components/Assets/edit.svg'
import EvidenceIcon from '@components/Assets/evidence.svg'
import FieldIcon from '@components/Assets/field.svg'
import FieldMembersIcon from '@components/Assets/field_members.svg'
import FlagIcon from '@components/Assets/flag.svg'
import HypothesisIcon from '@components/Assets/hypothesis.svg'
import LoginStep1Icon from '@components/Assets/login_step1.svg'
import ShareIcon from '@components/Assets/share.svg'
import Spinner from '@components/Primitives/Spinner'
import Divider from '@components/Shared/Divider'
import InfiniteScrollWrapper, {
    InfiniteScrollWrapperHandle,
} from '@components/Shared/InfiniteScrollWrapper'
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
import { EVote as EEvidenceVote } from '@utils/feed/evidence'
import { EVote, VOTES } from '@utils/feed/hypothesis'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'
import { Variant } from 'shared/utils/typings'

import EvidencesLayout from './EvidencesLayout'
import HypothesisVote from './HypothesisVote'
import PostHypothesis from './PostHypothesis'
import PostEvidence from '../Evidences/PostEvidence'
import RequestFlag from '../Flags/RequestFlag'

enum EPopup {
    RequestFlag,
    EditHypothesis,
}

const HypothesisDetail = ({
    item,
    setLocalItem,
    hideEvidences,
    hideHypothesis,
}: {
    item: DAxioms.SharableHypothesis
    hideEvidences?: boolean
    hideHypothesis?: boolean
    setLocalItem: (item: DAxioms.SharableHypothesis) => void
}) => {
    const { agent, principal } = useAuth()
    const { colors } = useVoteColors()
    const positiveEvidencesRef = useRef<InfiniteScrollWrapperHandle>(null)
    const negativeEvidencesRef = useRef<InfiniteScrollWrapperHandle>(null)
    const evidenceContainerRef = useRef<HTMLDivElement>(null)
    const headerSliderRef = useRef<HTMLDivElement>(null)
    const sliderRef = useRef<HTMLDivElement>(null)
    const [activeSide, setActiveSide] = useState<EEvidenceVote>(EEvidenceVote.Positive)
    const [isMobile, setIsMobile] = useState(false)
    const [tempHideEvidences, setTempHideEvidences] = useState(hideEvidences)
    const [tempHideHypothesis, setTempHideHypothesis] = useState(hideHypothesis)
    const touchStartRef = useRef<number | null>(null)

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
        handleRefresh,
    } = useHypothesisDetails(item)
    const [postEvidenceOpen, setPostEvidenceOpen] = useState<
        EEvidenceVote | bigint | undefined | null
    >(null)
    const [open, setOpen] = useState<EPopup | null>(null)
    const [copied, setCopied] = useState<boolean>()

    const handleCopy = () => {
        navigator.clipboard.writeText(
            build(['feed', localItem.id], { ref: principal?.toText() ?? null }, true)
        )
        setCopied(true)
        success('Copied share link to clipboard')
        setTimeout(() => setCopied(false), 3000)
    }

    const positiveFilter = useMemo(() => ({ side: 'Positive', hypothesis: item.id.toString() }), [])
    const negativeFilter = useMemo(() => ({ side: 'Negative', hypothesis: item.id.toString() }), [])
    const commonSort = useMemo(() => ({ by: 'popularity', order: 'descending' }), [])

    const voteKeys = Object.keys(VOTES) as EVote[]
    const regularVotes = localItem.votes.regular.map((vote: bigint, index: number) => {
        const voteType =
            index === 0
                ? 'positive'
                : index === 1
                  ? 'neutral'
                  : index === 2
                    ? 'negative'
                    : 'delegated'
        const customColor = colors[voteType as keyof typeof colors]

        return {
            label: voteKeys[index],
            value: Number(vote),
            color: customColor,
        }
    })
    const poweredVotes = localItem.votes.powered.map((vote: bigint, index: number) => {
        const voteType =
            index === 0
                ? 'positive'
                : index === 1
                  ? 'neutral'
                  : index === 2
                    ? 'negative'
                    : 'delegated'
        const customColor = colors[voteType as keyof typeof colors]

        return {
            label: voteKeys[index],
            value: valueOf(vote),
            color: customColor,
        }
    })
    const someVote = localItem.votes.regular.some((vote) => vote !== 0n)

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'none'
        }
        if (headerSliderRef.current) {
            headerSliderRef.current.style.transition = 'none'
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartRef.current === null) return
        const currentX = e.touches[0].clientX
        const diff = currentX - touchStartRef.current
        const width = evidenceContainerRef.current?.clientWidth || window.innerWidth
        const base = activeSide === EEvidenceVote.Positive ? 0 : -width
        let translatePx = base + diff
        translatePx = Math.min(0, Math.max(translatePx, -width))
        const transformStyle = `translateX(${translatePx}px)`
        if (sliderRef.current) {
            sliderRef.current.style.transform = transformStyle
        }
        if (headerSliderRef.current) {
            headerSliderRef.current.style.transform = transformStyle
        }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartRef.current === null) return

        const touchEnd = e.changedTouches[0].clientX
        const diff = touchStartRef.current - touchEnd
        const width = evidenceContainerRef.current?.clientWidth || window.innerWidth

        if (sliderRef.current) {
            sliderRef.current.style.transition = ''
            sliderRef.current.style.transform = ''
        }
        if (headerSliderRef.current) {
            headerSliderRef.current.style.transition = ''
            headerSliderRef.current.style.transform = ''
        }

        if (Math.abs(diff) > width * 0.1) {
            if (diff > 0) {
                setActiveSide(EEvidenceVote.Negative)
            } else {
                setActiveSide(EEvidenceVote.Positive)
            }
        }

        touchStartRef.current = null
    }

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        checkIsMobile()
        window.addEventListener('resize', checkIsMobile)
        return () => window.removeEventListener('resize', checkIsMobile)
    }, [])

    return (
        <>
            <Popup
                open={postEvidenceOpen !== null}
                onClose={() => setPostEvidenceOpen(null)}
                title={
                    typeof postEvidenceOpen === 'string' || postEvidenceOpen === undefined
                        ? `Post Evidence`
                        : `Post Reply to Evidence ${postEvidenceOpen?.toString()}`
                }
                href={build(
                    ['feed', localItem.id, 'evidences', 'post'],
                    typeof postEvidenceOpen === 'string'
                        ? { side: postEvidenceOpen }
                        : { replyTo: postEvidenceOpen?.toString() }
                )}
                className="w-full md:w-4/5"
                Icon={<EditIcon className="h-6 stroke-[1.5px]" />}
            >
                <PostEvidence
                    id={localItem.id}
                    side={typeof postEvidenceOpen === 'string' ? postEvidenceOpen : undefined}
                    replyTo={typeof postEvidenceOpen === 'bigint' ? postEvidenceOpen : undefined}
                    onSubmit={(side) => {
                        side === EEvidenceVote.Positive
                            ? positiveEvidencesRef.current?.refresh()
                            : negativeEvidencesRef.current?.refresh(),
                            setPostEvidenceOpen(null)
                    }}
                />
            </Popup>
            <Popup
                open={open === EPopup.RequestFlag}
                onClose={() => setOpen(null)}
                title="Request Flag"
                className="w-full md:w-auto"
                Icon={<FlagIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <RequestFlag
                    header={{ id: localItem.id, category: Variant('Hypothesis') }}
                    onSubmit={() => setOpen(null)}
                />
            </Popup>
            <Popup
                open={open === EPopup.EditHypothesis}
                onClose={() => setOpen(null)}
                title="Edit Hypothesis"
                className="w-full md:w-4/5"
                Icon={<LoginStep1Icon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <PostHypothesis
                    isEdit={{
                        id: localItem.id,
                        fieldId: localItem.fieldId,
                        content: localItem.content,
                    }}
                    onSubmit={() => {
                        setOpen(null)
                        handleRefresh()
                    }}
                />
            </Popup>
            <div
                className={cn(
                    'gap-medium relative flex h-full w-full flex-col rounded-lg hover:border-opacity-100 md:border md:border-cold-600 md:border-opacity-50',
                    (hideHypothesis || hideEvidences) && 'border-none'
                )}
            >
                {tempHideHypothesis ? (
                    <div className="px-medium mt-medium mx-auto w-full md:w-2/3">
                        <button
                            className="!text-extratiny !gap-small py-normal text-tiny gap-small col-span-3 row-span-2 flex h-8 w-full items-center justify-center rounded-lg border border-cold-700 bg-white font-normal text-cold-700 hover:bg-cold-100 md:h-10"
                            onClick={() => setTempHideHypothesis(!tempHideHypothesis)}
                        >
                            <HypothesisIcon className="h-5 stroke-[1.5px] md:h-6" />
                            <p className="mt-auto">VIEW HYPOTHESIS</p>
                        </button>
                    </div>
                ) : (
                    <>
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
                                    handleVote={(custom) =>
                                        handleVote(EVote.Positive, custom, setLocalItem)
                                    }
                                    loading={votesLoading[EVote.Positive]}
                                />
                                <HypothesisVote
                                    choice={EVote.Neutral}
                                    vote={vote}
                                    className="rounded-lg"
                                    handleVote={(custom) =>
                                        handleVote(EVote.Neutral, custom, setLocalItem)
                                    }
                                    loading={votesLoading[EVote.Neutral]}
                                />
                                <HypothesisVote
                                    choice={EVote.Negative}
                                    vote={vote}
                                    className="rounded-lg"
                                    handleVote={(custom) =>
                                        handleVote(EVote.Negative, custom, setLocalItem)
                                    }
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
                                    series={[
                                        { data: regularVotes, innerRadius: 43, outerRadius: 53 },
                                    ]}
                                    width={200}
                                    height={150}
                                    slotProps={{ legend: { hidden: true } }}
                                    className="translate-x-4 overflow-hidden"
                                />
                                <div className="gap-small flex flex-col">
                                    <div className="text-tiny gap-normal flex w-min justify-center text-nowrap font-light">
                                        <div className="text-tiny grid grid-rows-3 place-items-end items-end text-nowrap font-normal">
                                            {Object.values(VOTES).map(({ textColor }, index) => {
                                                const voteType =
                                                    index === 0
                                                        ? 'positive'
                                                        : index === 1
                                                          ? 'neutral'
                                                          : index === 2
                                                            ? 'negative'
                                                            : 'delegated'
                                                const customColor =
                                                    colors[voteType as keyof typeof colors]
                                                return (
                                                    <p
                                                        className={`gap-small flex h-5 items-center md:h-6 xl:h-7`}
                                                        key={index}
                                                        style={{ color: customColor }}
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
                                                )
                                            })}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            {Object.values(VOTES).map(
                                                ({ bgColor, textColor }, index) => {
                                                    const voteType =
                                                        index === 0
                                                            ? 'positive'
                                                            : index === 1
                                                              ? 'neutral'
                                                              : index === 2
                                                                ? 'negative'
                                                                : 'delegated'
                                                    const customColor =
                                                        colors[voteType as keyof typeof colors]

                                                    return (
                                                        <div
                                                            className="gap-small flex h-5 items-center md:h-6 xl:h-7"
                                                            key={index}
                                                            style={{ color: customColor }}
                                                        >
                                                            <div
                                                                className="h-4 w-7 rounded-full"
                                                                style={{
                                                                    backgroundColor: customColor,
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
                                        <div className="flex flex-col place-items-start items-start">
                                            {Object.values(VOTES).map(({ textColor }, index) => {
                                                const voteType =
                                                    index === 0
                                                        ? 'positive'
                                                        : index === 1
                                                          ? 'neutral'
                                                          : index === 2
                                                            ? 'negative'
                                                            : 'delegated'
                                                const customColor =
                                                    colors[voteType as keyof typeof colors]

                                                return (
                                                    <p
                                                        className="gap-small flex h-5 items-center md:h-6 xl:h-7"
                                                        key={index}
                                                        style={{ color: customColor }}
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
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <PieChart
                                    series={[
                                        { data: poweredVotes, innerRadius: 43, outerRadius: 53 },
                                    ]}
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
                                <FieldIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                                <span className="text-small md:mr-medium text-nowrap font-light text-white">
                                    {localItem.fieldId}
                                </span>
                            </Link>
                            <Link
                                className="gap-small order-3 flex items-center hover:opacity-75 md:order-2"
                                href={build(['profile', localItem.publisher.toText()])}
                            >
                                <Symbol
                                    capitalRaised={publisher.capitalRaised.toString()}
                                    className="mr-0 h-4 w-4 md:h-5 md:w-5"
                                />
                                <span className="text-small md:mr-medium text-nowrap font-light text-white">
                                    {publisher.username}
                                </span>
                            </Link>
                            <div className="gap-small order-2 ml-auto flex items-center md:order-3 md:ml-0">
                                <DateTimeIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                                <span className="text-small md:mr-medium text-nowrap font-light text-white">
                                    {formatDate({ nano: localItem.publishDate })}
                                </span>
                            </div>
                            <div className="hidden w-full md:order-4 md:block" />
                            <div
                                className={cn(
                                    'order-4 ml-auto grid h-6 flex-shrink-0 place-items-center items-center md:order-5 md:ml-0',
                                    principal?.compareTo(localItem.publisher) === 'eq'
                                        ? 'w-40 grid-cols-5 md:w-48'
                                        : 'w-32 grid-cols-4 md:w-40'
                                )}
                            >
                                <div className="w-8 md:w-10">
                                    {axiomLoading ? (
                                        <Spinner
                                            className="mx-auto h-4 w-4 stroke-[1.5px] text-white/50 md:h-5 md:w-5"
                                            color="white"
                                        />
                                    ) : (
                                        <AdoptIcon
                                            className="mx-auto h-4 w-4 cursor-pointer stroke-[1.5px] hover:h-5 hover:w-5 hover:fill-white hover:text-cold-900 aria-selected:h-5 aria-selected:w-5 aria-selected:fill-white aria-selected:text-cold-900 aria-selected:hover:h-5 aria-selected:hover:w-5 aria-selected:hover:fill-none aria-selected:hover:text-white md:h-5 md:w-5 md:hover:h-6 md:hover:w-6 md:aria-selected:h-6 md:aria-selected:w-6"
                                            onClick={() => handleAxiom()}
                                            aria-selected={!!axiom}
                                        />
                                    )}
                                </div>
                                <div className="w-8 md:w-10">
                                    {bookmarkLoading ? (
                                        <Spinner
                                            className="mx-auto h-4 w-4 stroke-[1.5px] text-white/50 md:h-5 md:w-5"
                                            color="white"
                                        />
                                    ) : (
                                        <BookmarkIcon
                                            className="mx-auto h-4 w-4 cursor-pointer stroke-[1.5px] hover:h-5 hover:w-5 hover:fill-white hover:text-cold-900 aria-selected:h-5 aria-selected:w-5 aria-selected:fill-white aria-selected:text-cold-900 aria-selected:hover:h-5 aria-selected:hover:w-5 aria-selected:hover:fill-none aria-selected:hover:text-white md:h-5 md:w-5 md:hover:h-6 md:hover:w-6 md:aria-selected:h-6 md:aria-selected:w-6"
                                            onClick={() => handleBookmark()}
                                            aria-selected={!!bookmark}
                                        />
                                    )}
                                </div>
                                <button
                                    className="w-8 hover:opacity-75 md:w-10"
                                    onClick={() => setOpen(EPopup.RequestFlag)}
                                >
                                    <FlagIcon className="mx-auto h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                                </button>
                                <button
                                    className="w-8 hover:opacity-75 disabled:pointer-events-none md:w-10"
                                    onClick={handleCopy}
                                    disabled={copied}
                                >
                                    {copied ? (
                                        <DoneIcon className="mx-auto h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                                    ) : (
                                        <ShareIcon className="mx-auto h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                                    )}
                                </button>
                                {principal?.compareTo(localItem.publisher) === 'eq' && (
                                    <button
                                        className="w-8 hover:opacity-75 disabled:pointer-events-none md:w-10"
                                        onClick={() => setOpen(EPopup.EditHypothesis)}
                                    >
                                        <LoginStep1Icon className="mx-auto h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div className="gap-medium flex h-full w-full flex-col items-center">
                    <div
                        className={cn(
                            'text-tiny gap-normal px-medium grid w-full grid-cols-7 items-center font-normal text-white md:w-2/3',
                            tempHideEvidences && 'pb-medium'
                        )}
                    >
                        {Object.entries(VOTES).map(
                            ([name, { bgColor, borderColor, textColor, Icon }], index) => {
                                const voteType =
                                    index === 0
                                        ? 'positive'
                                        : index === 1
                                          ? 'neutral'
                                          : index === 2
                                            ? 'negative'
                                            : 'delegated'
                                const customColor = colors[voteType as keyof typeof colors]

                                return index === 1 ? (
                                    tempHideEvidences ? (
                                        <button
                                            key={index}
                                            className="py-normal text-tiny gap-small col-span-3 flex w-full items-center justify-center rounded-lg border transition-all duration-300 ease-in-out hover:opacity-75"
                                            style={{
                                                backgroundColor: customColor,
                                                borderColor: customColor,
                                            }}
                                            onClick={() => setTempHideEvidences(!tempHideEvidences)}
                                        >
                                            <EvidenceIcon className="h-5 stroke-[1.5px] md:h-6" />
                                            <span>
                                                VIEW EVIDENCE ({localItem.evidenceIds.length})
                                            </span>
                                        </button>
                                    ) : (
                                        <div
                                            key={index}
                                            className="py-normal text-tiny gap-small col-span-3 flex w-full items-center justify-center rounded-lg border"
                                            style={{ borderColor: customColor, color: customColor }}
                                        >
                                            <EvidenceIcon className="h-5 stroke-[1.5px] md:h-6" />
                                            <span>
                                                THE EVIDENCE ({localItem.evidenceIds.length})
                                            </span>
                                        </div>
                                    )
                                ) : (
                                    <button
                                        key={index}
                                        className="py-normal text-tiny gap-small col-span-2 flex w-full items-center justify-center rounded-lg border transition-all duration-300 ease-in-out hover:opacity-75"
                                        style={{
                                            backgroundColor: customColor,
                                            borderColor: customColor,
                                        }}
                                        onClick={() => setPostEvidenceOpen(name as EEvidenceVote)}
                                    >
                                        <div className="gap-small flex items-center">
                                            <Icon className="h-5 stroke-[1.5px] md:h-6" />
                                            <span>{VOTES[voteKeys[index]].name}</span>
                                        </div>
                                    </button>
                                )
                            }
                        )}
                    </div>

                    {!tempHideEvidences && (
                        <div className="px-normal mb-normal gap-normal w-full">
                            {!isMobile && (
                                <div className="px-normal mb-normal gap-normal flex w-full items-stretch justify-between">
                                    <div className="gap-normal flex w-1/2 flex-col items-center">
                                        <InfiniteScrollWrapper
                                            ref={positiveEvidencesRef}
                                            query={Axioms.call(agent, true).getEvidencesPagination}
                                            name="evidence"
                                            hardFilter={positiveFilter}
                                            hardSort={commonSort}
                                            size={2n}
                                            LayoutComponent={({ items }) => (
                                                <EvidencesLayout
                                                    items={items}
                                                    onReply={setPostEvidenceOpen}
                                                />
                                            )}
                                            className="h-full w-full"
                                        />
                                    </div>
                                    <Divider
                                        direction="vertical"
                                        bgColor="bg-cold-800"
                                        borderColor="border-cold-800"
                                    />
                                    <div className="gap-normal flex w-1/2 flex-col items-center">
                                        <InfiniteScrollWrapper
                                            ref={negativeEvidencesRef}
                                            query={Axioms.call(agent, true).getEvidencesPagination}
                                            name="evidence"
                                            hardFilter={negativeFilter}
                                            hardSort={commonSort}
                                            size={2n}
                                            LayoutComponent={({ items }) => (
                                                <EvidencesLayout
                                                    items={items}
                                                    onReply={setPostEvidenceOpen}
                                                />
                                            )}
                                            className="h-full w-full"
                                        />
                                    </div>
                                </div>
                            )}
                            {isMobile && (
                                <div className="h-full w-full overflow-x-hidden">
                                    <div className="text-small py-normal sticky top-0 z-10 w-full overflow-x-hidden bg-white">
                                        <div
                                            ref={headerSliderRef}
                                            className={cn(
                                                'flex w-[200%] transition-transform duration-300 ease-in-out',
                                                activeSide === EEvidenceVote.Positive
                                                    ? 'translate-x-0'
                                                    : '-translate-x-1/2'
                                            )}
                                        >
                                            <p className="w-1/2 pr-1 text-right">
                                                swipe right to see{' '}
                                                <span
                                                    className={cn('font-semibold')}
                                                    style={{ color: colors.negative }}
                                                >
                                                    negative side
                                                </span>{' '}
                                                →
                                            </p>
                                            <p className="w-1/2 pl-1 text-left">
                                                ← swipe left to see{' '}
                                                <span
                                                    className={cn('font-semibold')}
                                                    style={{ color: colors.positive }}
                                                >
                                                    positive side
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        ref={evidenceContainerRef}
                                        className="w-full overflow-x-hidden"
                                        onTouchStartCapture={handleTouchStart}
                                        onTouchMoveCapture={handleTouchMove}
                                        onTouchEndCapture={handleTouchEnd}
                                    >
                                        <div
                                            ref={sliderRef}
                                            className={cn(
                                                'flex w-[200%] transition-transform duration-300 ease-in-out',
                                                activeSide === EEvidenceVote.Positive
                                                    ? 'translate-x-0'
                                                    : '-translate-x-1/2'
                                            )}
                                        >
                                            <div className="w-1/2 flex-shrink-0 px-1">
                                                <InfiniteScrollWrapper
                                                    ref={positiveEvidencesRef}
                                                    query={
                                                        Axioms.call(agent, true)
                                                            .getEvidencesPagination
                                                    }
                                                    name="evidence"
                                                    hardFilter={positiveFilter}
                                                    hardSort={commonSort}
                                                    size={2n}
                                                    LayoutComponent={({ items }) => (
                                                        <EvidencesLayout
                                                            items={items}
                                                            onReply={setPostEvidenceOpen}
                                                        />
                                                    )}
                                                    className="h-full w-full"
                                                />
                                            </div>
                                            <div className="w-1/2 flex-shrink-0 px-1">
                                                <InfiniteScrollWrapper
                                                    ref={negativeEvidencesRef}
                                                    query={
                                                        Axioms.call(agent, true)
                                                            .getEvidencesPagination
                                                    }
                                                    name="evidence"
                                                    hardFilter={negativeFilter}
                                                    hardSort={commonSort}
                                                    size={2n}
                                                    LayoutComponent={({ items }) => (
                                                        <EvidencesLayout
                                                            items={items}
                                                            onReply={setPostEvidenceOpen}
                                                        />
                                                    )}
                                                    className="h-full w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default HypothesisDetail
