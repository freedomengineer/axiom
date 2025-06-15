'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import EditIcon from '@components/Assets/edit.svg'
import Popup from '@components/Shared/Popup'
import useAuth from '@hooks/useAuth'
import cn from '@libs/class'
import { build } from '@libs/url'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { Unwrap, isNullish } from 'shared/utils/typings'

import EvidenceDetail from './EvidenceDetail'
import PostEvidence from './PostEvidence'

const EvidenceDetailGroup = ({
    item,
    className,
    level = 0,
}: {
    item: DAxioms.SharableEvidence
    className?: string
    level?: number
}) => {
    const navigate = useNavigate()
    const { agent } = useAuth()

    const [parentEvidence, setParentEvidence] = useState<DAxioms.SharableEvidence | null>(null)
    const [childrenEvidence, setChildrenEvidence] = useState<DAxioms.SharableEvidence[]>([])
    const [expandedChildren, setExpandedChildren] = useState<{ [key: string]: boolean }>({})
    const [loadingChildren, setLoadingChildren] = useState(false)
    const [openReply, setOpenReply] = useState<bigint | null>(null)

    useEffect(() => {
        const repliedToId = Unwrap(item.repliedTo)
        if (!isNullish(repliedToId)) {
            Axioms.call(agent).getEvidence(repliedToId).then(setParentEvidence)
        }
    }, [item.repliedTo, agent])

    useEffect(() => {
        if (item.replies.length > 0) {
            setLoadingChildren(true)
            Promise.all(item.replies.map((replyId) => Axioms.call(agent).getEvidence(replyId)))
                .then((replies) => {
                    setChildrenEvidence(replies)
                    setLoadingChildren(false)
                })
                .catch(() => {
                    setLoadingChildren(false)
                })
        }
    }, [item.replies, agent])

    const handleParentClick = () => {
        if (parentEvidence) {
            navigate(build(['feed', parentEvidence.hypothesisId, 'evidences', parentEvidence.id]))
        }
    }

    const toggleChildExpansion = (childId: string) => {
        setExpandedChildren((prev) => ({ ...prev, [childId]: !prev[childId] }))
    }

    const getIndentClass = (currentLevel: number) => {
        const indentAmount = Math.min(currentLevel * 10, 40)
        return currentLevel > 0 ? `ml-${indentAmount}` : ''
    }

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <Popup
                open={openReply !== null}
                onClose={() => setOpenReply(null)}
                title={`Post Reply Evidence (To: ${openReply?.toString()})`}
                href={build(
                    ['feed', openReply ?? 0n, 'evidences', 'post'],
                    typeof openReply === 'string'
                        ? { side: openReply }
                        : { replyTo: openReply?.toString() }
                )}
                className="w-full md:w-4/5"
                Icon={<EditIcon className="h-6 stroke-[1.5px]" />}
            >
                <PostEvidence
                    id={item.hypothesisId}
                    replyTo={openReply}
                    onSubmit={() => setOpenReply(null)}
                />
            </Popup>

            {parentEvidence && (
                <div className={cn('relative', getIndentClass(level))}>
                    <div
                        className="absolute left-5 top-0 z-10"
                        style={{ height: '2rem', width: '1.25rem' }}
                    >
                        <div className="h-full w-full rounded-tl-lg border-l-2 border-t-2 border-cold-800"></div>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={handleParentClick}
                            className="flex items-center gap-2 rounded-lg border border-cold-600 bg-cold-100 px-3 py-2 text-sm text-cold-800 hover:bg-cold-200"
                        >
                            <span className="text-lg font-bold">+</span>
                            <span>View parent evidence</span>
                        </button>
                    </div>
                </div>
            )}

            <div className={cn('relative', getIndentClass(level))}>
                <EvidenceDetail item={item} className="mx-auto !w-full" onReply={setOpenReply} />

                {item.replies.length > 0 && (
                    <div
                        className="absolute left-5 top-full z-10"
                        style={{ height: 'calc(50%)', width: '1.25rem' }}
                    >
                        <div className="h-full w-full rounded-bl-lg border-b-2 border-l-2 border-cold-800"></div>
                    </div>
                )}
            </div>

            {item.replies.length > 0 && (
                <div className={getIndentClass(level + 1)}>
                    {loadingChildren ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-sm text-cold-600">Loading replies...</div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {childrenEvidence.map((childItem, index) => (
                                <div key={childItem.id.toString()} className="relative">
                                    {index === 0 && (
                                        <div
                                            className="absolute -left-10 top-0 z-10"
                                            style={{ height: '50%', width: '2.5rem' }}
                                        >
                                            <div className="absolute left-0 top-1/2 h-0.5 w-full bg-cold-800"></div>
                                        </div>
                                    )}

                                    <EvidenceDetail
                                        item={childItem}
                                        className="mx-auto !w-full"
                                        onReply={setOpenReply}
                                    />

                                    {childItem.replies.length > 0 && (
                                        <div className="mt-2 flex items-center">
                                            <button
                                                onClick={() =>
                                                    toggleChildExpansion(childItem.id.toString())
                                                }
                                                className="flex items-center gap-2 rounded-lg border border-cold-600 bg-cold-100 px-3 py-2 text-sm text-cold-800 hover:bg-cold-200"
                                            >
                                                <span
                                                    className={cn(
                                                        'text-lg font-bold transition-transform',
                                                        expandedChildren[childItem.id.toString()] &&
                                                            'rotate-45'
                                                    )}
                                                >
                                                    +
                                                </span>
                                                <span>
                                                    {expandedChildren[childItem.id.toString()]
                                                        ? 'Hide replies'
                                                        : `Show ${childItem.replies.length} replies`}
                                                </span>
                                            </button>
                                        </div>
                                    )}

                                    {expandedChildren[childItem.id.toString()] &&
                                        childItem.replies.length > 0 && (
                                            <div className="mt-4 border-l-2 border-cold-300 pl-4">
                                                <EvidenceDetailGroup
                                                    item={childItem}
                                                    level={level + 2}
                                                />
                                            </div>
                                        )}

                                    {index < childrenEvidence.length - 1 && (
                                        <div
                                            className="absolute -left-10 top-full z-10"
                                            style={{ height: '1rem', width: '0.125rem' }}
                                        >
                                            <div className="ml-10 h-full w-0.5 bg-cold-800"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default EvidenceDetailGroup
