'use client'

import CodeIcon from '@components/Assets/code.svg'
import ConfigsIcon from '@components/Assets/configs.svg'
import DelegatedIcon from '@components/Assets/delegated.svg'
import FieldIcon from '@components/Assets/field.svg'
import StatusApprovedIcon from '@components/Assets/status_approved.svg'
import StatusExecutedIcon from '@components/Assets/status_executed.svg'
import StatusExpiredIcon from '@components/Assets/status_expired.svg'
import StatusFailedIcon from '@components/Assets/status_failed.svg'
import StatusProposedIcon from '@components/Assets/status_proposed.svg'
import StatusRejectedIcon from '@components/Assets/status_rejected.svg'
import StatusRetriedIcon from '@components/Assets/status_retried.svg'
import UserIcon from '@components/Assets/user.svg'
import VoteFalseIcon from '@components/Assets/vote_false.svg'
import VoteTrueIcon from '@components/Assets/vote_true.svg'
import { increaseVersion } from '@utils/indicator/wasm'
import { DDAO } from 'shared/types/services'
import { Indicator } from 'shared/utils/services'
import { UnwrapVariant } from 'shared/utils/typings'

export enum ECategory {
    Code = 'Code',
    Field = 'Field',
    Worker = 'Worker',
    Configs = 'Configs',
}

export type GeneralForm = {
    title: [string, boolean]
    content: [string, boolean]
    icpReward: [bigint, boolean]
    acornReward: [bigint, boolean]
}
export type DetachmentForm = {
    [ECategory.Code]: [DDAO.SharableCode, Record<ActorName, Commitment>]
    [ECategory.Field]: DDAO.SharableField
    [ECategory.Worker]: DDAO.SharableWorker
    [ECategory.Configs]: DDAO.SharableConfigs__1
}

export const PROPOSAL_TYPES = {
    [ECategory.Code]: {
        defaultDetachment: [
            {
                actorsConfigs: [],
                installation: {
                    updateLevel: null,
                    releaseNotes: [],
                    commitments: [],
                    commitHash: '',
                },
            },
            {},
        ],
        description: "Code Proposals are for upgrading Axiom's canisters through WASM files",
        Icon: CodeIcon,
    },
    [ECategory.Configs]: {
        defaultDetachment: { actorsConfigs: [] },
        description:
            "Configs Proposals are for updating the configuration variables of Axiom's canisters",
        Icon: ConfigsIcon,
    },
    [ECategory.Field]: {
        defaultDetachment: { name: '', description: '' },
        description: 'Field Proposals are for creating new fields to Axiom',
        Icon: FieldIcon,
    },
    [ECategory.Worker]: {
        defaultDetachment: {},
        description: 'Worker Proposals are for rewarding workers for their contributions',
        Icon: UserIcon,
    },
}

export enum EStatus {
    Failed = 'Failed',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Proposed = 'Proposed',
    Executed = 'Executed',
    Retried = 'Retried',
    Expired = 'Expired',
}
export const STATUS_TYPES = {
    [EStatus.Failed]: {
        Icon: StatusFailedIcon,
        title: 'Execution Failed',
    },
    [EStatus.Approved]: {
        Icon: StatusApprovedIcon,
        title: 'Approved',
    },
    [EStatus.Rejected]: {
        Icon: StatusRejectedIcon,
        title: 'Rejected',
    },
    [EStatus.Proposed]: {
        Icon: StatusProposedIcon,
        title: 'Proposed',
    },
    [EStatus.Executed]: {
        Icon: StatusExecutedIcon,
        title: 'Executed',
    },
    [EStatus.Retried]: {
        Icon: StatusRetriedIcon,
        title: 'Retried',
    },
    [EStatus.Expired]: {
        Icon: StatusExpiredIcon,
        title: 'Expired',
    },
}

export const parseStatus = (status: DDAO.Status): EStatus => {
    const s = UnwrapVariant(status)
    return (Array.isArray(s) ? s[0] : s) as EStatus
}

export enum EVote {
    Positive = 'Positive',
    Negative = 'Negative',
    Delegated = 'Delegated',
}

export const VOTES = {
    [EVote.Positive]: {
        name: 'ACCEPT',
        bgColor: 'bg-primary-400',
        fillColor: 'fill-primary-400',
        textColor: 'text-primary-400',
        borderColor: 'border-primary-400',
        Icon: VoteTrueIcon,
    },
    [EVote.Negative]: {
        name: 'REJECT',
        bgColor: 'bg-primary-800',
        fillColor: 'fill-primary-800',
        textColor: 'text-primary-800',
        borderColor: 'border-primary-800',
        Icon: VoteFalseIcon,
    },
    [EVote.Delegated]: {
        name: 'DELEGATE',
        bgColor: 'bg-cold-700',
        fillColor: 'fill-cold-700',
        textColor: 'text-cold-700',
        borderColor: 'border-cold-700',
        Icon: DelegatedIcon,
    },
}

export const getGeneralForm = async <T extends ECategory>(
    category: T,
    detachmentForm: DetachmentForm[T],
    configs: Record<string, UnwrapDVariant<DDAO.SharableValue>>
): Promise<GeneralForm> => {
    switch (category) {
        case ECategory.Code: {
            if (
                UnwrapVariant(
                    (detachmentForm as DetachmentForm[ECategory.Code])[0].installation.updateLevel
                )
            ) {
                const [major, minor, patch] = await Indicator.call()
                    .getVersion()
                    .then((res) => res.split('.').map((v) => Number(v)))
                const [newMajor, newMinor, newPatch] = increaseVersion(
                    [major, minor, patch],
                    (detachmentForm as DetachmentForm[ECategory.Code])[0].installation.updateLevel
                )
                return {
                    title: [
                        `Migrate ${major}.${minor}.${patch} -> ${newMajor}.${newMinor}.${newPatch} with ${(detachmentForm as DetachmentForm[ECategory.Code])[0].installation.commitments.length} Actors affected`,
                        false,
                    ],
                    content: ['', true],
                    icpReward: [0n, true],
                    acornReward: [0n, true],
                }
            }
            break
        }
        case ECategory.Configs: {
            if ((detachmentForm as DetachmentForm[ECategory.Configs]).actorsConfigs?.length) {
                return {
                    title: [
                        `Update ${(
                            detachmentForm as DetachmentForm[ECategory.Configs]
                        ).actorsConfigs.reduce(
                            (acc, actor) => acc + actor[1].length,
                            0
                        )} Configuration Variables with ${(detachmentForm as DetachmentForm[ECategory.Configs]).actorsConfigs.length} Actors affected`,
                        false,
                    ],
                    content: ['', true],
                    icpReward: [0n, true],
                    acornReward: [0n, true],
                }
            }
            break
        }
        case ECategory.Field:
            return {
                title: [
                    `Propose to create ${(detachmentForm as DetachmentForm[ECategory.Field]).name} Field`,
                    false,
                ],
                content: ['', true],
                icpReward: [configs['FIELD_PROPOSAL_FIXED_ICP_REWARD'][1] as bigint, false],
                acornReward: [configs['FIELD_PROPOSAL_FIXED_ACORN_REWARD'][1] as bigint, false],
            }
        case ECategory.Worker:
            return {
                title: ['', true],
                content: ['', true],
                icpReward: [0n, true],
                acornReward: [0n, true],
            }
    }
    return {
        title: ['', true],
        content: ['', true],
        icpReward: [0n, true],
        acornReward: [0n, true],
    }
}
