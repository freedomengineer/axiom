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

        const isMounted = useRef<boolean>(false)
        const isFetching = useRef<boolean>(false)

        const observerTarget = useRef<HTMLDivElement>(null)

        const [firstPageLoaded, setFirstPageLoaded] = useState<boolean>(false)
        const [justAppended, setJustAppended] = useState<boolean>(false)

        const wasAppending = useRef<boolean>(false)
        const lastScrollY = useRef<number>(0)
        const prevDocScrollHeight = useRef<number>(0)

        const currentRequestId = useRef<number>(0)

        const currentAbort = useRef<AbortController | null>(null)

        const didFirstRealMount = useRef<boolean>(false)

        const filterKey = JSON.stringify(hardFilter)
        const sortKey = JSON.stringify(hardSort)
        const lastInitKey = useRef<string | null>(null)

        useEffect(() => {
            isMounted.current = true
            return () => {
                isMounted.current = false

                if (currentAbort.current) {
                    currentAbort.current.abort()
                }
            }
        }, [])

        const applyResults = useCallback(
            (
                shouldAppend: boolean,
                results: T[],
                currentCount: bigint,
                totalCount: bigint,
                hasResults: boolean
            ) => {
                setItems((prev) => {
                    const updated = shouldAppend ? [...prev, ...results] : results
                    setIsEmptyResult(updated.length === 0)
                    return updated
                })

                setCurrentPage(currentCount > 0n ? currentCount : 1n)
                const isLastPageLoaded = currentCount >= totalCount || !hasResults
                setHasMore(!isLastPageLoaded)

                if (shouldAppend && hasResults) setJustAppended(true)
            },
            []
        )

        const loadItems = useCallback(
            async (pageToLoad: bigint, shouldAppend: boolean) => {
                if (!isMounted.current) return
                if (isFetching.current) return
                if (pageToLoad <= 0n) return

                isFetching.current = true
                setLoading(true)
                setJustAppended(false)

                if (shouldAppend) {
                    wasAppending.current = true
                    lastScrollY.current = window.scrollY
                    prevDocScrollHeight.current = document.documentElement.scrollHeight
                } else {
                    wasAppending.current = false
                    prevDocScrollHeight.current = 0
                }

                const requestId = ++currentRequestId.current

                if (currentAbort.current) currentAbort.current.abort()
                const controller = new AbortController()
                currentAbort.current = controller

                try {
                    const f = parseFilterFromObj(name, hardFilter)
                    const s = parseSortFromObj(name, hardSort)

                    if (!isMounted.current) return
                    if (requestId !== currentRequestId.current) return

                    const newData = await query(f, s, pageToLoad, size)
                    console.log(f, s, pageToLoad, size, newData)

                    const results = newData?.result ?? []
                    const currentCount = BigInt(newData?.is ?? pageToLoad)
                    const totalCount = BigInt(newData?.of ?? 0)
                    const hasResults = results.length > 0

                    applyResults(shouldAppend, results, currentCount, totalCount, hasResults)

                    if (!shouldAppend) {
                        setFirstPageLoaded(true)
                    }
                } catch (err: any) {
                    if (err?.name === 'AbortError') {
                    } else {
                        if (isMounted.current) {
                            console.error('Error loading items:', err)
                            setHasMore(false)
                            if (!shouldAppend) {
                                setItems([])
                                setIsEmptyResult(true)
                            }
                        }
                    }
                } finally {
                    if (isMounted.current && requestId === currentRequestId.current) {
                        isFetching.current = false
                        setLoading(false)
                    }
                }
            },
            [applyResults, hardFilter, hardSort, name, query, size]
        )

        const initItems = useCallback(() => {
            if (!isMounted.current) return

            setItems([])
            setCurrentPage(0n)
            setHasMore(true)
            setIsEmptyResult(false)
            setJustAppended(false)
            setFirstPageLoaded(false)
            isFetching.current = false

            currentRequestId.current++
            if (currentAbort.current) currentAbort.current.abort()
            currentAbort.current = null

            loadItems(1n, false)
        }, [loadItems])

        useImperativeHandle(ref, () => ({
            refresh: () => {
                initItems()
            },
        }))

        useEffect(() => {
            const key = filterKey + '|' + sortKey

            if (!didFirstRealMount.current) {
                didFirstRealMount.current = true
                lastInitKey.current = key
                initItems()
                return
            }

            if (lastInitKey.current !== key) {
                lastInitKey.current = key
                initItems()
            }
        }, [filterKey, sortKey, initItems])

        useEffect(() => {
            if (!firstPageLoaded) return
            if (!hasMore) return
            const target = observerTarget.current
            if (!target) return

            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0]
                    if (!entry.isIntersecting) return
                    if (isFetching.current) return

                    const nextPage = currentPage + 1n
                    loadItems(nextPage, true)
                },
                { threshold: 0.1, rootMargin: '50px' }
            )

            observer.observe(target)
            return () => observer.disconnect()
        }, [firstPageLoaded, hasMore, currentPage, loadItems])

        useLayoutEffect(() => {
            if (wasAppending.current && !loading) {
                const currentDocScrollHeight = document.documentElement.scrollHeight
                if (
                    currentDocScrollHeight > prevDocScrollHeight.current + 10 &&
                    prevDocScrollHeight.current > 0
                ) {
                    window.scrollTo({
                        top: lastScrollY.current,
                        behavior: 'instant' as ScrollBehavior,
                    })
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
                        <span className="text-tiny text-center font-normal text-cold-700">
                            No results found
                        </span>
                    ) : hasMore ? null : (
                        <span className="text-tiny text-center font-normal text-cold-700">
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
