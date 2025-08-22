import { PieChart } from '@mui/x-charts/PieChart'

import DelegatedIcon from '@components/Assets/delegated.svg'
import VoteFalseIcon from '@components/Assets/vote_false.svg'
import VoteNeutralIcon from '@components/Assets/vote_neutral.svg'
import VoteTrueIcon from '@components/Assets/vote_true.svg'
import useVoteColors, { VoteColors } from '@hooks/useVoteColors'

const VoteColorsDemo = ({ colors: overrideColors }: { colors?: VoteColors }) => {
    const { colors } = useVoteColors()
    const demoColors = overrideColors || colors

    const voteData = [
        { label: 'Positive', value: 40, color: demoColors.positive },
        { label: 'Neutral', value: 30, color: demoColors.neutral },
        { label: 'Negative', value: 20, color: demoColors.negative },
        { label: 'Delegated', value: 10, color: demoColors.delegated },
    ]

    const someVote = true

    return (
        <div className="flex flex-col gap-2 rounded-lg">
            <h3 className="text-sm font-medium text-cold-700">Preview:</h3>

            <div className="text-tiny grid grid-cols-10 gap-1 font-normal text-white">
                <button
                    className="py-normal text-tiny gap-small pointer-events-none col-span-2 flex w-full transform select-none items-center justify-center rounded-lg text-white transition-all duration-300 ease-in-out hover:bg-opacity-80 disabled:bg-opacity-50"
                    style={{ backgroundColor: demoColors.positive }}
                >
                    <div className="gap-small flex items-center">
                        <VoteTrueIcon className="h-5 stroke-[1.5px] md:h-6" />
                        <span className="text-extratiny">TRUE</span>
                    </div>
                </button>

                <button
                    className="py-normal text-tiny gap-small pointer-events-none col-span-3 flex w-full transform select-none items-center justify-center rounded-lg text-white transition-all duration-300 ease-in-out hover:bg-opacity-80 disabled:bg-opacity-50"
                    style={{ backgroundColor: demoColors.neutral }}
                >
                    <div className="gap-small flex items-center">
                        <VoteNeutralIcon className="h-5 stroke-[1.5px] md:h-6" />
                        <span className="text-extratiny">DON'T KNOW</span>
                    </div>
                </button>

                <button
                    className="py-normal text-tiny gap-small pointer-events-none col-span-2 flex w-full transform select-none items-center justify-center rounded-lg text-white transition-all duration-300 ease-in-out hover:bg-opacity-80 disabled:bg-opacity-50"
                    style={{ backgroundColor: demoColors.negative }}
                >
                    <div className="gap-small flex items-center">
                        <VoteFalseIcon className="h-5 stroke-[1.5px] md:h-6" />
                        <span className="text-extratiny">FALSE</span>
                    </div>
                </button>
                <button
                    className="py-normal text-tiny gap-small pointer-events-none col-span-3 flex w-full transform select-none items-center justify-center rounded-lg text-white transition-all duration-300 ease-in-out hover:bg-opacity-80 disabled:bg-opacity-50"
                    style={{ backgroundColor: demoColors.delegated }}
                >
                    <div className="gap-small flex items-center">
                        <DelegatedIcon className="h-5 stroke-[1.5px] md:h-6" />
                        <span className="text-extratiny">DELEGATE</span>
                    </div>
                </button>
            </div>

            {someVote && (
                <div className="gap-medium flex h-[85px] place-items-center items-center justify-between overflow-hidden md:h-[90px]">
                    <PieChart
                        series={[{ data: voteData, innerRadius: 34, outerRadius: 40 }]}
                        width={175}
                        height={125}
                        slotProps={{ legend: { hidden: true } }}
                        className="translate-x-20 md:translate-x-52"
                    />
                    <div className="flex w-1/2 flex-col">
                        <div className="text-tiny gap-tiny grid grid-rows-4 text-nowrap font-normal">
                            {voteData.map(({ label, value, color }, index) => (
                                <div
                                    key={index}
                                    className="gap-tiny ml-0 flex h-4 items-center md:ml-20"
                                >
                                    <div
                                        className="mr-tiny h-2.5 w-5 rounded-full md:h-3"
                                        style={{ backgroundColor: color }}
                                    />
                                    <p className="text-cold-700">
                                        {label}: {value}%
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VoteColorsDemo
