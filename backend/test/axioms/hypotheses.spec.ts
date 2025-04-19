import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as ACORN from '../../../shared/declarations/acorn_ledger/acorn_ledger.did.js'
import * as AXIOMS from '../../../shared/declarations/axioms/axioms.did.js'
import * as E from '../common/errors.js'
import { amountOf, gatherPromises } from '../common/libs.js'
import { ACTIVITY_COSTS, axioms } from '../helpers/axioms.js'
import { facade } from '../helpers/facade.js'
import { softDeployCanisters } from '../helpers/indicator.js'
import { acornLedger, topUpAcorn } from '../helpers/ledger.js'
import { derivePrincipal } from '../utils/canister.js'
import { deriveCurrentIdentity, generateNewIdentity } from '../utils/identity.js'

jest.setTimeout(120000)

describe('Axioms: Hypotheses', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    const defaultHypothesisFilter: AXIOMS.Filter = {
        publishedAt: [],
        publishedBy: [],
        publishedIn: [],
        votedBy: [],
        axiomsFrom: [],
    }
    const defaultHypothesisSort: AXIOMS.Sort = {
        by: { recent: null },
        order: { ascending: null },
    }
    const defaultTransferArgs: ACORN.TransferArg = {
        to: { owner: Principal.fromText('aaaaa-aa'), subaccount: [] },
        amount: amountOf(0.0),
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
    }
    const defaultApproveArgs: ACORN.ApproveArgs = {
        ...defaultTransferArgs,
        spender: { owner: Principal.fromText('aaaaa-aa'), subaccount: [] },
        amount: amountOf(0.0),
        expires_at: [],
        expected_allowance: [],
    }

    // first hypothesis is already published
    const OFFSET = 1
    const USERS: number[] = Array.from({ length: 3 }, (_, i) => i)
    const PUBLISHES: number[] = Array.from({ length: 6 }, (_, i) => i)
    const FIELDS: [boolean, boolean] = [true, false]

    beforeAll(async () => {
        await softDeployCanisters()

        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }
        for (const user of ['admin', ...USERS]) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
            const topUp = topUpAcorn(principals[user], amountOf(10000.0))
            await expect(topUp).resolves.toBeTruthy()
        }
        principals.treasury = derivePrincipal('treasury')
    })

    it('should setup', async () => {
        for (const user of ['admin', ...USERS]) {
            const registration = facade(identities[user]).register(`${user}`, 0n, [])
            await expect(registration).resolves.toBeUndefined()
        }

        const approval = acornLedger(identities.admin).icrc2_approve({
            ...defaultApproveArgs,
            spender: { owner: principals.treasury, subaccount: [] },
            amount: ACTIVITY_COSTS.FIELD_CREATION * BigInt(FIELDS.length),
        })
        await expect(approval).resolves.toHaveProperty('Ok')
        const fieldsCreation = await Promise.all(
            FIELDS.map((field) =>
                axioms(identities.admin).createField(`${field}`, `${field}`, field, false)
            )
        )
        for (const fieldCreation of fieldsCreation) {
            expect(fieldCreation).toBeUndefined()
        }

        const fieldsRegistrations = await gatherPromises({
            ...USERS.map((user) =>
                FIELDS.map((field) => axioms(identities[user]).joinField(`${field}`))
            ),
        })
        for (const fieldRegistration of Object.values(fieldsRegistrations).flat()) {
            expect(fieldRegistration).toBeUndefined()
        }
    })

    it('should get', async () => {
        const { publishDate, ...hypothesis }: AXIOMS.Sharable__1 = await axioms(
            identities.founder
        ).getHypothesis(0n)
        expect(hypothesis).toStrictEqual({
            id: 0n,
            content: 'Axiom is a decentralized protocol',
            publisher: principals.founder,
            fieldId: 'Axiom governance',
            hashtags: ['Axiom'],
            regularVotes: [0n, 0n, 0n],
            poweredVotes: [0n, 0n, 0n],
            evidenceIds: [],
            axioms: 0n,
            callerVote: [],
            callerAxiom: [false],
        })
    })

    it('should publish', async () => {
        const approvals = await Promise.all(
            USERS.map((user) =>
                acornLedger(identities[user]).icrc2_approve({
                    ...defaultApproveArgs,
                    spender: { owner: principals.treasury, subaccount: [] },
                    amount:
                        ACTIVITY_COSTS.HYPOTHESIS_PUBLISH * BigInt(PUBLISHES.length / USERS.length),
                })
            )
        )
        for (const approval of approvals) {
            expect(approval).toHaveProperty('Ok')
        }
        for (const publish of PUBLISHES) {
            const publishingHypothesis = axioms(
                identities[publish % USERS.length]
            ).publishHypothesis(`${publish >= PUBLISHES.length / 2}`, `${publish + OFFSET}`, [])
            await expect(publishingHypothesis).resolves.toBeUndefined()
        }

        // No vote for hypotheses published in hypothesis-moderated field
        const hypothesesVoting = await Promise.all(
            PUBLISHES.filter((publish) => publish < PUBLISHES.length / 2).map((publish) =>
                axioms(
                    identities[(((publish - 1) % USERS.length) + USERS.length) % USERS.length]
                ).voteHypothesis(BigInt(publish + OFFSET), { Neutral: null })
            )
        )
        for (const hypothesisVoting of hypothesesVoting) {
            expect(hypothesisVoting).toBeUndefined()
        }
    })

    it('should filter', async () => {
        const publishedByUsers = await gatherPromises(
            USERS.map((user) => ({
                published: axioms()
                    .getHypotheses(
                        {
                            ...defaultHypothesisFilter,
                            publishedBy: [principals[user]],
                        },
                        defaultHypothesisSort
                    )
                    .then((hypotheses) => hypotheses.map(({ id }) => Number(id)).sort()),
                voted: axioms()
                    .getHypotheses(
                        { ...defaultHypothesisFilter, votedBy: [principals[user]] },
                        defaultHypothesisSort
                    )
                    .then((hypotheses) => hypotheses.map(({ id }) => Number(id)).sort()),
                publishedAndVoted: axioms()
                    .getHypotheses(
                        {
                            ...defaultHypothesisFilter,
                            publishedBy: [principals[user]],
                            votedBy: [principals[user]],
                        },
                        defaultHypothesisSort
                    )
                    .then((hypotheses) => hypotheses.map(({ id }) => Number(id)).sort()),
            }))
        )

        for (const [user, { published, voted, publishedAndVoted }] of publishedByUsers.entries()) {
            expect(published).toEqual([user + OFFSET])
            expect(voted).toEqual([
                ((((user + 1) % USERS.length) + USERS.length) % USERS.length) + OFFSET,
            ])
            expect(publishedAndVoted).toEqual([])
        }

        const publishedByFields = await Promise.all(
            FIELDS.map((field) =>
                axioms()
                    .getHypotheses(
                        { ...defaultHypothesisFilter, publishedIn: [`${field}`] },
                        defaultHypothesisSort
                    )
                    .then((hypotheses) => hypotheses.map(({ id }) => Number(id)).sort())
            )
        )

        for (const [i, field] of FIELDS.entries()) {
            if (field === false) {
                expect(publishedByFields[i]).toEqual(USERS.map((e) => e + OFFSET).sort())
                const awaitingByField = axioms().getAwaitingHypotheses(`${field}`)
                await expect(awaitingByField).rejects.toThrow(
                    E.RESTRICTED('Hypothesis Moderated Mode')
                )
            } else {
                expect(publishedByFields[i]).toEqual([])
                const awaitingByField = axioms()
                    .getAwaitingHypotheses(`${field}`)
                    .then((e) => e.map(({ publisher }) => publisher).sort())
                await expect(awaitingByField).resolves.toEqual(
                    USERS.map((e) => principals[e]).sort()
                )
            }
        }
    })

    it('should approve and reject', async () => {
        const rejectedUser: Principal = principals[USERS.length - 1]
        const [awaitingByField, balanceBefore] = await Promise.all([
            axioms().getAwaitingHypotheses('true'),
            acornLedger().icrc1_balance_of({ owner: rejectedUser, subaccount: [] }),
        ])

        const hypothesesModeration = await Promise.all(
            awaitingByField.map(({ publisher, publishDate }) =>
                publisher.compareTo(rejectedUser) === 'eq'
                    ? axioms(identities.admin).rejectHypothesis('true', publisher, publishDate)
                    : axioms(identities.admin).approveHypothesis('true', publisher, publishDate)
            )
        )
        for (const hypothesisModeration of hypothesesModeration) {
            expect(hypothesisModeration).toBeUndefined()
        }

        const [publishedByField, awaitingByFieldAfter, balanceAfter] = await Promise.all([
            axioms().getHypotheses(
                { ...defaultHypothesisFilter, publishedIn: ['true'] },
                defaultHypothesisSort
            ),
            axioms().getAwaitingHypotheses('true'),
            acornLedger().icrc1_balance_of({ owner: rejectedUser, subaccount: [] }),
        ])

        expect(publishedByField.map(({ id }) => Number(id)).sort()).toEqual(
            USERS.filter((e) => principals[e] != rejectedUser)
                .map((e) => e + USERS.length + OFFSET)
                .sort()
        )
        expect(awaitingByFieldAfter).toHaveLength(0)
        expect(balanceAfter).toBe(balanceBefore + ACTIVITY_COSTS.HYPOTHESIS_PUBLISH)
    })

    it('should approve all', async () => {
        const { publishedBefore, publishedByFieldBefore, publishedByUsersBefore } =
            await gatherPromises({
                publishedBefore: axioms().getHypotheses(
                    defaultHypothesisFilter,
                    defaultHypothesisSort
                ),
                publishedByFieldBefore: axioms().getHypotheses(
                    { ...defaultHypothesisFilter, publishedIn: ['true'] },
                    defaultHypothesisSort
                ),
                publishedByUsersBefore: USERS.map((user) =>
                    axioms().getHypotheses(
                        {
                            ...defaultHypothesisFilter,
                            publishedBy: [principals[user]],
                        },
                        defaultHypothesisSort
                    )
                ),
            })

        const approvals = await Promise.all(
            USERS.map((user) =>
                acornLedger(identities[user]).icrc2_approve({
                    ...defaultApproveArgs,
                    spender: { owner: principals.treasury, subaccount: [] },
                    amount: ACTIVITY_COSTS.HYPOTHESIS_PUBLISH,
                })
            )
        )
        for (const approval of approvals) {
            expect(approval).toHaveProperty('Ok')
        }
        const usersPublishing = await Promise.all(
            USERS.map((user) =>
                axioms(identities[user]).publishHypothesis('true', 'test approve all', [])
            )
        )
        for (const userPublishing of usersPublishing) {
            expect(userPublishing).toBeUndefined()
        }

        const awaitingByFieldBefore: AXIOMS.SharableHypothesis[] =
            await axioms().getAwaitingHypotheses('true')
        expect(awaitingByFieldBefore).toHaveLength(USERS.length)

        const approveAllHypotheses = axioms(identities.admin).approveAllHypotheses('true')
        await expect(approveAllHypotheses).resolves.toBeUndefined()

        const {
            publishedAfter,
            publishedByFieldAfter,
            awaitingByFieldAfter,
            publishedByUsersAfter,
        } = await gatherPromises({
            publishedAfter: axioms().getHypotheses(defaultHypothesisFilter, defaultHypothesisSort),
            publishedByFieldAfter: axioms().getHypotheses(
                { ...defaultHypothesisFilter, publishedIn: ['true'] },
                defaultHypothesisSort
            ),
            awaitingByFieldAfter: axioms().getAwaitingHypotheses('true'),
            publishedByUsersAfter: USERS.map((user) =>
                axioms().getHypotheses(
                    { ...defaultHypothesisFilter, publishedBy: [principals[user]] },
                    defaultHypothesisSort
                )
            ),
        })

        expect(publishedAfter).toHaveLength(publishedBefore.length + USERS.length)
        expect(awaitingByFieldAfter).toHaveLength(0)
        expect(publishedByFieldAfter).toHaveLength(publishedByFieldBefore.length + USERS.length)

        for (const user of USERS) {
            expect(publishedByUsersAfter[user].length).toBe(publishedByUsersBefore[user].length + 1)
            expect(
                publishedByUsersAfter[user].sort((a, b) => Number(a.id) - Number(b.id)).pop()
            ).toHaveProperty('content', 'test approve all')
        }
    })

    it('should paginate', async () => {
        const allHypotheses: AXIOMS.SharableHypothesis[] = await axioms().getHypotheses(
            defaultHypothesisFilter,
            defaultHypothesisSort
        )
        const size = PUBLISHES.length - 1 + USERS.length + OFFSET
        expect(allHypotheses).toHaveLength(size)

        const limits = [1, 2, 3, 4, 5, 6, 7]
        const pages = [1, 2, 3, 4]

        const paginationsByLimits = await gatherPromises<
            { is: bigint; of: bigint; result: AXIOMS.SharableHypothesis[] }[][]
        >(
            limits.map((limit) => ({
                ...pages.map((page) =>
                    axioms().getHypothesesPagination(
                        defaultHypothesisFilter,
                        defaultHypothesisSort,
                        BigInt(page),
                        BigInt(limit)
                    )
                ),
            }))
        )

        for (const [i, paginationsByLimit] of paginationsByLimits.entries()) {
            const limit = limits[i]
            const expectedOf = Math.floor((size + limit - 1) / limit)

            for (const [j, { is, of, result }] of Object.entries(paginationsByLimit)) {
                const page = pages[j]
                const isLastPage = limit * page >= size
                const pageSize = isLastPage && size % limit !== 0 ? size % limit : limit

                expect(is).toBe(BigInt(isLastPage ? of : page))
                expect(of).toBe(BigInt(expectedOf))
                expect(result).toHaveLength(pageSize)

                expect(result.map(({ id }) => Number(id)).sort()).toEqual(
                    allHypotheses
                        .slice(limit * (Number(is) - 1), limit * (Number(is) - 1) + pageSize)
                        .map(({ id }) => Number(id))
                        .sort()
                )
            }
        }
    })

    it('should publish directly for moderators', async () => {
        const approval = acornLedger(identities.admin).icrc2_approve({
            ...defaultApproveArgs,
            spender: { owner: principals.treasury, subaccount: [] },
            amount: ACTIVITY_COSTS.HYPOTHESIS_PUBLISH,
        })
        await expect(approval).resolves.toHaveProperty('Ok')
        const publishingHypothesis = axioms(identities.admin).publishHypothesis(
            'true',
            'test publish directly',
            []
        )
        await expect(publishingHypothesis).resolves.toBeUndefined()

        const { publishedByField, publishedByUser } = await gatherPromises({
            publishedByField: axioms().getHypotheses(
                { ...defaultHypothesisFilter, publishedIn: ['true'] },
                defaultHypothesisSort
            ),
            publishedByUser: axioms().getHypotheses(
                { ...defaultHypothesisFilter, publishedBy: [principals.admin] },
                defaultHypothesisSort
            ),
        })

        expect(publishedByField).toHaveLength(6)
        expect(publishedByField[publishedByField.length - 1]).toHaveProperty(
            'content',
            'test publish directly'
        )
        expect(publishedByUser).toHaveLength(1)
        expect(publishedByUser[publishedByUser.length - 1]).toHaveProperty(
            'content',
            'test publish directly'
        )
    })
})
