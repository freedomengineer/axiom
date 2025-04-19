import { ActorSubclass, Identity } from '@dfinity/agent'

import * as D from '../../../shared/declarations/dao/dao.did.js'
import { Proportion, amountOf } from '../common/libs'
import { agent, createActor } from '../utils/agent'
import { derivePrincipal } from '../utils/canister'

export const dao = (identity?: Identity): ActorSubclass<D._SERVICE> => {
    const principal = derivePrincipal('dao')

    return createActor<D._SERVICE>(principal, D.idlFactory, {
        agent: agent(identity),
    })
}

export const USERS: [string, bigint][] = [
    ['alice', amountOf(20_000)],
    ['bob', amountOf(20_000)],
    ['charlie', amountOf(20_000)],
    ['dave', amountOf(20_000)],
    ['eve', amountOf(20_000)],
    ['frank', amountOf(20_000)],
    ['grace', amountOf(20_000)],
]

export const CONFIGS = {
    CUSTODIAN_ELECTION_TALLY_INTERVAL: 21n,
    NOMINEE_BALLOTS_AVAILABILITY_DURATION: 200n,
    MAX_BALLOTS: 5n,
    MAX_CUSTODIANS: 5n,

    PROPOSAL_VOTE_AVAILABILITY_DURATION: 7n,
    PROPOSAL_DRAFT_AVAILABILITY_DURATION: 2n,
    PROPOSAL_DRAFT_CANCELLATION_REFUND: [1n, 5n],
    PROPOSAL_RETRY_FEE_DEDUCTION: [4n, 5n],
    PROPOSAL_RETRY_REWARD_DEDUCTION: [0n, 1n],
    MAX_PROPOSAL_RETRIES: 3n,

    CODE_PROPOSAL_FEE: amountOf(1_000),
    CODE_APPROVAL_THRESHOLD: [4n, 5n],
    CODE_APPROVAL_REFUND: [0n, 1n],
    CODE_REJECTION_REFUND: [0n, 1n],

    WORKER_PROPOSAL_FEE: amountOf(100),
    WORKER_APPROVAL_THRESHOLD: [3n, 5n],
    WORKER_APPROVAL_REFUND: [0n, 1n],
    WORKER_REJECTION_REFUND: [0n, 1n],

    CONFIGURATION_PROPOSAL_FEE: amountOf(100),
    CONFIGURATION_APPROVAL_THRESHOLD: [4n, 5n],
    CONFIGURATION_APPROVAL_REFUND: [0n, 1n],
    CONFIGURATION_REJECTION_REFUND: [0n, 1n],

    REFERENDUM_LAUNCH_FEE: amountOf(10_000),
    REFERENDUM_APPROVAL_THRESHOLD: [4n, 5n],
    REFERENDUM_APPROVAL_REFUND: [0n, 1n],
    REFERENDUM_REJECTION_REFUND: [0n, 1n],
}
