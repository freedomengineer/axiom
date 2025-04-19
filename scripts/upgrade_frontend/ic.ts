import { execSync } from 'child_process'

import { Actor } from '@dfinity/agent'

import { idlFactory } from 'shared/declarations/indicator/indicator.did.js'
import { DIndicator } from 'shared/types/services'
import { Variant } from 'shared/utils/typings'

import { createAgent } from '../utils'

/// Upgrading frontend
;(async () => {
    const canisterId = execSync(`dfx canister id indicator_prod --network=ic`).toString().trim()
    const agent = createAgent('ic')

    const Indicator = Actor.createActor<DIndicator._SERVICE>(idlFactory, { canisterId, agent })
    const frontendPrincipal = await Indicator.getPrincipal(Variant('Frontend'))

    execSync(
        `dfx deploy frontend --mode=upgrade --network=ic --specified-id=${frontendPrincipal.toText()}`
    )
})()
