import { format } from 'timeago.js'

import siteMetadata from '@data/siteMetadata.json'
import { NANO_TO_MILLI } from 'shared/constants'
import { UnwrapVariant } from 'shared/utils/typings'

export const getCanisterDate = (
    options?:
        | DVariant<'ago', DVariant<'nano', bigint> | DVariant<'milli', number>>
        | DVariant<'ahead', DVariant<'nano', bigint> | DVariant<'milli', number>>,
    relative?: boolean
) => {
    let diff = 0

    const parsedOption = UnwrapVariant(options)

    if (parsedOption) {
        const [diffType, diffValue] = UnwrapVariant(parsedOption[1])
        const diffInMilli = diffType === 'nano' ? Number(diffValue / NANO_TO_MILLI) : diffValue
        diff = parsedOption[0] === 'ago' ? -diffInMilli : diffInMilli
    }
    if (relative) {
        return format(Date.now() + diff, 'en-GB')
    }
    return new Date(Date.now() + diff).toLocaleDateString('en-GB', {
        timeZone: 'UTC',
        hour12: false,
    })
}

export const formatDate = (
    timestamp: DVariant<'nano', bigint> | DVariant<'milli', number>,
    relative: boolean = false
) => {
    const [dateType, dateValue] = UnwrapVariant(timestamp)
    const milliseconds = dateType === 'nano' ? Number(dateValue / NANO_TO_MILLI) : dateValue
    if (relative) {
        return format(milliseconds, siteMetadata.locale)
    }
    return new Date(milliseconds).toLocaleDateString(siteMetadata.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
export const formatCanisterDate = (
    timestamp: DVariant<'nano', bigint> | DVariant<'milli', number>,
    relative: boolean = false
) => {
    const [dateType, dateValue] = UnwrapVariant(timestamp)
    const milliseconds = dateType === 'nano' ? Number(dateValue / NANO_TO_MILLI) : dateValue
    if (relative) {
        return format(milliseconds, 'en-GB')
    }
    return new Date(milliseconds).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export const formatDateTime = (
    timestamp: DVariant<'nano', bigint> | DVariant<'milli', number>,
    seconds = false
) => {
    const [dateType, dateValue] = UnwrapVariant(timestamp)
    const milliseconds = dateType === 'nano' ? Number(dateValue / NANO_TO_MILLI) : dateValue
    return new Date(milliseconds).toLocaleString(siteMetadata.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: seconds ? 'numeric' : undefined,
    })
}
export const formatCanisterDateTime = (
    timestamp: DVariant<'nano', bigint> | DVariant<'milli', number>,
    seconds = false
) => {
    const [dateType, dateValue] = UnwrapVariant(timestamp)
    const milliseconds = dateType === 'nano' ? Number(dateValue / NANO_TO_MILLI) : dateValue
    return new Date(milliseconds).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: seconds ? 'numeric' : undefined,
    })
}

export const getDateTime = (timestamp: DVariant<'nano', bigint> | DVariant<'milli', number>) => {
    const [dateType, dateValue] = UnwrapVariant(timestamp)
    const milliseconds = dateType === 'nano' ? Number(dateValue / NANO_TO_MILLI) : dateValue
    const date = new Date(milliseconds)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const sec = String(date.getSeconds()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`
}
export const getCanisterDateTime = (
    timestamp: DVariant<'nano', bigint> | DVariant<'milli', number>
) => {
    const [dateType, dateValue] = UnwrapVariant(timestamp)
    const milliseconds = dateType === 'nano' ? Number(dateValue / NANO_TO_MILLI) : dateValue
    const date = new Date(milliseconds)
    const yyyy = date.getUTCFullYear()
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const hh = String(date.getUTCHours()).padStart(2, '0')
    const min = String(date.getUTCMinutes()).padStart(2, '0')
    const sec = String(date.getUTCSeconds()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`
}

export const formatTime = (
    duration: DVariant<'nano', bigint> | DVariant<'milli', number>,
    hrs = true,
    mins = false,
    secs = false
) => {
    const [dateType, dateValue] = UnwrapVariant(duration)
    const seconds = (dateType === 'nano' ? Number(dateValue / NANO_TO_MILLI) : dateValue) / 1000

    let h = Math.floor(seconds / 3600)
    const remainingMilliseconds = seconds % 3600

    let m = Math.floor(remainingMilliseconds / 60)
    let s = Math.floor(remainingMilliseconds % 60)

    h = h < 10 ? 0 + h : h
    m = m < 10 ? 0 + m : m
    s = s < 10 ? 0 + s : s

    return `${hrs ? h + ' hrs' : ''} ${mins ? m + ' mins' : ''} ${secs ? s + ' seconds' : ''}`.trim()
}

export const parseMonth = (timestamp) => {
    const date = new Date(timestamp)
    return new Date(date).toLocaleString(siteMetadata.locale, { month: 'long' })
}

export const getDateFromDayOrder = (dayOrder) => {
    const date = new Date()
    date.setDate(date.getDate() - dayOrder)
    return date
}

export const convertDate = (timestamp: DVariant<'nano', bigint> | DVariant<'milli', number>) => {
    const [dateType, dateValue] = UnwrapVariant(timestamp)
    const date = new Date(dateType === 'nano' ? Number(dateValue / NANO_TO_MILLI) : dateValue)
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
}
