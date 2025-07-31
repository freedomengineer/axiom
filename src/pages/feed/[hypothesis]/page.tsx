import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import HypothesisDetail from '@components/Pages/Feed/Hypotheses/HypothesisDetail'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'

const title = 'Truth Feed'
const metadata = siteMetadata.routes[title]

const HypothesisPage = () => {
    const { agent, setPageStatus } = useAuth()
    const { hypothesis } = useParams<{ hypothesis: string }>()
    const [item, setItem] = useState<DAxioms.SharableHypothesis>()

    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Hypothesis ${hypothesis} Details | ${siteMetadata.title}`,
        description: `Hypothesis ${hypothesis} Details Page`,
    }

    useEffect(() => {
        try {
            Axioms.call(agent)
                .getHypothesis(BigInt(hypothesis!))
                .then(setItem)
                .catch(() => setPageStatus(PageStatus.NotFound))
        } catch {
            setPageStatus(PageStatus.NotFound)
        }
    }, [hypothesis])

    return (
        <div className="md:p-semilarge p-0">
            <PageMetadata {...pageMetadata} />
            {item && <HypothesisDetail item={item} key={item.id} />}
        </div>
    )
}

export default HypothesisPage
