'use client'

import { useEffect, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import Popup from '@components/Shared/Popup'
import useAuth from '@hooks/useAuth'
import { refreshSpecificUserData } from '@hooks/useUserData'
import cn from '@libs/class'
import { formatDate, formatDateTime } from '@libs/date'
import { promise } from '@libs/toastify'
import { COEFFICIENTS } from '@utils/escrow/burial'
import { DEscrow } from 'shared/types/services'
import { Escrow } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'

import Bury from './Bury'

const BurialsTab = ({
    burials,
    buriedAmount,
    fetchBurials,
    refreshBalances,
}: {
    burials: DEscrow.SharableBurial[]
    buriedAmount: bigint
    fetchBurials: () => Promise<void>
    refreshBalances: () => Promise<void>
}) => {
    const { agent, principal } = useAuth()

    const [votingPower, setVotingPower] = useState<bigint>(0n)
    const [expiredAmount, setExpiredAmount] = useState<bigint>(0n)

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        Promise.all([
            Escrow.call().getVotingPower(principal!).then(setVotingPower),
            Escrow.call().getExpiredAmount(principal!).then(setExpiredAmount),
            fetchBurials(),
        ])
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
                className="w-full md:w-4/5 md:min-w-[1100px]"
                Icon={<AcornIcon className="h-6 w-6 md:h-7 md:w-7" />}
            >
                <Bury onBury={async () => Promise.all([fetchBurials(), refreshBalances()])} />
            </Popup>
            <div className="gap-normal grid w-full grid-cols-2 grid-rows-2 items-center md:grid-cols-4 md:grid-rows-1">
                <div className="text-small py-small px-medium gap-normal flex w-full items-center justify-between text-nowrap rounded-lg border border-cold-200 bg-cold-50">
                    <span className="font-semibold text-cold-700">Voting pwr.</span>
                    <span className="font-semibold text-cold-700">
                        {valueOf(votingPower ?? 0n)}
                    </span>
                </div>
                <button className="button h-full bg-cold-800" onClick={() => setOpen(true)}>
                    Bury ACORN
                </button>
                <div className="text-small py-small px-medium gap-normal flex w-full items-center justify-between text-nowrap rounded-lg border border-cold-200 bg-cold-50">
                    <span className="font-semibold text-cold-700">Buried amt.</span>
                    <span className="font-semibold text-cold-700">
                        {valueOf((buriedAmount ?? 0n) - (expiredAmount ?? 0n))}{' '}
                        <span className="font-normal text-red-700">
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
            {burials?.length !== 0 && (
                <div className="w-full overflow-x-auto rounded-lg border border-cold-200 md:overflow-hidden">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-cold-50">
                            <tr>
                                {[
                                    'No.',
                                    'Type',
                                    'Amount',
                                    'Power.',
                                    'Issued date',
                                    'Expiry date',
                                    'Interest',
                                ].map((title, i) => (
                                    <th
                                        key={i}
                                        scope="col"
                                        className={cn(
                                            'text-small px-normal py-small select-none text-nowrap bg-cold-100',
                                            'border-b border-r border-cold-200',
                                            i === 0 && 'border-l-0',
                                            i === 6 && 'border-r-0'
                                        )}
                                    >
                                        <div className="flex w-full items-center justify-center font-semibold text-cold-700">
                                            <span>{title}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cold-200 bg-white text-left">
                            {burials?.map((burial, i) => {
                                const isLastRow = i === burials.length - 1

                                return (
                                    <tr key={i} className="group hover:bg-cold-50">
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                                'border-b border-r border-cold-200',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            {i + 1}
                                        </td>
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                                'border-b border-r border-cold-200',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            {burial.coefficient.toString()}x (
                                            {COEFFICIENTS[burial.coefficient.toString()]})
                                        </td>
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                                'border-b border-r border-cold-200',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            {valueOf(burial.amount)}
                                        </td>
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                                'border-b border-r border-cold-200',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            {valueOf(burial.amount * burial.coefficient)}
                                        </td>
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                                'border-b border-r border-cold-200',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            {formatDateTime({ nano: burial.issueDate })}
                                            <span className="hidden font-semibold text-cold-600 md:inline">
                                                {' '}
                                                ({formatDate({ nano: burial.issueDate }, true)})
                                            </span>
                                        </td>
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                                'border-b border-r border-cold-200',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            {formatDateTime({ nano: burial.expiryDate })}
                                            <span className="hidden font-semibold text-cold-600 md:inline">
                                                {' '}
                                                ({formatDate({ nano: burial.expiryDate }, true)})
                                            </span>
                                        </td>
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                                'border-b border-cold-200',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            {valueOf(burial.claimableInterest)}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default BurialsTab
