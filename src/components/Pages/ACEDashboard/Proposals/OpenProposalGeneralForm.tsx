import { Dispatch, SetStateAction, useMemo } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import ICPIcon from '@components/Assets/icp.svg'
import Divider from '@components/Shared/Divider'
import { GeneralForm } from '@utils/dashboard/proposal'
import { amountOf, valueOf } from 'shared/utils/tokens'

const OpenProposalDetachmentForm = ({
    form,
    setForm,
    onBack,
    onForward,
}: {
    form: GeneralForm
    setForm: Dispatch<SetStateAction<GeneralForm | null>>
    onBack: () => void
    onForward: () => void
}) => {
    const validForm = useMemo(() => form.title[0].length > 0 && form.content[0].length > 0, [form])

    return (
        <div className="gap-normal flex flex-col place-items-center items-center text-cold-800">
            <div className="gap-normal flex w-full flex-col justify-center">
                <p className="text-medium text-center font-light">Fill in the general details</p>
                <div className="gap-normal mx-auto flex w-full flex-col">
                    <input
                        type="text"
                        placeholder="Enter Proposal Title"
                        value={form.title[0]}
                        disabled={!form.title[1]}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev!,
                                title: [e.target.value, prev!.title[1]],
                            }))
                        }
                        className="input w-full"
                    />
                    <textarea
                        placeholder="Enter Proposal Content"
                        value={form.content[0]}
                        disabled={!form.content[1]}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev!,
                                content: [e.target.value, prev!.content[1]],
                            }))
                        }
                        className="input h-32 w-full"
                    />
                    <div className="gap-small grid grid-cols-2">
                        <div className="relative flex">
                            <input
                                type="number"
                                placeholder="Enter Acorn Reward"
                                value={valueOf(form.acornReward[0])}
                                disabled={!form.acornReward[1]}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev!,
                                        acornReward: [
                                            amountOf(Number(e.target.value)),
                                            prev!.acornReward[1],
                                        ],
                                    }))
                                }
                                aria-selected={!!form.acornReward[0]}
                                className="input z-10 w-full rounded-l-md rounded-r-none"
                            />
                            <span className="px-medium z-0 flex items-center justify-center rounded-r-md border border-l-0 border-cold-400 bg-cold-100 ">
                                <AcornIcon className="h-6 text-cold-800" />
                            </span>
                        </div>
                        <div className="relative flex">
                            <input
                                type="number"
                                placeholder="Enter ICP Reward"
                                value={valueOf(form.icpReward[0])}
                                disabled={!form.icpReward[1]}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev!,
                                        icpReward: [
                                            amountOf(Number(e.target.value)),
                                            prev!.icpReward[1],
                                        ],
                                    }))
                                }
                                aria-selected={!!form.icpReward[0]}
                                className="input z-10 w-full rounded-l-md rounded-r-none"
                            />
                            <span className="px-medium z-0 flex items-center justify-center rounded-r-md border border-l-0 border-cold-400 bg-cold-100 ">
                                <ICPIcon className="h-6 fill-cold-800 text-cold-100" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <div className="gap-small flex w-full justify-between">
                <button
                    className="button w-auto min-w-36 bg-cold-700 hover:bg-cold-800 md:min-w-48"
                    onClick={() => onBack()}
                >
                    Back to Technical Form
                </button>
                <button
                    className="button w-auto min-w-36 bg-cold-700 hover:bg-cold-800 md:min-w-48"
                    onClick={() => onForward()}
                    disabled={!validForm}
                >
                    {!validForm ? 'Fill out all fields' : `Preview your Proposal`}
                </button>
            </div>
        </div>
    )
}

export default OpenProposalDetachmentForm
