'use client'

import { useEffect, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import Popup from '@components/Shared/Popup'
import useAuth from '@hooks/useAuth'
import useUserData, { refreshSpecificUserData } from '@hooks/useUserData'
import { formatDate, formatDateTime } from '@libs/date'
import { promise } from '@libs/toastify'
import { COEFFICIENTS } from '@utils/escrow/burial'
import { DEscrow } from 'shared/types/services'
import { Escrow } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'

import Bury from './Bury'

const BurialsTable = ({
    burials,
    votingPower,
    buriedAmount,
    expiredAmount,
    fetchBurials,
    refreshBalances,
}: {
    burials: DEscrow.SharableBurial[]
    votingPower: bigint
    buriedAmount: bigint
    expiredAmount: bigint
    fetchBurials: () => Promise<void>
    refreshBalances: () => Promise<void>
}) => {
    const { agent, principal } = useAuth()

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        fetchBurials()
    }, [])

    const withdraw = async () => {
        setLoading(true)
        await promise(
            Escrow.call(agent).withdrawAll(),
            'Withdrawing interests & expired burials',
            'Withdrawn interests & expired burials successfully!'
        )
        await Promise.all([
            fetchBurials(),
            refreshBalances(),
            refreshSpecificUserData(principal!, 'escrowClaimable'),
        ])
        setLoading(false)
    }

    return (
        <div className="gap-medium flex flex-col">
            <Popup
                title="Bury ACORN"
                open={open}
                onClose={() => setOpen(false)}
                className="w-full md:w-4/5"
                Icon={<AcornIcon className="h-6 w-6 md:h-7 md:w-7" />}
            >
                <Bury onBury={async () => Promise.all([fetchBurials(), refreshBalances()])} />
            </Popup>
            <div className="gap-normal grid w-full grid-cols-2 grid-rows-2 items-center md:grid-cols-4 md:grid-rows-1">
                <div className="text-small py-small px-medium gap-normal flex w-full items-center justify-between text-nowrap rounded-lg bg-cold-50 shadow-md">
                    <span className="text-cold-800">Voting pwr.</span>
                    <span className="font-semibold text-cold-800">
                        {valueOf(votingPower ?? 0n)}
                    </span>
                </div>
                <button className="button h-full bg-cold-800" onClick={() => setOpen(true)}>
                    Bury ACORN
                </button>
                <div className="text-small py-small px-medium gap-normal flex w-full items-center justify-between text-nowrap rounded-lg bg-cold-50 shadow-md">
                    <span className="text-cold-800">Buried amt.</span>
                    <span className="font-semibold text-cold-800">
                        {valueOf((buriedAmount ?? 0n) - (expiredAmount ?? 0n))}{' '}
                        <span className="font-normal text-red-600">
                            (-{valueOf(expiredAmount ?? 0n)})
                        </span>
                    </span>
                </div>
                <button
                    className="button h-full"
                    onClick={withdraw}
                    disabled={
                        loading ||
                        (expiredAmount === 0n && burials?.every((b) => b.claimableInterest === 0n))
                    }
                >
                    {loading ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                        'Withdraw interests & exp. burials'
                    )}
                    <div
                        className="absolute -top-[1.8rem] right-[1.9rem] z-50 aria-hidden:hidden"
                        aria-hidden={
                            expiredAmount === 0n &&
                            burials?.every((b) => b.claimableInterest === 0n)
                        }
                    >
                        <div className="live-dot"></div>
                        <div className="live-animated"></div>
                    </div>
                </button>
            </div>
            <div className="overflow-y-auto rounded-lg shadow-md md:overflow-hidden">
                <table className="min-w-full divide-y divide-cold-200">
                    <thead className="bg-cold-50">
                        <tr>
                            {[
                                'No.',
                                'Type',
                                'Amt.',
                                'Pwr.',
                                'Issued date',
                                'Expiry date',
                                'Claimable int.',
                            ].map((head) => (
                                <th
                                    key={head}
                                    scope="col"
                                    className="text-tiny py-small px-medium text-left font-semibold text-cold-700"
                                >
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cold-200 bg-white text-left">
                        {burials?.map((burial, i) => (
                            <tr key={i} className="hover:bg-cold-50">
                                <td className="text-tiny py-normal px-medium whitespace-nowrap text-cold-600">
                                    {i + 1}
                                </td>
                                <td className="text-tiny py-normal px-medium whitespace-nowrap text-cold-600">
                                    {burial.coefficient.toString()}x (
                                    {COEFFICIENTS[burial.coefficient.toString()]})
                                </td>
                                <td className="text-tiny py-normal px-medium whitespace-nowrap font-semibold text-cold-900">
                                    {valueOf(burial.amount)}
                                </td>
                                <td className="text-tiny py-normal px-medium whitespace-nowrap font-semibold text-cold-900">
                                    {valueOf(burial.amount * burial.coefficient)}
                                </td>
                                <td className="text-tiny py-normal px-medium whitespace-nowrap text-cold-600">
                                    {formatDateTime({ nano: burial.issueDate })}
                                    <span className="hidden font-semibold text-cold-600 md:inline">
                                        {' '}
                                        ({formatDate({ nano: burial.issueDate }, true)})
                                    </span>
                                </td>
                                <td className="text-tiny py-normal px-medium whitespace-nowrap text-cold-600">
                                    {formatDateTime({ nano: burial.expiryDate })}
                                    <span className="hidden font-semibold text-cold-600 md:inline">
                                        {' '}
                                        ({formatDate({ nano: burial.expiryDate }, true)})
                                    </span>
                                </td>
                                <td className="text-tiny py-normal px-medium whitespace-nowrap font-semibold text-cold-900">
                                    {valueOf(burial.claimableInterest)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default BurialsTable
