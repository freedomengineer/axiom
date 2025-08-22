import { useEffect, useState } from 'react'

import { capitalize } from '@libs/formatter'
import { DIndicator } from 'shared/types/services'
import * as SERVICES from 'shared/utils/services'
import { UnwrapVariant, Variant } from 'shared/utils/typings'

export type Actor = Exclude<UnwrapDVariant<DIndicator.ActorVariant>, 'Founder'>
export type ActorStatus = {
    Principal: ['Text', string]
    'Commit hash': ['Text', string]
    'Module hash': ['Text', string]
    Status: ['Text', string]
    Cycles: ['Nat', number]
    'Memory size': ['Nat', number]
    Args: ['Text', string]
}
type MemoryData = { status: ActorStatus; timestamp: number; refreshDate: string }

const STORAGE_PREFIX = 'actor_status_'

const memoryCache = new Map<Actor, MemoryData>()
const pendingRequests = new Map<Actor, Promise<ActorStatus | null>>()

const _serialize = (obj: any): string => {
    return JSON.stringify(obj)
}
const _deserialize = <T = any>(str: string): T => {
    return JSON.parse(str)
}
const _getCurrentUtcDateString = (): string => {
    const now = new Date()
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}
const _getStoredItem = (actor: Actor): MemoryData | null => {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + actor)
        return item ? _deserialize<MemoryData>(item) : null
    } catch (error) {
        console.error(`Error reading status for ${actor}:`, error)
        return null
    }
}
const _setStoredItem = (actor: Actor, data: MemoryData): void => {
    try {
        localStorage.setItem(STORAGE_PREFIX + actor, _serialize(data))
    } catch (error) {
        console.error(`Error storing status for ${actor}:`, error)
    }
}

const _fetchActorStatus = async (actor: Actor): Promise<ActorStatus | null> => {
    try {
        const status: ActorStatus = await SERVICES.Indicator.call()
            .getActorInfo(Variant(actor))
            .then((res: DIndicator.Info) => ({
                Principal: ['Text', (SERVICES as any)[actor].id],
                'Commit hash': ['Text', res.commitHash],
                'Module hash': ['Text', res.moduleHash],
                Status: ['Text', `${capitalize(UnwrapVariant(res.status))}`],
                Cycles: ['Nat', Number(res.cycles)],
                'Memory size': ['Nat', Number(res.memorySize)],
                Args: ['Text', res.args.toString()],
            }))
        if (status) {
            const data = { status, timestamp: Date.now(), refreshDate: _getCurrentUtcDateString() }
            memoryCache.set(actor, data)
            _setStoredItem(actor, data)
            return status
        }
    } catch (error) {
        console.error(`Error fetching status for ${actor}:`, error)
    }
    return null
}
const _getStatusSync = (actor: Actor): ActorStatus | null => {
    if (!actor) return null

    const currentDate = _getCurrentUtcDateString()

    const memoryCached = memoryCache.get(actor)
    if (memoryCached && memoryCached.refreshDate === currentDate) {
        console.log(`useStatus: found CachedItem for actor ${actor}`)
        return memoryCached.status
    }

    const storedData = _getStoredItem(actor)
    if (storedData && storedData.refreshDate === currentDate) {
        console.log(`useStatus: found StoredItem for actor ${actor}`)
        memoryCache.set(actor, storedData)
        return storedData.status
    }

    return null
}
const _getStatus = async (actor: Actor): Promise<ActorStatus | null> => {
    if (!actor) return null

    if (pendingRequests.has(actor)) {
        console.log(`useStatus: found PendingRequest for actor ${actor}`)
        return pendingRequests.get(actor)!
    }

    const request = _fetchActorStatus(actor)
    console.log(`useStatus: querying ActorStatus for actor ${actor}`)
    pendingRequests.set(actor, request)
    request.finally(() => pendingRequests.delete(actor))

    return request
}
export const getStatus = async (actor: Actor): Promise<ActorStatus | null> => {
    if (!actor) return null

    const syncResult = _getStatusSync(actor)
    if (syncResult) return syncResult

    return _getStatus(actor)
}
export const getStatusAndCache = async (actor: Actor): Promise<ActorStatus | null> => {
    if (!actor) return null

    if (pendingRequests.has(actor)) {
        console.log(`useStatus: found PendingRequest for actor ${actor}`)
        return pendingRequests.get(actor)!
    }
    const request = _fetchActorStatus(actor)
    console.log(`useStatus: querying ActorStatus for actor ${actor}`)
    pendingRequests.set(actor, request)
    request.finally(() => pendingRequests.delete(actor))

    return request
}
export const deleteAllStatusCache = (): void => {
    memoryCache.clear()
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key)
    }
}
export const getNumStatusCache = (): number => {
    let count = 0
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(STORAGE_PREFIX)) count++
    }
    return count
}

const useStatus = (actor: Actor): ActorStatus | null => {
    const [status, setStatus] = useState<ActorStatus | null>(() => {
        return actor ? _getStatusSync(actor) : null
    })

    useEffect(() => {
        if (status || !actor) return

        _getStatus(actor)
            .then(setStatus)
            .catch(() => setStatus(null))
    }, [actor, status])

    return status
}

export default useStatus
