import { ActorSubclass } from '@dfinity/agent'

export type * as DACORN from 'shared/declarations/acorn_ledger/acorn_ledger.did.d.ts'
export type * as DAffiliate from 'shared/declarations/affiliate/affiliate.did.d.ts'
export type * as DAxioms from 'shared/declarations/axioms/axioms.did.d.ts'
export type * as DDAO from 'shared/declarations/dao/dao.did.d.ts'
export type * as DEscrow from 'shared/declarations/escrow/escrow.did.d.ts'
export type * as DFacade from 'shared/declarations/facade/facade.did.d.ts'
export type * as DICP from 'shared/declarations/icp_ledger/icp_ledger.did.d.ts'
export type * as DICPUSD from 'shared/declarations/icpusd/icpusd.did.d.ts'
export type * as DIndicator from 'shared/declarations/indicator/indicator.did.d.ts'
export type * as DSales from 'shared/declarations/sales/sales.did.d.ts'
export type * as DSplit from 'shared/declarations/split/split.did.d.ts'
export type * as DTreasury from 'shared/declarations/treasury/treasury.did.d.ts'
export type * as DAssets from 'shared/declarations/assets/assets.did.d.ts'
export type * as DEncyclopedia from 'shared/declarations/encyclopedia/encyclopedia.did.d.ts'
export type * as DChat from 'shared/declarations/chat/chat.did.d.ts'
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

export type ActorServices = {
    ACORN: Actor<ActorSubclass<_DACORN._SERVICE>>
    Affiliate: Actor<ActorSubclass<_DAffiliate._SERVICE>>
    Assets: Actor<ActorSubclass<_DAssets._SERVICE>>
    Axioms: Actor<ActorSubclass<_DAxioms._SERVICE>>
    Chat: Actor<ActorSubclass<_DChat._SERVICE>>
    DAO: Actor<ActorSubclass<_DDAO._SERVICE>>
    Encyclopedia: Actor<ActorSubclass<_DEncyclopedia._SERVICE>>
    Escrow: Actor<ActorSubclass<_DEscrow._SERVICE>>
    Facade: Actor<ActorSubclass<_DFacade._SERVICE>>
    ICP: Actor<ActorSubclass<_DICP._SERVICE>>
    ICPUSD: Actor<ActorSubclass<_DICPUSD._SERVICE>>
    Indicator: Actor<ActorSubclass<_DIndicator._SERVICE>>
    Sales: Actor<ActorSubclass<_DSales._SERVICE>>
    Split: Actor<ActorSubclass<_DSplit._SERVICE>>
    Treasury: Actor<ActorSubclass<_DTreasury._SERVICE>>
}
