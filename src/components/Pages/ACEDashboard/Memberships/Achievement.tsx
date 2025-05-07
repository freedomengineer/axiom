import ForwardIcon from '@components/Assets/forward.svg'
import { ParsedAchievementPackage } from '@hooks/usePackages'
import { DSales } from 'shared/types/services'
import e8s from 'shared/utils/e8s'

const Achievement = ({
    item,
    setSelected,
}: {
    item: ParsedAchievementPackage<UnwrapDVariant<DSales.Achievement>>
    setSelected: () => void
}) => {
    return (
        <div className="px-semilarge py-medium gap-medium flex w-full max-w-[300px] flex-1 flex-col rounded-lg border border-cold-800/50 bg-white shadow-sm hover:border-cold-800/100">
            <img
                src={item.thumbnailUrl}
                alt={item.symbol}
                className="w-full rounded-lg object-cover"
            />
            <div className="gap-medium text-tiny flex justify-center text-nowrap font-medium text-white">
                <p className="px-medium py-small rounded-full bg-cold-700">
                    {item.achievementType}
                </p>
                <p className="px-medium py-small rounded-full bg-gradient-to-r from-primary-700 to-cold-700">
                    {
                        {
                            Referral: <>{item.qualifyingThreshold} REFERRALS</>,
                            OctupleBurial: (
                                <>{e8s.toString(item.qualifyingThreshold as bigint)} ACORN</>
                            ),
                        }[item.achievementType]
                    }
                </p>
            </div>
            <button
                className="gap-normal text-tiny flex justify-center text-nowrap text-center font-normal text-cold-800 hover:text-cold-800/50"
                onClick={() => setSelected()}
            >
                <ForwardIcon className="h-4 w-4 md:h-5 md:w-5" />
                View details
            </button>
        </div>
    )
}

export default Achievement
