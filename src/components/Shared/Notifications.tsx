import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { useState } from 'react'

import DownIcon from '@components/Assets/down.svg'
import useConfigs from '@hooks/useConfigs'
import useNotification, { StoredNotification, markAsRead } from '@hooks/useNotification'
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

export const DetailsAccordion = ({
    summary,
    children,
}: {
    summary: React.ReactNode
    children: React.ReactNode
}) => {
    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen((cur) => !cur)
    return (
        <Accordion
            open={open}
            icon={
                <DownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            }
            className="mt-2 border-t border-cold-200"
        >
            <AccordionHeader
                onClick={handleOpen}
                className="border-b-0 py-2.5 text-sm font-normal text-cold-600 hover:text-cold-800"
            >
                {summary}
            </AccordionHeader>
            <AccordionBody className="pb-2 pt-0 text-sm">
                <div className="space-y-2 border-l-2 border-cold-200 pl-4">{children}</div>
            </AccordionBody>
        </Accordion>
    )
}

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
                                    <Username principal={(data as any).proposer} /> has been
                                    successfully executed.
                                </>
                            ),
                            Failed: (
                                <>
                                    Proposal #{data.proposalId} by @
                                    <Username principal={(data as any).proposer} /> has failed to
                                    execute.
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
                            <Usernames principals={data.unchanged} /> will continue to be the
                            custodians.
                        </>
                    )}
                    {hasNew && (
                        <>
                            {' '}
                            Welcome new custodians: <Usernames principals={data.new} />.
                        </>
                    )}
                    {hasRemoved && (
                        <>
                            {' '}
                            <Usernames principals={data.removed} /> will no longer be the
                            custodians, thank you for your contribution to the Axiom ACE.
                        </>
                    )}
                </p>
            )
        }
    }

    return <div>Unsupported System Notification</div>
}

const GroupedNotificationRenderer = ({ type, item }: { type: string; item: any }) => {
    const totalNum = Number(item.total)
    const capacityNum = item.capacity.length

    const renderActionText = () => {
        switch (type) {
            case 'NewFollowers':
                return <>has started following you.</>
            case 'NewReferrals':
                return <>has joined Axiom by your referral link.</>
            case 'NewBallots':
                return <>voted you in the election.</>
            case 'NewVotesToHypothesis':
                return <>voted on your hypothesis #{item.id}.</>
            case 'NewVotesToEvidence':
                return <>voted on your evidence #{item.id}.</>
            case 'NewVotesToProposal':
                return <>voted on your proposal #{item.id}.</>
            case 'NewAxiomsToHypothesis':
                return <>adopted your hypothesis #{item.id} as their Axioms.</>
            case 'NewEvidencesToHypothesis':
                return <>published new evidences to your hypothesis #{item.id}.</>
            case 'NewRepliesToEvidence':
                return <>replied to your evidence #{item.id}.</>
            case 'NewHypothesesFromFollowings':
                return <>published new hypotheses</>
            case 'NewEvidencesFromFollowings':
                return <>published new evidences</>
        }
    }
    const renderCapacityItem = (item: any, id: string) => {
        switch (type) {
            case 'NewFollowers':
                return <>started following you.</>
            case 'NewReferrals':
                return (
                    <>
                        {' '}
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
        <div>
            <p>
                {totalNum === 1 ? (
                    <Username
                        principal={
                            firstItem?.user ??
                            firstItem?.voter ??
                            firstItem?.publisher ??
                            firstItem?.principal
                        }
                    />
                ) : (
                    <>
                        {item.capacity.slice(0, 3).map((item: any, index: number) => (
                            <>
                                <Username
                                    principal={
                                        item.user ?? item.voter ?? item.publisher ?? item.principal
                                    }
                                />
                                {index < Math.min(2, capacityNum - 1) && ', '}
                            </>
                        ))}
                        {totalNum > 3 ? ` and ${totalNum - 3} other(s)` : ''}
                    </>
                )}{' '}
                {renderActionText()}
            </p>
            {totalNum > 1 && (
                <DetailsAccordion summary={`View all ${totalNum} interaction(s)`}>
                    <div className="space-y-2">
                        {item.capacity.map((e: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div>
                                    <Username
                                        principal={e.user ?? e.voter ?? e.publisher ?? e.principal}
                                        linkClassName="text-cold-800"
                                    />{' '}
                                    {renderCapacityItem(e, item.id)}
                                </div>
                                <p className="text-cold-500">
                                    {' '}
                                    {formatDate({ nano: BigInt(e.timestamp) }, true)}{' '}
                                </p>
                            </div>
                        ))}
                    </div>
                </DetailsAccordion>
            )}
        </div>
    )
}

export const UserNotificationRenderer = ({
    notification,
}: {
    notification: StoredNotification
}) => {
    const daoConfigs = useConfigs('DAO')
    const { data } = notification
    const [type, item] = UnwrapVariant(data)
    if ('capacity' in item) {
        return <GroupedNotificationRenderer type={type} item={item} />
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
                    <Username principal={item.proposer} /> has been{' '}
                    {{ Approved: 'approved', Rejected: 'rejected', Expired: 'expired' }[result]}.
                </p>
            )
        }
        case 'CustodianProposalDelegated':
            return (
                <p>
                    Custodian: <Username principal={item.delegator} /> has delegated their vote to
                    you on proposal #{item.proposalId}.
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
                    <Username principal={item.proposer} />. Vote before it expires at{' '}
                    {formatDate({ nano: expiresAt }, true)}.
                </p>
            )
        }
        case 'ProposalExecuted':
            return (
                <p>
                    Your proposal #{item.proposalId} has been {UnwrapVariant(item.result)}. You can
                    claim {e8s.toString((item as any).claimable)} ACORN.
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

const getNotificationLink = (notification: StoredNotification): string => {
    return `/#/notification-link/${notification.id}`
}

const NotificationItemWrapper = ({ notification }: { notification: StoredNotification }) => {
    const isRead = notification.isRead === 1

    const handleMarkAsReadClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        markAsRead(notification.id)
    }

    const hasAccordion =
        'capacity' in UnwrapVariant(notification.data)[1] &&
        Number(UnwrapVariant(notification.data)[1].total) > 1

    const mainContent = (
        <div className="flex-grow">
            {notification.source === 'system' ? (
                <SystemNotificationRenderer notification={notification} />
            ) : (
                <UserNotificationRenderer notification={notification} />
            )}
        </div>
    )

    return (
        <div
            className={cn(
                'p-normal relative rounded-lg transition-colors duration-200',
                !isRead && 'bg-primary-50'
            )}
        >
            <div className="gap-x-normal flex items-start">
                {hasAccordion ? (
                    mainContent
                ) : (
                    <a href={getNotificationLink(notification)} className="block w-full">
                        {mainContent}
                    </a>
                )}

                {!isRead && (
                    <button
                        onClick={handleMarkAsReadClick}
                        title="Mark as read"
                        className="p-tiny flex-shrink-0 rounded-full text-primary-500 transition-colors hover:bg-primary-100"
                    >
                        <IconCheckCircle className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    )
}

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
            'gap-x-small py-normal text-tiny flex items-center border-b-2 font-semibold transition-colors',
            isActive
                ? 'border-primary-600 text-primary-700'
                : 'text-secondary-500 hover:text-secondary-800 border-transparent'
        )}
    >
        <span>{label}</span>
        {count > 0 && (
            <span
                className={cn(
                    'px-tiny py-extratiny text-extratiny rounded-full font-bold',
                    isActive ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-600'
                )}
            >
                {count}
            </span>
        )}
    </button>
)

const Notifications = () => {
    const [activeTab, setActiveTab] = useState<'user' | 'system'>('user')
    const { notifications, unreadUserCount, unreadSystemCount, actions } = useNotification()

    const systemNotifications = notifications.filter((n) => n.source === 'system')
    const userNotifications = notifications.filter((n) => n.source === 'user')

    const activeNotifications = activeTab === 'user' ? userNotifications : systemNotifications
    const activeUnreadCount = activeTab === 'user' ? unreadUserCount : unreadSystemCount

    const handleMarkAllRead = () => {
        if (activeUnreadCount > 0) {
            actions.markAllAsRead(activeTab)
        }
    }

    console.log({ notifications, unreadUserCount, unreadSystemCount })

    return (
        <div className="mt-normal border-secondary-100 absolute right-0 top-full z-50 flex w-[30rem] max-w-md flex-col rounded-lg border bg-white shadow-2xl">
            <div className="p-medium border-secondary-200 border-b">
                <p className="text-normal text-secondary-900 font-semibold">Notifications</p>
            </div>

            <div className="border-secondary-200 px-medium flex border-b">
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
                <p className="text-tiny text-secondary-800 font-semibold">
                    {activeTab === 'user' ? 'Your Updates' : 'System-wide Announcements'}
                </p>
                <button
                    className="text-tiny disabled:text-secondary-400 font-medium text-primary-600 hover:text-primary-800 disabled:cursor-not-allowed"
                    onClick={handleMarkAllRead}
                    disabled={activeUnreadCount === 0}
                >
                    Mark all as read
                </button>
            </div>

            <div className="p-small gap-y-tiny flex max-h-[60vh] flex-col overflow-y-auto">
                {activeNotifications.length > 0 ? (
                    activeNotifications.map((notif) => (
                        <NotificationItemWrapper key={notif.id} notification={notif} />
                    ))
                ) : (
                    <div className="p-large flex flex-col items-center justify-center text-center">
                        <IconEnvelopeOpen className="text-secondary-300 h-16 w-16" />
                        <p className="text-normal mt-medium text-secondary-600 font-semibold">
                            You're all caught up!
                        </p>
                        <p className="text-small mt-tiny text-secondary-500 font-normal">
                            There are no new notifications in this tab.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Notifications
