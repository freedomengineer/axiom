import ClipboardIcon from '@components/Assets/clipboard.svg'
import Username, { PACKAGES } from '@components/Shared/Username'
import { DAffiliate } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { UnwrapVariant } from 'shared/utils/typings'

const PrivateCouponCard = ({ item }: { item: DAffiliate.PrivateSharableCoupon }) => {
    return (
        <div className="px-medium py-normal gap-normal flex flex-col rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-normal gap-small flex items-center font-medium">
                    ID:{' '}
                    <button
                        className="px-normal py-small rounded-lg bg-cold-800/0 hover:bg-cold-800/10"
                        onClick={() => {
                            navigator.clipboard.writeText(item.key)
                        }}
                    >
                        {item.key}
                    </button>
                </p>
                <p className="text-normal gap-small flex items-center font-medium">
                    {PACKAGES?.[item.capitalRaised.toString() as keyof typeof PACKAGES] ??
                        'Unknown'}{' '}
                    ({e8s.toString(item.capitalRaised)})
                </p>
            </div>
            <p>
                Status:{' '}
                {(() => {
                    const status = UnwrapVariant(item.status)
                    if (Array.isArray(status))
                        return (
                            <>
                                {status[0]}
                                by
                                <Username
                                    principal={status[1].by}
                                    symbol
                                    symbolClassName="stroke-[3px]"
                                    linkClassName="pre-underline group z-10 w-full justify-start text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100"
                                />
                            </>
                        )
                })()}
            </p>
            <div className="flex items-center justify-between">
                <p className="text-normal gap-small flex items-center font-medium">
                    {Array.from(item.code, (b) => b.toString(16).padStart(2, '0'))
                        .join('')
                        .match(/.{1,4}/g)!
                        .join('-')}
                </p>
            </div>
        </div>
    )
}

export default PrivateCouponCard
