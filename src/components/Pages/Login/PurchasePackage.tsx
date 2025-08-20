import { Principal } from '@dfinity/principal'
import { useEffect, useState } from 'react'

import SelectPackage from '@components/Shared/SelectPackgage'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import usePackages, { EPackages, ParsedMembershipPackage } from '@hooks/usePackages'
import { sha256 } from '@libs/crypto'
import { formatDate } from '@libs/date'
import { error } from '@libs/toastify'
import { Choices, ESteps, StepProps } from '@utils/login/step'
import { DSales } from 'shared/types/services'
import proportion, { Proportion } from 'shared/utils/proportion'
import { Affiliate, ICP } from 'shared/utils/services'
import { UnwrapVariant } from 'shared/utils/typings'

const PurchasePackage = ({ choices, setChoice, handlePrev, handleNext }: StepProps) => {
    const { principal } = useAuth()
    const splitConfigs = useConfigs('Split')
    const configs = useConfigs('Sales')

    const [selectedPackage, setSelectedPackage] = useState<Choices[ESteps.Package]>(
        choices[ESteps.Package]
    )
    const [balance, setBalance] = useState<bigint>(0n)
    const [isPriceReady, setIsPriceReady] = useState<boolean>(false)
    const [coupon, setCoupon] = useState<string | null | undefined>(
        choices[ESteps.Package]?.coupon ?? localStorage.getItem('code') ?? undefined
    )

    const packages = (usePackages(EPackages.Membership, configs) ?? []) as ParsedMembershipPackage[]

    useEffect(() => {
        if (principal) {
            ICP.call()
                .icrc1_balance_of({ owner: principal, subaccount: [] })
                .then(setBalance)
                .catch(() => {})
        }
        if (coupon) {
            updateCoupon(coupon, () => {
                localStorage.removeItem('code')
                setCoupon(null)
            })
        }
    }, [principal])

    const refreshBalance = async () => {
        if (!principal) return
        return ICP.call()
            .icrc1_balance_of({ owner: principal, subaccount: [] })
            .then(setBalance)
            .catch(() => {})
    }

    const updateCoupon = async (code: string | null, onRedeemed?: () => void) => {
        if (code === null) {
            setCoupon(null)
            return
        }
        if (code === '') return
        else {
            if (
                /^[0-9a-fA-F]{32}$/.test(code) ||
                /^([0-9a-fA-F]{4}-){7}[0-9a-fA-F]{4}$/.test(code)
            ) {
                const hash = sha256(code.replace(/-/g, ''))

                let res
                try {
                    res = await Affiliate.call(undefined, true).getCoupon(hash)
                } catch (e) {
                    onRedeemed?.()
                    return null
                }

                const status = UnwrapVariant(res.status)

                if (status[0] === 'Redeemed' || status[0] === 'Locked') {
                    error(
                        `Coupon already redeemed by ${(status[1] as any).by.toText()} ${(formatDate({ nano: (status[1] as any).timestamp }), true)}`
                    )
                } else if (
                    status === 'Available' ||
                    (status[0] === 'Failed' && principal?.compareTo((status[1] as any).by) === 'eq')
                ) {
                    setCoupon(code)
                    const p = packages.find((p) => p.originalPrice === res.capitalRaised)!
                    localStorage.setItem('ref', res.creator.toText())
                    setSelectedPackage({
                        package: p,
                        icpToPay: 0n,
                        acornToReceive: p.acornLiquid[0],
                        coupon: code,
                    })
                }
            }
        }
    }

    return (
        <>
            <div className="gap-small text-small flex flex-col text-cold-700">
                <span>
                    You are buying a membership in the Axiom free thought platform. ACORNs are for
                    use on Axiom and are not considered to have any value outside of this platform.
                    However Acorns do trade on other ICP platforms.
                </span>
                <span>
                    {"Membership packages are priced in USD and purchased with ICP tokens. Here's "}
                    <a
                        href="https://coinbase.com/price/icp"
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-cold-700/50 decoration-2 underline-offset-4 hover:decoration-cold-800/100"
                    >
                        how to get some ICP
                    </a>
                    . {proportion.toString(splitConfigs?.['AFFILIATE_PROPORTION'][1] as Proportion)}{' '}
                    of each membership sale goes directly to the member who recruited you.
                </span>
                <span>
                    Note that 50% of your ACORNs will in liquid form and 50% will be staked for 89
                    days.
                </span>
                <span>
                    Packages can be upgraded when you accumulate ACORNs. If you want a larger stake
                    in Axiom, and more advantage in 'mining crypto with your mind' then buy a larger
                    membership package now.
                </span>
            </div>
            <div className="relative">
                <SelectPackage
                    balance={balance}
                    choice={selectedPackage}
                    setChoice={coupon ? () => {} : setSelectedPackage}
                    setIsPriceReady={setIsPriceReady}
                    refreshBalance={refreshBalance}
                    coupon={coupon}
                    setCoupon={(coupon) => updateCoupon(coupon)}
                    packages={packages}
                />
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
                    onClick={() => {
                        setChoice(selectedPackage)
                        handleNext()
                    }}
                    disabled={
                        !selectedPackage ||
                        !isPriceReady ||
                        (!coupon && balance < selectedPackage.icpToPay) ||
                        choices[ESteps.Checkout]
                    }
                >
                    {!selectedPackage
                        ? 'Choose a package'
                        : !isPriceReady
                          ? 'Loading price...'
                          : !coupon && balance < selectedPackage.icpToPay
                            ? 'Insufficient balance'
                            : 'Continue with ' + selectedPackage.package.name}
                </button>
            </div>
        </>
    )
}

export default PurchasePackage
