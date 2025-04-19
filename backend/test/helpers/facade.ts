import type { ActorSubclass, Identity } from '@dfinity/agent'

import * as D from '../../../shared/declarations/facade/facade.did.js'
import { amountOf } from '../common/libs'
import { agent, createActor } from '../utils/agent'
import { derivePrincipal } from '../utils/canister'

export const facade = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('facade')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const USERS: [string, bigint][] = [
    ['alice', amountOf(20)],
    ['bob', amountOf(100)],
    ['charlie', amountOf(50)],
]
