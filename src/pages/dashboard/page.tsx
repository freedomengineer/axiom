import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import SimpleConfigsDetachment from '@components/Pages/ACEDashboard/Proposals/ProposalDetachments/SimpleConfigsDetachment'
import SimpleSnapshotsDetachment from '@components/Pages/ACEDashboard/Proposals/ProposalDetachments/SimpleSnapshotsDetachment'
import SimpleStatusDetachment from '@components/Pages/ACEDashboard/Proposals/ProposalDetachments/SimpleStatusDetachment'
import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@components/Primitives/MemorizedTabs'
import Spinner from '@components/Primitives/Spinner'
import Divider from '@components/Shared/Divider'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import { getConfigs } from '@hooks/useConfigs'
import { Actor, ActorStatus, getStatus } from '@hooks/useStatus'
import { DEPLOYABLE_ACTORS } from 'shared/constants'
import { DIndicator } from 'shared/types/services'

const title = 'ACE Dashboard'
const metadata = siteMetadata.routes[title]

const DashboardPage = () => {
    const [searchParams, setSearchPrams] = useSearchParams()

    const [status, setStatus] = useState<ActorStatus | null>(null)
    const [configs, setConfigs] = useState<Record<
        string,
        UnwrapDVariant<DIndicator.SharableValue>
    > | null>(null)

    const actorParam = (searchParams.get('actor') ??
        'Indicator') as (typeof DEPLOYABLE_ACTORS)[number]
    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `${actorParam ?? 'Indicator'} Dashboard | ${siteMetadata.title}`,
        description: metadata.description,
    }

    useEffect(() => {
        setStatus(null)
        setConfigs(null)

        Promise.all([
            getStatus(actorParam as Actor).then(setStatus),
            getConfigs(actorParam).then(setConfigs),
        ])
    }, [actorParam])

    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} />
            <Tabs value={actorParam}>
                <TabsHeader>
                    {DEPLOYABLE_ACTORS.map((actor) => (
                        <Tab key={actor} value={actor} onClick={() => setSearchPrams({ actor })}>
                            <span className="text-normal font-normal">{actor}</span>
                        </Tab>
                    ))}
                </TabsHeader>
                <TabsBody className="gap-medium mt-medium">
                    <TabPanel key={actorParam} value={actorParam}>
                        {!status ? (
                            <Spinner className="mx-auto h-7 w-7 md:h-9 md:w-9" />
                        ) : (
                            <>
                                <SimpleStatusDetachment actorStatus={status} />
                                {status.Snapshots[1].length > 0 && (
                                    <>
                                        <Divider
                                            direction="horizontal"
                                            bgColor="bg-cold-800"
                                            borderColor="border-cold-800"
                                            className="my-medium mx-auto w-4/5"
                                        />
                                        <SimpleSnapshotsDetachment
                                            snapshots={status.Snapshots[1]}
                                        />
                                    </>
                                )}
                            </>
                        )}
                        <Divider
                            direction="horizontal"
                            bgColor="bg-cold-800"
                            borderColor="border-cold-800"
                            className="my-medium mx-auto w-4/5"
                        />
                        {configs && Object.keys(configs).length > 0 ? (
                            <SimpleConfigsDetachment actorConfigs={configs} />
                        ) : (
                            <p className="text-normal text-center font-light text-cold-600">
                                No configuration variables set for this actor
                            </p>
                        )}
                    </TabPanel>
                </TabsBody>
            </Tabs>
        </div>
    )
}

export default DashboardPage
