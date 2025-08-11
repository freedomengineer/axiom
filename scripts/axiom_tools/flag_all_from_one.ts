import { execSync } from 'child_process'

import { Actor, Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { idlFactory as acornIdlFactory } from 'shared/declarations/acorn_ledger/acorn_ledger.did.js'
import { idlFactory as axiomsIdlFactory } from 'shared/declarations/axioms/axioms.did.js'
import { DACORN, DAxioms } from 'shared/types/services'
import { Variant } from 'shared/utils/typings'

import { createAgent } from './../utils'
import { deriveCurrentIdentity } from '../../backend/test/utils/helpers'
;(async () => {
    const pem = execSync(`dfx identity export founder`).toString()
    const identity: Identity = deriveCurrentIdentity(pem)

    const axioms = Principal.fromText('zlaf4-cqaaa-aaaap-qpzsa-cai')
    const acorn = Principal.fromText('4f5ia-fiaaa-aaaap-qpzoq-cai')
    const agent = createAgent('ic', identity)

    const Axioms = Actor.createActor<DAxioms._SERVICE>(axiomsIdlFactory, {
        canisterId: axioms,
        agent,
    })
    const ACORN = Actor.createActor<DACORN._SERVICE>(acornIdlFactory, { canisterId: acorn, agent })

    const spammer = 'huucz-6ejne-fe3sq-4p5ts-buzhz-ffwbp-bs4jx-nw7q3-7lnoq-rvfrg-3ae'
    const user = await Axioms.getUser(Principal.fromText(spammer))
    const { hypotheses, evidences } = user

    await ACORN.icrc2_approve({
        amount: 13_670_092_509_144n,
        spender: { owner: Principal.fromText('4l7fi-6yaaa-aaaap-qpzpq-cai'), subaccount: [] },
        fee: [],
        from_subaccount: [],
        memo: [],
        created_at_time: [],
        expected_allowance: [],
        expires_at: [],
    })

    const deleteFunction = async (category: 'Hypothesis' | 'Evidence') => {
        console.log(`Starting to delete ${category}...`)

        let success = 0
        let error = 0
        let bug = 0

        for (const [index, id] of { Hypothesis: hypotheses, Evidence: evidences }[
            category
        ].entries()) {
            try {
                const x = await { Hypothesis: Axioms.getHypothesis, Evidence: Axioms.getEvidence }[
                    category
                ](id)

                if (x.publisher.toText() === spammer) {
                    await Axioms.requestFlag({ id, category: Variant(category) }, 'spam').then(
                        () => {
                            success++
                            console.log(`[${index + 1}] Deleted Successfully ${id}`)
                        }
                    )
                } else {
                    bug++
                    console.log(`[${index + 1}] Bug ${id}`)
                }
            } catch (e: any) {
                error++
                console.log(`[${index + 1}] Error ${id}:`, e)
            }
        }

        console.log(`Success: ${success}`)
        console.log(`Error: ${error}`)
        console.log(`DANGEROUS BUG: ${bug}`)
    }

    await deleteFunction('Hypothesis')
})()
