import { EntryType, ModuleName, PRIMITIVE_TYPES, ParsedType, SuperTypeCategory } from './common'

export const isNilSoft = ({ singular }: ParsedType): boolean => singular.name === '()'
export const isNilHard = ({ singular, entries }: ParsedType): boolean =>
    singular.name === '()' && entries.length === 0
export const isTuple = ({ singular, entries }: ParsedType): boolean =>
    singular.name === '()' && entries.length > 0 && entries[0][0] === null
export const isEnum = ({ singular, entries }: ParsedType): boolean =>
    singular.name === '()' &&
    entries.length > 0 &&
    entries[0][0] !== null &&
    entries[0][0][0] === '#'
export const isObject = ({ singular, entries }: ParsedType): boolean =>
    singular.name === '()' &&
    entries.length > 0 &&
    entries[0][0] !== null &&
    entries[0][0][0] !== '#'
export const isGeneric = ({ singular, entries }: ParsedType): boolean =>
    singular.name !== '()' && entries.length > 0

export const isSimplified = ({ singular, origin, entries }: ParsedType): boolean | undefined => {
    const isNil: boolean = singular.name === '()'
    const isInterface: boolean = origin.includes('Interface.')
    const isPrimitive: boolean = PRIMITIVE_TYPES.includes(singular.name)
    const isExternal: boolean = 'parent' in singular
    const hasEntries: boolean = entries.length > 0

    if (isInterface || isPrimitive) return true
    if (isExternal) return false
    if (isNil && !hasEntries) return true
    if (isNil && hasEntries) return false
}

export const superType = ({ singular, entries }: ParsedType): SuperTypeCategory => {
    const isNil: boolean = singular.name === '()'
    const hasEntries: boolean = entries.length > 0

    if (isNil)
        if (hasEntries)
            if (entries[0][0] === null) return 'tuple'
            else if (entries[0][0][0] === '#') return 'enum'
            else return 'object'
        else return 'nil'
    else if (hasEntries) return 'generic'
    else return 'value'
}

export const entryParsedType = ([key, value]: EntryType): ParsedType | null => {
    if (key === null) if (value === null) return null
    if (value === null) return null
    if (typeof key === 'string') return null
    return value as ParsedType
}
export const entriesParsedType = (entries: EntryType[]): ParsedType[] =>
    entries.map(entryParsedType).filter((entry): entry is ParsedType => entry !== null)

export const matchTypeDefinition = (content: string, name: ModuleName): string => {
    /// HARD-CODED
    if (name === 'Choice or { #Delegated : Principal }') name = 'Choice'

    const regex = new RegExp(`type ${name} =\\s*`)
    const match: any = regex.exec(content)

    const startIndex = match.index + match[0].length

    if (content[startIndex] === '{') {
        let openBraces = 1
        let endIndex = startIndex + 1

        while (openBraces > 0 && endIndex < content.length) {
            if (content[endIndex] === '{') openBraces++
            else if (content[endIndex] === '}') openBraces--
            endIndex++
        }

        return content.slice(match.index + match[0].length, endIndex)
    } else {
        const endIndex = content.indexOf(';', startIndex)
        return content.slice(match.index + match[0].length, endIndex)
    }
}

export const matchGenericTypeDefinition = (
    content: string,
    name: ModuleName
): [string, string[]] => {
    const regex = new RegExp(`type ${name}<(.+)> =\\s*`)
    const match: any = regex.exec(content)

    const startIndex = match.index + match[0].length

    if (content[startIndex] === '{') {
        let openBraces = 1
        let endIndex = startIndex + 1

        while (openBraces > 0 && endIndex < content.length) {
            if (content[endIndex] === '{') openBraces++
            else if (content[endIndex] === '}') openBraces--
            endIndex++
        }

        return [content.slice(match.index + match[0].length, endIndex), match[1].split(',')]
    } else {
        const endIndex = content.indexOf(';', startIndex)
        return [content.slice(match.index + match[0].length, endIndex), match[1].split(',')]
    }
}
