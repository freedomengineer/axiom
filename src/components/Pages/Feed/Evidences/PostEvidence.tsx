'use client'

import { useEffect, useState } from 'react'

import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { EVote } from '@utils/feed/evidence'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { Variant, Wrap, isNullish } from 'shared/utils/typings'

import PostEvidenceForm from './PostEvidenceForm'
import PostEvidencePreview from './PostEvidencePreview'

enum EStep {
    Form,
    Preview,
}

const PostEvidence = ({
    id,
    side,
    replyTo,
    onSubmit,
}: {
    id: bigint
    side?: EVote | null
    replyTo?: bigint | null
    onSubmit?: (side: EVote) => void
}) => {
    const { principal, agent } = useAuth()
    const configs = useConfigs('Axioms')

    const [step, setStep] = useState(EStep.Form)
    const [form, setForm] = useState<{
        Hyperlink: DAxioms.Hyperlink | null
        Note: DAxioms.Note | null
        Picture: DAxioms.Picture | null
    }>({
        Hyperlink: null,
        Note: null,
        Picture: null,
    })
    const [localSide, setLocalSide] = useState<EVote | null>(side ?? null)
    const [replyingEvidence, setReplyingEvidence] = useState<DAxioms.SharableEvidence | null>(null)

    useEffect(() => {
        if (!isNullish(replyTo)) {
            Axioms.call(agent).getEvidence(replyTo).then(setReplyingEvidence)
        }
    }, [replyTo])

    return {
        [EStep.Form]: (
            <PostEvidenceForm
                configs={configs}
                form={form}
                setForm={setForm}
                side={localSide}
                setSide={setLocalSide}
                onForward={() => setStep(EStep.Preview)}
            />
        ),
        [EStep.Preview]: (
            <PostEvidencePreview
                replyingEvidence={replyingEvidence}
                item={{
                    id,
                    callerVote: [],
                    votes: { powered: [0n, 0n], regular: [0n, 0n] },
                    publishDate: BigInt(Date.now() * 1_000_000),
                    form: Object.entries(form)
                        .filter(([_, value]) => value)
                        .map(([key, value]) => Variant(key, value) as DAxioms.Format),
                    choice: Variant(localSide ?? EVote.Positive),
                    publisher: principal!,
                    repliedTo: Wrap(replyingEvidence?.id),
                    replies: [],
                    hypothesisId: id,
                }}
                totalFee={Object.entries(form).reduce(
                    (acc, [key, value]) =>
                        acc +
                        (value
                            ? key === 'Note' && 'extended' in value && value.extended
                                ? (configs?.['EVIDENCE_EXTENDED_NOTE_FEE'][1] as bigint)
                                : (configs?.[`EVIDENCE_${key.toUpperCase()}_FEE`][1] as bigint)
                            : 0n),
                    0n
                )}
                onBack={() => setStep(EStep.Form)}
                onSubmit={onSubmit}
            />
        ),
    }[step]
}

export default PostEvidence
