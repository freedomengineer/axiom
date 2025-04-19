import type { ActorSubclass, Identity } from '@dfinity/agent'

import * as D from '../../../shared/declarations/affiliate/affiliate.did.js'
import { amountOf } from '../common/libs'
import { agent, createActor } from '../utils/agent'
import { derivePrincipal } from '../utils/canister'

export const affiliate = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('affiliate')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const AFFILIATE_PROPORTION: number = 0.5
export const PROPORTIONS: number[] = [0.8, 0.16, 0.032, 0.008].map(
    (percentage) => percentage * AFFILIATE_PROPORTION
)
export const USERS: [string, string, bigint][] = [
    ['founder', 'founder', amountOf(0)],
    ['alice', 'founder', amountOf(10.0)],
    ['bob', 'alice', amountOf(20.0)],
    ['charlie', 'bob', amountOf(50.0)],
    ['dave', 'charlie', amountOf(100.0)],
]
