import { ActorSubclass, Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import * as ACORN from '../../../shared/declarations/acorn_ledger/acorn_ledger.did.js'
import * as ICP from '../../../shared/declarations/icp_ledger/icp_ledger.did.js'
import { amountOf } from '../common/libs'
import { agent, createActor } from '../utils/agent'
import { derivePrincipal } from '../utils/canister'
import { deriveCurrentIdentity } from '../utils/identity'

export const icpLedger = (identity?: Identity): ActorSubclass<ICP._SERVICE> => {
    return createActor<ICP._SERVICE>(derivePrincipal('icp_ledger'), ICP.idlFactory, {
        agent: agent(identity),
    })
}

export const acornLedger = (identity?: Identity): ActorSubclass<ACORN._SERVICE> => {
    return createActor<ACORN._SERVICE>(derivePrincipal('acorn_ledger'), ACORN.idlFactory, {
        agent: agent(identity),
    })
}

export const topUpIcp = async (
    recipient: Principal,
    amount: bigint = amountOf(100.0)
): Promise<boolean> => {
    const icpBalanceBefore = await icpLedger().icrc1_balance_of({
        owner: recipient,
        subaccount: [],
    })
    const minter = deriveCurrentIdentity()
    await icpLedger(minter).icrc1_transfer({
        to: { owner: recipient, subaccount: [] },
        amount,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
    })
    const icpBalanceAfter = await icpLedger().icrc1_balance_of({
        owner: recipient,
        subaccount: [],
    })
    return icpBalanceAfter === icpBalanceBefore + amount
}
export const topUpAcorn = async (
    recipient: Principal,
    amount: bigint = amountOf(100.0)
): Promise<boolean> => {
    const acornBalanceBefore = await acornLedger().icrc1_balance_of({
        owner: recipient,
        subaccount: [],
    })
    const minter = deriveCurrentIdentity()
    await acornLedger(minter).icrc1_transfer({
        to: { owner: recipient, subaccount: [] },
        amount,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
    })
    const acornBalanceAfter = await acornLedger().icrc1_balance_of({
        owner: recipient,
        subaccount: [],
    })
    return acornBalanceAfter === acornBalanceBefore + amount
}
