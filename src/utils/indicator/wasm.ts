import { MAX_NAT8 } from 'shared/constants'
import { DIndicator } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

const _patchIncrement = (version: [number, number, number]): [number, number, number] => {
    const [major, minor, patch] = version
    switch (patch === MAX_NAT8) {
        case true:
            switch (minor === MAX_NAT8) {
                case true:
                    return [major + 1, 0, 0]
                case false:
                    return [major, minor + 1, 0]
            }
            break
        case false:
            return [major, minor, patch + 1]
    }
}
const _minorIncrement = (version: [number, number, number]): [number, number, number] => {
    const [major, minor] = version
    switch (minor === MAX_NAT8) {
        case true:
            return [major + 1, 0, 0]
        case false:
            return [major, minor + 1, 0]
    }
}
const _majorIncrement = (version: [number, number, number]): [number, number, number] => {
    const [major, ,] = version
    return [major + 1, 0, 0]
}

export const increaseVersion = (
    version: [number, number, number],
    updateLevel: DIndicator.UpdateLevel
): [number, number, number] => {
    switch (UnwrapVariant(updateLevel)) {
        case 'Major':
            return _majorIncrement(version)
        case 'Minor':
            return _minorIncrement(version)
        case 'Patch':
            return _patchIncrement(version)
    }
}
