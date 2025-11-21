import { useEffect, useState } from 'react'

import BalanceCard from '@components/Pages/Profile/MyAssets/BalanceCard'
import BurialsTab from '@components/Pages/Profile/MyAssets/BurialsTab'
import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@components/Primitives/MemorizedTabs'
import useAuth from '@hooks/useAuth'
import useUserData from '@hooks/useUserData'
import { DEscrow } from 'shared/types/services'
import { ACORN, Escrow, ICP } from 'shared/utils/services'

import CouponsTab from './CouponsTab'
import EarningTab from './EarningTab'

enum ETab {
    Burials = 'Burials',
    Rewards = 'Rewards',
    Coupons = 'Coupons',
}

const MyAssetsLayout = ({ tab = ETab.Burials }: { tab?: ETab }) => {
    const { principal } = useAuth()
    const userData = useUserData(principal ?? null)

    const [balances, setBalances] = useState<{ ACORN: bigint; ICP: bigint }>()

    const [burials, setBurials] = useState<DEscrow.SharableBurial[]>([])
    const [buriedAmount, setBuriedAmount] = useState<bigint>(0n)
    const [currentTab, setCurrentTab] = useState<ETab>(tab)

    useEffect(() => {
        Promise.all([onRefreshBalances('all'), fetchBurials()])
    }, [])

    const fetchBurials = async () => {
        return Promise.all([
            Escrow.call().getBurials(principal!).then(setBurials),
            Escrow.call().getBuriedAmount(principal!).then(setBuriedAmount),
        ])
    }

    const onRefreshBalances = async (token: 'ACORN' | 'ICP' | 'all') => {
        await Promise.all([
            (token === 'all' || token === 'ACORN') &&
                ACORN.call()
                    .icrc1_balance_of({ owner: principal!, subaccount: [] })
                    .then((res) => setBalances((prev) => ({ ...prev, ACORN: res }) as any)),
            (token === 'all' || token === 'ICP') &&
                ICP.call()
                    .icrc1_balance_of({ owner: principal!, subaccount: [] })
                    .then((res) => setBalances((prev) => ({ ...prev, ICP: res }) as any)),
        ])
    }

    const claimable = {
        [ETab.Burials]: userData?.escrowClaimable ?? 0n,
        [ETab.Rewards]:
            (userData?.affiliateEarning?.balance ?? 0n) +
            (userData?.axiomsEarning.balance ?? 0n) +
            (userData?.daoEarning[0].balance ?? 0n) +
            (userData?.daoEarning[1].balance ?? 0n),
        [ETab.Coupons]: 0n,
    }

    return (
        <div className="gap-medium flex w-full flex-col">
            <div className="gap-medium flex flex-col items-center md:flex-row">
                <BalanceCard
                    balance={balances?.ACORN}
                    refreshBalances={async () => onRefreshBalances('ACORN')}
                    token="ACORN"
                />
                <BalanceCard
                    balance={balances?.ICP}
                    refreshBalances={async () => onRefreshBalances('ICP')}
                    token="ICP"
                />
            </div>
            <Tabs value={currentTab}>
                <TabsHeader className="z-0 overflow-x-hidden">
                    {Object.keys(ETab).map((tab) => (
                        <Tab value={tab} onClick={() => setCurrentTab(tab as ETab)}>
                            <div className="relative mx-auto w-fit">
                                {tab}
                                <div
                                    className="absolute -top-[1.5rem] right-[1.5rem] z-50 overflow-visible aria-hidden:hidden md:-top-[1.5rem] md:right-[1.5rem]"
                                    aria-hidden={claimable[tab as ETab] === 0n}
                                >
                                    <div className="live-dot"></div>
                                    <div className="live-animated"></div>
                                </div>
                            </div>
                        </Tab>
                    ))}
                </TabsHeader>
                <TabsBody className="mt-medium">
                    <TabPanel key={ETab.Burials} value={ETab.Burials}>
                        <BurialsTab
                            burials={burials ?? []}
                            fetchBurials={fetchBurials}
                            buriedAmount={buriedAmount ?? 0n}
                            refreshBalances={async () => onRefreshBalances('ACORN')}
                        />
                    </TabPanel>
                    <TabPanel key={ETab.Rewards} value={ETab.Rewards}>
                        <EarningTab
                            onRefreshBalances={onRefreshBalances}
                            burials={burials ?? []}
                            buriedAmount={buriedAmount ?? 0n}
                        />
                    </TabPanel>
                    <TabPanel key={ETab.Coupons} value={ETab.Coupons}>
                        <CouponsTab
                            balance={balances?.ICP ?? 0n}
                            refreshBalances={async () => onRefreshBalances('ICP')}
                        />
                    </TabPanel>
                </TabsBody>
            </Tabs>
        </div>
    )
}

export default MyAssetsLayout
