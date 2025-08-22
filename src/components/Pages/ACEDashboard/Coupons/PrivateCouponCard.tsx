import { useState } from 'react'

import ClipboardIcon from '@components/Assets/clipboard.svg'
import DoneIcon from '@components/Assets/done.svg'
import EyeIcon from '@components/Assets/eye.svg'
import EyeOffIcon from '@components/Assets/eye_off.svg'
import LinkIcon from '@components/Assets/link.svg'
import QRIcon from '@components/Assets/qr.svg'
import Popup from '@components/Shared/Popup'
import QRCode from '@components/Shared/QRCode'
import Username, { PACKAGES } from '@components/Shared/Username'
import cn from '@libs/class'
import { toHex } from '@libs/crypto'
import { formatDate } from '@libs/date'
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
                    'text-small px-medium py-normal gap-small relative my-auto flex h-min w-full flex-col rounded-lg border border-opacity-75 font-normal text-cold-800 hover:border-opacity-100',
                    status === 'Available' && 'border-green-700',
                    (status[0] === 'Redeemed' || status[0] === 'Locked') &&
                        'border-cold-600 border-opacity-25',
                    status[0] === 'Failed' && 'border-red-700'
                )}
            >
                <div className="flex items-center justify-between">
                    <p className="text-normal gap-small flex items-center font-medium">
                        <button
                            className="px-normal py-tiny rounded-lg bg-cold-800/0 hover:bg-cold-800/10 disabled:pointer-events-none"
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
                            #{item.key.slice(0, 4)}...
                        </button>{' '}
                        <span className="text-small font-normal text-cold-800">
                            ({formatDate({ nano: item.creationDate }, true)})
                        </span>
                    </p>
                    <p className="text-normal gap-small flex items-center font-medium">
                        {PACKAGES?.[item.capitalRaised.toString() as keyof typeof PACKAGES] ??
                            'Unknown'}{' '}
                        <span className="text-small font-normal text-cold-800">
                            ({e8s.toString(item.icpPaid, 4)} ICP)
                        </span>
                    </p>
                </div>
                <p className="mb-small mx-auto flex-1 text-center leading-relaxed">
                    {(() => {
                        const status = UnwrapVariant(item.status)
                        if (Array.isArray(status)) {
                            return (
                                <>
                                    <span
                                        className={cn(
                                            'font-semibold',
                                            status[0] === 'Locked' && 'text-cold-800',
                                            status[0] === 'Failed' && 'text-red-800',
                                            status[0] === 'Redeemed' && 'text-cold-800'
                                        )}
                                    >
                                        {status[0]}
                                    </span>{' '}
                                    by{' '}
                                    <Username
                                        principal={status[1].by}
                                        symbol
                                        linkClassName="pre-underline z-10 inline-block text-cold-800 decoration-cold-800/50 hover:decoration-cold-800/100"
                                    />{' '}
                                    {formatDate({ nano: status[1].timestamp }, true)}
                                </>
                            )
                        }
                        return <span className="font-semibold text-green-800">{status}</span>
                    })()}
                </p>
                <div className="gap-small flex h-8 items-center justify-between md:h-10">
                    <button
                        className={cn(
                            'text-normal gap-small gap-small flex h-8 w-full items-center justify-center rounded-lg border border-cold-800 text-center disabled:pointer-events-none md:h-10',
                            !reveal
                                ? 'bg-cold-800/10 hover:bg-cold-800/25'
                                : 'bg-cold-800/0 hover:bg-cold-800/10'
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
                            setTimeout(() => setCopied((prev) => ({ ...prev, code: false })), 3000)
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
                                    <DoneIcon className="h-4 w-4 stroke-2 text-cold-800 md:h-5 md:w-5" />
                                ) : (
                                    <ClipboardIcon className="h-4 w-4 stroke-2 text-cold-800 md:h-5 md:w-5" />
                                )}
                                <span className="text-cold-800">
                                    {copied.code ? 'copied' : 'click to copy'}
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
        </>
    )
}

export default PrivateCouponCard
