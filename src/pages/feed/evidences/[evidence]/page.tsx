import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import EvidenceDetail from '@components/Pages/Feed/Evidences/EvidenceDetail'
import Link from '@components/Shared/Link'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import { build } from '@libs/url'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'

const title = 'Truth Feed'
const metadata = siteMetadata.routes[title]

const OtherEvidencePage = () => {
    const { agent, setPageStatus } = useAuth()
    const { evidence } = useParams<{ evidence: string }>()
    const [item, setItem] = useState<DAxioms.SharableEvidence>()

    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Evidence ${evidence} | ${siteMetadata.title}`,
        description: `Evidence ${evidence} Details Page`,
    }

    useEffect(() => {
        try {
            Axioms.call(agent)
                .getEvidence(BigInt(evidence!))
                .then(setItem)
                .catch(() => setPageStatus(PageStatus.NotFound))
        } catch {
            setPageStatus(PageStatus.NotFound)
        }
    }, [])

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <Link
                href={build(['feed', item?.hypothesisId ?? 0n])}
                className="!text-tiny pre-underline mb-medium text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100"
                icon="backward"
                size="small"
            >
                Back to Hypothesis {item?.hypothesisId ?? 0n}
            </Link>
            {item && <EvidenceDetail item={item} className="mx-auto !w-full" />}
        </>
    )
}

export default OtherEvidencePage
