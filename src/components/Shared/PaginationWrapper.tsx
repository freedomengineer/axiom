import { ComponentType, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Spinner from '@components/Primitives/Spinner'
import { error } from '@libs/toastify'
import { parseFilter, parseSort } from '@libs/url'

import FilterSort from './FilterSort'
import Pagination from './Pagination'

const PaginationWrapper = <T,>({
    LayoutComponent,
    filter,
    sort,
    size = 12n,
    query,
}: {
    LayoutComponent: ComponentType<{ items: T[] } & object>
    filter: any
    sort: any
    size?: bigint
    query: (filter: any, sort: any, page: bigint, size: bigint) => Promise<Pagination<T>>
}) => {
    const [searchParams, setSearchParams] = useSearchParams()

    const [items, setItems] = useState<Pagination<T>>()
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoading(true)

        const f = parseFilter<T>(filter, searchParams)
        const s = parseSort<T>(sort, searchParams)
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
                    <FilterSort filter={filter} sort={sort} />
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
