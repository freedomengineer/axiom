import { useEffect, useState } from 'react'

import CustodianCard from '@components/Pages/ACEDashboard/Custodians/CustodianCard'
import NomineesTable from '@components/Pages/ACEDashboard/Custodians/NomineesTable'
import Divider from '@components/Shared/Divider'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { formatTime } from '@libs/date'
import { MILLIS_IN_A_DAY } from 'shared/constants'
import { parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'
import { DDAO } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { DAO } from 'shared/utils/services'

const title = 'Custodians'
const metadata = siteMetadata.routes['ACE Dashboard'].routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const CustodiansPage = () => {
    const { agent } = useAuth()
    const configs = useConfigs('DAO')

    const [custodians, setCustodians] = useState<DDAO.SharableNominee[]>([])
    const [electionCountdown, setElectionCountdown] = useState<number>(0)
    const [expandedCustodian, setExpandedCustodian] = useState<string | null>(null)

    useEffect(() => {
        if (!configs) return
        ;(async () => {
            const [daysInPeriod] = await Promise.all([
                DAO.call().getDaysInPeriod(),
                DAO.call(agent)
                    .getNomineesPagination(
                        parseFilterFromObj('nominee', { isCustodian: 'true' } as any),
                        parseSortFromObj('nominee', { by: 'token', order: 'descending' }),
                        1n,
                        100n
                    )
                    .then((res) => {
                        setCustodians(res.result)
                    }),
            ])
            const periodDuration = configs['PERIOD_DURATION'][1] as bigint
            const daysElapsed = daysInPeriod > periodDuration ? periodDuration - 1n : daysInPeriod
            const elapsed = daysElapsed * MILLIS_IN_A_DAY + (BigInt(Date.now()) % MILLIS_IN_A_DAY)
            const remaining = periodDuration * MILLIS_IN_A_DAY - elapsed
            setElectionCountdown(Number(remaining))
        })()
        const interval = setInterval(() => {
            setElectionCountdown((prev) => prev - 60000)
        }, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleToggleExpand = (custodianId: string) => {
        setExpandedCustodian((prev) => (prev === custodianId ? null : custodianId))
    }

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium flex w-full flex-col items-center">
                <div className="gap-normal flex w-full flex-col md:flex-row">
                    <div className="py-normal px-semilarge flex w-full flex-col items-center justify-between rounded-lg bg-cold-800 md:flex-row">
                        <h3 className="text-medium text-nowrap font-display font-semibold text-white">
                            Next Election
                        </h3>
                        <span className="text-small text-nowrap font-normal text-white">
                            {formatTime({ milli: electionCountdown }, true, true, false)}
                        </span>
                    </div>
                    <div className="py-normal px-semilarge flex w-full flex-col items-center justify-between rounded-lg bg-cold-800 md:flex-row">
                        <h3 className="text-medium text-nowrap font-display font-semibold text-white">
                            Custodian Payout
                        </h3>
                        <span className="text-small text-nowrap font-normal text-white">
                            <span className="font-semibold">
                                {e8s.toString(configs?.['PERIOD_CUSTODIAN_PAYOUT'][1] as bigint)}
                            </span>{' '}
                            ACORN /{' '}
                            <span className="font-semibold">
                                {configs?.['PERIOD_DURATION'][1].toString()}
                            </span>{' '}
                            days
                        </span>
                    </div>
                </div>
                <div className="gap-normal flex w-full flex-col md:flex-row">
                    {custodians.map((item) => (
                        <div key={item.principal.toText()} className="w-full">
                            <CustodianCard
                                item={item}
                                isExpanded={expandedCustodian === item.principal.toText()}
                                onToggle={() => handleToggleExpand(item.principal.toText())}
                            />
                        </div>
                    ))}
                </div>
                <Divider
                    direction="horizontal"
                    className="my-medium w-4/5"
                    borderColor="border-cold-800"
                    bgColor="bg-cold-800"
                />
                <NomineesTable />
            </div>
        </>
    )
}

export default CustodiansPage
