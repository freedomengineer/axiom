import { ECategory, EStatus } from '@utils/dashboard/proposal'
import { DAxioms, DDAO, DFacade } from 'shared/types/services'
import { DefaultVariant, Primitive, parsePrimitive } from 'shared/utils/typings'

export const HYPOTHESIS_FILTER = {
    axiomsFrom: Primitive.Principal,
    publishedBy: Primitive.Principal,
    publishedAt: Primitive.Nat,
    publishedIn: Primitive.Text,
    votedBy: Primitive.Principal,
    bookmarksFrom: Primitive.Principal,
    containsPattern: Primitive.Text,
}
export const EVIDENCE_FILTER = {
    publishedBy: Primitive.Principal,
    publishedIn: Primitive.Nat,
    votedBy: Primitive.Principal,
    onSide: ['Positive', 'Negative'],
    containsPattern: Primitive.Text,
}
export const FIELD_FILTER = {
    joinedBy: Primitive.Principal,
    containsPattern: Primitive.Text,
}
export const USER_FILTER = {
    hasCapitalRaised: Primitive.Nat,
    containsPattern: Primitive.Text,
}
export const NOMINEE_FILTER = {
    votedBy: Primitive.Principal,
    isCustodian: Primitive.Boolean,
}
export const PROPOSAL_FILTER = {
    votedBy: Primitive.Principal,
    proposedBy: Primitive.Principal,
    proposedIn: Object.keys(ECategory),
    withStatus: Object.keys(EStatus),
}
export const FLAG_FILTER = {
    requestedBy: Primitive.Principal,
    requestedIn: ['Hypothesis', 'Evidence'],
    votedBy: Primitive.Principal,
    withStatus: ['Requested', 'Approved', 'Rejected', 'Expired', 'Executed', 'Failed'],
}

export const HYPOTHESIS_SORT = {
    by: ['popularity', 'recent', 'positivity', 'neutrality', 'negativity', 'controversy'],
    order: ['descending', 'ascending'],
}
export const EVIDENCE_SORT = {
    by: ['popularity', 'recent', 'positivity', 'negativity'],
    order: ['descending', 'ascending'],
}
export const FIELD_SORT = {
    by: ['popularity', 'recent', 'alphabetical'],
    order: ['descending', 'ascending'],
}
export const USER_SORT = {
    by: ['capitalRaised', 'recent', 'alphabetical'],
    order: ['descending', 'ascending'],
}
export const NOMINEE_SORT = {
    by: ['token', 'voter'],
    order: ['descending', 'ascending'],
}
export const PROPOSAL_SORT = {
    by: ['updated', 'recent', 'acornReward', 'icpReward'],
    order: ['descending', 'ascending'],
}
export const FLAG_SORT = {
    by: ['recent', 'difference'],
    order: ['descending', 'ascending'],
}

///

type PartialFilterInput<T> = {
    [K in keyof T]?: T[K] extends [] | [infer U] ? U | null : never
}
type SortInput<T> = {
    by: T extends { by: infer U } ? ExtractKeys<U> : never
    order: 'ascending' | 'descending'
}

export const buildFilter = <T>(
    defaultObj: {
        [P in keyof T]: Primitive | (T[P] extends object ? Array<DText> : never)
    },
    input: PartialFilterInput<T>
): T => {
    const obj = {} as T
    for (const [key, value] of Object.entries(defaultObj) as any) {
        obj[key as keyof T] = parsePrimitive(value, (input as any)[key]) as any
    }
    return obj
}
export const buildSort = <T>(
    defaultObj: { [P in keyof T]: Array<DText> },
    input: SortInput<T>
): T => {
    const obj = {} as T
    for (const [key, value] of Object.entries(defaultObj) as any) {
        obj[key as keyof T] = DefaultVariant(value, (input as any)[key]) as any
    }
    return obj
}

export const buildHypothesisFilter = (
    input: PartialFilterInput<DAxioms.Filter>
): DAxioms.Filter => {
    return buildFilter(HYPOTHESIS_FILTER, input)
}
export const buildHypothesisSort = (input: SortInput<DAxioms.Sort>): DAxioms.Sort => {
    return buildSort(HYPOTHESIS_SORT, input)
}

export const buildFieldFilter = (
    input: PartialFilterInput<DAxioms.Filter__2>
): DAxioms.Filter__2 => {
    return buildFilter(FIELD_FILTER, input)
}
export const buildFieldSort = (input: SortInput<DAxioms.Sort_2>): DAxioms.Sort_2 => {
    return buildSort(FIELD_SORT, input)
}

export const buildEvidenceFilter = (
    input: PartialFilterInput<DAxioms.Filter__3>
): DAxioms.Filter__3 => {
    return buildFilter(EVIDENCE_FILTER, input)
}
export const buildEvidenceSort = (input: SortInput<DAxioms.Sort_3>): DAxioms.Sort_3 => {
    return buildSort(EVIDENCE_SORT, input)
}

export const buildUserFilter = (input: PartialFilterInput<DFacade.Filter>): DFacade.Filter => {
    return buildFilter(USER_FILTER, input)
}
export const buildUserSort = (input: SortInput<DFacade.Sort>): DFacade.Sort => {
    return buildSort(USER_SORT, input)
}

export const buildNomineeFilter = (input: PartialFilterInput<DDAO.Filter__1>): DDAO.Filter__1 => {
    return buildFilter(NOMINEE_FILTER, input)
}
export const buildNomineeSort = (input: SortInput<DDAO.Sort_1>): DDAO.Sort_1 => {
    return buildSort(NOMINEE_SORT, input)
}

export const buildProposalFilter = (input: PartialFilterInput<DDAO.Filter>): DDAO.Filter => {
    return buildFilter(PROPOSAL_FILTER, input)
}
export const buildProposalSort = (input: SortInput<DDAO.Sort>): DDAO.Sort => {
    return buildSort(PROPOSAL_SORT, input)
}

export const buildFlagFilter = (
    input: PartialFilterInput<DAxioms.Filter__1>
): DAxioms.Filter__1 => {
    return buildFilter(FLAG_FILTER, input)
}
export const buildFlagSort = (input: SortInput<DAxioms.Sort_1>): DAxioms.Sort_1 => {
    return buildSort(FLAG_SORT, input)
}
