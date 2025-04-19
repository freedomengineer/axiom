import { execSync } from 'child_process'

import { Actor, Agent, Identity } from '@dfinity/agent'

import { idlFactory } from 'shared/declarations/indicator/indicator.did.js'
import { DIndicator } from 'shared/types/services'

import { deriveCurrentIdentity } from '../../backend/test/utils/helpers'
import {
    Installation,
    createAgent,
    initializeIndicator,
    setupInstallations,
    topUpCycles,
    uploadInstallations,
    writeEnvs,
} from '../utils'

/// Deploying actors
;(async () => {
    const pem = execSync(`dfx identity export founder`).toString()
    const identity: Identity = deriveCurrentIdentity(pem)

    console.info(`Deploying actors with founder principal: ${identity.getPrincipal().toText()}`)

    execSync(
        `dfx deploy indicator_prod --ic --mode=install --yes --with-cycles 1_500_000_000_000 && dfx cycles top-up indicator_prod 15_000_000_000_000 --ic`
    )

    const canisterId = execSync(`dfx canister id indicator_prod --ic`).toString().trim()
    const agent: Agent = createAgent('ic', identity)

    const Indicator = Actor.createActor<DIndicator._SERVICE>(idlFactory, { canisterId, agent })
    const actorsPrincipal = await initializeIndicator(Indicator)

    writeEnvs('ic', 'prod', actorsPrincipal)
    topUpCycles('ic', actorsPrincipal)

    const installations: Installation[] = setupInstallations('ic', 'prod', actorsPrincipal)
    await uploadInstallations(Indicator, installations)

    console.info(`Deploying frontend...`)
    execSync(
        `dfx deploy frontend --mode=reinstall --ic --specified-id=${actorsPrincipal.Frontend.toText()} --yes --with-cycles 1_500_000_000_000`
    )
})()
