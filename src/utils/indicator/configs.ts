import { DIndicator } from 'shared/types/services'

export const UPDATE_LEVELS = ['Patch', 'Minor', 'Major'] as const
export const CONFIGURABLE_ACTORS = [
    'Indicator',
    'DAO',
    'Axioms',
    'Encyclopedia',
    'Chat',
    'Facade',
    'Escrow',
    'Sales',
    'Split',
    'Treasury',
    'Affiliate',
    'Assets',
    'ICPUSD',
] as const
export const DEPLOYABLE_ACTORS = [
    'DAO',
    'Axioms',
    'Encyclopedia',
    'Chat',
    'Facade',
    'Escrow',
    'Sales',
    'Split',
    'Treasury',
    'Affiliate',
    'Assets',
    'ICPUSD',
] as const
export const CONFIGS_TYPES = [
    'E8S',
    'Nat',
    'Bool',
    'Date',
    'Text',
    'Duration',
    'Proportion',
    'Float',
    'RangeInt',
    'RangeNat',
    'RangeFloat',
] as const
export const DEFAULT_CONFIGS: Record<(typeof CONFIGS_TYPES)[number], DIndicator.SharableValue> = {
    Bool: { Bool: false },
    Nat: { Nat: BigInt(0) },
    E8S: { E8S: BigInt(0) },
    Date: { Date: BigInt(0) },
    Duration: { Duration: BigInt(0) },
    Float: { Float: 0 },
    Text: { Text: '' },
    Proportion: { Proportion: [BigInt(0), BigInt(1)] },
    RangeInt: { RangeInt: [{ infinity: null }, { infinity: null }] },
    RangeNat: { RangeNat: [{ infinity: null }, { infinity: null }] },
    RangeFloat: { RangeFloat: [{ value: { inclusive: 0 } }, { value: { inclusive: 0 } }] },
} as const
