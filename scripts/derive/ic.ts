import { execSync } from 'child_process'

import { Actor } from '@dfinity/agent'

import { idlFactory } from 'shared/declarations/indicator/indicator.did.js'
import { DIndicator } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

import { IndicatorActorsPrincipal, createAgent, writeEnvs } from '../utils'

/// Deriving all principals
;(async () => {
    const canisterId = execSync(`dfx canister id indicator_prod --network=ic`).toString().trim()
    const agent = createAgent('ic')

    const Indicator = Actor.createActor<DIndicator._SERVICE>(idlFactory, { canisterId, agent })
    const actorsPrincipal = (await Indicator.getPrincipals().then((principals) =>
        Object.fromEntries(principals.map(([a, p]) => [UnwrapVariant(a), p]))
    )) as IndicatorActorsPrincipal

    writeEnvs('ic', 'prod', actorsPrincipal)
})()
