import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as AXIOMS from '../../../shared/declarations/axioms/axioms.did.js'
import * as ICP from '../../../shared/declarations/icp_ledger/icp_ledger.did.js'
import { ICP_FEE } from '../common/constants.js'
import { amountOf } from '../common/libs.js'
import {
    type Choice,
    type Coefficient,
    axioms,
    parseChoice,
    parseCoefficient,
    parseDChoice,
    randomAmount,
    randomChoice,
    randomCoefficient,
} from '../helpers/axioms.js'
import { escrow } from '../helpers/escrow.js'
import { icpLedger, topUpIcp } from '../helpers/ledger.js'
import { deriveCurrentIdentity, generateNewIdentity } from '../utils/identity.js'

jest.setTimeout(120000)

describe('Axioms: Votes', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    let defaultApproveArgs: ICP.ApproveArgs

    const users: [string, bigint][] = [
        ['alice', amountOf(0.0)],
        ['bob', amountOf(5.0)],
        ['charlie', amountOf(7.5)],
        ['dave', amountOf(5.25)],
        ['eve', amountOf(0.0)],
        ['frank', amountOf(6.25)],
        ['grace', amountOf(0.5)],
        ['helen', amountOf(3.75)],
        ['ivan', amountOf(0.0)],
        ['jane', amountOf(4.0)],
    ]

    beforeAll(async () => {
        // Generate accounts
        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }

        defaultApproveArgs = {
            spender: { owner: principals.founder, subaccount: [] },
            amount: amountOf(0.0),
            expires_at: [],
            expected_allowance: [],
            fee: [],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
        }

        principals.icp_ledger = deploy('icp_ledger')
        expect(principals.icp_ledger).toBeDefined()

        for (const [user] of users) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
            const topUp = topUpIcp(principals[user])
            await expect(topUp).resolves.toBeTruthy()
        }

        principals.escrow = deploy(
            'escrow',
            `principal "${principals.founder.toText()}", principal "${principals.icp_ledger.toText()}"`
        )
        expect(principals.escrow).toBeDefined()
        principals.hypotheses = deploy(
            'hypotheses',
            `principal "${principals.founder.toText()}", principal "${principals.icp_ledger.toText()}", principal "${principals.escrow.toText()}"`
        )
        expect(principals.hypotheses).toBeDefined()

        const hypothesesInit = hypotheses(identities.founder).init()
        await expect(hypothesesInit).resolves.toBeUndefined()

        generateInterface('hypotheses')
    })

    it('should register', async () => {
        for (const [user] of users) {
            await hypotheses(identities.founder).register(principals[user])
        }
    })

    it('should vote', async () => {
        for (const [user, amount] of users) {
            const [coefficient, choice] = [randomCoefficient(), randomChoice()]

            if (amount !== 0n) {
                const approval = icpLedger(identities[user]).icrc2_approve({
                    ...defaultApproveArgs,
                    spender: { owner: principals.escrow, subaccount: [] },
                    amount: amount + ICP_FEE,
                })
                await expect(approval).resolves.toHaveProperty('Ok')
                const bury = escrow(identities[user]).bury(amount, parseCoefficient(coefficient))
                await expect(bury).resolves.toBeUndefined()
            }

            const {
                regularVotes: regularVotesBefore,
                poweredVotes: poweredVotesBefore,
                callerVote: callerVoteBefore,
            } = await hypotheses().getHypothesis(0n, [principals[user]])
            expect(callerVoteBefore).toStrictEqual([])

            const vote = hypotheses(identities[user]).voteHypothesis(0n, parseChoice(choice))
            await expect(vote).resolves.toBeUndefined()

            regularVotesBefore[choice] += 1n
            poweredVotesBefore[choice] += amount * BigInt(coefficient)

            const {
                regularVotes: regularVotesAfter,
                poweredVotes: poweredVotesAfter,
                callerVote: callerVoteAfter,
            } = await hypotheses().getHypothesis(0n, [principals[user]])
            expect(callerVoteAfter[0]).toStrictEqual({
                value: amount * BigInt(coefficient),
                choice: parseChoice(choice),
            })

            expect(regularVotesAfter).toStrictEqual(regularVotesBefore)
            expect(poweredVotesAfter).toStrictEqual(poweredVotesBefore)
        }
    })

    it('should change vote', async () => {
        for (const [user] of users) {
            const {
                regularVotes: regularVotesBefore,
                poweredVotes: poweredVotesBefore,
                callerVote: callerVoteBefore,
            } = await hypotheses().getHypothesis(0n, [principals[user]])

            const value = callerVoteBefore[0]!.value
            const choiceBefore = parseDChoice(callerVoteBefore[0]!.choice)
            const choiceAfter = randomChoice(choiceBefore)

            const vote = hypotheses(identities[user]).voteHypothesis(0n, parseChoice(choiceAfter))
            await expect(vote).resolves.toBeUndefined()

            regularVotesBefore[choiceBefore] -= 1n
            regularVotesBefore[choiceAfter] += 1n
            poweredVotesBefore[choiceBefore] -= value
            poweredVotesBefore[choiceAfter] += value

            const {
                regularVotes: regularVotesAfter,
                poweredVotes: poweredVotesAfter,
                callerVote: callerVoteAfter,
            } = await hypotheses().getHypothesis(0n, [principals[user]])

            expect(callerVoteAfter[0]).toStrictEqual({
                value,
                choice: parseChoice(choiceAfter),
            })
            expect(regularVotesAfter).toStrictEqual(regularVotesBefore)
            expect(poweredVotesAfter).toStrictEqual(poweredVotesBefore)
        }
    })

    it('should change vote after change coefficient', async () => {
        for (const [user, amount] of users) {
            if (amount === 0n) continue

            const {
                regularVotes: regularVotesBefore,
                poweredVotes: poweredVotesBefore,
                callerVote: callerVoteBefore,
            } = await hypotheses().getHypothesis(0n, [principals[user]])

            const valueBefore = callerVoteBefore[0]!.value
            const choiceBefore = parseDChoice(callerVoteBefore[0]!.choice)
            const choiceAfter = randomChoice(choiceBefore)
            const coefficientBefore = Number(amount == 0n ? 1 : valueBefore / amount) as Coefficient
            const coefficientAfter = randomCoefficient(coefficientBefore)
            const valueAfter = amount * BigInt(coefficientAfter)

            const withdraw = escrow(identities[user]).forceWithdrawAll()
            await expect(withdraw).resolves.toBeUndefined()
            const approval = icpLedger(identities[user]).icrc2_approve({
                ...defaultApproveArgs,
                spender: { owner: principals.escrow, subaccount: [] },
                amount: amount + ICP_FEE,
            })
            await expect(approval).resolves.toHaveProperty('Ok')
            const bury = escrow(identities[user]).bury(amount, parseCoefficient(coefficientAfter))
            await expect(bury).resolves.toBeUndefined()

            const vote = hypotheses(identities[user]).voteHypothesis(0n, parseChoice(choiceAfter))
            await expect(vote).resolves.toBeUndefined()

            regularVotesBefore[choiceBefore] -= 1n
            regularVotesBefore[choiceAfter] += 1n
            poweredVotesBefore[choiceBefore] -=
                valueBefore > poweredVotesBefore[choiceBefore] ? 0n : valueBefore
            poweredVotesBefore[choiceAfter] += valueAfter

            const {
                regularVotes: regularVotesAfter,
                poweredVotes: poweredVotesAfter,
                callerVote: callerVoteAfter,
            } = await hypotheses().getHypothesis(0n, [principals[user]])

            expect(callerVoteAfter[0]).toStrictEqual({
                value: valueAfter,
                choice: parseChoice(choiceAfter),
            })
            expect(regularVotesAfter).toStrictEqual(regularVotesBefore)
            expect(poweredVotesAfter).toStrictEqual(poweredVotesBefore)
        }
    })

    it('should change vote after change buried amount', async () => {
        for (const [user, amountBefore] of users) {
            const {
                regularVotes: regularVotesBefore,
                poweredVotes: poweredVotesBefore,
                callerVote: callerVoteBefore,
            } = await hypotheses().getHypothesis(0n, [principals[user]])

            const amountAfter = randomAmount()

            const valueBefore = callerVoteBefore[0]!.value
            const choiceBefore = parseDChoice(callerVoteBefore[0]!.choice)
            const choiceAfter = randomChoice(choiceBefore)
            const coefficientBefore = Number(
                amountBefore == 0n ? 1 : valueBefore / amountBefore
            ) as Coefficient
            const valueAfter = amountAfter * BigInt(coefficientBefore)

            if (amountBefore !== 0n) {
                const withdraw = escrow(identities[user]).forceWithdrawAll()
                await expect(withdraw).resolves.toBeUndefined()
            }
            if (amountAfter !== 0n) {
                const approval = icpLedger(identities[user]).icrc2_approve({
                    ...defaultApproveArgs,
                    spender: { owner: principals.escrow, subaccount: [] },
                    amount: amountAfter + ICP_FEE,
                })
                await expect(approval).resolves.toHaveProperty('Ok')
                const bury = escrow(identities[user]).bury(
                    amountAfter,
                    parseCoefficient(coefficientBefore)
                )
                await expect(bury).resolves.toBeUndefined()
            }

            const vote = hypotheses(identities[user]).voteHypothesis(0n, parseChoice(choiceAfter))
            await expect(vote).resolves.toBeUndefined()

            regularVotesBefore[choiceBefore] -= 1n
            regularVotesBefore[choiceAfter] += 1n
            poweredVotesBefore[choiceBefore] -=
                valueBefore > poweredVotesBefore[choiceBefore] ? 0n : valueBefore
            poweredVotesBefore[choiceAfter] += valueAfter

            const {
                regularVotes: regularVotesAfter,
                poweredVotes: poweredVotesAfter,
                callerVote: callerVoteAfter,
            } = await hypotheses().getHypothesis(0n, [principals[user]])

            expect(callerVoteAfter[0]).toStrictEqual({
                value: valueAfter,
                choice: parseChoice(choiceAfter),
            })
            expect(regularVotesAfter).toStrictEqual(regularVotesBefore)
            expect(poweredVotesAfter).toStrictEqual(poweredVotesBefore)
        }
    })
})
