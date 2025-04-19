import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as Constants from './common/constants.js'
import * as E from './common/errors.js'
import { amountOf, gatherPromises } from './common/libs.js'
import { USERS, escrow } from './helpers/escrow.js'
import { icpLedger, topUpIcp } from './helpers/ledger.js'
import { generateInterface } from './utils/canister.js'
import { deriveCurrentIdentity, generateNewIdentity } from './utils/identity.js'
import * as ESCROW from '../../frontend/declarations/escrow/escrow.did.js'
import * as ICP from '../../frontend/declarations/icp_ledger/icp_ledger.did.js'

jest.setTimeout(120000)

describe('Drop', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    let defaultTransferArgs: ICP.TransferArg
    let defaultApproveArgs: ICP.ApproveArgs

    beforeAll(async () => {
        // Generate accounts
        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }

        defaultTransferArgs = {
            to: { owner: principals.founder, subaccount: [] },
            amount: amountOf(0.0),
            fee: [],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
        }
        defaultApproveArgs = {
            ...defaultTransferArgs,
            spender: { owner: principals.founder, subaccount: [] },
            amount: amountOf(0.0),
            expires_at: [],
            expected_allowance: [],
        }

        for (const [user] of USERS) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
            await topUpIcp(principals[user])
        }
    })

    it('should get voting power before burying', async () => {
        const usersVotingPower = await gatherPromises({
            ...USERS.map(([user]) => escrow().getVotingPower(principals[user])),
        })
        for (const userVotingPower of Object.values(usersVotingPower)) {
            expect(userVotingPower).toBe(0n)
        }
    })

    it('should bury', async () => {
        const usersApproval = await gatherPromises({
            ...USERS.map(([user, amount]) =>
                icpLedger(identities[user]).icrc2_approve({
                    ...defaultApproveArgs,
                    spender: { owner: principals.drop, subaccount: [] },
                    amount: (amount + Constants.ICP_FEE) * 4n,
                })
            ),
        })
        for (const userApproval of Object.values(usersApproval)) {
            expect(userApproval).toHaveProperty('Ok')
        }

        const usersBalanceBefore = await gatherPromises({
            ...USERS.map(([user]) =>
                icpLedger().icrc1_balance_of({
                    owner: principals[user],
                    subaccount: [],
                })
            ),
        })

        const usersBurials = await gatherPromises(
            USERS.map(([user, amount]) => ({
                single: escrow(identities[user]).bury(amount, { Single: null }),
                double: escrow(identities[user]).bury(amount, { Double: null }),
                quadruple: escrow(identities[user]).bury(amount, { Quadruple: null }),
                octuple: escrow(identities[user]).bury(amount, { Octuple: null }),
            }))
        )

        const usersBalanceAfter = await gatherPromises(
            USERS.map(([user]) => ({
                userBalanceAfter: icpLedger().icrc1_balance_of({
                    owner: principals[user],
                    subaccount: [],
                }),
                userBurials: escrow(identities[user]).getBurials(principals[user]),
            }))
        )

        for (const [user, amount] of USERS) {
            for (const userBurial of Object.values(usersBurials[user])) {
                expect(userBurial).toBeUndefined()
            }

            const balanceBefore = usersBalanceBefore[user]
            const balanceAfter = usersBalanceAfter[user].userBalanceAfter
            expect(balanceAfter).toBe(balanceBefore - (amount + Constants.ICP_FEE) * 4n)

            const burials = usersBalanceAfter[user].userBurials
            expect(burials.length).toBe(4)
        }
    })

    it('should get voting power after burying', async () => {
        const usersVotingPower = await gatherPromises({
            ...USERS.map(([user]) => escrow().getVotingPower(principals[user])),
        })
        for (const [user, amount] of USERS) {
            expect(usersVotingPower[user]).toBe(amount * 15n)
        }
    })

    it('should get burials', async () => {
        const now: bigint = BigInt(Date.now())

        const usersBurials = await gatherPromises({
            ...USERS.map(([user]) => escrow(identities[user]).getBurials(principals[user])),
        })

        for (const [user, amount] of USERS) {
            const burials = usersBurials[user].sort(
                (a, b) => Number(a.coefficient) - Number(b.coefficient)
            )
            expect(burials.length).toBe(4)

            let coefficient = 1n

            for (const burial of burials) {
                expect(burial.amount).toBe(amount)
                expect(burial.coefficient).toBe(coefficient)

                const period: bigint =
                    coefficient === 1n ? Constants.ONE_DAY * 89n : Constants.ONE_YEAR * coefficient

                expect(burial.issueDate).toBeGreaterThanOrEqual(now)
                expect(burial.expiryDate).toBe(burial.issueDate + period)

                coefficient *= 2n
            }
        }
    })

    it('should withdraw no burials', async () => {
        const burialsWithdrawal = await Promise.allSettled(
            USERS.map(([user]) => escrow(identities[user]).withdrawExpiredAmount())
        )
        for (const userBurial of burialsWithdrawal) {
            expect(userBurial).toHaveProperty('status', 'rejected')
            expect(userBurial.reason.message).toMatch(E.INTERNAL_FAILURE('Insufficient Balance'))
        }
    })

    it('should withdraw burials', async () => {
        // top up fee for transferring
        const topUp = topUpIcp(principals.drop, Constants.ICP_FEE * BigInt(USERS.length))
        await expect(topUp).resolves.toBeTruthy()

        const usersBalanceBefore = await gatherPromises({
            ...USERS.map(([user]) =>
                icpLedger().icrc1_balance_of({
                    owner: principals[user],
                    subaccount: [],
                })
            ),
        })

        const usersWithdrawal = await gatherPromises({
            ...USERS.map(([user]) => escrow(identities[user]).forceWithdrawAll()),
        })
        for (const userWithdrawal of Object.values(usersWithdrawal)) {
            expect(userWithdrawal).toBeUndefined()
        }

        const usersBalanceAfter = await gatherPromises(
            USERS.map(([user]) => ({
                balanceAfter: icpLedger().icrc1_balance_of({
                    owner: principals[user],
                    subaccount: [],
                }),
                burials: escrow(identities[user]).getBurials(principals[user]),
            }))
        )

        for (const [user, amount] of USERS) {
            const balanceBefore = usersBalanceBefore[user]
            const { balanceAfter, burials } = usersBalanceAfter[user]

            expect(balanceAfter).toBe(balanceBefore + amount * 4n)
            expect(burials.length).toBe(0)
        }
    })

    it('should get voting power after withdrawing', async () => {
        const usersVotingPower = await gatherPromises({
            ...USERS.map(([user]) => escrow().getVotingPower(principals[user])),
        })
        for (const callerVote of Object.values(usersVotingPower)) {
            expect(callerVote).toBe(0n)
        }
    })
})
