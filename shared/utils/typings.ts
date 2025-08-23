import { Principal } from '@dfinity/principal'

export const isNullish = <T>(value: Nullish<T>): value is null | undefined => {
    return value === null || value === undefined
}

export const Wrap = <T>(value?: Opt<T>): Wrap<T> => {
    return value !== null && value !== undefined ? [value] : []
}
export const Unwrap = <T>(value: Wrap<T>): Opt<T> => {
    return value[0] !== undefined ? value[0] : null
}
export const isNil = <T>(value: Wrap<T>): boolean => {
    return value.length === 0
}

export const Variant = <K extends string, T = null>(
    name: K,
    value?: T
): { [P in K]: T extends undefined ? null : T } => {
    return (value === undefined ? { [name]: null } : { [name]: value }) as any
}

export const UnwrapVariant = <V>(value: V): UnwrapDVariant<V> => {
    if (value === undefined || value === null) return null as any
    const [key, val] = Object.entries(value as any)[0]
    return val !== null ? ([key, val] as any) : key
}

export const DefaultVariant = (defaults: DText[], value: Opt<DText>): { [P in DText]: null } => {
    return value && defaults.includes(value) ? { [value]: null } : { [defaults[0]]: null }
}

export const PrincipalOpt = (value?: Opt<DText>): Opt<DPrincipal> => {
    try {
        return Principal.fromText(value!)
    } catch {
        return null
    }
}
export const NatOpt = (value?: Opt<DText>): Opt<DNat> => {
    try {
        return BigInt(value!)
    } catch {
        return null
    }
}
export const TextOpt = (value?: Opt<DText>): Opt<DText> => {
    return value ?? null
}

export const parsePrincipal = (value: Opt<DText>): Wrap<Principal> => {
    return Wrap(PrincipalOpt(value))
}
export const parseNat = (value: Opt<DText>): Wrap<DNat> => {
    return Wrap(NatOpt(value))
}
export const parseText = (value: Opt<DText>): Wrap<DText> => {
    return Wrap(value)
}

export const onParseVariant =
    <T extends { [K in string]: null }>(available: readonly (T extends T ? keyof T : never)[]) =>
    (value: Opt<T extends T ? keyof T : never>): Wrap<T> => {
        if (!value || !available.includes(value)) {
            return []
        }
        return [{ [value]: null } as T]
    }

export enum Primitive {
    Text,
    Principal,
    Nat,
    Boolean,
}
export const parsePrimitive = <T>(type: Primitive | Array<DText>, value: Opt<DText>): Wrap<T> => {
    switch (type) {
        case Primitive.Text:
            return parseText(value) as Wrap<T>
        case Primitive.Principal:
            return parsePrincipal(value) as Wrap<T>
        case Primitive.Nat:
            return parseNat(value) as Wrap<T>
        case Primitive.Boolean:
            return Wrap(value === 'true' ? true : value === 'false' ? false : null) as Wrap<T>
        default:
            return onParseVariant(type as any)(value) as Wrap<T>
    }
}

export const principalsEqual = (a: Principal, b: Principal) => {
    return a.compareTo(b) === 'eq'
}

export const pseudoPrincipalsEqual = (a: any, b: any) => {
    return Principal.fromUint8Array(a._arr).compareTo(Principal.fromUint8Array(b._arr)) === 'eq'
}

export const pseudoPrincipalEqual = (a: Principal, b: any) => {
    return Principal.fromUint8Array(b._arr).compareTo(a) === 'eq'
}

export const pseudoPrincipalDisplay = (principal: any): string => {
    return Principal.fromUint8Array(principal._arr).toText()
}
