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

    execSync(`./scripts/bash/deploy_icp.sh`, { stdio: 'ignore' })
    execSync(`dfx deploy internet_identity --mode=reinstall --yes`, { stdio: 'ignore' })
    execSync(`dfx deploy xrc --mode=reinstall --yes`, { stdio: 'ignore' })
    execSync(
        `dfx deploy indicator_prod --mode=reinstall --yes --with-cycles 1_000_000_000_000 && dfx ledger fabricate-cycles --canister indicator_prod --cycles 15_000_000_000_000`
    )

    const canisterId = execSync(`dfx canister id indicator_prod`).toString().trim()
    const agent: Agent = createAgent('local', identity)
    await agent.fetchRootKey()

    const Indicator = Actor.createActor<DIndicator._SERVICE>(idlFactory, { canisterId, agent })
    const actorsPrincipal = await initializeIndicator(Indicator)

    writeEnvs('local', 'prod', actorsPrincipal)
    topUpCycles('local', actorsPrincipal)

    const installations: Installation[] = setupInstallations('local', 'prod', actorsPrincipal)
    await uploadInstallations(Indicator, installations)

    console.info(`Deploying frontend...`)
    execSync(
        `dfx deploy frontend --mode=reinstall --specified-id=${actorsPrincipal.Frontend.toText()} --yes`
    )
})()
