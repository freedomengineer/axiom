import { useEffect, useState } from 'react'

import BalanceCard from '@components/Pages/Profile/MyAssets/BalanceCard'
import BurialsTab from '@components/Pages/Profile/MyAssets/BurialsTab'
import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@components/Primitives/MemorizedTabs'
import useAuth from '@hooks/useAuth'
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
                <TabsHeader>
                    {Object.keys(ETab).map((tab) => (
                        <Tab value={tab} onClick={() => setCurrentTab(tab as ETab)}>
                            {tab}
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
