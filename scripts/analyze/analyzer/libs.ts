import { CLOSE_BRACKETS, OPEN_BRACKETS } from './common'

export const FUNCTION_REGEX: RegExp =
    /public (shared(?: \(\{.*?\}\))?|query(?: \(\{.*?\}\))?) func (\w+) ?\((.*?)\) ?: ?(.*?) {/gs
export const IMPORT_REGEX: RegExp = /import (\w+) "(.*)";/g

export const firstLevelSplit = (input: string, delimiter: string): string[] => {
    const result: string[] = []
    let currentSegment = ''
    let depth = 0

    for (let i = 0; i < input.length; i++) {
        const char = input[i]

        if (OPEN_BRACKETS.includes(char)) depth++
        else if (CLOSE_BRACKETS.includes(char)) depth--

        if (char === delimiter && depth === 0) {
            result.push(currentSegment.trim())
            currentSegment = ''
        } else {
            currentSegment += char
        }
    }

    if (currentSegment.trim()) {
        result.push(currentSegment.trim())
    }

    return result
}
