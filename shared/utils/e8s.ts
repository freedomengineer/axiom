import { isNullish } from '@dfinity/utils'

import { Proportion } from './proportion'

export type E8S = bigint

const add = (a: Nullish<E8S>, b: Nullish<E8S>): E8S => {
    if (isNullish(a) || isNullish(b)) return 0n
    return a + b
}
const sub = (a: Nullish<E8S>, b: Nullish<E8S>): E8S => {
    if (isNullish(a) || isNullish(b)) return 0n
    return a - b
}
const mul = (a: Nullish<E8S>, b: Nullish<E8S>): E8S => {
    if (isNullish(a) || isNullish(b)) return 0n
    return a * b
}
const scaleBy = (a: Nullish<E8S>, p: Nullish<Proportion>): E8S => {
    if (isNullish(a) || isNullish(p)) return 0n
    return (a * p[0]) / p[1]
}
const deductBy = (a: Nullish<E8S>, p: Nullish<Proportion>): E8S => {
    if (isNullish(a) || isNullish(p)) return 0n
    return a - (a * p[0]) / p[1]
}
const increaseBy = (a: Nullish<E8S>, p: Nullish<Proportion>): E8S => {
    if (isNullish(a) || isNullish(p)) return 0n
    return a + (a * p[0]) / p[1]
}

const fromNumber = (a: number): E8S => {
    if (a === Infinity) return 0n
    return BigInt(Math.round(a * 1e8))
}
const toNumber = (a: Nullish<E8S>, decimals: number = 8): number => {
    if (isNullish(a)) return 0
    return parseFloat((Number(a) / 1e8).toFixed(decimals))
}
const toString = (a: Nullish<E8S>, decimals: number = 8): string => {
    if (isNullish(a)) return '0'
    return toNumber(a, decimals).toLocaleString('en', {
        maximumFractionDigits: decimals,
    })
}

export default {
    add,
    sub,
    mul,
    scaleBy,
    deductBy,
    increaseBy,
    fromNumber,
    toNumber,
    toString,
}
