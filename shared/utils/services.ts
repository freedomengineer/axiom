import * as _DACORN from 'shared/declarations/acorn_ledger/acorn_ledger.did.js'
import * as _DAffiliate from 'shared/declarations/affiliate/affiliate.did.js'
import * as _DAssets from 'shared/declarations/assets/assets.did.js'
import * as _DAxioms from 'shared/declarations/axioms/axioms.did.js'
import * as _DChat from 'shared/declarations/chat/chat.did.js'
import * as _DDAO from 'shared/declarations/dao/dao.did.js'
import * as _DEncyclopedia from 'shared/declarations/encyclopedia/encyclopedia.did.js'
import * as _DEscrow from 'shared/declarations/escrow/escrow.did.js'
import * as _DFacade from 'shared/declarations/facade/facade.did.js'
import * as _DICP from 'shared/declarations/icp_ledger/icp_ledger.did.js'
import * as _DICPUSD from 'shared/declarations/icpusd/icpusd.did.js'
import * as _DIndicator from 'shared/declarations/indicator/indicator.did.js'
import * as _DSales from 'shared/declarations/sales/sales.did.js'
import * as _DSplit from 'shared/declarations/split/split.did.js'
import * as _DTreasury from 'shared/declarations/treasury/treasury.did.js'
import Actor from 'shared/utils/actor'

export const Indicator = new Actor<_DIndicator._SERVICE>(
    (process.env.CANISTER_ID_INDICATOR ?? process.env.CANISTER_ID_INDICATOR_PROD)!,
    _DIndicator.idlFactory
)
export const DAO = new Actor<_DDAO._SERVICE>(
    (process.env.CANISTER_ID_DAO ?? process.env.CANISTER_ID_DAO_PROD)!,
    _DDAO.idlFactory
)
export const Axioms = new Actor<_DAxioms._SERVICE>(
    (process.env.CANISTER_ID_AXIOMS ?? process.env.CANISTER_ID_AXIOMS_PROD)!,
    _DAxioms.idlFactory
)
export const Encyclopedia = new Actor<_DEncyclopedia._SERVICE>(
    (process.env.CANISTER_ID_ENCYCLOPEDIA ?? process.env.CANISTER_ID_ENCYCLOPEDIA_PROD)!,
    _DEncyclopedia.idlFactory
)
export const Chat = new Actor<_DChat._SERVICE>(
    (process.env.CANISTER_ID_CHAT ?? process.env.CANISTER_ID_CHAT_PROD)!,
    _DChat.idlFactory
)
export const Facade = new Actor<_DFacade._SERVICE>(
    (process.env.CANISTER_ID_FACADE ?? process.env.CANISTER_ID_FACADE_PROD)!,
    _DFacade.idlFactory
)
export const Escrow = new Actor<_DEscrow._SERVICE>(
    (process.env.CANISTER_ID_ESCROW ?? process.env.CANISTER_ID_ESCROW_PROD)!,
    _DEscrow.idlFactory
)
export const Affiliate = new Actor<_DAffiliate._SERVICE>(
    (process.env.CANISTER_ID_AFFILIATE ?? process.env.CANISTER_ID_AFFILIATE_PROD)!,
    _DAffiliate.idlFactory
)
export const Sales = new Actor<_DSales._SERVICE>(
    (process.env.CANISTER_ID_SALES ?? process.env.CANISTER_ID_SALES_PROD)!,
    _DSales.idlFactory
)
export const Treasury = new Actor<_DTreasury._SERVICE>(
    (process.env.CANISTER_ID_TREASURY ?? process.env.CANISTER_ID_TREASURY_PROD)!,
    _DTreasury.idlFactory
)
export const Split = new Actor<_DSplit._SERVICE>(
    (process.env.CANISTER_ID_SPLIT ?? process.env.CANISTER_ID_SPLIT_PROD)!,
    _DSplit.idlFactory
)
export const ICPUSD = new Actor<_DICPUSD._SERVICE>(
    (process.env.CANISTER_ID_ICPUSD ?? process.env.CANISTER_ID_ICPUSD_PROD)!,
    _DICPUSD.idlFactory
)
export const ACORN = new Actor<_DACORN._SERVICE>(
    process.env.CANISTER_ID_ACORN_LEDGER!,
    _DACORN.idlFactory
)
export const ICP = new Actor<_DICP._SERVICE>(process.env.CANISTER_ID_ICP_LEDGER!, _DICP.idlFactory)
export const Assets = new Actor<_DAssets._SERVICE>(
    (process.env.CANISTER_ID_ASSETS ?? process.env.CANISTER_ID_ASSETS_PROD)!,
    _DAssets.idlFactory
)
export const Frontend = new Actor<_DIndicator._SERVICE>(
    process.env.CANISTER_ID_FRONTEND!,
    _DIndicator.idlFactory
)
