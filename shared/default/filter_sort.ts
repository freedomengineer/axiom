import { ActorMethod } from '@dfinity/agent'

import { DAxioms, DDAO, DFacade } from 'shared/types/services'
import { DefaultVariant, Primitive, isNullish, parsePrimitive } from 'shared/utils/typings'

export type PartialFilterInput<T> = {
    [K in keyof T]?: T[K] extends [] | [infer U] ? U | null : never
}
export type StringifiedFilter<T> = {
    [K in keyof T]?: T[K] extends [] | [infer U] ? string | null : never
}
export type StringifiedSort<T> = {
    by: T extends { by: infer U } ? ExtractKeys<U> : never
    order: 'ascending' | 'descending'
}
export type ExtractFilterSort<T> =
    T extends ActorMethod<infer A, any> ? { filter: A[0]; sort: A[1] } : never

export type QueryMap = {
    hypothesis: DAxioms.Axioms['getHypotheses']
    field: DAxioms.Axioms['getFields']
    evidence: DAxioms.Axioms['getEvidences']
    user: DFacade.Facade['getUsers']
    nominee: DDAO.DAO['getNominees']
    proposal: DDAO.DAO['getProposals']
    flag: DAxioms.Axioms['getFlags']
}
export type QueryName = keyof QueryMap

export type FilterSort = {
    [K in QueryName]: ExtractFilterSort<QueryMap[K]>
}
export type StringifiedFilterSort = {
    [K in QueryName]: {
        filter: StringifiedFilter<FilterSort[K]['filter']>
        sort: StringifiedSort<FilterSort[K]['sort']>
    }
}

export const FILTER_SORT_DECS = {
    hypothesis: {
        filter: {
            age: Primitive.Nat,
            field: Primitive.Text,
            publisher: Primitive.Principal,
            voter: Primitive.Principal,
            axiomsFrom: Primitive.Principal,
            bookmarksFrom: Primitive.Principal,
            userJoinedFields: Primitive.Principal,
            userFollowedPublishers: Primitive.Principal,
            q: Primitive.Text,
        },
        sort: {
            by: ['popularity', 'recent', 'positivity', 'neutrality', 'negativity', 'controversy'],
            order: ['descending', 'ascending'],
        },
    },
    field: {
        filter: {
            member: Primitive.Principal,
            q: Primitive.Text,
        },
        sort: {
            by: ['popularity', 'recent', 'alphabetical'],
            order: ['descending', 'ascending'],
        },
    },
    evidence: {
        filter: {
            publisher: Primitive.Principal,
            hypothesis: Primitive.Nat,
            voter: Primitive.Principal,
            side: ['Positive', 'Negative'],
            repliedTo: Primitive.Nat,
            q: Primitive.Text,
        },
        sort: {
            by: ['popularity', 'recent', 'positivity', 'negativity'],
            order: ['descending', 'ascending'],
        },
    },
    user: {
        filter: {
            capitalRaised: Primitive.Nat,
            q: Primitive.Text,
        },
        sort: {
            by: ['capitalRaised', 'recent', 'alphabetical'],
            order: ['descending', 'ascending'],
        },
    },
    nominee: {
        filter: {
            voter: Primitive.Principal,
            isCustodian: Primitive.Boolean,
        },
        sort: {
            by: ['token', 'voter'],
            order: ['descending', 'ascending'],
        },
    },
    proposal: {
        filter: {
            proposer: Primitive.Principal,
            voter: Primitive.Principal,
            category: ['Code', 'Field', 'Worker', 'Configs'],
            status: [
                'Failed',
                'Approved',
                'Rejected',
                'Proposed',
                'Executed',
                'Retried',
                'Expired',
            ],
        },
        sort: {
            by: ['updated', 'recent', 'acornReward', 'icpReward'],
            order: ['descending', 'ascending'],
        },
    },
    flag: {
        filter: {
            requester: Primitive.Principal,
            voter: Primitive.Principal,
            category: ['Hypothesis', 'Evidence'],
            status: ['Requested', 'Approved', 'Rejected', 'Expired', 'Executed', 'Failed'],
        },
        sort: {
            by: ['recent', 'difference'],
            order: ['descending', 'ascending'],
        },
    },
} as const

///

export const parseFilterFromObj = <T extends QueryName>(
    name: T,
    obj: StringifiedFilter<FilterSort[T]['filter']>
): FilterSort[T]['filter'] => {
    const res = {} as any
    for (const [key, value] of Object.entries(FILTER_SORT_DECS[name].filter) as any) {
        res[key] = parsePrimitive(value, (obj as any)[key])
    }
    return res
}
export const parseSortFromObj = <T extends keyof FilterSort>(
    name: T,
    obj: StringifiedSort<FilterSort[T]['sort']>
): FilterSort[T]['sort'] => {
    const res = {} as any
    for (const [key, value] of Object.entries(FILTER_SORT_DECS[name].sort) as any) {
        res[key] = DefaultVariant(value, (obj as any)[key])
    }
    return res
}

export const parseFilterFromUrl = <T extends QueryName>(name: T, url: URLSearchParams): T => {
    const res = {} as T
    for (const [key, value] of Object.entries(FILTER_SORT_DECS[name].filter) as any) {
        res[key as keyof T] = parsePrimitive(value, url.get(key)) as any
    }
    return res
}
export const parseSortFromUrl = <T extends QueryName>(name: T, url: URLSearchParams): T => {
    const res = {} as T
    for (const [key, value] of Object.entries(FILTER_SORT_DECS[name].sort) as any) {
        res[key as keyof T] = DefaultVariant(value, url.get(key)) as any
    }
    return res
}

export const parsePartialFilterFromUrl = <T extends QueryName>(
    name: T,
    url: URLSearchParams
): PartialFilterInput<FilterSort[T]['filter']> => {
    const res = {} as any
    for (const [key] of Object.entries(FILTER_SORT_DECS[name].filter) as any) {
        const param = url.get(key)
        if (!isNullish(param)) res[key] = param
    }
    return res as PartialFilterInput<FilterSort[T]['filter']>
}
export const parsePartialSortFromUrl = <T extends QueryName>(
    name: T,
    url: URLSearchParams
): PartialFilterInput<FilterSort[T]['sort']> => {
    const res = {} as any
    for (const [key] of Object.entries(FILTER_SORT_DECS[name].sort) as any) {
        const param = url.get(key)
        if (!isNullish(param)) res[key] = param
    }
    return res as PartialFilterInput<FilterSort[T]['sort']>
}
