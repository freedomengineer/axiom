import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import Spinner from '@components/Primitives/Spinner'
import Link from '@components/Shared/Link'
import PageMetadata from '@components/Shared/PageMetadata'
import Pagination from '@components/Shared/Pagination'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import cn from '@libs/class'
import { getCanisterDate } from '@libs/date'
import { build } from '@libs/url'
import { AGES } from '@utils/feed/age'
import { NANOS_IN_A_DAY } from 'shared/constants'
import { DAxioms } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { Axioms } from 'shared/utils/services'
import { Unwrap } from 'shared/utils/typings'

const title = 'Payout History'
const metadata = siteMetadata.routes['Truth Feed'].routes[title]

const SpecificHistoryPage = () => {
    const { agent, setPageStatus } = useAuth()
    const { ago } = useParams<{ ago: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    const [payouts, setPayouts] = useState<DAxioms.SharablePayout[]>()

    const pageMetadata: Metadata = {
        url: `${siteMetadata.siteUrl}${metadata.url}/${ago}`,
        title: `${title} Age ${searchParams.get('age') ?? '1'} ${ago === '0' ? 'Today' : ago === '1' ? 'Yesterday' : `${ago} Days Ago`} | ${siteMetadata.title}`,
        description: metadata.description,
    }

    useEffect(() => {
        searchParams.get('age') === null && searchParams.set('age', '1')
        try {
            Axioms.call(agent, true).getAgesPayout(BigInt(ago!)).then(setPayouts)
        } catch {
            setPageStatus(PageStatus.NotFound)
        }
    }, [ago])

    const onPageChange = (ago: bigint) => {
        navigate(build(['feed', 'history', ago - 1n], { age: searchParams.get('age') ?? '1' }))
    }
    const onTabChange = (age: string) => {
        setSearchParams({ age })
    }

    if (!payouts) {
        return <Spinner className="mx-auto my-auto flex h-10 w-10" />
    }

    const { callerRevenue, ranks } = payouts[Number(searchParams.get('age')) - 1]
    const revenue = Unwrap(callerRevenue)

    return (
        <>
            <PageMetadata {...pageMetadata} />
            <Tabs value={searchParams.get('age') ?? '1'}>
                <TabsHeader
                    className="rounded-none border-b border-primary-50 bg-transparent p-0"
                    indicatorProps={{
                        className:
                            'bg-transparent border-b-2 border-primary-700 shadow-none rounded-none',
                    }}
                >
                    {AGES.map(({ id, label }) => (
                        <Tab
                            key={id}
                            value={id}
                            onClick={() => onTabChange(id)}
                            className={cn(
                                'text-normal font-normal',
                                searchParams.get('age') === id ? 'text-primary-700' : ''
                            )}
                        >
                            <span className="text-normal text-nowrap font-normal">
                                Age {id} ({label})
                            </span>
                        </Tab>
                    ))}
                </TabsHeader>
                <TabsBody>
                    <p className="text-small mt-6 text-right text-cold-700">
                        Your revenue: {e8s.toString(revenue ?? 0n)} ACORNs
                    </p>
                    {AGES.map(({ id }) => (
                        <TabPanel key={id} value={id}>
                            {ranks.length === 0 ? (
                                <div className="flex h-full w-full flex-col items-center justify-center text-center">
                                    <p className="text-normal font-medium text-cold-700">
                                        No Payouts Found
                                    </p>
                                    <p className="text-tiny font-normal text-cold-700">
                                        There was no ACORN distributed for Age {id} in{' '}
                                        {getCanisterDate({
                                            ago: { nano: BigInt(ago!) * NANOS_IN_A_DAY },
                                        })}
                                        .
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-cold-300 md:overflow-hidden">
                                    <table className="min-w-full border-collapse">
                                        <thead className="bg-cold-50">
                                            <tr>
                                                {[
                                                    'Hypothesis',
                                                    'Average Rank',
                                                    'Regular Votes',
                                                    'Powered Votes',
                                                ].map((title, i) => (
                                                    <th
                                                        key={i}
                                                        scope="col"
                                                        className={cn(
                                                            'text-small px-normal py-small select-none text-nowrap bg-cold-100',
                                                            'border-b border-r border-cold-300',
                                                            i === 0 && 'border-l-0',
                                                            i === 3 && 'border-r-0'
                                                        )}
                                                    >
                                                        <div className="flex w-full items-center justify-center font-semibold text-cold-700">
                                                            <span>{title}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ranks.map(
                                                (
                                                    {
                                                        hypothesisId,
                                                        averageRank,
                                                        regularEntry,
                                                        poweredEntry,
                                                    },
                                                    i
                                                ) => {
                                                    const isLastRow = i === ranks.length - 1
                                                    return (
                                                        <tr
                                                            key={i}
                                                            className="group hover:bg-cold-50"
                                                        >
                                                            <td
                                                                className={cn(
                                                                    '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                                                    'border-b border-r border-cold-300',
                                                                    isLastRow && 'border-b-0'
                                                                )}
                                                            >
                                                                <Link
                                                                    href={`/feed/${hypothesisId}`}
                                                                    color="cold-600"
                                                                    className="pre-underline !text-tiny group z-10 w-full justify-start !font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                                                    icon="forward"
                                                                    size="small"
                                                                    openInNewTab
                                                                >
                                                                    {hypothesisId}
                                                                </Link>
                                                            </td>
                                                            <td
                                                                className={cn(
                                                                    '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                                                    'border-b border-r border-cold-300',
                                                                    isLastRow && 'border-b-0'
                                                                )}
                                                            >
                                                                #{averageRank}
                                                            </td>
                                                            <td
                                                                className={cn(
                                                                    '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                                                    'border-b border-r border-cold-300',
                                                                    isLastRow && 'border-b-0'
                                                                )}
                                                            >
                                                                <span className="font-semibold">
                                                                    #{regularEntry.rank.toString()}
                                                                </span>{' '}
                                                                ({regularEntry.score.toString()}{' '}
                                                                votes)
                                                            </td>
                                                            <td
                                                                className={cn(
                                                                    '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                                                    'border-b border-cold-300',
                                                                    isLastRow && 'border-b-0'
                                                                )}
                                                            >
                                                                <span className="font-semibold">
                                                                    #{poweredEntry.rank.toString()}
                                                                </span>{' '}
                                                                ({e8s.toString(poweredEntry.score)}{' '}
                                                                ACORNs)
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="mt-large flex justify-center">
                                <Pagination
                                    is={BigInt(ago!) + 1n}
                                    of={21n}
                                    onPageChange={onPageChange}
                                />
                            </div>
                        </TabPanel>
                    ))}
                </TabsBody>
            </Tabs>
        </>
    )
}

export default SpecificHistoryPage
