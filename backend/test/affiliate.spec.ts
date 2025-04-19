import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { ICP_FEE } from './common/constants'
import { amountOf, gatherPromises, reduceAmount } from './common/libs'
import { AFFILIATE_PROPORTION, PROPORTIONS, USERS, affiliate } from './helpers/affiliate'
import { icpLedger, topUpIcp } from './helpers/ledger'
import { split } from './helpers/split'
import { deploy, generateInterface } from './utils/canister'
import { deriveCurrentIdentity, generateNewIdentity } from './utils/identity'
import * as AFFILIATE from '../../frontend/declarations/affiliate/affiliate.did.js'
import * as ICP from '../../frontend/declarations/icp_ledger/icp_ledger.did.js'

jest.setTimeout(60000)

describe('Affiliate', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    const defaultTransferArgs: ICP.TransferArg = {
        to: { owner: Principal.fromText('aaaaa-aa'), subaccount: [] },
        amount: amountOf(0.0),
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
    }
    const defaultApproveArgs: ICP.ApproveArgs = {
        ...defaultTransferArgs,
        spender: { owner: Principal.fromText('aaaaa-aa'), subaccount: [] },
        amount: amountOf(0.0),
        expires_at: [],
        expected_allowance: [],
    }

    beforeAll(async () => {
        // Generate accounts
        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }

        principals.icp_ledger = deploy('icp_ledger')
        expect(principals.icp_ledger).toBeDefined()

        for (const [user] of USERS.slice(1)) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
        }

        principals.split = deploy('split', `principal "${principals.founder.toText()}"`)
        expect(principals.split).toBeDefined()
        principals.affiliate = deploy(
            'affiliate',
            `principal "${principals.founder.toText()}", principal "${principals.split.toText()}"`
        )
        expect(principals.affiliate).toBeDefined()

        const splitInit = split(identities.founder).init(principals.affiliate, principals.founder)
        await expect(splitInit).resolves.toBeUndefined()

        // Deposit ICP to Split pool
        const tempIdentity = generateNewIdentity()
        const tempPrincipal = tempIdentity.getPrincipal()

        const amount: bigint = USERS.reduce((acc, [, , amount]) => acc + amount, 0n)
        const topUp = topUpIcp(tempPrincipal, amount + 2n * ICP_FEE)
        await expect(topUp).resolves.toBeTruthy()

        const approval = icpLedger(tempIdentity).icrc2_approve({
            ...defaultApproveArgs,
            spender: { owner: principals.split, subaccount: [] },
            amount: amount + 2n * ICP_FEE,
        })
        await expect(approval).resolves.toHaveProperty('Ok')

        const splitDeposit = split(identities.founder).deposit(tempPrincipal, amount)
        await expect(splitDeposit).resolves.toBeUndefined()

        const totalBalance: bigint = await split().getTotalBalance()
        expect(totalBalance).toBe(amount)

        generateInterface('split')
        generateInterface('affiliate')
    })

    it('should fill referrals', async () => {
        for (const [user, referrer, amount] of USERS.slice(1)) {
            const register = affiliate(identities.founder).fillReferrals(principals[user], amount, [
                principals[referrer],
            ])
            await expect(register).resolves.toBeUndefined()
        }
    })

    it('should return correct balances', async () => {
        const referrerMap: Record<string, string> = Object.fromEntries(
            USERS.map(([user, referrer]) => [user, referrer])
        )
        const expectedBalances: Record<string, bigint> = Object.fromEntries(
            USERS.map(([user]) => [user, 0n])
        )

        for (const [user, , amount] of USERS) {
            let referrer = user
            for (const percentage of PROPORTIONS) {
                referrer = referrerMap[referrer]
                expectedBalances[referrer] += reduceAmount(amount, percentage)
            }
        }

        const [usersBalance, affiliateRevenue] = await Promise.all([
            gatherPromises(
                USERS.map(([user]) => ({
                    user,
                    userBalance: affiliate().getBalance(principals[user]),
                    userInfo: affiliate().getUser(principals[user]),
                }))
            ),
            split().getRevenue(principals.affiliate),
        ])

        for (const { user, userBalance, userInfo } of usersBalance) {
            expect(userBalance).toBe(expectedBalances[user])
            expect(userInfo).toStrictEqual({
                revenue: expectedBalances[user],
                referrer: principals[referrerMap[user]],
                lastWithdrawAmount: 0n,
                referrals: 0n,
            })
        }

        const expectedTotalBalance: bigint = USERS.reduce(
            (acc, [, , amount]) => acc + reduceAmount(amount, AFFILIATE_PROPORTION),
            0n
        )
        const totalBalance: bigint = usersBalance.reduce(
            (acc, { userBalance }) => acc + userBalance,
            0n
        )
        expect(totalBalance).toBe(expectedTotalBalance)
        expect(affiliateRevenue).toBe(expectedTotalBalance)
    })

    it('should withdraw balances', async () => {
        for (const [user] of USERS.slice(0, -1)) {
            const [withdrawableBefore, totalBalanceBefore] = await Promise.all([
                affiliate().getBalance(principals[user]),
                split().getBalance(principals.affiliate),
            ])

            const affiliateClaim = affiliate(identities[user]).withdrawBalance()
            await expect(affiliateClaim).resolves.toBeUndefined()

            const [withdrawalAmountAfter, totalBalanceAfter] = await Promise.all([
                affiliate().getBalance(principals[user]),
                split().getBalance(principals.affiliate),
            ])

            expect(withdrawalAmountAfter).toBe(0n)
            expect(totalBalanceAfter).toBe(totalBalanceBefore - withdrawableBefore)
        }

        const totalBalanceAfter: bigint = await split().getBalance(principals.affiliate)
        expect(totalBalanceAfter).toBe(0n)
    })
})
