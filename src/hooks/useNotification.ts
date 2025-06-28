import { Agent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
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
    capacityHash?: string
    capacityItemsRead?: number[]
}

class NotificationDB extends Dexie {
    notifications: Table<StoredNotification, string>

    constructor(userPrincipal: string) {
        super(`AppNotificationDB_${userPrincipal}`)

        this.version(1).stores({
            notifications: '&id, isRead, timestamp, source, [isRead+timestamp]',
        })
        this.notifications = this.table('notifications')
    }
}

let db: NotificationDB | null = null
let currentUserPrincipal: string | null = null

const initializeDB = (userPrincipal: string) => {
    if (currentUserPrincipal !== userPrincipal) {
        currentUserPrincipal = userPrincipal
        db = new NotificationDB(userPrincipal)
    }
}

const _jsonReplacer = (key: string, value: any) =>
    typeof value === 'bigint'
        ? value.toString()
        : typeof value === 'object' && value && '__principal__' in value
          ? { _arr: Principal.fromText(value.__principal__).toUint8Array(), _isPrincipal: true }
          : value

const _getCapacityItemKey = (item: any): string => {
    const itemToProcess = { ...item }
    if (itemToProcess.timestamp && typeof itemToProcess.timestamp === 'number') {
        itemToProcess.timestamp = BigInt(itemToProcess.timestamp)
    }
    return JSON.stringify(itemToProcess, _jsonReplacer)
}

const _generateId = (notification: NotificationItem): string => {
    const [type, data] = UnwrapVariant(notification)

    if ('id' in data && data.id !== undefined) {
        return `notif-group-${type}-${data.id.toString()}`
    }
    if ('capacity' in data) {
        return `notif-group-${type}`
    }
    const sortedNotification = Object.keys(notification).reduce((acc, key) => {
        acc[key] = (notification as any)[key]
        return acc
    }, {} as any)

    return `notif-single-${JSON.stringify(sortedNotification, _jsonReplacer)}`
}

const _hashCapacity = (notification: NotificationItem): string | undefined => {
    const [, data] = UnwrapVariant(notification)

    if ('capacity' in data && Array.isArray(data.capacity)) {
        return JSON.stringify(data.capacity, _jsonReplacer)
    }
    return undefined
}

const _getCapacityLength = (notification: NotificationItem): number => {
    const [, data] = UnwrapVariant(notification)

    if ('capacity' in data && Array.isArray(data.capacity)) {
        return data.capacity.length
    }
    return 0
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
        const principal = await agent.getPrincipal()
        initializeDB(principal.toString())

        if (!db) {
            console.error('useNotification: Database not initialized')
            return
        }

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
            for (const data of notifications) {
                const id = _generateId(data)
                const existingRecord = existingRecordsMap.get(id)

                if (!existingRecord) {
                    const timestamp = Number(_getTimestamp(data))
                    const capacityHash = _hashCapacity(data)
                    const capacityLength = _getCapacityLength(data)
                    const capacityItemsRead =
                        capacityLength > 0 ? new Array(capacityLength).fill(0) : undefined

                    itemsToUpsert.push({
                        id,
                        timestamp,
                        data,
                        source,
                        isRead: 0,
                        capacityHash,
                        capacityItemsRead,
                    })
                    continue
                }

                const apiTotal = (UnwrapVariant(data)[1] as any).total
                const dbTotal = (UnwrapVariant(existingRecord.data)[1] as any).total
                const newCapacityHash = _hashCapacity(data)

                if (
                    (apiTotal !== undefined &&
                        dbTotal !== undefined &&
                        apiTotal.toString() !== dbTotal.toString()) ||
                    (newCapacityHash && newCapacityHash !== existingRecord.capacityHash)
                ) {
                    const timestamp = Number(_getTimestamp(data))
                    let capacityItemsRead: number[] | undefined
                    const newCapacity = (UnwrapVariant(data)[1] as any).capacity

                    if (Array.isArray(newCapacity) && newCapacity.length > 0) {
                        const oldCapacity = (UnwrapVariant(existingRecord.data)[1] as any).capacity
                        const oldReadItemsKeys = new Set<string>()

                        if (Array.isArray(oldCapacity) && existingRecord.capacityItemsRead) {
                            oldCapacity.forEach((oldItem: any, index: number) => {
                                if (existingRecord.capacityItemsRead?.[index] === 1) {
                                    oldReadItemsKeys.add(_getCapacityItemKey(oldItem))
                                }
                            })
                        }

                        capacityItemsRead = newCapacity.map((newItem: any) => {
                            const itemKey = _getCapacityItemKey(newItem)
                            return oldReadItemsKeys.has(itemKey) ? 1 : 0
                        })
                    } else {
                        capacityItemsRead = undefined
                    }

                    const isGroupReadAll = capacityItemsRead
                        ? capacityItemsRead.every((status) => status === 1)
                        : false

                    itemsToUpsert.push({
                        id,
                        timestamp,
                        data,
                        source,
                        isRead: isGroupReadAll ? 1 : 0,
                        capacityHash: newCapacityHash,
                        capacityItemsRead,
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
    if (!db) return
    await db.notifications.update(id, { isRead: 1 })
}

export const markCapacityItemAsRead = async (
    notificationId: string,
    itemIndex: number,
    onAllRead?: () => void
): Promise<void> => {
    if (!db) return
    const notification = await db.notifications.get(notificationId)
    if (notification && notification.capacityItemsRead) {
        const newCapacityItemsRead = [...notification.capacityItemsRead]
        newCapacityItemsRead[itemIndex] = 1

        const allRead = newCapacityItemsRead.every((status) => status === 1)

        await db.notifications.update(notificationId, {
            capacityItemsRead: newCapacityItemsRead,
            isRead: allRead ? 1 : 0,
        })

        if (allRead && onAllRead) {
            onAllRead()
        }
    }
}

export const markAllAsRead = async (source: 'system' | 'user'): Promise<void> => {
    if (!db) return
    const notifications = await db.notifications.where({ source, isRead: 0 }).toArray()
    const updates = notifications.map((notification) => {
        const capacityItemsRead = notification.capacityItemsRead?.map(() => 1)
        return { ...notification, isRead: 1 as const, capacityItemsRead }
    })
    await db.notifications.bulkPut(updates)
}

export const markAllCapacityItemsAsRead = async (notificationId: string): Promise<void> => {
    if (!db) return
    const notification = await db.notifications.get(notificationId)
    if (notification && notification.capacityItemsRead) {
        const newCapacityItemsRead = notification.capacityItemsRead.map(() => 1)

        await db.notifications.update(notificationId, {
            capacityItemsRead: newCapacityItemsRead,
            isRead: 1,
        })
    }
}

export const deleteAllNotificationsCache = async (): Promise<void> => {
    if (!db) return
    await db.notifications.clear()
}

export const useNotificationPoller = (agent: Agent | null, intervalSeconds = 10) => {
    const agentRef = useRef(agent)

    useEffect(() => {
        agentRef.current = agent
    }, [agent])

    useEffect(() => {
        const runQuery = async () => {
            if (agentRef.current) {
                const principal = await agentRef.current.getPrincipal()
                initializeDB(principal.toString())
                await queryNotifications(agentRef.current)
            }
        }
        runQuery()
        const intervalId = setInterval(runQuery, intervalSeconds * 1000)
        return () => clearInterval(intervalId)
    }, [agent, intervalSeconds])
}

const useNotification = () => {
    const notifications =
        useLiveQuery(
            async () => {
                if (!db) return []
                return await db.notifications.orderBy('timestamp').reverse().toArray()
            },
            [db],
            []
        ) || []

    const unreadUserCount =
        useLiveQuery(
            async () => {
                if (!db) return 0
                return await db.notifications.where({ source: 'user', isRead: 0 }).count()
            },
            [db],
            0
        ) || 0

    const unreadSystemCount =
        useLiveQuery(
            async () => {
                if (!db) return 0
                return await db.notifications.where({ source: 'system', isRead: 0 }).count()
            },
            [db],
            0
        ) || 0

    return {
        notifications,
        unreadUserCount,
        unreadSystemCount,
        actions: { markAsRead, markAllAsRead, markCapacityItemAsRead, markAllCapacityItemsAsRead },
    }
}

export default useNotification
