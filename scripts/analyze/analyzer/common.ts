import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

export const CURRENT_DIR = dirname(fileURLToPath(import.meta.url))
export const CANISTER_DIR = join(CURRENT_DIR, '..', '..', '..', 'backend', 'canisters')
export const CANISTER_PROD_DIR = join(CURRENT_DIR, '..', '..', '..', 'backend_prod', 'canisters')

export type CommonModuleName = string
export type AttributeModuleName = string
export type LibraryModuleName = string
export type BaseModuleName = string
export type ModuleName = CommonModuleName | AttributeModuleName | LibraryModuleName | BaseModuleName

export type TypeName = string
export type Path = string

export type PrimitiveType = {
    name: TypeName
}
export type ExternalType = {
    name: TypeName
    parent: ModuleName
}
export type NilType = {
    name: '()'
}
export type SingularType = PrimitiveType | ExternalType | NilType
export type EnumEntry = [string, null]
export type ObjectEntry = [string, ParsedType]
export type TupleEntry = [null, ParsedType]
export type EntryType = EnumEntry | ObjectEntry | TupleEntry

export type SuperTypeCategory = 'nil' | 'object' | 'tuple' | 'enum' | 'generic' | 'value'

export type FunctionFlag = {
    isQuery: boolean
    callerRequired: boolean
}
export type ModuleCategory = 'common' | 'attribute' | 'library' | 'base' | 'interface'

export type ParsedType = {
    origin: string
    singular: SingularType
    entries: EntryType[]
    isArray: boolean
    isOptional: boolean
    isAsync: boolean
}
export type ParsedImport = {
    origin: string
    name: ModuleName
    category: ModuleCategory
    relativePath: Path
    depth: number
}
export type ParsedFunction = {
    name: string
    flag: FunctionFlag
    argTypes: Record<string, ParsedType>
    returnType: ParsedType
}

export const PRIMITIVE_TYPES = [
    'Bool',
    'Blob',
    'Char',
    'Text',
    'Int',
    'Int8',
    'Int16',
    'Int32',
    'Int64',
    'Nat',
    'Nat8',
    'Nat16',
    'Nat32',
    'Nat64',
    'Float',
    'Principal',
    'Time',
]
export const OPEN_BRACKETS = ['{', '[', '(', '<']
export const CLOSE_BRACKETS = ['}', ']', ')', '>']
