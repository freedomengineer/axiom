import { Accordion, AccordionBody, AccordionHeader, Tooltip } from '@material-tailwind/react'
import { useEffect, useState } from 'react'

import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { Choices, ESteps, StepProps } from '@utils/login/step'
import { ICP_FEE } from 'shared/constants'
import { DSales } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import proportion, { Proportion } from 'shared/utils/proportion'
import { ICP, Sales } from 'shared/utils/services'
import { amountOf, getCurrentPrice } from 'shared/utils/tokens'

const PurchasePackage = ({ choices, setChoice, handlePrev, handleNext }: StepProps) => {
    const { principal } = useAuth()
    const configs = useConfigs('Sales')
    const splitConfigs = useConfigs('Split')

    const [packages, setPackages] = useState<DSales.SharablePackage[]>([])
    const [currentPrice, setCurrentPrice] = useState<bigint>(0n)
    const [selectedPackage, setSelectedPackage] = useState<Choices[ESteps.Package]>(
        choices[ESteps.Package]
    )
    const [balance, setBalance] = useState<bigint>(0n)
    const [slippage, setSlippage] = useState<number>(5) // 5%

    useEffect(() => {
        Promise.all([
            getCurrentPrice().then(setCurrentPrice),
            Sales.call().getPackages().then(setPackages),
            ICP.call().icrc1_balance_of({ owner: principal!, subaccount: [] }).then(setBalance),
        ])
    }, [])

    const handleOpen = (choice: Choices[ESteps.Package]) =>
        setSelectedPackage(
            selectedPackage?.package.capitalRaised === choice?.package.capitalRaised ? null : choice
        )

    return (
        <>
            <div className="gap-small text-small flex flex-col text-cold-600">
                <span>
                    You are buying a membership in the Axiom free thought platform. The ACORNs that
                    you receive by doing so are for use on the platform and are not considered to
                    have any value outside of this utility.
                </span>
                <span>
                    {
                        "Membership packages are paid in ICP tokens in consistent with a fixed USD price. Here's "
                    }
                    <a
                        href="https://coinbase.com/price/icp"
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-cold-600/50 decoration-2 underline-offset-4 hover:text-cold-800 hover:decoration-cold-800/100"
                    >
                        how to get some ICP
                    </a>
                    . {proportion.toString(splitConfigs?.['AFFILIATE_PROPORTION'][1] as Proportion)}{' '}
                    of each membership sale goes directly to the member who recruited you.
                </span>
                <span>
                    Note that{' '}
                    {proportion.toString(
                        configs?.['ACORN_LIQUID_MINT_PROPORTION'][1] as Proportion
                    )}{' '}
                    of your Acorns will in liquid form and{' '}
                    {proportion.toString(
                        configs?.['ACORN_BURIED_MINT_PROPORTION'][1] as Proportion
                    )}{' '}
                    will be staked for 89 days.
                </span>
                <span>Packages are only purchasable once per account.</span>
            </div>
            <div className="gap-extratiny flex h-max flex-col">
                <p className="text-small mb-2 ml-auto font-light">
                    Current Price: 1 ICP ={' '}
                    <span className="text-medium font-bold text-primary-600">
                        {e8s.toNumber(currentPrice)}
                    </span>{' '}
                    USD
                </p>
                {configs &&
                    packages.map((p) => {
                        const usdPrice = e8s.toNumber(p.capitalRaised)
                        const adjustedUsdPrice =
                            usdPrice *
                            proportion.toFloat(
                                configs['PRICE_ADJUSTMENT_PROPORTION'][1] as Proportion
                            )

                        const icpPrice = adjustedUsdPrice / e8s.toNumber(currentPrice)
                        const icpFee = e8s.toNumber(ICP_FEE)
                        const slippageTolerance = icpPrice * (slippage / 100)
                        const icpToPay = icpPrice + icpFee + slippageTolerance

                        const liquidProportion = proportion.toFloat(
                            configs['ACORN_LIQUID_MINT_PROPORTION'][1] as Proportion
                        )
                        const buriedProportion = proportion.toFloat(
                            configs['ACORN_BURIED_MINT_PROPORTION'][1] as Proportion
                        )

                        const acornRewarded = usdPrice * liquidProportion
                        const acornBuried = usdPrice * buriedProportion
                        const isSelected =
                            selectedPackage?.package.capitalRaised === p.capitalRaised

                        return (
                            <Accordion
                                key={p.capitalRaised}
                                open={isSelected}
                                disabled={
                                    e8s.toNumber(balance) < icpToPay || choices[ESteps.Checkout]
                                }
                                icon={
                                    <>
                                        <p
                                            className={cn(
                                                '!text-normal hidden border-b-0 font-medium transition-colors md:block',
                                                isSelected
                                                    ? 'text-primary-600 group-hover:pointer-events-none group-hover:text-primary-600'
                                                    : 'text-cold-500 group-hover:cursor-pointer group-hover:text-cold-700'
                                            )}
                                        >
                                            {usdPrice} * (
                                            {proportion.toString(
                                                configs?.[
                                                    'PRICE_ADJUSTMENT_PROPORTION'
                                                ][1] as Proportion
                                            )}
                                            ) = {adjustedUsdPrice} USD
                                        </p>
                                        <p
                                            className={cn(
                                                '!text-normal block border-b-0 font-medium transition-colors md:hidden',
                                                isSelected
                                                    ? 'text-primary-600 group-hover:pointer-events-none group-hover:text-primary-600'
                                                    : 'text-cold-500 group-hover:cursor-pointer group-hover:text-cold-700'
                                            )}
                                        >
                                            ${adjustedUsdPrice} * (
                                            {proportion.toString(
                                                configs?.[
                                                    'PRICE_ADJUSTMENT_PROPORTION'
                                                ][1] as Proportion
                                            )}
                                            )
                                        </p>
                                    </>
                                }
                                className={cn(
                                    'group h-max rounded-lg border px-4',
                                    isSelected
                                        ? 'border-primary-600'
                                        : 'border-cold-200 hover:border-cold-500'
                                )}
                            >
                                <AccordionHeader
                                    onClick={() =>
                                        handleOpen({
                                            package: p,
                                            icpToPay: amountOf(icpToPay),
                                            acornToReceive: amountOf(acornRewarded),
                                        })
                                    }
                                    className={cn(
                                        'border-b-0 font-medium transition-colors',
                                        isSelected
                                            ? 'text-primary-600 group-hover:pointer-events-none group-hover:text-primary-600'
                                            : 'text-cold-600 hover:text-cold-800 group-hover:cursor-pointer'
                                    )}
                                >
                                    <div className="gap-medium text-normal flex items-center">
                                        <input
                                            type="radio"
                                            name={`radio-${p.capitalRaised}`}
                                            checked={isSelected}
                                            className="h-4 w-4 rounded-full accent-primary-600 md:h-5 md:w-5"
                                        />
                                        <p>
                                            {p.metadata.name} ({p.metadata.symbol})
                                        </p>
                                    </div>
                                </AccordionHeader>
                                <AccordionBody className="gap-small flex w-full flex-col place-items-center items-center pt-0 md:flex-row md:justify-between">
                                    <div className="mr-auto flex flex-col place-items-center items-start">
                                        <span>You will be rewarded with:</span>
                                        <li>
                                            <span className="font-bold text-primary-600">
                                                {acornRewarded} ACORN
                                            </span>{' '}
                                            in liquid wallet
                                        </li>
                                        <li>
                                            <span className="font-bold text-primary-600">
                                                {acornBuried} ACORN
                                            </span>{' '}
                                            buried in{' '}
                                            <span className="font-bold text-primary-600">89</span>{' '}
                                            days
                                        </li>
                                        <li>
                                            <span className="font-bold text-primary-600">
                                                {acornRewarded} voting power
                                            </span>{' '}
                                            across the platform in{' '}
                                            <span className="font-bold text-primary-600">89</span>{' '}
                                            days
                                        </li>
                                    </div>
                                    <div className="mt-small flex flex-row flex-wrap justify-end gap-x-2 md:ml-auto md:mt-0 md:flex-col md:items-end md:gap-0">
                                        <p className="gap-small flex items-center ">
                                            {icpPrice.toFixed(4)}
                                            <span className="hidden md:inline"> ICP</span>
                                            <Tooltip
                                                content={
                                                    <p className="">Price of the package in ICP</p>
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    className="h-4 w-4 cursor-pointer md:h-5 md:w-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                    />
                                                </svg>
                                            </Tooltip>
                                        </p>
                                        <p className="gap-small flex items-center ">
                                            + {icpFee}
                                            <span className="hidden md:inline"> ICP</span>
                                            <Tooltip
                                                content={<p className="">{"ICP's transfer fee"}</p>}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    className="h-4 w-4 cursor-pointer md:h-5 md:w-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                    />
                                                </svg>
                                            </Tooltip>
                                        </p>
                                        <p className="gap-small flex items-center ">
                                            + {slippageTolerance.toFixed(4)}
                                            <span className="hidden md:inline"> ICP</span>
                                            <Tooltip
                                                content={
                                                    <p className="">
                                                        {
                                                            "Slippage tolerance to prevent ICP price's fluctuation, you will be refunded the difference"
                                                        }
                                                    </p>
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    className="h-4 w-4 cursor-pointer md:h-5 md:w-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                    />
                                                </svg>
                                            </Tooltip>
                                        </p>
                                        <p className="text-normal border-b-0 font-medium text-primary-600 transition-colors group-hover:pointer-events-none group-hover:text-primary-600">
                                            = {icpToPay.toFixed(4)} ICP
                                        </p>
                                    </div>
                                </AccordionBody>
                            </Accordion>
                        )
                    })}
            </div>
            <div className="gap-small flex items-center justify-between">
                <button
                    className="button w-auto min-w-36 bg-cold-700 hover:bg-cold-800 md:min-w-48"
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
                    disabled={!selectedPackage || choices[ESteps.Checkout]}
                >
                    {balance === 0n
                        ? 'Insufficient balance'
                        : !selectedPackage
                          ? 'Choose a package'
                          : 'Continue with ' + selectedPackage.package.metadata.name}
                </button>
            </div>
        </>
    )
}

export default PurchasePackage
