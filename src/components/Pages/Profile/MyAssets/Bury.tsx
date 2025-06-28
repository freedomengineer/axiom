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
import { N_DECIMALS } from 'shared/constants'
import e8s from 'shared/utils/e8s'
import proportion, { Proportion } from 'shared/utils/proportion'
import { ACORN, Escrow, Treasury } from 'shared/utils/services'
import { amountOf, valueOf } from 'shared/utils/tokens'
import { Variant } from 'shared/utils/typings'

const Bury = ({ onBury }: { onBury: () => Promise<any> }) => {
    const { agent } = useAuth()

    const [coefficient, setCoefficient] = useState<number>(1)
    const [amount, setAmount] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [balance, setBalance] = useState<bigint>(0n)
    const [balanceRefreshKey, setBalanceRefreshKey] = useState(0)
    const configs = useConfigs('Escrow')

    const bury = async () => {
        setLoading(true)
        const approve = await promise(
            ACORN.call(agent).icrc2_approve({
                amount: amountOf(Number(amount)),
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
        if (!approve.success) {
            setLoading(false)
            return
        }
        await promise(
            Escrow.call(agent).bury(
                amountOf(Number(amount)),
                Variant(COEFFICIENTS[coefficient]) as any
            ),
            'Burying ACORN',
            'Buried ACORN successfully!'
        )
        await onBury()
        setBalanceRefreshKey((prevKey) => prevKey + 1)
        setAmount('')
        setLoading(false)
    }

    const isTooFew =
        !!Number(amount) &&
        Number(amount) < valueOf(configs?.[`BURIAL_${coefficient}X_MIN_DEPOSIT`][1] as bigint)
    const isInsufficient = !!Number(amount) && Number(amount) > e8s.toNumber(balance)

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
                                    <span>
                                        {value} ({key}x)
                                    </span>
                                </div>
                                <div className="gap-small flex items-center">
                                    <span className="font-medium">
                                        ≥{' '}
                                        {valueOf(
                                            configs?.[`BURIAL_${key}X_MIN_DEPOSIT`][1] as bigint
                                        )}
                                    </span>
                                    <AcornIcon className="h-4 -translate-y-0.5 stroke-[1.5px] md:h-5" />
                                </div>
                            </div>
                            <div className="flex w-full items-center justify-between">
                                <div className="flex flex-col items-start">
                                    <span className="text-tiny gap-tiny mb-auto flex items-center text-left font-light">
                                        APR:{' '}
                                        <span className="font-medium">
                                            {proportion.toString(
                                                proportion.mul(
                                                    configs?.[
                                                        `BURIAL_${key}X_DAILY_INTEREST_PROPORTION`
                                                    ][1] as Proportion,
                                                    [365n, 1n]
                                                )
                                            )}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-tiny gap-tiny mb-auto flex items-center text-left font-light">
                                        Duration:{' '}
                                        <span className="font-medium">
                                            {key === '1' ? '89 days' : `${key} years`}
                                        </span>
                                    </span>
                                </div>
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
                        type="text"
                        placeholder="Input your burial amount"
                        value={amount}
                        onChange={(e) => {
                            let val = e.target.value.replace(/,/g, '.')
                            if (!/^\d*\.?\d*$/.test(val)) return
                            const [intPart, decPart] = val.split('.')
                            if (decPart && decPart.length > N_DECIMALS) {
                                val = `${intPart}.${decPart.slice(0, N_DECIMALS)}`
                            }
                            setAmount(val)
                        }}
                        className={cn(
                            'input',
                            !Number(amount)
                                ? 'border-cold-400 focus:ring-cold-600'
                                : !isTooFew && !isInsufficient
                                  ? 'border-green-400 focus:ring-green-600'
                                  : 'border-red-400 focus:ring-red-600'
                        )}
                    />
                    {!!Number(amount) && (isTooFew || isInsufficient) && (
                        <div className="text-tiny flex w-full flex-col text-left">
                            {isTooFew && (
                                <span className="text-red-600">Burial amount is too few</span>
                            )}
                            {isInsufficient && (
                                <span className="text-red-600">Amount exceeds your balance</span>
                            )}
                        </div>
                    )}
                </div>
            )}
            <BalanceChanges
                key={balanceRefreshKey}
                token="ACORN"
                amount={amountOf(Number(amount))}
                setBalance={setBalance}
            />
            <Divider
                className="mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <button
                className="button mx-auto w-auto min-w-36 md:min-w-48"
                onClick={bury}
                disabled={!Number(amount) || isTooFew || isInsufficient || loading}
            >
                {loading ? (
                    <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                ) : !Number(amount) ? (
                    <span>Input your burial amount</span>
                ) : isTooFew ? (
                    <span>Burial amount is too few</span>
                ) : isInsufficient ? (
                    <span>Burial amount exceeds your balance</span>
                ) : (
                    <span className="gap-small flex">
                        Bury with {amount}{' '}
                        <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                    </span>
                )}
            </button>
        </div>
    )
}

export default Bury
