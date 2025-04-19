import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { ICP_FEE } from './common/constants'
import { amountOf, gatherPromises, reduceAmount } from './common/libs'
import { icpLedger, topUpIcp } from './helpers/ledger'
import { SHAREHOLDERS, USERS, split } from './helpers/split'
import { deploy, generateInterface } from './utils/canister'
import { deriveCurrentIdentity, generateNewIdentity } from './utils/identity'
import * as ICP from '../../frontend/declarations/icp_ledger/icp_ledger.did.js'

jest.setTimeout(60000)

describe('Split', () => {
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

        principals.icp_ledger = deploy('icp_ledger')
        expect(principals.icp_ledger).toBeDefined()

        for (const user of ['affiliate', 'dao', 'alice', 'bob', 'charlie']) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
            const topUp = topUpIcp(principals[user])
            await expect(topUp).resolves.toBeTruthy()
        }

        principals.split = deploy('split', `principal "${principals.founder.toText()}"`)
        expect(principals.split).toBeDefined()

        const splitInit = split(identities.founder).init(principals.affiliate, principals.dao)
        await expect(splitInit).resolves.toBeUndefined()

        generateInterface('icp_ledger')
        generateInterface('split')
    })

    it('should deposit', async () => {
        const usersApproval = await gatherPromises({
            ...USERS.map(([user, amount]) =>
                icpLedger(identities[user]).icrc2_approve({
                    ...defaultApproveArgs,
                    spender: { owner: principals.split, subaccount: [] },
                    amount: amount + ICP_FEE,
                })
            ),
        })
        for (const userApproval of Object.values(usersApproval)) {
            expect(userApproval).toHaveProperty('Ok')
        }

        const splitDeposit = await gatherPromises({
            ...USERS.map(([user, amount]) =>
                split(identities.founder).deposit(principals[user], amount)
            ),
        })
        for (const deposit of Object.values(splitDeposit)) {
            expect(deposit).toBeUndefined()
        }
    })

    it('should return correct balances and revenues', async () => {
        const { totalBalance, totalRevenue, shareholdersBalanceAndRevenue } = await gatherPromises({
            totalBalance: split().getTotalBalance(),
            totalRevenue: split().getTotalRevenue(),
            shareholdersBalanceAndRevenue: SHAREHOLDERS.map(([shareholder]) =>
                gatherPromises({
                    balance: split().getBalance(principals[shareholder]),
                    revenue: split().getRevenue(principals[shareholder]),
                })
            ),
        })
        expect(totalBalance).toBe(totalRevenue)
        expect(totalBalance).toBe(amountOf(7.5))

        for (const [i, [, percentage]] of SHAREHOLDERS.entries()) {
            const { balance, revenue } = shareholdersBalanceAndRevenue[i]

            expect(balance).toBe(revenue)
            expect(balance).toBe(reduceAmount(totalBalance, percentage))
        }
    })

    it('should withdraw 1/4', async () => {
        const withdrawPercentage = 0.25

        const { totalBalanceBefore, balancesBefore } = await gatherPromises({
            totalBalanceBefore: split().getTotalBalance(),
            balancesBefore: SHAREHOLDERS.map(([shareholder]) =>
                split().getBalance(principals[shareholder])
            ),
        })

        for (const [i, [shareholder]] of SHAREHOLDERS.entries()) {
            const balanceBefore: bigint = balancesBefore[i]
            const totalBalanceBefore: bigint = await split().getTotalBalance()

            const withdrawAmount: bigint = reduceAmount(balanceBefore, withdrawPercentage)

            const splitWithdraw = split(identities[shareholder]).withdrawBalance([withdrawAmount])
            await expect(splitWithdraw).resolves.toBeUndefined()

            const balanceAfter: bigint = await split().getBalance(principals[shareholder])
            const totalBalanceAfter: bigint = await split().getTotalBalance()

            expect(balanceAfter).toBe(balanceBefore - withdrawAmount)
            expect(totalBalanceAfter).toBe(totalBalanceBefore - withdrawAmount)
        }

        const { totalBalanceAfter, totalRevenue, revenues } = await gatherPromises({
            totalBalanceAfter: split().getTotalBalance(),
            totalRevenue: split().getTotalRevenue(),
            revenues: SHAREHOLDERS.map(([shareholder]) =>
                split().getRevenue(principals[shareholder])
            ),
        })

        expect(totalBalanceAfter).toBe(
            totalBalanceBefore - reduceAmount(totalBalanceBefore, withdrawPercentage)
        )
        expect(totalRevenue).toBe(amountOf(7.5))

        for (const [i, [, percentage]] of SHAREHOLDERS.entries()) {
            expect(revenues[i]).toBe(reduceAmount(totalRevenue, percentage))
        }
    })

    it('should withdraw all', async () => {
        const balancesBefore = await gatherPromises({
            ...SHAREHOLDERS.map(([shareholder]) => split().getBalance(principals[shareholder])),
        })

        for (const [i, [shareholder]] of SHAREHOLDERS.entries()) {
            const balanceBefore: bigint = balancesBefore[i]
            const totalBalanceBefore: bigint = await split().getTotalBalance()

            const splitWithdraw = split(identities[shareholder]).withdrawBalance([])
            await expect(splitWithdraw).resolves.toBeUndefined()

            const balanceAfter: bigint = await split().getBalance(principals[shareholder])
            const totalBalanceAfter: bigint = await split().getTotalBalance()

            expect(balanceAfter).toBe(0n)
            expect(totalBalanceAfter).toBe(totalBalanceBefore - balanceBefore)
        }

        const { totalBalanceAfter, totalRevenue, revenues } = await gatherPromises({
            totalBalanceAfter: split().getTotalBalance(),
            totalRevenue: split().getTotalRevenue(),
            revenues: SHAREHOLDERS.map(([shareholder]) =>
                split().getRevenue(principals[shareholder])
            ),
        })

        expect(totalBalanceAfter).toBe(0n)
        expect(totalRevenue).toBe(amountOf(7.5))

        for (const [i, [, percentage]] of SHAREHOLDERS.entries()) {
            expect(revenues[i]).toBe(reduceAmount(totalRevenue, percentage))
        }
    })

    it('should transfer ICP', async () => {
        const amount = amountOf(10.0)

        const { splitBalanceBefore, aliceBalanceBefore, aliceApproval } = await gatherPromises({
            splitBalanceBefore: icpLedger(identities.founder).icrc1_balance_of({
                owner: principals.split,
                subaccount: [],
            }),
            aliceBalanceBefore: icpLedger(identities.alice).icrc1_balance_of({
                owner: principals.alice,
                subaccount: [],
            }),
            aliceApproval: icpLedger(identities.alice).icrc2_approve({
                ...defaultApproveArgs,
                spender: { owner: principals.split, subaccount: [] },
                amount: amount + ICP_FEE,
            }),
        })
        expect(aliceApproval).toHaveProperty('Ok')

        const aliceDeposit = split(identities.founder).deposit(principals.alice, amount)
        await expect(aliceDeposit).resolves.toBeUndefined()

        const { splitBalance, aliceBalanceAfter, affiliateBalanceBefore } = await gatherPromises({
            splitBalance: icpLedger().icrc1_balance_of({
                owner: principals.split,
                subaccount: [],
            }),
            aliceBalanceAfter: icpLedger().icrc1_balance_of({
                owner: principals.alice,
                subaccount: [],
            }),
            affiliateBalanceBefore: icpLedger().icrc1_balance_of({
                owner: principals.affiliate,
                subaccount: [],
            }),
        })

        expect(aliceBalanceAfter).toBe(aliceBalanceBefore - amount - 2n * ICP_FEE)
        expect(splitBalance).toBe(splitBalanceBefore + amount)

        const affiliateWithdraw = split(identities.affiliate).withdrawBalance([])
        await expect(affiliateWithdraw).resolves.toBeUndefined()

        const { affiliateBalanceAfter, splitBalanceAfter } = await gatherPromises({
            affiliateBalanceAfter: icpLedger().icrc1_balance_of({
                owner: principals.affiliate,
                subaccount: [],
            }),
            splitBalanceAfter: icpLedger(identities.founder).icrc1_balance_of({
                owner: principals.split,
                subaccount: [],
            }),
        })

        expect(affiliateBalanceAfter).toBe(
            affiliateBalanceBefore + reduceAmount(amount, 0.5) - ICP_FEE
        )
        expect(splitBalanceAfter).toBe(splitBalanceBefore + reduceAmount(amount, 0.5))
    })
})
