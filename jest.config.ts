import type { Config } from 'jest'

const config: Config = {
    clearMocks: true,
    collectCoverage: false,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    resolver: 'jest-ts-webcompat-resolver',
}

export default config
