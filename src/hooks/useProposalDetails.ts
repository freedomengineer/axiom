import { Principal } from '@dfinity/principal'
import { useEffect, useState } from 'react'

import { error, promise } from '@libs/toastify'
import { ECategory, EStatus, EVote, parseStatus } from '@utils/dashboard/proposal'
import { DDAO, DFacade } from 'shared/types/services'
import { DAO } from 'shared/utils/services'
import { Unwrap, UnwrapVariant, Variant } from 'shared/utils/typings'

import useAuth from './useAuth'
import useUsername, { Displayer, getUsername } from './useUsername'

const useProposalDetails = (item: DDAO.SharableProposal) => {
    const { agent, principal } = useAuth()

    const [localItem, setLocalItem] = useState<DDAO.SharableProposal>(item)
    const [votesLoading, setVotesLoading] = useState<Record<EVote, boolean>>({
        [EVote.Positive]: false,
        [EVote.Negative]: false,
        [EVote.Delegated]: false,
    })
    const [voters, setVoters] = useState<
        [DFacade.Identifier[], DFacade.Identifier[], DFacade.Identifier[], DFacade.Identifier[]]
    >([[], [], [], []])
    const [delegatee, setDelegatee] = useState<Displayer>()

    useEffect(() => {
        setLocalItem(item)
    }, [item])

    useEffect(() => {
        Promise.all([
            Promise.all(
                localItem.votes[0].map((voter) =>
                    getUsername(voter).then((r) => ({ ...r, principal: voter }))
                )
            ),
            Promise.all(
                localItem.votes[1].map((voter) =>
                    getUsername(voter).then((r) => ({ ...r, principal: voter }))
                )
            ),
            Promise.all(
                localItem.votes[2].map((voter) =>
                    getUsername(voter).then((r) => ({ ...r, principal: voter }))
                )
            ),
            Promise.all(
                localItem.votes[3].map((voter) =>
                    getUsername(voter).then((r) => ({ ...r, principal: voter }))
                )
            ),
            Unwrap(localItem.callerVote) && 'Delegated' in Unwrap(localItem.callerVote)!
                ? getUsername((Unwrap(localItem.callerVote) as any).Delegated)
                : Promise.resolve(undefined),
        ]).then(([voters, voters2, voters3, voters4, delegatee]) => {
            setVoters([voters, voters2, voters3, voters4] as any)
            setDelegatee(delegatee)
        })
    }, [localItem])

    const handleRefresh = async () => {
        const item = await DAO.call(agent).getProposal(localItem.id)
        setLocalItem(item)

        const vote = Unwrap(item.callerVote)
        if (vote && 'Delegated' in vote) {
            getUsername(vote.Delegated).then(setDelegatee)
        }
    }

    const votable = [EStatus.Proposed, EStatus.Retried].includes(
        parseStatus(localItem.timeline[localItem.timeline.length - 1].status)
    )
    const allowToVote =
        principal &&
        votable &&
        localItem.votes.some((v) => v.some((p) => p.compareTo(principal) === 'eq'))

    const vote = Unwrap(localItem.callerVote)
    const category = UnwrapVariant(localItem.detachment)[0] as ECategory
    const proposer = useUsername(localItem.proposer)

    const handleVote = async (choice: EVote, delegatedTo?: Principal) => {
        setVotesLoading((prev) => ({ ...prev, [choice]: true }))
        if (vote && 'Default' in vote && UnwrapVariant(vote.Default.choice) === choice) {
            error(`You have already voted ${choice} for this proposal`)
        } else {
            await promise(
                DAO.call(agent).voteProposal(
                    localItem.id,
                    choice === EVote.Delegated
                        ? Variant('Delegated', delegatedTo)
                        : Variant('Default', Variant(choice))
                ),
                'Casting vote',
                'Vote casted!'
            )
        }
        await handleRefresh()
        setVotesLoading((prev) => ({ ...prev, [choice]: false }))
    }

    return {
        proposer,
        localItem,
        category,
        vote,
        voters,
        votesLoading,
        votable,
        allowToVote,
        delegatee,
        handleVote,
    }
}

export default useProposalDetails
