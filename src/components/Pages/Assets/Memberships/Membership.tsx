import ForwardIcon from '@components/Assets/forward.svg'
import { ParsedMembershipPackage } from '@hooks/usePackages'
import e8s from 'shared/utils/e8s'

const Membership = ({
    item,
    setSelected,
}: {
    item: ParsedMembershipPackage
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
                    ${e8s.toString(item.adjustedPrice[0])}
                </p>
                <p className="px-medium py-small rounded-full bg-gradient-to-r from-primary-700 to-cold-700">
                    {e8s.toString(e8s.add(item.acornBuried[0], item.acornLiquid[0]))} ACORN
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

export default Membership
