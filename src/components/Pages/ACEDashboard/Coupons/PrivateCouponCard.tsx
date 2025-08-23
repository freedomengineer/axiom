import { useState } from 'react'

import ClipboardIcon from '@components/Assets/clipboard.svg'
import DoneIcon from '@components/Assets/done.svg'
import EyeIcon from '@components/Assets/eye.svg'
import EyeOffIcon from '@components/Assets/eye_off.svg'
import ICPIcon from '@components/Assets/icp.svg'
import LinkIcon from '@components/Assets/link.svg'
import QRIcon from '@components/Assets/qr.svg'
import SharpIcon from '@components/Assets/sharp.svg'
import Divider from '@components/Shared/Divider'
import Popup from '@components/Shared/Popup'
import QRCode from '@components/Shared/QRCode'
import Username, { PACKAGES, Symbol } from '@components/Shared/Username'
import cn from '@libs/class'
import { toHex } from '@libs/crypto'
import { formatDate } from '@libs/date'
import { normal } from '@libs/formatter'
import { success } from '@libs/toastify'
import { DAffiliate } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { UnwrapVariant } from 'shared/utils/typings'

const PrivateCouponCard = ({ item }: { item: DAffiliate.PrivateSharableCoupon }) => {
    const [copied, setCopied] = useState<{ id: boolean; code: boolean }>({
        id: false,
        code: false,
    })
    const [reveal, setReveal] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)

    const status = UnwrapVariant(item.status)

    return (
        <>
            <Popup
                open={open}
                onClose={() => setOpen(false)}
                title="Coupon Register Link"
                Icon={<LinkIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                className="w-full md:w-2/5"
            >
                <QRCode
                    arr={[
                        {
                            name: 'Register Link',
                            content: `${window.location.origin}/?code=${toHex(
                                Uint8Array.from(item.code)
                            )
                                .match(/.{1,4}/g)!
                                .join('-')}`,
                            image: '/images/logo.png',
                        },
                    ]}
                />
            </Popup>
            <div
                className={cn(
                    'text-small gap-small relative flex h-32 w-full items-center justify-between rounded-lg border border-opacity-75 font-normal text-cold-800 hover:border-opacity-100 md:h-40',
                    status === 'Available' && 'border-green-800 text-green-800',
                    (status[0] === 'Redeemed' || status[0] === 'Locked') &&
                        'border-cold-600 opacity-75',
                    status[0] === 'Failed' && 'border-red-800 text-red-800'
                )}
            >
                <div
                    className={cn(
                        'flex h-full flex-col items-center justify-between rounded-l-lg bg-cold-800',
                        status === 'Available' && 'bg-green-800',
                        (status[0] === 'Redeemed' || status[0] === 'Locked') && 'bg-cold-800',
                        status[0] === 'Failed' && 'bg-red-800'
                    )}
                >
                    <Symbol
                        capitalRaised={item.capitalRaised.toString()}
                        className="my-auto h-24 w-24 translate-y-1 px-4 py-0 text-white md:h-[7.5rem] md:w-[7.5rem] md:px-6 md:py-0"
                    />
                    <div
                        className={cn(
                            'gap-small flex h-8 rounded-lg text-lg font-extrabold text-white md:h-10 md:text-2xl',
                            status === 'Available' && 'bg-green-800',
                            (status[0] === 'Redeemed' || status[0] === 'Locked') && 'bg-cold-800',
                            status[0] === 'Failed' && 'bg-red-800'
                        )}
                    >
                        <p className="mx-auto h-min w-min text-center">
                            {PACKAGES?.[
                                item.capitalRaised.toString() as keyof typeof PACKAGES
                            ][1] ?? 'Unknown'}
                        </p>
                    </div>
                </div>
                <div className="px-normal py-normal flex h-full w-full flex-col items-center justify-between">
                    <div
                        className={cn(
                            'flex w-full items-center justify-between text-base font-semibold md:text-xl'
                        )}
                    >
                        <div className="flex items-center">
                            <SharpIcon className="h-[18px] w-[18px] stroke-[4px] md:h-[22px] md:w-[22px]" />
                            <button
                                className="px-small py-tiny rounded-lg bg-cold-800/0 hover:bg-cold-800/10 disabled:pointer-events-none"
                                disabled={copied.id}
                                onClick={() => {
                                    navigator.clipboard.writeText(item.key)
                                    setCopied((prev) => ({ ...prev, id: true }))
                                    success('Copied coupon ID to clipboard')
                                    setTimeout(
                                        () => setCopied((prev) => ({ ...prev, id: false })),
                                        3000
                                    )
                                }}
                            >
                                {item.key.slice(0, 4)}...
                            </button>
                        </div>
                        <div className="gap-small flex items-center">
                            <ICPIcon className="h-5 w-5 fill-current stroke-0 md:h-6 md:w-6" />
                            <span className="">{e8s.toString(item.icpPaid, 2)}</span>
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between text-base md:text-xl">
                        <Username
                            principal={item.creator}
                            symbol
                            symbolClassName="h-[18px] w-[18px] stroke-[3px] md:h-[22px] md:w-[22px]"
                            linkClassName={cn(
                                '!flex !items-center !gap-1 md:!gap-1.5 pre-underline !text-base md:!text-xl z-10 inline-block decoration-0 font-medium',
                                status === 'Available' && 'hover:decoration-green-800',
                                (status[0] === 'Redeemed' || status[0] === 'Locked') &&
                                    'hover:decoration-cold-800',
                                status[0] === 'Failed' && 'hover:decoration-red-800'
                            )}
                        />
                        <p className="text-sm font-normal md:text-base">
                            <span className="hidden md:inline">created</span>{' '}
                            {formatDate({ nano: item.creationDate }, true)}
                        </p>
                    </div>
                    {(() => {
                        const status = UnwrapVariant(item.status)
                        if (Array.isArray(status)) {
                            return (
                                <div className="flex w-full items-center justify-between text-base md:text-xl">
                                    <Username
                                        principal={status[1].by}
                                        symbol
                                        symbolClassName="h-[18px] w-[18px] stroke-[3px] md:h-[22px] md:w-[22px]"
                                        linkClassName={cn(
                                            '!flex !items-center !gap-1 md:!gap-1.5 pre-underline !text-base md:!text-xl z-10 inline-block decoration-0 font-medium',
                                            (status[0] === 'Redeemed' || status[0] === 'Locked') &&
                                                'hover:decoration-cold-800',
                                            status[0] === 'Failed' && 'hover:decoration-red-800'
                                        )}
                                    />
                                    <p className="text-sm font-normal md:text-base">
                                        <span className="hidden md:inline">
                                            {normal(status[0])}
                                        </span>{' '}
                                        {formatDate({ nano: status[1].timestamp }, true)}
                                    </p>
                                </div>
                            )
                        }
                        return (
                            <span className="text-sm font-normal text-green-800 md:text-base">
                                Awaiting to redeem
                            </span>
                        )
                    })()}
                    <div className="gap-small flex h-8 w-full items-center justify-between md:h-10">
                        <button
                            className={cn(
                                'text-small gap-small gap-small flex h-8  w-full items-center justify-center rounded-lg border border-cold-800 text-center disabled:pointer-events-none md:h-10',
                                !reveal
                                    ? 'bg-cold-800 text-white hover:bg-cold-800/75'
                                    : 'bg-cold-800/0 text-cold-800 hover:bg-cold-800/10'
                            )}
                            disabled={copied.code}
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    toHex(Uint8Array.from(item.code))
                                        .match(/.{1,4}/g)!
                                        .join('-')
                                )
                                setCopied((prev) => ({ ...prev, code: true }))
                                success('Copied coupon code to clipboard')
                                setTimeout(
                                    () => setCopied((prev) => ({ ...prev, code: false })),
                                    3000
                                )
                            }}
                        >
                            {reveal ? (
                                <p className="p-truncate-1 w-full text-center font-mono font-semibold">
                                    {toHex(Uint8Array.from(item.code))
                                        .match(/.{1,4}/g)!
                                        .join('-')}
                                </p>
                            ) : (
                                <>
                                    {copied.code ? (
                                        <DoneIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                    ) : (
                                        <ClipboardIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                    )}
                                    <span className="">
                                        {copied.code ? (
                                            'copied'
                                        ) : (
                                            <>
                                                <span className="hidden md:inline">
                                                    click to copy
                                                </span>
                                                <span className="inline md:hidden">copy</span>
                                            </>
                                        )}
                                    </span>
                                </>
                            )}
                        </button>
                        <button
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cold-800 hover:bg-cold-800/75 disabled:pointer-events-none md:h-10 md:w-10"
                            onClick={() => setReveal((prev) => !prev)}
                        >
                            {reveal ? (
                                <EyeOffIcon className="h-5 w-5 stroke-2 text-white md:h-6 md:w-6" />
                            ) : (
                                <EyeIcon className="h-5 w-5 stroke-2 text-white md:h-6 md:w-6" />
                            )}
                        </button>
                        <button
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cold-800 hover:bg-cold-800/75 disabled:pointer-events-none md:h-10 md:w-10"
                            onClick={() => setOpen(true)}
                        >
                            <QRIcon className="h-5 w-5 stroke-2 text-white md:h-6 md:w-6" />
                        </button>
                    </div>
                </div>
                <div
                    className={cn(
                        'gap-small flex h-32 w-12 rounded-r-lg text-lg font-extrabold text-white [writing-mode:vertical-rl] md:h-40 md:w-16 md:text-2xl',
                        status === 'Available' && 'bg-green-800',
                        (status[0] === 'Redeemed' || status[0] === 'Locked') && 'bg-cold-800',
                        status[0] === 'Failed' && 'bg-red-800'
                    )}
                >
                    <p className="mx-auto my-auto h-min w-min text-center uppercase">
                        {(() => {
                            const status = UnwrapVariant(item.status)
                            if (Array.isArray(status)) {
                                return status[0]
                            }
                            return status
                        })()}
                    </p>
                </div>
            </div>
        </>
    )
}

export default PrivateCouponCard
