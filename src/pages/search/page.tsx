import { ComponentType, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import EvidenceCard from '@components/Pages/Feed/Evidences/EvidenceCard'
import FieldCard from '@components/Pages/Feed/Fields/FieldCard'
import HypothesisCard from '@components/Pages/Feed/Hypotheses/HypothesisCard'
import UserCard from '@components/Pages/Profile/UserCard'
import Heading from '@components/Shared/Heading'
import Link from '@components/Shared/Link'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import { error } from '@libs/toastify'
import { build } from '@libs/url'
import {
    buildEvidenceFilter,
    buildEvidenceSort,
    buildFieldFilter,
    buildFieldSort,
    buildHypothesisFilter,
    buildHypothesisSort,
    buildUserFilter,
    buildUserSort,
} from 'shared/default/filter_sort'
import { DAxioms, DFacade } from 'shared/types/services'
import { Axioms, Facade } from 'shared/utils/services'

const title = 'Search'
const metadata = siteMetadata.routes[title]

const SearchPage = () => {
    const { agent } = useAuth()
    const [searchParams] = useSearchParams()

    const [results, setResults] = useState<{
        hypotheses?: Pagination<DAxioms.SharableHypothesis>
        evidences?: Pagination<DAxioms.SharableEvidence>
        fields?: Pagination<DAxioms.SharableField>
        users?: Pagination<DFacade.Sharable>
    }>({})

    const containsPattern = searchParams.get('containsPattern') ?? ''
    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `${title} all "${containsPattern}" | ${siteMetadata.title}`,
        description: metadata.description,
    }

    useEffect(() => {
        Promise.all([
            Axioms.call(agent)
                .getHypothesesPagination(
                    buildHypothesisFilter({ containsPattern }),
                    buildHypothesisSort({ by: 'recent', order: 'descending' }),
                    1n,
                    4n
                )
                .catch(error),
            Axioms.call(agent)
                .getEvidencesPagination(
                    buildEvidenceFilter({ containsPattern }),
                    buildEvidenceSort({ by: 'recent', order: 'descending' }),
                    1n,
                    4n
                )
                .catch(error),
            Axioms.call(agent)
                .getFieldsPagination(
                    buildFieldFilter({ containsPattern }),
                    buildFieldSort({ by: 'popularity', order: 'descending' }),
                    1n,
                    4n
                )
                .catch(error),
            Facade.call(agent)
                .getUsersPagination(
                    buildUserFilter({ containsPattern }),
                    buildUserSort({ by: 'capitalRaised', order: 'descending' }),
                    1n,
                    4n
                )
                .catch(error),
        ])
            .then(([hypotheses, evidences, fields, users]) =>
                setResults({ hypotheses, evidences, fields, users } as any)
            )
            .catch(error)
    }, [containsPattern, Axioms, Facade])

    const Layout = <T,>({
        Component,
        name,
    }: {
        Component: ComponentType<{ item: T }>
        name: keyof typeof results
    }) => {
        const result = results[name]

        return (
            <div
                className="gap-medium mr-auto flex w-full flex-col items-center aria-hidden:hidden"
                aria-hidden={!result || result.result.length === 0}
            >
                <div className="flex w-full items-center justify-between">
                    <Heading text={name} />
                    {result && result!.is !== result!.of ? (
                        <Link
                            href={build(['search', name], { containsPattern })}
                            className="pre-underline text-primary-700 decoration-primary-700/50 hover:decoration-primary-700/100 aria-hidden:hidden"
                            size="normal"
                            icon="forward"
                            aria-hidden={result && result!.is === result!.of}
                        >
                            {`View all (is page ${result!.is} of ${result!.of})`}
                        </Link>
                    ) : (
                        <div className="text-cold-700">All results found</div>
                    )}
                </div>
                <div className="gap-medium flex h-full w-full overflow-x-auto pb-4">
                    <div className="gap-medium flex flex-nowrap items-stretch">
                        {result?.result.map((item, i) => (
                            <div key={`${name}${i}`} className="shrink-0">
                                <Component item={item as T} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <Layout Component={HypothesisCard} name="hypotheses" />
            <Layout Component={EvidenceCard} name="evidences" />
            <Layout Component={FieldCard} name="fields" />
            <Layout Component={UserCard} name="users" />
        </>
    )
}

export default SearchPage
