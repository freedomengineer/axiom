import { useMemo } from 'react'

const DateInput = ({ value, onChange }: { value: any; onChange: (newValue: any) => void }) => {
    const dateValue = useMemo(() => {
        if (!value?.Date) return ''
        return new Date(Number(value.Date) / 1_000_000).toISOString().split('T')[0]
    }, [value])

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value
        if (!dateString) return
        const date = new Date(dateString)
        const nanoseconds = BigInt(date.getTime() * 1_000_000)
        onChange({ Date: nanoseconds })
    }

    return (
        <input type="date" value={dateValue} onChange={handleDateChange} className="input w-full" />
    )
}

export default DateInput
