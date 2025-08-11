import { writeFileSync } from 'fs'

import { Actor } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { idlFactory as axiomsIdlFactory } from 'shared/declarations/axioms/axioms.did.js'
import { DAxioms } from 'shared/types/services'
import { Unwrap, UnwrapVariant } from 'shared/utils/typings'

import { createAgent } from '../utils'
;(async () => {
    const agent = createAgent('ic')
    const axioms = Principal.fromText('zlaf4-cqaaa-aaaap-qpzsa-cai')
    const Axioms = Actor.createActor<DAxioms._SERVICE>(axiomsIdlFactory, {
        canisterId: axioms,
        agent,
    })

    const principal = 'xqdi6-3sk4m-nnnmo-runjv-2xv64-pugcp-setz7-eeqtp-5o5ag-cgwpn-rae'
    const user = Principal.fromText(principal)

    const { hypotheses, evidences } = await Axioms.getUser(user)

    type Hypothesis = { content: string; evidences?: string[] }
    type Evidence = string

    const evidencesJson: { [key: string]: Evidence } = {}
    const hypothesesJson: { [key: string]: Hypothesis } = {}
    const evidencesResults: DAxioms.SharableEvidence[] = []
    const hypothesesResults: DAxioms.SharableHypothesis[] = []

    const parseHypothesis = (
        hypothesis: DAxioms.SharableHypothesis,
        evidences?: string[]
    ): [string, Hypothesis] => {
        const id = `Hypothesis ${hypothesis.id.toString()}`
        const content = `[${id}]

        ${hypothesis.content}`
        return [id, { content, evidences }]
    }
    const parseEvidence = (
        evidence: DAxioms.SharableEvidence,
        context?: string
    ): [string, Evidence] => {
        const id = `Evidence ${evidence.id.toString()}`
        const note = evidence.form.find((f) => UnwrapVariant(f)[0] === 'Note') as
            | EntryOfKey<DAxioms.Format, 'Note'>
            | undefined
        const hyperlink = evidence.form.find((f) => UnwrapVariant(f)[0] === 'Hyperlink') as
            | EntryOfKey<DAxioms.Format, 'Hyperlink'>
            | undefined
        const picture = evidence.form.find((f) => UnwrapVariant(f)[0] === 'Picture') as
            | EntryOfKey<DAxioms.Format, 'Picture'>
            | undefined

        const content = `
[${id}]

${
    context
        ? `(Context - ${context})
---`
        : ''
}
${note ? UnwrapVariant(note)[1] : ''}
---
${hyperlink ? `[${UnwrapVariant(hyperlink)[1].anchorText}](${UnwrapVariant(hyperlink)[1].url})` : ''}
---
${picture ? '[image]' : ''}
    `
        return [id, content]
    }

    for (const evidence of evidences) {
        console.log(`Processing evidence ${evidence.toString()}`)
        const evidenceResult = await Axioms.getEvidence(evidence)
        evidencesResults.push(evidenceResult)

        const repliedTo = Unwrap(evidenceResult.repliedTo)
        const context = repliedTo
            ? await Axioms.getEvidence(repliedTo)
                  .then(parseEvidence)
                  .catch(() => `Deleted evidence ${repliedTo.toString()}`)
            : undefined
        const result = parseEvidence(evidenceResult, context?.[0])
        evidencesJson[result[0]] = result[1]
    }

    for (const hypothesis of hypotheses) {
        console.log(`Processing hypothesis ${hypothesis.toString()}`)
        const hypothesisResult = await Axioms.getHypothesis(hypothesis)
        hypothesesResults.push(hypothesisResult)

        const ownedEvidences: string[] = []

        for (const evidence of evidencesResults) {
            const isPublisher = evidence.publisher.toText() === principal
            if (isPublisher) {
                const ownedEvidence = evidencesJson[`Evidence ${evidence.id.toString()}`]
                ownedEvidences.push(ownedEvidence)
                delete evidencesJson[`Evidence ${evidence.id.toString()}`]
            }
        }

        const result = parseHypothesis(hypothesisResult, ownedEvidences)
        hypothesesJson[result[0]] = result[1]
    }

    writeFileSync(
        './scripts/axiom_tools/reports/extract_all_from_one.json',
        JSON.stringify([...Object.values(hypothesesJson), ...Object.values(evidencesJson)], null, 2)
    )
})()
