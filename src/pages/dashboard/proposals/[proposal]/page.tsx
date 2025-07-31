import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import ProposalDetail from '@components/Pages/ACEDashboard/Proposals/ProposalDetail'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import { DDAO } from 'shared/types/services'
import { DAO } from 'shared/utils/services'

const title = 'Proposals'
const metadata = siteMetadata.routes['ACE Dashboard'].routes[title]

const ProposalPage = () => {
    const { agent, setPageStatus } = useAuth()
    const { proposal } = useParams<{ proposal: string }>()
    const [item, setItem] = useState<DDAO.SharableProposal>()

    const pageMetadata: Metadata = {
        url: `${siteMetadata.siteUrl}${metadata.url}/${proposal}`,
        title: `Proposal ${proposal} Details | ACE Dashboard | ${siteMetadata.title}`,
        description: `Proposal ${proposal} Details Page`,
    }

    useEffect(() => {
        try {
            DAO.call(agent)
                .getProposal(BigInt(proposal!))
                .then(setItem)
                .catch(() => setPageStatus(PageStatus.NotFound))
        } catch {
            setPageStatus(PageStatus.NotFound)
        }
    }, [proposal])

    return (
        <div className="md:p-semilarge py-semilarge px-0">
            <PageMetadata {...pageMetadata} />
            {item && <ProposalDetail item={item} key={item.id} />}
        </div>
    )
}

export default ProposalPage
