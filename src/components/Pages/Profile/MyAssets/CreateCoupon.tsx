import { useState } from 'react'

import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import SelectPackage from '@components/Shared/SelectPackgage'
import useAuth from '@hooks/useAuth'
import { promise } from '@libs/toastify'
import { Choices, ESteps } from '@utils/login/step'
import { DAffiliate } from 'shared/types/services'
import { Affiliate, ICP, Split } from 'shared/utils/services'

const CreateCoupon = ({
    balance,
    refreshBalance,
    setCoupon,
}: {
    balance: bigint
    refreshBalance: () => Promise<void>
    setCoupon: (coupon: DAffiliate.PrivateSharableCoupon) => void
}) => {
    const { agent } = useAuth()

    const [choice, setChoice] = useState<Choices[ESteps.Package]>(null)
    const [isPriceReady, setIsPriceReady] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const createCoupon = async () => {
        if (!choice) return

        setLoading(true)
        const approve = await promise(
            ICP.call(agent).icrc2_approve({
                amount: choice.icpToPay,
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
        const res = await promise(
            Affiliate.call(agent).createCoupon(choice.package.originalPrice),
            'Creating coupon',
            'Coupon created successfully!'
        )
        if (!res.success) {
            setLoading(false)
            return
        }
        setCoupon(res.result)
        setLoading(false)
    }

    return (
        <div className="gap-normal flex flex-col">
            <SelectPackage
                balance={balance}
                choice={choice}
                setChoice={setChoice}
                setIsPriceReady={setIsPriceReady}
                refreshBalance={refreshBalance}
            />
            <BalanceChanges
                token="ICP"
                amount={choice?.icpToPay ?? 0n}
                sign="-"
                balance={balance}
            />

            <button
                className="button mx-auto w-auto min-w-36 md:min-w-48"
                onClick={createCoupon}
                disabled={!choice || !isPriceReady || balance < choice.icpToPay || loading}
            >
                {loading ? (
                    <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                    <>
                        {!choice
                            ? 'Choose a package'
                            : !isPriceReady
                              ? 'Loading price...'
                              : balance < choice.icpToPay
                                ? 'Insufficient balance'
                                : 'Create ' + choice.package.name + ' coupon'}
                    </>
                )}
            </button>
        </div>
    )
}

export default CreateCoupon
