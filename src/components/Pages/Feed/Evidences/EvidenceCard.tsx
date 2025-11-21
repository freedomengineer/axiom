'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import DoneIcon from '@components/Assets/done.svg'
import EditIcon from '@components/Assets/edit.svg'
import EvidenceIcon from '@components/Assets/evidence.svg'
import FlagIcon from '@components/Assets/flag.svg'
import HypothesisIcon from '@components/Assets/hypothesis.svg'
import NewTabIcon from '@components/Assets/new_tab.svg'
import ReplyIcon from '@components/Assets/reply.svg'
import ShareIcon from '@components/Assets/share.svg'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import { Symbol } from '@components/Shared/Username'
import useAuth from '@hooks/useAuth'
import useEvidenceDetails from '@hooks/useEvidenceDetails'
import useVoteColors from '@hooks/useVoteColors'
import cn from '@libs/class'
import { formatDate } from '@libs/date'
import { success } from '@libs/toastify'
import { build, buildBlobImage } from '@libs/url'
import { EVote } from '@utils/feed/evidence'
import { VOTES as HYPOTHESIS_VOTES } from '@utils/feed/hypothesis'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { Unwrap, UnwrapVariant, Variant, isNullish } from 'shared/utils/typings'

import EvidenceDetail from './EvidenceDetail'
import EvidenceDetailGroup from './EvidenceDetailGroup'
import EvidenceVote from './EvidenceVote'
import PostEvidence from './PostEvidence'
import RequestFlag from '../Flags/RequestFlag'
import HypothesisDetail from '../Hypotheses/HypothesisDetail'

const PreloadHypothesisDetail = ({ id }: { id: bigint }) => {
    const { agent } = useAuth()
    const [item, setItem] = useState<DAxioms.SharableHypothesis>()

    useEffect(() => {
        if (isNullish(id)) return
        Axioms.call(agent).getHypothesis(id).then(setItem)
    }, [agent, id])

    if (isNullish(item)) return null
    return <HypothesisDetail item={item} hideEvidences={true} setLocalItem={() => {}} />
}

enum EPopup {
    HypothesisDetail,
    EvidenceDetail,
    RequestFlag,
    // Reply,
}

const EvidenceCard = ({
    item,
    className,
    onReply,
    localHypothesis,
    setLocalHypothesis,
}: {
    item: DAxioms.SharableEvidence
    className?: string
    onReply?: (id: bigint) => void
    localHypothesis?: DAxioms.SharableHypothesis
    setLocalHypothesis: (item: DAxioms.SharableHypothesis) => void
}) => {
    const { principal } = useAuth()
    const { colors } = useVoteColors()
    const { publisher, localItem, vote, votesLoading, handleVote, refreshItem } =
        useEvidenceDetails(item)
    const [open, setOpen] = useState<EPopup>()
    const [copied, setCopied] = useState<boolean>()
    const [openReply, setOpenReply] = useState<boolean | undefined>(
        onReply === undefined ? undefined : false
    )
    const [imageOpen, setImageOpen] = useState<boolean>(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(
            build(
                ['feed', item.hypothesisId, 'evidences', item.id],
                { ref: principal?.toText() ?? null },
                true
            )
        )
        setCopied(true)
        success('Copied share link to clipboard')
        setTimeout(() => setCopied(false), 3000)
    }
    const handleReply = () => {
        if (onReply === undefined) setOpenReply(true)
        else onReply(item.id)
    }

    const formObject = Object.fromEntries(item.form.map((form) => UnwrapVariant(form)))
    const VOTE = HYPOTHESIS_VOTES[UnwrapVariant(item.choice)]
    const Icon = VOTE.Icon

    return (
        <div
            className={cn(
                'text-small relative my-auto flex h-min w-full flex-col rounded-lg border border-cold-600 border-opacity-50 font-normal text-cold-800 hover:border-opacity-100 md:w-[420px]',
                'touch-pan-y',
                className
            )}
        >
            {openReply !== undefined && (
                <Popup
                    open={openReply}
                    onClose={() => setOpenReply(false)}
                    title={`Post Reply to Evidence ${item.id}`}
                    href={build(['feed', item.id, 'evidences', 'post'], {
                        replyTo: item.id.toString(),
                    })}
                    Icon={<EditIcon className="h-6 stroke-[1.5px]" />}
                >
                    <PostEvidence
                        id={item.hypothesisId}
                        replyTo={item.id}
                        onSubmit={() => {
                            refreshItem()
                            setOpenReply(false)
                        }}
                    />
                </Popup>
            )}
            <Popup
                open={open === EPopup.EvidenceDetail}
                onClose={() => setOpen(undefined)}
                title={`Evidence ${item.id}`}
                className="w-full md:w-4/5"
                href={build(['feed', item.hypothesisId, 'evidences', item.id])}
                Icon={<EvidenceIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <EvidenceDetailGroup item={localItem} />
            </Popup>
            <Popup
                open={open === EPopup.HypothesisDetail}
                onClose={() => setOpen(undefined)}
                title={`Hypothesis ${item.hypothesisId}`}
                className="w-full md:w-4/5"
                secondaryClassname="p-0"
                href={build(['feed', item.hypothesisId])}
                Icon={<HypothesisIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                {localHypothesis ? (
                    <HypothesisDetail
                        item={localHypothesis}
                        hideEvidences={true}
                        setLocalItem={setLocalHypothesis}
                    />
                ) : (
                    <PreloadHypothesisDetail id={item.hypothesisId} />
                )}
            </Popup>
            <Popup
                open={open === EPopup.EvidenceDetail}
                onClose={() => setOpen(undefined)}
                title={`Evidence ${item.id}`}
                className="w-full md:w-4/5"
                secondaryClassname="px-large overflow-x-hidden"
                href={build(['feed', item.hypothesisId, 'evidences', item.id])}
                Icon={<EvidenceIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <EvidenceDetailGroup item={localItem} />
            </Popup>
            <Popup
                open={open === EPopup.RequestFlag}
                onClose={() => setOpen(undefined)}
                title="Request Flag"
                className="w-full md:w-auto"
                Icon={<FlagIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <RequestFlag
                    header={{ id: item.id, category: Variant('Evidence') }}
                    onSubmit={() => setOpen(undefined)}
                />
            </Popup>

            <div
                className="absolute right-0 top-0 rounded-md text-white"
                style={{
                    backgroundColor:
                        UnwrapVariant(item.choice) === EVote.Positive
                            ? colors.positive
                            : colors.negative,
                }}
            >
                <Icon className="p-tiny h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />
            </div>
            {!isNullish(Unwrap(item.repliedTo)) && (
                <div className="absolute right-8 top-0 rounded-md bg-cold-700 text-white">
                    <ReplyIcon className="p-small h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />
                </div>
            )}
            <div className="gap-normal px-medium py-extralarge flex w-full flex-col items-center">
                {formObject.Picture && (
                    <img
                        src={buildBlobImage(formObject.Picture.blob as Uint8Array)}
                        alt="evidence"
                        className="h-28 cursor-zoom-in rounded-lg object-cover hover:opacity-75 md:h-32"
                        onClick={() => setImageOpen(true)}
                    />
                )}
                {formObject.Note && (
                    <div className="mx-auto h-auto w-fit max-w-full">
                        <p className="text-tiny whitespace-pre-line break-words text-center">
                            {formObject.Note.content.trim()}
                        </p>
                    </div>
                )}
                {formObject.Hyperlink && (
                    <Link
                        className="text-tiny pre-underline mx-auto decoration-cold-800/50 hover:decoration-cold-800/100"
                        href={formObject.Hyperlink.url}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        icon="forward"
                    >
                        {formObject.Hyperlink.anchorText.trim()}
                    </Link>
                )}
            </div>
            {imageOpen &&
                formObject.Picture &&
                typeof window !== 'undefined' &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[10000] flex cursor-pointer items-center justify-center bg-black/80 p-4"
                        onClick={() => setImageOpen(false)}
                    >
                        <div
                            className="max-h-[90vh] max-w-[95vw]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={buildBlobImage(formObject.Picture.blob as Uint8Array)}
                                alt="evidence"
                                className="max-h-[75vh] max-w-[90vw] cursor-default rounded-lg object-contain"
                            />
                            <p className="text-tiny mt-3 text-center font-light text-white">
                                {`from: @${publisher.username} - ${formatDate({ nano: item.publishDate })} (${formatDate({ nano: item.publishDate }, true)})`}
                            </p>
                        </div>
                    </div>,
                    document.body
                )}
            <div className="px-medium py-small flex w-full rounded-b-md bg-cold-900 text-white">
                {/* <button
                    className={cn(
                        'flex items-center gap-small order-1 hover:opacity-75',
                        'touch-pan-y'
                    )}
                    onClick={() => setOpen(EPopup.HypothesisDetail)}
                >
                    <HypothesisIcon className="stroke-[2px] w-[16px] md:w-[18px] h-[16px] md:h-[18px]" />
                    <span className="md:mr-medium font-light text-tiny text-white text-nowrap">
                        {item.hypothesisId}
                    </span>
                </button> */}
                <Link
                    className={cn(
                        'gap-small order-2 flex items-center hover:opacity-75',
                        'touch-pan-y'
                    )}
                    href={build(['profile', item.publisher.toText()])}
                >
                    <Symbol
                        capitalRaised={publisher.capitalRaised.toString()}
                        className="mr-0 h-3.5 w-3.5 md:h-4 md:w-4"
                    />
                    <span className="text-tiny mr-3 text-nowrap font-light text-white">
                        {publisher.username}
                    </span>
                </Link>
                <button
                    className={cn(
                        'gap-small order-3 ml-0 flex items-center hover:opacity-75',
                        'touch-pan-y'
                    )}
                    onClick={() => setOpen(EPopup.EvidenceDetail)}
                >
                    <NewTabIcon className="h-3.5 w-3.5 stroke-[2px]" />
                    <span className="mr-medium text-tiny text-nowrap font-light text-white">
                        view
                    </span>
                </button>
                <div className="order-4 block w-full" />
                <div className="order-5 ml-0 flex w-fit flex-shrink-0 place-items-center items-center justify-between gap-3">
                    <div className="gap-small flex items-center">
                        <EvidenceVote
                            choice={EVote.Positive}
                            vote={vote}
                            handleVote={(custom) => handleVote(EVote.Positive, custom)}
                            loading={votesLoading[EVote.Positive]}
                            className="flex h-3.5 items-center gap-0 md:h-4"
                            childClassName="text-tiny font-light text-white"
                            value={localItem.votes.regular[0]}
                        />
                    </div>
                    <div className="gap-small flex items-center">
                        <EvidenceVote
                            choice={EVote.Negative}
                            vote={vote}
                            handleVote={(custom) => handleVote(EVote.Negative, custom)}
                            loading={votesLoading[EVote.Negative]}
                            className="flex h-3.5 items-center gap-0 md:h-4"
                            childClassName="text-tiny font-light text-white"
                            value={localItem.votes.regular[1]}
                        />
                    </div>
                    <button
                        className="gap-small flex cursor-pointer items-center hover:opacity-75"
                        onClick={() => handleReply()}
                    >
                        <ReplyIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4" />
                        <p className="text-tiny font-light text-white">
                            {localItem.replies.length}
                        </p>
                    </button>
                    <button
                        className="hover:opacity-75"
                        onClick={() => setOpen(EPopup.RequestFlag)}
                    >
                        <FlagIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4" />
                    </button>
                    <button
                        className="hover:opacity-75 disabled:pointer-events-none"
                        onClick={handleCopy}
                        disabled={copied}
                    >
                        {copied ? (
                            <DoneIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4" />
                        ) : (
                            <ShareIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EvidenceCard
