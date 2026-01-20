import { PieChart } from '@mui/x-charts'
import { useEffect, useState } from 'react'

import Divider from '@components/Shared/Divider'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import cn from '@libs/class'
import {
    ALLOCATIONS,
    ChartData,
    DISTRIBUTIONS,
    computeAllocationsChartData,
    computeDistributionsChartData,
} from '@utils/assets/assets'
import { Split, Treasury } from 'shared/utils/services'

const title = 'Token Charts'
const metadata = siteMetadata.routes['ACE Dashboard'].routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const AssetsPage = () => {
    const [allocations, setAllocations] = useState<{
        inner: Record<string, ChartData>
        outer: Record<string, ChartData[]>
    }>()
    const [distributions, setDistributions] = useState<{
        inner: Record<string, ChartData>
        outer: Record<string, ChartData[]>
    }>()
    // const [maxSupply, setMaxSupply] = useState<number>(0)
    // const [circulatingSupply, setCirculatingSupply] = useState<number>(0)
    // const [reservingSupply, setReservingSupply] = useState<number>(0)

    useEffect(() => {
        Promise.all([Treasury.call().getAllocations(), Split.call().getDistributions()]).then(
            ([allocations, distributions]) => {
                setAllocations(computeAllocationsChartData(allocations))
                setDistributions(computeDistributionsChartData(distributions))
            }
        )
    }, [])

    if (!allocations || !distributions) {
        return null
    }

    return (
        <div className="p-semilarge">
            <PageMetadata {...pageMetadata} />
            <div className="!text-small gap-medium relative flex flex-col items-center justify-center lg:flex-col xl:flex-row">
                <div className="relative w-[300px]">
                    <PieChart
                        series={[
                            {
                                innerRadius: 0,
                                outerRadius: 80,
                                data: Object.values(allocations.inner),
                            },
                            {
                                innerRadius: 100,
                                outerRadius: 120,
                                data: Object.values(allocations.outer)
                                    .flat()
                                    .filter((item) => !item.label.includes('Balance')),
                            },
                        ]}
                        width={400}
                        height={300}
                        slotProps={{
                            legend: { hidden: true },
                        }}
                        className="mx-auto w-min flex-shrink-0 flex-grow-0"
                    />
                </div>
                <div className="gap-medium flex flex-col items-center">
                    {Object.entries(allocations.inner).map(([actorName, { label, value }]) => {
                        const { textColor, bgColor, borderColor } = ALLOCATIONS[actorName]

                        return (
                            <div
                                key={actorName}
                                className={cn(
                                    'gap-normal flex items-center justify-start',
                                    textColor
                                )}
                            >
                                <div className="gap-normal flex w-[150px] items-center md:w-[170px]">
                                    <div
                                        className={cn(
                                            'h-3 w-3 rounded-full md:h-4 md:w-4',
                                            bgColor,
                                            textColor
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{label}</span>
                                        <span className="font-normal">
                                            {value.toLocaleString('en')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-tiny flex w-[200px] md:w-[260px]">
                                    <div
                                        className={cn(
                                            'w-2 border-y-[1.5px] border-l-[1.5px] md:w-3 md:border-y-2 md:border-l-2',
                                            borderColor
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        {allocations.outer[actorName].map(
                                            ({ label, value }, index) => (
                                                <div
                                                    key={index}
                                                    className={cn(
                                                        'flex',
                                                        [
                                                            'opacity-100',
                                                            'opacity-50',
                                                            'text-gray-600 opacity-30',
                                                        ][index]
                                                    )}
                                                >
                                                    <span className="w-[70px] font-semibold md:w-[90px]">
                                                        {label.split(' ')[1]}
                                                    </span>
                                                    <span className="font-normal">
                                                        {value.toLocaleString('en')}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <Divider
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
                className="my-medium mx-auto w-4/5"
            />
            <div className="!text-small gap-medium relative flex flex-col items-center justify-center lg:flex-col xl:flex-row">
                <div className="relative w-[300px]">
                    <PieChart
                        series={[
                            {
                                innerRadius: 0,
                                outerRadius: 80,
                                data: Object.values(distributions.inner),
                            },
                            {
                                innerRadius: 100,
                                outerRadius: 120,
                                data: Object.values(distributions.outer).flat(),
                            },
                        ]}
                        width={400}
                        height={300}
                        slotProps={{
                            legend: { hidden: true },
                        }}
                        className="mx-auto w-min flex-shrink-0 flex-grow-0"
                    />
                </div>
                <div className="gap-medium flex flex-col items-center">
                    {Object.entries(distributions.inner).map(([actorName, { label, value }]) => {
                        const { textColor, bgColor, borderColor } = DISTRIBUTIONS[actorName]

                        return (
                            <div
                                key={actorName}
                                className={cn(
                                    'gap-normal flex items-center justify-start',
                                    textColor
                                )}
                            >
                                <div className="gap-normal flex w-[150px] items-center md:w-[170px]">
                                    <div
                                        className={cn(
                                            'h-3 w-3 rounded-full md:h-4 md:w-4',
                                            bgColor,
                                            textColor
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{label}</span>
                                        <span className="font-normal">
                                            {value.toLocaleString('en')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-tiny flex w-[200px] md:w-[260px]">
                                    <div
                                        className={cn(
                                            'w-2 border-y-[1.5px] border-l-[1.5px] md:w-3 md:border-y-2 md:border-l-2',
                                            borderColor
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        {distributions.outer[actorName].map(
                                            ({ label, value }, index) => (
                                                <div
                                                    key={index}
                                                    className={cn(
                                                        'flex',
                                                        ['opacity-50', 'text-gray-600 opacity-30'][
                                                            index
                                                        ]
                                                    )}
                                                >
                                                    <span className="w-[70px] font-semibold md:w-[90px]">
                                                        {label.split(' ')[1]}
                                                    </span>
                                                    <span className="font-normal">
                                                        {value.toLocaleString('en')}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default AssetsPage
