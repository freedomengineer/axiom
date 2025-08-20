import { useState } from 'react'

import Username, { PACKAGES } from '@components/Shared/Username'
import cn from '@libs/class'
import { formatDate } from '@libs/date'
import { success } from '@libs/toastify'
import { DAffiliate } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { UnwrapVariant } from 'shared/utils/typings'

const CouponCard = ({ item }: { item: DAffiliate.SharableCoupon }) => {
    const [copied, setCopied] = useState<{ id: boolean }>({
        id: false,
    })
    const status = UnwrapVariant(item.status)

    return (
        <>
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
                    Created by{' '}
                    <Username
                        principal={item.creator}
                        symbol
                        linkClassName="pre-underline z-10 inline-block text-cold-800 decoration-cold-800/50 hover:decoration-cold-800/100"
                    />
                </p>
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
            </div>
        </>
    )
}

export default CouponCard
