import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as E from './../common/errors'
import { CONFIGS, USERS, dao } from './../helpers/dao'
import { facade } from './../helpers/facade'
import { shiftToMidnight, softDeployCanisters } from './../helpers/indicator'
import { deriveCurrentIdentity, generateNewIdentity } from './../utils/identity'
import * as DAO from '../../../shared/declarations/dao/dao.did.js'

jest.setTimeout(160000)

describe('Custodians', () => {
    const identities: Record<string, Identity> = { founder: deriveCurrentIdentity() }
    const principals: Record<string, Principal> = { founder: identities.founder.getPrincipal() }

    const defaultNomineeFilter: DAO.Filter__1 = { votedBy: [], isCustodian: [] }
    const defaultNomineeSort: DAO.Sort_1 = { by: { token: null }, order: { ascending: null } }

    const founderNominee: DAO.SharableNominee = {
        principal: principals.founder,
        ballots: [1n, 4000000000000000n],
        callerBallot: [4000000000000000n],
    }

    beforeAll(async () => {
        for (const [user] of USERS) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
        }
        await softDeployCanisters()
    })

    it('should get current custodians', async () => {
        const [custodians, nominees] = await Promise.all([
            dao(identities.founder).getNominees(
                { ...defaultNomineeFilter, isCustodian: [true] },
                defaultNomineeSort
            ),
            dao(identities.founder).getNominees(defaultNomineeFilter, defaultNomineeSort),
        ])

        expect(custodians).toStrictEqual([founderNominee])
        expect(nominees).toStrictEqual([founderNominee])
    })

    it('should register', async () => {
        for (const [user] of USERS) {
            const userRegistration = await facade(identities[user]).register(user, 0n, [])
            expect(userRegistration).toBeUndefined()
        }
    })

    it('should not cast ballots exceed limit', async () => {
        const nomineesToVote: Principal[] = [
            principals.bob,
            principals.charlie,
            principals.dave,
            principals.eve,
            principals.frank,
            principals.grace,
        ]
        const shouldFail = dao(identities.alice).castBallots(nomineesToVote)
        expect(shouldFail).rejects.toThrow(E.NOT_VALID('Nominee Voting'))
    })

    it('should cast ballots (1)', async () => {
        const nomineesToVote: Principal[] = [
            principals.bob,
            principals.charlie,
            principals.dave,
            principals.eve,
        ]
        await dao(identities.alice).castBallots(nomineesToVote)
        const votedNominee: DAO.SharableNominee[] = await dao(identities.alice).getNominees(
            { ...defaultNomineeFilter, votedBy: [principals.alice] },
            defaultNomineeSort
        )
        for (const nominee of votedNominee) {
            expect(nominee.callerBallot).toStrictEqual([10000000000n])
            expect(nominee.ballots).toStrictEqual([1n, 10000000000n])
            expect(nomineesToVote).toContainEqual(nominee.principal)
        }
        expect(votedNominee).toHaveLength(4)
    })

    it('should cast ballots (2)', async () => {
        const nomineesToVote: Principal[] = [principals.charlie, principals.dave, principals.eve]
        await dao(identities.bob).castBallots(nomineesToVote)
        const votedNominee: DAO.SharableNominee[] = await dao(identities.bob).getNominees(
            { ...defaultNomineeFilter, votedBy: [principals.bob] },
            defaultNomineeSort
        )
        for (const nominee of votedNominee) {
            expect(nominee.callerBallot).toStrictEqual([10000000000n])
            expect(nominee.ballots).toStrictEqual([2n, 20000000000n])
            expect(nomineesToVote).toContainEqual(nominee.principal)
        }
        expect(votedNominee).toHaveLength(3)
    })

    it('should change ballots (1)', async () => {
        const nomineesToVote: Principal[] = [principals.dave, principals.eve]
        await dao(identities.alice).castBallots(nomineesToVote)
        const [votedNominee, bobNominee, charlieNominee] = (await Promise.allSettled([
            dao(identities.alice).getNominees(
                { ...defaultNomineeFilter, votedBy: [principals.alice] },
                defaultNomineeSort
            ),
            dao(identities.alice).getNominee(principals.bob),
            dao(identities.alice).getNominee(principals.charlie),
        ])) as [
            PromiseFulfilledResult<DAO.SharableNominee[]>,
            PromiseRejectedResult,
            PromiseFulfilledResult<DAO.SharableNominee>,
        ]
        for (const nominee of votedNominee.value) {
            expect(nominee.callerBallot).toStrictEqual([10000000000n])
            expect(nominee.ballots).toStrictEqual([2n, 20000000000n])
            expect(nomineesToVote).toContainEqual(nominee.principal)
        }
        expect(votedNominee.value).toHaveLength(2)

        expect(charlieNominee.value.callerBallot).toStrictEqual([0n])
        expect(charlieNominee.value.ballots).toStrictEqual([1n, 10000000000n])

        expect(bobNominee.reason.message).toMatch(E.NOT_EXISTED('Nominee'))
    })

    it('should update custodians', async () => {
        await shiftToMidnight(CONFIGS.CUSTODIAN_ELECTION_TALLY_INTERVAL)
        const custodians: DAO.SharableNominee[] = await dao(identities.founder).getNominees(
            { ...defaultNomineeFilter, isCustodian: [true] },
            defaultNomineeSort
        )
        expect(custodians).toHaveLength(4)
    })

    it('should expire ballots', async () => {
        await shiftToMidnight(CONFIGS.NOMINEE_BALLOTS_AVAILABILITY_DURATION + 1n)
        const [allNominees, aliceVotedNominees, bobVotedNominees] = await Promise.all([
            dao().getNominees(defaultNomineeFilter, defaultNomineeSort),
            dao(identities.alice).getNominees(
                { ...defaultNomineeFilter, votedBy: [principals.alice] },
                defaultNomineeSort
            ),
            dao(identities.bob).getNominees(
                { ...defaultNomineeFilter, votedBy: [principals.bob] },
                defaultNomineeSort
            ),
        ])
        expect(allNominees).toHaveLength(0)
        expect(aliceVotedNominees).toHaveLength(0)
        expect(bobVotedNominees).toHaveLength(0)
    })
})
