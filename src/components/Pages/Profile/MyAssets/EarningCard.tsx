import { useEffect, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import IcpIcon from '@components/Assets/icp.svg'
import Spinner from '@components/Primitives/Spinner'
import Divider from '@components/Shared/Divider'
import { formatDate } from '@libs/date'
import { promise } from '@libs/toastify'
import { DAxioms } from 'shared/types/services'
import e8s from 'shared/utils/e8s'

const Earning = ({
    earning,
    token,
}: {
    earning: DAxioms.SharableEarning
    token: 'ACORN' | 'ICP'
}) => {
    return (
        <div className="my-auto flex h-min justify-between">
            <p className="text-small font-light">Revenue</p>
            <span className="text-small gap-small flex items-center justify-end">
                <span className="font-semibold">{e8s.toString(earning.revenue, 4)}</span>
                <span className="font-normal text-green-600">
                    (+{e8s.toString(earning.balance, 4)})
                </span>
                {token === 'ACORN' ? (
                    <AcornIcon className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                    <IcpIcon className="h-5 w-5 fill-current stroke-0 md:h-6 md:w-6" />
                )}
            </span>
        </div>
    )
}

const EarningCard = ({
    name,
    earnableList,
    token,
    getEarning,
    claimEarning,
    refreshBalances,
}: {
    name: string
    earnableList: string[]
    token: 'ACORN' | 'ICP' | 'all'
    getEarning: () => Promise<
        DAxioms.SharableEarning | [DAxioms.SharableEarning, DAxioms.SharableEarning]
    >
    claimEarning: () => Promise<
        DAxioms.SharableEarning | [DAxioms.SharableEarning, DAxioms.SharableEarning]
    >
    refreshBalances: () => Promise<void>
}) => {
    const [earning, setEarning] = useState<
        DAxioms.SharableEarning | [DAxioms.SharableEarning, DAxioms.SharableEarning]
    >()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getEarning().then(setEarning)
    }, [])

    const claim = async () => {
        setLoading(true)
        const res = await promise(
            claimEarning(),
            `Claiming ${name} rewards`,
            `Claimed ${name} rewards successfully`
        )
        if (res.success) setEarning(res.result)
        refreshBalances()
        setLoading(false)
    }

    if (!earning)
        return (
            <div className="p-medium flex h-full animate-pulse flex-col items-center justify-center rounded-lg border-2 border-cold-200"></div>
        )

    return (
        <div className="gap-medium p-semilarge relative flex h-min w-full flex-col rounded-lg border border-cold-200 bg-white text-cold-800 shadow-md md:h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-medium font-display font-bold text-primary-700">{name}</h3>
                <p className="text-tiny font-light italic text-cold-800">
                    claimed{' '}
                    {formatDate(
                        {
                            nano: Array.isArray(earning)
                                ? earning[0].lastWithdrawAt > earning[1].lastWithdrawAt
                                    ? earning[0].lastWithdrawAt
                                    : earning[1].lastWithdrawAt
                                : earning.lastWithdrawAt,
                        },
                        true
                    )}
                </p>
            </div>
            <div className="flex flex-col justify-between">
                {token === 'all' ? (
                    <div className="flex h-12 flex-col justify-between">
                        <Earning earning={earning[0]} token="ACORN" />
                        <Earning earning={earning[1]} token="ICP" />
                    </div>
                ) : (
                    <div className="flex h-6 flex-col justify-between md:h-12">
                        <Earning earning={earning as DAxioms.SharableEarning} token={token} />
                    </div>
                )}
            </div>
            <Divider bgColor="bg-cold-600" direction="horizontal" borderColor="border-cold-600" />
            <ul className="text-tiny mb-auto text-center font-light italic">
                {earnableList.map((earnable, i) => (
                    <li key={i}>{earnable}</li>
                ))}
            </ul>
            <button
                className="button"
                onClick={claim}
                disabled={
                    loading ||
                    (Array.isArray(earning)
                        ? earning[0].balance === 0n && earning[1].balance === 0n
                        : earning.balance === 0n)
                }
            >
                <div
                    className="absolute -top-[1.8rem] right-[1.9rem] z-50 aria-hidden:hidden"
                    aria-hidden={
                        Array.isArray(earning)
                            ? earning[0].balance === 0n && earning[1].balance === 0n
                            : earning.balance === 0n
                    }
                >
                    <div className="live-dot"></div>
                    <div className="live-animated"></div>
                </div>
                {loading ? <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" /> : 'Claim'}
            </button>
        </div>
    )
}

export default EarningCard
