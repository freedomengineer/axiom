import FlagCard from '@components/Pages/Feed/Flags/FlagCard'
import FilterSort from '@components/Shared/FilterSort'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import useFilterSort from '@hooks/useFilterSort'
import { Axioms } from 'shared/utils/services'

const title = 'Flag Dashboard'
const metadata = siteMetadata.routes['Truth Feed'].routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const FlagsPage = () => {
    const { agent } = useAuth()
    const filterSortData = useFilterSort('flag')

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium flex flex-col items-center justify-center">
                <FilterSort {...filterSortData} />
                <InfiniteScrollWrapper
                    LayoutComponent={({ items }) => (
                        <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center">
                            {items.map((item, i) => (
                                <FlagCard key={i} item={item} className="w-full" />
                            ))}
                        </div>
                    )}
                    name="flag"
                    hardFilter={filterSortData.filter}
                    hardSort={filterSortData.sort}
                    query={Axioms.call(agent, true).getFlagsPagination}
                    className="h-full"
                    size={12n}
                />
            </div>
        </>
    )
}

export default FlagsPage
