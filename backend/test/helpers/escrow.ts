import type { ActorSubclass, Identity } from '@dfinity/agent'

import * as D from '../../../shared/declarations/escrow/escrow.did.js'
import { amountOf } from '../common/libs.js'
import { agent, createActor } from '../utils/agent.js'
import { derivePrincipal } from '../utils/canister.js'

export const escrow = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('escrow')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const USERS: [number, bigint][] = [
    [0, amountOf(2.0)],
    [1, amountOf(3.0)],
]
