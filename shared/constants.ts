import * as _DACORN from 'shared/declarations/acorn_ledger/acorn_ledger.did.js'
import * as _DAffiliate from 'shared/declarations/affiliate/affiliate.did.js'
import * as _DAxioms from 'shared/declarations/axioms/axioms.did.js'
import * as _DDAO from 'shared/declarations/dao/dao.did.js'
import * as _DEscrow from 'shared/declarations/escrow/escrow.did.js'
import * as _DFacade from 'shared/declarations/facade/facade.did.js'
import * as _DICP from 'shared/declarations/icp_ledger/icp_ledger.did.js'
import * as _DICPUSD from 'shared/declarations/icpusd/icpusd.did.js'
import * as _DIndicator from 'shared/declarations/indicator/indicator.did.js'
import * as _DSales from 'shared/declarations/sales/sales.did.js'
import * as _DSplit from 'shared/declarations/split/split.did.js'
import * as _DTreasury from 'shared/declarations/treasury/treasury.did.js'

export const DEPLOYABLE_ACTOR_NAMES_BY_CANISTER = {
    indicator: 'Indicator',
    dao: 'DAO',
    axioms: 'Axioms',
    facade: 'Facade',
    escrow: 'Escrow',
    affiliate: 'Affiliate',
    sales: 'Sales',
    treasury: 'Treasury',
    split: 'Split',
    acorn_ledger: 'ACORN',
    icpusd: 'ICPUSD',
    chat: 'Chat',
    assets: 'Assets',
    frontend: 'Frontend',
} as const
export const ACTOR_NAMES_BY_CANISTER = {
    ...DEPLOYABLE_ACTOR_NAMES_BY_CANISTER,
    xrc: 'XRC',
    icp_ledger: 'ICP',
    internet_identity: 'Identity',
} as const
export const DEPLOYABLE_ACTORS = [
    'Indicator',
    'DAO',
    'Axioms',
    'Facade',
    'Escrow',
    'Sales',
    'Split',
    'Treasury',
    'Affiliate',
    'ACORN',
    'ICPUSD',
    'Chat',
    'Assets',
    'Frontend',
]

export const DECIMALS = BigInt(1e8)
export const N_DECIMALS = 8

export const ICP_FEE = BigInt(10_000)
export const ACORN_FEE = BigInt(0)

export const MAX_CHUNK_SIZE = 1024 * 1024 * 2
export const MAX_NAT8 = 255

export const NANO_TO_MILLI = 1_000_000n
export const NANOS_IN_A_DAY = 86_400_000_000_000n
export const MILLIS_IN_A_DAY = 86_400_000n
export const MILLIS_IN_A_HOUR = 3_600_000n
export const MILLIS_IN_A_MINUTE = 60_000n
export const NANOS_IN_A_MINUTE = 60_000_000_000n

export const ACTOR_SERVICES = {
    ACORN: {
        idlFactory: _DACORN.idlFactory,
        canisterId: process.env.CANISTER_ID_ACORN_LEDGER!,
    },
    Affiliate: {
        idlFactory: _DAffiliate.idlFactory,
        canisterId: (process.env.CANISTER_ID_AFFILIATE ?? process.env.CANISTER_ID_AFFILIATE_PROD)!,
    },
    Axioms: {
        idlFactory: _DAxioms.idlFactory,
        canisterId: (process.env.CANISTER_ID_AXIOMS ?? process.env.CANISTER_ID_AXIOMS_PROD)!,
    },
    DAO: {
        idlFactory: _DDAO.idlFactory,
        canisterId: (process.env.CANISTER_ID_DAO ?? process.env.CANISTER_ID_DAO_PROD)!,
    },
    Escrow: {
        idlFactory: _DEscrow.idlFactory,
        canisterId: (process.env.CANISTER_ID_ESCROW ?? process.env.CANISTER_ID_ESCROW_PROD)!,
    },
    Facade: {
        idlFactory: _DFacade.idlFactory,
        canisterId: (process.env.CANISTER_ID_FACADE ?? process.env.CANISTER_ID_FACADE_PROD)!,
    },
    ICP: {
        idlFactory: _DICP.idlFactory,
        canisterId: process.env.CANISTER_ID_ICP_LEDGER,
    },
    ICPUSD: {
        idlFactory: _DICPUSD.idlFactory,
        canisterId: (process.env.CANISTER_ID_ICPUSD ?? process.env.CANISTER_ID_ICPUSD_PROD)!,
    },
    Indicator: {
        idlFactory: _DIndicator.idlFactory,
        canisterId: (process.env.CANISTER_ID_INDICATOR ?? process.env.CANISTER_ID_INDICATOR_PROD)!,
    },
    Sales: {
        idlFactory: _DSales.idlFactory,
        canisterId: (process.env.CANISTER_ID_SALES ?? process.env.CANISTER_ID_SALES_PROD)!,
    },
    Split: {
        idlFactory: _DSplit.idlFactory,
        canisterId: (process.env.CANISTER_ID_SPLIT ?? process.env.CANISTER_ID_SPLIT_PROD)!,
    },
    Treasury: {
        idlFactory: _DTreasury.idlFactory,
        canisterId: (process.env.CANISTER_ID_TREASURY ?? process.env.CANISTER_ID_TREASURY_PROD)!,
    },
} as const
