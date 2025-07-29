'use client'

import { useState } from 'react'

import { promise } from '@libs/toastify'
import { EVote } from '@utils/feed/evidence'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { Unwrap, UnwrapVariant, Variant, Wrap } from 'shared/utils/typings'

import useAuth from './useAuth'
import useUsername from './useUsername'

const useEvidenceDetail = (item: DAxioms.SharableEvidence) => {
    const { agent } = useAuth()
    const publisher = useUsername(item.publisher)

    const [localItem, setLocalItem] = useState<DAxioms.SharableEvidence>(item)
    const [votesLoading, setVotesLoading] = useState<Record<EVote, boolean>>({
        [EVote.Positive]: false,
        [EVote.Negative]: false,
    })

    const vote = Unwrap(localItem.callerVote)

    const refreshItem = async () => {
        await Axioms.call(agent).getEvidence(localItem!.id).then(setLocalItem)
    }

    const handleVote = async (choice: EVote, custom?: DAxioms.CustomValue) => {
        setVotesLoading((prev) => ({ ...prev, [choice]: true }))
        if (UnwrapVariant(vote?.choice) === choice) {
            await promise(
                Axioms.call(agent).removeEvidenceVote(localItem!.id),
                'Removing vote',
                'Vote removed!'
            )
        } else {
            await promise(
                Axioms.call(agent).voteEvidence(localItem!.id, Variant(choice), Wrap(custom)),
                'Casting vote',
                'Vote casted!'
            )
        }
        await refreshItem()
        setVotesLoading((prev) => ({ ...prev, [choice]: false }))
    }

    return {
        publisher,
        localItem,
        vote,
        votesLoading,
        handleVote,
        refreshItem,
    }
}

export default useEvidenceDetail
