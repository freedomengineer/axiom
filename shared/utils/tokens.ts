import { DECIMALS } from 'shared/constants'

export const amountOf = (value: number): bigint => {
    if (value === Infinity) return BigInt(0)
    return BigInt(Math.round(value * Number(DECIMALS)))
}

export const valueOf = (amount: bigint | number): number => {
    if (amount === 0n) return 0
    return Number(amount) / Number(DECIMALS)
}

export const getCurrentPrice = async (): Promise<bigint> => {
    const response = await fetch('https://api.coinbase.com/v2/prices/ICP-USD/spot')
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return amountOf(data.data.amount)
}
