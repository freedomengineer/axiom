import { writeFileSync } from 'fs'

import { Actor } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { idlFactory as axiomsIdlFactory } from 'shared/declarations/axioms/axioms.did.js'
import { DAxioms } from 'shared/types/services'

import { createAgent } from '../utils'
;(async () => {
    const agent = createAgent('ic')
    const axioms = Principal.fromText('zlaf4-cqaaa-aaaap-qpzsa-cai')
    const Axioms = Actor.createActor<DAxioms._SERVICE>(axiomsIdlFactory, {
        canisterId: axioms,
        agent,
    })

    const users = await Axioms.getTop({ HypothesisPublishers: null })
    const data: { [key: string]: DAxioms.Sharable__2 } = {}

    for (const [user, _] of users.result) {
        console.log(user.toText())
        const userData = await Axioms.getUser(user)
        data[user.toText()] = userData
    }

    writeFileSync(
        './scripts/axiom_tools/reports/get_all_axioms_users.json',
        JSON.stringify(
            data,
            (key, value) => (typeof value === 'bigint' ? value.toString() : value),
            2
        )
    )
})()
