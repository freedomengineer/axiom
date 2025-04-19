import { useParams } from 'react-router-dom'

import EvidenceCard from '@components/Pages/Feed/Evidences/EvidenceCard'
import FieldCard from '@components/Pages/Feed/Fields/FieldCard'
import HypothesisCard from '@components/Pages/Feed/Hypotheses/HypothesisCard'
import UserCard from '@components/Pages/Profile/UserCard'
import PageMetadata from '@components/Shared/PageMetadata'
import PaginationWrapper from '@components/Shared/PaginationWrapper'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import {
    EVIDENCE_FILTER,
    EVIDENCE_SORT,
    FIELD_FILTER,
    FIELD_SORT,
    HYPOTHESIS_FILTER,
    HYPOTHESIS_SORT,
    USER_FILTER,
    USER_SORT,
} from 'shared/default/filter_sort'
import { DAxioms, DFacade } from 'shared/types/services'
import { Axioms, Facade } from 'shared/utils/services'

const title = 'Search'
const metadata = siteMetadata.routes[title]

const SpecificSearchPage = () => {
    const { agent, setPageStatus } = useAuth()
    const { type } = useParams<{ type: 'hypotheses' | 'evidences' | 'fields' | 'users' }>()

    if (!type || !['hypotheses', 'evidences', 'fields', 'users'].includes(type)) {
        setPageStatus(PageStatus.NotFound)
    }

    const queries = {
        hypotheses: {
            query: Axioms.call(agent, true).getHypothesesPagination,
            filter: HYPOTHESIS_FILTER,
            sort: HYPOTHESIS_SORT,
        },
        evidences: {
            query: Axioms.call(agent, true).getEvidencesPagination,
            filter: EVIDENCE_FILTER,
            sort: EVIDENCE_SORT,
        },
        fields: {
            query: Axioms.call(agent, true).getFieldsPagination,
            filter: FIELD_FILTER,
            sort: FIELD_SORT,
        },
        users: {
            query: Facade.call(agent, true).getUsersPagination,
            filter: USER_FILTER,
            sort: USER_SORT,
        },
    }
    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Search ${type} | ${siteMetadata.title}`,
        description: metadata.description,
    }

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <PaginationWrapper<any>
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
                {...queries[type!]}
            />
        </>
    )
}

export default SpecificSearchPage
