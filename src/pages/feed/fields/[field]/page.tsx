import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import HypothesisCard from '@components/Pages/Feed/Hypotheses/HypothesisCard'
import Description from '@components/Shared/Description'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import useAuth, { PageStatus } from '@hooks/useAuth'
import cn from '@libs/class'
import { formatDate } from '@libs/date'
import { parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'

const title = 'Fields'
const metadata = siteMetadata.routes['Truth Feed'].routes[title]

const FieldPage = () => {
    const { agent, setPageStatus } = useAuth()
    const { field } = useParams<{ field: string }>()
    const [item, setItem] = useState<DAxioms.SharableField>()
    const [hypotheses, setHypotheses] = useState<DAxioms.SharableHypothesis[]>()

    const pageMetadata: Metadata = {
        url: siteMetadata.siteUrl + metadata.url,
        title: `Field ${field} Details | ${siteMetadata.title}`,
        description: `Field ${field} Details Page`,
    }

    useEffect(() => {
        try {
            Promise.all([
                Axioms.call(agent).getField(decodeURIComponent(field!)).then(setItem),
                Axioms.call(agent)
                    .getHypothesesPagination(
                        parseFilterFromObj('hypothesis', {
                            publishedIn: decodeURIComponent(field!),
                        }),
                        parseSortFromObj('hypothesis', {
                            by: 'popularity',
                            order: 'descending',
                        }),
                        1n,
                        100n
                    )
                    .then(({ result }) => setHypotheses(result)),
            ])
        } catch {
            setPageStatus(PageStatus.NotFound)
        }
    }, [])

    return (
        <>
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
                        {hypotheses?.map((item, i) => <HypothesisCard key={i} item={item} />)}
                    </div>
                </div>
            )}
        </>
    )
}

export default FieldPage
