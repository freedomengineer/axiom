import {
    ComponentType,
    JSX,
    Ref,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

import Spinner from '@components/Primitives/Spinner'
import {
    QueryName,
    StringifiedFilterSort,
    parseFilterFromObj,
    parseSortFromObj,
} from 'shared/default/filter_sort'

export type InfiniteScrollWrapperHandle = {
    refresh: () => void
}
export type InfiniteScrollWrapperProps<T, N extends QueryName> = {
    LayoutComponent: ComponentType<{ items: T[] }>
    name: N
    hardFilter: StringifiedFilterSort[N]['filter']
    hardSort: StringifiedFilterSort[N]['sort']
    size?: bigint
    className?: string
    query: (filter: any, sort: any, page: bigint, size: bigint) => Promise<Pagination<T>>
}

const InfiniteScrollWrapper = forwardRef(
    <T, N extends QueryName>(
        {
            LayoutComponent,
            name,
            hardFilter,
            hardSort,
            size = 12n,
            className,
            query,
        }: InfiniteScrollWrapperProps<T, N>,
        ref: Ref<InfiniteScrollWrapperHandle>
    ) => {
        const [items, setItems] = useState<T[]>([])
        const [loading, setLoading] = useState<boolean>(false)
        const [hasMore, setHasMore] = useState<boolean>(true)
        const [currentPage, setCurrentPage] = useState<bigint>(0n)
        const [isEmptyResult, setIsEmptyResult] = useState<boolean>(false)
        const initialLoadDone = useRef<boolean>(false)
        const observerTarget = useRef<HTMLDivElement>(null)
        const isFetching = useRef<boolean>(false)
        const isMounted = useRef<boolean>(false)

        const [justAppended, setJustAppended] = useState<boolean>(false)

        const lastScrollY = useRef<number>(0)
        const prevDocScrollHeight = useRef<number>(0)
        const wasAppending = useRef<boolean>(false)

        useEffect(() => {
            isMounted.current = true
            return () => {
                isMounted.current = false
            }
        }, [])

        const loadItems = useCallback(
            async (pageToLoad: bigint, shouldAppend: boolean) => {
                if (isFetching.current || pageToLoad <= 0n) return

                isFetching.current = true
                setLoading(true)

                if (isMounted.current) setJustAppended(false)
                else return

                if (shouldAppend) {
                    wasAppending.current = true
                    lastScrollY.current = window.scrollY
                    prevDocScrollHeight.current = document.documentElement.scrollHeight
                } else {
                    wasAppending.current = false
                    prevDocScrollHeight.current = 0
                }

                try {
                    const f = parseFilterFromObj(name, hardFilter)
                    const s = parseSortFromObj(name, hardSort)

                    const newData = await query(f, s, pageToLoad, size)

                    const results = newData?.result ?? []
                    const currentCount = BigInt(newData?.is ?? pageToLoad)
                    const totalCount = BigInt(newData?.of ?? 0)
                    const hasResults = results.length > 0

                    setItems((prevItems) => {
                        const updatedItems = shouldAppend ? [...prevItems, ...results] : results
                        if (isMounted.current) setIsEmptyResult(updatedItems.length === 0)
                        return updatedItems
                    })

                    if (isMounted.current) {
                        setCurrentPage(currentCount > 0n ? currentCount : pageToLoad)
                        const isLastPageLoaded = currentCount >= totalCount || !hasResults
                        setHasMore(!isLastPageLoaded)

                        if (shouldAppend && hasResults) {
                            setJustAppended(true)
                        }
                    }
                } catch (error) {
                    if (!isMounted.current) return
                    console.error('Error loading items:', error)
                    setHasMore(false)
                    if (!shouldAppend) {
                        setItems([])
                        setIsEmptyResult(true)
                    }
                } finally {
                    isFetching.current = false
                    if (isMounted.current) {
                        setLoading(false)
                    }
                }
            },

            [query, hardFilter, hardSort, size]
        )

        const initItems = useCallback(() => {
            window.scrollTo({ top: 0, behavior: 'auto' })

            setItems([])
            setCurrentPage(0n)
            setHasMore(true)
            setIsEmptyResult(false)
            setJustAppended(false)
            isFetching.current = false
            initialLoadDone.current = true
            loadItems(1n, false)
        }, [loadItems])

        useImperativeHandle(ref, () => ({
            refresh: initItems,
        }))

        useEffect(() => {
            initItems()
        }, [hardFilter, hardSort])

        useEffect(() => {
            const target = observerTarget.current
            if (!target) return

            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0]
                    if (entry.isIntersecting && hasMore && !isFetching.current) {
                        const pageToLoad = currentPage + 1n
                        loadItems(pageToLoad, true)
                    }
                },
                { threshold: 0.1, rootMargin: '50px' }
            )

            if (hasMore) observer.observe(target)

            return () => {
                if (target) observer.unobserve(target)
                observer.disconnect()
            }
        }, [hasMore, loadItems, currentPage])

        useLayoutEffect(() => {
            if (wasAppending.current && !loading) {
                const currentDocScrollHeight = document.documentElement.scrollHeight
                if (
                    currentDocScrollHeight > prevDocScrollHeight.current + 10 &&
                    prevDocScrollHeight.current > 0
                ) {
                    window.scrollTo({ top: lastScrollY.current, behavior: 'instant' })
                }
                wasAppending.current = false
            }

            if (justAppended) {
                const timer = setTimeout(() => {
                    if (isMounted.current) setJustAppended(false)
                }, 300)
                return () => clearTimeout(timer)
            }
        }, [items, loading, justAppended])

        return (
            <div className={className}>
                {items.length > 0 && <LayoutComponent items={items} />}

                <div
                    ref={observerTarget}
                    className="py-medium flex min-h-[50px] w-full flex-col items-center justify-center"
                >
                    {loading ? (
                        <Spinner className="h-8 w-8" />
                    ) : isEmptyResult ? (
                        <span className="text-tiny font-normal text-cold-700">
                            No results found
                        </span>
                    ) : hasMore ? null : (
                        <span className="text-tiny font-normal text-cold-700">
                            Loaded all results
                        </span>
                    )}
                </div>
            </div>
        )
    }
) as <T, N extends QueryName>(
    props: InfiniteScrollWrapperProps<T, N> & { ref?: Ref<InfiniteScrollWrapperHandle> }
) => JSX.Element

export default InfiniteScrollWrapper
