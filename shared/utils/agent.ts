'use client'

import { Buffer } from 'buffer'

import type { ActorConfig, ActorSubclass, Agent, HttpAgentOptions, Identity } from '@dfinity/agent'
import { Actor, HttpAgent } from '@dfinity/agent'
import { IDL } from '@dfinity/candid'
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { Principal } from '@dfinity/principal'
import fetch from 'isomorphic-fetch'

export const dfxPort = 64662

export declare interface CreateActorOptions {
    agent?: Agent
    agentOptions?: HttpAgentOptions
    actorOptions?: ActorConfig
}

const id = process.env.CANISTER_ID_INTERNET_IDENTITY
const network = process.env.DFX_NETWORK

export const createAgent = (identity?: Identity): Agent => {
    const a = HttpAgent.createSync({
        identity,
        fetch,
        host: network !== 'ic' ? `http://${id}.localhost:4943/` : `https://identity.ic0.app`,
    })
    if (network !== 'ic') {
        a.fetchRootKey().catch((err) => {
            console.warn(
                'Unable to fetch root key. Check to ensure that your local replica is running'
            )
            console.error(err)
        })
    }
    return a
}

export const createActor = <T>(
    canisterId: string | Principal,
    idlFactory: IDL.InterfaceFactory,
    options: CreateActorOptions = {}
): ActorSubclass<T> => {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions })

    if (options.agent && options.agentOptions) {
        console.warn(
            'Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.'
        )
    }

    return Actor.createActor(idlFactory, { agent, canisterId, ...options.actorOptions })
}

export const deriveIdentity = (pem: string): Identity => {
    const pemString = pem.replace(
        /-----BEGIN EC PRIVATE KEY-----|-----END EC PRIVATE KEY-----|\s/g,
        ''
    )
    const buf = Buffer.from(pemString, 'base64') // Decode base64 string into binary buffer

    if (buf.length != 118) {
        throw 'expecting byte length 118 but got ' + buf.length
    }
    return (Secp256k1KeyIdentity as any).fromSecretKey(buf.subarray(7, 39)) as Identity
}
