import { sha256 as sha256Lib } from '@noble/hashes/sha256'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

export const toBytes = (str: string): Uint8Array => {
    return hexToBytes(str)
}

export const toHex = (bytes: Uint8Array): string => {
    return bytesToHex(bytes)
}

export const sha256 = (str: string): string => {
    return bytesToHex(sha256Lib(hexToBytes(str)))
}
