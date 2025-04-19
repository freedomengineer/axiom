import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { DECIMALS, ICP_FEE } from './common/constants'
import * as E from './common/errors'
import { amountOf, gatherPromises } from './common/libs'
import { axioms } from './helpers/axioms'
import { escrow } from './helpers/escrow'
import { USERS, facade } from './helpers/facade'
import { ACCEPTABLE_SLIPPAGE, getCurrentPrice } from './helpers/icpusd'
import { softDeployCanisters } from './helpers/indicator'
import { acornLedger, icpLedger, topUpIcp } from './helpers/ledger'
import { derivePrincipal } from './utils/canister'
import { deriveCurrentIdentity, generateNewIdentity } from './utils/identity'
import * as FACADE from '../../frontend/declarations/facade/facade.did.js'
import * as ICP from '../../frontend/declarations/icp_ledger/icp_ledger.did.js'

jest.setTimeout(180000)

describe('Facade', () => {
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
        await softDeployCanisters()

        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }
        for (const user of ['alice', 'bob', 'charlie', 'dave']) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
            await topUpIcp(principals[user], amountOf(110))
        }
        principals.split = derivePrincipal('split')
    })

    it('should trap in register', async () => {
        // Should trap if not approved
        const res1 = facade(identities.alice).register('alice', amountOf(20), [])
        await expect(res1).rejects.toThrow(E.EXTERNAL_FAILURE('ICP Transfer'))

        // Approve all users
        const currentPrice: bigint = await getCurrentPrice()
        const usersApproval = await gatherPromises({
            ...USERS.map(([user, amount]) =>
                icpLedger(identities[user]).icrc2_approve({
                    ...defaultApproveArgs,
                    spender: { owner: principals.split, subaccount: [] },
                    amount:
                        (((amount * DECIMALS) / currentPrice) * ACCEPTABLE_SLIPPAGE) / DECIMALS +
                        ICP_FEE,
                })
            ),
        })

        for (const userApproval of Object.values(usersApproval)) {
            expect(userApproval).toHaveProperty('Ok')
        }

        // Should trap if capitalRaised does not exits
        const res2 = facade(identities.alice).register('alice', amountOf(10), [])
        await expect(res2).rejects.toThrow(E.NOT_EXISTED('Package'))

        // // Should trap if not enough ICP
        const res3 = facade(identities.alice).register('alice', amountOf(200), [])
        await expect(res3).rejects.toThrow(E.EXTERNAL_FAILURE('ICP Transfer'))
    })

    it('should complete register', async () => {
        for (const [user, capitalRaised] of USERS.slice(0, 2)) {
            const res = await facade(identities[user]).register(user, capitalRaised, [])
            expect(res).toBeUndefined()
        }

        const usersInformation = await gatherPromises(
            USERS.slice(0, 2).map(([user]) => ({
                profile: facade().getUser(principals[user]),
                identifier: facade()
                    .getUserIdentifier({ Username: user })
                    .then((res) => res[0] as FACADE.Identifier),
                acornBalance: acornLedger().icrc1_balance_of({
                    owner: principals[user],
                    subaccount: [],
                }),
                buriedAmount: escrow().getBuriedAmount(principals[user]),
                axiomsEarning: axioms().getEarning(principals[user]),
            }))
        )

        for (const [i, [user, capitalRaised]] of USERS.slice(0, 2).entries()) {
            const { profile, identifier, acornBalance, buriedAmount, axiomsEarning } =
                usersInformation[i]

            expect(identifier.principal).toStrictEqual(principals[user])
            expect(profile.username).toBe(user)
            expect(profile.capitalRaised).toBe(capitalRaised)
            expect(acornBalance).toBe(capitalRaised * 10n)
            expect(buriedAmount).toBe(capitalRaised * 10n)
            expect(axiomsEarning.balance).toBe(0n)
        }
    })

    it('should edit user', async () => {
        const identifier: FACADE.Identifier = await facade().getUserIdentifier({
            Username: 'alice',
        })
        expect(identifier.principal).toStrictEqual(principals.alice)

        const [res1, res2, res3] = (await Promise.allSettled([
            facade(identities.alice).editUsername('bob'),
            facade(identities.dave).editUsername('dave'),
            facade(identities.alice).editUsername('test'),
        ])) as [PromiseRejectedResult, PromiseRejectedResult, PromiseFulfilledResult<undefined>]

        // Should trap if username already exists
        expect(res1.reason.message).toMatch(E.ALREADY_EXISTED('Username'))

        // Should trap if not to be user
        expect(res2.reason.message).toMatch(E.NOT_TOBE('User'))

        // Should edit username
        expect(res3.value).toBeUndefined()

        const userByUsernameAfter = facade().getUserIdentifier({ Username: 'alice' })
        const userByPrincipal = facade().getUserIdentifier({ Principal: principals.alice })

        await expect(userByUsernameAfter).rejects.toThrow(E.NOT_EXISTED('Username'))
        await expect(userByPrincipal).resolves.toHaveProperty('username', 'test')
    })
})
