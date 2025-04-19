import type { ActorSubclass, Identity } from '@dfinity/agent'

import { affiliate } from './affiliate'
import { axioms } from './axioms'
import { dao } from './dao'
import { escrow } from './escrow'
import { facade } from './facade'
import { split } from './split'
import * as D from '../../../shared/declarations/indicator/indicator.did.js'
import { ONE_DAY, ONE_SECOND } from '../common/constants'
import {
    INTERNAL_ACTOR_NAMES_BY_CANISTER,
    InternalActorName,
    InternalCanisterName,
    SOFT_DEPLOYABLE_CANISTERS,
    SoftDeployableCanister,
} from '../common/declarations'
import { gatherPromises } from '../common/libs'
import { agent, createActor } from '../utils/agent'
import {
    Commitment,
    derivePrincipal,
    externalCanisterExists,
    hardDeployCanister,
    setupWasmCommitments,
} from '../utils/canister'
import { deriveCurrentIdentity } from '../utils/identity'

export const indicator = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('indicator')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const actorNameToActorVariant = (actorName: InternalActorName): D.ActorVariant => {
    return { [actorName]: null } as D.ActorVariant
}
export const canisterNameToActorVariant = (canisterName: InternalCanisterName): D.ActorVariant => {
    return actorNameToActorVariant(INTERNAL_ACTOR_NAMES_BY_CANISTER[canisterName])
}
export const actorNameToCanisterName = (actorName: InternalActorName): InternalCanisterName => {
    return Object.entries(INTERNAL_ACTOR_NAMES_BY_CANISTER).find(
        ([, actor]) => actor === actorName
    )![0] as InternalCanisterName
}
export const actorVariantToCanisterName = (actorVariant: D.ActorVariant): InternalCanisterName => {
    return Object.entries(INTERNAL_ACTOR_NAMES_BY_CANISTER).find(
        ([, actor]) => actorVariant[actor] === null
    )![0] as InternalCanisterName
}

export const shiftToMidnight = async (days: number | bigint) => {
    const bigintDays = BigInt(days)
    await Promise.all([
        affiliate().shiftToMidnight(bigintDays),
        axioms().shiftToMidnight(bigintDays),
        dao().shiftToMidnight(bigintDays),
        escrow().shiftToMidnight(bigintDays),
        facade().shiftToMidnight(bigintDays),
        split().shiftToMidnight(bigintDays),
    ])
}
export const softDeployCanisters = async (
    canisters: SoftDeployableCanister[] = SOFT_DEPLOYABLE_CANISTERS
) => {
    type Installation = { actorVariant: D.ActorVariant; commitment: Commitment }

    const currentIdentity: Identity = deriveCurrentIdentity()

    hardDeployCanister('indicator')
    if (canisters.includes('icpusd') && !externalCanisterExists('xrc')) {
        hardDeployCanister('xrc')
    }
    if (canisters.includes('split') && !externalCanisterExists('icp_ledger')) {
        hardDeployCanister('icp_ledger')
    }

    await indicator(currentIdentity).initialize()

    const wasms: Record<InternalCanisterName, Commitment> = setupWasmCommitments(canisters)
    const installations: Installation[] = Object.entries(wasms).map(
        ([canisterName, commitment]) => ({
            actorVariant: canisterNameToActorVariant(canisterName as InternalCanisterName),
            commitment,
        })
    )
    const commitments: D.SharableCommitments = installations.map(
        ({ actorVariant, commitment: { moduleHash, args } }) => ({
            actorVariant,
            moduleHash,
            args,
        })
    )

    await indicator(currentIdentity).initializeFirstSession(
        { Minor: null },
        [{ Added: ['Initial release'] }],
        commitments
    )

    const chunksUploadPromises: Promise<undefined>[][] = installations.map(
        ({ actorVariant, commitment }) =>
            commitment.chunks.map((chunk, index) =>
                indicator(currentIdentity).uploadCommitmentChunk(
                    actorVariant,
                    index,
                    chunk.blob,
                    chunk.checksum
                )
            )
    )
    await gatherPromises(chunksUploadPromises)

    const commitmentSettlePromises: Promise<void>[] = installations.map(({ actorVariant }) =>
        indicator(currentIdentity).settleCommitment(actorVariant)
    )
    await Promise.all(commitmentSettlePromises)

    await indicator(currentIdentity).installCanisters()
}
