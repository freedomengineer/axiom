import { Principal } from '@dfinity/principal'
import { useEffect, useState } from 'react'

import { parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'
import { DAffiliate, DAxioms, DDAO } from 'shared/types/services'
import { Affiliate, Axioms, DAO, Escrow } from 'shared/utils/services'

type MemoryData = {
    daoEarning: [DDAO.SharableEarning, DDAO.SharableEarning]
    axiomsEarning: DAxioms.SharableEarning
    affiliateEarning: DAffiliate.SharableEarning
    escrowClaimable: bigint
    fields: DAxioms.SharableField[]
}
type UserDataKey = keyof MemoryData
type UserDataValueMap = {
    [K in UserDataKey]: MemoryData[K]
}
type Listener = () => void

let cacheVersion = 0
let memoryCache: MemoryData | null = null
const listeners = new Set<Listener>()

const _notifyListeners = () => {
    cacheVersion++
    listeners.forEach((listener) => listener())
}
const _subscribe = (listener: Listener): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}
const useCacheSubscription = () => {
    const [version, setVersion] = useState(cacheVersion)

    useEffect(() => {
        const handleChange = () => setVersion(cacheVersion)
        const unsubscribe = _subscribe(handleChange)
        return unsubscribe
    }, [])

    return version
}

const _fetchUserData = async (principal: Principal): Promise<MemoryData | null> => {
    if (principal.isAnonymous()) return null
    try {
        const [daoEarning, axiomsEarning, affiliateEarning, escrowClaimable, fields] =
            await Promise.all([
                DAO.call().getEarning(principal),
                Axioms.call().getEarning(principal),
                Affiliate.call().getEarning(principal),
                Escrow.call().getClaimableAmount(principal),
                Axioms.call()
                    .getFieldsPagination(
                        parseFilterFromObj('field', { member: principal.toText() }),
                        parseSortFromObj('field', { by: 'popularity', order: 'descending' }),
                        1n,
                        10000n
                    )
                    .then((res) => res.result),
            ])
        memoryCache = { daoEarning, axiomsEarning, affiliateEarning, escrowClaimable, fields }
        _notifyListeners()
        return memoryCache
    } catch (error) {
        console.error(`Error fetching userData for ${principal.toText()}:`, error)
    }
    return null
}

const _fetchSpecificUserData = async <K extends UserDataKey>(
    principal: Principal,
    field: K
): Promise<UserDataValueMap[K] | null> => {
    try {
        if (memoryCache) {
            switch (field) {
                case 'daoEarning':
                    memoryCache.daoEarning = await DAO.call().getEarning(principal)
                    break
                case 'axiomsEarning':
                    memoryCache.axiomsEarning = await Axioms.call().getEarning(principal)
                    break
                case 'affiliateEarning':
                    memoryCache.affiliateEarning = await Affiliate.call().getEarning(principal)
                    break
                case 'escrowClaimable':
                    memoryCache.escrowClaimable = await Escrow.call().getClaimableAmount(principal)
                    break
                case 'fields':
                    memoryCache.fields = await Axioms.call()
                        .getFieldsPagination(
                            parseFilterFromObj('field', { member: principal.toText() }),
                            parseSortFromObj('field', { by: 'popularity', order: 'descending' }),
                            1n,
                            10000n
                        )
                        .then((res) => res.result)
                    break
            }
            _notifyListeners()
            return memoryCache[field]
        } else {
            await _fetchUserData(principal)
            return memoryCache?.[field] ?? null
        }
    } catch (error) {
        console.error(`Error fetching ${field} for ${principal.toText()}:`, error)
    }
    return null
}

const _getUserData = async (principal: Principal | null): Promise<MemoryData | null> => {
    if (principal) return _fetchUserData(principal)
    return null
}

export const getUserData = async (principal: Principal | null): Promise<MemoryData | null> => {
    if (memoryCache) return memoryCache
    if (principal) return _getUserData(principal)
    return null
}
export const refreshUserData = async (principal: Principal | null) => {
    await _fetchUserData(principal!)
    console.log('useUserData: refreshed')
}

export const getSpecificUserData = async <K extends UserDataKey>(
    principal: Principal | null,
    field: K
): Promise<UserDataValueMap[K] | null> => {
    const syncResult = memoryCache?.[field]
    if (syncResult) return syncResult

    if (principal) return _fetchSpecificUserData(principal, field)
    return null
}
export const refreshSpecificUserData = async <K extends UserDataKey>(
    principal: Principal | null,
    field: K
): Promise<UserDataValueMap[K] | null> => {
    if (principal) {
        const fetchResult = await _fetchSpecificUserData(principal, field)
        console.log(`useUserData: refreshed ${field}`)
        return fetchResult
    }
    return null
}

const useUserData = (principal: Principal | null): MemoryData | null => {
    const cacheVer = useCacheSubscription()
    const [data, setData] = useState<MemoryData | null>(() => {
        return principal ? (memoryCache ?? null) : null
    })

    useEffect(() => {
        if (data || !principal) return

        _fetchUserData(principal)
            .then(setData)
            .catch(() => setData(null))
    }, [principal])

    useEffect(() => {
        if (cacheVer > 0 && principal) setData(memoryCache)
    }, [cacheVer])

    return data
}
export const useSpecificUserData = <K extends UserDataKey>(
    principal: Principal | null,
    field: K
): UserDataValueMap[K] | null => {
    const cacheVer = useCacheSubscription()
    const [data, setData] = useState<UserDataValueMap[K] | null>(() => {
        return principal ? (memoryCache?.[field] ?? null) : null
    })

    useEffect(() => {
        if (data || !principal) return

        getSpecificUserData(principal, field)
            .then(setData)
            .catch(() => setData(null))
    }, [principal, field])

    useEffect(() => {
        if (cacheVer > 0 && principal && memoryCache) setData(memoryCache[field])
    }, [cacheVer])

    return data
}

export default useUserData
