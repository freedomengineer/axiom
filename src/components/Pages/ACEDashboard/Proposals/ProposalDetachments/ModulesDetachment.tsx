import { useEffect, useState } from 'react'

import Link from '@components/Shared/Link'
import { ActorStatus, getStatus } from '@hooks/useStatus'
import cn from '@libs/class'
import { DDAO } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

const ModulesDetachment = ({
    commitments,
    showOldValue,
    onClick,
}: {
    commitments: DDAO.SharableCommitment[]
    showOldValue?: boolean
    onClick?: (actorVariant: string) => void
}) => {
    const [actorsModuleHash, setActorsModuleHash] = useState<Record<string, ActorStatus>>({})
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!showOldValue) return setLoading(false)

        Promise.all(
            commitments.map(({ actorVariant }) =>
                getStatus(UnwrapVariant(actorVariant)).then((status) =>
                    setActorsModuleHash(
                        (prev) =>
                            ({
                                ...prev,
                                [UnwrapVariant(actorVariant)]: status,
                            }) as Record<string, ActorStatus>
                    )
                )
            )
        ).finally(() => setLoading(false))
    }, [commitments])

    if (commitments.length === 0) return null

    return (
        <div className="overflow-x-auto rounded-lg border border-cold-300 md:overflow-hidden">
            <table className="min-w-full border-collapse">
                <thead className="bg-cold-50">
                    <tr>
                        {(showOldValue
                            ? ['Actor', 'Args', 'Old Module Hash', 'New Module Hash']
                            : ['Actor', 'Args', 'New Module Hash']
                        ).map((title, i) => (
                            <th
                                key={i}
                                scope="col"
                                className={cn(
                                    'text-small px-normal py-small select-none text-nowrap bg-cold-100',
                                    'border-b border-r border-cold-300',
                                    i === 0 && 'border-l-0',
                                    (showOldValue ? i === 3 : i === 2) && 'border-r-0'
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
                    {(!loading || !showOldValue) &&
                        commitments.map(({ actorVariant, args, moduleHash }, i) => {
                            const isLastRow = i === commitments.length - 1
                            const actorName = UnwrapVariant(actorVariant)

                            return (
                                <tr
                                    key={i}
                                    className="group cursor-pointer hover:bg-cold-50 aria-disabled:cursor-auto"
                                    aria-disabled={!onClick}
                                    onClick={() => onClick?.(actorName)}
                                >
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                            'border-b border-r border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        <Link
                                            href={`/dashboard?actor=${actorName}`}
                                            color="cold-600"
                                            className="pre-underline !text-tiny group z-10 w-full justify-start decoration-cold-600/50 hover:decoration-cold-600/100"
                                            icon="forward"
                                            size="small"
                                            openInNewTab
                                        >
                                            {actorName}
                                        </Link>
                                    </td>
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                            'border-b border-r border-cold-300',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        {args.length === 0 ? 'No args' : args.join('')}
                                    </td>
                                    {showOldValue && (
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal text-nowrap font-semibold text-red-600',
                                                'border-b border-r border-cold-300',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            <code>
                                                {actorName in actorsModuleHash
                                                    ? actorsModuleHash[actorName]['Module hash'][1]
                                                    : 'No value'}
                                            </code>
                                        </td>
                                    )}
                                    <td
                                        className={cn(
                                            '!text-tiny py-small px-normal text-nowrap font-semibold',
                                            'border-b border-cold-300',
                                            showOldValue ? 'text-green-600' : 'text-cold-600',
                                            isLastRow && 'border-b-0'
                                        )}
                                    >
                                        <code>{moduleHash}</code>
                                    </td>
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        </div>
    )
}

export default ModulesDetachment
