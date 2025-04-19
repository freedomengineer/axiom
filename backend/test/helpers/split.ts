import type { ActorSubclass, Identity } from '@dfinity/agent'

import * as D from '../../../shared/declarations/split/split.did.js'
import { amountOf } from '../common/libs'
import { agent, createActor } from '../utils/agent'
import { derivePrincipal } from '../utils/canister'

export const split = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('split')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const USERS: [string, bigint][] = [
    ['alice', amountOf(2.0)],
    ['bob', amountOf(3.0)],
    ['charlie', amountOf(2.5)],
]
export const SHAREHOLDERS: [string, number][] = [
    ['affiliate', 0.5],
    ['dao', 0.4],
    ['founder', 0.1],
]
