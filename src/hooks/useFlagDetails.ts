'use client'

import { useState } from 'react'

import { promise } from '@libs/toastify'
import { EVote } from '@utils/feed/evidence'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { Unwrap, UnwrapVariant, Variant } from 'shared/utils/typings'

import useAuth from './useAuth'
import useUsername from './useUsername'

const useFlagDetails = (item: DAxioms.SharableFlag) => {
    const { agent } = useAuth()
    const { username: requester } = useUsername(item.requester)

    const [localItem, setLocalItem] = useState<DAxioms.SharableFlag>(item)
    const [votesLoading, setVotesLoading] = useState<Record<EVote, boolean>>({
        [EVote.Positive]: false,
        [EVote.Negative]: false,
    })

    const vote = Unwrap(localItem.callerVote)

    const refreshItem = async () => {
        await Axioms.call(agent).getFlag(localItem).then(setLocalItem)
    }

    const handleVote = async (choice: EVote) => {
        setVotesLoading((prev) => ({ ...prev, [choice]: true }))
        if (UnwrapVariant(vote?.choice) === choice) {
            await promise(
                Axioms.call(agent).removeFlagVote(localItem),
                'Removing vote',
                'Vote removed!'
            )
        } else {
            await promise(
                Axioms.call(agent).voteFlag(localItem, Variant(choice)),
                'Casting vote',
                'Vote casted!'
            )
        }
        await refreshItem()
        setVotesLoading((prev) => ({ ...prev, [choice]: false }))
    }

    return {
        requester,
        localItem,
        vote,
        votesLoading,
        handleVote,
    }
}

export default useFlagDetails
