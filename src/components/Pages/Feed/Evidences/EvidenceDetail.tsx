'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

import DateTimeIcon from '@components/Assets/date_time.svg'
import DoneIcon from '@components/Assets/done.svg'
import EditIcon from '@components/Assets/edit.svg'
import FlagIcon from '@components/Assets/flag.svg'
import HypothesisIcon from '@components/Assets/hypothesis.svg'
import NewTabIcon from '@components/Assets/new_tab.svg'
import ReplyIcon from '@components/Assets/reply.svg'
import ShareIcon from '@components/Assets/share.svg'
import Spinner from '@components/Primitives/Spinner'
import Divider from '@components/Shared/Divider'
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
import { Unwrap, UnwrapVariant, Variant, isNullish } from 'shared/utils/typings'

import EvidenceVote from './EvidenceVote'
import PostEvidence from './PostEvidence'
import RequestFlag from '../Flags/RequestFlag'

const EvidenceDetail = ({
    item,
    className,
    onReply,
}: {
    item: DAxioms.SharableEvidence
    className?: string
    onReply?: (id: bigint) => void
}) => {
    const { principal } = useAuth()
    const { colors } = useVoteColors()
    const { publisher, localItem, vote, votesLoading, handleVote, refreshItem } =
        useEvidenceDetails(item)
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState<boolean>()
    const [openReply, setOpenReply] = useState<boolean | undefined>(
        onReply === undefined ? undefined : false
    )
    const [imageOpen, setImageOpen] = useState<boolean>(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(
            build(
                ['feed', localItem.hypothesisId, 'evidences', localItem.id],
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
        else onReply(localItem.id)
    }

    const formObject = Object.fromEntries(localItem.form.map((form) => UnwrapVariant(form)))
    const VOTE = HYPOTHESIS_VOTES[UnwrapVariant(localItem.choice)]
    const Icon = VOTE.Icon

    return (
        <div
            className={cn(
                'text-small relative my-auto flex h-min w-full flex-col rounded-lg border border-cold-600 border-opacity-50 font-normal hover:border-opacity-100 md:w-[420px]',
                className
            )}
        >
            {openReply !== undefined && (
                <Popup
                    open={openReply}
                    onClose={() => setOpenReply(false)}
                    title={`Post Reply to Evidence ${localItem.id}`}
                >
                    <PostEvidence
                        id={item.hypothesisId}
                        replyTo={localItem.id}
                        onSubmit={() => {
                            setOpenReply(false)
                            refreshItem()
                        }}
                    />
                </Popup>
            )}
            <Popup
                open={open}
                onClose={() => setOpen(false)}
                title="Request Flag"
                className="w-full md:w-auto"
                Icon={<FlagIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <RequestFlag
                    header={{ id: localItem.id, category: Variant('Evidence') }}
                    onSubmit={() => setOpen(false)}
                />
            </Popup>
            <div
                className="absolute right-0 top-0 rounded-md text-white"
                style={{
                    backgroundColor:
                        UnwrapVariant(localItem.choice) === EVote.Positive
                            ? colors.positive
                            : colors.negative,
                }}
            >
                <Icon className="p-tiny h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />
            </div>
            {!isNullish(Unwrap(localItem.repliedTo)) && (
                <div className="absolute right-8 top-0 rounded-md bg-cold-700 text-white">
                    <ReplyIcon className="p-small h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />
                </div>
            )}
            <div className="px-medium py-extralarge gap-normal flex w-full flex-col items-center">
                {formObject.Picture && (
                    <img
                        src={buildBlobImage(formObject.Picture.blob)}
                        alt="evidence"
                        className="h-28 cursor-zoom-in rounded-lg object-cover hover:opacity-75 md:h-32"
                        onClick={() => setImageOpen(true)}
                    />
                )}
                {formObject.Note && (
                    <div className="mx-auto h-auto w-fit">
                        <p className="text-tiny whitespace-pre-line  break-words text-center">
                            {formObject.Note.content}
                        </p>
                    </div>
                )}
                {formObject.Hyperlink && (
                    <Link
                        className="pre-underline text-tiny mx-auto decoration-cold-800/50 hover:decoration-cold-800/100"
                        href={formObject.Hyperlink.url}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        icon="forward"
                    >
                        {formObject.Hyperlink.anchorText}
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
                                src={buildBlobImage(formObject.Picture.blob)}
                                alt="evidence"
                                className="max-h-[75vh] max-w-[90vw] cursor-default rounded-lg object-contain"
                            />
                            <p className="text-tiny mt-3 text-center font-light text-white">
                                {`from: @${publisher.username} - ${formatDate({ nano: localItem.publishDate })} (${formatDate({ nano: localItem.publishDate }, true)})`}
                            </p>
                        </div>
                    </div>,
                    document.body
                )}
            <div className="px-medium py-small gap-tiny grid w-full grid-cols-2 grid-rows-2 rounded-b-md bg-cold-900 text-white md:flex">
                <Link
                    className="gap-small order-1 flex items-center hover:opacity-75"
                    href={build(['feed', localItem.hypothesisId])}
                >
                    <HypothesisIcon className="h-[16px] w-[16px] stroke-[2px] md:h-[18px] md:w-[18px]" />
                    <span className="text-tiny md:mr-medium text-nowrap font-light text-white">
                        {localItem.hypothesisId}
                    </span>
                </Link>
                <Link
                    className="gap-small order-3 flex items-center hover:opacity-75 md:order-2"
                    href={build(['profile', localItem.publisher.toText()])}
                >
                    <Symbol
                        capitalRaised={publisher.capitalRaised.toString()}
                        className="mr-0 h-3.5 w-3.5 md:h-4 md:w-4"
                    />
                    <span className="text-tiny md:mr-medium text-nowrap font-light text-white">
                        {publisher.username}
                    </span>
                </Link>
                <Link
                    className="gap-small order-2 ml-auto flex items-center hover:opacity-75 md:order-3 md:ml-0"
                    href={build(['feed', localItem.hypothesisId, 'evidences', localItem.id])}
                >
                    <DateTimeIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4" />
                    <span className="text-tiny md:mr-medium text-nowrap font-light text-white">
                        {formatDate({ nano: localItem.publishDate })}
                    </span>
                </Link>
                <div className="hidden w-full md:order-4 md:block" />
                <div className="order-4 ml-auto flex w-full max-w-44 flex-shrink-0 place-items-center items-center justify-between md:order-5 md:ml-0">
                    <div className="gap-tiny flex items-center">
                        <EvidenceVote
                            choice={EVote.Positive}
                            vote={vote}
                            handleVote={(custom) => handleVote(EVote.Positive, custom)}
                            loading={votesLoading[EVote.Positive]}
                            className="flex h-3.5 items-center gap-0 md:h-4"
                            value={localItem.votes.regular[0]}
                            childClassName="text-tiny font-light text-white md:block"
                        />
                    </div>
                    <div className="gap-tiny flex items-center">
                        <EvidenceVote
                            choice={EVote.Negative}
                            vote={vote}
                            handleVote={(custom) => handleVote(EVote.Negative, custom)}
                            loading={votesLoading[EVote.Negative]}
                            className="flex h-3.5 items-center gap-0 md:h-4"
                            value={localItem.votes.regular[1]}
                            childClassName="text-tiny font-light text-white md:block"
                        />
                    </div>
                    <button
                        className="gap-small flex cursor-pointer items-center hover:opacity-75"
                        onClick={() => handleReply()}
                    >
                        <ReplyIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4" />
                        <p className="text-tiny font-light text-white md:block">
                            {localItem.replies.length}
                        </p>
                    </button>
                    <button className="hover:opacity-75" onClick={() => setOpen(true)}>
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

export default EvidenceDetail
