import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as E from './common/errors'
import { amountOf, gatherPromises } from './common/libs'
import { indicator, softDeployCanisters } from './helpers/indicator'
import { icpLedger, topUpIcp } from './helpers/ledger'
import { generateInterface, hardDeployCanister } from './utils/canister'
import { deriveCurrentIdentity, generateNewIdentity } from './utils/identity'
import * as INDICATOR from '../../frontend/declarations/indicator/indicator.did.js'

jest.setTimeout(160000)

describe('Indicator', () => {
    it('should deploy', async () => {
        await softDeployCanisters()
    })
})
