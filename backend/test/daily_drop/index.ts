import type { ActorSubclass, Identity } from '@dfinity/agent'

import * as D from '../../../shared/declarations/hypotheses_mock/hypotheses_mock.did.js'
import { agent, createActor } from '../utils/agent'
import { derivePrincipal } from '../utils/canister'

export const hypotheses = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('hypotheses_mock')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const AGES: [number, number, number] = [1, 5, 20]
export const RANKS: [number, number, number] = [3, 6, 30]
export const USERS: number = 10
export const VOTES: [string, string] = ['regular', 'powered']
export const DAYS: number = 3
export const DISTRIBUTION = {
    publisher: 20 / 100,
    evidences: 50 / 100,
    regularVoters: 15 / 100,
    poweredVoters: 15 / 100,
}

export type Vote = { voter: number; value: number }
export type Id = { id: number }
export type Scores = {
    regularScore: number
    poweredScore: number
}
export type Ranks = {
    regularRank: number
    poweredRank: number
}
export type FullRanks = Ranks & {
    averageRank: number
}

export type Hypothesis = Id & {
    publisher: number
    publishDate: number
    votes: Vote[]
    evidences: number[]
} & Scores

export type Rank = {
    score: number
    rank: number
}
export type HypothesisScores = Id & Scores
export type HypothesisRank = Id & Rank
export type HypothesisRanks = Id & Ranks
export type HypothesisFullRanks = Id & FullRanks

export type Scenario = {
    publishes: number[]
    hypotheses: { votes: number[]; evidences: number }[]
}
