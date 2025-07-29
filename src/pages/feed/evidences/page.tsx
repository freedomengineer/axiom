import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'

import EvidenceCard from '@components/Pages/Feed/Evidences/EvidenceCard'
import FilterSort from '@components/Shared/FilterSort'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import useFilterSort from '@hooks/useFilterSort'
import { Axioms } from 'shared/utils/services'

const title = 'Evidences'
const metadata = siteMetadata.routes['Truth Feed'].routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const EvidencesPage = () => {
    const { agent } = useAuth()
    const filterSortData = useFilterSort('evidence')

    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} />
            <div className="gap-medium flex flex-col items-center justify-center">
                <FilterSort {...filterSortData} />
                <InfiniteScrollWrapper
                    LayoutComponent={({ items }) => (
                        <ResponsiveMasonry
                            columnsCountBreakPoints={{ [530]: 1, [530 * 2]: 2, [530 * 3]: 3 }}
                            className="gap-medium mx-auto w-full max-w-[1500px]"
                        >
                            <Masonry>
                                {items.map((item, i) => (
                                    <EvidenceCard key={i} item={item} className="mx-auto !w-full" />
                                ))}
                            </Masonry>
                        </ResponsiveMasonry>
                    )}
                    name="evidence"
                    hardFilter={filterSortData.filter}
                    hardSort={filterSortData.sort}
                    query={Axioms.call(agent, true).getEvidencesPagination}
                    className="h-full w-full"
                    size={6n}
                />
            </div>
        </div>
    )
}

export default EvidencesPage
