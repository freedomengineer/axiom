import { execSync } from 'child_process'
import { Principal } from '@dfinity/principal'
import {
    CanisterName,
    ExternalCanisterName,
    HARD_DEPLOYABLE_CANISTERS,
    HardDeployableCanister,
    INTERNAL_ACTOR_NAMES_BY_CANISTER,
    InternalActorName,
    InternalCanisterName,
} from '../common/declarations'

///

export const DFX_PORT = execSync('dfx info replica-port', { encoding: 'utf-8', stdio: [] })
export const BASE_PATH = process.cwd().split('canisters')[0]

///

export const hardDeployCanister = (name: HardDeployableCanister, args?: string): Principal => {
    if (name === 'icp_ledger') {
        execSync(`${BASE_PATH}/backend/scripts/deploy_icp.sh`, { stdio: 'ignore' })
        return derivePrincipal('icp_ledger')
    } else {
        if (args)
            execSync(`dfx deploy ${name} --mode=reinstall --yes --argument '(${args})'`, {
                stdio: 'ignore',
            })
        else
            execSync(`dfx deploy ${name} --mode=reinstall --yes --with-cycles 3000000000000`, {
                stdio: 'ignore',
            })

        return derivePrincipal(name)
    }
}

export const hardDeployCanisters = (
    canisters: Record<HardDeployableCanister, string>
): Record<HardDeployableCanister, Principal> => {
    return Object.fromEntries(
        Object.entries(canisters).map(([key, args]) => [
            key,
            hardDeployCanister(key as HardDeployableCanister, args),
        ])
    ) as Record<HardDeployableCanister, Principal>
}

///

export const generateInterface = (name: string): void => {
    execSync(`dfx generate ${name}`)
}

export const derivePrincipal = (name: CanisterName): Principal => {
    let principal: string = process.env[`CANISTER_ID_${name.toUpperCase()}`] as string

    if (!principal) {
        if (HARD_DEPLOYABLE_CANISTERS.includes(name as HardDeployableCanister)) {
            principal = execSync(`dfx canister id ${name}`).toString().trim()
        } else {
            const actorName: InternalActorName =
                INTERNAL_ACTOR_NAMES_BY_CANISTER[name as InternalCanisterName]

            principal = execSync(
                `dfx canister call indicator getPrincipal 'variant {${actorName}}'`
            )
                .toString()
                .trim()
                .split(`"`)[1]
        }
    }

    return Principal.fromText(principal)
}

export const externalCanisterExists = (name: ExternalCanisterName): boolean => {
    try {
        execSync(`dfx canister id ${name}`, { stdio: 'ignore' })
        return true
    } catch {
        return false
    }
}
