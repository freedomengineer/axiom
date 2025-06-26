import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import Divider from '@components/Shared/Divider'
import Link from '@components/Shared/Link'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { build } from '@libs/url'
import { DetachmentForm, ECategory, GeneralForm } from '@utils/dashboard/proposal'
import { NANO_TO_MILLI } from 'shared/constants'
import { DDAO } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { Proportion } from 'shared/utils/proportion'
import { ACORN, DAO, Indicator, Treasury } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'
import { Variant, isNullish } from 'shared/utils/typings'

import ProposalCard from './ProposalCard'

const OpenProposalPreview = ({
    category,
    id,
    generalForm,
    detachmentForm,
    onBack,
    onSubmit,
}: {
    category: ECategory
    id: bigint | undefined
    generalForm: GeneralForm
    detachmentForm: DetachmentForm[ECategory]
    onBack: () => void
    onSubmit?: (category: ECategory) => void
}) => {
    const { agent, principal } = useAuth()
    const configs = useConfigs('DAO')
    const navigate = useNavigate()

    const [terms, setTerms] = useState<[boolean, boolean]>([false, false])
    const [loading, setLoading] = useState(false)
    const [isSufficient, setIsSufficient] = useState(true)

    const fee = !configs
        ? 0n
        : isNullish(id)
          ? (configs?.[`${category.toUpperCase()}_PROPOSAL_OPEN_FEE`][1] as bigint)
          : e8s.deductBy(
                configs?.[`${category.toUpperCase()}_PROPOSAL_OPEN_FEE`][1] as bigint,
                configs?.['PROPOSAL_RETRY_FEE_DEDUCTION'][1] as Proportion
            )

    const retry = async () => {
        setLoading(true)
        const approve = await promise(
            ACORN.call(agent).icrc2_approve({
                amount: fee,
                spender: { owner: Treasury.principal, subaccount: [] },
                fee: [],
                from_subaccount: [],
                memo: [],
                created_at_time: [],
                expected_allowance: [],
                expires_at: [],
            }),
            'Approving ACORN to Axiom Treasury',
            'Approved ACORN to Axiom Treasury successfully!'
        )
        if (!approve.success) {
            setLoading(false)
            return
        }
        let res
        switch (category) {
            case ECategory.Configs: {
                res = await promise(
                    DAO.call(agent).retryConfigsProposal(
                        id!,
                        generalForm.content[0],
                        generalForm.acornReward[0],
                        generalForm.icpReward[0],
                        (detachmentForm as DetachmentForm[ECategory.Configs]).actorsConfigs
                    ),
                    'Retrying Configs Proposal',
                    'Retried Configs Proposal successfully!'
                )
                break
            }
            case ECategory.Field: {
                res = await promise(
                    DAO.call(agent).retryFieldProposal(
                        id!,
                        generalForm.content[0],
                        (detachmentForm as DetachmentForm[ECategory.Field]).name,
                        (detachmentForm as DetachmentForm[ECategory.Field]).description
                    ),
                    'Retrying Field Proposal',
                    'Retried Field Proposal successfully!'
                )
                break
            }
            case ECategory.Worker: {
                res = await promise(
                    DAO.call(agent).retryWorkerProposal(
                        id!,
                        generalForm.content[0],
                        generalForm.acornReward[0],
                        generalForm.icpReward[0]
                    ),
                    'Retrying Worker Proposal',
                    'Retried Worker Proposal successfully!'
                )
                break
            }
        }
        setLoading(false)
        if (res?.success) {
            if (onSubmit) onSubmit(category)
            else navigate(build(['dashboard', 'proposals', id!]))
        }
    }

    const post = async () => {
        setLoading(true)
        await promise(
            ACORN.call(agent).icrc2_approve({
                amount: fee,
                spender: { owner: Treasury.principal, subaccount: [] },
                fee: [],
                from_subaccount: [],
                memo: [],
                created_at_time: [],
                expected_allowance: [],
                expires_at: [],
            }),
            'Approving ACORN to Axiom Treasury',
            'Approved ACORN to Axiom Treasury successfully!'
        )
        let res
        switch (category) {
            case ECategory.Code: {
                await promise(
                    DAO.call(agent).initializeCodeUploadSession(
                        (detachmentForm as DetachmentForm[ECategory.Code])[0].installation
                            .commitHash,
                        (detachmentForm as DetachmentForm[ECategory.Code])[0].installation
                            .updateLevel,
                        (detachmentForm as DetachmentForm[ECategory.Code])[0].installation
                            .releaseNotes,
                        (detachmentForm as DetachmentForm[ECategory.Code])[0].installation
                            .commitments
                    ),
                    'Initializing Code Upload session',
                    'Initialized Code Upload session successfully!'
                )
                await Promise.all(
                    Object.entries((detachmentForm as DetachmentForm[ECategory.Code])[1]).map(
                        ([actor, commitment]) =>
                            Promise.all(
                                commitment.chunks.map((chunk, index) =>
                                    promise(
                                        Indicator.call(agent).uploadCommitmentChunk(
                                            Variant(actor) as DDAO.ActorVariant,
                                            index,
                                            chunk.blob,
                                            chunk.checksum
                                        ),
                                        `Uploading Commitment chunk ID ${index + 1} for ${actor}`,
                                        `Uploaded Commitment chunk ID ${index + 1} for ${actor} successfully!`
                                    )
                                )
                            )
                    )
                )
                await Promise.all(
                    Object.keys((detachmentForm as DetachmentForm[ECategory.Code])[1]).map(
                        (actor) =>
                            promise(
                                Indicator.call(agent).settleCommitment(
                                    Variant(actor) as DDAO.ActorVariant
                                ),
                                `Settling Commitment for ${actor}`,
                                `Settled Commitment for ${actor} successfully!`
                            )
                    )
                )
                res = await promise(
                    DAO.call(agent).openCodeProposal(
                        generalForm.content[0],
                        generalForm.acornReward[0],
                        generalForm.icpReward[0],
                        (detachmentForm as DetachmentForm[ECategory.Code])[0].actorsConfigs
                    ),
                    'Opening Code Proposal',
                    'Opened Code Proposal successfully!'
                )
                break
            }
            case ECategory.Configs: {
                res = await promise(
                    DAO.call(agent).openConfigsProposal(
                        generalForm.content[0],
                        generalForm.acornReward[0],
                        generalForm.icpReward[0],
                        (detachmentForm as DetachmentForm[ECategory.Configs]).actorsConfigs
                    ),
                    'Opening Configs Proposal',
                    'Opened Configs Proposal successfully!'
                )
                break
            }
            case ECategory.Field: {
                res = await promise(
                    DAO.call(agent).openFieldProposal(
                        generalForm.content[0],
                        (detachmentForm as DetachmentForm[ECategory.Field]).name,
                        (detachmentForm as DetachmentForm[ECategory.Field]).description
                    ),
                    'Opening Field Proposal',
                    'Opened Field Proposal successfully!'
                )
                break
            }
            case ECategory.Worker: {
                res = await promise(
                    DAO.call(agent).openWorkerProposal(
                        generalForm.title[0],
                        generalForm.content[0],
                        generalForm.acornReward[0],
                        generalForm.icpReward[0]
                    ),
                    'Opening Worker Proposal',
                    'Opened Worker Proposal successfully!'
                )
                break
            }
        }
        setLoading(false)
        if (res.success) {
            onSubmit?.(category)
            navigate(build(['dashboard', 'proposals', res.result]))
        }
    }

    return (
        <div className="gap-normal md:gap-semilarge flex flex-col md:flex-row md:justify-between">
            <div className="gap-normal pointer-events-none flex w-full flex-col md:w-3/5">
                <p className="text-medium text-center font-light">Preview</p>
                <ProposalCard
                    item={{
                        id: 0n,
                        title: generalForm.title[0],
                        icpReward: generalForm.icpReward[0],
                        content: generalForm.content[0],
                        callerVote: [],
                        votes: [[], [], [], []],
                        acornReward: generalForm.acornReward[0],
                        proposer: principal!,
                        timeline: [
                            {
                                status: Variant('Proposed') as DDAO.Status,
                                date: (BigInt(new Date().getTime()) * NANO_TO_MILLI) as DDAO.Time,
                            },
                        ],
                        detachment: Variant(
                            category,
                            category === ECategory.Code ? detachmentForm[0] : detachmentForm
                        ),
                    }}
                    className="mx-auto !w-full"
                />
            </div>
            <Divider
                className="hidden md:flex"
                direction="vertical"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <Divider
                className="!py-medium mx-auto flex w-4/5 md:hidden"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <div className="text-tiny gap-normal flex w-full flex-col md:w-2/5">
                <p className="text-medium text-center font-light">Confirmation</p>
                <BalanceChanges
                    token="ACORN"
                    amount={fee}
                    sign="-"
                    setIsSufficient={setIsSufficient}
                />
                <div
                    className={cn(
                        'gap-normal flex items-center text-cold-700 text-opacity-100',
                        !terms[0] && 'text-opacity-50'
                    )}
                >
                    <input
                        type="checkbox"
                        checked={terms[0]}
                        onChange={(e) => setTerms((prev) => [e.target.checked, prev[1]])}
                        className="h-5 w-5 cursor-pointer accent-cold-700 md:h-6 md:w-6"
                    />
                    <p className="w-fit">
                        {`I'm completely satisfied with my proposal and I understand that this is
                irreversible.`}
                    </p>
                </div>
                <div
                    className={cn(
                        'gap-normal flex items-center text-cold-700 text-opacity-100',
                        !terms[1] && 'text-opacity-50'
                    )}
                >
                    <input
                        type="checkbox"
                        checked={terms[1]}
                        onChange={(e) => setTerms((prev) => [prev[0], e.target.checked])}
                        className="h-5 w-5 cursor-pointer accent-cold-700 md:h-6 md:w-6"
                    />
                    <p className="w-fit">
                        I confirm that none of the information provided violate any of the{' '}
                        <Link
                            href="/terms"
                            target="_blank"
                            rel="noreferrer"
                            className="pre-underline text-tiny inline"
                            openInNewTab
                        >
                            Axiom Platform Standards
                        </Link>
                        .
                    </p>
                </div>
                <Divider
                    className="!py-medium mx-auto flex w-4/5 md:hidden"
                    direction="horizontal"
                    bgColor="bg-cold-800"
                    borderColor="border-cold-800"
                />
                <div className="gap-small mt-auto flex justify-between">
                    <button className="button w-full bg-cold-800" onClick={() => onBack()}>
                        Back to General Form
                    </button>
                    <button
                        className="button w-full"
                        onClick={isNullish(id) ? post : retry}
                        disabled={!terms[0] || !terms[1] || !isSufficient || loading}
                    >
                        {loading ? (
                            <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                        ) : !isSufficient ? (
                            <span>Insufficient ACORN balance</span>
                        ) : (
                            <>
                                Post with {valueOf(fee)}{' '}
                                <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OpenProposalPreview
