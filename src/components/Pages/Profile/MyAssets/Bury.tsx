import { useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import Divider from '@components/Shared/Divider'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { COEFFICIENTS } from '@utils/escrow/burial'
import { ACORN, Escrow, Treasury } from 'shared/utils/services'
import { amountOf, valueOf } from 'shared/utils/tokens'
import { Variant } from 'shared/utils/typings'

const Bury = ({ onBury }: { onBury: () => Promise<any> }) => {
    const { agent } = useAuth()

    const [coefficient, setCoefficient] = useState<number>(1)
    const [amount, setAmount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const configs = useConfigs('Escrow')

    const bury = async () => {
        setLoading(true)
        await promise(
            ACORN.call(agent).icrc2_approve({
                amount: amountOf(amount),
                spender: { owner: Treasury.principal, subaccount: [] },
                fee: [],
                from_subaccount: [],
                memo: [],
                created_at_time: [],
                expected_allowance: [],
                expires_at: [],
            }),
            'Approving ACORN to Axiom Treasury',
            'Approved ACORN to Axiom Treasury successfully!'
        )
        await promise(
            Escrow.call(agent).bury(amountOf(amount), Variant(COEFFICIENTS[coefficient]) as any),
            'Burying ACORN',
            'Buried ACORN successfully!'
        )
        await onBury()
        setLoading(false)
    }

    const isTooFew = amount < valueOf(configs?.[`BURIAL_${coefficient}X_MIN_DEPOSIT`][1] as bigint)

    return (
        <div className="gap-semilarge flex flex-col">
            <div className="gap-medium flex w-full flex-col justify-center">
                <p className="text-medium text-center font-light">Select your burial type</p>
                <div className="gap-normal mx-auto grid w-full grid-cols-1 grid-rows-4 md:grid-cols-4 md:grid-rows-1">
                    {Object.entries(COEFFICIENTS).map(([key, value]) => (
                        <button
                            key={key}
                            className="gap-small p-medium group flex w-full transform flex-col items-center justify-center rounded-xl border-2 border-cold-800 bg-cold-800 bg-opacity-0 text-cold-800 transition-all duration-300 ease-in-out hover:bg-opacity-20 aria-checked:bg-opacity-100 aria-checked:text-white aria-checked:hover:bg-opacity-80"
                            onClick={() => setCoefficient(Number(key))}
                            aria-checked={coefficient.toString() === key}
                        >
                            <div className="text-medium flex w-full items-center justify-between">
                                <div className="gap-small flex items-center">
                                    <span>{value}</span>
                                </div>
                                <div className="gap-small flex items-center">
                                    <span>{key}x</span>
                                </div>
                            </div>
                            <div className="flex w-full items-center justify-between">
                                <span className="text-tiny gap-tiny mb-auto flex items-center text-left font-light">
                                    Min:{' '}
                                    <span className="font-medium">
                                        {valueOf(
                                            configs?.[`BURIAL_${key}X_MIN_DEPOSIT`][1] as bigint
                                        )}
                                    </span>
                                    <AcornIcon className="h-4 stroke-[1.5px] md:h-5" />
                                </span>
                                <span className="text-tiny gap-tiny mb-auto flex items-center text-left font-light">
                                    Duration:{' '}
                                    <span className="font-medium">
                                        {key === '1' ? '89 days' : `${key} years`}
                                    </span>
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <Divider
                className="mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <p className="text-medium text-center font-light">Fill in your burial amount</p>
            {!coefficient ? (
                <p className="text-medium text-center font-light text-cold-400">
                    Please select at least one burial type
                </p>
            ) : (
                <div className="gap-small flex w-full flex-col items-center text-cold-600">
                    <input
                        type="number"
                        placeholder="Input your burial amount"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className={cn(
                            'input',
                            amount === 0
                                ? 'border-cold-400 focus:ring-cold-600'
                                : !isTooFew
                                  ? 'border-green-400 focus:ring-green-600'
                                  : 'border-red-400 focus:ring-red-600'
                        )}
                    />
                    {amount > 0 && (
                        <div className="text-tiny flex w-full flex-col text-left">
                            {isTooFew && (
                                <span className="text-red-600">Burial amount is too few</span>
                            )}
                        </div>
                    )}
                </div>
            )}
            {coefficient && amount !== 0 && <BalanceChanges amount={amountOf(amount)} />}
            <Divider
                className="mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <button
                className="py-normal gap-small group mx-auto flex w-60 transform items-center justify-center rounded-lg bg-primary-600 text-white transition-all duration-300 ease-in-out hover:bg-opacity-80 disabled:pointer-events-none disabled:opacity-50"
                onClick={bury}
                disabled={amount === 0 || isTooFew || loading}
            >
                {loading ? (
                    <Spinner color="white" className="h-6 w-6" />
                ) : amount === 0 ? (
                    <span>Input your burial amount</span>
                ) : (
                    <span className="gap-small flex">
                        Bury with {amount} <AcornIcon className="h-6 stroke-[1.5px]" />
                    </span>
                )}
            </button>
        </div>
    )
}

export default Bury
