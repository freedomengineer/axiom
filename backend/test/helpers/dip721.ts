import type { ActorSubclass, Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as D from '../../../shared/declarations/dip721/dip721.did.js'
import { agent, createActor } from '../utils/agent'

export const dip721 = (
    canisterPrincipal: Principal,
    identity?: Identity
): ActorSubclass<D._SERVICE> => {
    return createActor<D._SERVICE>(canisterPrincipal, D.idlFactory, {
        agent: agent(identity),
    })
}
