import { writeFileSync } from 'fs'

import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import scenario from './scenario.json'
import payouts from './snapshots/payouts.json'
import processed from './snapshots/processed.json'
import ranking from './snapshots/ranking.json'
import { ONE_DAY } from '../common/constants'
import { gatherPromises, valueOf } from '../common/libs'
import { deploy, generateInterface } from '../utils/canister'
import { generateNewIdentity } from '../utils/identity'

import {
    AGES,
    DISTRIBUTION,
    Hypothesis,
    HypothesisFullRanks,
    HypothesisRank,
    HypothesisScores,
    RANKS,
    Ranks,
    Scores,
    USERS,
    VOTES,
    hypotheses,
} from '.'

jest.setTimeout(1200000)

describe('Daily Drop: Scenario 1', () => {
    const identities: Identity[] = []
    const principals: Principal[] = []

    beforeAll(async () => {
        for (let i = 0; i < USERS; i++) {
            const identity = generateNewIdentity()
            identities.push(identity)
            principals.push(identity.getPrincipal())
        }

        deploy('hypotheses_mock')
        generateInterface('hypotheses_mock')
    })

    it.skip('pre-process data', async () => {
        const hypotheses: Hypothesis[] = []
        const publishes: number[][] = []

        let i = 0
        for (const [publishDate, numHypotheses] of scenario.publishes.entries()) {
            const hypotheses = Array.from({ length: numHypotheses }, () => i++)

            const hypothesesForTheDay: number[] = []

            for (const hypothesis of hypotheses) {
                const { votes, evidences } = scenario.hypotheses[hypothesis]
                const regularScore = votes.length

                hypotheses.push({
                    id: hypothesis,
                    publisher: hypothesis % USERS,
                    publishDate,
                    votes: votes.map((vote, index) => ({ voter: index % USERS, value: vote })),
                    evidences: Array.from({ length: evidences }, (_, index) => index % USERS),
                    regularScore,
                    poweredScore: votes.reduce((acc, vote) => acc + vote, 0),
                })

                hypothesesForTheDay.push(hypothesis)
            }

            publishes.push(hypothesesForTheDay)
        }

        writeFileSync(
            './backend/test/daily_drop/snapshots/processed.json',
            JSON.stringify({ publishes, hypotheses })
        )
    })

    it.skip('transform ranking', async () => {
        const { publishes, hypotheses } = processed

        type VoteKey = (typeof VOTES)[number]
        type RankKey = VoteKey | 'average'
        type RankValue =
            | [HypothesisRank[], HypothesisRank[], HypothesisRank[]]
            | [HypothesisFullRanks[], HypothesisFullRanks[], HypothesisFullRanks[]]

        const totalRanking: Record<RankKey, RankValue>[] = []

        for (const date of publishes.keys()) /* day 0 -> 22 */ {
            const actualDate = date + 1
            const hypothesesByAges: number[][] = AGES.map((limit) =>
                publishes.slice(actualDate > limit ? actualDate - limit : 0, actualDate).flat()
            )
            const rankingOfTheDay: Record<RankKey, RankValue> = {
                regular: [[], [], []],
                powered: [[], [], []],
                average: [[], [], []],
            }

            for (const [age, hypothesisIds] of hypothesesByAges.entries()) /* age 0, 1, 2 */ {
                const scoresOfTheAge: Record<VoteKey, HypothesisScores[][]> = {
                    regular: [],
                    powered: [],
                }

                for (const vote of VOTES) /* regular, powered */ {
                    const ids: number[] = hypothesisIds.sort(
                        (a, b) => hypotheses[b][`${vote}Score`] - hypotheses[a][`${vote}Score`]
                    )
                    const scores: HypothesisScores[][] = []

                    for (const [i, id] of ids.entries()) {
                        const hypothesis = hypotheses[id]

                        const currentScore: HypothesisScores = {
                            id: hypothesis.id,
                            regularScore: hypothesis.regularScore,
                            poweredScore: hypothesis.poweredScore,
                        }

                        const previousScore =
                            i === 0 ? Infinity : hypotheses[ids[i - 1]][`${vote}Score`]
                        if (hypothesis[`${vote}Score`] === previousScore) {
                            scores[scores.length - 1].push(currentScore)
                        } else {
                            scores.push([currentScore])
                        }
                    }
                    scoresOfTheAge[vote] = scores
                }

                const rankMap: Record<number, Ranks & Scores> = {}

                for (const [rank, regularHypotheses] of scoresOfTheAge.regular.entries()) {
                    for (const { id, regularScore } of regularHypotheses) {
                        rankMap[id] = {
                            regularScore,
                            regularRank: rank,
                            poweredRank: 0,
                            poweredScore: 0,
                        }
                    }
                }
                for (const [rank, poweredHypotheses] of scoresOfTheAge.powered.entries()) {
                    for (const { id, poweredScore } of poweredHypotheses) {
                        rankMap[id].poweredScore = poweredScore
                        rankMap[id].poweredRank = rank
                    }
                }
                for (const vote of VOTES) /* regular, powered */ {
                    rankingOfTheDay[vote][age] = Object.entries(rankMap)
                        .map(([id, rank]) => ({
                            id: Number(id),
                            rank: rank[`${vote}Rank`],
                            score: rank[`${vote}Score`],
                        }))
                        .sort((a, b) => b.score - a.score)
                }

                rankingOfTheDay.average[age] = Object.entries(rankMap)
                    .map(([id, rank]) => ({
                        id: Number(id),
                        regularRank: rank.regularRank,
                        poweredRank: rank.poweredRank,
                        averageRank: (rank.regularRank + rank.poweredRank) / 2,
                    }))
                    .sort((a, b) =>
                        a.averageRank !== b.averageRank
                            ? a.averageRank - b.averageRank
                            : b.id - a.id
                    )
            }

            totalRanking.push(rankingOfTheDay)
        }

        writeFileSync(
            './backend/test/daily_drop/snapshots/ranking.json',
            JSON.stringify(totalRanking)
        )
    })

    it.skip('calculate payout', async () => {
        const { hypotheses } = processed
        const payoutEachAge: number = 12_000 / AGES.length
        const totalPayouts: { hypotheses: [number[], number[], number[]]; payout: number[] }[] = []

        for (const { average } of ranking) {
            const payoutsOfTheDay: number[] = Array.from({ length: USERS }, () => 0)
            const paidHypothesesOfTheDay: [number[], number[], number[]] = [[], [], []]

            for (const [age, hypothesisIds] of average.entries()) {
                const paidHypotheses: Hypothesis[] = hypothesisIds
                    .slice(0, RANKS[age])
                    .map(({ id }) => hypotheses[id])

                const payoutEachHypothesis: number = payoutEachAge / paidHypotheses.length

                for (const { publisher, evidences, votes } of paidHypotheses) {
                    const regularVoters: number[] = votes.map(({ voter }) => voter)
                    const poweredVoters: number[] = votes
                        .filter(({ value }) => value > 0)
                        .map(({ voter }) => voter)

                    payoutsOfTheDay[publisher] += payoutEachHypothesis * DISTRIBUTION.publisher

                    regularVoters.forEach(
                        (e) =>
                            (payoutsOfTheDay[e] +=
                                (payoutEachHypothesis * DISTRIBUTION.regularVoters) /
                                regularVoters.length)
                    )
                    poweredVoters.forEach(
                        (e) =>
                            (payoutsOfTheDay[e] +=
                                (payoutEachHypothesis * DISTRIBUTION.poweredVoters) /
                                poweredVoters.length)
                    )
                    evidences.forEach(
                        (e) =>
                            (payoutsOfTheDay[e] +=
                                (payoutEachHypothesis * DISTRIBUTION.evidences) / evidences.length)
                    )
                }

                paidHypothesesOfTheDay[age] = paidHypotheses.map(({ id }) => id)
            }

            totalPayouts.push({ hypotheses: paidHypothesesOfTheDay, payout: payoutsOfTheDay })
        }

        writeFileSync(
            './backend/test/daily_drop/snapshots/payouts.json',
            JSON.stringify(totalPayouts)
        )
    })

    it('should register', async () => {
        for (let i = 0; i < USERS; i++) {
            const register = hypotheses(identities[i]).register()
            expect(register).resolves.toBeUndefined()
        }
    })

    const testPayouts = async (publishDate: number) => {
        const publishDateInNanos = BigInt(publishDate) * ONE_DAY

        for (const hypothesis of processed.publishes[publishDate]) {
            const { publisher } = processed.hypotheses[hypothesis]
            await hypotheses(identities[publisher]).publishHypothesis(publishDateInNanos)
        }

        await gatherPromises(
            processed.publishes[publishDate].map((hypothesis) => ({
                voting: processed.hypotheses[hypothesis].votes.map(({ voter, value }) =>
                    hypotheses(identities[voter]).voteHypothesis(BigInt(hypothesis), BigInt(value))
                ),
                evidencing: processed.hypotheses[hypothesis].evidences.map((evidence) =>
                    hypotheses(identities[evidence]).publishEvidence(BigInt(hypothesis))
                ),
            }))
        )

        await hypotheses().dailyDrop(publishDateInNanos + ONE_DAY) // payout computing is always triggered the next day

        const balances = await gatherPromises(
            Object.fromEntries(
                Array.from({ length: USERS }, (_, user) => [
                    user,
                    hypotheses(identities[user]).getBalance().then(valueOf),
                ])
            )
        )

        for (const [user, balance] of Object.entries(balances)) {
            let expectedBalance: number = 0

            for (let date = 0; date <= publishDate; date++) {
                const balanceOfTheDay: number = payouts[date].payout[user]
                expectedBalance += balanceOfTheDay
            }

            expect(balance).toBeCloseTo(expectedBalance)
        }
    }

    it('should publish hypotheses, publish evidences, and vote (day 1)', async () => {
        await testPayouts(0)
    })

    it('should publish hypotheses, publish evidences, and vote (day 2)', async () => {
        await testPayouts(1)
    })

    it('should publish hypotheses, publish evidences, and vote (day 3)', async () => {
        await testPayouts(2)
    })

    it('should publish hypotheses, publish evidences, and vote (day 4)', async () => {
        await testPayouts(3)
    })

    it('should publish hypotheses, publish evidences, and vote (day 5)', async () => {
        await testPayouts(4)
    })

    it.skip('should publish hypotheses, publish evidences, and vote (day 6-10)', async () => {
        for (let i = 5; i <= 9; i++) {
            await testPayouts(i)
        }
    })

    it.skip('should publish hypotheses, publish evidences, and vote (day 11-22)', async () => {
        for (let i = 10; i <= 21; i++) {
            await testPayouts(i)
        }
    })
})
