import FieldCard from '@components/Pages/Feed/Fields/FieldCard'
import FilterSort from '@components/Shared/FilterSort'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import useFilterSort from '@hooks/useFilterSort'
import { Axioms } from 'shared/utils/services'

const title = 'Fields'
const metadata = siteMetadata.routes['Truth Feed'].routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const FieldsPage = () => {
    const { agent } = useAuth()
    const filterSortData = useFilterSort('field')

    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium flex flex-col items-center justify-center">
                <FilterSort {...filterSortData} />
                <InfiniteScrollWrapper
                    LayoutComponent={({ items }) => (
                        <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
                            {items.map((item, i) => (
                                <FieldCard key={i} item={item} className="w-full" />
                            ))}
                        </div>
                    )}
                    name="field"
                    hardFilter={filterSortData.filter}
                    hardSort={filterSortData.sort}
                    query={Axioms.call(agent, true).getFieldsPagination}
                    className="h-full"
                    size={12n}
                />
            </div>
        </div>
    )
}

export default FieldsPage
