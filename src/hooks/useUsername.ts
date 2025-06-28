import { Principal } from '@dfinity/principal'
import Dexie, { Table } from 'dexie'
import { useEffect, useState } from 'react'

import { Facade } from 'shared/utils/services'

const MAX_CACHE_SIZE = 3000
const CACHE_LIFETIME = 3 * 24 * 60 * 60 * 1000

export type Displayer = {
    username: string | null
    capitalRaised: string
}

class AxiomUsernameCache extends Dexie {
    users: Table<{ id: string; username: string; capitalRaised: string; timestamp: number }, string>
    constructor() {
        super('AxiomUsernameCache')
        this.version(2).stores({ users: '&id, username, capitalRaised, timestamp' })
        this.users = this.table('users')
    }
}

const db = new AxiomUsernameCache()
const memoryCache = new Map<string, Displayer>()
const pendingRequests = new Map<string, Promise<Displayer>>()

const _ensureMemoryCacheSize = () => {
    if (memoryCache.size <= MAX_CACHE_SIZE) return

    const entriesToRemove = Math.ceil(MAX_CACHE_SIZE * 0.1)
    const entries = [...memoryCache.entries()]
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
        memoryCache.delete(entries[i][0])
    }
}
const _cleanupCache = async () => {
    db.users
        .where('timestamp')
        .below(Date.now() - CACHE_LIFETIME)
        .delete()
        .catch(() => {})
}

const _fetchUsername = async (id: Principal): Promise<Displayer> => {
    try {
        const { username, capitalRaised } = await Facade.call()
            .getUserIdentifier({ Principal: id })
            .then((res) => ({
                username: res.username,
                capitalRaised: res.capitalRaised.toString(),
            }))

        const idStr = id.toString()
        memoryCache.set(idStr, { username, capitalRaised })
        _ensureMemoryCacheSize()

        db.users.put({ id: idStr, username, capitalRaised, timestamp: Date.now() }).catch((e) => {
            console.error('Error storing username in IndexedDB:', e)
        })

        return { username, capitalRaised }
    } catch {
        return { username: null, capitalRaised: '0' }
    }
}
const _getUsernameSync = (id: Principal): Displayer => {
    if (!id) return { username: null, capitalRaised: '0' }

    const idStr = id.toString()

    if (memoryCache.has(idStr)) {
        console.log(`useUsername: found CachedItem for username ${idStr}`)
        return memoryCache.get(idStr) || { username: null, capitalRaised: '0' }
    }

    return { username: null, capitalRaised: '0' }
}
const _getUsername = async (id: Principal): Promise<Displayer> => {
    if (!id) return { username: null, capitalRaised: '0' }

    const idStr = id.toString()

    if (pendingRequests.has(idStr)) {
        console.log(`useUsername: found PendingRequest for username ${idStr}`)
        return pendingRequests.get(idStr)!
    }

    try {
        const cachedUser = await db.users.get(idStr)
        if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_LIFETIME) {
            console.log(`useUsername: found StoredItem for username ${idStr}`)
            memoryCache.set(idStr, cachedUser)
            _ensureMemoryCacheSize()
            return { username: cachedUser.username, capitalRaised: cachedUser.capitalRaised }
        }
    } catch (e) {
        console.error('Error reading from IndexedDB:', e)
    }

    const request = _fetchUsername(id)
    console.log(`useUsername: querying UserIdentifier for ${idStr}`)
    pendingRequests.set(idStr, request)
    request.finally(() => pendingRequests.delete(idStr))

    return request
}
export const getUsername = async (id: Principal): Promise<Displayer> => {
    if (!id) return { username: null, capitalRaised: '0' }

    const syncResult = _getUsernameSync(id)
    if (syncResult.username !== null) return syncResult

    return _getUsername(id)
}
export const deleteAllUsernamesCache = async (): Promise<void> => {
    try {
        await db.users.clear()
        memoryCache.clear()
        console.log('All usernames cache cleared')
    } catch {}
}

const useUsername = (id: Principal | null): Displayer => {
    const [data, setData] = useState<Displayer>({ username: null, capitalRaised: '0' })

    useEffect(() => {
        if (data.username || !id) return

        _getUsername(id)
            .then((username) => setData(username))
            .catch(() => setData({ username: null, capitalRaised: '0' }))
    }, [id?.toString(), data.username])

    return data
}

export const cacheUsername = (id: Principal, username: string, capitalRaised: string): void => {
    if (!id || !username) return

    const idStr = id.toString()
    memoryCache.set(idStr, { username, capitalRaised })
    _ensureMemoryCacheSize()

    db.users.put({ id: idStr, username, capitalRaised, timestamp: Date.now() }).catch((e) => {
        console.error('Error caching username:', e)
    })
}

if (typeof window !== 'undefined') {
    setInterval(_cleanupCache, 24 * 60 * 60 * 1000)
    _cleanupCache()
}

export default useUsername
