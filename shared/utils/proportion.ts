import { isNullish } from './typings'

export type Proportion = [bigint, bigint]

const add = (a: Nullish<Proportion>, b: Nullish<Proportion>): Proportion => {
    if (isNullish(a) || isNullish(b)) return [0n, 1n]
    return [a[0] * b[1] + b[0] * a[1], a[1] * b[1]]
}
const mul = (a: Nullish<Proportion>, b: Nullish<Proportion>): Proportion => {
    if (isNullish(a) || isNullish(b)) return [0n, 1n]
    return [a[0] * b[0], a[1] * b[1]]
}
const pow = (a: Nullish<Proportion>, n: bigint): Proportion => {
    if (isNullish(a)) return [0n, 1n]
    let part = a[0],
        whole = a[1],
        resultPart = 1n,
        resultWhole = 1n
    while (n > 0n) {
        if (n % 2n === 1n) {
            resultPart *= part
            resultWhole *= whole
        }
        part *= part
        whole *= whole
        n /= 2n
    }
    return [resultPart, resultWhole]
}
const invert = (a: Nullish<Proportion>): Proportion => {
    if (isNullish(a)) return [0n, 1n]
    return [a[1], a[0]]
}
const complement = (a: Nullish<Proportion>): Proportion => {
    if (isNullish(a)) return [0n, 1n]
    return [a[1] - a[0], a[1]]
}
const gt = (a: Nullish<Proportion>, b: Nullish<Proportion>): boolean => {
    if (isNullish(a) || isNullish(b)) return false
    return a[0] * b[1] > b[0] * a[1]
}
const gte = (a: Nullish<Proportion>, b: Nullish<Proportion>): boolean => {
    if (isNullish(a) || isNullish(b)) return false
    return a[0] * b[1] >= b[0] * a[1]
}
const lt = (a: Nullish<Proportion>, b: Nullish<Proportion>): boolean => {
    if (isNullish(a) || isNullish(b)) return false
    return a[0] * b[1] < b[0] * a[1]
}
const lte = (a: Nullish<Proportion>, b: Nullish<Proportion>): boolean => {
    if (isNullish(a) || isNullish(b)) return false
    return a[0] * b[1] <= b[0] * a[1]
}

const toFloat = (a: Nullish<Proportion>): number => {
    if (isNullish(a)) return 0
    return Number(a[0]) / Number(a[1])
}
const toString = (a: Nullish<Proportion>, decimals: number = 8): string => {
    if (isNullish(a)) return '0%'
    return `${parseFloat(((Number(a[0]) * 100) / Number(a[1])).toFixed(decimals))}%`
}

export default {
    add,
    mul,
    pow,
    invert,
    complement,
    gt,
    gte,
    lt,
    lte,
    toFloat,
    toString,
}
