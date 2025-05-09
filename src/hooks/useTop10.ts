import { useEffect, useState } from 'react'

import { error } from '@libs/toastify'
import { TOP10 } from '@utils/dashboard/top10'
import { parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'
import e8s from 'shared/utils/e8s'
import { ACORN, Affiliate, Axioms, Escrow, Facade } from 'shared/utils/services'

import { cacheUsername } from './useUsername'

export type Top10Key = (typeof TOP10)[number]['key']

export type Top10 = [string, number][]
type MemoryData = { top10: Top10; timestamp: number; refreshDate: string }

const STORAGE_PREFIX = 'top_10_'

const memoryCache = new Map<Top10Key, MemoryData>()
const pendingRequests = new Map<Top10Key, Promise<Top10 | null>>()

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
const _getStoredItem = (key: Top10Key): MemoryData | null => {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + key)
        return item ? _deserialize<MemoryData>(item) : null
    } catch (error) {
        console.error(`Error reading top10 for ${key}:`, error)
        return null
    }
}
const _setStoredItem = (key: Top10Key, data: MemoryData): void => {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, _serialize(data))
    } catch (error) {
        console.error(`Error storing top10 for ${key}:`, error)
    }
}

const _fetchTop10 = async (key: Top10Key): Promise<Top10 | null> => {
    try {
        const users = await Facade.call()
            .getUsers(
                parseFilterFromObj('user', {}),
                parseSortFromObj('user', { by: 'recent', order: 'descending' })
            )
            .then((res) =>
                res.map(({ username, principal }) => {
                    cacheUsername(principal, username)
                    return principal
                })
            )

        let top10Promise: Promise<[string, number]>[]

        switch (key) {
            case 'acornHolders':
                top10Promise = users.map((user) =>
                    ACORN.call()
                        .icrc1_balance_of({ owner: user, subaccount: [] })
                        .then((value) => [user.toText(), e8s.toNumber(value)])
                )
                break
            case 'acornBuriers':
                top10Promise = users.map((user) =>
                    Escrow.call()
                        .getBuriedAmount(user)
                        .then((value) => [user.toText(), e8s.toNumber(value)])
                )
                break
            case 'poweredVoters':
                top10Promise = users.map((user) =>
                    Escrow.call()
                        .getVotingPower(user)
                        .then((value) => [user.toText(), e8s.toNumber(value)])
                )
                break
            case 'referrers':
                top10Promise = users.map((user) =>
                    Affiliate.call()
                        .getUser(user)
                        .then((value) => [user.toText(), Number(value.referrals)])
                )
                break
            case 'hypothesisPublishers':
            case 'evidencePublishers':
            case 'hypothesisVoters':
            case 'evidenceVoters':
            case 'acornDropEarners':
                top10Promise = users.map((user) =>
                    Axioms.call()
                        .getUser(user)
                        .then((value) => [
                            user.toText(),
                            {
                                hypothesisPublishers: value.hypotheses.length,
                                evidencePublishers: value.evidences.length,
                                hypothesisVoters: value.votedHypotheses.length,
                                evidenceVoters: value.votedEvidences.length,
                                acornDropEarners: e8s.toNumber(value.earning.revenue),
                            }[key],
                        ])
                )
                break
        }
        const top10 = await Promise.all(top10Promise).then((res) =>
            res
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .filter(([, value]) => value > 0)
        )

        const data = { top10, timestamp: Date.now(), refreshDate: _getCurrentUtcDateString() }
        memoryCache.set(key, data)
        _setStoredItem(key, data)
        return top10
    } catch (err) {
        console.error(`Error fetching top10 for ${key}:`, err)
        error(err)
    }
    return null
}
const _getTop10Sync = (key: Top10Key): Top10 | null => {
    if (!key) return null

    const currentDate = _getCurrentUtcDateString()

    const memoryCached = memoryCache.get(key)
    if (memoryCached && memoryCached.refreshDate === currentDate) {
        console.log(`useTop10: found CachedItem for key ${key}`)
        return memoryCached.top10
    }

    const storedData = _getStoredItem(key)
    if (storedData && storedData.refreshDate === currentDate) {
        console.log(`useTop10: found StoredItem for key ${key}`)
        memoryCache.set(key, storedData)
        return storedData.top10
    }

    return null
}
const _getTop10 = async (key: Top10Key): Promise<Top10 | null> => {
    if (!key) return null

    if (pendingRequests.has(key)) {
        console.log(`useTop10: found PendingRequest for key ${key}`)
        return pendingRequests.get(key)!
    }

    const request = _fetchTop10(key)
    console.log(`useTop10: querying Top10 for key ${key}`)
    pendingRequests.set(key, request)
    request.finally(() => pendingRequests.delete(key))

    return request
}
export const getTop10 = async (key: Top10Key): Promise<Top10 | null> => {
    if (!key) return null

    const syncResult = _getTop10Sync(key)
    if (syncResult) return syncResult

    return _getTop10(key)
}
export const deleteAllTop10Cache = (): void => {
    memoryCache.clear()
}

const useTop10 = (key: Top10Key): Top10 | null => {
    const [top10s, setTop10] = useState<Top10 | null>(() => {
        return key ? _getTop10Sync(key) : null
    })

    useEffect(() => {
        if (top10s || !key) return

        _getTop10(key)
            .then(setTop10)
            .catch(() => setTop10(null))
    }, [key, top10s])

    return top10s
}

export default useTop10
