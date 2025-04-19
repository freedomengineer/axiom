'use client'

import { useEffect, useState } from 'react'

import Spinner from '@components/Primitives/Spinner'
import useAuth from '@hooks/useAuth'
import { Axioms } from 'shared/utils/services'
import { UnwrapVariant } from 'shared/utils/typings'

import PostHypothesisForm from './PostHypothesisForm'
import PostHypothesisPreview from './PostHypothesisPreview'

enum EStep {
    Form,
    Preview,
}

const PostHypothesis = ({ id, onSubmit }: { id?: string; onSubmit?: () => void }) => {
    const { agent, principal } = useAuth()

    const [fieldId, setFieldId] = useState<string | undefined>(id)
    const [content, setContent] = useState<string>('')
    const [step, setStep] = useState<number>(EStep.Form)

    useEffect(() => {
        id &&
            Axioms.call(agent)
                .getField(id)
                .then(
                    (field) => UnwrapVariant(field.callerRole) !== 'Member' && setFieldId(undefined)
                )
                .catch(() => setFieldId(undefined))
    }, [])

    return {
        [EStep.Form]: (
            <PostHypothesisForm
                field={fieldId}
                content={content}
                setField={setFieldId}
                setContent={setContent}
                onForward={() => setStep(EStep.Preview)}
            />
        ),
        [EStep.Preview]: principal ? (
            <PostHypothesisPreview
                item={{
                    id: 0n,
                    content,
                    axioms: 0n,
                    callerVote: [],
                    votes: { powered: [0n, 0n, 0n], regular: [0n, 0n, 0n] },
                    publishDate: BigInt(Date.now() * 1_000_000),
                    publisher: principal!,
                    callerAxiom: [],
                    callerBookmark: [],
                    fieldId: fieldId!,
                    evidenceIds: [],
                }}
                onBack={() => setStep(EStep.Form)}
                onSubmit={onSubmit}
            />
        ) : (
            <Spinner />
        ),
    }[step]
}

export default PostHypothesis
