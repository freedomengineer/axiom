import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs'
import * as path from 'path'

const LOCAL_DIR = './backend/canisters'
const PROD_DIR = './backend_prod/canisters'

if (existsSync(PROD_DIR)) rmSync(PROD_DIR, { recursive: true, force: true })
mkdirSync(PROD_DIR, { recursive: true })

const _processFile = (filePath: string) => {
    const relativePath = path.relative(LOCAL_DIR, filePath)
    const targetPath = path.join(PROD_DIR, relativePath)
    const targetFileDir = path.dirname(targetPath)

    if (!existsSync(targetFileDir)) mkdirSync(targetFileDir, { recursive: true })

    let content = readFileSync(filePath, 'utf8')

    // Replace getNow() function calls with Time.now()
    content = content.replace(/getNow\(\)/g, 'Time.now()')

    // Remove TEMPORARY IMPLEMENTATION blocks - using string search instead of regex
    const startMarker = '////// TEMPORARY IMPLEMENTATION ////////////'
    const endMarker = '////// TEMPORARY IMPLEMENTATION ////////////'

    let startIndex = content.indexOf(startMarker)
    while (startIndex !== -1) {
        const endIndex = content.indexOf(endMarker, startIndex + startMarker.length)
        if (endIndex === -1) break

        let endOfLine = content.indexOf('\n', endIndex + endMarker.length)
        if (endOfLine === -1) endOfLine = content.length

        const nextLineStart = endOfLine + 1
        if (nextLineStart < content.length && content.charAt(nextLineStart) === '\n')
            endOfLine = nextLineStart

        content = content.substring(0, startIndex) + content.substring(endOfLine + 1)
        startIndex = content.indexOf(startMarker)
    }

    // Remove getNow parameter from function signatures - all cases
    content = content.replace(/, getNow\s*:\s*\(\)\s*->\s*Int,\s*/g, ', ')
    content = content.replace(/getNow\s*:\s*\(\)\s*->\s*Int,\s*/g, ', ')
    content = content.replace(/, getNow\s*:\s*\(\)\s*->\s*Int\)/g, ')')
    // Handle the case where getNow is the only parameter in a function signature
    content = content.replace(/\(getNow\s*:\s*\(\)\s*->\s*Int\)/g, '()')

    // Remove getNow when passed as an argument to functions - all cases
    content = content.replace(/,\s*getNow\)/g, ')')
    content = content.replace(/,\s*getNow,\s*/g, ', ')
    content = content.replace(/\(([^,]*),\s*getNow\)/g, '($1)')
    // Handle the case where getNow is the only argument
    content = content.replace(/\(\s*getNow\s*\)/g, '()')

    writeFileSync(targetPath, content)
    console.log(`Migrated ${targetPath}`)
}

const _processDirectory = (dirPath: string) => {
    try {
        const entries = readdirSync(dirPath, { withFileTypes: true })

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name)

            if (entry.isDirectory()) _processDirectory(fullPath)
            else _processFile(fullPath)
        }
    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error)
    }
}

_processDirectory(LOCAL_DIR)
