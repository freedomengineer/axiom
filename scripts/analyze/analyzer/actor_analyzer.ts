import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import {
    CANISTER_DIR,
    CANISTER_PROD_DIR,
    ModuleName,
    ParsedFunction,
    ParsedImport,
    ParsedType,
} from './common'
import { capitalize, codeInline, displayType, formatJsonString, pluralize } from './formatter'
import { FUNCTION_REGEX, IMPORT_REGEX } from './libs'
import {
    parseFunction,
    parseImport,
    parseInterfaceDependencies,
    resolveExternalType,
    sortImports,
} from './parsing'
import { isNilHard, isSimplified } from './types'
import {
    CORE_ACTOR_NAMES_BY_CANISTER,
    INTERNAL_ACTOR_NAMES_BY_CANISTER,
    InternalActorName,
    InternalCanisterName,
} from '../../../backend/test/common/declarations'

export class ActorAnalyzer {
    private readonly canisterName: InternalCanisterName
    private readonly actorName: InternalActorName

    private readonly category: 'core' | 'periphery'
    private readonly folderPath: string
    private readonly apisPath: string
    private readonly analyzedPath: string

    private readonly functions: ParsedFunction[]
    private readonly imports: Record<ModuleName, ParsedImport>

    private readonly actorDependencies: Set<ModuleName>
    private readonly interfaceDependencies: Set<ModuleName>

    private readonly typeDefinitions: Record<ModuleName, ParsedType>

    constructor(environment: 'local' | 'prod', name: InternalCanisterName) {
        const dir = environment === 'local' ? CANISTER_DIR : CANISTER_PROD_DIR

        this.canisterName = name
        this.actorName = INTERNAL_ACTOR_NAMES_BY_CANISTER[name]

        this.category = name in CORE_ACTOR_NAMES_BY_CANISTER ? 'core' : 'periphery'
        this.folderPath = join(dir, this.category, name)
        this.apisPath = join(dir, '..', 'specifications', 'apis', `${name}.md`)
        this.analyzedPath = join(dir, '..', 'specifications', 'analyzed', `${name}.json`)

        const content = readFileSync(join(this.folderPath, 'Main.mo'), 'utf-8')

        this.functions = [...content.matchAll(FUNCTION_REGEX)].map((match) => parseFunction(match))
        this.imports = Object.fromEntries(
            [...content.matchAll(IMPORT_REGEX)].map((match) => parseImport(match))
        )
        this.actorDependencies = new Set(Object.keys(this.imports))
        this.interfaceDependencies = parseInterfaceDependencies(this.functions)

        this.typeDefinitions = Object.fromEntries(
            [
                ...Array.from(
                    new Set(
                        this.functions.map(({ argTypes, returnType }) => [
                            ...Object.values(argTypes),
                            returnType,
                        ])
                    )
                ).flat(),
            ].map((parsedType) => [
                parsedType.origin,
                isSimplified(parsedType)
                    ? parsedType
                    : resolveExternalType(
                          parsedType,
                          join(dir, this.category, name, 'Main.mo'),
                          this.imports
                      ),
            ])
        )
    }

    public generateInterface(): void {
        const requiredImports: Set<ParsedImport> = new Set(
            Array.from(this.interfaceDependencies).map((name) => this.imports[name])
        )
        const importStatements: string = sortImports(requiredImports).join('\n')

        const functionDefs = this.functions.map(({ flag, name, argTypes, returnType }) => {
            const argsStr = Object.values(argTypes)
                .map(({ origin }) => origin)
                .join(', ')
            const returnStr = returnType.origin
            const flagStr = flag.isQuery ? 'query' : 'shared'
            return `${name} : ${flagStr} (${argsStr}) -> ${returnStr};`
        })

        const interfaceContent: string = `
${importStatements}

module {
    public type ${this.actorName} = actor {
        ${functionDefs.join('\n        ')}
    };
};
`.trim()

        writeFileSync(join(this.folderPath, 'Interface.mo'), interfaceContent)
    }

    public generateAnalyzed(): void {
        const analyzedContent = JSON.stringify(
            {
                canisterName: this.canisterName,
                actorName: this.actorName,
                category: this.category,
                functions: this.functions,
                imports: this.imports,
                actorDependencies: Array.from(this.actorDependencies),
                interfaceDependencies: Array.from(this.interfaceDependencies),
                typeDefinitions: this.typeDefinitions,
            },
            null,
            2
        )

        writeFileSync(this.analyzedPath, analyzedContent)
    }

    public generateApis(): void {
        const modules: Record<string, Set<ModuleName>> = {}
        for (const name of this.actorDependencies) {
            const category = capitalize(this.imports[name].category)
            modules[category] = (modules[category] || new Set()).add(name)
        }
        const methods: Record<string, Set<ParsedFunction>> = {}
        for (const func of this.functions) {
            const category = func.flag.isQuery ? 'Accessor' : 'Modifier'
            methods[category] = (methods[category] || new Set()).add(func)
        }

        const titleHeader = `# ${this.actorName} API Specification\n`
        const dependenciesHeader = `## Dependencies\n\n`
        const dependenciesContent = Object.entries(modules).map(
            ([category, names]) =>
                `- ${pluralize(category)}: ${Array.from(names)
                    .map((name) => `\`${name}\``)
                    .join(', ')}`
        )
        const methodsDecs = ['Modifier', 'Accessor'].map((category) => {
            if (!methods[category]) return ''

            const methodsHeader = `## ${pluralize(category)}\n\n`
            const methodsContent = Array.from(methods[category])
                .map(({ name, argTypes, returnType }, i) => {
                    const methodHeader = `### ${i + 1}. ${codeInline(
                        `${name}(${Object.keys(argTypes).join(', ')})`
                    )} returns ${codeInline(returnType.origin.replace('async ', ''))}\n`
                    const argsContent =
                        Object.keys(argTypes).length > 0
                            ? `\n#### Arguments:\n
\`\`\`json
${formatJsonString(
    JSON.stringify(
        Object.fromEntries(
            Object.entries(argTypes).map(([name, type]) => [
                name,
                JSON.parse(displayType(this.typeDefinitions[type.origin])),
            ])
        )
    )
)}
\`\`\`\n`
                            : ''

                    const returnContent = !isNilHard(returnType)
                        ? `\n#### Returns:
\`\`\`json
${formatJsonString(displayType(this.typeDefinitions[returnType.origin]))}
\`\`\`\n`
                        : ''

                    return methodHeader + argsContent + returnContent
                })
                .join('\n')
            return methodsHeader + methodsContent
        })

        const apisContent: string = [
            titleHeader,
            dependenciesHeader,
            ...dependenciesContent,
            ...methodsDecs,
        ].join('\n')

        writeFileSync(this.apisPath, apisContent)
    }
}
