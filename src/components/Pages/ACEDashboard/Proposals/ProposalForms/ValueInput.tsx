import Select from '@components/Primitives/Select'
import { CONFIGURABLE_ACTORS } from '@utils/indicator/configs'
import { DDAO } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

import DateInput from './DateInput'
import RangeInput from './RangeInput'

const ValueInput = ({
    value,
    setValue,
    selectedActor,
    isLoading,
}: {
    value: DDAO.SharableValue | null
    setValue: (value: DDAO.SharableValue) => void
    selectedActor: (typeof CONFIGURABLE_ACTORS)[number] | null
    isLoading: boolean
}) => {
    const type = UnwrapVariant(value)?.[0]
    switch (type) {
        case 'Bool':
            return (
                <Select
                    onChange={(val) => setValue(val === 'true' ? { Bool: true } : { Bool: false })}
                    value={'Bool' in value! ? value.Bool?.toString() : ''}
                    options={[{ label: 'true' }, { label: 'false' }]}
                    placeholder="Select Boolean"
                    disabled={!selectedActor || isLoading}
                    className="w-full"
                />
            )
        case 'Proportion':
            return (
                <div className="gap-tiny flex w-full">
                    <input
                        type="number"
                        value={'Proportion' in value! ? value.Proportion[0]?.toString() : ''}
                        onChange={(e) => {
                            try {
                                const proportion = [
                                    ...('Proportion' in value! ? value.Proportion : []),
                                ]
                                proportion[0] = BigInt(e.target.value || '0')
                                setValue({ Proportion: proportion as [bigint, bigint] })
                            } catch (e) {}
                        }}
                        placeholder="Numerator"
                        disabled={!selectedActor || isLoading}
                        aria-selected={!!UnwrapVariant(value)?.[1]?.[0]}
                        className="input w-full"
                    />
                    <input
                        type="number"
                        value={'Proportion' in value! ? value.Proportion[1]?.toString() : ''}
                        onChange={(e) => {
                            try {
                                const proportion = [
                                    ...('Proportion' in value! ? value.Proportion : []),
                                ]
                                proportion[1] = BigInt(e.target.value || '0')
                                setValue({ Proportion: proportion as [bigint, bigint] })
                            } catch (e) {}
                        }}
                        placeholder="Denominator"
                        disabled={!selectedActor || isLoading}
                        aria-selected={!!UnwrapVariant(value)?.[1]?.[1]}
                        className="input w-full"
                    />
                </div>
            )
        case 'RangeInt':
        case 'RangeNat':
        case 'RangeFloat':
            return (
                <div className="w-full">
                    <RangeInput
                        type={type}
                        value={value}
                        onChange={(newValue) => setValue(newValue)}
                    />
                </div>
            )
        case 'Date':
            return <DateInput value={value} onChange={(newValue) => setValue(newValue)} />
        case 'Nat':
        case 'E8S':
        case 'Duration':
            return (
                <input
                    type="number"
                    value={value![type]?.toString() || ''}
                    onChange={(e) => {
                        try {
                            setValue({
                                [type]: BigInt(e.target.value || '0'),
                            } as DDAO.SharableValue)
                        } catch (e) {}
                    }}
                    placeholder={`Enter ${type} value`}
                    disabled={!selectedActor || isLoading}
                    className="input w-full"
                    aria-selected={!!value?.[type]}
                />
            )
        case 'Float':
            return (
                <input
                    type="number"
                    step="0.01"
                    value={'Float' in value! ? value.Float?.toString() : ''}
                    onChange={(e) => setValue({ Float: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter float value"
                    disabled={!selectedActor || isLoading}
                    className="input w-full"
                    aria-selected={!!UnwrapVariant(value)?.[1]}
                />
            )
        case 'Text':
            return (
                <input
                    type="text"
                    value={'Text' in value! ? value.Text : ''}
                    onChange={(e) => setValue({ Text: e.target.value })}
                    placeholder="Enter text value"
                    disabled={!selectedActor || isLoading}
                    className="input w-full"
                    aria-selected={!!UnwrapVariant(value)?.[1]}
                />
            )
        default:
            return (
                <input
                    type="text"
                    disabled={true}
                    value=""
                    placeholder="Enter a Value"
                    className="input w-full"
                />
            )
    }
}

export default ValueInput
