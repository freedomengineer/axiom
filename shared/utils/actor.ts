'use client'

import { ActorSubclass, Agent } from '@dfinity/agent'
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl'
import { Principal } from '@dfinity/principal'

import { error } from '@libs/toastify'
import * as DDIP721 from 'shared/declarations/dip721/dip721.did.js'
import { createActor, createAgent } from 'shared/utils/agent'

interface IActor<T> {
    principal: Principal
    id: string
    idlFactory: InterfaceFactory
    call(): ActorSubclass<T>
}

const withRetry = async <T>(
    promiseFn: () => Promise<T>,
    showToast: boolean = false,
    maxRetries: number = 8,
    delay: number = 250
): Promise<T> => {
    let lastError: any

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await promiseFn()
        } catch (e: any) {
            lastError = e

            if (e?.message.includes('Signature verification failed')) {
                console.warn(
                    `Attempt ${attempt + 1}/${maxRetries} failed with certificate error, retrying...`
                )

                if (attempt < maxRetries - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delay * (1 + Math.random())))
                }
            } else {
                if (showToast) error(e)
                throw e
            }
        }
    }
    if (showToast) error(lastError)
    throw lastError
}

export default class Actor<T> implements IActor<T> {
    public readonly id: string
    public readonly principal: Principal
    public readonly idlFactory: InterfaceFactory

    call(agent?: Agent | null, showToast: boolean = false): ActorSubclass<T> {
        const actor = createActor<T>(this.principal, this.idlFactory, {
            agent: agent ?? createAgent(undefined),
        })
        return new Proxy(actor, {
            get: (target, prop, receiver) => {
                const originalMethod = Reflect.get(target, prop, receiver)

                if (typeof originalMethod === 'function') {
                    return async (...args: any[]) =>
                        withRetry(() => originalMethod.apply(target, args), showToast)
                }

                return originalMethod
            },
        })
    }

    constructor(id: string, idlFactory: InterfaceFactory) {
        this.principal = Principal.fromText(id)
        this.id = id
        this.idlFactory = idlFactory
    }
}
export class DIP721Actor extends Actor<DDIP721._SERVICE> {
    constructor(id: string) {
        super(id, DDIP721.idlFactory)
    }
}
