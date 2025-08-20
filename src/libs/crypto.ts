import { sha256 as sha256Lib } from '@noble/hashes/sha256'

export const sha256 = (str: string): string => {
    return sha256Lib.create().update(str).digest().toString()
}
