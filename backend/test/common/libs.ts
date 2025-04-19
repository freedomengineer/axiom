import { spawn } from 'child_process'

import { DECIMALS } from './constants'

export const amountOf = (value: number): bigint => {
    if (value === Infinity) return BigInt(0)
    return BigInt(Math.round(value * Number(DECIMALS)))
}

export const valueOf = (amount: bigint): number => {
    return Number(amount) / Number(DECIMALS)
}

export const reduceAmount = (amount: bigint, percentage: number): bigint => {
    return BigInt(Math.floor(Number(amount) * percentage))
}

export const generateSeed = (): bigint => {
    // Generate 8 digit random number
    return BigInt(Math.random().toString().slice(2, 10))
}

///

export type Proportion = [bigint, bigint]
export const getScaleBy = (amount: bigint, proportion: Proportion): bigint => {
    return (amount * proportion[0]) / proportion[1]
}
export const getDeductBy = (amount: bigint, proportion: Proportion): bigint => {
    return amount - getScaleBy(amount, proportion)
}
export const getIncreaseBy = (amount: bigint, proportion: Proportion): bigint => {
    return amount + getScaleBy(amount, proportion)
}

///

// if T[keyof T] is Promise<U> - it will be resolved and returned as U
// if T[keyof T] is Array<Promise<U>> - it will be resolved and returned as Array<U>
// GroupedPromises<T> = {
//   a: Promise<number>,
//   b: Array<Promise<boolean>>,
//   c: Array<Promise<Array<string>>>,
// }
type GroupedPromises<T> = {
    [K in keyof T]: T[K] extends Promise<infer U>
        ? Promise<U>
        : T[K] extends Array<Promise<infer U>>
          ? Array<Promise<U>>
          : T[K]
}
// FlattenedPromises<T> = Array<Promise<number | boolean | string>>
type FlattenedPromises<T> = Array<
    T[keyof T] extends Promise<infer U> ? U : T[keyof T] extends Array<Promise<infer U>> ? U : never
>
// RegroupedResolves<T> = { a: number, b: boolean[], c: string[][] }
type RegroupedResolves<T> = {
    [K in keyof T]: T[K] extends Promise<infer U>
        ? U
        : T[K] extends Array<Promise<infer U>>
          ? Array<U>
          : T[K]
}

type GatherPromisesParams<T> = T extends Array<infer T> ? GroupedPromises<T>[] : GroupedPromises<T>
type GatherPromisesResults<T> =
    T extends Array<infer T> ? RegroupedResolves<T>[] : RegroupedResolves<T>

export const gatherPromises = async <T>(
    groups: GatherPromisesParams<T> | Array<unknown>
): Promise<GatherPromisesResults<T>> => {
    const _gather = async (groups: GroupedPromises<T>[]): Promise<RegroupedResolves<T>[]> => {
        const flattened: FlattenedPromises<T>[] = groups
            .map((group) =>
                Object.values(group).flatMap((value) => (Array.isArray(value) ? value : [value]))
            )
            .flat()

        const resolvedPromises = await Promise.all(flattened)

        const regroupedResults: RegroupedResolves<T>[] = []
        let resultIndex = 0

        for (const group of groups) {
            const regroupedGroup = {} as RegroupedResolves<T>
            for (const key of Object.keys(group) as (string | number | symbol)[]) {
                const value = group[key]
                if (Array.isArray(value)) {
                    const length = value.length
                    regroupedGroup[key] = resolvedPromises.slice(resultIndex, resultIndex + length)
                    resultIndex += length
                } else {
                    regroupedGroup[key] = resolvedPromises[resultIndex]
                    resultIndex++
                }
            }

            regroupedResults.push(regroupedGroup)
        }

        return regroupedResults
    }

    if (Array.isArray(groups)) return _gather(groups as GroupedPromises<T>[])
    else return _gather([groups] as GroupedPromises<T>[]).then(([result]) => result)
}

export const exec = async (cmd: string): Promise<void> => {
    const [command, ...args] = cmd.split(' ')

    return new Promise((resolve, reject) => {
        const c = spawn(command, args, { shell: true })

        c.stderr.on('data', (data) => {
            console.log(`${data}`)
        })

        c.on('close', (code) => {
            if (code === 0) resolve()
            else reject(new Error(`Command failed: ${cmd}`))
        })
    })
}
