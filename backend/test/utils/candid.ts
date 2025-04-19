import { IDL } from '@dfinity/candid'

export const serializeToCandid = (entries: [any, IDL.Type<any>][]): Uint8Array => {
    const arrayBuffer: ArrayBuffer = IDL.encode(
        entries.map(([, type]) => type),
        entries.map(([arg]) => arg)
    )
    return new Uint8Array(arrayBuffer)
}

export const Blob = IDL.Vec(IDL.Nat8)
export const MetadataValue = IDL.Variant({
    Nat: IDL.Nat,
    Int: IDL.Int,
    Text: IDL.Text,
    Blob: Blob,
})
export const Account = IDL.Record({ owner: IDL.Principal, subaccount: IDL.Opt(Blob) })
export const FeatureFlags = IDL.Record({ icrc2: IDL.Bool })

export const LedgerInitArgs = IDL.Variant({
    Init: IDL.Record({
        minting_account: Account,
        fee_collector_account: IDL.Opt(Account),
        transfer_fee: IDL.Nat,
        decimals: IDL.Opt(IDL.Nat8),
        max_memo_length: IDL.Opt(IDL.Nat16),
        token_symbol: IDL.Text,
        token_name: IDL.Text,
        metadata: IDL.Vec(IDL.Record({ _0_: IDL.Text, _1_: MetadataValue })),
        initial_balances: IDL.Vec(IDL.Record({ _0_: Account, _1_: IDL.Nat })),
        feature_flags: IDL.Opt(FeatureFlags),
        maximum_number_of_accounts: IDL.Opt(IDL.Nat64),
        accounts_overflow_trim_quantity: IDL.Opt(IDL.Nat64),
        archive_options: IDL.Record({
            num_blocks_to_archive: IDL.Nat64,
            max_transactions_per_response: IDL.Opt(IDL.Nat64),
            trigger_threshold: IDL.Nat64,
            max_message_size_bytes: IDL.Opt(IDL.Nat64),
            cycles_for_archive_creation: IDL.Opt(IDL.Nat64),
            node_max_memory_size_bytes: IDL.Opt(IDL.Nat64),
            controller_id: IDL.Principal,
            more_controller_ids: IDL.Opt(IDL.Vec(IDL.Principal)),
        }),
    }),
})

export const FrontendInitArgs = IDL.Variant({
    Init: IDL.Record({}),
})
