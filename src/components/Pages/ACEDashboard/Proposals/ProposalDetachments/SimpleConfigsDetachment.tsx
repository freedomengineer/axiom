import cn from '@libs/class'
import { formatConfigValue } from '@libs/formatter'
import { DDAO } from 'shared/types/services'

const SimpleConfigsDetachment = ({
    actorConfigs,
}: {
    actorConfigs: Record<string, UnwrapDVariant<DDAO.SharableValue>>
}) => {
    return (
        <div className="w-full overflow-x-auto rounded-lg border border-cold-300 md:overflow-hidden">
            <table className="min-w-full border-collapse">
                <thead className="bg-cold-50">
                    <tr>
                        {['Variable Name', 'Type', 'Value'].map((title, i) => (
                            <th
                                key={i}
                                scope="col"
                                className={cn(
                                    'text-small px-normal py-small select-none text-nowrap bg-cold-100',
                                    'border-b border-r border-cold-300',
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
                    {Object.entries(actorConfigs).map(([key, config], i) => {
                        const isLastRow = i === Object.keys(actorConfigs).length - 1

                        return (
                            <tr key={i} className="group cursor-pointer hover:bg-cold-50">
                                <td
                                    className={cn(
                                        '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                                        'border-b border-r border-cold-300',
                                        isLastRow && 'border-b-0'
                                    )}
                                >
                                    <code>{key}</code>
                                </td>
                                <td
                                    className={cn(
                                        '!text-tiny py-small px-normal text-nowrap text-cold-600',
                                        'border-b border-r border-cold-300',
                                        isLastRow && 'border-b-0'
                                    )}
                                >
                                    <code>{config[0]}</code>
                                </td>
                                <td
                                    className={cn(
                                        '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                                        'border-b border-cold-300',
                                        isLastRow && 'border-b-0'
                                    )}
                                >
                                    <code>{formatConfigValue(config)}</code>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default SimpleConfigsDetachment
