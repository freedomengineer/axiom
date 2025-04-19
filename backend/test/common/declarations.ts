export const CORE_ACTOR_NAMES_BY_CANISTER = {
    acorn_ledger: 'ACORN',
    icpusd: 'ICPUSD',
    treasury: 'Treasury',
    split: 'Split',
    affiliate: 'Affiliate',
    escrow: 'Escrow',
    sales: 'Sales',
    axioms: 'Axioms',
} as const

export const PERIPHERY_ACTOR_NAMES_BY_CANISTER = {
    dao: 'DAO',
    facade: 'Facade',
    indicator: 'Indicator',
    frontend: 'Frontend',
} as const

export const INTERNAL_ACTOR_NAMES_BY_CANISTER = {
    ...CORE_ACTOR_NAMES_BY_CANISTER,
    ...PERIPHERY_ACTOR_NAMES_BY_CANISTER,
} as const

export const EXTERNAL_ACTOR_NAMES_BY_CANISTER = {
    xrc: 'XRC',
    icp_ledger: 'ICP',
    internet_identity: 'Identity',
} as const

export type CoreCanisterName = keyof typeof CORE_ACTOR_NAMES_BY_CANISTER
export type PeripheryCanisterName = keyof typeof PERIPHERY_ACTOR_NAMES_BY_CANISTER
export type InternalCanisterName = keyof typeof INTERNAL_ACTOR_NAMES_BY_CANISTER
export type ExternalCanisterName = keyof typeof EXTERNAL_ACTOR_NAMES_BY_CANISTER

export type InternalActorName = (typeof INTERNAL_ACTOR_NAMES_BY_CANISTER)[InternalCanisterName]
export type ExternalActorName = (typeof EXTERNAL_ACTOR_NAMES_BY_CANISTER)[ExternalCanisterName]
export type ActorName = InternalActorName | ExternalActorName

export type CanisterName = InternalCanisterName | ExternalCanisterName
export type HardDeployableCanister = 'indicator' | ExternalCanisterName
export type SoftDeployableCanister = Exclude<InternalCanisterName, 'indicator'>

export const INTERNAL_ACTOR_NAMES: InternalActorName[] = Object.values(
    INTERNAL_ACTOR_NAMES_BY_CANISTER
)
export const EXTERNAL_ACTOR_NAMES: ExternalActorName[] = Object.values(
    EXTERNAL_ACTOR_NAMES_BY_CANISTER
)
export const INTERNAL_CANISTER_NAMES: InternalCanisterName[] = Object.keys(
    INTERNAL_ACTOR_NAMES_BY_CANISTER
) as InternalCanisterName[]
export const EXTERNAL_CANISTER_NAMES: ExternalCanisterName[] = Object.keys(
    EXTERNAL_ACTOR_NAMES_BY_CANISTER
) as ExternalCanisterName[]

export const HARD_DEPLOYABLE_CANISTERS: HardDeployableCanister[] = [
    ...EXTERNAL_CANISTER_NAMES,
    'indicator',
]
export const SOFT_DEPLOYABLE_CANISTERS: SoftDeployableCanister[] = INTERNAL_CANISTER_NAMES.filter(
    (canister) => canister !== 'indicator'
)

export const REMOTE_WASM_CANISTERS: CanisterName[] = [
    'icp_ledger',
    'acorn_ledger',
    'xrc',
    'frontend',
    'internet_identity',
]

export const ARGS_REQUIRED_CANISTERS: InternalCanisterName[] = ['dao', 'axioms', 'acorn_ledger']

export const isCoreCanister = (name: InternalCanisterName): name is CoreCanisterName =>
    CORE_ACTOR_NAMES_BY_CANISTER.hasOwnProperty(name)
export const isPeripheryCanister = (name: InternalCanisterName): name is PeripheryCanisterName =>
    PERIPHERY_ACTOR_NAMES_BY_CANISTER.hasOwnProperty(name)

export const isInternalCanister = (name: CanisterName): name is InternalCanisterName =>
    INTERNAL_ACTOR_NAMES_BY_CANISTER.hasOwnProperty(name)
export const isExternalCanister = (name: CanisterName): name is ExternalCanisterName =>
    EXTERNAL_ACTOR_NAMES_BY_CANISTER.hasOwnProperty(name)

export const isHardDeployableCanister = (name: CanisterName): name is HardDeployableCanister =>
    HARD_DEPLOYABLE_CANISTERS.includes(name as HardDeployableCanister)
export const isSoftDeployableCanister = (name: CanisterName): name is SoftDeployableCanister =>
    SOFT_DEPLOYABLE_CANISTERS.includes(name as SoftDeployableCanister)
