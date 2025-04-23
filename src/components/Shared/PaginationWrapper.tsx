import { ComponentType, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Spinner from '@components/Primitives/Spinner'
import useFilterSort from '@hooks/useFilterSort'
import { error } from '@libs/toastify'
import { QueryName, parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'

import FilterSort from './FilterSort'
import Pagination from './Pagination'

const PaginationWrapper = <T, N extends QueryName>({
    LayoutComponent,
    name,
    size = 12n,
    query,
}: {
    LayoutComponent: ComponentType<{ items: T[] } & object>
    name: N
    size?: bigint
    query: (filter: any, sort: any, page: bigint, size: bigint) => Promise<Pagination<T>>
}) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const filterSortData = useFilterSort(name)

    const [items, setItems] = useState<Pagination<T>>()
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoading(true)

        const f = parseFilterFromObj(name, filterSortData.filter)
        const s = parseSortFromObj(name, filterSortData.sort)
        const p = BigInt(searchParams.get('page') ?? '1')

        query(f, s, p, size)
            .then(setItems)
            .catch((e) => {
                error(e)
                setItems({ of: 1n, is: 1n, result: [] })
            })
            .finally(() => setLoading(false))
    }, [searchParams])

    return (
        <div className="relative">
            {!items || loading ? (
                <Spinner className="mx-auto my-auto flex h-10 w-10" />
            ) : (
                <div className="gap-medium flex flex-col items-center justify-center">
                    <FilterSort {...filterSortData} />
                    <LayoutComponent items={items.result} />
                    <Pagination
                        is={items.is}
                        of={items.of}
                        onPageChange={(i: bigint) => setSearchParams({ page: i.toString() })}
                    />
                </div>
            )}
        </div>
    )
}

export default PaginationWrapper
