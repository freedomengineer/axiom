import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as E from './common/errors'
import { amountOf, gatherPromises } from './common/libs'
import { icpLedger, topUpIcp } from './helpers/ledger'
import { PACKAGES, USERS, sales } from './helpers/sales'
import { deploy, generateInterface } from './utils/canister'
import { deriveCurrentIdentity, generateNewIdentity } from './utils/identity'
import * as SALES from '../../frontend/declarations/sales/sales.did.js'

jest.setTimeout(120000)

describe('Sales', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    beforeAll(async () => {
        // Generate accounts
        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }

        principals.icp_ledger = deploy('icp_ledger')
        expect(principals.icp_ledger).toBeDefined()

        for (const user of ['alice', 'bob', 'charlie', 'escrow']) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
        }

        principals.sales = deploy(
            'sales',
            `principal "${principals.founder.toText()}", principal "${principals.icp_ledger.toText()}", principal "${principals.escrow.toText()}"`
        )
        expect(principals.sales).toBeDefined()

        const salesInit = sales(identities.founder).init()
        await expect(salesInit).resolves.toBeUndefined()

        const topUp = topUpIcp(principals.sales, amountOf(100_000_000))
        await expect(topUp).resolves.toBeTruthy()

        generateInterface('sales')
    })

    it('should init', async () => {
        const maxLimit = 0

        const { packagePrincipals, packages } = await gatherPromises({
            packagePrincipals: sales().getPackagePrincipals(),
            packages: sales().getPackages(),
        })

        expect(packagePrincipals.length).toBe(PACKAGES.length)
        expect(new Set(packagePrincipals.map((e) => e[1])).size).toBe(PACKAGES.length)
        expect(packages.length).toBe(PACKAGES.length)
        expect(packages.sort()).toEqual(
            PACKAGES.map(([capitalRaised, name, symbol, logo]) => [
                capitalRaised,
                {
                    name,
                    symbol,
                    maxLimit,
                    logo: { logo_type: logo, data: logo },
                },
            ]).sort()
        )
    })

    it('should add package', async () => {
        const args = {
            name: '',
            symbol: '',
            maxLimit: 0,
            logo: { logo_type: '', data: '' },
        }

        const [res1, res2, res3] = await Promise.allSettled([
            sales(identities.alice).addPackage(amountOf(5.5), args),
            sales(identities.founder).addPackage(amountOf(0.5), args),
            sales(identities.founder).addPackage(amountOf(5.5), args),
        ])

        // Should trap if the caller is not the owner
        expect(res1.reason.message).toMatch(E.NOT_TOBE('Controller'))

        // Should trap if the package already exists
        expect(res2.reason.message).toMatch(E.ALREADY_EXISTED('Package'))

        // Should add package
        expect(res3.value).toBeUndefined()

        const { packagePrincipals, packages } = await gatherPromises({
            packagePrincipals: sales().getPackagePrincipals(),
            packages: sales().getPackages(),
        })

        expect(packagePrincipals.length).toBe(PACKAGES.length + 1)
        expect(new Set(packagePrincipals.map((e) => e[1])).size).toBe(PACKAGES.length + 1)
        expect(packages.length).toBe(PACKAGES.length + 1)
        expect(packages).toContainEqual([amountOf(5.5), args])
    })

    it('should trap on mintPackage', async () => {
        // Should trap if capitalRaised does not exits
        const trap = sales(identities.founder).mintPackage(principals.alice, amountOf(0.25))
        await expect(trap).rejects.toThrow(E.NOT_EXISTED('Package'))

        // Should trap if balance is not enough
        // const trap2 = sales(identities.founder).mintPackage(principals.alice, amountOf(5.5));
        // await expect(trap2).rejects.toThrow(Messages.INSUFFICIENT_AMOUNT);
    })

    it('should complete mintPackage', async () => {
        for (const [user, capitalRaised] of USERS) {
            const escrowBalanceBefore = await icpLedger().icrc1_balance_of({
                owner: principals.escrow,
                subaccount: [],
            })

            const res = sales(identities.founder).mintPackage(principals[user], capitalRaised)
            await expect(res).resolves.toBeUndefined()

            const escrowBalanceAfter = await icpLedger().icrc1_balance_of({
                owner: principals.escrow,
                subaccount: [],
            })
            expect(escrowBalanceAfter).toBe(escrowBalanceBefore + capitalRaised * 10n)
        }

        const usersPackagesAndBalance = await gatherPromises(
            USERS.map(([user]) => ({
                packages: sales().getOwnedPackages(principals[user]),
                balance: icpLedger().icrc1_balance_of({
                    owner: principals[user],
                    subaccount: [],
                }),
            }))
        )

        for (const [i, [, capitalRaised]] of USERS.entries()) {
            const { packages, balance } = usersPackagesAndBalance[i]

            expect(packages.length).toBe(Number(capitalRaised / amountOf(0.5)))
            expect(balance).toBe(capitalRaised * 10n)
        }
    })

    it('should not escrow Acorn if early birds are full', async () => {
        const setEarlyBirds = sales(identities.founder).setEarlyBirds(1n)
        await expect(setEarlyBirds).resolves.toBeUndefined()

        const capitalRaised = amountOf(2.5)

        const mintPackage = sales(identities.founder).mintPackage(principals.charlie, capitalRaised)
        await expect(mintPackage).resolves.toBeUndefined()

        const { ownedPackages, balance } = await gatherPromises({
            ownedPackages: sales().getOwnedPackages(principals.charlie),
            balance: icpLedger().icrc1_balance_of({
                owner: principals.charlie,
                subaccount: [],
            }),
        })

        expect(ownedPackages.length).toBe(Number(capitalRaised / amountOf(0.5)))
        expect(balance).toBe(0n)
    })
})
