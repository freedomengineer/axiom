import { DefaultVariant, Primitive, isNullish, parsePrimitive } from 'shared/utils/typings'

export const build = (
    segments: (string | number | bigint)[],
    params?: { [key: string]: string | number | bigint | undefined | null },
    fullPath: boolean = false
): string => {
    let url = (fullPath ? window.location.origin : '') + '/' + segments.join('/')
    if (params) {
        url += '?'
        for (const [key, value] of Object.entries(params)) {
            if (!isNullish(value)) {
                url += `${key}=${value}&`
            }
        }
        url = url.slice(0, -1)
    }
    return url
}

export const buildIcDashboard = (canisterId: string): string => {
    return `https://dashboard.internetcomputer.org/canister/${canisterId}`
}

export const buildBlobImage = (blob: Uint8Array): string => {
    const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'image/webp' }))
    return blobUrl
}

export const updateUrl = (newKey: string, newValue: string | number): string => {
    const url = new URL(window.location.href)
    const params = url.searchParams
    params.set(newKey, newValue.toString())
    return `${url.pathname}?${params.toString()}`
}

export const parseFilter = <T>(
    defaultObj: {
        [P in keyof T]: Primitive | (T[P] extends object ? Array<DText> : never)
    },
    url: URLSearchParams
): T => {
    const obj = {} as T
    for (const [key, value] of Object.entries(defaultObj) as any) {
        obj[key as keyof T] = parsePrimitive(value, url.get(key)) as any
    }
    return obj
}
export const parseSort = <T>(
    defaultObj: { [P in keyof T]: Array<DText> },
    url: URLSearchParams
): T => {
    const obj = {} as T
    for (const [key, value] of Object.entries(defaultObj) as any) {
        obj[key as keyof T] = DefaultVariant(value, url.get(key)) as any
    }
    return obj
}
