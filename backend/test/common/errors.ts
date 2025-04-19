export const NOT_TOBE = (x: string) => `The caller must be a ${x} to perform this action`

export const NOT_AVAILABLE = (x: string) =>
    `The provided ${x} is not available to perform this action`

export const NOT_VALID = (x: string) => `The provided ${x} is not in a valid format`

export const NOT_EXISTED = (x: string) => `The provided ${x} does not exist`

export const ALREADY_EXISTED = (x: string) => `The provided ${x} has already existed`

export const NOT_POSSIBLE = (x: string) => `It is not possible to perform this action on ${x}`

export const RESTRICTED = (x: string) => `This action requires ${x} to be turned on`

export const NOT_REACHED = (x: string) => `The ${x} has not been reached`

export const INTERNAL_FAILURE = (x: string) => `The action internally failed due to ${x}`

export const EXTERNAL_FAILURE = (x: string) => `The action externally failed when performing ${x}`
