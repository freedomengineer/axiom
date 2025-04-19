import { useEffect, useState } from 'react'

import { DSales } from 'shared/types/services'
import e8s, { E8S } from 'shared/utils/e8s'
import { Proportion } from 'shared/utils/proportion'
import { Sales } from 'shared/utils/services'
import { Unwrap, UnwrapVariant, isNil } from 'shared/utils/typings'

export enum EPackages {
    Membership = 'membership',
    Achievement = 'achievement',
}
export type ParsedMembershipPackage = {
    name: string
    symbol: string
    originalPrice: E8S
    adjustedPrice: [E8S, Proportion]
    acornBuried: [E8S, Proportion]
    acornLiquid: [E8S, Proportion]
    canisterUrl: string
    thumbnailUrl: string
}
export type ParsedAchievementPackage<T extends UnwrapDVariant<DSales.Achievement>> = {
    name: string
    symbol: string
    achievementType: T
    qualifyingThreshold: T extends 'OctupleBurial' ? E8S : T extends 'Referral' ? number : never
    canisterUrl: string
    thumbnailUrl: string
}
export type Packages<E extends EPackages> = E extends EPackages.Membership
    ? DSales.SharablePackage[]
    : E extends EPackages.Achievement
      ? DSales.SharableAchievementPackage[]
      : never
export type ParsedPackages<E extends EPackages> = E extends EPackages.Membership
    ? ParsedMembershipPackage[]
    : E extends EPackages.Achievement
      ? ParsedAchievementPackage<UnwrapDVariant<DSales.Achievement>>[]
      : never

export const parseMemberships = (
    items: Packages<EPackages.Membership>,
    configs: any
): ParsedPackages<EPackages.Membership> => {
    const priceAdjustedProportion = configs['PRICE_ADJUSTMENT_PROPORTION'][1] as Proportion
    const acornBuriedProportion = configs['ACORN_BURIED_MINT_PROPORTION'][1] as Proportion
    const acornLiquidProportion = configs['ACORN_LIQUID_MINT_PROPORTION'][1] as Proportion
    return items.map((item) => ({
        name: item.metadata.name,
        symbol: item.metadata.symbol,
        originalPrice: item.capitalRaised,
        adjustedPrice: [
            e8s.scaleBy(
                item!.capitalRaised,
                configs?.['PRICE_ADJUSTMENT_PROPORTION'][1] as Proportion
            ),
            priceAdjustedProportion,
        ],
        acornBuried: [
            e8s.scaleBy(
                item!.capitalRaised,
                configs?.['ACORN_BURIED_MINT_PROPORTION'][1] as Proportion
            ),
            acornBuriedProportion,
        ],
        acornLiquid: [
            e8s.scaleBy(
                item!.capitalRaised,
                configs?.['ACORN_LIQUID_MINT_PROPORTION'][1] as Proportion
            ),
            acornLiquidProportion,
        ],
        canisterUrl: isNil(item.principal) ? '' : Unwrap(item.principal)!.toText(),
        thumbnailUrl: item.metadata.logo.data,
    }))
}
export const parseAchievements = (
    items: Packages<EPackages.Achievement>,
    configs: any
): ParsedPackages<EPackages.Achievement> => {
    const qualifyingThreshold = {
        Referral: Number(configs['REFERRAL_ACHIEVEMENT_THRESHOLD'][1]),
        OctupleBurial: configs['OCTUPLE_BURIAL_ACHIEVEMENT_THRESHOLD'][1] as bigint,
    }
    return items.map((item) => {
        const achievementType = UnwrapVariant(item.achievement)
        return {
            name: item.metadata.name,
            symbol: item.metadata.symbol,
            achievementType,
            qualifyingThreshold: qualifyingThreshold[achievementType],
            canisterUrl: isNil(item.principal) ? '' : Unwrap(item.principal)!.toText(),
            thumbnailUrl: item.metadata.logo.data,
        }
    })
}
export const parsePackages = <E extends EPackages>(
    items: Packages<E>,
    e: E,
    configs: any
): ParsedPackages<E> => {
    switch (e) {
        case EPackages.Membership:
            return parseMemberships(
                items as Packages<EPackages.Membership>,
                configs
            ) as ParsedPackages<E>
        case EPackages.Achievement:
            return parseAchievements(
                items as Packages<EPackages.Achievement>,
                configs
            ) as ParsedPackages<E>
        default:
            throw new Error(`Unsupported package type: ${e}`)
    }
}

export type MemoryData<E extends EPackages> = {
    packages: ParsedPackages<E>
    timestamp: number
    refreshDate: string
}

const STORAGE_PREFIX = 'packages_'

const memoryCache = new Map<EPackages, MemoryData<EPackages> | null>()
const pendingRequests = new Map<EPackages, Promise<ParsedPackages<EPackages> | null>>()

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
const _getStoredItem = <E extends EPackages>(e: E): MemoryData<E> | null => {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + e)
        return item ? _deserialize<MemoryData<E>>(item) : null
    } catch (error) {
        console.error(`Error reading packages for ${e}:`, error)
        return null
    }
}
const _setStoredItem = <E extends EPackages>(e: E, data: MemoryData<E>): void => {
    try {
        localStorage.setItem(STORAGE_PREFIX + e, _serialize(data))
    } catch (error) {
        console.error(`Error storing packages for ${e}:`, error)
    }
}

const _fetchPackages = async <E extends EPackages>(
    e: E,
    configs: any
): Promise<ParsedPackages<E> | null> => {
    if (!configs) return null
    try {
        const packages = (await (e === EPackages.Membership
            ? Sales.call()
                  .getPackages()
                  .then((res) => parsePackages<EPackages.Membership>(res, e, configs))
            : Sales.call()
                  .getAchievementPackages()
                  .then((res) =>
                      parsePackages<EPackages.Achievement>(res, e, configs)
                  ))) as ParsedPackages<E>
        const data = { packages, timestamp: Date.now(), refreshDate: _getCurrentUtcDateString() }
        memoryCache.set(e, data)
        _setStoredItem<E>(e, data)
        return packages
    } catch (error) {
        console.error(`Error fetching packages for ${e}:`, error)
    }
    return null
}
const _getPackagesSync = <E extends EPackages>(e: E): ParsedPackages<E> | null => {
    const currentDate = _getCurrentUtcDateString()

    const memoryCached = memoryCache.get(e)
    if (memoryCached && memoryCached.refreshDate === currentDate) {
        console.log(`usePackages: found CachedItem for packages ${e}`)
        return memoryCached.packages as ParsedPackages<E>
    }

    const storedData = _getStoredItem<E>(e)
    if (storedData && storedData.refreshDate === currentDate) {
        console.log(`usePackages: found StoredItem for packages ${e}`)
        memoryCache.set(e, storedData)
        return storedData.packages
    }

    return null
}
const _getPackages = async <E extends EPackages>(
    e: E,
    configs: any
): Promise<ParsedPackages<E> | null> => {
    if (!configs) return null

    if (pendingRequests.has(e)) {
        console.log(`usePackages: found PendingRequest for packages ${e}`)
        return pendingRequests.get(e)! as Promise<ParsedPackages<E>>
    }

    const request = _fetchPackages<E>(e, configs)
    console.log(`usePackages: querying Package for packages ${e}`)
    pendingRequests.set(e, request)
    request.finally(() => pendingRequests.delete(e))

    return request
}
export const getPackages = async <E extends EPackages>(
    e: E,
    configs: any
): Promise<ParsedPackages<E> | null> => {
    const syncResult = _getPackagesSync<E>(e)
    if (syncResult) return syncResult

    return _getPackages<E>(e, configs)
}
export const getPackagesAndCache = async <E extends EPackages>(
    e: E,
    configs: any
): Promise<ParsedPackages<E> | null> => {
    if (pendingRequests.has(e)) {
        console.log(`usePackages: found PendingRequest for packages ${e}`)
        return pendingRequests.get(e)! as Promise<ParsedPackages<E>>
    }
    if (!configs) return null

    const request = _fetchPackages<E>(e, configs)
    console.log(`usePackages: querying Package for packages ${e}`)
    pendingRequests.set(e, request)
    request.finally(() => pendingRequests.delete(e))

    return request
}
export const deleteAllPackagesCache = (): void => {
    memoryCache.clear()
    try {
        localStorage.clear()
    } catch {}
}

const usePackages = <E extends EPackages>(e: E, configs: any): ParsedPackages<E> | null => {
    const [packages, setPackages] = useState<ParsedPackages<E> | null>(() => {
        return _getPackagesSync<E>(e)
    })

    useEffect(() => {
        if (packages) return

        _getPackages(e, configs)
            .then(setPackages)
            .catch(() => setPackages(null))
    }, [e, packages, configs])

    return packages
}

export default usePackages
