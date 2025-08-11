import { useEffect, useState } from 'react'

import { DEPLOYABLE_ACTORS } from 'shared/constants'
import { DIndicator } from 'shared/types/services'
import * as SERVICES from 'shared/utils/services'
import { UnwrapVariant } from 'shared/utils/typings'

type Actor = (typeof DEPLOYABLE_ACTORS)[number]
type ActorConfigs = Record<string, UnwrapDVariant<DIndicator.SharableValue>>
type MemoryData = { config: ActorConfigs; timestamp: number; refreshDate: string }

const STORAGE_PREFIX = 'actor_configs_'

const memoryCache = new Map<Actor, MemoryData>()
const pendingRequests = new Map<Actor, Promise<ActorConfigs | null>>()

const _serialize = (obj: any): string => {
    return JSON.stringify(obj, (_, value) => {
        if (typeof value === 'bigint') return { __bigint__: value.toString() }
        return value
    })
}
const _deserialize = <T = any>(str: string): T => {
    return JSON.parse(str, (_, value) => {
        if (value && typeof value === 'object' && '__bigint__' in value)
            return BigInt(value.__bigint__)
        return value
    })
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
        console.error(`Error reading config for ${actor}:`, error)
        return null
    }
}
const _setStoredItem = (actor: Actor, data: MemoryData): void => {
    try {
        localStorage.setItem(STORAGE_PREFIX + actor, _serialize(data))
    } catch (error) {
        console.error(`Error storing config for ${actor}:`, error)
    }
}

const _fetchActorConfigs = async (actor: Actor): Promise<ActorConfigs | null> => {
    try {
        const config: ActorConfigs = await (SERVICES as any)[actor]
            .call()
            .getConfigs()
            .then((res: [string, DIndicator.SharableValue][]) =>
                Object.fromEntries(res.map(([key, value]) => [key, UnwrapVariant(value)]))
            )
        if (config) {
            const data = { config, timestamp: Date.now(), refreshDate: _getCurrentUtcDateString() }
            memoryCache.set(actor, data)
            _setStoredItem(actor, data)
            return config
        }
    } catch (error) {
        console.error(`Error fetching config for ${actor}:`, error)
    }
    return null
}
const _getConfigsSync = (actor: Actor): ActorConfigs | null => {
    if (!actor) return null

    const currentDate = _getCurrentUtcDateString()

    const memoryCached = memoryCache.get(actor)
    if (memoryCached && memoryCached.refreshDate === currentDate) {
        console.log(`useConfigs: found CachedItem for actor ${actor}`)
        return memoryCached.config
    }

    const storedData = _getStoredItem(actor)
    if (storedData && storedData.refreshDate === currentDate) {
        console.log(`useConfigs: found StoredItem for actor ${actor}`)
        memoryCache.set(actor, storedData)
        return storedData.config
    }

    return null
}
const _getConfigs = async (actor: Actor): Promise<ActorConfigs | null> => {
    if (!actor) return null

    if (pendingRequests.has(actor)) {
        console.log(`useConfigs: found PendingRequest for actor ${actor}`)
        return pendingRequests.get(actor)!
    }

    const request = _fetchActorConfigs(actor)
    console.log(`useConfigs: querying ActorConfigs for actor ${actor}`)
    pendingRequests.set(actor, request)
    request.finally(() => pendingRequests.delete(actor))

    return request
}
export const getConfigs = async (actor: Actor): Promise<ActorConfigs | null> => {
    if (!actor) return null

    const syncResult = _getConfigsSync(actor)
    if (syncResult) return syncResult

    return _getConfigs(actor)
}
export const deleteAllConfigsCache = (): void => {
    memoryCache.clear()
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key)
    }
}
export const getNumConfigsCache = (): number => {
    let count = 0
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(STORAGE_PREFIX)) count++
    }
    return count
}

const useConfigs = (actor: Actor): ActorConfigs | null => {
    const [configs, setConfigs] = useState<ActorConfigs | null>(() => {
        return actor ? _getConfigsSync(actor) : null
    })

    useEffect(() => {
        if (configs || !actor) return

        _getConfigs(actor)
            .then(setConfigs)
            .catch(() => setConfigs(null))
    }, [actor, configs])

    return configs
}

export default useConfigs
