import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as E from './common/errors'
import { gatherPromises } from './common/libs'
import { USERS, axioms } from './helpers/axioms'
import { facade } from './helpers/facade'
import { softDeployCanisters } from './helpers/indicator'
import { derivePrincipal, generateInterface } from './utils/canister'
import { deriveCurrentIdentity, generateNewIdentity } from './utils/identity'
import * as AXIOMS from '../../frontend/declarations/axioms/axioms.did.js'

jest.setTimeout(160000)

describe('Axioms', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    const defaultFieldFilter: AXIOMS.Filter__2 = {
        joinedBy: [],
        containsPattern: [],
    }
    const defaultFieldSort: AXIOMS.Sort_2 = {
        by: { alphabetical: null },
        order: { ascending: null },
    }
    const defaultHypothesisFilter: AXIOMS.Filter = {
        axiomsFrom: [],
        publishedAt: [],
        publishedBy: [],
        publishedIn: [],
        votedBy: [],
        bookmarksFrom: [],
        containsPattern: [],
    }
    const defaultHypothesisSort: AXIOMS.Sort = {
        by: { recent: null },
        order: { ascending: null },
    }
    const defaultEvidenceFilter: AXIOMS.Filter__3 = {
        publishedBy: [],
        publishedIn: [],
        votedBy: [],
        containsPattern: [],
    }
    const defaultEvidenceSort: AXIOMS.Sort_3 = {
        by: { recent: null },
        order: { ascending: null },
    }

    beforeAll(async () => {
        await softDeployCanisters()

        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }
    })

    it('should match quick search', async () => {
        const pattern = 'Axiom'
        const limit = 10n

        const results = await Promise.all([
            axioms(identities.founder).getFieldsPagination(
                { ...defaultFieldFilter, containsPattern: [pattern] },
                defaultFieldSort,
                1n,
                limit
            ),
            axioms(identities.founder).getHypothesesPagination(
                { ...defaultHypothesisFilter, containsPattern: [pattern] },
                defaultHypothesisSort,
                1n,
                limit
            ),
            axioms(identities.founder).getEvidencesPagination(
                { ...defaultEvidenceFilter, containsPattern: [pattern] },
                defaultEvidenceSort,
                1n,
                limit
            ),
        ])

        expect(results[0]).toEqual({
            is: 1n,
            of: 1n,
            result: [
                expect.objectContaining({
                    members: [principals.founder],
                    hypothesisIds: [0n],
                    callerRole: [{ Member: null }],
                    name: 'Axiom governance',
                    description: 'The governance of the Axiom protocol',
                }),
            ],
        })
        expect(results[1]).toEqual({
            is: 1n,
            of: 1n,
            result: [
                expect.objectContaining({
                    id: 0n,
                    content: 'Axiom is a decentralized protocol',
                    axioms: 0n,
                    callerVote: [],
                    votes: { powered: [0n, 0n, 0n], regular: [0n, 0n, 0n] },
                    publisher: principals.founder,
                    callerAxiom: [false],
                    fieldId: 'Axiom governance',
                    evidenceIds: [],
                }),
            ],
        })
        expect(results[2]).toEqual({
            is: 1n,
            of: 1n,
            result: [],
        })
    })

    it('should not match quick search', async () => {
        const pattern = 'Very unlikely pattern'
        const limit = 10n

        const results = await Promise.all([
            axioms(identities.founder).getFieldsPagination(
                { ...defaultFieldFilter, containsPattern: [pattern] },
                defaultFieldSort,
                1n,
                limit
            ),
            axioms(identities.founder).getHypothesesPagination(
                { ...defaultHypothesisFilter, containsPattern: [pattern] },
                defaultHypothesisSort,
                1n,
                limit
            ),
            axioms(identities.founder).getEvidencesPagination(
                { ...defaultEvidenceFilter, containsPattern: [pattern] },
                defaultEvidenceSort,
                1n,
                limit
            ),
        ])

        expect(results[0]).toEqual({
            is: 1n,
            of: 1n,
            result: [],
        })
        expect(results[1]).toEqual({
            is: 1n,
            of: 1n,
            result: [],
        })
        expect(results[2]).toEqual({
            is: 1n,
            of: 1n,
            result: [],
        })
    })
})
