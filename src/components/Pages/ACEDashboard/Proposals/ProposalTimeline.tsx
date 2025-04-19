import { Principal } from '@dfinity/principal'
import { Step, Stepper } from '@material-tailwind/react'

import StatusExecuted from '@components/Assets/status_executed.svg'
import StatusRetried from '@components/Assets/status_retried.svg'
import StatusReview from '@components/Assets/status_review.svg'
import Link from '@components/Shared/Link'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { formatCanisterDate } from '@libs/date'
import { build } from '@libs/url'
import { ECategory, EStatus, STATUS_TYPES, parseStatus } from '@utils/dashboard/proposal'
import {
    MILLIS_IN_A_DAY,
    MILLIS_IN_A_MINUTE,
    NANOS_IN_A_DAY,
    NANO_TO_MILLI,
} from 'shared/constants'
import { DDAO } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

const ProposalTimeline = ({
    timeline,
    id,
    proposer,
    category,
    setOpenReason,
}: {
    timeline: DDAO.Milestone[]
    id: bigint
    proposer: Principal
    category: ECategory
    setOpenReason?: (index: number) => void
}) => {
    const configs = useConfigs('DAO')
    const { principal } = useAuth()

    const lastStatus = parseStatus(timeline[timeline.length - 1].status)
    const isProposer = principal && proposer.compareTo(principal) === 'eq'
    const retriable =
        category !== ECategory.Code &&
        [EStatus.Failed, EStatus.Rejected, EStatus.Expired].includes(lastStatus) &&
        timeline.filter(({ status }) => UnwrapVariant(status) === EStatus.Retried).length <
            (configs?.['MAX_PROPOSAL_RETRIES'][1] as bigint)
    const now = BigInt(new Date().getTime())

    const renders = [
        ...timeline.map(({ status, date }) => {
            const data = STATUS_TYPES[parseStatus(status)]
            return {
                Icon: data.Icon,
                title: data.title,
                description: formatCanisterDate({ nano: date }, true),
            }
        }),
        (lastStatus === EStatus.Proposed || lastStatus === EStatus.Retried) && {
            Icon: StatusReview,
            title: 'In Review',
            description: formatCanisterDate(
                {
                    nano:
                        timeline[timeline.length - 1].date +
                        NANOS_IN_A_DAY *
                            ((configs?.['PROPOSAL_VOTE_AVAILABILITY_DURATION'][1] as bigint) ??
                                0n) +
                        (now % MILLIS_IN_A_DAY) * NANO_TO_MILLI,
                },
                true
            ),
        },
        lastStatus === EStatus.Approved && {
            Icon: StatusExecuted,
            title: 'Awaiting Execution',
            description: formatCanisterDate(
                {
                    milli: Number(
                        now -
                            (now % MILLIS_IN_A_DAY) +
                            5n * MILLIS_IN_A_MINUTE +
                            (now % MILLIS_IN_A_DAY >= 5n * MILLIS_IN_A_MINUTE ? 1n : 0n) *
                                MILLIS_IN_A_DAY
                    ),
                },
                true
            ),
        },
        retriable && {
            title: 'Awaiting Retry',
            Icon: StatusRetried,
            description: '???',
        },
    ].filter((x) => x) as {
        Icon: React.FC<React.SVGProps<SVGSVGElement>>
        title: string
        description: string
    }[]

    return (
        <Stepper
            activeStep={timeline.length - 1}
            activeLineClassName="bg-primary-800"
            className="mb-semilarge mt-extralarge mx-auto w-[90%]"
        >
            {renders.map(({ Icon, title, description }, index) => (
                <Step
                    key={index}
                    activeClassName="w-7 h-7 md:h-8 md:w-8 bg-primary-600"
                    completedClassName="w-7 h-7 md:h-8 md:w-8 bg-primary-800 "
                    className="h-7 w-7 bg-gray-300 md:h-8 md:w-8"
                >
                    {title === 'Awaiting Retry' && isProposer && retriable ? (
                        <Link
                            href={build(['dashboard', 'open'], { id, category })}
                            className={cn(
                                '!text-tiny pre-underline absolute bottom-[30px] cursor-pointer text-nowrap text-center font-light text-cold-800 decoration-cold-800/50 hover:decoration-cold-800/100 disabled:pointer-events-none disabled:decoration-transparent md:bottom-[34px]'
                            )}
                            size="small"
                            color="cold-800"
                        >
                            {title}
                        </Link>
                    ) : (
                        <button
                            onClick={() => setOpenReason && setOpenReason(index)}
                            disabled={title !== 'Execution Failed'}
                            className={cn(
                                '!text-tiny pre-underline absolute bottom-[30px] cursor-pointer text-nowrap text-center disabled:pointer-events-none disabled:decoration-transparent md:bottom-[34px]',
                                index < timeline.length - 1 && 'font-medium text-primary-800',
                                index === timeline.length - 1 &&
                                    'font-medium text-primary-600 decoration-primary-600/50 hover:decoration-primary-600/100',
                                index > timeline.length - 1 &&
                                    'font-light text-cold-800 decoration-primary-600/50 hover:decoration-primary-600/100'
                            )}
                        >
                            {title}
                        </button>
                    )}
                    <Icon className="p-normal stroke-2" />
                    <p
                        className={cn(
                            '!text-extratiny top-extralarge absolute hidden text-nowrap text-center md:inline',
                            index < timeline.length - 1 && 'font-normal text-primary-800',
                            index === timeline.length - 1 && 'font-normal text-primary-600',
                            index > timeline.length - 1 && 'font-light text-cold-800'
                        )}
                    >
                        {description}
                    </p>
                </Step>
            ))}
        </Stepper>
    )
}

export default ProposalTimeline
