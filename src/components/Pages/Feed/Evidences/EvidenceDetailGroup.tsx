'use client'

import { useEffect, useState } from 'react'

import useAuth from '@hooks/useAuth'
import cn from '@libs/class'
import { parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { Unwrap, isNullish } from 'shared/utils/typings'

import EvidenceDetail from './EvidenceDetail'

const RepliesSection = ({
    parentId,
    level,
    className,
    noParent,
}: {
    parentId: bigint
    level: number
    className: string
    noParent: boolean
}) => {
    const { agent } = useAuth()
    const [replies, setReplies] = useState<DAxioms.SharableEvidence[]>([])
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        Axioms.call(agent, true)
            .getEvidences(
                parseFilterFromObj('evidence', { repliedTo: parentId.toString() }),
                parseSortFromObj('evidence', {
                    by: 'positivity',
                    order: 'descending',
                })
            )
            .then(setReplies)
    }, [parentId, agent])

    if (replies.length === 0) return null

    return (
        <div className={cn('flex w-full flex-col gap-[0.75rem]', className)}>
            {isExpanded ? (
                <>
                    {replies.map((reply) => (
                        <>
                            <div className="flex w-full">
                                <div className="relative">
                                    <div
                                        className={cn(
                                            'left-5 top-full z-10 h-[calc(50%+0.75rem)] w-[1rem] translate-y-[1.5rem] md:w-[1.5rem]'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'h-1/2 w-full rounded-bl-lg border-b-2 border-l-2 border-cold-800'
                                            )}
                                        ></div>
                                    </div>
                                    <div className="left-5 top-full z-10 h-[calc(100%+1.5rem)] -translate-y-[calc(50%+0.75rem)] border-l-2 border-cold-800"></div>
                                </div>
                                <EvidenceDetail
                                    item={reply}
                                    className={
                                        noParent
                                            ? '!w-[calc(100%-2.25rem)] md:!w-[calc(100%-3rem)]'
                                            : '!w-[calc(100%-4rem)] md:!w-[calc(100%-6rem)]'
                                    }
                                    isMain={false}
                                />
                            </div>
                            {reply.replies.length > 0 && (
                                <div
                                    className={cn(
                                        `relative h-full w-full`,
                                        `w-[calc(100%-${level * 1.5}rem)]`
                                    )}
                                >
                                    <div className="left-5 top-0 z-10 flex h-fit">
                                        <div className="w-[1rem] border-l-2 border-cold-800"></div>
                                        <RepliesSection
                                            parentId={reply.id}
                                            level={level + 1}
                                            noParent={noParent}
                                            className={'ml-[1.25rem] md:ml-[2rem]'}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ))}
                    <div className="flex w-full">
                        <div className="relative">
                            <div
                                className={cn(
                                    'left-5 top-full z-10 w-[1rem] md:w-[1.5rem]',
                                    'h-[calc(50%+0.75rem)] -translate-y-[0.75rem]'
                                )}
                            >
                                <div
                                    className={cn(
                                        'w-full rounded-bl-lg border-b-2 border-l-2 border-cold-800',
                                        'h-full'
                                    )}
                                ></div>
                            </div>
                        </div>
                        <button
                            className="py-normal px-medium text-tiny rounded-lg border border-cold-600 bg-cold-100 text-cold-800 hover:bg-cold-200"
                            onClick={() => setIsExpanded(false)}
                        >
                            - Hide {replies.length} replies
                        </button>
                    </div>
                </>
            ) : (
                <button onClick={() => setIsExpanded(true)}>
                    <>
                        <div className="flex w-full">
                            <div className="relative">
                                <div
                                    className={cn(
                                        'left-5 top-full z-10 w-[1rem] md:w-[1.5rem]',
                                        'h-[calc(50%+0.75rem)] -translate-y-[0.75rem]'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'w-full rounded-bl-lg border-b-2 border-l-2 border-cold-800',
                                            'h-full'
                                        )}
                                    ></div>
                                </div>
                            </div>
                            <button
                                className="py-normal px-medium text-tiny rounded-lg border border-cold-600 bg-cold-100 text-cold-800 hover:bg-cold-200"
                                onClick={() => setIsExpanded(true)}
                            >
                                + View {replies.length} replies
                            </button>
                        </div>
                    </>
                </button>
            )}
        </div>
    )
}

const EvidenceDetailGroup = ({ item }: { item: DAxioms.SharableEvidence }) => {
    const { agent } = useAuth()
    const [parentEvidence, setParentEvidence] = useState<
        DAxioms.SharableEvidence | undefined | null
    >(isNullish(Unwrap(item.repliedTo)) ? null : undefined)
    const [loadingParent, setLoadingParent] = useState(false)

    const handleParentClick = () => {
        const repliedToId = Unwrap(item.repliedTo)
        if (parentEvidence || isNullish(repliedToId)) return
        setLoadingParent(true)
        Axioms.call(agent)
            .getEvidence(repliedToId)
            .then(setParentEvidence)
            .finally(() => setLoadingParent(false))
    }

    return (
        <div className="flex w-full flex-col gap-[0.75rem] overflow-x-hidden">
            {parentEvidence !== null && (
                <div className="relative w-full">
                    {parentEvidence === undefined ? (
                        <button
                            onClick={handleParentClick}
                            disabled={loadingParent}
                            className="py-normal px-medium text-tiny rounded-lg border border-cold-600 bg-cold-100 text-cold-800 hover:bg-cold-200"
                        >
                            + View parent evidence
                        </button>
                    ) : (
                        parentEvidence && (
                            <EvidenceDetail
                                item={parentEvidence}
                                className="!w-full"
                                isMain={false}
                            />
                        )
                    )}
                </div>
            )}
            <div
                className={cn(
                    'flex w-full',
                    parentEvidence !== null && 'ml-[0.75rem] md:ml-[1.5rem]'
                )}
            >
                {parentEvidence !== null && (
                    <div className="relative">
                        <div className="left-5 top-full z-10 h-[calc(50%+0.75rem)] w-[1rem] -translate-y-[0.75rem] md:w-[1.5rem]">
                            <div className="h-full w-full rounded-bl-lg border-b-2 border-l-2 border-cold-800"></div>
                        </div>
                    </div>
                )}
                <EvidenceDetail
                    item={item}
                    className={
                        parentEvidence !== null
                            ? '!w-[calc(100%-2rem)] md:!w-[calc(100%-3rem)]'
                            : '!w-full'
                    }
                    isMain={true}
                />
            </div>
            {item.replies.length > 0 && (
                <RepliesSection
                    parentId={item.id}
                    level={parentEvidence !== null ? 2 : 1}
                    noParent={parentEvidence === null}
                    className={
                        parentEvidence !== null
                            ? 'ml-[3rem] md:ml-[4.5rem]'
                            : 'ml-[1.25rem] md:ml-[1.5rem]'
                    }
                />
            )}
        </div>
    )
}

export default EvidenceDetailGroup
