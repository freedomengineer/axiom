import { useMemo } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import Divider from '@components/Shared/Divider'
import useConfigs from '@hooks/useConfigs'
import { DetachmentForm, ECategory, PROPOSAL_TYPES } from '@utils/dashboard/proposal'
import { DDAO } from 'shared/types/services'
import { valueOf } from 'shared/utils/tokens'

import CodeForm from './ProposalForms/CodeForm'
import ConfigsForm from './ProposalForms/ConfigsForm'
import FieldForm from './ProposalForms/FieldForm'

const OpenProposalDetachmentForm = ({
    form,
    setForm,
    category,
    setCategory,
    editableCategory,
    onForward,
}: {
    form: DetachmentForm[ECategory]
    setForm: (form: DetachmentForm[ECategory]) => void
    category: ECategory | undefined
    setCategory: (category: ECategory) => void
    editableCategory: boolean
    onForward: () => void
}) => {
    const configs = useConfigs('DAO')

    const validForm = useMemo(() => {
        if (!category || (category !== ECategory.Worker && Object.keys(form).length === 0))
            return false

        switch (category) {
            case ECategory.Code:
                return (
                    form[0].installation.commitHash.length > 0 &&
                    form[0].installation.commitments.length > 0 &&
                    form[0].installation.releaseNotes.length > 0 &&
                    form[0].installation.updateLevel !== null
                )
            case ECategory.Configs:
                return (form as DetachmentForm[ECategory.Configs]).actorsConfigs.length > 0
            case ECategory.Field:
                return (
                    (form as DetachmentForm[ECategory.Field]).name.length > 0 &&
                    (form as DetachmentForm[ECategory.Field]).description.length > 0
                )
            case ECategory.Worker:
                return true
        }
    }, [category, form])

    return (
        <div className="gap-normal flex flex-col place-items-center items-center text-cold-800">
            <div className="gap-normal flex w-full flex-col justify-center">
                <p className="text-medium text-center font-light">Select your proposal category</p>
                <div className="gap-normal mx-auto grid w-full grid-cols-1 grid-rows-4 md:grid-cols-4 md:grid-rows-1">
                    {Object.entries(PROPOSAL_TYPES).map(([key, { description, Icon }]) => (
                        <button
                            key={key}
                            className="gap-small p-medium group flex w-full transform flex-col items-center justify-center rounded-xl border-2 border-cold-800 bg-cold-800 bg-opacity-0 text-cold-800 transition-all duration-300 ease-in-out hover:bg-opacity-20 disabled:pointer-events-none disabled:opacity-50 aria-checked:pointer-events-none aria-selected:bg-opacity-100 aria-selected:text-white aria-selected:hover:bg-opacity-80"
                            onClick={() => setCategory(key as ECategory)}
                            aria-selected={category === key}
                            aria-checked={category === key}
                            disabled={!editableCategory}
                        >
                            <div className="text-medium flex w-full items-center justify-between">
                                <div className="gap-small flex items-center">
                                    <Icon className="h-4 stroke-2 md:h-5 xl:h-6" />
                                    <span>{key}</span>
                                </div>
                                <div className="gap-small flex items-center">
                                    <span>
                                        -{' '}
                                        {valueOf(
                                            configs?.[
                                                `${key.toUpperCase()}_PROPOSAL_OPEN_FEE`
                                            ][1] as bigint
                                        )}
                                    </span>
                                    <AcornIcon className="h-4 -translate-y-0.5 stroke-[1.5px] md:h-5" />
                                </div>
                            </div>
                            <span className="text-tiny mb-auto text-left font-light">
                                {description}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            {((category && category === ECategory.Worker) || Object.keys(form).length !== 0) &&
                {
                    [ECategory.Code]: (
                        <CodeForm form={form as DetachmentForm[ECategory.Code]} setForm={setForm} />
                    ),
                    [ECategory.Configs]: (
                        <ConfigsForm
                            form={form as DetachmentForm[ECategory.Configs]}
                            setForm={setForm}
                        />
                    ),
                    [ECategory.Field]: (
                        <FieldForm
                            form={form as DetachmentForm[ECategory.Field]}
                            setForm={setForm}
                        />
                    ),
                    [ECategory.Worker]: <></>,
                }[category]}
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <button
                className="button w-auto min-w-36 bg-cold-800 md:min-w-48"
                onClick={() => onForward()}
                disabled={!validForm}
            >
                {!category
                    ? 'Select a category'
                    : !validForm
                      ? 'Fill out all fields'
                      : `Proceed to General Form`}
            </button>
        </div>
    )
}

export default OpenProposalDetachmentForm
