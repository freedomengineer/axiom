import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
    QueryName,
    StringifiedFilterSort,
    parsePartialFilterFromUrl,
    parsePartialSortFromUrl,
} from 'shared/default/filter_sort'

import { getLocalConfig, setLocalConfig } from './useLocalStorage'

export type FilterSortContext<T extends QueryName> = {
    name: T
    filter: StringifiedFilterSort[T]['filter']
    sort: StringifiedFilterSort[T]['sort']
    setFilter: (filter: StringifiedFilterSort[T]['filter']) => void
    setSort: (sort: StringifiedFilterSort[T]['sort']) => void
}

const useFilterSort = <T extends QueryName>(name: T) => {
    const [searchParams, setSearchParams] = useSearchParams()

    const [filterState, setFilterState] = useState<StringifiedFilterSort[T]['filter']>(() => {
        const paramsFilter = parsePartialFilterFromUrl(name, searchParams)
        if (Object.keys(paramsFilter).length > 0) return paramsFilter
        return getLocalConfig(name).filter
    })
    const [sortState, setSortState] = useState<StringifiedFilterSort[T]['sort']>(() => {
        const paramsSort = parsePartialSortFromUrl(name, searchParams)
        if (Object.keys(paramsSort).length === 2) return paramsSort
        return getLocalConfig(name).sort
    })

    const handleUpdateFilter = useCallback(
        (newFilter: StringifiedFilterSort[T]['filter']) => {
            setFilterState(newFilter)
            setLocalConfig(name, { sort: sortState, filter: newFilter })
        },
        [name, searchParams, setSearchParams, setLocalConfig, getLocalConfig]
    )

    const handleUpdateSort = useCallback(
        (newSort: StringifiedFilterSort[T]['sort']) => {
            setSortState(newSort)
            setLocalConfig(name, { filter: filterState, sort: newSort })
        },
        [name, searchParams, setSearchParams, setLocalConfig, getLocalConfig]
    )

    useEffect(() => {
        const page = searchParams.get('page')
        setSearchParams(
            new URLSearchParams({ ...(page ? { page } : {}), ...filterState, ...sortState }),
            { replace: true }
        )
    }, [filterState, sortState])

    return {
        name,
        filter: filterState,
        sort: sortState,
        setFilter: handleUpdateFilter,
        setSort: handleUpdateSort,
    }
}

export default useFilterSort
