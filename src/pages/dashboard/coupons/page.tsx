import CouponCard from '@components/Pages/ACEDashboard/Coupons/CouponCard'
import FilterSort from '@components/Shared/FilterSort'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import useFilterSort from '@hooks/useFilterSort'
import { Affiliate } from 'shared/utils/services'

const title = 'Coupons'
const metadata = siteMetadata.routes['ACE Dashboard'].routes['Coupons']
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ACE Dashboard | ${siteMetadata.title}`,
    description: metadata.description,
}

const CouponsPage = () => {
    const { agent } = useAuth()
    const filterSortData = useFilterSort('coupon')

    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} />
            <FilterSort {...filterSortData} />
            <InfiniteScrollWrapper
                LayoutComponent={({ items }) => (
                    <div className="gap-medium grid w-full grid-cols-1 md:grid-cols-2">
                        {items.map((item, i) => (
                            <CouponCard key={i} item={item} />
                        ))}
                    </div>
                )}
                name="coupon"
                hardFilter={filterSortData.filter}
                hardSort={filterSortData.sort}
                query={Affiliate.call(agent, true).getCouponsPagination}
                className="h-full"
                size={6n}
            />
        </div>
    )
}

export default CouponsPage
