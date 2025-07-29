import { useEffect, useState } from 'react'

import { promise } from '@libs/toastify'
import { EVote } from '@utils/feed/hypothesis'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { Unwrap, UnwrapVariant, Variant, Wrap } from 'shared/utils/typings'

import useAuth from './useAuth'
import useUsername from './useUsername'

const useHypothesisDetails = (item: DAxioms.SharableHypothesis) => {
    const { agent } = useAuth()
    const publisher = useUsername(item.publisher)

    const [localItem, setLocalItem] = useState<DAxioms.SharableHypothesis>(item)
    const [votesLoading, setVotesLoading] = useState<Record<EVote, boolean>>({
        [EVote.Positive]: false,
        [EVote.Neutral]: false,
        [EVote.Negative]: false,
    })
    const [axiomLoading, setAxiomLoading] = useState<boolean>(false)
    const [bookmarkLoading, setBookmarkLoading] = useState<boolean>(false)

    useEffect(() => {
        setLocalItem(item)
    }, [item])

    const handleRefresh = async () => {
        await Axioms.call(agent).getHypothesis(localItem.id).then(setLocalItem)
    }

    const vote = Unwrap(localItem.callerVote)
    const axiom = Unwrap(localItem.callerAxiom)
    const bookmark = Unwrap(localItem.callerBookmark)

    const handleVote = async (choice: EVote, custom?: DAxioms.CustomValue) => {
        setVotesLoading((prev) => ({ ...prev, [choice]: true }))
        if (UnwrapVariant(vote?.choice) === choice) {
            await promise(
                Axioms.call(agent).removeHypothesisVote(localItem.id),
                'Removing vote',
                'Vote removed!'
            )
        } else {
            await promise(
                Axioms.call(agent).voteHypothesis(localItem.id, Variant(choice), Wrap(custom)),
                'Casting vote',
                'Vote casted!'
            )
        }
        await handleRefresh()
        setVotesLoading((prev) => ({ ...prev, [choice]: false }))
    }
    const handleAxiom = async () => {
        setAxiomLoading(true)
        if (axiom) {
            await promise(
                Axioms.call(agent).removeFromAxioms(localItem.id),
                'Removing from Axioms',
                'Hypothesis removed from Axioms!'
            )
        } else {
            await promise(
                Axioms.call(agent).addToAxioms(localItem.id),
                'Adopting as Axiom',
                'Hypothesis adopted as Axiom!'
            )
        }
        await handleRefresh()
        setAxiomLoading(false)
    }
    const handleBookmark = async () => {
        setBookmarkLoading(true)
        if (bookmark) {
            await promise(
                Axioms.call(agent).removeFromBookmarks(localItem.id),
                'Removing from Bookmarks',
                'Hypothesis removed from Bookmarks!'
            )
        } else {
            await promise(
                Axioms.call(agent).addToBookmarks(localItem.id),
                'Adding to Bookmarks',
                'Hypothesis added to Bookmarks!'
            )
        }
        await handleRefresh()
        setBookmarkLoading(false)
    }

    return {
        publisher,
        localItem,
        vote,
        axiom,
        bookmark,
        votesLoading,
        axiomLoading,
        bookmarkLoading,
        handleVote,
        handleAxiom,
        handleBookmark,
        handleRefresh,
    }
}

export default useHypothesisDetails
