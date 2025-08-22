import { Dispatch, useEffect, useState } from 'react'

import ForwardIcon from '@components/Assets/forward.svg'
import MinusIcon from '@components/Assets/minus.svg'
import PlusIcon from '@components/Assets/plus.svg'
import useAuth from '@hooks/useAuth'
import cn from '@libs/class'
import e8s from 'shared/utils/e8s'
import { ACORN, ICP } from 'shared/utils/services'

import Deposit, { TOKENS } from './Deposit'
import Popup from './Popup'

const Signs = {
    '+': <PlusIcon className="w-2 stroke-[1.5px]" />,
    '-': <MinusIcon className="w-2 stroke-[1.5px]" />,
}

const BalanceChanges = ({
    token = 'ACORN',
    amount,
    sign = '-',
    setIsSufficient,
    balance,
    setBalance,
}: {
    token?: 'ACORN' | 'ICP'
    amount: bigint
    sign?: '+' | '-'
    setIsSufficient?: Dispatch<boolean>
    balance?: bigint
    setBalance?: Dispatch<bigint>
}) => {
    const { principal } = useAuth()
    const [localBalance, setLocalBalance] = useState<bigint | undefined>(balance)
    const [isOpenDeposit, setIsOpenDeposit] = useState<boolean>(false)

    useEffect(() => {
        if (isOpenDeposit) return
        ;(async () => {
            const local: bigint =
                balance === undefined
                    ? await (token === 'ICP' ? ICP : ACORN)
                          .call()
                          .icrc1_balance_of({ owner: principal!, subaccount: [] })
                    : balance

            console.log(local)
            setLocalBalance(local)
            setBalance?.(local)
            setIsSufficient?.(sign === '+' ? amount >= local : amount <= local)
        })()
    }, [isOpenDeposit, balance])

    if (localBalance === undefined)
        return (
            <div className="h-12 w-full animate-pulse rounded-md bg-cold-50 ring-1 ring-cold-300 md:h-14" />
        )

    return (
        <div className="text-small flex w-full flex-col">
            <Popup
                open={isOpenDeposit}
                onClose={() => setIsOpenDeposit(false)}
                title={`Deposit ${token}`}
                className="w-auto"
            >
                <Deposit token={token} />
            </Popup>
            <div
                className={cn(
                    'py-tiny px-normal  relative flex w-full items-center justify-between rounded-md border border-cold-400',
                    localBalance >= amount || sign === '+' ? 'border-cold-400' : 'border-red-400'
                )}
            >
                <div className="z-10 mr-auto grid items-center font-semibold">
                    <span className="gap-tiny flex items-center">
                        {e8s.toString(localBalance, 8)}
                        {TOKENS[token].SmallIcon}
                    </span>
                    <button
                        className="gap-tiny px-small md:py-extratiny !text-extratiny flex w-min items-center rounded-lg bg-black/5 py-0 font-light hover:bg-black/10"
                        onClick={() => setIsOpenDeposit(true)}
                    >
                        Deposit
                        <PlusIcon className="w-3" />
                    </button>
                </div>
                <div className="absolute inset-0 z-0 flex w-full items-center justify-center space-x-[-12px]">
                    <ForwardIcon className="arrow h-4 w-4 stroke-[1.5px] md:h-6 md:w-6" />
                    <ForwardIcon className="arrow h-4 w-4 stroke-[1.5px] md:h-6 md:w-6" />
                    <ForwardIcon className="arrow h-4 w-4 stroke-[1.5px] md:h-6 md:w-6" />
                </div>
                <div className="z-10 ml-auto grid items-center font-semibold">
                    <span className="gap-tiny flex items-center justify-end text-right">
                        {sign === '+'
                            ? e8s.toString(localBalance + amount, 8)
                            : localBalance >= amount
                              ? e8s.toString(localBalance - amount, 8)
                              : 'Insufficient'}{' '}
                        {TOKENS[token].SmallIcon}
                    </span>
                    <div
                        className={cn(
                            'gap-small !text-extratiny px-small md:py-extratiny ml-auto flex w-min items-center rounded-lg py-0 font-light text-white',
                            sign === '+' ? 'bg-green-700/90' : 'bg-red-700/90'
                        )}
                    >
                        {Signs[sign]}
                        {e8s.toString(amount, 8)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BalanceChanges
