import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import SimpleConfigsDetachment from '@components/Pages/ACEDashboard/Proposals/ProposalDetachments/SimpleConfigsDetachment'
import SimpleStatusDetachment from '@components/Pages/ACEDashboard/Proposals/ProposalDetachments/SimpleStatusDetachment'
import Spinner from '@components/Primitives/Spinner'
import Divider from '@components/Shared/Divider'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import { getConfigs } from '@hooks/useConfigs'
import { Actor, ActorStatus, getStatus } from '@hooks/useStatus'
import cn from '@libs/class'
import { DEPLOYABLE_ACTORS } from 'shared/constants'
import { DIndicator } from 'shared/types/services'
import * as SERVICES from 'shared/utils/services'

const title = 'ACE Dashboard'
const metadata = siteMetadata.routes[title]

const DashboardPage = () => {
    const [searchParams, setSearchPrams] = useSearchParams()

    const [status, setStatus] = useState<ActorStatus | null>(null)
    const [configs, setConfigs] = useState<Record<
        string,
        UnwrapDVariant<DIndicator.SharableValue>
    > | null>(null)

    const actor = searchParams.get('actor') as (typeof DEPLOYABLE_ACTORS)[number]
    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `${actor ?? 'Indicator'} Dashboard | ${siteMetadata.title}`,
        description: metadata.description,
    }

    useEffect(() => {
        if (!actor || !(SERVICES as any)[actor]) setSearchPrams({ actor: 'Indicator' })
    }, [SERVICES])
    useEffect(() => {
        setStatus(null)
        setConfigs(null)

        const actor = searchParams.get('actor') as (typeof DEPLOYABLE_ACTORS)[number]
        if (!actor || !(SERVICES as any)[actor]) return

        Promise.all([getStatus(actor as Actor).then(setStatus), getConfigs(actor).then(setConfigs)])
    }, [searchParams])

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <Tabs value={searchParams.get('actor') ?? 'Indicator'}>
                <TabsHeader
                    className="overflow-x-auto rounded-none border-b border-primary-50 bg-transparent p-0"
                    indicatorProps={{
                        className:
                            'bg-transparent border-b-2 border-primary-700 shadow-none rounded-none',
                    }}
                >
                    {DEPLOYABLE_ACTORS.map((actor) => (
                        <Tab
                            key={actor}
                            value={actor}
                            onClick={() => setSearchPrams({ actor })}
                            className={cn(
                                'text-normal font-normal',
                                searchParams.get('actor') === actor ? 'text-primary-700' : ''
                            )}
                        >
                            <span className="text-normal font-normal">{actor}</span>
                        </Tab>
                    ))}
                </TabsHeader>
                <TabsBody>
                    <TabPanel
                        key={searchParams.get('actor') ?? 'Indicator'}
                        value={searchParams.get('actor') ?? 'Indicator'}
                        className="gap-medium mt-medium flex w-full flex-col flex-wrap items-center"
                    >
                        {!status ? (
                            <Spinner className="mx-auto mt-10 h-10 w-10" />
                        ) : (
                            <SimpleStatusDetachment actorStatus={status} />
                        )}
                        <Divider
                            direction="horizontal"
                            bgColor="bg-cold-800"
                            borderColor="border-cold-800"
                            className="my-medium w-4/5"
                        />
                        {configs && Object.keys(configs).length > 0 ? (
                            <SimpleConfigsDetachment actorConfigs={configs} />
                        ) : (
                            <p className="text-medium mt-10 text-center font-light text-cold-600">
                                No configuration variables set for this actor
                            </p>
                        )}
                    </TabPanel>
                </TabsBody>
            </Tabs>
        </>
    )
}

export default DashboardPage
