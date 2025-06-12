import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import DownIcon from '@components/Assets/down.svg'
import NotificationIcon from '@components/Assets/notification.svg'
import useConfigs from '@hooks/useConfigs'
import useNotification, {
    StoredNotification,
    markAllCapacityItemsAsRead,
    markAsRead,
    markCapacityItemAsRead,
} from '@hooks/useNotification'
import cn from '@libs/class'
import { formatDate } from '@libs/date'
import { capitalize } from '@libs/formatter'
import { NANOS_IN_A_DAY } from 'shared/constants'
import e8s from 'shared/utils/e8s'
import { Unwrap, UnwrapVariant } from 'shared/utils/typings'

import Link from './Link'
import Username, { Usernames } from './Username'

const IconCheckCircle = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
)

const IconEnvelopeOpen = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
        />
    </svg>
)

const GroupedNotificationRenderer = memo(
    ({
        type,
        item,
        notification,
        isOpen,
        onToggle,
    }: {
        type: string
        item: any
        notification: StoredNotification
        isOpen: boolean
        onToggle: () => void
    }) => {
        const handleOpen = useCallback(() => {
            onToggle()
        }, [onToggle])

        const handleMarkAllAsRead = useCallback(
            (e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()

                markAllCapacityItemsAsRead(notification.id)
            },
            [notification.id]
        )

        const handleCapacityItemClick = useCallback(
            (e: React.MouseEvent, index: number) => {
                e.preventDefault()
                e.stopPropagation()
                markCapacityItemAsRead(notification.id, index)
            },
            [notification.id]
        )

        const totalNum = Number(item.total)
        const capacityNum = item.capacity.length

        const allCapacityItemsRead = notification.capacityItemsRead
            ? notification.capacityItemsRead.every((status) => status === 1)
            : false

        const hasUnreadCapacityItems = notification.capacityItemsRead
            ? notification.capacityItemsRead.some((status) => status === 0)
            : true

        const groupedText = {
            NewFollowers: 'has started following you.',
            NewReferrals: 'has joined Axiom by your referral link.',
            NewBallots: 'voted you in the election.',
            NewVotesToHypothesis: `voted on your hypothesis ${item.id}.`,
            NewVotesToEvidence: `voted on your evidence ${item.id}.`,
            NewVotesToProposal: `voted on your proposal ${item.id}.`,
            NewAxiomsToHypothesis: `adopted your hypothesis ${item.id} as their Axioms.`,
            NewEvidencesToHypothesis: `published new evidences to your hypothesis ${item.id}.`,
            NewRepliesToEvidence: `replied to your evidence ${item.id}.`,
            NewHypothesesFromFollowings: 'published new hypotheses',
            NewEvidencesFromFollowings: 'published new evidences',
        }[type]

        const renderCapacityItem = (item: any, id: string) => {
            switch (type) {
                case 'NewFollowers':
                    return <>started following you.</>
                case 'NewReferrals':
                    return (
                        <>
                            joined Axiom by using your referral link, you can claim{' '}
                            {e8s.toString(item.claimable)} ACORN.
                        </>
                    )
                case 'NewBallots':
                    return <>voted you in the election.</>
                case 'NewVotesToHypothesis':
                    return (
                        <>
                            voted {UnwrapVariant(item.choice)} on your hypothesis #{id}.
                        </>
                    )
                case 'NewVotesToEvidence':
                    return (
                        <>
                            voted {UnwrapVariant(item.choice)} on your evidence #{id}.
                        </>
                    )
                case 'NewVotesToProposal':
                    return (
                        <>
                            voted {UnwrapVariant(item.choice)} on your proposal #{id}.
                        </>
                    )
                case 'NewAxiomsToHypothesis':
                    return <>adopted your hypothesis #{id} as their Axioms.</>
                case 'NewEvidencesToHypothesis':
                    return <>published new evidences to your hypothesis #{id}.</>
                case 'NewRepliesToEvidence':
                    return <>replied to your evidence #{id}.</>
                case 'NewHypothesesFromFollowings':
                    return <>published hypothesis #{id}.</>
                case 'NewEvidencesFromFollowings':
                    return <>published evidence #{id}.</>
            }
        }
        const firstItem = item.capacity[0]

        return (
            <div className="rounded-lg border border-cold-200 bg-white">
                <div
                    onClick={handleOpen}
                    className={cn(
                        'text-tiny py-normal px-medium gap-x-small flex cursor-pointer items-center justify-between rounded-lg transition-colors hover:bg-primary-50',
                        hasUnreadCapacityItems ? 'bg-primary-50' : 'bg-white'
                    )}
                >
                    <div className="flex flex-1 flex-wrap items-center gap-1">
                        {totalNum === 1 ? (
                            <>
                                <Username
                                    symbol
                                    className="font-semibold text-primary-700"
                                    principal={
                                        firstItem?.user ?? firstItem?.voter ?? firstItem?.publisher
                                    }
                                />
                                <span> {groupedText}</span>
                            </>
                        ) : (
                            <>
                                {item.capacity.slice(0, 3).map((item: any, index: number) => (
                                    <span key={index} className="inline-flex items-center">
                                        <Username
                                            symbol
                                            className="font-semibold text-primary-700"
                                            principal={item.user ?? item.voter ?? item.publisher}
                                        />
                                        {index < Math.min(2, capacityNum - 1) && <span>,</span>}
                                    </span>
                                ))}
                                {totalNum > 3 && <span>and {totalNum - 3} other(s)</span>}
                                <span> {groupedText}</span>
                            </>
                        )}
                    </div>
                    <div className="gap-x-small flex items-center">
                        {!allCapacityItemsRead && (
                            <button
                                onClick={handleMarkAllAsRead}
                                title="Mark all as read"
                                className="flex-shrink-0 rounded-full font-normal text-primary-700 transition-colors hover:bg-primary-100"
                            >
                                <IconCheckCircle className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                            </button>
                        )}
                        <div className="p-tiny flex-shrink-0">
                            <DownIcon
                                className={`h-3 w-3 stroke-[1.5px] text-cold-700 transition-transform duration-200 ease-in-out md:h-4 md:w-4 ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        'overflow-hidden transition-all duration-200 ease-in-out',
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                >
                    <div className="text-tiny pb-tiny pt-tiny border-t border-cold-200 pl-4">
                        {item.capacity.map((e: any, index: number) => {
                            const isItemRead = notification.capacityItemsRead?.[index] === 1

                            return (
                                <div
                                    key={index}
                                    onClick={(event) => handleCapacityItemClick(event, index)}
                                    className={cn(
                                        'text-tiny px-small py-tiny flex w-full cursor-pointer flex-wrap items-center justify-between gap-1 rounded-lg hover:bg-primary-50',
                                        !isItemRead ? 'bg-primary-50' : 'bg-white'
                                    )}
                                >
                                    <span className="flex items-center gap-1 font-normal">
                                        <Username
                                            symbol
                                            className="font-semibold text-primary-700"
                                            principal={e.user ?? e.voter ?? e.publisher}
                                            linkClassName="text-cold-800"
                                        />
                                        <span> {renderCapacityItem(e, item.id)}</span>
                                    </span>
                                    <div className="gap-x-small flex items-center">
                                        <p className="text-extratiny mr-small font-normal text-cold-700">
                                            <span>
                                                {' '}
                                                {formatDate({ nano: BigInt(e.timestamp) }, true)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
)

export const UserNotificationRenderer = memo(
    ({
        notification,
        isOpen,
        onToggle,
    }: {
        notification: StoredNotification
        isOpen: boolean
        onToggle: () => void
    }) => {
        const daoConfigs = useConfigs('DAO')
        const { data } = notification
        const [type, item] = UnwrapVariant(data)
        if ('capacity' in item) {
            return (
                <GroupedNotificationRenderer
                    type={type}
                    item={item}
                    notification={notification}
                    isOpen={isOpen}
                    onToggle={onToggle}
                />
            )
        }

        switch (type) {
            case 'CustodianElectionResult': {
                const result = UnwrapVariant(item.result)
                return (
                    <p>
                        {
                            {
                                New: 'You have just become a custodian',
                                Unchanged: 'You have continued to be a custodian',
                                Removed: 'You are no longer a custodian',
                            }[result]
                        }
                        . The last period payout for you is {e8s.toString(item.claimable)} ACORN.
                    </p>
                )
            }
            case 'CustodianProposalResult': {
                const result = UnwrapVariant(item.result)
                return (
                    <p>
                        Custodians: Proposal #{item.proposalId} by{' '}
                        <Username
                            symbol
                            className="font-semibold text-primary-700"
                            principal={item.proposer}
                        />{' '}
                        has been{' '}
                        {{ Approved: 'approved', Rejected: 'rejected', Expired: 'expired' }[result]}
                        .
                    </p>
                )
            }
            case 'CustodianProposalDelegated':
                return (
                    <p>
                        Custodian:{' '}
                        <Username
                            symbol
                            className="font-semibold text-primary-700"
                            principal={item.delegator}
                        />{' '}
                        has delegated their vote to you on proposal #{item.proposalId}.
                    </p>
                )
            case 'CustodianProposalOpened': {
                const expiresAt =
                    BigInt(item.timestamp) +
                    NANOS_IN_A_DAY *
                        (daoConfigs?.['PROPOSAL_VOTE_AVAILABILITY_DURATION']?.[1] as bigint)
                return (
                    <p>
                        Custodian: A new proposal #{item.proposalId} has been opened by{' '}
                        <Username
                            symbol
                            className="font-semibold text-primary-700"
                            principal={item.proposer}
                        />
                        . Vote before it expires at {formatDate({ nano: expiresAt }, true)}.
                    </p>
                )
            }
            case 'ProposalExecuted':
                return (
                    <p>
                        Your proposal #{item.proposalId} has been {UnwrapVariant(item.result)}. You
                        can claim {e8s.toString((item as any).claimable)} ACORN.
                    </p>
                )
            case 'ProposalResult': {
                return (
                    <p>
                        Your proposal #{item.proposalId} has been {UnwrapVariant(item.result)}.
                    </p>
                )
            }
        }

        return <div>Unsupported User Notification</div>
    }
)

export const SystemNotificationRenderer = ({
    notification,
}: {
    notification: StoredNotification
}) => {
    const [type, data] = UnwrapVariant(notification.data)
    const axiomsConfig = useConfigs('Axioms')

    switch (type) {
        case 'SystemGeneric': {
            const link = Unwrap(data.link)
            return (
                <div>
                    <p>{data.message}</p>
                    {link && (
                        <Link
                            href={link.url}
                            className="text-tiny pre-underline rounded-lg text-cold-800 decoration-cold-800/50 hover:decoration-cold-800/100"
                            openInNewTab
                        >
                            {link.anchorText}
                        </Link>
                    )}
                </div>
            )
        }
        case 'FlagRequested': {
            const category = UnwrapVariant(data.header.category)
            const expiresAt =
                BigInt(data.timestamp) +
                NANOS_IN_A_DAY *
                    ((axiomsConfig?.['FLAG_REQUEST_AVAILABILITY_DURATION']?.[1] ?? 0n) as bigint)
            return (
                <p>
                    A flag has been requested by for {category} #{data.header.id}. Vote before it
                    expires at {formatDate({ nano: expiresAt }, true)}.
                </p>
            )
        }
        case 'FlagResult': {
            const category = UnwrapVariant(data.header.category)
            const result = UnwrapVariant(data.result)
            return (
                <p>
                    {
                        {
                            Approved: `${capitalize(category)} #${data.header.id} has been permanently deleted.`,
                            Rejected: `Attempted to delete ${category} #${data.header.id} has failed since the flag request was rejected.`,
                            Expired: `Attempted to delete ${category} #${data.header.id} has failed since the flag request expired.`,
                        }[result]
                    }
                </p>
            )
        }
        case 'ProposalExecuted': {
            const result = UnwrapVariant(data.result)
            return (
                <p>
                    {
                        {
                            Executed: (
                                <>
                                    Proposal #{data.proposalId} by @
                                    <Username
                                        symbol
                                        className="font-semibold text-primary-700"
                                        principal={(data as any).proposer}
                                    />{' '}
                                    has been successfully executed.
                                </>
                            ),
                            Failed: (
                                <>
                                    Proposal #{data.proposalId} by @
                                    <Username
                                        symbol
                                        className="font-semibold text-primary-700"
                                        principal={(data as any).proposer}
                                    />{' '}
                                    has failed to execute.
                                </>
                            ),
                        }[result]
                    }
                </p>
            )
        }
        case 'TallyResult': {
            const hasNew = data.new.length > 0
            const hasUnchanged = data.unchanged.length > 0
            const hasRemoved = data.removed.length > 0
            return (
                <p>
                    The new period has started.
                    {hasUnchanged && (
                        <>
                            {' '}
                            <Usernames
                                symbol
                                className="font-semibold text-primary-700"
                                principals={data.unchanged}
                            />{' '}
                            will continue to be the custodians.
                        </>
                    )}
                    {hasNew && (
                        <>
                            {' '}
                            Welcome new custodians:{' '}
                            <Usernames
                                symbol
                                className="font-semibold text-primary-700"
                                principals={data.new}
                            />
                            .
                        </>
                    )}
                    {hasRemoved && (
                        <>
                            {' '}
                            <Usernames
                                symbol
                                className="font-semibold text-primary-700"
                                principals={data.removed}
                            />{' '}
                            will no longer be the custodians, thank you for your contribution to the
                            Axiom ACE.
                        </>
                    )}
                </p>
            )
        }
    }

    return <div>Unsupported System Notification</div>
}

const getNotificationLink = (notification: StoredNotification): string | undefined => {
    switch (notification.source) {
        case 'system': {
            const [type, item] = UnwrapVariant(notification.data)
            switch (type) {
                case 'FlagRequested':
                    return `/dashboard/flags`
                case 'FlagResult':
                    return `/dashboard/flags`
                case 'ProposalExecuted':
                    return `/dashboard/proposals/${item.proposalId}`
                case 'TallyResult':
                    return `/dashboard/custodians`
                case 'SystemGeneric':
                    return undefined
                default:
                    return undefined
            }
        }
        case 'user': {
            const [type, item] = UnwrapVariant(notification.data)
            switch (type) {
                case 'NewFollowers':
                    return `/dashboard/followers`
                case 'NewReferrals':
                    return `/dashboard/referrals`
                case 'NewBallots':
                    return `/dashboard/custodians`
                default:
                    return undefined
            }
        }
        default:
            return undefined
    }
}

const NotificationItemWrapper = memo(
    ({
        notification,
        isOpen,
        onToggle,
    }: {
        notification: StoredNotification
        isOpen: boolean
        onToggle: () => void
    }) => {
        const isRead = notification.isRead === 1
        const [, item] = UnwrapVariant(notification.data)
        const hasAccordion = 'capacity' in item

        const handleSingleNotificationClick = () => {
            if (!hasAccordion && !isRead) {
                markAsRead(notification.id)
            }
        }

        const notificationLink = getNotificationLink(notification)

        return (
            <div
                className={cn(
                    'relative rounded-lg bg-white transition-colors',
                    !hasAccordion && !isRead && 'bg-primary-50'
                )}
            >
                <div className="gap-x-normal flex items-start">
                    {hasAccordion ? (
                        <div className="flex-grow">
                            {notification.source === 'system' ? (
                                <SystemNotificationRenderer notification={notification} />
                            ) : (
                                <UserNotificationRenderer
                                    notification={notification}
                                    isOpen={isOpen}
                                    onToggle={onToggle}
                                />
                            )}
                        </div>
                    ) : (
                        <div
                            className="block w-full cursor-pointer"
                            onClick={handleSingleNotificationClick}
                        >
                            {notificationLink ? (
                                <a href={notificationLink} className="block w-full">
                                    <div className="flex-grow">
                                        {notification.source === 'system' ? (
                                            <SystemNotificationRenderer
                                                notification={notification}
                                            />
                                        ) : (
                                            <UserNotificationRenderer
                                                notification={notification}
                                                isOpen={isOpen}
                                                onToggle={onToggle}
                                            />
                                        )}
                                    </div>
                                </a>
                            ) : (
                                <div className="flex-grow">
                                    {notification.source === 'system' ? (
                                        <SystemNotificationRenderer notification={notification} />
                                    ) : (
                                        <UserNotificationRenderer
                                            notification={notification}
                                            isOpen={isOpen}
                                            onToggle={onToggle}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }
)

const TabButton = ({
    label,
    count,
    isActive,
    onClick,
}: {
    label: string
    count: number
    isActive: boolean
    onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={cn(
            'gap-x-small py-normal px-medium text-tiny flex w-full items-center border-b-2 font-medium transition-colors',
            isActive ? 'border-primary-600 text-primary-700' : 'border-transparent text-cold-700'
        )}
    >
        <span>{label}</span>
        {count > 0 && (
            <span
                className={cn(
                    'px-small text-extratiny rounded-full font-bold',
                    isActive ? 'bg-primary-600 text-white' : 'bg-cold-200 text-cold-700'
                )}
            >
                {count}
            </span>
        )}
    </button>
)

const Notifications = () => {
    const [activeTab, setActiveTab] = useState<'user' | 'system'>('user')
    const [accordionStates, setAccordionStates] = useState<Record<string, boolean>>({})
    const { notifications, unreadUserCount, unreadSystemCount, actions } = useNotification()

    const systemNotifications = notifications.filter((n) => n.source === 'system')
    const userNotifications = notifications.filter((n) => n.source === 'user')

    const activeNotifications = activeTab === 'user' ? userNotifications : systemNotifications
    const activeUnreadCount = activeTab === 'user' ? unreadUserCount : unreadSystemCount

    useEffect(() => {
        const newAccordionStates: Record<string, boolean> = {}
        let hasChanges = false

        activeNotifications.forEach((notif) => {
            const [, item] = UnwrapVariant(notif.data)
            const hasAccordion = 'capacity' in item

            if (hasAccordion) {
                const hasUnreadCapacityItems = notif.capacityItemsRead
                    ? notif.capacityItemsRead.some((status) => status === 0)
                    : true

                const newState =
                    accordionStates[notif.id] !== undefined
                        ? accordionStates[notif.id]
                        : hasUnreadCapacityItems

                newAccordionStates[notif.id] = newState

                if (accordionStates[notif.id] !== newState) {
                    hasChanges = true
                }
            }
        })

        if (hasChanges) {
            setAccordionStates((prev) => ({ ...prev, ...newAccordionStates }))
        }
    }, [activeNotifications.length, activeTab])

    const toggleAccordion = useCallback((id: string) => {
        setAccordionStates((prev) => ({ ...prev, [id]: !prev[id] }))
    }, [])

    const handleMarkAllRead = () => {
        if (activeUnreadCount > 0) actions.markAllAsRead(activeTab)
    }

    return (
        <>
            <div className="p-medium gap-small flex items-center border-b border-cold-200">
                <NotificationIcon className="h-5 w-5 text-cold-800 lg:h-6  lg:w-6" />
                <p className="text-normal font-light text-cold-800">Notifications</p>
            </div>
            <div className="flex w-full justify-between border-b border-cold-200">
                <TabButton
                    label="For You"
                    count={unreadUserCount}
                    isActive={activeTab === 'user'}
                    onClick={() => setActiveTab('user')}
                />
                <TabButton
                    label="System"
                    count={unreadSystemCount}
                    isActive={activeTab === 'system'}
                    onClick={() => setActiveTab('system')}
                />
            </div>
            <div className="px-medium py-small flex items-center justify-between">
                <p className="text-tiny font-light text-cold-700">
                    {activeTab === 'user' ? 'Your Updates' : 'System-wide Announcements'}
                </p>
                <button
                    className="text-tiny font-medium text-primary-700 disabled:text-primary-700/50"
                    onClick={handleMarkAllRead}
                    disabled={activeUnreadCount === 0}
                >
                    Mark all as read
                </button>
            </div>
            <div className="gap-y-tiny flex max-h-[60vh] flex-col overflow-y-auto">
                {activeNotifications.length > 0 ? (
                    activeNotifications.map((notif) => (
                        <NotificationItemWrapper
                            key={notif.id}
                            notification={notif}
                            isOpen={accordionStates[notif.id] || false}
                            onToggle={() => toggleAccordion(notif.id)}
                        />
                    ))
                ) : (
                    <div className="p-large flex flex-col items-center justify-center text-center">
                        <IconEnvelopeOpen className="h-16 w-16 text-cold-300" />
                        <p className="text-normal mt-medium font-semibold text-cold-700">
                            You're all caught up!
                        </p>
                        <p className="text-tinyall mt-tiny font-normal text-cold-700">
                            There are no new notifications in this tab.
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

export default Notifications
