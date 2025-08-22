import { ComponentType, Ref, forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import DownIcon from '@components/Assets/down.svg'
import UpIcon from '@components/Assets/up.svg'
import Spinner from '@components/Primitives/Spinner'
import cn from '@libs/class'
import { QueryName, parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'

export enum SortDirection {
    ASC,
    DESC,
}
export type SortType = {
    column: number
    direction: SortDirection
}

export type TableWrapperProps<T> = {
    LayoutComponent: ComponentType<{
        items: T[]
        sort?: SortType
    }>
    name: QueryName
    hardFilter?: any
    hardSort?: any
    hardSortType?: SortType
    size?: bigint
    columns: {
        title: string
        sortable: boolean
        className?: string
    }[]
    query: (filter: any, sort: any, page: bigint, size: bigint) => Promise<Pagination<T>>
}
export type TableWrapperHandle = {
    refresh: () => void
}

const TableWrapper = forwardRef(
    <T,>(
        {
            LayoutComponent,
            name,
            hardFilter = {},
            hardSort = {},
            hardSortType,
            size = 4n,
            columns,
            query,
        }: TableWrapperProps<T>,
        ref: Ref<TableWrapperHandle>
    ) => {
        const [items, setItems] = useState<Pagination<T>>()
        const [loading, setLoading] = useState<boolean>(false)
        const [sortType, setSortType] = useState<SortType>(
            hardSortType ?? {
                column: 0,
                direction: SortDirection.ASC,
            }
        )

        useImperativeHandle(ref, () => ({
            refresh: () => {
                setSortType(
                    hardSortType ?? {
                        column: 0,
                        direction: SortDirection.ASC,
                    }
                )
                loadItems(size)
            },
        }))
        useEffect(() => {
            loadItems(size)
        }, [])

        const loadItems = async (pageSize: bigint) => {
            setLoading(true)

            const f = parseFilterFromObj(name, hardFilter)
            const s = parseSortFromObj(name, hardSort)
            const p = 1n

            await query(f, s, p, pageSize)
                .then(setItems)
                .finally(() => setLoading(false))
        }
        const loadMore = async () => {
            setLoading(true)

            const f = parseFilterFromObj(name, hardFilter)
            const s = parseSortFromObj(name, hardSort)
            const p = 1n

            await query(f, s, p, items!.is * size + size)
                .then(setItems)
                .finally(() => setLoading(false))
        }
        const handleSort = (column: number) => {
            setSortType((prev) => ({
                column,
                direction: sortType.column === column ? prev.direction ^ 1 : SortDirection.ASC,
            }))
        }

        return (
            <div className="w-full overflow-x-auto rounded-lg border border-cold-200 md:overflow-hidden">
                <table className="min-w-full border-collapse">
                    <thead className="bg-cold-50">
                        <tr>
                            {columns.map(({ title, sortable, className }, i) => (
                                <th
                                    key={i}
                                    scope="col"
                                    className={cn(
                                        'text-small px-normal py-small cursor-pointer select-none text-nowrap bg-cold-100 hover:bg-cold-700/20 aria-disabled:pointer-events-none aria-disabled:cursor-default',
                                        'border-b border-r border-cold-200',
                                        i === 0 && 'border-l-0',
                                        i === columns.length - 1 && 'border-r-0',
                                        className
                                    )}
                                    onClick={() => sortable && handleSort(i)}
                                    aria-disabled={!sortable}
                                >
                                    <div className="gap-small flex w-full items-center justify-between font-semibold text-cold-700">
                                        <span
                                            className={cn(
                                                sortType.column === i
                                                    ? 'font-bold text-primary-700'
                                                    : 'font-semibold  text-cold-700'
                                            )}
                                        >
                                            {title}
                                        </span>
                                        {sortable && (
                                            <div className="gap-tiny grid grid-rows-2">
                                                <UpIcon
                                                    className={cn(
                                                        'h-auto w-[10px] stroke-2 md:w-[12px]',
                                                        sortType.column === i &&
                                                            sortType.direction === SortDirection.ASC
                                                            ? 'text-primary-700'
                                                            : 'text-cold-700 opacity-25'
                                                    )}
                                                />
                                                <DownIcon
                                                    className={cn(
                                                        'h-auto w-[10px] stroke-2 md:w-[12px]',
                                                        sortType.column === i &&
                                                            sortType.direction ===
                                                                SortDirection.DESC
                                                            ? 'text-primary-700'
                                                            : 'text-cold-700 opacity-25'
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {!items || loading ? (
                        <Spinner className="mx-auto my-auto flex h-7 w-7 md:h-9 md:w-9" />
                    ) : (
                        <LayoutComponent items={items.result} sort={sortType} />
                    )}
                </table>
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
) as <T>(props: TableWrapperProps<T> & { ref?: Ref<TableWrapperHandle> }) => JSX.Element

export default TableWrapper
