import { execSync } from 'child_process'

import { Identity } from '@dfinity/agent'
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { Principal } from '@dfinity/principal'
import { arrayOfNumberToUint8Array, asciiStringToByteArray, bigEndianCrc32 } from '@dfinity/utils'
import { sha224 } from '@noble/hashes/sha256'
import pemfile from 'pem-file'

export const deriveIdentifier = (principal: Principal): Uint8Array => {
    // Hash (sha224) the principal, the subAccount and some padding
    const padding = asciiStringToByteArray('\x0Aaccount-id')

    const shaObj = sha224.create()
    shaObj.update(arrayOfNumberToUint8Array([...padding, ...principal.toUint8Array()]))
    const hash = shaObj.digest()

    // Prepend the checksum of the hash and convert to a hex string
    const checksum = bigEndianCrc32(hash)
    return new Uint8Array([...checksum, ...hash])
}

export const deriveCurrentIdentity = (): Identity => {
    const agentName = execSync('dfx identity whoami', { stdio: [] }).toString().trim()

    const pem = execSync(`dfx identity export ${agentName}`, { stdio: [] }).toString().trim()
    const buf: Buffer = pemfile.decode(pem)

    if (buf.length != 118) {
        throw 'expecting byte length 118 but got ' + buf.length
    }
    return Secp256k1KeyIdentity.fromSecretKey(buf.subarray(7, 39)) as Identity
}

export const generateNewIdentity = (): Identity => {
    return Secp256k1KeyIdentity.generate() as Identity
}
