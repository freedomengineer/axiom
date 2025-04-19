import VoteDownIcon from '@components/Assets/vote_down.svg'
import VoteUpIcon from '@components/Assets/vote_up.svg'

export enum EVote {
    Positive = 'Positive',
    Negative = 'Negative',
}

export const VOTES = {
    [EVote.Positive]: {
        hexColor: '#EE8562',
        bgColor: 'bg-primary-400',
        textColor: 'text-primary-400',
        borderColor: 'border-primary-400',
        fillColor: 'fill-primary-400',
        Icon: VoteUpIcon,
    },
    [EVote.Negative]: {
        hexColor: '#8F2F0F',
        bgColor: 'bg-primary-800',
        textColor: 'text-primary-800',
        borderColor: 'border-primary-800',
        fillColor: 'fill-primary-800',
        Icon: VoteDownIcon,
    },
}
