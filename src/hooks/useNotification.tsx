import { Agent } from '@dfinity/agent'
import Dexie, { Table } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef } from 'react'

import { DFacade } from 'shared/types/services'
import { Facade } from 'shared/utils/services'
import { UnwrapVariant } from 'shared/utils/typings'

export type NotificationItem = DFacade.SharableSystemVariant | DFacade.SharableUserVariant

export type StoredNotification = {
    id: string
    isRead: 0 | 1
    timestamp: number
    source: 'system' | 'user'
    data: NotificationItem
}

class NotificationDB extends Dexie {
    notifications: Table<StoredNotification, string>

    constructor() {
        super('AppNotificationDB')

        this.version(1).stores({
            notifications: '&id, isRead, timestamp, source, [isRead+timestamp]',
        })
        this.notifications = this.table('notifications')
    }
}

const db = new NotificationDB()

const _generateId = (notification: NotificationItem): string => {
    const [type, data] = UnwrapVariant(notification)

    if ('id' in data && data.id !== undefined) {
        return `notif-group-${type}-${data.id.toString()}`
    }

    if ('capacity' in data) {
        return `notif-group-${type}`
    }

    const replacer = (key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value

    return `notif-single-${JSON.stringify(notification, Object.keys(notification).sort(), replacer)}`
}

const _getTimestamp = (notification: NotificationItem): bigint => {
    const [, data] = UnwrapVariant(notification)

    if ('capacity' in data && Array.isArray(data.capacity) && data.capacity.length > 0) {
        return data.capacity[0]?.timestamp ?? BigInt(Date.now() * 1_000_000)
    }

    if ('timestamp' in data) {
        return (data as any).timestamp
    }

    return BigInt(Date.now() * 1_000_000)
}

let isQuerying = false

export const queryNotifications = async (agent: Agent): Promise<void> => {
    if (isQuerying) {
        return
    }
    isQuerying = true

    try {
        const [userNotifications, systemNotifications] = await Facade.call(agent).getNotification()

        const allApiNotifications = [...userNotifications, ...systemNotifications]
        if (allApiNotifications.length === 0) {
            isQuerying = false
            return
        }

        const idsFromApi = allApiNotifications.map((n) => _generateId(n))
        const existingRecords = await db.notifications.where('id').anyOf(idsFromApi).toArray()
        const existingRecordsMap = new Map(existingRecords.map((r) => [r.id, r]))

        const itemsToUpsert: StoredNotification[] = []

        const processNotifications = (
            notifications: NotificationItem[],
            source: 'system' | 'user'
        ) => {
            for (const notif of notifications) {
                const id = _generateId(notif)
                const existingRecord = existingRecordsMap.get(id)

                if (!existingRecord) {
                    const timestamp = Number(_getTimestamp(notif))
                    itemsToUpsert.push({ id, timestamp, data: notif, source, isRead: 0 })
                    continue
                }

                const apiTotal = (UnwrapVariant(notif)[1] as any).total
                const dbTotal = (UnwrapVariant(existingRecord.data)[1] as any).total

                if (
                    apiTotal !== undefined &&
                    dbTotal !== undefined &&
                    apiTotal.toString() !== dbTotal.toString()
                ) {
                    const timestamp = Number(_getTimestamp(notif))

                    itemsToUpsert.push({
                        id,
                        timestamp,
                        data: notif,
                        source,
                        isRead: 0,
                    })
                }
            }
        }

        processNotifications(userNotifications, 'user')
        processNotifications(systemNotifications, 'system')

        if (itemsToUpsert.length > 0) {
            await db.notifications.bulkPut(itemsToUpsert)
        }
    } catch (error) {
        console.error('useNotification: Failed to query and sync notifications:', error)
    } finally {
        isQuerying = false
    }
}

export const markAsRead = async (id: string): Promise<void> => {
    await db.notifications.update(id, { isRead: 1 })
}

export const markAllAsRead = async (source: 'system' | 'user'): Promise<void> => {
    await db.notifications.where({ source, isRead: 0 }).modify({ isRead: 1 })
}

export const deleteAllNotificationsCache = async (): Promise<void> => {
    await db.notifications.clear()
}

export const useNotificationPoller = (agent: Agent | null, intervalSeconds = 10) => {
    const agentRef = useRef(agent)

    useEffect(() => {
        agentRef.current = agent
    }, [agent])

    useEffect(() => {
        const runQuery = () => {
            if (agentRef.current) queryNotifications(agentRef.current)
        }
        runQuery()
        const intervalId = setInterval(runQuery, intervalSeconds * 1000)
        return () => clearInterval(intervalId)
    }, [intervalSeconds])
}

const useNotification = () => {
    const notifications = useLiveQuery(
        () => db.notifications.orderBy('timestamp').reverse().toArray(),
        [],
        []
    )
    const unreadUserCount = useLiveQuery(
        () => db.notifications.where({ source: 'user', isRead: 0 }).count(),
        [],
        0
    )
    const unreadSystemCount = useLiveQuery(
        () => db.notifications.where({ source: 'system', isRead: 0 }).count(),
        [],
        0
    )

    return {
        notifications,
        unreadUserCount,
        unreadSystemCount,
        actions: { markAsRead, markAllAsRead },
    }
}

export default useNotification
