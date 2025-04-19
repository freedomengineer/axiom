import { Dispatch, SetStateAction } from 'react'

import Select from '@components/Primitives/Select'
import Divider from '@components/Shared/Divider'
import { DetachmentForm, ECategory } from '@utils/dashboard/proposal'
import { UPDATE_LEVELS } from '@utils/indicator/configs'
import { DDAO } from 'shared/types/services'
import { UnwrapVariant, Variant } from 'shared/utils/typings'

import ConfigsAndCommitmentsForm from './ConfigsAndWasmUpload'
import ReleaseNotesForm from './ReleaseNoteInput'

const CodeForm = ({
    form,
    setForm,
}: {
    form: DetachmentForm[ECategory.Code]
    setForm: Dispatch<SetStateAction<DetachmentForm[ECategory.Code]>>
}) => {
    return (
        <>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <p className="text-medium text-center font-light">Fill in the commit details</p>
            <div className="gap-small mx-auto grid w-full grid-cols-2">
                <Select
                    placeholder="Update Level"
                    value={UnwrapVariant(form[0].installation.updateLevel)}
                    onChange={(value) =>
                        setForm((prev) => [
                            {
                                ...prev[0],
                                installation: {
                                    ...prev[0].installation,
                                    updateLevel: Variant(value) as DDAO.UpdateLevel,
                                },
                            },
                            prev[1],
                        ])
                    }
                    options={UPDATE_LEVELS.map((label) => ({ label }))}
                />
                <input
                    type="text"
                    placeholder="Commit Hash"
                    value={form[0].installation.commitHash}
                    onChange={(e) =>
                        setForm((prev) => [
                            {
                                ...prev[0],
                                installation: {
                                    ...prev[0].installation,
                                    commitHash: e.target.value,
                                },
                            },
                            prev[1],
                        ])
                    }
                    aria-selected={!!form[0].installation.commitHash}
                    className="input"
                />
            </div>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <p className="text-medium text-center font-light">Fill in the release notes</p>
            <div className="gap-x-small gap-y-normal mx-auto flex w-full flex-col md:grid md:grid-cols-2">
                <ReleaseNotesForm
                    releaseNotes={form[0].installation.releaseNotes}
                    setReleaseNotes={(releaseNotes) =>
                        setForm((prev) => [
                            {
                                ...prev[0],
                                installation: { ...prev[0].installation, releaseNotes },
                            },
                            prev[1],
                        ])
                    }
                />
            </div>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <p className="text-medium text-center font-light">
                Fill in the Actors&lsquo; WASM file and modified configs
            </p>
            <div className="gap-normal text-small flex w-full flex-col">
                <ConfigsAndCommitmentsForm
                    configs={form[0].actorsConfigs}
                    commitments={form[0].installation.commitments}
                    setConfigs={(actorsConfigs) =>
                        setForm((prev) => [{ ...prev[0], actorsConfigs }, prev[1]])
                    }
                    setCommitments={(commitments) =>
                        setForm((prev) => [
                            {
                                ...prev[0],
                                installation: { ...prev[0].installation, commitments },
                            },
                            prev[1],
                        ])
                    }
                    rawCommitments={form[1]}
                    setRawCommitments={(commitments) => setForm((prev) => [prev[0], commitments])}
                />
            </div>
        </>
    )
}

export default CodeForm
