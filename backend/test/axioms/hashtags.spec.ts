import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as AXIOMS from '../../../shared/declarations/axioms/axioms.did.js'
import * as ICP from '../../../shared/declarations/icp_ledger/icp_ledger.did.js'
import { amountOf } from '../common/libs.js'
import { ACTIVITY_COSTS, axioms } from '../helpers/axioms.js'
import { facade } from '../helpers/facade.js'
import { softDeployCanisters } from '../helpers/indicator.js'
import { acornLedger, topUpAcorn } from '../helpers/ledger.js'
import { derivePrincipal } from '../utils/canister.js'
import { deriveCurrentIdentity, generateNewIdentity } from '../utils/identity.js'

jest.setTimeout(120000)

describe('Axioms: Hashtag', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    const defaultHashtagSort: AXIOMS.Sort_1 = {
        by: { alphabetical: null },
        order: { ascending: null },
    }
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

    const AXIOMS: number[][] = [
        [0, 1, 2],
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 0],
    ]

    beforeAll(async () => {
        await softDeployCanisters()

        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }

        identities.user = generateNewIdentity()
        principals.user = identities.user.getPrincipal()
        principals.treasury = derivePrincipal('treasury')

        await topUpAcorn(principals.user, ACTIVITY_COSTS.HYPOTHESIS_PUBLISH * BigInt(AXIOMS.length))
    })

    it('should setup', async () => {
        const registration = facade(identities.user).register('test', 0n, [])
        await expect(registration).resolves.toBeUndefined()

        const fieldRegistration = axioms(identities.user).joinField('Axiom governance')
        await expect(fieldRegistration).resolves.toBeUndefined()

        const fieldApproval = axioms(identities.founder).approveMember(
            'Axiom governance',
            principals.user
        )
        await expect(fieldApproval).resolves.toBeUndefined()
    })

    it('should get', async () => {
        const hashtag: AXIOMS.SharableHashtag = await axioms().getHashtag('Axiom')

        expect(hashtag).toStrictEqual({
            name: 'Axiom',
            used: 1n,
            description: 'The Axiom protocol',
        })
    })

    it('should automatically add and increase used', async () => {
        const counts: number[] = [0, 0, 0, 0, 0]

        const approval = acornLedger(identities.user).icrc2_approve({
            ...defaultApproveArgs,
            spender: { owner: principals.treasury, subaccount: [] },
            amount: ACTIVITY_COSTS.HYPOTHESIS_PUBLISH * BigInt(AXIOMS.length),
        })
        await expect(approval).resolves.toHaveProperty('Ok')
        const hypothesesPublish = await Promise.all(
            AXIOMS.map((hypothesis) =>
                axioms(identities.user).publishHypothesis(
                    'Axiom governance',
                    'Test',
                    hypothesis.map((hashtag) => `${hashtag}`)
                )
            )
        )
        for (const [i, hypothesis] of AXIOMS.entries()) {
            expect(hypothesesPublish[i]).toBeUndefined()
            hypothesis.forEach((hashtag) => counts[hashtag]++)
        }

        const hashtags: AXIOMS.SharableHashtag[] = await axioms().getHashtags(defaultHashtagSort)

        for (const hashtag of hashtags) {
            if (hashtag.name === 'Axiom') continue
            expect(hashtag.used).toBe(BigInt(counts[parseInt(hashtag.name)]))
        }
    })
})
