import { readFileSync } from 'fs'
import { join, parse } from 'path'

import {
    EntryType,
    EnumEntry,
    ExternalType,
    FunctionFlag,
    ModuleCategory,
    ModuleName,
    NilType,
    ObjectEntry,
    PRIMITIVE_TYPES,
    ParsedFunction,
    ParsedImport,
    ParsedType,
    PrimitiveType,
    SingularType,
    TupleEntry,
} from './common'
import { IMPORT_REGEX, firstLevelSplit } from './libs'
import {
    entryParsedType,
    matchGenericTypeDefinition,
    matchTypeDefinition,
    superType,
} from './types'

export const parseType = (origin: string): ParsedType => {
    if (origin === '()' || !origin) {
        return {
            origin: '()',
            singular: { name: '()' } as NilType,
            entries: [],
            isArray: false,
            isOptional: false,
            isAsync: false,
        }
    }

    let isAsync: boolean = false
    let isOptional: boolean = false
    let isArray: boolean = false
    let hasEntries: [string | null, string | null][] = []

    let str = origin

    if (str.startsWith('async ')) {
        isAsync = true
        str = str.slice(6).trim()
    }
    if (str.startsWith('?')) {
        isOptional = true
        str = str.slice(1).trim()
    }
    if (str.startsWith('[')) {
        isArray = true
        str = str.slice(1, -1).trim()
    }
    if (str.startsWith('(')) {
        const tuples = firstLevelSplit(str.slice(1, -1), ',')
        hasEntries = tuples.map((part) => [null, part])
        str = '()'
    }
    if (str.startsWith('{')) {
        if (str.includes(':')) {
            hasEntries = firstLevelSplit(str.slice(1, -1), ';').map(
                (part) => firstLevelSplit(part, ':') as [string | null, string]
            )
        } else {
            hasEntries = firstLevelSplit(str.slice(1, -1), ';').map((part) => [part, null])
        }
        str = '()'
    }
    if (str.includes('<')) {
        const start = str.indexOf('<')
        const end = str.lastIndexOf('>')
        const generics = firstLevelSplit(str.slice(start + 1, end), ',')
        hasEntries = generics.map((part) => [null, part])
        str = str.slice(0, start).trim()
    }

    const entries: EntryType[] = hasEntries.map(([key, value]) =>
        key !== null
            ? value !== null
                ? ([key, parseType(value)] as ObjectEntry)
                : ([key, null] as EnumEntry)
            : value !== null
              ? ([null, parseType(value)] as TupleEntry)
              : ([] as never)
    )
    const names: string[] = str === '()' || str === '' ? [] : str.split('.')

    let singular: SingularType

    if (names.length === 0) singular = { name: '()' } as NilType
    else if (names.length === 1) singular = { name: names[0] } as PrimitiveType
    else singular = { name: names.at(-1), parent: names[0] } as ExternalType

    return { origin, singular, entries, isArray, isArray, isOptional, isAsync }
}

export const parseFunction = ([, flagStr, name, argStr, returnStr]: string[]): ParsedFunction => {
    const flag: FunctionFlag = {
        isQuery: flagStr.includes('query'),
        callerRequired: flagStr.includes('caller'),
    }

    const argPairs: string[] = firstLevelSplit(argStr, ',').filter((arg) => arg)
    const argTypes: Record<string, ParsedType> = Object.fromEntries(
        argPairs.map((argPair) => {
            const [name, type] = firstLevelSplit(argPair, ':')
            return [name, parseType(type)]
        })
    )

    const returnType = parseType(returnStr)

    return { name, flag, argTypes, returnType }
}

export const parseInterfaceDependencies = (parsedFunctions: ParsedFunction[]): Set<ModuleName> => {
    const parsedTypes: ParsedType[] = []

    const traverseParsedType = (parsedType: ParsedType) => {
        parsedTypes.push(parsedType)
        parsedType.entries
            .map(entryParsedType)
            .filter((type) => type !== null)
            .forEach(traverseParsedType)

        if (parsedType.isArray) {
            traverseParsedType({ ...parsedType, isArray: false })
        }
    }

    parsedFunctions.forEach((func) => {
        Object.values(func.argTypes).forEach(traverseParsedType)
        traverseParsedType(func.returnType)
    })

    const moduleNames: ModuleName[] = parsedTypes
        .map((parsedType) => parsedType.singular)
        .filter((singular) => (singular as ExternalType).parent !== undefined)
        .map((singular) => (singular as ExternalType).parent)

    return new Set(moduleNames)
}

export const parseImport = ([origin, name, relativePath]: string[]): [ModuleName, ParsedImport] => {
    let category: ModuleCategory = 'attribute'
    if (relativePath.includes('library/')) category = 'library'
    if (relativePath.includes('common/')) category = 'common'
    if (relativePath.includes('mo:base/')) category = 'base'
    if (relativePath.includes('/Interface')) category = 'interface'
    const depth = relativePath.split('/').length
    return [name, { origin, name, category, relativePath, depth }]
}

export const sortImports = (imports: Set<ParsedImport>): string[] => {
    const categoryOrder: ModuleCategory[] = ['attribute', 'interface', 'common', 'library', 'base']
    const sorted = Array.from(imports).sort((a, b) => {
        if (a.category !== b.category) {
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
        }
        if (a.depth !== b.depth) {
            return a.depth - b.depth
        }
        if (a.relativePath !== b.relativePath) {
            return a.relativePath.localeCompare(b.relativePath)
        }
        return a.name.localeCompare(b.name)
    })

    return sorted.map((imp) => imp.origin)
}

export const resolveExternalType = (
    parsedType: ParsedType,
    fileDir: string,
    imports: Record<ModuleName, ParsedImport>
): ParsedType => {
    const category = superType(parsedType)

    if (category === 'nil' || PRIMITIVE_TYPES.includes(parsedType.singular.name)) return parsedType

    if (category === 'value') {
        if ('parent' in parsedType.singular) {
            const module: ParsedImport = imports[(parsedType.singular as ExternalType).parent]
            const parentFileDir: string = join(fileDir, '..', `${module.relativePath}.mo`)
            const content: string = readFileSync(parentFileDir, 'utf-8')

            const { singular, entries, isArray } = parseType(
                matchTypeDefinition(content, parsedType.singular.name)
            )
            const newImports = Object.fromEntries(
                [...content.matchAll(IMPORT_REGEX)].map((match) => parseImport(match))
            )
            return resolveExternalType(
                { ...parsedType, singular, entries, isArray: isArray || parsedType.isArray },
                join(parentFileDir),
                newImports
            )
        } else {
            const content: string = readFileSync(fileDir, 'utf-8')
            const { singular, entries, isArray } = parseType(
                matchTypeDefinition(content, parsedType.singular.name)
            )
            return resolveExternalType(
                { ...parsedType, singular, entries, isArray: isArray || parsedType.isArray },
                fileDir,
                imports
            )
        }
    }

    if (category === 'enum' || category === 'object' || category === 'tuple') {
        const newEntries = parsedType.entries.map(([key, value]) => {
            if (value === null) return [key, null] as EnumEntry

            const newParsedType = resolveExternalType(value, fileDir, imports)
            return [key, newParsedType] as ObjectEntry
        })

        return { ...parsedType, entries: newEntries }
    }

    if (category === 'generic') {
        if ('parent' in parsedType.singular) {
            const module: ParsedImport = imports[(parsedType.singular as ExternalType).parent]
            const parentFileDir: string = join(fileDir, '..', `${module.relativePath}.mo`)
            const content: string = readFileSync(parentFileDir, 'utf-8')

            const newEntries = parsedType.entries.map(([key, value]) => {
                if (value === null) return [key, null] as EnumEntry
                const newParsedType = resolveExternalType(value, fileDir, imports)
                return [key, newParsedType] as ObjectEntry
            })
            const [matched, generics] = matchGenericTypeDefinition(
                content,
                parsedType.singular.name
            )
            const newParsedType = { ...parseType(matched), singular: { name: '()' } as NilType }

            generics.forEach((generic, index) => {
                const entryIndexes = newParsedType.entries.reduce((indexes, item, i) => {
                    if (item[1]?.singular.name === generic) {
                        indexes.push(i)
                    }
                    return indexes
                }, [])

                entryIndexes.forEach((entryIndex) => {
                    const { singular, entries, isArray }: ParsedType = newEntries[
                        index
                    ][1] as ParsedType
                    const oldParsedType = newParsedType.entries[entryIndex][1] as ParsedType
                    newParsedType.entries[entryIndex][1] = {
                        ...oldParsedType,
                        singular,
                        entries,
                        isArray: isArray || parsedType.isArray,
                    }
                })
            })
            return resolveExternalType(newParsedType, parentFileDir, imports)
        }

        const content: string = readFileSync(fileDir, 'utf-8')

        const newEntries = parsedType.entries.map(([key, value]) => {
            if (value === null) return [key, null] as EnumEntry
            const newParsedType = resolveExternalType(value, fileDir, imports)
            return [key, newParsedType] as ObjectEntry
        })

        const [matched, generics] = matchGenericTypeDefinition(content, parsedType.singular.name)
        const newParsedType = { ...parseType(matched), singular: { name: '()' } as NilType }
        generics.forEach((generic, index) => {
            const entryIndexes = newParsedType.entries.reduce((indexes, item, i) => {
                if (item[1]?.singular.name === generic) {
                    indexes.push(i)
                }
                return indexes
            }, [])

            entryIndexes.forEach((entryIndex) => {
                newParsedType.entries[entryIndex][1] = newEntries[index][1]
            })
        })
        return resolveExternalType(newParsedType, fileDir, imports)
    }
}
