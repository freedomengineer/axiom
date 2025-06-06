import { useEffect, useState } from 'react'

import { error } from '@libs/toastify'
import { TOP } from '@utils/dashboard/top'
import { parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'
import { DAxioms } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { ACORN, Affiliate, Axioms, Escrow, Facade } from 'shared/utils/services'
import { Variant } from 'shared/utils/typings'

import { cacheUsername } from './useUsername'

export type TopKey = (typeof TOP)[number]['key']

export type Top = DAxioms.TopPagination
export type TopPages = Top[]
type MemoryData = { topPages: TopPages; timestamp: number; refreshDate: string }

const PAGE_SIZE = 10n
const STORAGE_PREFIX = 'top_10_'

const memoryCache = new Map<TopKey, MemoryData>()
const pendingRequests = new Map<TopKey, Promise<Top | null>>()

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
const _getStoredItem = (key: TopKey): MemoryData | null => {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + key)
        return item ? _deserialize<MemoryData>(item) : null
    } catch (error) {
        console.error(`Error reading top for ${key}:`, error)
        return null
    }
}
const _setStoredItem = (key: TopKey, data: MemoryData): void => {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, _serialize(data))
    } catch (error) {
        console.error(`Error storing top for ${key}:`, error)
    }
}

const _fetchTop = async (key: TopKey, page: bigint): Promise<Top | null> => {
    try {
        let top: Top

        switch (key) {
            case 'acornHolders': {
                const users = await Facade.call()
                    .getUsersPrincipal()
                    .then((res) =>
                        res.map(({ username, principal }) => {
                            cacheUsername(principal, username)
                            return principal
                        })
                    )
                top = await users.map((user) =>
                    ACORN.call()
                        .icrc1_balance_of({ owner: user, subaccount: [] })
                        .then((value) => [user.toText(), e8s.toNumber(value)])
                )
                break
            }
            case 'AcornBuriers':
            case 'PoweredVoters':
                top = await Escrow.call().getTopPagination(Variant(key), page, 10n)
                break
            case 'Referrals':
                top = await Affiliate.call().getTopPagination(Variant(key), page, 10n)
                break
            case 'HypothesisPublishers':
            case 'EvidencePublishers':
            case 'HypothesisVoters':
            case 'EvidenceVoters':
            case 'AcornDropEarners':
                top = await Axioms.call().getTopPagination(Variant(key), page, 10n)
                break
        }

        const topPages = _getStoredItem(key)?.topPages ?? []
        topPages[Number(page) - 1] = top!
        const data = { topPages, timestamp: Date.now(), refreshDate: _getCurrentUtcDateString() }
        memoryCache.set(key, data)
        _setStoredItem(key, data)
        return top!
    } catch (err) {
        console.error(`Error fetching top for ${key}:`, err)
        error(err)
    }
    return null
}
const _getTopSync = (key: TopKey, page: bigint): Top | null => {
    if (!key) return null

    const currentDate = _getCurrentUtcDateString()

    const memoryCached = memoryCache.get(key)
    if (memoryCached && memoryCached.refreshDate === currentDate) {
        console.log(`useTop: found CachedItem for key ${key}`)
        return memoryCached.topPages[Number(page) - 1] ?? null
    }

    const storedData = _getStoredItem(key)
    if (storedData && storedData.refreshDate === currentDate) {
        console.log(`useTop: found StoredItem for key ${key}`)
        memoryCache.set(key, storedData)
        return storedData.topPages[Number(page) - 1] ?? null
    }

    return null
}
const _getTop = async (key: TopKey, page: bigint): Promise<Top | null> => {
    if (!key) return null

    if (pendingRequests.has(key)) {
        console.log(`useTop: found PendingRequest for key ${key}`)
        return pendingRequests.get(key)!
    }

    const request = _fetchTop(key, page)
    console.log(`useTop: querying Top for key ${key}`)
    pendingRequests.set(key, request)
    request.finally(() => pendingRequests.delete(key))

    return request
}
export const getTop = async (key: TopKey, page: bigint): Promise<Top | null> => {
    if (!key) return null

    const syncResult = _getTopSync(key, page)
    if (syncResult) return syncResult

    return _getTop(key, page)
}
export const deleteAllTopCache = (): void => {
    memoryCache.clear()
}

const useTop = (key: TopKey, page: bigint): Top | null => {
    const [tops, setTop] = useState<Top | null>(() => {
        return key ? _getTopSync(key, page) : null
    })

    useEffect(() => {
        if (tops || !key) return

        _getTop(key, page)
            .then(setTop)
            .catch(() => setTop(null))
    }, [key, tops])

    return tops
}

export default useTop
