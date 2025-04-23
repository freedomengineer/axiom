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
                    .then((res) => setCustodians(res.result)),
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

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium flex w-full flex-col items-center">
                <h2 className="text-semilarge font-display font-bold text-primary-700">
                    Custodians
                </h2>
                <div className="gap-normal flex w-full flex-col md:flex-row">
                    <div className="gap-normal grid w-full grid-cols-2 grid-rows-1 md:w-fit md:grid-cols-1 md:grid-rows-2">
                        <div className="py-normal px-semilarge flex w-full flex-col items-center justify-evenly rounded-lg bg-cold-50 shadow-md">
                            <h3 className="text-medium text-nowrap font-display font-semibold text-primary-700">
                                Next Election
                            </h3>
                            <span className="text-small text-nowrap font-normal text-cold-800">
                                {formatTime({ milli: electionCountdown }, true, true, false)}
                            </span>
                        </div>
                        <div className="py-normal px-semilarge flex w-full flex-col items-center justify-evenly rounded-lg bg-cold-50 shadow-md">
                            <h3 className="text-medium text-nowrap font-display font-semibold text-primary-700">
                                Custodian Payout
                            </h3>
                            <span className="text-small text-nowrap font-normal text-cold-800">
                                <span className="font-semibold">
                                    {e8s.toString(
                                        configs?.['PERIOD_CUSTODIAN_PAYOUT'][1] as bigint
                                    )}
                                </span>{' '}
                                ACORN /{' '}
                                <span className="font-semibold">
                                    {configs?.['PERIOD_DURATION'][1].toString()}
                                </span>{' '}
                                days
                            </span>
                        </div>
                    </div>
                    <div className="gap-normal flex flex-col overflow-x-hidden md:flex-row md:overflow-x-auto">
                        {custodians.map((item, i) => (
                            <CustodianCard key={i} item={item} />
                        ))}
                    </div>
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
