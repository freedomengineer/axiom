import { useParams, useSearchParams } from 'react-router-dom'

import EvidenceCard from '@components/Pages/Feed/Evidences/EvidenceCard'
import FieldCard from '@components/Pages/Feed/Fields/FieldCard'
import HypothesisCard from '@components/Pages/Feed/Hypotheses/HypothesisCard'
import UserCard from '@components/Pages/Profile/UserCard'
import PageMetadata from '@components/Shared/PageMetadata'
import PaginationWrapper from '@components/Shared/PaginationWrapper'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import { Axioms, Facade } from 'shared/utils/services'

const title = 'Search'
const metadata = siteMetadata.routes[title]

const SpecificSearchPage = () => {
    const [searchParams] = useSearchParams()
    const { type } = useParams<{ type: 'hypotheses' | 'evidences' | 'fields' | 'users' }>()
    const { agent, setPageStatus } = useAuth()

    if (!type || !['hypotheses', 'evidences', 'fields', 'users'].includes(type)) {
        setPageStatus(PageStatus.NotFound)
    }

    const queries = {
        hypotheses: Axioms.call(agent, true).getHypothesesPagination,
        evidences: Axioms.call(agent, true).getEvidencesPagination,
        fields: Axioms.call(agent, true).getFieldsPagination,
        users: Facade.call(agent, true).getUsersPagination,
    }
    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Search ${type} | ${siteMetadata.title}`,
        description: metadata.description,
    }
    const q = searchParams.get('q')

    return (
        <>
            <PageMetadata {...pageMetadata} key={type} />
            <PaginationWrapper
                key={type}
                LayoutComponent={({ items }: any) => (
                    <div className="gap-medium flex flex-wrap justify-center">
                        {items.map((item: any) =>
                            ({
                                hypotheses: HypothesisCard,
                                evidences: EvidenceCard,
                                fields: FieldCard,
                                users: UserCard,
                            })[type!]({ item })
                        )}
                    </div>
                )}
                name={
                    {
                        hypotheses: 'hypothesis',
                        evidences: 'evidence',
                        fields: 'field',
                        users: 'user',
                    }[type!]
                }
                query={queries[type!]}
                hardFilter={q ? { q } : {}}
            />
        </>
    )
}

export default SpecificSearchPage
