import { useEffect, useState } from 'react'

import Link from '@components/Shared/Link'
import { getConfigs } from '@hooks/useConfigs'
import cn from '@libs/class'
import { formatConfigValue } from '@libs/formatter'
import { DDAO, DIndicator } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

const ConfigsDetachment = ({
    detachment,
    showOldValue,
    onClick,
}: {
    detachment: DDAO.SharableConfigs__1 | DDAO.SharableCode
    showOldValue?: boolean
    onClick?: (
        actorVariant: UnwrapDVariant<DIndicator.ConfigurableActorVariant>,
        key: string,
        value: DIndicator.SharableValue
    ) => void
}) => {
    const [actorsConfigs, setActorsConfigs] = useState<
        Record<string, Record<string, UnwrapDVariant<DDAO.SharableValue>>>
    >({})
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!showOldValue) return setLoading(false)

        Promise.all(
            detachment.actorsConfigs.map(([actorVariant]) =>
                getConfigs(UnwrapVariant(actorVariant)).then((configs) =>
                    setActorsConfigs(
                        (prev) =>
                            ({
                                ...prev,
                                [UnwrapVariant(actorVariant)]: configs,
                            }) as Record<string, Record<string, UnwrapDVariant<DDAO.SharableValue>>>
                    )
                )
            )
        ).finally(() => setLoading(false))
    }, [detachment])

    if (Object.keys(detachment.actorsConfigs).length === 0) return null

    return (
        <div className="overflow-x-auto rounded-lg border border-cold-300 md:overflow-hidden">
            <table className="min-w-full border-collapse">
                <thead className="bg-cold-50">
                    <tr>
                        {(showOldValue
                            ? ['Actor', 'Variable Name', 'Old Value', 'New Value']
                            : ['Actor', 'Variable Name', 'New Value']
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
                        detachment.actorsConfigs.map(([actorVariant, configs], i) =>
                            configs.map(([key, value], j) => {
                                const isLastRow =
                                    i === detachment.actorsConfigs.length - 1 &&
                                    j === configs.length - 1
                                const actorName = UnwrapVariant(actorVariant)

                                return (
                                    <tr
                                        key={`${i}-${j}`}
                                        className="group cursor-pointer hover:bg-cold-50 aria-disabled:cursor-auto"
                                        aria-disabled={!onClick}
                                        onClick={() => onClick?.(actorName, key, value)}
                                    >
                                        {j === 0 && (
                                            <td
                                                rowSpan={Object.keys(configs).length}
                                                className={cn(
                                                    '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                                    'border-b border-r border-cold-300',
                                                    (j === configs.length - 1 ||
                                                        configs.length === 1) &&
                                                        'border-b-0'
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
                                        )}
                                        <td
                                            className={cn(
                                                '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                                'border-b border-r border-cold-300',
                                                isLastRow && 'border-b-0'
                                            )}
                                        >
                                            <code>{key}</code>
                                        </td>
                                        {showOldValue && (
                                            <td
                                                className={cn(
                                                    '!text-tiny py-small px-normal text-nowrap font-semibold text-red-600',
                                                    'border-b border-r border-cold-300',
                                                    isLastRow && 'border-b-0'
                                                )}
                                            >
                                                {actorsConfigs[actorName]?.[key]
                                                    ? `${formatConfigValue(actorsConfigs[actorName][key])} (${actorsConfigs[actorName][key][0]})`
                                                    : 'No value'}
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
                                            {formatConfigValue(UnwrapVariant(value))} (
                                            {UnwrapVariant(value)[0]})
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                </tbody>
            </table>
        </div>
    )
}

export default ConfigsDetachment
