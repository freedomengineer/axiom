import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import HypothesisCard from '@components/Pages/Feed/Hypotheses/HypothesisCard'
import FilterSort from '@components/Shared/FilterSort'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import { HYPOTHESIS_FILTER, HYPOTHESIS_SORT } from 'shared/default/filter_sort'
import { DAxioms } from 'shared/types/services'
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
    const [, setSearchParams] = useSearchParams()
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setSearchParams({ publishedAt: '2', by: 'popularity' })
        setLoading(false)
    }, [])

    return (
        <>
            <PageMetadata {...pageMetadata} />
            {!loading && (
                <div className="gap-medium flex flex-col items-center justify-center">
                    <FilterSort filter={HYPOTHESIS_FILTER} sort={HYPOTHESIS_SORT} />
                    <InfiniteScrollWrapper<DAxioms.SharableHypothesis>
                        LayoutComponent={({ items }) => (
                            <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
                                {items.map((item, i) => (
                                    <HypothesisCard key={i} item={item} className="w-full" />
                                ))}
                            </div>
                        )}
                        query={Axioms.call(agent, true).getHypothesesPagination}
                        filter={HYPOTHESIS_FILTER}
                        sort={HYPOTHESIS_SORT}
                        className="h-full"
                        size={12n}
                    />
                </div>
            )}
        </>
    )
}

export default FeedPage
