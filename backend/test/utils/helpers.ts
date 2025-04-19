import { Buffer } from 'buffer'

import { Identity } from '@dfinity/agent'
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { Principal } from '@dfinity/principal'

import { ACTOR_SERVICES } from 'shared/constants'
import { createActor, createAgent } from 'shared/utils/agent'
import { amountOf } from 'shared/utils/tokens'

export const deriveCurrentIdentity = (pem?: string): Identity => {
    const pemString = (pem ?? process.env.TEST_ACCOUNT_PEM!).replace(
        /-----BEGIN EC PRIVATE KEY-----|-----END EC PRIVATE KEY-----|\s/g,
        ''
    )
    const buf = Buffer.from(pemString, 'base64') // Decode base64 string into binary buffer

    if (buf.length != 118) {
        throw 'expecting byte length 118 but got ' + buf.length
    }
    return (Secp256k1KeyIdentity as any).fromSecretKey(buf.subarray(7, 39)) as Identity
}

export const generateNewIdentity = (): Identity => {
    return (Secp256k1KeyIdentity as any).generate() as Identity
}

export const topUpIcp = async (
    recipient: Principal,
    amount: bigint = amountOf(100.0)
): Promise<boolean> => {
    const minter = createAgent(deriveCurrentIdentity())
    const IcpLedger: any = createActor(
        ACTOR_SERVICES.IcpLedger.canisterId,
        ACTOR_SERVICES.IcpLedger.idlFactory,
        {
            agent: minter,
        }
    )

    const icpBalanceBefore = await IcpLedger.icrc1_balance_of({
        owner: recipient,
        subaccount: [],
    })
    await IcpLedger.icrc1_transfer({
        to: { owner: recipient, subaccount: [] },
        amount,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
    })
    const icpBalanceAfter = await IcpLedger.icrc1_balance_of({
        owner: recipient,
        subaccount: [],
    })

    return icpBalanceAfter === icpBalanceBefore + amount
}

export const topUpAcorn = async (
    recipient: Principal,
    amount: bigint = amountOf(100.0)
): Promise<boolean> => {
    const minter = createAgent(deriveCurrentIdentity())
    const AcornLedger: any = createActor(
        ACTOR_SERVICES.AcornLedger.canisterId,
        ACTOR_SERVICES.AcornLedger.idlFactory,
        {
            agent: minter,
        }
    )

    const acornBalanceBefore = await AcornLedger.icrc1_balance_of({
        owner: recipient,
        subaccount: [],
    })
    await AcornLedger.icrc1_transfer({
        to: { owner: recipient, subaccount: [] },
        amount,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
    })
    const acornBalanceAfter = await AcornLedger.icrc1_balance_of({
        owner: recipient,
        subaccount: [],
    })

    return acornBalanceAfter === acornBalanceBefore + amount
}
