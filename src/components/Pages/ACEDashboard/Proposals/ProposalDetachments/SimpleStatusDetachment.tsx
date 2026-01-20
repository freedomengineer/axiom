import Link from '@components/Shared/Link'
import siteMetadata from '@data/siteMetadata.json'
import { ActorStatus } from '@hooks/useStatus'
import cn from '@libs/class'
import { buildIcDashboard } from '@libs/url'

const SimpleStatusDetachment = ({ actorStatus }: { actorStatus: ActorStatus }) => {
    return (
        <div className="w-full overflow-x-auto rounded-lg border border-cold-200 md:overflow-hidden">
            <table className="min-w-full border-collapse">
                <thead className="bg-cold-50">
                    <tr>
                        {['Name', 'Value'].map((title, i) => (
                            <th
                                key={i}
                                scope="col"
                                className={cn(
                                    'text-small px-normal py-small select-none text-nowrap bg-cold-100',
                                    'border-b border-r border-cold-200',
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
                    {Object.entries(actorStatus).map(([key, [, value]], i) => {
                        const isLastRow = i === Object.keys(actorStatus).length - 2

                        if (key.includes('Snapshot')) return null

                        return (
                            <tr key={i} className="group cursor-pointer hover:bg-cold-50">
                                <td
                                    className={cn(
                                        '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                        'border-b border-r border-cold-200',
                                        isLastRow && 'border-b-0'
                                    )}
                                >
                                    <code>{key}</code>
                                </td>
                                <td
                                    className={cn(
                                        '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                        'border-b border-cold-200',
                                        isLastRow && 'border-b-0'
                                    )}
                                >
                                    <code>
                                        {{
                                            'Memory size': `${((value as number) / 1048576).toLocaleString('en', { maximumFractionDigits: 4 })} MB`,
                                            Cycles: `${(value as number).toLocaleString('en')} (${Number((value as number) / 1e12).toLocaleString('en', { maximumFractionDigits: 2 })}T)`,
                                            Principal: (
                                                <Link
                                                    openInNewTab
                                                    href={buildIcDashboard(value as string)}
                                                    color="cold-600"
                                                    className="pre-underline !text-tiny group z-10 w-full justify-start font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                                    icon="forward"
                                                    size="small"
                                                >
                                                    <code>{value as string}</code>
                                                </Link>
                                            ),
                                            'Commit hash': (
                                                <Link
                                                    openInNewTab
                                                    href={`${siteMetadata.siteRepo}/commit/${value as string}`}
                                                    color="cold-600"
                                                    className="pre-underline !text-tiny group z-10 w-full justify-start font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                                    icon="forward"
                                                    size="small"
                                                >
                                                    <code>{value as string}</code>
                                                </Link>
                                            ),
                                        }?.[key] ?? String(value)}
                                    </code>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default SimpleStatusDetachment
