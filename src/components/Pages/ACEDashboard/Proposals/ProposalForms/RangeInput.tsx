import { useCallback, useEffect, useRef, useState } from 'react'

import Select from '@components/Primitives/Select'

const RangeInput = ({
    type,
    value,
    onChange,
}: {
    type: 'RangeInt' | 'RangeNat' | 'RangeFloat'
    value: any
    onChange: (newValue: any) => void
}) => {
    const isInitialized = useRef(false)
    const lastUpdateRef = useRef({
        lowerBoundType: '',
        upperBoundType: '',
        lowerValue: '',
        upperValue: '',
    })

    const [lowerBoundType, setLowerBoundType] = useState<'infinity' | 'inclusive' | 'exclusive'>(
        'infinity' in value[type][0]
            ? 'infinity'
            : 'value' in value[type][0] && 'inclusive' in value[type][0].value
              ? 'inclusive'
              : 'exclusive'
    )
    const [upperBoundType, setUpperBoundType] = useState<'infinity' | 'inclusive' | 'exclusive'>(
        'infinity' in value[type][1]
            ? 'infinity'
            : 'value' in value[type][1] && 'inclusive' in value[type][1].value
              ? 'inclusive'
              : 'exclusive'
    )
    const [lowerValue, setLowerValue] = useState(
        lowerBoundType !== 'infinity' && 'value' in value[type][0]
            ? lowerBoundType === 'inclusive'
                ? value[type][0].value.inclusive
                : value[type][0].value.exclusive
            : 0
    )
    const [upperValue, setUpperValue] = useState(
        upperBoundType !== 'infinity' && 'value' in value[type][1]
            ? upperBoundType === 'inclusive'
                ? value[type][1].value.inclusive
                : value[type][1].value.exclusive
            : 0
    )

    const updateRange = useCallback(() => {
        const currentState = {
            lowerBoundType,
            upperBoundType,
            lowerValue: lowerValue.toString(),
            upperValue: upperValue.toString(),
        }
        if (
            lastUpdateRef.current.lowerBoundType === lowerBoundType &&
            lastUpdateRef.current.upperBoundType === upperBoundType &&
            lastUpdateRef.current.lowerValue === lowerValue.toString() &&
            lastUpdateRef.current.upperValue === upperValue.toString()
        ) {
            return
        }

        lastUpdateRef.current = currentState

        const lower =
            lowerBoundType === 'infinity'
                ? { infinity: null }
                : {
                      value: {
                          [lowerBoundType]:
                              type === 'RangeFloat' ? parseFloat(lowerValue) : parseInt(lowerValue),
                      },
                  }
        const upper =
            upperBoundType === 'infinity'
                ? { infinity: null }
                : {
                      value: {
                          [upperBoundType]:
                              type === 'RangeFloat' ? parseFloat(upperValue) : parseInt(upperValue),
                      },
                  }
        onChange({ [type]: [lower, upper] })
    }, [lowerBoundType, upperBoundType, lowerValue, upperValue, type, onChange])

    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true
            lastUpdateRef.current = {
                lowerBoundType,
                upperBoundType,
                lowerValue: lowerValue.toString(),
                upperValue: upperValue.toString(),
            }
            updateRange()
        }
    }, [lowerBoundType, upperBoundType, lowerValue, upperValue, updateRange])

    const handleLowerBoundTypeChange = (val: string) => {
        setLowerBoundType(val as 'infinity' | 'inclusive' | 'exclusive')
        setTimeout(updateRange, 0)
    }
    const handleUpperBoundTypeChange = (val: string) => {
        setUpperBoundType(val as 'infinity' | 'inclusive' | 'exclusive')
        setTimeout(updateRange, 0)
    }
    const handleLowerValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLowerValue(e.target.value)
        setTimeout(updateRange, 0)
    }
    const handleUpperValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpperValue(e.target.value)
        setTimeout(updateRange, 0)
    }

    return (
        <div className="gap-small grid grid-cols-2">
            <div className="gap-tiny grid grid-cols-6">
                <Select
                    onChange={handleLowerBoundTypeChange}
                    options={[
                        { label: 'infinity' },
                        { label: 'inclusive' },
                        { label: 'exclusive' },
                    ]}
                    placeholder="Select Lower Bound Type"
                    value={lowerBoundType}
                    className="col-span-3"
                />
                <input
                    type={type === 'RangeFloat' ? 'number' : 'text'}
                    value={lowerValue}
                    onChange={handleLowerValueChange}
                    disabled={lowerBoundType === 'infinity'}
                    className="input col-span-3"
                    step={type === 'RangeFloat' ? '0.01' : '1'}
                />
            </div>
            <div className="gap-tiny grid grid-cols-6">
                <Select
                    onChange={handleUpperBoundTypeChange}
                    options={[
                        { label: 'infinity' },
                        { label: 'inclusive' },
                        { label: 'exclusive' },
                    ]}
                    placeholder="Select Upper Bound Type"
                    value={upperBoundType}
                    className="col-span-3"
                />
                <input
                    type={type === 'RangeFloat' ? 'number' : 'text'}
                    value={upperValue}
                    onChange={handleUpperValueChange}
                    disabled={upperBoundType === 'infinity'}
                    className="input col-span-3"
                    step={type === 'RangeFloat' ? '0.01' : '1'}
                />
            </div>
        </div>
    )
}

export default RangeInput
