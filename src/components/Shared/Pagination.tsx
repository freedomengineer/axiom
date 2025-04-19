'use client'

import LeftIcon from '@components/Assets/left.svg'
import RightIcon from '@components/Assets/right.svg'

const generatePages = (currentPage: bigint, totalPages: bigint): (number | '...')[] => {
    const delta = 1n
    const pages: (number | '...')[] = []

    if (totalPages <= 5) {
        for (let i = 1n; i <= totalPages; i++) {
            pages.push(Number(i))
        }
    } else {
        const leftBound = currentPage - delta
        const rightBound = currentPage + delta

        pages.push(1)

        if (leftBound > 2n) {
            pages.push('...')
        }

        for (
            let i = Math.max(2, Number(leftBound));
            i <= Math.min(Number(totalPages) - 1, Number(rightBound));
            i++
        ) {
            pages.push(i)
        }

        if (rightBound < totalPages - 1n) {
            pages.push('...')
        }

        pages.push(Number(totalPages))
    }
    return pages
}

const Pagination = ({
    is,
    of,
    onPageChange,
}: {
    is: bigint
    of: bigint
    onPageChange: (i: bigint) => void
}) => {
    const pages = generatePages(is, of)

    return (
        <div className="text-small gap-small my-semilarge flex font-normal">
            <div className="gap-normal flex items-center">
                <button
                    className="py-small px-medium gap-small flex items-center rounded-lg text-primary-700 hover:bg-black/5 disabled:text-primary-700/50 disabled:hover:bg-black/0"
                    onClick={() => onPageChange(is - 1n)}
                    disabled={is === 1n}
                >
                    <LeftIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4 md:stroke-2" />{' '}
                    Previous
                </button>
                <div className="gap-small flex items-center">
                    {pages.map((p, i) => {
                        const isCurrentPage = Number(is) === p
                        const isEllipsis = p === '...'

                        if (isEllipsis) {
                            return (
                                <span key={`${p}-${i}`} className="text-cold-800/50">
                                    {p}
                                </span>
                            )
                        }

                        return (
                            <button
                                key={p}
                                className="font bold h-7 w-7 rounded-lg border border-cold-800/50 bg-white text-cold-800 hover:border-cold-800/100 disabled:border-primary-700 disabled:bg-primary-700 disabled:text-white disabled:opacity-100 md:h-9 md:w-9"
                                disabled={isCurrentPage}
                                onClick={() => onPageChange(BigInt(p))}
                            >
                                {p}
                            </button>
                        )
                    })}
                </div>
                <button
                    className="py-small px-medium gap-small flex items-center rounded-lg text-primary-700 hover:bg-black/5 disabled:text-primary-700/50 disabled:hover:bg-black/0"
                    onClick={() => onPageChange(is + 1n)}
                    disabled={is === of}
                >
                    Next
                    <RightIcon className="h-3.5 w-3.5 stroke-[1.5px] md:h-4 md:w-4 md:stroke-2" />
                </button>
            </div>
        </div>
    )
}

export default Pagination
