'use client'

import { useState } from 'react'

import AtIcon from '@components/Assets/at.svg'
import DoneIcon from '@components/Assets/done.svg'
import FlagIcon from '@components/Assets/flag.svg'
import HypothesisIcon from '@components/Assets/hypothesis.svg'
import NewTabIcon from '@components/Assets/new_tab.svg'
import ShareIcon from '@components/Assets/share.svg'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import useAuth from '@hooks/useAuth'
import useEvidenceDetails from '@hooks/useEvidenceDetails'
import cn from '@libs/class'
import { success } from '@libs/toastify'
import { build, buildBlobImage } from '@libs/url'
import { EVote } from '@utils/feed/evidence'
import { VOTES as HYPOTHESIS_VOTES } from '@utils/feed/hypothesis'
import { DAxioms } from 'shared/types/services'
import { UnwrapVariant, Variant } from 'shared/utils/typings'

import EvidenceVote from './EvidenceVote'
import RequestFlag from '../Flags/RequestFlag'

const EvidenceCard = ({
    item,
    className,
}: {
    item: DAxioms.SharableEvidence
    className?: string
}) => {
    const { principal } = useAuth()
    const { publisher, localItem, vote, votesLoading, handleVote } = useEvidenceDetails(item)
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState<boolean>()

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

    const formObject = Object.fromEntries(localItem.form.map((form) => UnwrapVariant(form)))
    const VOTE = HYPOTHESIS_VOTES[UnwrapVariant(localItem.choice)]
    const Icon = VOTE.Icon

    return (
        <div
            className={cn(
                'text-small relative my-auto flex h-min w-full flex-col rounded-lg border border-cold-600 border-opacity-50 font-normal text-cold-800 hover:border-opacity-100 md:w-[420px]',
                className
            )}
        >
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

            <div className={cn('absolute right-0 top-0 rounded-md text-white', VOTE.bgColor)}>
                <Icon className="p-tiny h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />
            </div>
            <div className="px-medium py-extralarge gap-normal flex w-full flex-col items-center">
                {formObject.Picture && (
                    <img
                        src={buildBlobImage(formObject.Picture.blob as Uint8Array)}
                        alt="evidence"
                        className="h-28 rounded-lg object-cover md:h-32"
                    />
                )}
                {formObject.Note && (
                    <div className="mx-auto h-auto w-fit">
                        <p className="text-tiny whitespace-pre-line  break-words text-center">
                            {formObject.Note.content.trim()}
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
                        {formObject.Hyperlink.anchorText.trim()}
                    </Link>
                )}
            </div>
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
                    <AtIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4" />
                    <span className="text-tiny md:mr-medium text-nowrap font-light text-white">
                        {publisher}
                    </span>
                </Link>
                <Link
                    className="gap-small order-2 ml-auto flex items-center hover:opacity-75 md:order-3 md:ml-0"
                    href={build(['feed', localItem.hypothesisId, 'evidences', localItem.id])}
                >
                    <NewTabIcon className="h-3.5 w-3.5 stroke-[2px]" />
                    <span className="text-tiny md:mr-medium text-nowrap font-light text-white">
                        view
                    </span>
                </Link>
                <div className="hidden w-full md:order-4 md:block" />
                <div className="order-4 ml-auto flex w-20 flex-shrink-0 place-items-center items-center justify-between md:order-5 md:ml-0 md:w-32">
                    <div className="gap-tiny flex items-center">
                        <EvidenceVote
                            choice={EVote.Positive}
                            vote={vote}
                            handleVote={() => handleVote(EVote.Positive)}
                            loading={votesLoading[EVote.Positive]}
                            className="h-3.5 w-3.5 md:h-4 md:w-4"
                        />
                        <p className="text-tiny hidden font-light text-white md:block">
                            {localItem.votes.regular[0]}
                        </p>
                    </div>
                    <div className="gap-tiny flex items-center">
                        <EvidenceVote
                            choice={EVote.Negative}
                            vote={vote}
                            handleVote={() => handleVote(EVote.Negative)}
                            loading={votesLoading[EVote.Negative]}
                            className="h-3.5 w-3.5 md:h-4 md:w-4"
                        />
                        <p className="text-tiny hidden font-light text-white md:block">
                            {localItem.votes.regular[1]}
                        </p>
                    </div>
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

export default EvidenceCard
