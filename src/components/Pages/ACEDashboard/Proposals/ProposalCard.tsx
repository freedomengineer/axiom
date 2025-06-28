import { Principal } from '@dfinity/principal'
import { useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import ICPIcon from '@components/Assets/icp.svg'
import StatusFailedIcon from '@components/Assets/status_failed.svg'
import Divider from '@components/Shared/Divider'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import { Symbol } from '@components/Shared/Username'
import useProposalDetails from '@hooks/useProposalDetails'
import cn from '@libs/class'
import { getCanisterDateTime, getDateTime } from '@libs/date'
import { build } from '@libs/url'
import { ECategory, EStatus, EVote } from '@utils/dashboard/proposal'
import { DDAO } from 'shared/types/services'
import { valueOf } from 'shared/utils/tokens'
import { UnwrapVariant } from 'shared/utils/typings'

import DelegatedProposalVote from './DelegatedProposalVote'
import CodeDetachment from './ProposalDetachments/CodeDetachment'
import ConfigsDetachment from './ProposalDetachments/ConfigsDetachment'
import FieldDetachment from './ProposalDetachments/FieldDetachment'
import ProposalTimeline from './ProposalTimeline'
import ProposalVote from './ProposalVote'
import ProposalVoters from './ProposalVoters'

const ProposalCard = ({ item, className }: { item: DDAO.SharableProposal; className?: string }) => {
    const {
        proposer,
        localItem,
        category,
        vote,
        voters,
        votesLoading,
        votable,
        allowToVote,
        delegatee,
        handleVote,
    } = useProposalDetails(item)
    const [openReason, setOpenReason] = useState<number | null>(null)

    return (
        <div
            className={cn(
                'text-small gap-medium relative my-auto flex h-min w-full flex-col rounded-lg border border-cold-600 border-opacity-50 font-normal text-cold-800 hover:border-opacity-100',
                className
            )}
        >
            <Popup
                open={openReason !== null}
                onClose={() => setOpenReason(null)}
                title={`Fail Reason`}
                className="w-auto max-w-[80vw]"
                Icon={
                    <StatusFailedIcon className="h-6 w-6 rounded-full border-[1.5px] border-current stroke-[1.5px] p-1" />
                }
            >
                <div className="gap-normal flex flex-col items-center justify-center">
                    <p className="text-normal font-normal text-red-800">
                        {getCanisterDateTime({ nano: localItem.timeline[openReason ?? 0].date })}{' '}
                        (Canister Time)
                        <br />
                        {getDateTime({ nano: localItem.timeline[openReason ?? 0].date })} (Local
                        Time)
                    </p>
                    <p className="text-small px-medium py-normal whitespace-pre-wrap rounded-lg bg-red-800 font-mono font-medium text-white">
                        {UnwrapVariant(localItem.timeline[openReason ?? 0].status)[1]}
                    </p>
                </div>
            </Popup>
            <ProposalTimeline
                timeline={localItem.timeline}
                id={localItem.id}
                proposer={localItem.proposer}
                category={category}
                setOpenReason={setOpenReason}
            />
            <Link
                className="text-medium pre-underline mx-auto text-center font-display font-bold text-primary-800 decoration-primary-800/50 hover:decoration-primary-800/100"
                size="large"
                href={build(['dashboard', 'proposals', localItem.id])}
            >
                <span className="text-medium">{localItem.title}</span>
            </Link>
            <p className="px-large text-small whitespace-pre-wrap text-cold-700">
                {localItem.content}
            </p>
            {category !== ECategory.Worker && (
                <div className="gap-small px-medium flex flex-col">
                    {
                        {
                            [ECategory.Code]: (
                                <CodeDetachment
                                    detachment={
                                        UnwrapVariant(localItem.detachment)[1] as DDAO.SharableCode
                                    }
                                    showOldValue={
                                        UnwrapVariant(
                                            localItem.timeline[localItem.timeline.length - 1].status
                                        ) !== EStatus.Executed
                                    }
                                />
                            ),
                            [ECategory.Configs]: (
                                <ConfigsDetachment
                                    detachment={
                                        UnwrapVariant(
                                            localItem.detachment
                                        )[1] as DDAO.SharableConfigs__1
                                    }
                                    showOldValue={
                                        UnwrapVariant(
                                            localItem.timeline[localItem.timeline.length - 1].status
                                        ) !== EStatus.Executed
                                    }
                                />
                            ),
                            [ECategory.Field]: (
                                <FieldDetachment
                                    detachment={
                                        UnwrapVariant(localItem.detachment)[1] as DDAO.SharableField
                                    }
                                />
                            ),
                        }[category]
                    }
                </div>
            )}
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-600"
                borderColor="border-cold-600"
            />
            {allowToVote && (
                <div className="px-medium text-tiny gap-normal grid grid-cols-4 font-normal text-white">
                    <ProposalVote
                        choice={EVote.Positive}
                        vote={[vote, delegatee]}
                        className="rounded-lg"
                        handleVote={() => handleVote(EVote.Positive)}
                        loading={votesLoading[EVote.Positive]}
                    />
                    <ProposalVote
                        choice={EVote.Negative}
                        vote={[vote, delegatee]}
                        className="rounded-lg"
                        handleVote={() => handleVote(EVote.Negative)}
                        loading={votesLoading[EVote.Negative]}
                    />
                    <DelegatedProposalVote
                        vote={[vote, delegatee]}
                        className="rounded-lg"
                        handleVote={(to: Principal) => handleVote(EVote.Delegated, to)}
                        loading={votesLoading[EVote.Delegated]}
                        voters={voters}
                    />
                </div>
            )}
            <div className="mx-auto grid grid-cols-10">
                <ProposalVoters
                    voters={voters[0]}
                    choice={EVote.Positive}
                    totalVoters={
                        voters[0].length + voters[1].length + voters[2].length + voters[3].length
                    }
                    displayPercentage={votable}
                />
                <ProposalVoters
                    voters={voters[1]}
                    choice={EVote.Negative}
                    totalVoters={
                        voters[0].length + voters[1].length + voters[2].length + voters[3].length
                    }
                    displayPercentage={votable}
                />
                <ProposalVoters
                    voters={voters[2]}
                    choice={EVote.Delegated}
                    totalVoters={
                        voters[0].length + voters[1].length + voters[2].length + voters[3].length
                    }
                    displayPercentage={votable}
                />
                <ProposalVoters
                    voters={voters[3]}
                    totalVoters={
                        voters[0].length + voters[1].length + voters[2].length + voters[3].length
                    }
                    displayPercentage={votable}
                />
            </div>
            <div className="px-medium py-small flex w-full place-items-center items-center justify-between rounded-b-lg bg-cold-900 text-white">
                <div className="gap-large flex w-full items-center">
                    <Link
                        className="gap-small flex items-center hover:opacity-75"
                        href={build(['profile', localItem.proposer.toText()])}
                    >
                        <Symbol
                            capitalRaised={proposer.capitalRaised.toString()}
                            className="mr-0 h-4 w-4"
                        />
                        <span className="text-tiny font-light text-white">{proposer.username}</span>
                    </Link>
                    <div className="gap-small flex items-center">
                        <AcornIcon className="h-4 w-4 text-white" />
                        <span className="text-tiny font-light text-white">
                            {valueOf(localItem.acornReward)}
                        </span>
                    </div>
                    <div className="gap-small flex items-center">
                        <ICPIcon className="h-4 w-4 fill-white stroke-0 text-cold-900" />
                        <span className="text-tiny font-light text-white">
                            {valueOf(localItem.icpReward)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProposalCard
