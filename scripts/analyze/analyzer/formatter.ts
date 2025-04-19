import { ParsedType } from './common'
import { superType } from './types'

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const codeInline = (str: string): string => {
    return `\`${str}\``
}

export const pluralize = (word: string): string => {
    if (/s$|x$|z$|ch$|sh$/i.test(word)) {
        return word + 'es'
    }
    if (/[^aeiou]y$/i.test(word)) {
        return word.replace(/y$/, 'ies')
    }
    if (/f$|fe$/i.test(word)) {
        return word.replace(/f$|fe$/, 'ves')
    }
    return word + 's'
}

export const arrayWrapper = (type: string, condition: boolean): string =>
    condition ? `[${type}]` : type

export const displayType = (parsedType: ParsedType): string => {
    const category = superType(parsedType)

    switch (category) {
        case 'nil':
            return arrayWrapper(`null`, parsedType.isArray)

        case 'tuple':
            const tupleEntries = parsedType.entries.map((entry) => displayType(entry[1])).join(', ')
            return arrayWrapper(`[${tupleEntries}]`, parsedType.isArray)

        case 'object':
            const objectEntries = parsedType.entries
                .map((entry) => `\"${entry[0]}\": ${displayType(entry[1])}`)
                .join(', ')
            return arrayWrapper(`{${objectEntries}}`, parsedType.isArray)

        case 'enum':
            const pureEnum = parsedType.entries.every((entry) => entry[1] === null)
            if (pureEnum) {
                return arrayWrapper(
                    `\"${parsedType.entries
                        .map((entry) => `${entry[0]?.toUpperCase()}`)
                        .join(' | ')}\"`,
                    parsedType.isArray
                )
            } else {
                const enumEntries = parsedType.entries
                    .map((entry) => `\"${entry[0]?.toUpperCase()}\": ${displayType(entry[1])}`)
                    .join(', ')
                return arrayWrapper(`{${enumEntries}}`, parsedType.isArray)
            }

        case 'generic':
            const genericsEntries = parsedType.entries
                .map((entry) => `${entry[0]}: ${displayType(entry[1])}`)
                .join(', ')
            return arrayWrapper(`\"Generic of {${genericsEntries}}\"`, parsedType.isArray)

        case 'value':
            return arrayWrapper(`\"${parsedType.singular.name}\"`, parsedType.isArray)

        default:
            return JSON.stringify(parsedType, null, 2)
    }
}

const _formatObject = (obj, maxLineLength, indentLevel = 0) => {
    const indent = ' '.repeat(indentLevel * 2)
    let result = ''

    if (Array.isArray(obj)) {
        const items = obj.map((item) => _formatObject(item, maxLineLength, indentLevel + 1))
        const singleLine = `[${items.join(', ')}]`

        if (singleLine.length + indent.length <= maxLineLength) {
            result += singleLine
        } else {
            result += '[\n' + items.map((item) => `${indent}  ${item}`).join(',\n') + `\n${indent}]`
        }
    } else if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj).map(([key, value]) => {
            const formattedValue = _formatObject(value, maxLineLength, indentLevel + 1)
            return `${JSON.stringify(key)}: ${formattedValue}`
        })

        const singleLine = `{${entries.join(', ')}}`

        if (singleLine.length + indent.length <= maxLineLength) {
            result += singleLine
        } else {
            result +=
                '{\n' + entries.map((entry) => `${indent}  ${entry}`).join(',\n') + `\n${indent}}`
        }
    } else {
        result += JSON.stringify(obj)
    }

    return result
}

export const formatJsonString = (jsonString, maxLineLength = 120): string => {
    const json = JSON.parse(jsonString)
    return _formatObject(json, maxLineLength)
}
