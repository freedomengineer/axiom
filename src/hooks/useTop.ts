import { Agent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import { useEffect, useState } from 'react'

import { error } from '@libs/toastify'
import { TOP } from '@utils/dashboard/top'
import { DAxioms } from 'shared/types/services'
import { Affiliate, Axioms, Escrow } from 'shared/utils/services'
import { Variant } from 'shared/utils/typings'

export type TopKey = (typeof TOP)[number]['key']

export type Top = DAxioms.TopPagination
export type TopPages = Top[]
type MemoryData = { topPages: TopPages; timestamp: number; refreshDate: string }

export const PAGE_SIZE = 2n
const STORAGE_PREFIX = 'top_10_'

const memoryCache = new Map<TopKey, MemoryData>()
const pendingRequests = new Map<TopKey, Promise<Top | null>>()

const _serialize = (obj: any): string => {
    return JSON.stringify(obj, (_, value) => {
        if (typeof value === 'bigint') return { __bigint__: value.toString() }
        if (typeof value === 'object' && '__principal__' in value)
            return { __principal__: value.__principal__ }
        return value
    })
}
const _deserialize = <T = any>(str: string): T => {
    return JSON.parse(str, (_, value) => {
        if (value && typeof value === 'object' && '__bigint__' in value)
            return BigInt(value.__bigint__)
        if (value && typeof value === 'object' && '__principal__' in value)
            return Principal.fromText(value.__principal__)
        return value
    })
}
const _getCurrentUtcDateString = (): string => {
    const now = new Date()
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}
const _getStoredItem = (key: TopKey, principal: Nullish<Principal>): MemoryData | null => {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + key + '_' + principal?.toText())
        return item ? _deserialize<MemoryData>(item) : null
    } catch (error) {
        console.error(`Error reading top for ${key}:`, error)
        return null
    }
}
const _setStoredItem = (key: TopKey, data: MemoryData, principal: Nullish<Principal>): void => {
    try {
        localStorage.setItem(STORAGE_PREFIX + key + '_' + principal?.toText(), _serialize(data))
    } catch (error) {
        console.error(`Error storing top for ${key}:`, error)
    }
}

const _fetchTop = async (
    key: TopKey,
    page: bigint,
    agent: Nullish<Agent>,
    principal: Nullish<Principal>
): Promise<Top | null> => {
    try {
        let top: Top

        switch (key) {
            case 'AcornBuriers':
            case 'PoweredVoters':
                top = await Escrow.call(agent).getTopPagination(Variant(key), page, PAGE_SIZE)
                break
            case 'Referrers':
                top = await Affiliate.call(agent).getTopPagination(Variant(key), page, PAGE_SIZE)
                break
            case 'HypothesisPublishers':
            case 'EvidencePublishers':
            case 'HypothesisVoters':
            case 'EvidenceVoters':
            case 'AcornEarners':
                top = await Axioms.call(agent).getTopPagination(Variant(key), page, PAGE_SIZE)
                break
        }

        const topPages = _getStoredItem(key, principal)?.topPages ?? []
        topPages[Number(page) - 1] = top!
        const data = { topPages, timestamp: Date.now(), refreshDate: _getCurrentUtcDateString() }
        memoryCache.set(key, data)
        _setStoredItem(key, data, principal)
        return top!
    } catch (err) {
        console.error(`Error fetching top for ${key}:`, err)
        error(err)
    }
    return null
}
const _getTopSync = (key: TopKey, page: bigint, principal: Nullish<Principal>): Top | null => {
    if (!key) return null

    const currentDate = _getCurrentUtcDateString()

    const memoryCached = memoryCache.get(key)
    if (memoryCached && memoryCached.refreshDate === currentDate) {
        console.log(`useTop: found CachedItem for key ${key}`)
        return memoryCached.topPages[Number(page) - 1] ?? null
    }

    const storedData = _getStoredItem(key, principal)
    if (storedData && storedData.refreshDate === currentDate) {
        console.log(`useTop: found StoredItem for key ${key}`)
        memoryCache.set(key, storedData)
        return storedData.topPages[Number(page) - 1] ?? null
    }

    return null
}
const _getTop = async (
    key: TopKey,
    page: bigint,
    agent: Nullish<Agent>,
    principal: Nullish<Principal>
): Promise<Top | null> => {
    if (!key) return null

    if (pendingRequests.has(key)) {
        console.log(`useTop: found PendingRequest for key ${key}`)
        return pendingRequests.get(key)!
    }

    const request = _fetchTop(key, page, agent, principal)
    console.log(`useTop: querying Top for key ${key}`)
    pendingRequests.set(key, request)
    request.finally(() => pendingRequests.delete(key))

    return request
}
export const getTop = async (
    key: TopKey,
    page: bigint,
    agent: Nullish<Agent>,
    principal: Nullish<Principal>
): Promise<Top | null> => {
    if (!key) return null

    const syncResult = _getTopSync(key, page, principal)
    if (syncResult) return syncResult

    return _getTop(key, page, agent, principal)
}
export const deleteAllTopCache = (): void => {
    memoryCache.clear()
}

const useTop = (
    key: TopKey,
    page: bigint,
    agent: Nullish<Agent>,
    principal: Nullish<Principal>
): Top | null => {
    const [tops, setTop] = useState<Top | null>(() => {
        return key ? _getTopSync(key, page, principal) : null
    })

    useEffect(() => {
        if (tops || !key) return

        _getTop(key, page, agent, principal)
            .then(setTop)
            .catch(() => setTop(null))
    }, [key, tops, agent, principal])

    return tops
}

export default useTop
