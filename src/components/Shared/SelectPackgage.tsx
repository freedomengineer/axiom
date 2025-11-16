import { Accordion, AccordionBody, AccordionHeader, Tooltip } from '@material-tailwind/react'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import ClipboardIcon from '@components/Assets/clipboard.svg'
import DoneIcon from '@components/Assets/done.svg'
import LoginStep1Icon from '@components/Assets/login_step1.svg'
import RefreshIcon from '@components/Assets/refresh.svg'
import Deposit from '@components/Shared/Deposit'
import Popup from '@components/Shared/Popup'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import usePackages, { EPackages, ParsedMembershipPackage } from '@hooks/usePackages'
import cn from '@libs/class'
import { success } from '@libs/toastify'
import { Choices, ESteps } from '@utils/login/step'
import { ICP_FEE, N_DECIMALS } from 'shared/constants'
import e8s from 'shared/utils/e8s'
import proportion, { Proportion } from 'shared/utils/proportion'
import { getCurrentPrice } from 'shared/utils/tokens'

enum EPopup {
    Deposit = 'Deposit',
    Slippage = 'Slippage',
}

const SelectPackage = ({
    choice,
    setChoice,
    balance,
    refreshBalance,
    setIsPriceReady,
    coupon,
    setCoupon,
    packages,
}: {
    choice: Choices[ESteps.Package] | null
    setChoice: Dispatch<SetStateAction<Choices[ESteps.Package] | null>>
    refreshBalance: () => Promise<void>
    balance?: bigint
    setIsPriceReady?: (p: boolean) => void
    coupon?: string | null
    setCoupon?: (str: string | null) => void
    packages?: ParsedMembershipPackage[]
}) => {
    const { principal } = useAuth()
    const configs = useConfigs('Sales')
    const axiomsConfigs = useConfigs('Axioms')
    const daoConfigs = useConfigs('DAO')
    const splitConfigs = useConfigs('Split')

    const [currentPrice, setCurrentPrice] = useState<bigint>(0n)
    const [open, setOpen] = useState<EPopup>()
    const [slippage, setSlippage] = useState<number>(5) // 5%
    const [updatingSlippage, setUpdatingSlippage] = useState<string>('5')
    const [copied, setCopied] = useState<{
        principal: boolean
        refreshBalance: boolean
        refreshPrice: boolean
    }>({
        principal: false,
        refreshBalance: false,
        refreshPrice: false,
    })

    useEffect(() => {
        getCurrentPrice()
            .then((res) => {
                setCurrentPrice(res)
                setIsPriceReady?.(res > 0)
            })
            .catch(() => {})
    }, [principal])

    const localPackages = (packages ??
        usePackages(EPackages.Membership, configs)) as ParsedMembershipPackage[]

    const isPriceReady = e8s.toNumber(currentPrice) > 0

    const buildChoice = (p: ParsedMembershipPackage): Choices[ESteps.Package] => {
        if (!configs || !splitConfigs || !isPriceReady) return null

        const adjustedUsdPrice = e8s.toNumber(p.adjustedPrice[0])

        const icpPrice =
            (adjustedUsdPrice / e8s.toNumber(currentPrice)) *
            (!setCoupon
                ? proportion.toFloat(splitConfigs['AFFILIATE_PROPORTION'][1] as Proportion)
                : 1)
        const icpFee = e8s.toNumber(ICP_FEE)
        const slippageTolerance = icpPrice * (slippage / 100)
        const icpToPay = icpPrice + icpFee + slippageTolerance

        return {
            package: p,
            icpToPay: e8s.fromNumber(icpToPay),
            acornToReceive: p.acornLiquid[0],
        }
    }

    const handleOpen = (p: ParsedMembershipPackage) => {
        setChoice((prev) => {
            const isSame = prev?.package.originalPrice === p.originalPrice
            if (isSame) return null
            return (
                buildChoice(p) || {
                    package: p,
                    icpToPay: 0n,
                    acornToReceive: 0n,
                }
            )
        })
    }

    const refreshPrice = async () => {
        getCurrentPrice()
            .then((res) => {
                setCurrentPrice(res)
                setIsPriceReady?.(res > 0)
            })
            .catch(() => {})
    }

    useEffect(() => {
        if (!choice || !configs || !isPriceReady) return
        const recomputed = buildChoice(choice.package)
        if (
            recomputed &&
            (recomputed.icpToPay !== choice.icpToPay ||
                recomputed.acornToReceive !== choice.acornToReceive)
        ) {
            setChoice(recomputed)
        }
    }, [currentPrice, slippage, configs])

    return (
        <>
            <Popup
                open={open === EPopup.Deposit}
                onClose={() => setOpen(undefined)}
                title={`Deposit ICP`}
                className="w-auto"
            >
                <Deposit token="ICP" />
            </Popup>
            <Popup
                open={open === EPopup.Slippage}
                onClose={() => setOpen(undefined)}
                title={`Adjust Slippage`}
                className="w-full md:w-2/5"
            >
                <div className="gap-normal flex flex-col">
                    <input
                        type="text"
                        placeholder="Input your transfer amount"
                        value={updatingSlippage}
                        onChange={(e) => {
                            let val = e.target.value.replace(/,/g, '.')
                            if (!/^\d*\.?\d*$/.test(val)) return
                            const [intPart, decPart] = val.split('.')
                            if (decPart && decPart.length > N_DECIMALS) {
                                val = `${intPart}.${decPart.slice(0, N_DECIMALS)}`
                            }
                            if (Number(val) > 100) {
                                val = '100'
                            }
                            setUpdatingSlippage(val)
                        }}
                        className={cn('input', 'border-green-400 focus:ring-green-600')}
                    />
                    <button
                        className="button w-auto min-w-36 bg-cold-800 md:min-w-48"
                        onClick={() => {
                            setSlippage(Number(updatingSlippage))
                            setOpen(undefined)
                        }}
                        disabled={!Number(updatingSlippage)}
                    >
                        <span className="gap-small flex">Set {updatingSlippage}% slippage</span>
                    </button>
                </div>
            </Popup>
            <div
                className={cn(
                    'gap-extratiny mb-normal flex h-max flex-col',
                    !choice && setCoupon && coupon === undefined && 'blur-lg'
                )}
            >
                <div
                    className={cn(
                        'px-medium py-normal flex flex-col gap-0.5 rounded-lg border border-cold-200 bg-cold-800 text-white/80',
                        !choice && setCoupon && coupon === undefined && 'pointer-events-none'
                    )}
                >
                    <div className="text-small gap-small flex items-center justify-between font-normal">
                        <p className="p-truncate-1">
                            Principal:{' '}
                            <span className="text-normal font-bold text-white">
                                {principal?.toText() ?? ''}
                            </span>{' '}
                        </p>
                        <button
                            className="gap-tiny px-small text-tiny flex h-6 w-min items-center text-nowrap rounded-lg bg-white/100 font-normal text-cold-800 hover:bg-white/75 disabled:pointer-events-none disabled:bg-white/75"
                            onClick={() => {
                                navigator.clipboard.writeText(principal?.toText() ?? '')
                                setCopied((prev) => ({ ...prev, principal: true }))
                                success('Copied share link to clipboard')
                                setTimeout(
                                    () => setCopied((prev) => ({ ...prev, principal: false })),
                                    3000
                                )
                            }}
                            disabled={copied.principal}
                        >
                            {copied.principal ? (
                                <DoneIcon className="h-3 w-3 stroke-[2px] md:h-4 md:w-4" />
                            ) : (
                                <ClipboardIcon className="h-3 w-3 stroke-[2px] md:h-4 md:w-4" />
                            )}
                            Copy
                        </button>
                    </div>
                    <div className="text-small gap-small flex items-center justify-between font-normal">
                        <p>
                            Balance:{' '}
                            <span className="text-normal font-bold text-white">
                                {e8s.toNumber(balance)}
                            </span>{' '}
                            ICP
                        </p>
                        {/* <button
                            className="gap-tiny px-small md:py-extratiny text-tiny flex w-min items-center rounded-lg bg-white/100 py-0 font-normal text-cold-800 hover:bg-white/75"
                            onClick={() => setIsOpen(EPopup.Deposit)}
                        >
                            <PlusIcon className="h-3 w-3 stroke-[1.5px] md:h-4 md:w-4" />
                            Deposit
                        </button> */}
                        <button
                            className="gap-tiny px-small text-tiny flex h-6 w-min items-center text-nowrap rounded-lg bg-white/100 font-normal text-cold-800 hover:bg-white/75 disabled:pointer-events-none disabled:bg-white/75"
                            onClick={() => {
                                setCopied((prev) => ({ ...prev, refreshBalance: true }))
                                refreshBalance()
                                    .then(() => success('Refreshed balance'))
                                    .catch(() => {})
                                    .finally(() =>
                                        setTimeout(
                                            () =>
                                                setCopied((prev) => ({
                                                    ...prev,
                                                    refreshBalance: false,
                                                })),
                                            3000
                                        )
                                    )
                            }}
                            disabled={copied.refreshBalance}
                        >
                            {copied.refreshBalance ? (
                                <DoneIcon className="h-3 w-3 stroke-[2px] md:h-4 md:w-4" />
                            ) : (
                                <RefreshIcon className="h-3 w-3 stroke-[2px] md:h-4 md:w-4" />
                            )}
                            Refresh
                        </button>
                    </div>
                    <div className="text-small gap-small flex items-center justify-between font-normal">
                        <p>
                            ICP Price:{' '}
                            <span className="text-normal font-bold text-white">
                                {e8s.toNumber(currentPrice)}
                            </span>{' '}
                            USD
                        </p>
                        <div className="gap-small flex items-center">
                            <button
                                className="gap-tiny px-small text-tiny flex h-6 w-min items-center text-nowrap rounded-lg bg-white/100 font-normal text-cold-800 hover:bg-white/75 disabled:pointer-events-none disabled:bg-white/75"
                                onClick={() => setOpen(EPopup.Slippage)}
                            >
                                <LoginStep1Icon className="h-3 w-3 stroke-[1.5px] md:h-4 md:w-4" />
                                Slippage
                            </button>
                            <button
                                className="gap-tiny px-small text-tiny flex h-6 w-min items-center text-nowrap rounded-lg bg-white/100 font-normal text-cold-800 hover:bg-white/75 disabled:pointer-events-none disabled:bg-white/75"
                                onClick={() => {
                                    setCopied((prev) => ({ ...prev, refreshPrice: true }))
                                    refreshPrice()
                                        .then(() => success('Refreshed price'))
                                        .catch(() => {})
                                        .finally(() =>
                                            setTimeout(
                                                () =>
                                                    setCopied((prev) => ({
                                                        ...prev,
                                                        refreshPrice: false,
                                                    })),
                                                3000
                                            )
                                        )
                                }}
                                disabled={copied.refreshPrice}
                            >
                                {copied.refreshPrice ? (
                                    <DoneIcon className="h-3 w-3 stroke-[2px] md:h-4 md:w-4" />
                                ) : (
                                    <RefreshIcon className="h-3 w-3 stroke-[2px] md:h-4 md:w-4" />
                                )}
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
                {configs &&
                    axiomsConfigs &&
                    splitConfigs &&
                    daoConfigs &&
                    localPackages?.map((p, i) => {
                        const adjustedPrice = e8s.toNumber(p.adjustedPrice[0])

                        const icpPrice = isPriceReady
                            ? adjustedPrice / e8s.toNumber(currentPrice)
                            : 0
                        const disCountedIcpPrice = !setCoupon
                            ? icpPrice *
                              proportion.toFloat(
                                  splitConfigs['AFFILIATE_PROPORTION'][1] as Proportion
                              )
                            : icpPrice

                        const icpFee = e8s.toNumber(ICP_FEE)
                        const slippageTolerance = disCountedIcpPrice * (slippage / 100)
                        const icpToPay = disCountedIcpPrice + icpFee + slippageTolerance

                        const isSelected = choice?.package.originalPrice === p.originalPrice

                        const maxHypotheses =
                            BigInt(i + 1) *
                            (axiomsConfigs['MAX_DAILY_HYPOTHESES_BY_TIER'][1] as bigint)
                        const maxEvidences =
                            BigInt(i + 1) *
                            (axiomsConfigs['MAX_DAILY_EVIDENCES_BY_TIER'][1] as bigint)
                        const isPrivilegedForAceElection =
                            p.originalPrice >=
                            (daoConfigs['ENTER_ELECTION_CAPITAL_RAISED_THRESHOLD'][1] as bigint)

                        return (
                            <Accordion
                                key={String(p.originalPrice)}
                                open={isSelected}
                                icon={
                                    <>
                                        <p
                                            className={cn(
                                                '!text-normal hidden border-b-0 font-medium transition-colors md:block',
                                                isSelected
                                                    ? 'text-primary-600 group-hover:pointer-events-none group-hover:text-primary-600'
                                                    : 'text-cold-700 group-hover:cursor-pointer group-hover:text-cold-800'
                                            )}
                                        >
                                            {adjustedPrice} USD
                                        </p>
                                        <p
                                            className={cn(
                                                '!text-normal block border-b-0 font-medium transition-colors md:hidden',
                                                isSelected
                                                    ? 'text-primary-600 group-hover:pointer-events-none group-hover:text-primary-600'
                                                    : 'text-cold-700 group-hover:cursor-pointer group-hover:text-cold-800'
                                            )}
                                        >
                                            ${adjustedPrice} * (
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
                                        : 'border-cold-200 hover:border-cold-500',
                                    ((!choice && setCoupon && coupon === undefined) || !!coupon) &&
                                        'pointer-events-none',
                                    ((!choice && setCoupon && coupon === undefined) || !!coupon) &&
                                        !isSelected &&
                                        'opacity-50'
                                )}
                            >
                                <AccordionHeader
                                    onClick={() => handleOpen(p)}
                                    className={cn(
                                        'border-b-0 font-medium transition-colors',
                                        isSelected
                                            ? 'text-primary-600 group-hover:pointer-events-none group-hover:text-primary-600'
                                            : 'text-cold-700 hover:text-cold-800 group-hover:cursor-pointer'
                                    )}
                                >
                                    <div className="gap-medium text-normal flex items-center">
                                        <input
                                            type="radio"
                                            name={`radio-${p.originalPrice}`}
                                            checked={isSelected}
                                            className="h-4 w-4 rounded-full accent-primary-600 md:h-5 md:w-5"
                                        />
                                        <p>
                                            {p.name} ({p.symbol})
                                        </p>
                                    </div>
                                </AccordionHeader>
                                <AccordionBody className="gap-small flex w-full flex-col place-items-center items-center pt-0 font-normal text-cold-800 marker:text-cold-800 md:flex-row md:justify-between">
                                    <div className="mr-auto flex flex-col place-items-center items-start">
                                        <span>You will be rewarded with:</span>
                                        <ul className="pl-semilarge gap-medium list-disc">
                                            <li>
                                                <span className="font-bold text-primary-600">
                                                    {e8s.toString(p.acornLiquid[0])} ACORN
                                                </span>{' '}
                                                in liquid wallet
                                            </li>
                                            <li>
                                                <span className="font-bold text-primary-600">
                                                    {e8s.toString(p.acornBuried[0])} ACORN
                                                </span>{' '}
                                                buried in{' '}
                                                <span className="font-bold text-primary-600">
                                                    89
                                                </span>{' '}
                                                days
                                            </li>
                                            <li>
                                                <span className="font-bold text-primary-600">
                                                    {e8s.toString(p.acornLiquid[0])} voting power
                                                </span>{' '}
                                                across the platform in{' '}
                                                <span className="font-bold text-primary-600">
                                                    89
                                                </span>{' '}
                                                days
                                            </li>
                                            <li>
                                                <span className="font-bold text-primary-600">
                                                    {maxHypotheses} hypotheses
                                                </span>{' '}
                                                publish allowance per{' '}
                                                <span className="font-bold text-primary-600">
                                                    1
                                                </span>{' '}
                                                day
                                            </li>
                                            <li>
                                                <span className="font-bold text-primary-600">
                                                    {maxEvidences} evidences
                                                </span>{' '}
                                                publish allowance per{' '}
                                                <span className="font-bold text-primary-600">
                                                    1
                                                </span>{' '}
                                                day
                                            </li>
                                            {isPrivilegedForAceElection && (
                                                <li>
                                                    Privilege to enter the{' '}
                                                    <span className="font-bold text-primary-600">
                                                        ACE election
                                                    </span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="mt-small flex flex-row flex-wrap justify-end gap-x-1 md:ml-auto md:mt-0 md:flex-col md:items-end md:gap-0">
                                        <p className="gap-small flex items-center ">
                                            {icpPrice.toFixed(4)}
                                            <span className="hidden md:inline"> ICP</span>
                                            <Tooltip
                                                className="z-[999999]"
                                                content={
                                                    <p className="">Price of the package in ICP</p>
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    className="h-4 w-4 cursor-pointer stroke-[1.5px] md:h-5 md:w-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                    />
                                                </svg>
                                            </Tooltip>
                                        </p>
                                        {!setCoupon && (
                                            <p className="gap-small flex items-center ">
                                                - {(icpPrice - disCountedIcpPrice).toFixed(4)}
                                                <span className="hidden md:inline"> ICP</span>
                                                <Tooltip
                                                    className="z-[999999]"
                                                    content={
                                                        <p className="">
                                                            {`You don't need to pay for the affiliate's split, ${proportion.toString(splitConfigs['AFFILIATE_PROPORTION'][1] as Proportion)} of the price, because you're already the referrer`}
                                                        </p>
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        className="h-4 w-4 cursor-pointer stroke-[1.5px] md:h-5 md:w-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                        />
                                                    </svg>
                                                </Tooltip>
                                            </p>
                                        )}
                                        <p className="gap-small flex items-center ">
                                            + {icpFee}
                                            <span className="hidden md:inline"> ICP</span>
                                            <Tooltip
                                                className="z-[999999]"
                                                content={<p className="">{"ICP's transfer fee"}</p>}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    className="h-4 w-4 cursor-pointer stroke-[1.5px] md:h-5 md:w-5"
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
                                                className="z-[999999]"
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
                                                    className="h-4 w-4 cursor-pointer stroke-[1.5px] md:h-5 md:w-5"
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
            {!choice && setCoupon && coupon === undefined && (
                <div className="gap-medium absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center">
                    <p className="text-medium text-center font-light text-cold-800">
                        Did you acquire a coupon from a second party Axiom membership sales
                        representative? <br />
                        Input that coupon here to create your account for free
                    </p>
                    <input
                        type="text"
                        placeholder="Input your coupon"
                        value={coupon}
                        className="input"
                        onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button
                        className="button w-auto min-w-36 bg-cold-800 md:min-w-48"
                        onClick={() => setCoupon(null)}
                    >
                        I don't have a coupon
                    </button>
                </div>
            )}
        </>
    )
}

export default SelectPackage
