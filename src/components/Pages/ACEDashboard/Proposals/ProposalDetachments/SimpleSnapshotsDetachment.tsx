import Link from '@components/Shared/Link'
import siteMetadata from '@data/siteMetadata.json'
import { ActorStatus } from '@hooks/useStatus'
import cn from '@libs/class'
import { formatDateTime } from '@libs/date'
import { build, buildIcDashboard } from '@libs/url'
import { UnwrapVariant } from 'shared/utils/typings'

const SimpleSnapshotsDetachment = ({ snapshots }: { snapshots: ActorStatus['Snapshots'][1] }) => {
    return (
        <div className="w-full overflow-x-auto rounded-lg border border-cold-200 md:overflow-hidden">
            <table className="min-w-full border-collapse">
                <thead className="bg-cold-50">
                    <tr>
                        {['Snapshot', 'Name', 'Value'].map((title, i) => (
                            <th
                                key={i}
                                scope="col"
                                className={cn(
                                    'text-small px-normal py-small select-none text-nowrap bg-cold-100',
                                    'border-b border-r border-cold-200',
                                    i === 0 && 'border-l-0',
                                    i === 2 && 'border-r-0'
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
                    {snapshots.map((snap, snapIndex) => {
                        const isLastSnapshot = snapIndex === snapshots.length - 1
                        return Object.entries(snap).map(([key, [, value]], rowIndex) => {
                            const isLastRowOfGroup =
                                isLastSnapshot && rowIndex === Object.keys(snap).length - 1

                            if (key === 'From') return null

                            return (
                                <tr
                                    key={`${snapIndex}-${rowIndex}`}
                                    className="group cursor-pointer hover:bg-cold-50"
                                >
                                    {rowIndex === 0 && (
                                        <td
                                            rowSpan={Object.keys(snap).length - 1}
                                            className={cn(
                                                '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                                'border-b border-r border-cold-200',
                                                isLastSnapshot && 'border-b-0',
                                                'text-center'
                                            )}
                                        >
                                            <code>{snapIndex + 1}</code>
                                        </td>
                                    )}
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                            'border-b border-r border-cold-200',
                                            isLastRowOfGroup && 'border-b-0'
                                        )}
                                    >
                                        <code>{key}</code>
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                            'border-b border-cold-200',
                                            isLastRowOfGroup && 'border-b-0'
                                        )}
                                    >
                                        <code>
                                            {{
                                                'Snapshot size': `${((value as number) / 1048576).toLocaleString('en', { maximumFractionDigits: 4 })} MB`,
                                                'Taken date': formatDateTime({
                                                    nano: BigInt(snap['Taken date'][1]),
                                                }),
                                                ID:
                                                    'Arbitrary' in snap.From[1] ? (
                                                        <code>{value as string}</code>
                                                    ) : (
                                                        <code className="inline-flex">
                                                            {value as string} (
                                                            {UnwrapVariant(
                                                                snap.From[1]
                                                            )![0].replace('Proposal', '')}
                                                            &nbsp;
                                                            <Link
                                                                openInNewTab
                                                                href={build(
                                                                    [
                                                                        'dashboard',
                                                                        'proposals',
                                                                        UnwrapVariant(
                                                                            snap.From[1]
                                                                        )![1],
                                                                    ],
                                                                    {},
                                                                    true
                                                                )}
                                                                color="cold-600"
                                                                className="pre-underline !text-tiny group z-10 w-full justify-start font-semibold decoration-cold-600/50 hover:decoration-cold-600/100"
                                                                icon="forward"
                                                                size="small"
                                                            >
                                                                <code>
                                                                    Proposal #
                                                                    {
                                                                        UnwrapVariant(
                                                                            snap.From[1]
                                                                        )![1] as unknown as string
                                                                    }
                                                                </code>
                                                            </Link>
                                                            )
                                                        </code>
                                                    ),
                                            }?.[key] ?? String(value)}
                                        </code>
                                    </td>
                                </tr>
                            )
                        })
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default SimpleSnapshotsDetachment
