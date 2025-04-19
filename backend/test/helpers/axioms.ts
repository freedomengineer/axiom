import type { ActorSubclass, Identity } from '@dfinity/agent'

import * as D from '../../../shared/declarations/axioms/axioms.did.js'
import * as ESCROW from '../../../shared/declarations/escrow/escrow.did.js'
import { amountOf } from '../common/libs'
import { agent, createActor } from '../utils/agent'
import { derivePrincipal } from '../utils/canister'

export const axioms = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('axioms')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const ACTIVITY_COSTS = {
    FIELD_CREATION: amountOf(1000.0),
    HYPOTHESIS_PUBLISH: amountOf(20.0),
    EVIDENCE_NOTE_PUBLISH: amountOf(1.0),
    EVIDENCE_CODE_PUBLISH: amountOf(1.0),
    EVIDENCE_MATH_PUBLISH: amountOf(1.0),
    EVIDENCE_PIC_PUBLISH: amountOf(10.0),
    EVIDENCE_LINK_PUBLISH: amountOf(10.0),
}

export const USERS: [string, bigint][] = [
    ['alice', amountOf(0.0)],
    ['bob', amountOf(5.0)],
    ['charlie', amountOf(7.5)],
    ['dave', amountOf(5.25)],
    ['eve', amountOf(0.0)],
    ['frank', amountOf(6.25)],
    ['grace', amountOf(0.5)],
]

// 50% chance of getting 0
// 50% chance of getting a random number between 0 to 10.0
export const randomAmount = (): bigint => amountOf(Math.random() < 0.5 ? 0 : Math.random() * 10)

export type Choice = 0 | 1 | 2
export type Coefficient = 1 | 2 | 4 | 8
export type DChoice = D.Choice
export type DCoefficient = ESCROW.Option

export const randomChoice = (except?: Choice | DChoice): Choice => {
    if (except === undefined) return Math.floor(Math.random() * 3) as Choice

    const condition = (c: Choice | DChoice): boolean => {
        if (c === except) return true
        if (typeof c === 'number') parseChoice(c as Choice) === except
        if (typeof c === 'object') parseDChoice(c as DChoice) === except
        return false
    }

    let choice: Choice
    do {
        choice = Math.floor(Math.random() * 3) as Choice
    } while (condition(choice))

    return choice
}

export const randomCoefficient = (except?: Coefficient | DCoefficient): Coefficient => {
    if (except === undefined) return [1, 2, 4, 8][Math.floor(Math.random() * 4)] as Coefficient

    const condition = (c: Coefficient | DCoefficient): boolean => {
        if (c === except) return true
        if (typeof c === 'number') parseCoefficient(c as Coefficient) === except
        if (typeof c === 'object') parseDCoefficient(c as DCoefficient) === except
        return false
    }

    let coefficient: Coefficient
    do {
        coefficient = [1, 2, 4, 8][Math.floor(Math.random() * 4)] as Coefficient
    } while (condition(coefficient))

    return coefficient
}

export const parseChoice = (c: Choice): DChoice => {
    if (c === 0) return { Positive: null }
    if (c === 1) return { Neutral: null }
    if (c === 2) return { Negative: null }
    return false as never
}

export const parseDChoice = (c: DChoice): Choice => {
    if ('positive' in c) return 0
    if ('neutral' in c) return 1
    if ('negative' in c) return 2
    return false as never
}

export const parseCoefficient = (c: Coefficient): DCoefficient => {
    if (c === 1) return { Single: null }
    if (c === 2) return { Double: null }
    if (c === 4) return { Quadruple: null }
    if (c === 8) return { Octuple: null }
    return false as never
}

export const parseDCoefficient = (c: DCoefficient): Coefficient => {
    if ('single' in c) return 1
    if ('double' in c) return 2
    if ('quadruple' in c) return 4
    if ('octuple' in c) return 8
    return false as never
}
