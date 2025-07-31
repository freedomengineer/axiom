import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import HypothesisCard from '@components/Pages/Feed/Hypotheses/HypothesisCard'
import Description from '@components/Shared/Description'
import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import cn from '@libs/class'
import { formatDate } from '@libs/date'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'

const title = 'Fields'
const metadata = siteMetadata.routes['Truth Feed'].routes[title]

const FieldPage = () => {
    const { agent, setPageStatus } = useAuth()
    const { field } = useParams<{ field: string }>()
    const [item, setItem] = useState<DAxioms.SharableField>()

    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Field ${field} Details | ${siteMetadata.title}`,
        description: `Field ${field} Details Page`,
    }

    useEffect(() => {
        try {
            Axioms.call(agent).getField(decodeURIComponent(field!)).then(setItem)
        } catch {
            setPageStatus(PageStatus.NotFound)
        }
    }, [field])

    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} key={field} />
            {item && (
                <div className="gap-large flex flex-col" key={field}>
                    <Description text={item.description} />
                    <div className="w-full overflow-x-auto rounded-lg border border-cold-300 md:overflow-hidden">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-cold-50">
                                <tr>
                                    {['Information', 'Value'].map((title, i) => (
                                        <th
                                            key={i}
                                            scope="col"
                                            className={cn(
                                                'text-small px-normal py-small select-none text-nowrap bg-cold-100',
                                                'border-b border-r border-cold-300',
                                                i === 0 && 'border-l-0',
                                                i === 1 && 'border-r-0'
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
                                {[
                                    ['Creation Date', formatDate({ nano: item.creationDate })],
                                    ['Total Hypotheses', item.hypothesisIds.length],
                                    ['Total Members', item.members.length],
                                ].map(([key, value], index) => {
                                    const isLastRow = index === 2
                                    return (
                                        <tr
                                            key={index}
                                            className="group cursor-pointer hover:bg-cold-50"
                                        >
                                            <td
                                                className={cn(
                                                    '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                                    'border-b border-r border-cold-300',
                                                    isLastRow && 'border-b-0'
                                                )}
                                            >
                                                {key}
                                            </td>
                                            <td
                                                className={cn(
                                                    '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                                    'border-b border-cold-300',
                                                    isLastRow && 'border-b-0'
                                                )}
                                            >
                                                <code>{value}</code>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="gap-medium flex w-full flex-wrap justify-center">
                        <InfiniteScrollWrapper
                            LayoutComponent={({ items }) => (
                                <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
                                    {items.map((item, i) => (
                                        <HypothesisCard key={i} item={item} className="w-full" />
                                    ))}
                                </div>
                            )}
                            name="hypothesis"
                            hardFilter={{ field: decodeURIComponent(field!) }}
                            hardSort={{ by: 'recent', order: 'descending' }}
                            query={Axioms.call(agent, true).getHypothesesPagination}
                            className="h-full w-full"
                            size={6n}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default FieldPage
