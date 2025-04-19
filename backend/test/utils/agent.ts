import type { ActorConfig, ActorSubclass, Agent, HttpAgentOptions, Identity } from '@dfinity/agent'
import { Actor, HttpAgent } from '@dfinity/agent'
import { IDL } from '@dfinity/candid'
import { Principal } from '@dfinity/principal'
import fetch from 'isomorphic-fetch'

import { DFX_PORT } from './canister'

export declare interface CreateActorOptions {
    agent?: Agent
    agentOptions?: HttpAgentOptions
    actorOptions?: ActorConfig
}

export const agent = (identity?: Identity): Agent => {
    const a = new HttpAgent({ identity, host: `http://127.0.0.1:${DFX_PORT}`, fetch })

    // Fetch root key for certificate validation during development
    if (process.env.DFX_NETWORK !== 'ic') {
        a.fetchRootKey().catch((err: any) => {
            console.warn(
                'Unable to fetch root key. Check to ensure that your local replica is running'
            )
            console.error(err)
        })
    }

    return a
}

export function createActor<T>(
    canisterId: string | Principal,
    idlFactory: IDL.InterfaceFactory,
    options: CreateActorOptions = {}
): ActorSubclass<T> {
    const agent = options.agent || new HttpAgent({ ...options.agentOptions })

    if (options.agent && options.agentOptions) {
        console.warn(
            'Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.'
        )
    }

    // Creates an actor with using the candid interface and the HttpAgent
    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
        ...options.actorOptions,
    })
}
