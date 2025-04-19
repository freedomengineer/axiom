import type { ActorSubclass, Identity } from '@dfinity/agent'

import * as D from '../../../shared/declarations/sales/sales.did.js'
import { amountOf } from '../common/libs'
import { agent, createActor } from '../utils/agent'
import { derivePrincipal } from '../utils/canister'

export const sales = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('sales')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const PACKAGES: [bigint, string, string, string][] = [
    [amountOf(0.0), 'Alpha Test Scrat', 'ALPHA', 'logo'],
    [amountOf(0.5), 'The Hobo', 'THOBO', 'logo'],
    [amountOf(1.0), 'Seeker Squirrel', 'SESQR', 'logo'],
    [amountOf(1.5), 'Chubby Chipmonk', 'CCHIP', 'logo'],
    [amountOf(2.0), 'Cozy Den Bro', 'CDBRO', 'logo'],
    [amountOf(2.5), 'Kung Fo Fighter Monk', 'KFFMK', 'logo'],
    [amountOf(3.0), 'Samurai Squirrel', 'SASQR', 'logo'],
    [amountOf(3.5), 'Robo Chipmonk', 'RCHIP', 'logo'],
    [amountOf(4.0), 'Abundant Acorns', 'ABCRN', 'logo'],
    [amountOf(4.5), 'Skyship Squirrel', 'SKQRL', 'logo'],
    [amountOf(5.0), 'Monk on the Moon', 'MOTMN', 'logo'],
]

export const USERS: [string, bigint][] = [
    ['alice', amountOf(2.0)],
    ['bob', amountOf(3.0)],
]
