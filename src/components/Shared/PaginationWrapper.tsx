import { ComponentType, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Spinner from '@components/Primitives/Spinner'
import useFilterSort from '@hooks/useFilterSort'
import { error } from '@libs/toastify'
import {
    QueryName,
    StringifiedFilterSort,
    parseFilterFromObj,
    parseSortFromObj,
} from 'shared/default/filter_sort'

import FilterSort from './FilterSort'
import Pagination from './Pagination'

const PaginationWrapper = <T, N extends QueryName>({
    LayoutComponent,
    name,
    size = 12n,
    hardFilter = {},
    query,
}: {
    LayoutComponent: ComponentType<{ items: T[] } & object>
    name: N
    size?: bigint
    hardFilter?: StringifiedFilterSort[N]['filter']
    query: (filter: any, sort: any, page: bigint, size: bigint) => Promise<Pagination<T>>
}) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sort, setSort] = useState<StringifiedFilterSort[N]['sort']>({
        by: 'recent',
        order: 'descending',
    })
    const [items, setItems] = useState<Pagination<T>>()
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoading(true)

        const f = parseFilterFromObj(name, hardFilter)
        const s = parseSortFromObj(name, sort)
        const p = BigInt(searchParams.get('page') ?? '1')

        query(f, s, p, size)
            .then(setItems)
            .catch((e) => {
                error(e)
                setItems({ of: 1n, is: 1n, result: [] })
            })
            .finally(() => setLoading(false))
    }, [searchParams, sort])

    return (
        <div className="relative">
            {!items || loading ? (
                <Spinner className="mx-auto my-auto flex h-10 w-10" />
            ) : (
                <div className="gap-medium flex flex-col items-center justify-center">
                    <FilterSort
                        name={name}
                        filter={hardFilter}
                        sort={sort}
                        setSort={setSort}
                        disableFilter={true}
                    />
                    <LayoutComponent items={items.result} />
                    <Pagination
                        is={items.is}
                        of={items.of}
                        onPageChange={(i: bigint) =>
                            setSearchParams({ ...hardFilter, page: i.toString() })
                        }
                    />
                </div>
            )}
        </div>
    )
}

export default PaginationWrapper
