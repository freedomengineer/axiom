import Link from '@components/Shared/Link'
import { ParsedMembershipPackage } from '@hooks/usePackages'
import cn from '@libs/class'
import { buildIcDashboard } from '@libs/url'
import e8s from 'shared/utils/e8s'
import proportion from 'shared/utils/proportion'

const MembershipDetails = ({ item }: { item: ParsedMembershipPackage }) => {
    return (
        <table className="min-w-full border-collapse">
            <tbody>
                <tr className="group cursor-pointer hover:bg-cold-50">
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                            'border-b border-r border-cold-300'
                        )}
                    >
                        Name
                    </td>
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                            'border-b border-cold-300'
                        )}
                    >
                        <code>{item.name}</code>
                    </td>
                </tr>
                <tr className="group cursor-pointer hover:bg-cold-50">
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                            'border-b border-r border-cold-300'
                        )}
                    >
                        Symbol
                    </td>
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                            'border-b border-cold-300'
                        )}
                    >
                        <code>{item.symbol}</code>
                    </td>
                </tr>
                <tr className="group cursor-pointer hover:bg-cold-50">
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                            'border-b border-r border-cold-300'
                        )}
                    >
                        Original price
                    </td>
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                            'border-b border-cold-300'
                        )}
                    >
                        <code>${e8s.toString(item.originalPrice)}</code>
                    </td>
                </tr>
                <tr className="group cursor-pointer hover:bg-cold-50">
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                            'border-b border-r border-cold-300'
                        )}
                    >
                        Adjusted price
                    </td>
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                            'border-b border-cold-300'
                        )}
                    >
                        <code>
                            ${e8s.toString(item.adjustedPrice[0])} (
                            {proportion.toString(item.adjustedPrice[1])})
                        </code>
                    </td>
                </tr>
                <tr className="group cursor-pointer hover:bg-cold-50">
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                            'border-b border-r border-cold-300'
                        )}
                    >
                        ACORN buried
                    </td>
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                            'border-b border-cold-300'
                        )}
                    >
                        <code>
                            {e8s.toString(item.acornBuried[0])} ACORN (
                            {proportion.toString(item.acornBuried[1])})
                        </code>
                    </td>
                </tr>
                <tr className="group cursor-pointer hover:bg-cold-50">
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                            'border-b border-r border-cold-300'
                        )}
                    >
                        ACORN liquid
                    </td>
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                            'border-b border-cold-300'
                        )}
                    >
                        <code>
                            {e8s.toString(item.acornLiquid[0])} ACORN (
                            {proportion.toString(item.acornLiquid[1])})
                        </code>
                    </td>
                </tr>
                <tr className="group cursor-pointer hover:bg-cold-50">
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                            'border-b border-r border-cold-300'
                        )}
                    >
                        Canister URL
                    </td>
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                            'border-b border-cold-300'
                        )}
                    >
                        {item.canisterUrl ? (
                            <Link
                                openInNewTab
                                href={buildIcDashboard(item.canisterUrl)}
                                color="cold-600"
                                className="pre-underline !text-tiny group z-10 w-full justify-start font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                icon="forward"
                                size="small"
                            >
                                <code>{item.canisterUrl}</code>
                            </Link>
                        ) : (
                            <code>Not deployed yet</code>
                        )}
                    </td>
                </tr>
                <tr className="group cursor-pointer hover:bg-cold-50">
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                            'border-r border-cold-300'
                        )}
                    >
                        Thumbnail URL
                    </td>
                    <td
                        className={cn(
                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                            'border-cold-300'
                        )}
                    >
                        <Link
                            openInNewTab
                            href={item.thumbnailUrl}
                            color="cold-600"
                            className="pre-underline !text-tiny group z-10 w-full justify-start font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                            icon="forward"
                            size="small"
                        >
                            <code>{item.thumbnailUrl}</code>
                        </Link>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default MembershipDetails
