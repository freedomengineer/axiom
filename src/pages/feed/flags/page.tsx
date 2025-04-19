import FlagCard from '@components/Pages/Feed/Flags/FlagCard'
import FilterSort from '@components/Shared/FilterSort'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import { FLAG_FILTER, FLAG_SORT } from 'shared/default/filter_sort'
import { DAxioms } from 'shared/types/services'
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

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium flex flex-col items-center justify-center">
                <FilterSort filter={FLAG_FILTER} sort={FLAG_SORT} />
                <InfiniteScrollWrapper<DAxioms.SharableFlag>
                    LayoutComponent={({ items }) => (
                        <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center">
                            {items.map((item, i) => (
                                <FlagCard key={i} item={item} className="w-full" />
                            ))}
                        </div>
                    )}
                    query={Axioms.call(agent, true).getFlagsPagination}
                    filter={FLAG_FILTER}
                    sort={FLAG_SORT}
                    className="h-full"
                    size={12n}
                />
            </div>
        </>
    )
}

export default FlagsPage
