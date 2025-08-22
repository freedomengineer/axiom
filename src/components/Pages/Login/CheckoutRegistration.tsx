'use client'

import { Principal } from '@dfinity/principal'
import { useState } from 'react'

import IcpIcon from '@components/Assets/icp.svg'
import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import useAuth from '@hooks/useAuth'
import { toBytes } from '@libs/crypto'
import { promise } from '@libs/toastify'
import { ESteps, StepProps } from '@utils/login/step'
import e8s from 'shared/utils/e8s'
import { Facade, ICP, Split } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'

const CheckoutRegistration = ({ choices, setChoice, handlePrev, handleNext }: StepProps) => {
    const { agent, refreshUser } = useAuth()

    const [loading, setLoading] = useState<boolean>(false)
    const [isSufficient, setIsSufficient] = useState(true)

    let referrer: Principal | null = null

    try {
        referrer = Principal.fromText(localStorage.getItem('ref')!)
    } catch {}

    const sendTransaction = async () => {
        setLoading(true)
        if (!choices[ESteps.Package]?.coupon) {
            const approve = await promise(
                ICP.call(agent).icrc2_approve({
                    amount: choices[ESteps.Package]!.icpToPay,
                    spender: { owner: Split.principal, subaccount: [] },
                    fee: [],
                    from_subaccount: [],
                    memo: [],
                    created_at_time: [],
                    expected_allowance: [],
                    expires_at: [],
                }),
                'Approving ICP to Axiom Split',
                'Approved ICP to Axiom Split successfully!'
            )
            if (!approve.success) {
                setLoading(false)
                return
            }
            await promise(
                Facade.call(agent)
                    .register(
                        choices[ESteps.Username]!,
                        choices[ESteps.Package]!.package.originalPrice,
                        referrer ? [referrer] : []
                    )
                    .then(() => {
                        handleNext(), setChoice(true)
                    }),
                'Registering to Axiom',
                'Registered to Axiom successfully!'
            )
        } else {
            await promise(
                Facade.call(agent)
                    .registerWithCoupon(
                        choices[ESteps.Username]!,
                        toBytes(choices[ESteps.Package].coupon.replace(/-/g, ''))
                    )
                    .then(() => {
                        handleNext(), setChoice(true)
                    }),
                'Registering to Axiom',
                'Registered to Axiom successfully!'
            )
        }
        await refreshUser()
        setLoading(false)
    }

    return (
        <>
            <div className="gap-small text-small flex flex-col text-cold-700">
                <span>
                    50% of this payment will be directed to the member who you indicate most
                    responsible for recruiting you to Axiom.
                </span>
                <span>
                    If you have no referrer or refer yourself, the funds will be directed instead to
                    the founder of Axiom.
                </span>
            </div>
            <div className="gap-medium flex flex-col">
                <div className="gap-tiny flex flex-col">
                    <p className="text-small text-cold-700">Username</p>
                    <input
                        type="text"
                        value={choices[ESteps.Username]}
                        disabled={true}
                        className="input"
                    />
                </div>
                <div className="gap-tiny flex flex-col">
                    <p className="text-small text-cold-700">Package</p>
                    <input
                        type="text"
                        value={`${choices[ESteps.Package]?.package?.name} (${choices[ESteps.Package]?.package?.symbol}) - ${valueOf(choices[ESteps.Package]?.icpToPay ?? 0)} ICP`}
                        disabled={true}
                        className="input"
                    />
                </div>
                <div className="gap-tiny flex flex-col">
                    <p className="text-small text-cold-700">Referrer</p>
                    <input
                        type="text"
                        value={referrer ? referrer.toText() : 'No Referrer'}
                        disabled={true}
                        className="input"
                    />
                </div>
                <div className="gap-tiny flex flex-col">
                    <p className="text-small text-cold-700">Balance Changes</p>
                    {!choices[ESteps.Package]?.coupon && (
                        <BalanceChanges
                            token="ICP"
                            amount={choices[ESteps.Package]?.icpToPay ?? 0n}
                            sign="-"
                            setIsSufficient={setIsSufficient}
                        />
                    )}
                    <BalanceChanges
                        token="ACORN"
                        amount={choices[ESteps.Package]?.acornToReceive ?? 0n}
                        sign="+"
                    />
                </div>
            </div>
            <div className="gap-small flex items-center justify-between">
                <button
                    className="button w-auto min-w-36 bg-cold-800 md:min-w-48"
                    onClick={handlePrev}
                >
                    Back
                </button>
                <button
                    className="button w-auto min-w-36 md:min-w-48"
                    onClick={sendTransaction}
                    disabled={
                        loading ||
                        !choices[ESteps.Package] ||
                        !choices[ESteps.Username] ||
                        choices[ESteps.Checkout] ||
                        !isSufficient
                    }
                >
                    {loading ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : !choices[ESteps.Username] ? (
                        'Choose a username'
                    ) : !choices[ESteps.Package] ? (
                        'Choose a package'
                    ) : !isSufficient ? (
                        <span>Insufficient ICP balance</span>
                    ) : (
                        <>
                            {choices[ESteps.Package]?.coupon ? (
                                'Register for free'
                            ) : (
                                <>
                                    Pay {e8s.toString(choices[ESteps.Package]?.icpToPay)}{' '}
                                    <IcpIcon className="h-4 w-4 fill-current stroke-0 md:h-5 md:w-5" />
                                </>
                            )}
                        </>
                    )}
                </button>
            </div>
        </>
    )
}

export default CheckoutRegistration
