import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import TopCard from '@components/Pages/ACEDashboard/Top10/TopCard'
import Spinner from '@components/Primitives/Spinner'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import { Top, TopKey, getTop } from '@hooks/useTop'
import cn from '@libs/class'
import { TOP } from '@utils/dashboard/top'

const title = 'Top 10'
const metadata = siteMetadata.routes['ACE Dashboard'].routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const Top10Page = () => {
    const [searchParams, setSearchPrams] = useSearchParams()
    const [top, setTop] = useState<Top | null>(null)
    const [page, setPage] = useState<bigint>(1n)

    const keyParam = searchParams.get('key') as TopKey

    useEffect(() => {
        setTop(null)
        getTop(keyParam, page).then(setTop)
    }, [keyParam, page])

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <Tabs value={keyParam}>
                <TabsHeader
                    className="overflow-x-auto rounded-none border-b border-primary-50 bg-transparent p-0"
                    indicatorProps={{
                        className:
                            'bg-transparent border-b-2 border-primary-700 shadow-none rounded-none',
                    }}
                >
                    {TOP.map(({ key, label }) => (
                        <Tab
                            key={key}
                            value={key}
                            onClick={() => setSearchPrams({ key })}
                            className={cn(
                                'text-normal font-normal',
                                keyParam === key ? 'text-primary-700' : ''
                            )}
                        >
                            <span className="text-normal text-nowrap font-normal">{label}</span>
                        </Tab>
                    ))}
                </TabsHeader>
                <TabsBody>
                    <TabPanel
                        key={keyParam}
                        value={keyParam}
                        className="gap-medium mt-medium flex w-full flex-col flex-wrap items-center"
                    >
                        {!top ? (
                            <Spinner className="mx-auto mt-10 h-10 w-10" />
                        ) : (
                            <div className="gap-normal flex w-full flex-col">
                                {top.result.map(([address, value], index) => (
                                    <TopCard
                                        key={address}
                                        string={address}
                                        number={value}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
                    </TabPanel>
                </TabsBody>
            </Tabs>
        </>
    )
}

export default Top10Page
