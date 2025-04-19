'use client'

import { useEffect, useState } from 'react'

import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import {
    DetachmentForm,
    ECategory,
    EStatus,
    GeneralForm,
    PROPOSAL_TYPES,
    getGeneralForm,
    parseStatus,
} from '@utils/dashboard/proposal'
import { DDAO } from 'shared/types/services'
import { DAO } from 'shared/utils/services'
import { UnwrapVariant, isNullish } from 'shared/utils/typings'

import OpenProposalDetachmentForm from './OpenProposalDetachmentForm'
import OpenProposalGeneralForm from './OpenProposalGeneralForm'
import OpenProposalPreview from './OpenProposalPreview'

enum EStep {
    GeneralForm,
    DetachmentForm,
    Preview,
}

const OpenProposal = ({
    category,
    id,
    onSubmit,
}: {
    category: ECategory | undefined
    id?: bigint
    onSubmit?: (category: ECategory) => void
}) => {
    const { principal } = useAuth()
    const configs = useConfigs('DAO')

    const [step, setStep] = useState(EStep.DetachmentForm)
    const [generalForm, setGeneralForm] = useState<GeneralForm | null>(null)
    const [detachmentForm, setDetachmentForm] = useState<
        UnwrapDVariant<DDAO.SharableDetachment>[1]
    >({})
    const [localCategory, setLocalCategory] = useState<ECategory | undefined>(category)
    const [localId, setLocalId] = useState<bigint | undefined>()
    const [proposal, setProposal] = useState<DDAO.SharableProposal | null>(null)

    useEffect(() => {
        if (isNullish(id) || isNullish(configs)) return
        ;(async () => {
            try {
                const proposal: DDAO.SharableProposal = await DAO.call().getProposal(id)

                if (principal && proposal.proposer.compareTo(principal) === 'eq') {
                    setProposal(proposal)
                }
            } catch {}
        })()
    }, [id, configs])

    useEffect(() => {
        if (isNullish(proposal) || isNullish(configs)) return

        const [category, detachment] = UnwrapVariant(proposal.detachment)
        const status = parseStatus(proposal.timeline[proposal.timeline.length - 1].status)
        const retries = proposal.timeline.filter(
            ({ status }) => UnwrapVariant(status) === EStatus.Retried
        ).length

        if (
            category === ECategory.Code ||
            ![EStatus.Failed, EStatus.Rejected, EStatus.Expired].includes(status) ||
            retries >= (configs['MAX_PROPOSAL_RETRIES'][1] as bigint)
        )
            return

        updateGeneralForm(category as ECategory, detachment, configs)
        setDetachmentForm(detachment)
        setLocalCategory(category as ECategory)
        setLocalId(id)
    }, [proposal, configs])

    const updateGeneralForm = async (
        category: ECategory,
        detachment: DetachmentForm[ECategory],
        configs: Record<string, UnwrapDVariant<DDAO.SharableValue>>
    ) => {
        let general = await getGeneralForm(category, detachment, configs)
        if (proposal) {
            general = Object.fromEntries(
                Object.entries(general).map(([k, [value, editable]]) =>
                    !editable
                        ? [k, [value, editable]]
                        : k === 'title'
                          ? [k, [proposal[k], false]]
                          : [k, [proposal[k], editable]]
                )
            )
        }
        setGeneralForm(general)
    }

    return {
        [EStep.DetachmentForm]: (
            <OpenProposalDetachmentForm
                category={localCategory}
                form={detachmentForm}
                setForm={setDetachmentForm}
                setCategory={(category) => {
                    const detachment = PROPOSAL_TYPES[category].defaultDetachment
                    setDetachmentForm(detachment)
                    setLocalCategory(category)
                }}
                editableCategory={isNullish(localId)}
                onForward={() => {
                    updateGeneralForm(localCategory as ECategory, detachmentForm!, configs!)
                    setStep(EStep.GeneralForm)
                }}
            />
        ),
        [EStep.GeneralForm]: generalForm && (
            <OpenProposalGeneralForm
                form={generalForm}
                setForm={setGeneralForm}
                onBack={() => setStep(EStep.DetachmentForm)}
                onForward={() => setStep(EStep.Preview)}
            />
        ),
        [EStep.Preview]: (
            <OpenProposalPreview
                category={localCategory!}
                id={localId}
                generalForm={generalForm!}
                detachmentForm={detachmentForm}
                onBack={() => setStep(EStep.GeneralForm)}
                onSubmit={onSubmit}
            />
        ),
    }[step]
}

export default OpenProposal
