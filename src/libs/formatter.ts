import { ACTOR_SERVICES } from 'shared/constants'
import { DIndicator } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import proportion, { Proportion } from 'shared/utils/proportion'
import { UnwrapVariant } from 'shared/utils/typings'

import { formatDate } from './date'

export const slice = (str: string, length: number): string => {
    return str.length > length ? str.slice(0, length) + '...' : str.length === 0 ? 'N/A' : str
}

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const normal = (str: string): string => {
    return str.charAt(0).toLowerCase() + str.slice(1)
}

export const formatConfigValue = (
    configValue: UnwrapDVariant<DIndicator.SharableValue>
): string => {
    const [type, value] = configValue
    switch (type) {
        case 'Text':
            return value as string
        case 'Float':
        case 'Nat':
            return value.toString()
        case 'E8S':
            return `${e8s.toString(value as bigint)} ACORN`
        case 'Bool':
            return value ? 'True' : 'False'
        case 'Duration':
            return `${value.toString()} days`
        case 'Date':
            return formatDate({ nano: value as DIndicator.SharableDate })
        case 'Proportion':
            return `${value[0]}/${value[1]} (${proportion.toString(value as Proportion)})`
        case 'RangeInt':
        case 'RangeNat':
        case 'RangeFloat': {
            const [min, max] = value as DIndicator.SharableRange_2
            const [minEntry, maxEntry] = [UnwrapVariant(min), UnwrapVariant(max)]
            let minStr: string
            if (minEntry === 'infinity') {
                minStr = '(-∞'
            } else {
                const [minBound, minValue] = UnwrapVariant(minEntry[1])
                minStr =
                    minBound === 'inclusive' ? `[${minValue.toString()}` : `(${minValue.toString()}`
            }
            let maxStr: string
            if (maxEntry === 'infinity') {
                maxStr = '+∞)'
            } else {
                const [maxBound, maxValue] = UnwrapVariant(maxEntry[1])
                maxStr =
                    maxBound === 'inclusive' ? `${maxValue.toString()}]` : `${maxValue.toString()})`
            }
            return `${minStr}, ${maxStr}`
        }
    }
}

export const parseCanister = (canisterId: string): string => {
    for (const [name, Actor] of Object.entries(ACTOR_SERVICES)) {
        if (Actor.canisterId === canisterId) {
            return name
        }
    }
    return canisterId
}

export const parseConfigs = (
    configs: [string, DIndicator.SharableValue][]
): Record<string, UnwrapDVariant<DIndicator.SharableValue>> => {
    return Object.fromEntries(
        configs.map(([key, value]: [string, DIndicator.SharableValue]) => [
            key,
            UnwrapVariant(value),
        ])
    )
}
export const parseConfigsValues = (
    configs: [string, DIndicator.SharableValue][]
): Record<string, UnwrapDVariant<DIndicator.SharableValue>[1]> => {
    return Object.fromEntries(
        configs.map(([key, value]: [string, DIndicator.SharableValue]) => [
            key,
            UnwrapVariant(value)[1],
        ])
    )
}
export const parseStatus = (
    status: DIndicator.Info
): Record<string, UnwrapDVariant<DIndicator.SharableValue>> => {
    return {
        status: ['Text', `#${UnwrapVariant(status.status)}`],
        moduleHash: ['Text', status.moduleHash],
        args: ['Text', status.args.toString()],
        cycles: ['Nat', status.cycles],
        commitHash: ['Text', status.commitHash],
        memorySize: ['Text', `${(Number(status.memorySize) / 1048576).toFixed(6)} MB`],
    }
}
