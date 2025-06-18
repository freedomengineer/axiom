import { ComponentType, useEffect, useState } from 'react'

import Spinner from '@components/Primitives/Spinner'
import { QueryName, parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'

const ListWrapper = <T,>({
    LayoutComponent,
    name,
    hardFilter = {},
    hardSort = {},
    size = 4n,
    query,
}: {
    LayoutComponent: ComponentType<{ items: T[] }>
    name: QueryName
    hardFilter?: any
    hardSort?: any
    size?: bigint
    query: (filter: any, sort: any, page: bigint, size: bigint) => Promise<Pagination<T>>
}) => {
    const [items, setItems] = useState<Pagination<T>>()
    const [q, setQ] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoading(true)

        const f = parseFilterFromObj(name, { ...hardFilter, q })
        const s = parseSortFromObj(name, hardSort)
        const p = 1n

        query(f, s, p, size)
            .then(setItems)
            .finally(() => setLoading(false))
    }, [q])

    const loadMore = async () => {
        setLoading(true)

        const f = parseFilterFromObj(name, { ...hardFilter, q })
        const s = parseSortFromObj(name, hardSort)
        const p = 1n

        await query(f, s, p, items!.is * size + size)
            .then(setItems)
            .finally(() => setLoading(false))
    }

    return (
        <div className="gap-normal flex flex-col items-center justify-center">
            <div className="px-normal w-full">
                <input
                    type="text"
                    className="px-normal mx-auto h-10 w-full rounded-md border border-cold-800/25 py-1 ring-1 ring-cold-800/25 focus:outline-none focus:ring-2 focus:ring-cold-800"
                    placeholder="Search"
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>
            {!items || loading ? (
                <Spinner className="mx-auto my-auto flex h-10 w-10" />
            ) : (
                <LayoutComponent items={items.result} />
            )}
            <button
                className="text-tiny pre-underline rounded-lg text-cold-800 decoration-cold-800/50 hover:decoration-cold-800/100 disabled:hidden"
                disabled={!items || items.of === 1n}
                onClick={loadMore}
            >
                Load More
            </button>
        </div>
    )
}

export default ListWrapper
