import { amountOf } from '../common/libs'

export const getCurrentPrice = async (): Promise<bigint> => {
    const response = await fetch('https://api.coinbase.com/v2/prices/ICP-USD/spot')
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return amountOf(data.data.amount)
}

export const ACCEPTABLE_SLIPPAGE: bigint = amountOf(1.05) // 5% slippage
