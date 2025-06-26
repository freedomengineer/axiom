import { Principal } from '@dfinity/principal'
import { Fragment, memo, useCallback, useEffect, useState } from 'react'

import CheckIcon from '@components/Assets/check.svg'
import DownIcon from '@components/Assets/down.svg'
import EmptyNotificationIcon from '@components/Assets/empty_notification.svg'
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
import { NANOS_IN_A_DAY } from 'shared/constants'
import e8s from 'shared/utils/e8s'
import { Unwrap, UnwrapVariant } from 'shared/utils/typings'

import Link from './Link'
import Username, { Usernames } from './Username'

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
                onToggle()
            },
            [notification.id, onToggle]
        )

        const handleCapacityItemClick = useCallback(
            (index: number) => {
                markCapacityItemAsRead(notification.id, index, onToggle)
            },
            [notification.id, onToggle]
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
            NewVotesToHypothesis: `voted on your hypothesis #${item.id}.`,
            NewVotesToEvidence: `voted on your evidence #${item.id}.`,
            NewVotesToProposal: `voted on your proposal #${item.id}.`,
            NewAxiomsToHypothesis: `adopted your hypothesis #${item.id} as their Axioms.`,
            NewEvidencesToHypothesis: `published new evidences to your hypothesis #${item.id}.`,
            NewRepliesToEvidence: `replied to your evidence #${item.id}.`,
            NewHypothesesFromFollowings: 'published new hypotheses',
            NewEvidencesFromFollowings: 'published new evidences',
        }[type]

        const renderCapacityItem = (item: any, id: string) => {
            switch (type) {
                case 'NewFollowers':
                    return [
                        'started following you.',
                        `/profile/${Principal.fromUint8Array(item.user._arr).toText()}`,
                    ]
                case 'NewReferrals':
                    return [
                        `joined Axiom by using your referral link, you can claim ${e8s.toString(item.claimable)} ICP.`,
                        `/profile/${Principal.fromUint8Array(item.user._arr).toText()}`,
                    ]
                case 'NewBallots':
                    return ['voted you in the election.', `/dashboard/custodians`]
                case 'NewVotesToHypothesis':
                    return [
                        `voted ${(UnwrapVariant(item.choice) as any).toLowerCase()}.`,
                        `/feed/${item.id}`,
                    ]
                case 'NewVotesToEvidence':
                    return [
                        `voted ${(UnwrapVariant(item.choice) as any).toLowerCase()}.`,
                        `/feed/evidences/${item.id}`,
                    ]
                case 'NewVotesToProposal':
                    return [
                        `voted ${(UnwrapVariant(item.choice) as any).toLowerCase()}.`,
                        `/dashboard/proposals/${id}`,
                    ]
                case 'NewAxiomsToHypothesis':
                    return [`adopted your hypothesis.`, `/feed/${item.id}`]
                case 'NewEvidencesToHypothesis':
                    return [
                        `published ${(UnwrapVariant(item.side) as any).toLowerCase()} evidence #${item.evidenceId}.`,
                        `/feed/${id}/evidences/${item.evidenceId}`,
                    ]
                case 'NewRepliesToEvidence':
                    return [
                        `replied to your evidence with evidence #${item.evidenceId}.`,
                        `/feed/evidences/${item.evidenceId}`,
                    ]
                case 'NewHypothesesFromFollowings':
                    return [
                        `published hypothesis #${item.hypothesisId}.`,
                        `/feed/${item.hypothesisId}`,
                    ]
                case 'NewEvidencesFromFollowings':
                    return [
                        `published evidence #${item.evidenceId}.`,
                        `/feed/evidences/${item.evidenceId}`,
                    ]
                default:
                    return undefined
            }
        }

        const firstItem = item.capacity[0]

        return (
            <div className="rounded-lg border border-cold-200 bg-white">
                <div
                    onClick={handleOpen}
                    className={cn(
                        'text-tiny py-normal px-medium flex cursor-pointer items-center justify-between rounded-lg transition-colors hover:bg-primary-50',
                        hasUnreadCapacityItems ? 'bg-primary-50' : 'bg-white'
                    )}
                >
                    <p className="flex-1 leading-relaxed">
                        {totalNum === 1 ? (
                            <>
                                <Username
                                    symbol
                                    className="inline-block font-semibold text-primary-700"
                                    principal={
                                        firstItem?.user ?? firstItem?.voter ?? firstItem?.publisher
                                    }
                                />
                                {` ${groupedText}`}
                            </>
                        ) : (
                            <>
                                {item.capacity.slice(0, 3).map((item: any, index: number) => (
                                    <Fragment key={index}>
                                        <Username
                                            symbol
                                            className="inline-block font-semibold text-primary-700"
                                            principal={item.user ?? item.voter ?? item.publisher}
                                        />
                                        {index < Math.min(2, capacityNum - 1) && ', '}
                                    </Fragment>
                                ))}
                                {totalNum > 3 && ` and ${totalNum - 3} other(s)`}
                                {` ${groupedText}`}
                            </>
                        )}
                    </p>
                    <div className="gap-x-small flex items-center">
                        {!allCapacityItemsRead && (
                            <button
                                onClick={handleMarkAllAsRead}
                                title="Mark all as read"
                                className="flex-shrink-0 rounded-full font-normal text-primary-700 transition-colors hover:bg-primary-100"
                            >
                                <CheckIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
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
                            const [text, link] = renderCapacityItem(e, item.id) ?? []

                            return (
                                <Link
                                    key={index}
                                    href={link}
                                    onClick={() => handleCapacityItemClick(index)}
                                    className={cn(
                                        'text-tiny px-small py-tiny flex w-full cursor-pointer items-center justify-between rounded-lg hover:bg-primary-50',
                                        !isItemRead ? 'bg-primary-50' : 'bg-white'
                                    )}
                                >
                                    <p className="flex-1 leading-relaxed">
                                        <Username
                                            symbol
                                            className="inline-block font-semibold text-primary-700"
                                            principal={e.user ?? e.voter ?? e.publisher}
                                            linkClassName="text-cold-800"
                                        />
                                        {` ${text}`}
                                    </p>
                                    <div className="gap-x-small flex flex-shrink-0 items-center">
                                        <p className="text-extratiny mr-small font-normal text-cold-700">
                                            <span>
                                                {formatDate({ nano: BigInt(e.timestamp) }, true)}
                                            </span>
                                        </p>
                                    </div>
                                </Link>
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

        const NormalNotificationRenderer = () => {
            switch (type) {
                case 'CustodianElectionResult': {
                    const result = UnwrapVariant(item.result)
                    return (
                        <>
                            {
                                {
                                    New: 'You have just become a custodian',
                                    Unchanged: 'You have continued to be a custodian',
                                    Removed: 'You are no longer a custodian',
                                }[result]
                            }
                            . The last period payout for you is {e8s.toString(item.claimable)}{' '}
                            ACORN.
                        </>
                    )
                }
                case 'CustodianProposalResult': {
                    const result = UnwrapVariant(item.result)
                    return (
                        <>
                            Custodians: Proposal #{item.proposalId} by{' '}
                            <Username
                                symbol
                                className="inline-block font-semibold text-primary-700"
                                principal={item.proposer}
                            />{' '}
                            has been{' '}
                            {
                                { Approved: 'approved', Rejected: 'rejected', Expired: 'expired' }[
                                    result
                                ]
                            }
                            .
                        </>
                    )
                }
                case 'CustodianProposalDelegated':
                    return (
                        <>
                            Custodian:{' '}
                            <Username
                                symbol
                                className="inline-block font-semibold text-primary-700"
                                principal={item.delegator}
                            />{' '}
                            has delegated their vote to you on proposal #{item.proposalId}.
                        </>
                    )
                case 'CustodianProposalOpened': {
                    const expiresAt =
                        BigInt(item.timestamp) +
                        NANOS_IN_A_DAY *
                            ((daoConfigs?.['PROPOSAL_VOTE_AVAILABILITY_DURATION']?.[1] ??
                                0n) as bigint)
                    return (
                        <>
                            Custodian: A new proposal #{item.proposalId} has been opened by{' '}
                            <Username
                                symbol
                                className="inline-block font-semibold text-primary-700"
                                principal={item.proposer}
                            />
                            {`. Vote before it expires at ${formatDate({ nano: expiresAt }, true)}.`}
                        </>
                    )
                }
                case 'ProposalExecuted':
                    return (
                        <>
                            Your proposal #{item.proposalId} has been{' '}
                            {UnwrapVariant(item.result).toLowerCase()}, you have{' '}
                            {e8s.toString((item as any).claimable)} ACORN refunded.
                        </>
                    )
                case 'ProposalResult': {
                    return (
                        <>
                            Your proposal #{item.proposalId} has been{' '}
                            {UnwrapVariant(item.result).toLowerCase()}.
                        </>
                    )
                }
                default:
                    return <>Unsupported User Notification</>
            }
        }

        const notificationLink = getNotificationLink(notification)

        return (
            <div className="rounded-lg border border-cold-200 bg-white">
                <Link
                    href={notificationLink ?? ''}
                    className={cn(
                        'text-tiny py-normal px-medium flex cursor-pointer items-center justify-between rounded-lg transition-colors hover:bg-primary-50',
                        notification.isRead === 0 ? 'bg-primary-50' : 'bg-white'
                    )}
                >
                    <p className="flex-1 leading-relaxed">
                        <NormalNotificationRenderer />
                    </p>
                    <p className="text-extratiny font-light text-cold-700">
                        {formatDate({ nano: BigInt(notification.timestamp) }, true)}
                    </p>
                </Link>
            </div>
        )
    }
)

export const SystemNotificationRenderer = ({
    notification,
}: {
    notification: StoredNotification
}) => {
    const [type, data] = UnwrapVariant(notification.data)
    const axiomsConfig = useConfigs('Axioms')

    const NormalNotificationRenderer = () => {
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
                        ((axiomsConfig?.['FLAG_REQUEST_AVAILABILITY_DURATION']?.[1] ??
                            0n) as bigint)
                return (
                    <>
                        A flag has been requested by for {category.toLowerCase()} #{data.header.id}.
                        Vote before it expires at {formatDate({ nano: expiresAt }, true)}.
                    </>
                )
            }
            case 'FlagResult': {
                const category = UnwrapVariant(data.header.category)
                const result = UnwrapVariant(data.result)
                return (
                    <>
                        {
                            {
                                Approved: `${category} #${data.header.id} has been permanently deleted.`,
                                Rejected: `Attempted to delete ${category.toLowerCase()} #${data.header.id} has failed since the flag request was rejected.`,
                                Expired: `Attempted to delete ${category.toLowerCase()} #${data.header.id} has failed since the flag request expired.`,
                            }[result]
                        }
                    </>
                )
            }
            case 'ProposalExecuted': {
                const result = UnwrapVariant(data.result)
                return (
                    <>
                        {
                            {
                                Executed: (
                                    <>
                                        Proposal #{data.proposalId} by{' '}
                                        <Username
                                            symbol
                                            className="inline-block font-semibold text-primary-700"
                                            principal={(data as any).proposer}
                                        />{' '}
                                        has been successfully executed.
                                    </>
                                ),
                                Failed: (
                                    <>
                                        Proposal #{data.proposalId} by{' '}
                                        <Username
                                            symbol
                                            className="inline-block font-semibold text-primary-700"
                                            principal={(data as any).proposer}
                                        />{' '}
                                        has failed to execute.
                                    </>
                                ),
                            }[result]
                        }
                    </>
                )
            }
            case 'TallyResult': {
                const hasNew = data.new.length > 0
                const hasUnchanged = data.unchanged.length > 0
                const hasRemoved = data.removed.length > 0
                return (
                    <>
                        The new period has started.
                        {hasUnchanged && (
                            <>
                                {' '}
                                <Usernames
                                    symbol
                                    className="inline-block font-semibold text-primary-700"
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
                                    className="inline-block font-semibold text-primary-700"
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
                                    className="inline-block font-semibold text-primary-700"
                                    principals={data.removed}
                                />{' '}
                                will no longer be the custodians, thank you for your contribution to
                                the Axiom ACE.
                            </>
                        )}
                    </>
                )
            }
            default:
                return <>Unsupported System Notification</>
        }
    }

    return (
        <div className="rounded-lg border border-cold-200 bg-white">
            <div
                className={cn(
                    'text-tiny py-normal px-medium flex cursor-pointer items-center justify-between rounded-lg transition-colors hover:bg-primary-50',
                    notification.isRead === 0 ? 'bg-primary-50' : 'bg-white'
                )}
            >
                <p className="flex-1 leading-relaxed">
                    <NormalNotificationRenderer />
                </p>
                <p className="text-extratiny font-light text-cold-700">
                    {formatDate({ nano: BigInt(notification.timestamp) }, true)}
                </p>
            </div>
        </div>
    )
}

const getNotificationLink = (notification: StoredNotification): string | undefined => {
    switch (notification.source) {
        case 'system': {
            const [type, item] = UnwrapVariant(notification.data)
            switch (type) {
                case 'FlagRequested':
                    return `/feed/flags`
                case 'FlagResult':
                    return `/feed/flags`
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
                case 'CustodianElectionResult':
                    return `/dashboard/custodians`
                case 'CustodianProposalResult':
                    return `/dashboard/proposals/${item.proposalId}`
                case 'CustodianProposalDelegated':
                    return `/dashboard/proposals/${item.proposalId}`
                case 'CustodianProposalOpened':
                    return `/dashboard/proposals/${item.proposalId}`
                case 'ProposalExecuted':
                    return `/dashboard/proposals/${item.proposalId}`
                case 'ProposalResult':
                    return `/dashboard/proposals/${item.proposalId}`
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
                                <Link href={notificationLink} className="block w-full">
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
                                </Link>
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
        if (activeUnreadCount > 0) {
            actions.markAllAsRead(activeTab)
            setAccordionStates({})
        }
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
                        <EmptyNotificationIcon className="mb-medium h-12 w-12 text-cold-300 md:h-16 md:w-16" />
                        <p className="text-normal font-medium text-cold-700">
                            You're all caught up!
                        </p>
                        <p className="text-tiny font-normal text-cold-700">
                            There are no new notifications in this tab
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

export default Notifications
