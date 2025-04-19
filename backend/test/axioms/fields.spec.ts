import { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as ACORN from '../../../shared/declarations/acorn_ledger/acorn_ledger.did.js'
import * as AXIOMS from '../../../shared/declarations/axioms/axioms.did.js'
import * as E from '../common/errors.js'
import { amountOf, gatherPromises } from '../common/libs.js'
import { ACTIVITY_COSTS, axioms } from '../helpers/axioms.js'
import { facade } from '../helpers/facade.js'
import { softDeployCanisters } from '../helpers/indicator.js'
import { acornLedger, topUpAcorn, topUpIcp } from '../helpers/ledger.js'
import { derivePrincipal } from '../utils/canister.js'
import { deriveCurrentIdentity, generateNewIdentity } from '../utils/identity.js'

jest.setTimeout(120000)

describe('Axioms: Fields', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    const defaultFieldFilter: AXIOMS.Filter__2 = {
        joinedBy: [],
        containsPattern: [],
    }
    const defaultFieldSort: AXIOMS.Sort_2 = {
        by: { alphabetical: null },
        order: { ascending: null },
    }
    const USERS: number[] = [0, 1]

    beforeAll(async () => {
        // await softDeployCanisters()

        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }
        for (const user of USERS) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
        }

        principals.treasury = derivePrincipal('treasury')
    })

    it('should register', async () => {
        for (const user of USERS) {
            const registration = await facade(identities[user]).register(`${user + 10}`, 0n, [])
            expect(registration).toBeUndefined()
        }
    })

    it('should get roles', async () => {
        const nullRole: AXIOMS.SharableField = await axioms().getField('Chemistry')
        expect(nullRole.callerRole).toStrictEqual([])

        const guestRole: AXIOMS.SharableField = await axioms(identities[0]).getField('Chemistry')
        expect(guestRole.callerRole).toStrictEqual([{ Guest: null }])

        await axioms(identities[0]).joinField('Chemistry')

        const memberRole: AXIOMS.SharableField = await axioms(identities[0]).getField('Chemistry')
        expect(memberRole.callerRole).toStrictEqual([{ Member: null }])
    })
})
