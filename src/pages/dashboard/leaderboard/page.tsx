import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { N } from 'vitest/dist/chunks/reporters.66aFHiyX'

import TopCard from '@components/Pages/ACEDashboard/Leaderboard/TopCard'
import Spinner from '@components/Primitives/Spinner'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import { PAGE_SIZE, Top, TopKey, getTop } from '@hooks/useTop'
import cn from '@libs/class'
import { LEADERBOARD } from '@utils/dashboard/leaderboard'
import e8s from 'shared/utils/e8s'
import { Unwrap, isNullish } from 'shared/utils/typings'

const title = 'Leaderboard'
const metadata = siteMetadata.routes['ACE Dashboard'].routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const LeaderboardPage = () => {
    const { agent, principal } = useAuth()
    const [searchParams, setSearchPrams] = useSearchParams()
    const [top, setTop] = useState<{ [key: string]: Top | null }>({})
    const [page, setPage] = useState<bigint>(1n)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const keyParam = searchParams.get('key') as TopKey
    const topPage = top[page.toString()]

    useEffect(() => {
        setIsLoading(true)
        getTop(keyParam, page, agent, principal).then((e) => {
            setTop((prev) => ({ ...prev, [page.toString()]: e }))
            setIsLoading(false)
        })
    }, [page, agent, principal])

    useEffect(() => {
        setTop({})
        setPage(1n)
        getTop(keyParam, 1n, agent, principal).then((e) => setTop((prev) => ({ ...prev, '1': e })))
    }, [keyParam, agent, principal])

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
                    {LEADERBOARD.map(({ key, label }) => (
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
                        <p className="text-small gap-medium px-medium mx-auto flex w-full max-w-3xl justify-center text-center font-normal text-cold-700">
                            {LEADERBOARD.find(({ key }) => key === keyParam)?.description}
                        </p>
                        {!topPage ? (
                            <Spinner className="mx-auto mt-10 h-10 w-10" />
                        ) : (
                            <div className="gap-normal flex w-full flex-col">
                                <p className="text-small gap-medium px-medium mx-auto flex w-full max-w-3xl justify-end font-medium text-cold-800">
                                    Your rank:{' '}
                                    {isNullish(Unwrap(topPage.callerRank))
                                        ? 'N/A'
                                        : Unwrap(topPage.callerRank)! + 1n}
                                </p>
                                {Object.values(top).map((e: Top | null, i) =>
                                    e?.result?.map(([address, value], j) => (
                                        <TopCard
                                            key={address.toText()}
                                            string={address.toText()}
                                            number={
                                                [
                                                    'PoweredVoters',
                                                    'AcornBuriers',
                                                    'AcornEarners',
                                                ].includes(keyParam)
                                                    ? e8s.toNumber(value)
                                                    : Number(value)
                                            }
                                            index={i * Number(PAGE_SIZE) + j}
                                        />
                                    ))
                                )}
                                {topPage?.is !== topPage?.of && (
                                    <button
                                        className="gap-medium px-medium py-normal text-small mx-auto flex w-fit rounded-lg border border-cold-700 font-medium text-cold-700 hover:bg-cold-50 disabled:pointer-events-none disabled:bg-cold-50"
                                        onClick={() => setPage(page + 1n)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Spinner className="mx-auto" /> : 'Load more'}
                                    </button>
                                )}
                            </div>
                        )}
                    </TabPanel>
                </TabsBody>
            </Tabs>
        </>
    )
}

export default LeaderboardPage
