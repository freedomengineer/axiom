import VoteFalseIcon from '@components/Assets/vote_false.svg'
import VoteNeutralIcon from '@components/Assets/vote_neutral.svg'
import VoteTrueIcon from '@components/Assets/vote_true.svg'

export enum EVote {
    Positive = 'Positive',
    Negative = 'Negative',
    Neutral = 'Neutral',
}

export const VOTES = {
    [EVote.Positive]: {
        name: 'TRUE',
        hexColor: '#EE8562',
        bgColor: 'bg-primary-400',
        fillColor: 'fill-primary-400',
        textColor: 'text-primary-400',
        borderColor: 'border-primary-400',
        Icon: VoteTrueIcon,
    },
    [EVote.Neutral]: {
        name: "DON'T KNOW",
        hexColor: '#DD4917',
        bgColor: 'bg-primary-600',
        fillColor: 'fill-primary-600',
        textColor: 'text-primary-600',
        borderColor: 'border-primary-600',
        Icon: VoteNeutralIcon,
    },
    [EVote.Negative]: {
        name: 'FALSE',
        hexColor: '#8F2F0F',
        bgColor: 'bg-primary-800',
        fillColor: 'fill-primary-800',
        textColor: 'text-primary-800',
        borderColor: 'border-primary-800',
        Icon: VoteFalseIcon,
    },
}
