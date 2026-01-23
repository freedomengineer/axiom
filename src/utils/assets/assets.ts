import { DSplit, DTreasury } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { UnwrapVariant } from 'shared/utils/typings'

export type ChartData = { label: string; value: number; color: string }

export const ALLOCATIONS = {
    Sales: {
        total: 100_000_000.0,
        hexColor: '#4A148C',
        reservingColor: '#4A148C',
        balanceColor: '#4A148C80',
        circulatingColor: '#75757520',
        textColor: 'text-purple-900',
        bgColor: 'bg-purple-900',
        borderColor: 'border-purple-900',
    },
    Axioms: {
        total: 200_000_000.0,
        hexColor: '#FF6F00',
        reservingColor: '#FF6F00',
        balanceColor: '#FF6F0080',
        circulatingColor: '#75757520',
        textColor: 'text-amber-900',
        bgColor: 'bg-amber-900',
        borderColor: 'border-amber-900',
    },
    Escrow: {
        total: 100_000_000.0 + 10_000_000.0,
        hexColor: '#1B5E20',
        reservingColor: '#1B5E20',
        balanceColor: '#1B5E2080',
        circulatingColor: '#75757520',
        textColor: 'text-green-900',
        bgColor: 'bg-green-900',
        borderColor: 'border-green-900',
    },
    DAO: {
        total: 40_000_000.0,
        hexColor: '#B71C1C',
        reservingColor: '#B71C1C',
        balanceColor: '#B71C1C80',
        circulatingColor: '#75757520',
        textColor: 'text-red-900',
        bgColor: 'bg-red-900',
        borderColor: 'border-red-900',
    },
}

export const DISTRIBUTIONS = {
    Affiliate: {
        hexColor: '#01579B',
        balanceColor: '#01579B80',
        withdrawalColor: '#75757520',
        textColor: 'text-light-blue-900',
        bgColor: 'bg-light-blue-900',
        borderColor: 'border-light-blue-900',
    },
    DAO: {
        hexColor: '#B71C1C',
        balanceColor: '#B71C1C80',
        withdrawalColor: '#75757520',
        textColor: 'text-red-900',
        bgColor: 'bg-red-900',
        borderColor: 'border-red-900',
    },
    Founder: {
        hexColor: '#E65100',
        balanceColor: '#E6510080',
        withdrawalColor: '#75757520',
        textColor: 'text-orange-900',
        bgColor: 'bg-orange-900',
        borderColor: 'border-orange-900',
    },
}

export const computeAllocationsChartData = (
    allocations: DTreasury.SharableAllocation[]
): { inner: Record<string, ChartData>; outer: Record<string, ChartData[]> } => {
    const inner: Record<string, ChartData> = {}
    const outer: Record<string, ChartData[]> = {}

    for (const { actorVariant, allocated, balance } of allocations) {
        const key = UnwrapVariant(actorVariant)
        if (key === 'Facade') continue
        const { total, hexColor, circulatingColor, reservingColor, balanceColor } =
            ALLOCATIONS[key as keyof typeof ALLOCATIONS]
        const allocatedValue = e8s.toNumber(allocated)
        const balanceValue = e8s.toNumber(balance)
        const circulatingValue = e8s.toNumber(e8s.sub(e8s.fromNumber(total), allocated))

        inner[key] = { label: `${key} Max Supply`, value: total, color: hexColor }
        outer[key] = [
            { label: `${key} Reserving`, value: allocatedValue, color: reservingColor },
            { label: `${key} Balance`, value: balanceValue, color: balanceColor },
            { label: `${key} Circulating`, value: circulatingValue, color: circulatingColor },
        ]
    }

    return { inner, outer }
}

export const computeDistributionsChartData = (
    distributions: DSplit.SharableDistribution[]
): { inner: Record<string, ChartData>; outer: Record<string, ChartData[]> } => {
    const inner: Record<string, ChartData> = {}
    const outer: Record<string, ChartData[]> = {}

    for (const {
        actorVariant,
        earning: { revenue, balance },
    } of distributions) {
        const key = UnwrapVariant(actorVariant) as keyof typeof DISTRIBUTIONS
        const { hexColor, balanceColor, withdrawalColor } = DISTRIBUTIONS[key]
        const revenueValue = e8s.toNumber(revenue)
        const balanceValue = e8s.toNumber(balance)
        const withdrawalValue = e8s.toNumber(e8s.sub(revenue, balance))

        inner[key] = { label: `${key} Revenue`, value: revenueValue, color: hexColor }
        outer[key] = [
            { label: `${key} Balance`, value: balanceValue, color: balanceColor },
            { label: `${key} Withdrawal`, value: withdrawalValue, color: withdrawalColor },
        ]
    }

    return { inner, outer }
}
