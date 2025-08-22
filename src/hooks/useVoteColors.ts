import { useEffect } from 'react'

import useLocalStorage from '@hooks/useLocalStorage'

export type VoteColorType = 'positive' | 'negative' | 'neutral' | 'delegated'

export interface VoteColors {
    positive: string
    negative: string
    neutral: string
    delegated: string
}

export const DEFAULT_VOTE_COLORS: VoteColors = {
    positive: '#EE8562',
    negative: '#8F2F0F',
    neutral: '#DD4917',
    delegated: '#4C6D7B',
}

const useVoteColors = () => {
    const [colors, setColors] = useLocalStorage('voteColors')

    const updateColor = (type: VoteColorType, color: string) => {
        const newColors = { ...colors, [type]: color }
        setColors(newColors)
    }

    const restoreDefaults = () => {
        setColors(DEFAULT_VOTE_COLORS)
    }

    const restoreColor = (type: VoteColorType) => {
        const newColors = { ...colors, [type]: DEFAULT_VOTE_COLORS[type] }
        setColors(newColors)
    }

    const isCustomized = () => {
        return JSON.stringify(colors) !== JSON.stringify(DEFAULT_VOTE_COLORS)
    }

    const isColorCustomized = (type: VoteColorType) => {
        return colors[type] !== DEFAULT_VOTE_COLORS[type]
    }

    // Create CSS variables for dynamic styling - use committed colors only
    useEffect(() => {
        const root = document.documentElement
        root.style.setProperty('--vote-positive', colors.positive)
        root.style.setProperty('--vote-negative', colors.negative)
        root.style.setProperty('--vote-neutral', colors.neutral)
        root.style.setProperty('--vote-delegated', colors.delegated)
    }, [colors])

    return {
        colors,
        updateColor,
        restoreDefaults,
        restoreColor,
        isCustomized: isCustomized(),
        isColorCustomized,
        DEFAULT_VOTE_COLORS,
    }
}

export default useVoteColors
