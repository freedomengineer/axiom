import { VoteColorType } from '@hooks/useVoteColors'

export const getVoteColorClass = (
    type: VoteColorType,
    style: 'button' | 'text' | 'border' | 'fill' | 'bg'
) => {
    return `vote-${style}-${type}`
}

export const getVoteColorStyles = (type: VoteColorType, customColor?: string) => {
    if (customColor) {
        return {
            backgroundColor: customColor,
            borderColor: customColor,
            color: 'white',
        }
    }

    // Fallback to CSS classes if no custom color is provided
    return {}
}

export const getVoteTextColor = (type: VoteColorType, customColor?: string) => {
    if (customColor) {
        return { color: customColor }
    }
    return {}
}

export const getVoteBorderColor = (type: VoteColorType, customColor?: string) => {
    if (customColor) {
        return { borderColor: customColor }
    }
    return {}
}

export const getVoteBackgroundColor = (type: VoteColorType, customColor?: string) => {
    if (customColor) {
        return { backgroundColor: customColor }
    }
    return {}
}

export const mapVoteTypeFromString = (voteString: string): VoteColorType => {
    switch (voteString.toLowerCase()) {
        case 'positive':
        case 'accept':
        case 'true':
        case 'up':
            return 'positive'
        case 'negative':
        case 'reject':
        case 'false':
        case 'down':
            return 'negative'
        case 'neutral':
        case "don't know":
        case 'dontknow':
            return 'neutral'
        case 'delegated':
        case 'delegate':
            return 'delegated'
        default:
            return 'positive' // Default fallback
    }
}
