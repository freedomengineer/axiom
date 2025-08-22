import { useEffect, useState } from 'react'

import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import usePackages, { EPackages, parseMemberships } from '@hooks/usePackages'
import { getSpecificUserData, refreshSpecificUserData } from '@hooks/useUserData'
import { DEscrow } from 'shared/types/services'
import { Affiliate, Axioms, DAO, Sales } from 'shared/utils/services'
import { UnwrapVariant, Variant } from 'shared/utils/typings'

import AchievementCard from './AchievementCard'
import EarningCard from './EarningCard'

const EarningTab = ({
    onRefreshBalances,
    burials,
    buriedAmount,
}: {
    onRefreshBalances: (token: 'ACORN' | 'ICP' | 'all') => Promise<void>
    burials: DEscrow.SharableBurial[]
    buriedAmount: bigint
}) => {
    const { agent, principal } = useAuth()
    const configs = useConfigs('Sales')
    const membershipPackages = usePackages(EPackages.Membership, configs)

    const [referrals, setReferrals] = useState<bigint>(0n)
    const [ownedMemberships, setOwnedMemberships] = useState<{
        current: bigint
        threshold: bigint
        currentSymbol: string
        thresholdSymbol: string
    }>({ current: 0n, threshold: 0n, currentSymbol: '', thresholdSymbol: '' })
    const [ownedAchievements, setOwnedAchievements] = useState<{
        Referral: boolean
        OctupleBurial: boolean
    }>({ Referral: false, OctupleBurial: false })

    const fetchReferrals = async () => {
        return Affiliate.call()
            .getUser(principal!)
            .then((res) => setReferrals(res.referrals))
    }

    const fetchAchievements = async () => {
        return Sales.call()
            .getOwnedAchievementPackages(principal!)
            .then((res) => {
                res.forEach((p) =>
                    setOwnedAchievements((prev) => ({
                        ...prev,
                        [UnwrapVariant(p.achievement)]: true,
                    }))
                )
            })
    }
    const fetchMemberships = async () => {
        return Sales.call()
            .getOwnedPackages(principal!)
            .then((res) => {
                const currentPackage = parseMemberships(res, configs).sort(
                    (a, b) => Number(b.originalPrice) - Number(a.originalPrice)
                )?.[0]
                const nextPackage = membershipPackages!
                    .filter((p) => p.originalPrice > (currentPackage?.originalPrice ?? 0n))
                    .sort((a, b) => Number(a.originalPrice) - Number(b.originalPrice))?.[0]

                setOwnedMemberships({
                    current: 0n,
                    threshold: nextPackage
                        ? nextPackage.acornBuried[0] + nextPackage.acornLiquid[0]
                        : 0n,
                    currentSymbol: currentPackage?.symbol ?? 'N/A',
                    thresholdSymbol: nextPackage?.symbol ?? 'N/A',
                })
            })
    }

    useEffect(() => {
        if (!membershipPackages || !configs) return

        Promise.all([fetchReferrals(), fetchAchievements(), fetchMemberships()])
    }, [membershipPackages, configs])

    return (
        <>
            <div className="gap-medium flex flex-col md:grid md:grid-cols-3">
                <EarningCard
                    name="Affiliate"
                    earnableList={['Referral Commission']}
                    token="ICP"
                    getEarning={async () =>
                        (await getSpecificUserData(principal!, 'affiliateEarning'))!
                    }
                    claimEarning={async () => {
                        await Affiliate.call(agent).withdrawAll()
                        return (await refreshSpecificUserData(principal!, 'affiliateEarning'))!
                    }}
                    refreshBalances={() => onRefreshBalances('ICP')}
                />
                <EarningCard
                    name="Axioms"
                    earnableList={['Acorn Drop', 'Flagging Rewards', 'Evidence Refunds']}
                    token="ACORN"
                    getEarning={async () =>
                        (await getSpecificUserData(principal!, 'axiomsEarning'))!
                    }
                    claimEarning={async () => {
                        await Axioms.call(agent).withdrawAll()
                        return (await refreshSpecificUserData(principal!, 'axiomsEarning'))!
                    }}
                    refreshBalances={() => onRefreshBalances('ACORN')}
                />
                <EarningCard
                    name="DAO"
                    earnableList={[
                        'Proposal Rewards',
                        'Proposal Refunds',
                        'Profit Sharing',
                        'Custodian Payoffs',
                    ]}
                    token="all"
                    getEarning={async () => (await getSpecificUserData(principal!, 'daoEarning'))!}
                    claimEarning={async () => {
                        await DAO.call(agent).withdrawAll()
                        return (await refreshSpecificUserData(principal!, 'daoEarning'))!
                    }}
                    refreshBalances={() => onRefreshBalances('all')}
                />
            </div>
            <div className="gap-medium flex flex-col md:grid md:grid-cols-3">
                <AchievementCard
                    name="UpgradeAccount"
                    onClaim={async () => {
                        await Sales.call(agent).upgradePackage()
                        await fetchMemberships()
                    }}
                    progress={{
                        ...ownedMemberships,
                        current: buriedAmount,
                    }}
                    claimed={ownedMemberships.current === ownedMemberships.threshold}
                />
                <AchievementCard
                    name="OctupleBurial"
                    onClaim={async () => {
                        await Sales.call(agent).mintAchievementPackage(Variant('OctupleBurial'))
                        await fetchAchievements()
                    }}
                    progress={{
                        current: burials.reduce(
                            (acc, burial) => acc + (burial.coefficient === 8n ? burial.amount : 0n),
                            0n
                        ),
                        threshold:
                            (configs?.['OCTUPLE_BURIAL_ACHIEVEMENT_THRESHOLD']?.[1] as bigint) ??
                            0n,
                    }}
                    claimed={ownedAchievements['OctupleBurial']}
                />
                <AchievementCard
                    name="Referral"
                    onClaim={async () => {
                        await Sales.call(agent).mintAchievementPackage(Variant('Referral'))
                        await fetchAchievements()
                    }}
                    progress={{
                        current: referrals,
                        threshold:
                            (configs?.['REFERRAL_ACHIEVEMENT_THRESHOLD']?.[1] as bigint) ?? 0n,
                    }}
                    claimed={ownedAchievements['Referral']}
                />
            </div>
        </>
    )
}

export default EarningTab
