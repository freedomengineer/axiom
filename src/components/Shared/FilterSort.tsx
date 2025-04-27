import { useState } from 'react'

import ArrowsDown from '@components/Assets/arrows_down.svg'
import ArrowsUp from '@components/Assets/arrows_up.svg'
import ArrowsUpDown from '@components/Assets/arrows_up_down.svg'
import CloseIcon from '@components/Assets/close.svg'
import PlusIcon from '@components/Assets/plus.svg'
import useAuth from '@hooks/useAuth'
import { FilterSortContext } from '@hooks/useFilterSort'
import { FILTER_SORT_DECS, QueryName } from 'shared/default/filter_sort'
import { Primitive } from 'shared/utils/typings'

const FilterSort = <T extends QueryName>({
    name,
    filter,
    sort,
    setFilter,
    setSort,
    disableFilter = false,
}: FilterSortContext<T> & { disableFilter?: boolean }) => {
    const { principal } = useAuth()

    const [open, setOpen] = useState<'filter' | 'by' | 'order' | null>(null)
    const [filterSelected, setFilterSelected] = useState<FilterSortContext<T>['filter']>(filter)

    const handleFilterChange = (key: string, value: string) => {
        setFilterSelected((prev) => {
            if (value) return { ...prev, [key]: value }
            const { [key]: _, ...updated } = prev
            return updated
        })
    }
    const handleSortChange = (key: string, value: string) => {
        setSort({ ...sort, [key]: value })
        setOpen(null)
    }
    const removeFilter = (key: string) => {
        const { [key]: _, ...updated } = filter
        setFilterSelected(updated)
        setFilter(updated)
    }

    return (
        <div className="text-tiny z-40 w-full font-light text-cold-800">
            <div className="mb-medium gap-small flex flex-col justify-between md:flex-row">
                <div
                    className="gap-small relative flex flex-wrap aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    aria-disabled={disableFilter}
                >
                    {Object.entries(filterSelected).map(([key, value]: any) => (
                        <button
                            key={key}
                            onClick={() => removeFilter(key)}
                            className="text-small px-normal py-tiny flex items-center rounded-lg border border-cold-600 font-light hover:bg-cold-100"
                        >
                            <span>{key}</span>
                            <hr className="mx-tiny h-full w-[1px] bg-cold-600" />
                            <span className="font-normal">
                                {value === principal?.toText() ? 'Me' : value}
                            </span>
                        </button>
                    ))}
                    <button
                        className="text-small px-normal py-tiny flex items-center rounded-lg border border-cold-600 font-light hover:bg-cold-100"
                        onClick={() => setOpen(open === 'filter' ? null : 'filter')}
                    >
                        {open === 'filter' ? (
                            <CloseIcon className="mr-small h-4 w-3.5" />
                        ) : (
                            <PlusIcon className="mr-small h-4 w-4" />
                        )}
                        <span>{open === 'filter' ? 'Close' : 'Filter'}</span>
                    </button>
                    {open === 'filter' && (
                        <div className="gap-small p-medium absolute left-0 top-8 z-10 flex w-fit flex-col rounded border bg-white md:top-10">
                            {Object.entries(FILTER_SORT_DECS[name].filter).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="gap-small grid w-full grid-cols-3 items-center md:w-[420px]"
                                >
                                    <label className="px-normal py-tiny text-left">{key}</label>
                                    {value === Primitive.Principal ? (
                                        <div className="gap-normal col-span-2 flex w-full items-center">
                                            <input
                                                type="text"
                                                className="py-small px-medium w-full rounded-md border border-cold-600/50 ring-0 focus:outline-none focus:ring-2 focus:ring-cold-600"
                                                value={filterSelected[key] || ''}
                                                onChange={(e) =>
                                                    handleFilterChange(key, e.target.value)
                                                }
                                            />
                                            <label className="gap-extratiny flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="accent-cold-800"
                                                    onChange={(e) =>
                                                        handleFilterChange(
                                                            key,
                                                            e.target.checked
                                                                ? principal!.toText()
                                                                : ''
                                                        )
                                                    }
                                                    checked={
                                                        filterSelected[key] === principal!.toText()
                                                    }
                                                />
                                                <span>Me</span>
                                            </label>
                                        </div>
                                    ) : value instanceof Array ? (
                                        <div className="gap-normal col-span-2 flex flex-wrap">
                                            {value.map((variant: string) => (
                                                <label
                                                    key={variant}
                                                    className="gap-small flex items-center"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={key}
                                                        value={variant}
                                                        checked={filterSelected[key] === variant}
                                                        onChange={() =>
                                                            handleFilterChange(key, variant)
                                                        }
                                                    />
                                                    <span>{variant}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            className="py-small px-medium col-span-2 w-full rounded-md border border-cold-600/50 ring-0 focus:outline-none focus:ring-2 focus:ring-cold-600"
                                            value={filterSelected[key] || ''}
                                            onChange={(e) =>
                                                handleFilterChange(key, e.target.value)
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                            <button
                                className="py-small px-medium mx-auto mt-4 flex w-min items-center text-nowrap rounded border border-cold-600 hover:bg-cold-100"
                                onClick={() => (setFilter(filterSelected), setOpen(null))}
                            >
                                Apply changes
                            </button>
                        </div>
                    )}
                </div>
                <div className="gap-small flex">
                    <div className="gap-small relative flex">
                        <button
                            className="text-small px-normal py-tiny flex items-center rounded-lg border border-cold-600 hover:bg-cold-100"
                            onClick={() => setOpen(open === 'by' ? null : 'by')}
                        >
                            <ArrowsUpDown className="mr-small h-4 w-4" />
                            <span>{sort.by}</span>
                        </button>
                        {open === 'by' && (
                            <div className="px-medium py-small top-large absolute left-0 right-auto top-8 z-10 w-[200px] rounded border bg-white md:left-auto md:right-0 md:top-10">
                                {FILTER_SORT_DECS[name].sort.by.map((variant) => (
                                    <button
                                        key={variant}
                                        className="text-small px-normal py-tiny w-full rounded-lg text-left hover:bg-cold-100"
                                        onClick={() => handleSortChange('by', variant)}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="gap-small relative flex">
                        <button
                            className="text-small px-normal py-tiny flex items-center rounded-lg border border-cold-600 hover:bg-cold-100"
                            onClick={() => setOpen(open === 'order' ? null : 'order')}
                        >
                            {sort.order === 'ascending' ? (
                                <ArrowsUp className="mr-small h-4 w-4" />
                            ) : (
                                <ArrowsDown className="mr-small h-4 w-4" />
                            )}
                            <span>{sort.order}</span>
                        </button>
                        {open === 'order' && (
                            <div className="px-medium py-small top-large absolute left-0 right-auto top-8 z-10 w-[200px] rounded border bg-white md:left-auto md:right-0 md:top-10">
                                {FILTER_SORT_DECS[name].sort.order.map((variant) => (
                                    <button
                                        key={variant}
                                        className="text-small px-normal py-tiny w-full rounded-lg text-left hover:bg-cold-100"
                                        onClick={() => handleSortChange('order', variant)}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilterSort
