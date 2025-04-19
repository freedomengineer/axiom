import { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { ACORN_FEE, ICP_FEE, PREMINT } from './common/constants'
import { amountOf } from './common/libs'
import { acornLedger, icpLedger } from './helpers/ledger'
import { deploy, generateInterface } from './utils/canister'
import { deriveCurrentIdentity, generateNewIdentity } from './utils/identity'
import * as ICP from '../../frontend/declarations/icp_ledger/icp_ledger.did.js'

jest.setTimeout(60000)

describe('Ledgers (ACORN, ICP)', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    let defaultTransferArgs: ICP.TransferArg

    beforeAll(async () => {
        // Generate accounts
        identities = { minter: deriveCurrentIdentity() }
        principals = { minter: identities.minter.getPrincipal() }

        for (const user of ['alice', 'bob', 'charlie']) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
        }

        defaultTransferArgs = {
            to: { owner: principals.minter, subaccount: [] },
            amount: amountOf(0.0),
            fee: [],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
        }

        // Deploy canister
        principals.icp = deploy('icp_ledger')
        expect(principals.icp).toBeDefined()
        principals.acorn = deploy('acorn_ledger')
        expect(principals.acorn).toBeDefined()

        generateInterface('icp_ledger')
        generateInterface('acorn_ledger')
    })

    it('should return correct ICP balances', async () => {
        {
            const balance = await icpLedger().icrc1_balance_of({
                owner: principals.minter,
                subaccount: [],
            })
            expect(balance).toBe(PREMINT)
        }

        for (const user of ['alice', 'bob', 'charlie']) {
            const balance = await icpLedger().icrc1_balance_of({
                owner: principals[user],
                subaccount: [],
            })
            expect(balance).toBe(0n)
        }
    })

    it('should return correct ACORN balances', async () => {
        {
            const balance = await acornLedger().icrc1_balance_of({
                owner: principals.minter,
                subaccount: [],
            })
            expect(balance).toBe(PREMINT / 10n)
        }

        for (const user of ['alice', 'bob', 'charlie']) {
            const balance = await icpLedger().icrc1_balance_of({
                owner: principals[user],
                subaccount: [],
            })
            expect(balance).toBe(0n)
        }
    })

    it('should transfer ICP', async () => {
        const amount = amountOf(1000)

        const minterTransfer = icpLedger(identities.minter).icrc1_transfer({
            ...defaultTransferArgs,
            to: {
                owner: principals.alice,
                subaccount: [],
            },
            amount,
        })
        await expect(minterTransfer).resolves.toHaveProperty('Ok')

        const minterBalance = await icpLedger().icrc1_balance_of({
            owner: principals.minter,
            subaccount: [],
        })
        const aliceBalanceBefore = await icpLedger().icrc1_balance_of({
            owner: principals.alice,
            subaccount: [],
        })
        expect(minterBalance).toBe(PREMINT)
        expect(aliceBalanceBefore).toBe(amount)

        const aliceTransfer = icpLedger(identities.alice).icrc1_transfer({
            ...defaultTransferArgs,
            to: {
                owner: principals.bob,
                subaccount: [],
            },
            amount: amount - ICP_FEE,
        })
        await expect(aliceTransfer).resolves.toHaveProperty('Ok')

        const aliceBalanceAfter = await icpLedger().icrc1_balance_of({
            owner: principals.alice,
            subaccount: [],
        })
        const bobBalance = await icpLedger().icrc1_balance_of({
            owner: principals.bob,
            subaccount: [],
        })
        expect(aliceBalanceAfter).toBe(0n)
        expect(bobBalance).toBe(amount - ICP_FEE)
    })

    it('should transfer ACORN', async () => {
        const amount = amountOf(1000)

        const minterTransfer = acornLedger(identities.minter).icrc1_transfer({
            ...defaultTransferArgs,
            to: {
                owner: principals.alice,
                subaccount: [],
            },
            amount,
        })
        await expect(minterTransfer).resolves.toHaveProperty('Ok')

        const minterBalance = await acornLedger().icrc1_balance_of({
            owner: principals.minter,
            subaccount: [],
        })
        const aliceBalanceBefore = await acornLedger().icrc1_balance_of({
            owner: principals.alice,
            subaccount: [],
        })
        expect(minterBalance).toBe(PREMINT / 10n)
        expect(aliceBalanceBefore).toBe(amount)

        const aliceTransfer = acornLedger(identities.alice).icrc1_transfer({
            ...defaultTransferArgs,
            to: {
                owner: principals.bob,
                subaccount: [],
            },
            amount: amount - ACORN_FEE,
        })
        await expect(aliceTransfer).resolves.toHaveProperty('Ok')

        const aliceBalanceAfter = await acornLedger().icrc1_balance_of({
            owner: principals.alice,
            subaccount: [],
        })
        const bobBalance = await acornLedger().icrc1_balance_of({
            owner: principals.bob,
            subaccount: [],
        })
        expect(aliceBalanceAfter).toBe(0n)
        expect(bobBalance).toBe(amount - ACORN_FEE)
    })

    it('should trap on insufficient ICP balance', async () => {
        const amount = amountOf(1000)

        const res = icpLedger(identities.alice).icrc1_transfer({
            ...defaultTransferArgs,
            to: {
                owner: principals.bob,
                subaccount: [],
            },
            amount,
        })
        await expect(res).resolves.toHaveProperty('Err')
    })

    it('should trap on insufficient ACORN balance', async () => {
        const amount = amountOf(1000)

        const res = acornLedger(identities.alice).icrc1_transfer({
            ...defaultTransferArgs,
            to: {
                owner: principals.bob,
                subaccount: [],
            },
            amount,
        })
        await expect(res).resolves.toHaveProperty('Err')
    })

    it('should approve ICP', async () => {
        const bobBalanceBefore = await icpLedger().icrc1_balance_of({
            owner: principals.bob,
            subaccount: [],
        })

        const bobApproval = icpLedger(identities.bob).icrc2_approve({
            spender: { owner: principals.alice, subaccount: [] },
            amount: bobBalanceBefore,
            fee: [],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
            expected_allowance: [],
            expires_at: [],
        })
        await expect(bobApproval).resolves.toHaveProperty('Ok')

        const aliceTransfer = icpLedger(identities.alice).icrc2_transfer_from({
            ...defaultTransferArgs,
            from: { owner: principals.bob, subaccount: [] },
            to: { owner: principals.charlie, subaccount: [] },
            amount: bobBalanceBefore - ICP_FEE * 2n,
            spender_subaccount: [],
        })
        await expect(aliceTransfer).resolves.toHaveProperty('Ok')

        const bobBalanceAfter = await icpLedger().icrc1_balance_of({
            owner: principals.bob,
            subaccount: [],
        })
        const charlieBalanceAfter = await icpLedger().icrc1_balance_of({
            owner: principals.charlie,
            subaccount: [],
        })

        expect(bobBalanceAfter).toBe(0n)
        expect(charlieBalanceAfter).toBe(bobBalanceBefore - ICP_FEE * 2n)
    })

    it('should approve ACORN', async () => {
        const bobBalanceBefore = await acornLedger().icrc1_balance_of({
            owner: principals.bob,
            subaccount: [],
        })

        const bobApproval = acornLedger(identities.bob).icrc2_approve({
            fee: [],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
            amount: bobBalanceBefore,
            expected_allowance: [],
            expires_at: [],
            spender: { owner: principals.alice, subaccount: [] },
        })
        await expect(bobApproval).resolves.toHaveProperty('Ok')

        const aliceTransfer = acornLedger(identities.alice).icrc2_transfer_from({
            ...defaultTransferArgs,
            from: { owner: principals.bob, subaccount: [] },
            to: { owner: principals.charlie, subaccount: [] },
            amount: bobBalanceBefore - ACORN_FEE * 2n,
            spender_subaccount: [],
        })
        await expect(aliceTransfer).resolves.toHaveProperty('Ok')

        const bobBalanceAfter = await acornLedger().icrc1_balance_of({
            owner: principals.bob,
            subaccount: [],
        })
        const charlieBalanceAfter = await acornLedger().icrc1_balance_of({
            owner: principals.charlie,
            subaccount: [],
        })

        expect(bobBalanceAfter).toBe(0n)
        expect(charlieBalanceAfter).toBe(bobBalanceBefore - ACORN_FEE * 2n)
    })
})
