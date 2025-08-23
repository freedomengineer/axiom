import { useEffect, useRef, useState } from 'react'

import TicketIcon from '@components/Assets/ticket.svg'
import InfiniteScrollWrapper, {
    InfiniteScrollWrapperHandle,
} from '@components/Shared/InfiniteScrollWrapper'
import Popup from '@components/Shared/Popup'
import useAuth from '@hooks/useAuth'
import { DAffiliate } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { Affiliate } from 'shared/utils/services'

import CreateCoupon from './CreateCoupon'
import PrivateCouponCard from '../../ACEDashboard/Coupons/PrivateCouponCard'

const CouponsTab = ({
    balance,
    refreshBalances,
}: {
    balance: bigint
    refreshBalances: () => Promise<void>
}) => {
    const { principal, agent } = useAuth()

    const [createdCoupon, setCreatedCoupon] = useState<DAffiliate.PrivateSharable | null>()
    const [open, setOpen] = useState<boolean>(false)
    const [total, setTotal] = useState<[bigint, bigint]>([0n, 0n])

    const listRef = useRef<InfiniteScrollWrapperHandle>(null)

    useEffect(() => {
        if (!principal || open) return
        Affiliate.call().getUserCouponTotal(principal).then(setTotal)
        refreshBalances()
    }, [principal, open])

    return (
        <div className="gap-medium flex flex-col">
            {createdCoupon && (
                <Popup
                    open={!!createdCoupon}
                    title="Coupon"
                    Icon={<TicketIcon className="h-6 w-6 fill-white stroke-0 md:h-7 md:w-7" />}
                    className="w-full md:w-2/5"
                    onClose={() => {
                        setCreatedCoupon(undefined)
                        listRef.current?.refresh()
                    }}
                >
                    <PrivateCouponCard item={createdCoupon} />
                </Popup>
            )}
            {createdCoupon === null && (
                <Popup
                    open={open}
                    title="Create Coupon"
                    Icon={<TicketIcon className="h-6 w-6 fill-white stroke-0 md:h-7 md:w-7" />}
                    className="w-full md:w-4/5"
                    onClose={() => setOpen(false)}
                >
                    <CreateCoupon
                        balance={balance}
                        refreshBalance={refreshBalances}
                        setCoupon={setCreatedCoupon}
                    />
                </Popup>
            )}
            <div className="gap-normal grid w-full grid-cols-3">
                <div className="text-small py-small px-medium gap-normal flex w-full items-center justify-between text-nowrap rounded-lg border border-cold-200 bg-cold-50">
                    <span className="font-semibold text-cold-700">Total coupons</span>
                    <span className="font-semibold text-cold-700">{total[0]}</span>
                </div>
                <div className="text-small py-small px-medium gap-normal flex w-full items-center justify-between text-nowrap rounded-lg border border-cold-200 bg-cold-50">
                    <span className="font-semibold text-cold-700">ICP paid</span>
                    <span className="font-semibold text-cold-700">{e8s.toString(total[1])}</span>
                </div>
                <button
                    className="button h-full bg-cold-800"
                    onClick={() => {
                        setOpen(true)
                        setCreatedCoupon(null)
                    }}
                >
                    Create coupon
                </button>
            </div>
            <InfiniteScrollWrapper
                ref={listRef}
                LayoutComponent={({ items }) => (
                    <div className="gap-medium mx-auto grid w-full max-w-full grid-cols-1 md:max-w-[1500px] md:grid-cols-2">
                        {items.map((item, i) => (
                            <PrivateCouponCard key={i} item={item} />
                        ))}
                    </div>
                )}
                name="privateCoupon"
                hardFilter={{}}
                hardSort={{ by: 'recent', order: 'descending' }}
                query={Affiliate.call(agent, true).getPrivateCouponsPagination}
                className="h-full"
                size={12n}
            />
        </div>
    )
}

export default CouponsTab
