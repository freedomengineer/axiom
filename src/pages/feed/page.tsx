import HypothesisCard from '@components/Pages/Feed/Hypotheses/HypothesisCard'
import FilterSort from '@components/Shared/FilterSort'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import useFilterSort from '@hooks/useFilterSort'
import { Axioms } from 'shared/utils/services'

const title = 'Truth Feed'
const metadata = siteMetadata.routes['Truth Feed']
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const FeedPage = () => {
    const { agent } = useAuth()
    const filterSortData = useFilterSort('hypothesis')

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <FilterSort {...filterSortData} />
            <InfiniteScrollWrapper
                LayoutComponent={({ items }) => (
                    <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
                        {items.map((item, i) => (
                            <HypothesisCard key={i} item={item} className="w-full" />
                        ))}
                    </div>
                )}
                name="hypothesis"
                hardFilter={filterSortData.filter}
                hardSort={filterSortData.sort}
                query={Axioms.call(agent, true).getHypothesesPagination}
                className="h-full"
                size={12n}
            />
        </>
    )
}

export default FeedPage
