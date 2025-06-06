'use client'

import { useState } from 'react'

import Spinner from '@components/Primitives/Spinner'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { EVote } from '@utils/feed/evidence'
import { DAxioms } from 'shared/types/services'
import { Variant } from 'shared/utils/typings'

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
    const { principal } = useAuth()
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
                replyTo={replyTo}
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
