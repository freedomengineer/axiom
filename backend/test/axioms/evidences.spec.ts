import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { amountOf, gatherPromises } from '../common/libs'
import { axioms } from '../helpers/axioms'
import { deriveCurrentIdentity, generateNewIdentity } from '../utils/identity'

jest.setTimeout(120000)

describe('Axioms: Evidences', () => {
    let identities: Record<string, Identity>
    let principals: Record<string, Principal>

    const USERS: bigint[] = [
        amountOf(0.0),
        amountOf(5.0),
        amountOf(7.5),
        amountOf(5.25),
        amountOf(0.0),
        amountOf(6.25),
        amountOf(0.5),
    ]

    beforeAll(async () => {
        identities = { founder: deriveCurrentIdentity() }
        principals = { founder: identities.founder.getPrincipal() }

        for (const user of USERS.keys()) {
            identities[user] = generateNewIdentity()
            principals[user] = identities[user].getPrincipal()
        }
    })

    it('should register', async () => {
        const registrations = await gatherPromises({
            ...USERS.map((_, i) => axioms(identities.founder).register(principals[i])),
        })
        for (const registration of Object.values(registrations)) {
            expect(registration).toBeUndefined()
        }
    })
})
