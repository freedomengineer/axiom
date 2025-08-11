import type { Principal as _Principal } from '@dfinity/principal'

import { ACTOR_NAMES_BY_CANISTER } from 'shared/constants'

declare global {
    type CanisterName = keyof typeof ACTOR_NAMES_BY_CANISTER
    type ActorName = (typeof ACTOR_NAMES_BY_CANISTER)[CanisterName]

    type CanisterToActor<T extends CanisterName> = T extends CanisterName
        ? (typeof ACTOR_NAMES_BY_CANISTER)[T]
        : never

    type ActorToCanister<T extends ActorName> = {
        [K in CanisterName]: CanisterToActor<K> extends T ? K : never
    }[CanisterName]

    type ActorService<T extends ActorName> = T extends ActorName
        ? import(`./declarations/${T}/${T}.did.d`)._SERVICE
        : never

    type ActorDecs<T extends ActorName> = T extends ActorName
        ? import(`./declarations/${T}/${T}.did.d`)
        : never

    type Pagination<T> = {
        is: bigint
        of: bigint
        result: T[]
    }

    type DText = string
    type DNat = bigint
    type DPrincipal = _Principal
    type DVariant<K extends string = string, V = null> = { [name in K]: V }

    type Opt<T> = T | null
    type Nullish<T> = T | null | undefined
    type Wrap<T> = [T] | []

    type ExtractPairs<T> = T extends DVariant<infer K, infer V> ? [K, V] : never
    type ExtractKeys<T> = T extends { [K in infer R]: null } ? R : never
    type UnwrapDVariant<T> = T extends null
        ? null
        : T extends DVariant<infer K, infer U>
          ? U extends null
              ? K
              : [K, U]
          : never

    type EntryOfKey<T, K extends keyof any> = Extract<T, Record<K, any>>
    type ValueOfKey<T, K extends keyof any> = EntryOfKey<T, K>[K]

    type Commitment = {
        chunks: { blob: Uint8Array; checksum: string }[]
        moduleHash: string
        args: Uint8Array
    }

    type Metadata = {
        url: string
        title: string
        description: string
        image?: string
    }
}
