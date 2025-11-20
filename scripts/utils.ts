import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'

import { ActorSubclass, Agent, HttpAgent, Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import fetch from 'isomorphic-fetch'
import { sha256 } from 'js-sha256'

import { MAX_CHUNK_SIZE } from 'shared/constants'
import { DIndicator } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { UnwrapVariant, Variant } from 'shared/utils/typings'

import { LedgerInitArgs, serializeToCandid } from '../backend/test/utils/candid'

export type IndicatorActor = UnwrapDVariant<DIndicator.ActorVariant>
export type IndicatorActorsPrincipal = Record<IndicatorActor, Principal>
export type ChunksAndModuleHash = {
    chunks: { blob: Uint8Array; checksum: string }[]
    moduleHash: string
}
export type Installation = { actorVariant: DIndicator.ActorVariant; commitment: Commitment }

const REMOTE_CANISTERS = [
    'icp_ledger',
    'acorn_ledger',
    'xrc',
    'frontend',
    'internet_identity',
] as const
const CANISTER_NAMES = {
    DAO: 'dao',
    Facade: 'facade',
    ACORN: 'acorn_ledger',
    ICPUSD: 'icpusd',
    Treasury: 'treasury',
    Split: 'split',
    Affiliate: 'affiliate',
    Escrow: 'escrow',
    Sales: 'sales',
    Axioms: 'axioms',
    Chat: 'chat',
    Assets: 'assets',
    Indicator: 'indicator',
    Frontend: 'frontend',
} as const

type ActorName = keyof typeof CANISTER_NAMES
type CanisterName = (typeof CANISTER_NAMES)[ActorName]

const _getDeploymentArgs = (canister: CanisterName, actorsPrincipal: IndicatorActorsPrincipal) => {
    if (canister === 'acorn_ledger') {
        return serializeToCandid([
            [
                {
                    Init: {
                        token_symbol: 'ACORN',
                        token_name: 'Acorn Token',
                        minting_account: { owner: actorsPrincipal['Indicator'], subaccount: [] },
                        transfer_fee: 0,
                        metadata: [
                            {
                                _0_: 'icrc1:logo',
                                _1_: {
                                    Text: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMjM5LjIzIDE2NC4zOCAyODguNzggMzAxLjY2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPHN0eWxlPi5jbHMtMSB7ICAgICAgICAgZmlsbDogI2Q5YTg2YzsgICAgICAgfSAgICAgICAgLmNscy0xLCAuY2xzLTIsIC5jbHMtMywgLmNscy00IHsgICAgICAgICBzdHJva2Utd2lkdGg6IDBweDsgICAgICAgfSAgICAgICAgLmNscy0yIHsgICAgICAgICBmaWxsOiAjMjExOTExOyAgICAgICB9ICAgICAgICAuY2xzLTMgeyAgICAgICAgIGZpbGw6ICNmZmY7ICAgICAgIH0gICAgICAgIC5jbHMtNCB7ICAgICAgICAgZmlsbDogIzQwMmUxZTsgICAgICAgfTwvc3R5bGU+CjwvZGVmcz4KPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzc3Ljk0LDE4MS4wOGMtNjIuNTgsMC0xMTYuMiwzOC4zMS0xMzguNzEsOTIuNzYsMS43Ni0uMDksMy41Mi0uMTQsNS4yNi0uMTUsNi40OS0uMDksMTIuNzMuNTIsMTguNjgsMS42NCwxLjQ5LjI4LDIuOTYuNTksNC40MS45MywxLjQ0LjM2LDIuODUuNzcsNC4yNCwxLjIxLDIuNzguODcsNS40NywxLjg4LDguMDYsMy4wMiwzLjc3LDEuNjIsNy4wOSwzLjYyLDEwLjEsNS43MiwzLDIuMTQsNS42Nyw0LjQxLDcuOTMsNi45Myw0LjUzLDUuMDMsNy42NCwxMC42OCw5LjM4LDE2Ljc0LDMuNDQsMTIuMjEsMS4zOCwyNS45Ni01LjE3LDM5Ljg4LDMuMjQtLjcyLDYuNS0xLjM2LDkuNzctMS45MywzLjI2LS41Myw2LjUtLjk2LDkuNzctMS4zMiw2LjU0LS43NywxMi45Ni0xLDE5LjM2LTEuMDcsMTIuNjcuMDksMjQuOTQsMS40NCwzNS45OSw0LjEzLDIyLjE5LDUuMjYsMzkuNTksMTUuNDEsNDguMTQsMjguMDgsMy40Niw1LjEyLDUuMjgsMTAuMzMsNS42MywxNS41MS4zNiw1LjE2LS43MywxMC4yNS0zLjA4LDE1LjE4LTIuMzUsNC45My01Ljk1LDkuNjktMTAuNjEsMTQuMjItNC42NSw0LjUzLTEwLjM1LDEyLjA5LTE2LjkzLDE2LjEzbDEuNi44NWMxNS42NSw4LjQsMjkuMzQsMTUuMDMsNDAuNjcsMjUuMy40NC40Ljg2LjgsMS4yOSwxLjIsNDkuOTEtMjQuMzcsODQuMjktNzUuNjIsODQuMjktMTM0LjksMC04Mi44Ny02Ny4xOC0xNTAuMDUtMTUwLjA1LTE1MC4wNVoiLz4KPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMzM3LjI1LDI1Ny4xNmMtLjIxLjExLS40Mi4yMi0uNjMuMzMuMDktLjE3LjE2LS4zNS4yNS0uNTIuMTMuMDUuMjUuMTMuMzguMTlaIi8+CjxwYXRoIGNsYXNzPSJjbHMtMyIgZD0iTTUwMS4wNCwyNzguMzZzLTEuNzgtMy41MS03LjA1LTcuMzljLTEuMjItMTAuMjUtLjg3LTIxLjA1LDEuMDItMzIuMDEsMTguOTUsMTUuMzQsMTAuNDYsMzMuODIsNi4wMywzOS40MVoiLz4KPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMzcxLjI1LDI3OS44NWMtMjMuNTIsOS40MS0zOC45OSwxOS4yOC00OS4xNiwyOC4zOS4zMS00Ljc3LjkxLTkuNjEsMS44My0xNC40OSwyLjMtMTIuMSw2LjUzLTI0LjM1LDEyLjctMzYuMjYuMjEtLjExLjQyLS4yMi42My0uMzMsMTIuNzcsNS45OSwyNC4wNywxMy41OCwzMy41OCwyMi4yOC4xNS4xMy4yOC4yNy40Mi40WiIvPgo8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik0zMTYuMTQsMjY5LjU5Yy0yLjU4LDcuMTgtNC42LDE0LjM5LTUuOTcsMjEuNTctMS40Myw3LjUyLTIuMTksMTQuOTktMi4zMSwyMi4zMi00LjQ5LTUuOC05LjU3LTExLjMzLTE1LjIxLTE2LjUtLjc4LS43MS0xLjY3LTEuMzUtMi40Ny0yLjA2LDUuOTItOS40NywxNS4xNy0xNy45MywyNS45Ni0yNS4zM1oiLz4KPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNNDgyLjIyLDIzMS4zNWMtLjIxLjk3LS40NCwxLjkzLS42MiwyLjg5LTEuNDQsNy41Mi0yLjIsMTQuOTktMi4zMiwyMi4zMi00LjQ4LTUuOC05LjU2LTExLjMzLTE1LjIxLTE2LjUtNS4zNC00LjktMTEuMjQtOS40My0xNy41NC0xMy42MSwxMy4wOC0uNDksMjUuNS43OCwzNS42OSw0LjlaIi8+CjxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTMwNC4zNSAzMzMuMjRjLTIuMTYgNi43LTEuNDMgMTAuODktMS40MyAxMC44OXMtMjUuODQtOC4yMS0xOC42NC0zNS43OWM4LjEgNy42MSAxNC44NyAxNiAyMC4wNyAyNC44OXoiLz4KPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNNDA3LjcsMjMxLjk3Yy00LjU3LDEwLjM3LTcuODksMjAuOS05Ljg4LDMxLjM2LS40OCwyLjUzLS43OCw1LjA2LTEuMTEsNy41OC0yLjQ0Ljc1LTQuOSwxLjUyLTcuNDUsMi4zNy0xLjIzLjQxLTIuMzguODMtMy41NywxLjI0LTEuNzYtMS44MS0zLjUtMy42NC01LjM4LTUuMzctNy45NS03LjI4LTE3LjAyLTEzLjgzLTI3LjAzLTE5LjQ1LDguOTMtMy44MiwxNy41OC03LjAxLDI1LjExLTkuNTEsOC41Ny0yLjg1LDE4LjY2LTUuNzcsMjkuMzItOC4yMVoiLz4KPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNNDY0Ljk5LDI2MS4xOWMtMTMuMDEtMS4yOS0zMC40NC0uMjEtNTMuNTUsNS42LjA1LS4yOS4wOS0uNTcuMTQtLjg3LDIuMy0xMi4xLDYuNTItMjQuMzYsMTIuNjktMzYuMjgsMTEuNDUsNS43MiwyMS42NCwxMi43NiwzMC4zNCwyMC43MywzLjc2LDMuNDQsNy4yLDcuMDYsMTAuMzgsMTAuODJaIi8+CjxwYXRoIGNsYXNzPSJjbHMtNCIgZD0iTTUxOC4yOCwyNDQuOTVjLTMuMjEtNy4xMi04LjM3LTEzLjktMTUuODgtMTkuNTMtMTguOTUtMTQuMTUtNTMuMjYtMjEuMDctMTA4LjUtNi42MSwyLjIxLTQuNDksNi04LjA1LDkuODItMTEuNjksMy40Ni0zLjI3LDYuOTYtNi42MiwxMC4wNi0xMC42MiwyLjg5LTMuODgsNC4xMy03Ljg2LDMuOS0xMS43OS0uMjctNC42NC0yLjQ0LTguNjUtNS45NS0xMS45MWwtLjA3LS4wNGMtMi44LTIuNTktNi41NC00LjY5LTEwLjcxLTYuMTUtOC4yMS0yLjgtMTguNzYtMy4xNy0yNy43NC4xMS0xLjI5LjUtMi40NiwxLjAxLTMuNTksMS42Mi04LjkyLDQuNzItMTYuNTIsMTQuNTItMjAuNDMsMjYuNjctMy42NCwxMS4zMy00LjE0LDI0Ljk3LjU5LDM4LjQ5LTUyLjgsMjEuNDEtNzYuMTMsNDcuNDEtODIuOCw3MC4wNi0yLjY1LDktMi43OSwxNy41NC0xLjEsMjUuMTYsMS43NCw3Ljc5LDUuMzEsMTQuNTUsMTAuMDIsMTkuOTYsOC4wOSw5LjM4LDE5LjYzLDE0LjcxLDMwLjk2LDEzLjk4LDEuMzQsMy40OSwyLjcyLDcuMjksNC4xOSwxMS4xNiw5LjU2LDI2LjA4LDIxLjE3LDU3LjgxLDQ5Ljk3LDY5LjI1LDMwLjIzLDguMzQsNDUuOTMsNC44LDY0Ljg2LDcuNzQsMTcuNDEsMi43MSwyMy4xMiw5LjM0LDIzLjEyLDkuMzQsMCwwLDIuMS05LjE5LDExLjc1LTE3Ljk5LDE2LjEtMTQuNjksNDQuNDQtMzUuMDYsNTQuODMtNTkuNDksOC41Ni0yNC4wOS40LTUxLjUyLTYuNDgtNzQuNjEtMS4yLTMuOTYtMi4zNi03LjgzLTMuMzItMTEuNDUsOS40OC02LjE3LDE1LjUzLTE3LjM1LDE2LjQ1LTI5LjcyLjQ4LTcuMTMtLjY5LTE0LjY4LTMuOTYtMjEuOTdaTTQ4Mi4yMiwyMzEuMzVjLS4yMS45Ny0uNDQsMS45My0uNjIsMi44OS0xLjQ0LDcuNTItMi4yLDE0Ljk5LTIuMzIsMjIuMzItNC40OC01LjgtOS41Ni0xMS4zMy0xNS4yMS0xNi41LTUuMzQtNC45LTExLjI0LTkuNDMtMTcuNTQtMTMuNjEsMTMuMDgtLjQ5LDI1LjUuNzgsMzUuNjksNC45Wk00MjQuMjcsMjI5LjY0YzExLjQ1LDUuNzIsMjEuNjQsMTIuNzYsMzAuMzQsMjAuNzMsMy43NiwzLjQ0LDcuMiw3LjA2LDEwLjM4LDEwLjgyLTEzLjAxLTEuMjktMzAuNDQtLjIxLTUzLjU1LDUuNi4wNS0uMjkuMDktLjU3LjE0LS44NywyLjMtMTIuMSw2LjUyLTI0LjM2LDEyLjY5LTM2LjI4Wk0zNjUuMjYsMjAwLjEzYzIuNTQtNy44OCw3LjEtMTQuMDYsMTIuMzEtMTYuODIuNTEtLjI5LDEuMDQtLjUzLDEuNDctLjY3LDUuMy0xLjk0LDExLjUxLTEuNywxNi40NCwwLDIuMDUuNzIsMy42NywxLjU4LDQuNzMsMi41Ni4xNi4xMy4yNS4yMi40LjI5bC4xOC4xOGMtLjAzLjA4LS4xOC4xOC0uNDcuNTktMi4zNywzLjA5LTUuMzQsNS44My04LjE4LDguNTktOC4zMSw3Ljg2LTE2LjI5LDE1LjQyLTE3LjI0LDI5LjU2bC0zLjE2LDEuMDVjLTIuMDguNjktNC4xNSwxLjM4LTYuMSwyLjA5LTMuMjYtOS42NS0yLjktMTkuMzUtLjM3LTI3LjRaTTM3OC4zOCwyNDAuMThjOC41Ny0yLjg1LDE4LjY2LTUuNzcsMjkuMzItOC4yMS00LjU3LDEwLjM3LTcuODksMjAuOS05Ljg4LDMxLjM2LS40OCwyLjUzLS43OCw1LjA2LTEuMTEsNy41OC0yLjQ0Ljc1LTQuOSwxLjUyLTcuNDUsMi4zNy0xLjIzLjQxLTIuMzguODMtMy41NywxLjI0LTEuNzYtMS44MS0zLjUtMy42NC01LjM4LTUuMzctNy45NS03LjI4LTE3LjAyLTEzLjgzLTI3LjAzLTE5LjQ1LDguOTMtMy44MiwxNy41OC03LjAxLDI1LjExLTkuNTFaTTMzNi42MiwyNTcuNDljLjA5LS4xNy4xNi0uMzUuMjUtLjUyLjEzLjA1LjI1LjEzLjM4LjE5LDEyLjc3LDUuOTksMjQuMDcsMTMuNTgsMzMuNTgsMjIuMjguMTUuMTMuMjguMjcuNDIuNC0yMy41Miw5LjQxLTM4Ljk5LDE5LjI4LTQ5LjE2LDI4LjM5LjMxLTQuNzcuOTEtOS42MSwxLjgzLTE0LjQ5LDIuMy0xMi4xLDYuNTMtMjQuMzUsMTIuNy0zNi4yNlpNMzAyLjkyLDM0NC4xNHMtMjUuODQtOC4yMS0xOC42NC0zNS43OWM4LjEsNy42MSwxNC44NywxNiwyMC4wNywyNC44OS0yLjE2LDYuNy0xLjQzLDEwLjg5LTEuNDMsMTAuODlaTTI5Mi42NSwyOTYuOThjLS43OC0uNzEtMS42Ny0xLjM1LTIuNDctMi4wNiw1LjkyLTkuNDcsMTUuMTctMTcuOTMsMjUuOTYtMjUuMzMtMi41OCw3LjE4LTQuNiwxNC4zOS01Ljk3LDIxLjU3LTEuNDMsNy41Mi0yLjE5LDE0Ljk5LTIuMzEsMjIuMzItNC40OS01LjgtOS41Ny0xMS4zMy0xNS4yMS0xNi41Wk00ODcuNSwyOTMuNDNjLjA3LjQuMTUuOC4yOSwxLjI0LDEuMzIsNS42MywzLjE5LDExLjc5LDUuMTEsMTguMzEsMjguMzcsODMuMS0yMC4wOSwxMDEuMzItMzguODksMTE3LjUyLTcuMjYsNi40NC05LjMxLDE0Ljc0LTkuMzEsMTQuNzQsMCwwLTEwLjA1LTcuNjItMjIuODEtNy4zNC05LjkyLjI3LTIxLjUxLDMuMjYtNDMuMDItMy40NS0yMS41My02LjcxLTMyLjY5LTIwLjY2LTQwLjMtMzYuMzksMjUuMDUsMjkuODEsNjIuNTUsMzYuNjgsOTQuMjEsMjYuMSwyOC44OC05LjUyLDUyLjk5LTMzLjU4LDU4Ljc0LTY3LjItOC41MywyOC4yMy0yOS41Nyw0OC4wNS01My45NCw1Ni4wOC00My4wMSwxNC4zOS05Ni4yNS0xMC4zNi0xMDguODktODQuNzhoLS4wM2MzLjgxLTQuNjMsOC44Mi05Ljc3LDE1LjE0LTE1LjIyLDEzLjYtOS4wNiwzMS4wNS0xNy4xNiw0OS4zLTIzLjIyLDE4LjI0LTYuMDYsMzcuMDYtMTAsNTMuMzMtMTAuODYsMjEuMzUtMS4wOCwzNy45NSwyLjg3LDQxLjA2LDE0LjQ0Wk01MDEuMDQsMjc4LjM2cy0xLjc4LTMuNTEtNy4wNS03LjM5Yy0xLjIyLTEwLjI1LS44Ny0yMS4wNSwxLjAyLTMyLjAxLDE4Ljk1LDE1LjM0LDEwLjQ2LDMzLjgyLDYuMDMsMzkuNDFaIi8+CjxyZWN0IGNsYXNzPSJjbHMtMiIgeD0iMzI4LjU4IiB5PSI0NDYuMzIiIHdpZHRoPSIyLjQyIiBoZWlnaHQ9IjAiLz4KPC9zdmc+Cg==',
                                },
                            },
                        ],
                        feature_flags: [{ icrc2: true }],
                        initial_balances: [
                            {
                                _0_: { owner: actorsPrincipal['Treasury'], subaccount: [] },
                                _1_: e8s.fromNumber(20_090_000_000),
                            },
                        ],
                        fee_collector_account: [],
                        decimals: [],
                        max_memo_length: [],
                        maximum_number_of_accounts: [],
                        accounts_overflow_trim_quantity: [],
                        archive_options: {
                            num_blocks_to_archive: 1000,
                            trigger_threshold: 2000,
                            controller_id: actorsPrincipal['Indicator'],
                            max_transactions_per_response: [],
                            max_message_size_bytes: [],
                            cycles_for_archive_creation: [],
                            node_max_memory_size_bytes: [],
                            more_controller_ids: [],
                        },
                    },
                },
                LedgerInitArgs,
            ],
        ])
        // } else if (canister === 'frontend') {
        //     return serializeToCandid([[{ Init: {} }, FrontendInitArgs]])
    } else {
        return new Uint8Array()
    }
}
const _getCyclesNeeded = (actor: ActorName): string => {
    switch (actor) {
        case 'Sales':
            return '15_000_000_000_000'
        default:
            return '550_000_000_000'
    }
}

const _convertEnvName = (name: CanisterName | 'internet_identity' | 'icp_ledger') => {
    return `CANISTER_ID_${name.toUpperCase()}`
}
const _convertPostFix = (name: CanisterName, environment: 'local' | 'prod'): CanisterName => {
    if (REMOTE_CANISTERS.includes(name as any)) return name
    return `${name}${environment === 'prod' ? '_prod' : ''}` as CanisterName
}

const _isBuilt = (network: 'local' | 'ic', name: CanisterName): boolean => {
    const dir =
        network === 'ic'
            ? `.dfx/ic/canisters/${name}/${name}.wasm`
            : `.dfx/local/canisters/${name}/${name}.wasm`
    try {
        execSync(`ls ${dir}`, { stdio: 'ignore' })
        return true
    } catch {
        return false
    }
}
const _build = (network: 'local' | 'ic', name: CanisterName) => {
    const dir =
        network === 'ic'
            ? `.dfx/ic/canisters/${name}/${name}.wasm.gz`
            : `.dfx/local/canisters/${name}/${name}.wasm.gz`
    const cmd =
        network === 'ic'
            ? `dfx build ${name} --ic`
            : `dfx canister create ${name} && dfx build ${name}`

    const unzip: string = REMOTE_CANISTERS.includes(name as any) ? `&& gzip -d ${dir}` : ''
    console.info(`Building canister ${name}...`)
    try {
        execSync(`${cmd} --output-env-file .temp ${unzip}`, { stdio: 'ignore' })
    } catch {}
}
const _buildCanister = (network: 'local' | 'ic', name: CanisterName) => {
    if (!_isBuilt(network, name)) _build(network, name)
}
const _computeChunksAndModuleHash = (
    network: 'local' | 'ic',
    name: CanisterName
): ChunksAndModuleHash => {
    const dir =
        network === 'ic'
            ? `.dfx/ic/canisters/${name}/${name}.wasm`
            : `.dfx/local/canisters/${name}/${name}.wasm`
    const buffer: Buffer = readFileSync(dir)
    const size: number = buffer.length
    const numOfChunks: number = Math.ceil(size / MAX_CHUNK_SIZE)
    const moduleHash: string = sha256(buffer)
    const chunks: { blob: Uint8Array; checksum: string }[] = []
    for (let i = 0; i < numOfChunks; i++) {
        const start: number = i * MAX_CHUNK_SIZE
        const end: number = Math.min(size, (i + 1) * MAX_CHUNK_SIZE)
        const chunk: Buffer = buffer.slice(start, end)
        chunks.push({ blob: new Uint8Array(chunk), checksum: sha256(chunk) })
    }
    return { chunks, moduleHash }
}

///

export const writeEnvs = (
    network: 'local' | 'ic',
    environment: 'local' | 'prod',
    actorsPrincipal: IndicatorActorsPrincipal
) => {
    const canisterIdsDir = network === 'ic' ? 'canister_ids.json' : '.dfx/local/canister_ids.json'
    const canisterIds = JSON.parse(readFileSync(canisterIdsDir, 'utf8'))
    const dfx = JSON.parse(readFileSync('dfx.json', 'utf8'))

    const variables = {
        DFX_NETWORK: network,
        DFX_VERSION: dfx.dfx,
        [_convertEnvName('icp_ledger')]: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        [_convertEnvName('internet_identity')]:
            network === 'ic'
                ? 'rdmx6-jaaaa-aaaaa-aaadq-cai'
                : canisterIds['internet_identity'].local,
    }

    for (const [actor, principal] of Object.entries(actorsPrincipal)) {
        const id = principal.toText()

        if (actor === 'Founder') {
            variables['FOUNDER_ID'] = id
        } else {
            const canister = CANISTER_NAMES[actor as ActorName]
            const canisterPostFix = _convertPostFix(canister, environment)
            const canisterEnv = _convertEnvName(canister)
            const urlPrefix =
                network === 'ic'
                    ? 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id='
                    : 'http://127.0.0.1:4943/?canisterId=bd3sg-teaaa-aaaaa-qaaba-cai&id='

            console.info(`${actor} deployed with url: ${urlPrefix}${id}`)
            canisterIds[canisterPostFix] = { ...canisterIds[canisterPostFix], [network]: id }
            variables[canisterEnv] = id
        }
    }
    writeFileSync(canisterIdsDir, JSON.stringify(canisterIds, null, 2))

    const newEnv = Object.entries(variables)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n')

    if (!existsSync('.env')) writeFileSync('.env', '')
    const oldEnv = readFileSync('.env', 'utf8').split('\n')
    let start = oldEnv.findIndex((line) => line.startsWith('# DFX CANISTER ENVIRONMENT VARIABLES'))
    let end = oldEnv.findIndex((line) =>
        line.startsWith('# END DFX CANISTER ENVIRONMENT VARIABLES')
    )
    if (start === -1) {
        oldEnv.push('# DFX CANISTER ENVIRONMENT VARIABLES')
        start = oldEnv.length - 1
    }
    if (end === -1) {
        oldEnv.push('# END DFX CANISTER ENVIRONMENT VARIABLES')
        end = oldEnv.length - 1
    }
    const newFile = oldEnv
        .slice(0, start + 1)
        .concat(newEnv)
        .concat(oldEnv.slice(end))
        .join('\n')
    writeFileSync('.env', newFile)
}

const buildCanisters = (network: 'local' | 'ic', canisters: CanisterName[]) => {
    const builtCanisters: [CanisterName, boolean][] = canisters.map((c) => [
        c,
        _isBuilt(network, c),
    ])
    const buildableCanisters: CanisterName[] = builtCanisters
        .filter(([, built]) => !built)
        .map(([c]) => c)
    const prebuiltCanisters: CanisterName[] = builtCanisters
        .filter(([, built]) => built)
        .map(([c]) => c)

    console.info('Canisters already built:', prebuiltCanisters)
    console.info('Canisters to build:', buildableCanisters)

    buildableCanisters.map((c) => _buildCanister(network, c))
}

export const setupInstallations = (
    network: 'local' | 'ic',
    environment: 'local' | 'prod',
    actorsPrincipal: IndicatorActorsPrincipal
) => {
    const { Indicator: _, Frontend: __, ...canistersToBuild } = CANISTER_NAMES
    const canisters = Object.values(canistersToBuild).map((c) => _convertPostFix(c, environment))
    buildCanisters(network, canisters as CanisterName[])
    const installations: Installation[] = Object.entries(canistersToBuild).map(
        ([actorName, canisterName]) => {
            const actorVariant = Variant(actorName as ActorName)
            const args = _getDeploymentArgs(canisterName, actorsPrincipal)
            const { chunks, moduleHash } = _computeChunksAndModuleHash(
                network,
                _convertPostFix(canisterName, environment)
            )
            return { actorVariant, commitment: { chunks, moduleHash, args } }
        }
    )
    return installations
}

export const initializeIndicator = async (
    Indicator: ActorSubclass<DIndicator._SERVICE>
): Promise<IndicatorActorsPrincipal> => {
    await Indicator.initialize().catch((e) => console.error('Error initializing Indicator:', e))
    const actorsPrincipal = await Indicator.getPrincipals().then((principals) =>
        Object.fromEntries(principals.map(([a, p]) => [UnwrapVariant(a), p]))
    )
    return actorsPrincipal as IndicatorActorsPrincipal
}

export const uploadInstallations = async (
    Indicator: ActorSubclass<DIndicator._SERVICE>,
    installations: Installation[]
) => {
    console.info('Initializing first session...')
    await Indicator.initializeFirstSession(
        { Minor: null },
        [{ Added: ['First release'] }],
        installations.map(({ actorVariant, commitment: { moduleHash, args } }) => ({
            actorVariant,
            moduleHash,
            args,
        }))
    )
    console.info('Uploading commitments...')
    await Promise.all(
        installations.map(({ actorVariant, commitment }) =>
            Promise.all(
                commitment.chunks.map(({ blob, checksum }, index) =>
                    Indicator.uploadCommitmentChunk(actorVariant, index, blob, checksum)
                )
            )
        )
    )
    console.info('Settling commitments...')
    await Promise.all(
        installations.map(({ actorVariant }) => Indicator.settleCommitment(actorVariant))
    )
    console.info('Installing canisters...')
    await Indicator.installCanisters()
}

export const topUpCycles = (network: 'local' | 'ic', actorsPrincipal: IndicatorActorsPrincipal) => {
    for (const [actor, principal] of Object.entries(actorsPrincipal)) {
        if (actor === 'Founder') continue

        const id = principal.toText()
        const cycles = _getCyclesNeeded(actor as ActorName)
        execSync(
            network === 'ic'
                ? `dfx cycles top-up ${id} ${cycles} --ic`
                : `dfx ledger fabricate-cycles --canister ${id} --cycles ${cycles}`,
            { stdio: 'ignore' }
        )
    }
}

export const createAgent = (network: 'local' | 'ic', identity?: Identity): Agent => {
    const host =
        network === 'ic'
            ? 'https://identity.ic0.app'
            : `http://127.0.0.1:${execSync('dfx info webserver-port', { encoding: 'utf-8', stdio: [] })}`

    return new HttpAgent({ identity, host, fetch })
}
