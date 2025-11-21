'use client'

import { useEffect, useRef, useState } from 'react'

import AdoptIcon from '@components/Assets/adopt.svg'
import CloseIcon from '@components/Assets/close.svg'
import LeftIcon from '@components/Assets/left.svg'
import RightIcon from '@components/Assets/right.svg'
import StarIcon from '@components/Assets/star.svg'
import SearchableSelect from '@components/Primitives/SearchableSelect'
import { LongHypothesis, NoFieldsSubscribed } from '@components/Shared/Alerts'
import Divider from '@components/Shared/Divider'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { useSpecificUserData } from '@hooks/useUserData'
import cn from '@libs/class'
import { DAxioms } from 'shared/types/services'

import FieldInline from '../Fields/FieldInline'

const PostHypothesisForm = ({
    field,
    content,
    setField,
    setContent,
    onForward,
    onClosePopup,
}: {
    field: string | undefined
    content: string
    setField?: (field: string | undefined) => void
    setContent: (content: string) => void
    onForward: () => void
    onClosePopup?: () => void
}) => {
    const configs = useConfigs('Axioms')

    const { principal } = useAuth()
    const fields = useSpecificUserData(principal ?? null, 'fields')
    const [pattern, setPattern] = useState<string>('')
    const [sortBy, setSortBy] = useState<'alphabetical' | 'popularity'>('popularity')
    const [longHypothesisWarning, setLongHypothesisWarning] = useState<boolean>(false)
    const [activeFields, setActiveFields] = useState<DAxioms.SharableField[]>([])
    const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false)
    const [canScrollRight, setCanScrollRight] = useState<boolean>(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const validLength = content.length <= configs?.['MAX_HYPOTHESIS_LENGTH'][1]

    const checkScrollState = () => {
        const container = scrollContainerRef.current
        if (!container) return

        const { scrollLeft, scrollWidth, clientWidth } = container
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }

    const scrollLeft = () => {
        const container = scrollContainerRef.current
        if (!container) return
        container.scrollBy({ left: -200, behavior: 'smooth' })
    }

    const scrollRight = () => {
        const container = scrollContainerRef.current
        if (!container) return
        container.scrollBy({ left: 200, behavior: 'smooth' })
    }

    useEffect(() => {
        if (!fields) {
            setActiveFields([])
            return
        }

        let newActiveFields = pattern
            ? fields.filter((field) => field.name.toLowerCase().includes(pattern.toLowerCase()))
            : [...fields]

        if (sortBy === 'alphabetical') {
            newActiveFields = [...newActiveFields].sort((a, b) => a.name.localeCompare(b.name))
        } else {
            newActiveFields = [...newActiveFields].sort(
                (a, b) => b.members.length - a.members.length
            )
        }
        setActiveFields(newActiveFields)
    }, [fields, pattern, sortBy])

    useEffect(() => {
        checkScrollState()
        const container = scrollContainerRef.current
        if (container) {
            container.addEventListener('scroll', checkScrollState)
            return () => container.removeEventListener('scroll', checkScrollState)
        }
    }, [activeFields, field])

    return (
        <>
            {field === undefined && fields?.length === 0 && (
                <NoFieldsSubscribed onConfirm={onClosePopup} />
            )}
            <div className="gap-normal flex w-full flex-col place-items-center items-center text-cold-800">
                {longHypothesisWarning && (
                    <LongHypothesis
                        onClose={() => setLongHypothesisWarning(false)}
                        onConfirm={() => onForward()}
                    />
                )}
                <div className="gap-normal flex w-full flex-col justify-center">
                    <p className="text-medium text-center font-light">
                        Which field would your hypothesis be posted in?
                    </p>
                    <div className="gap-normal hidden w-full grid-cols-3 md:grid">
                        {!field && (
                            <div className="gap-small relative col-span-1 flex items-center justify-between">
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search"
                                    aria-selected={!!pattern}
                                    value={field ?? pattern}
                                    onChange={(e) => setPattern(e.target.value)}
                                />
                                {sortBy === 'popularity' ? (
                                    <button
                                        className="text-tiny pre-underline p-tiny rounded-full stroke-[1.5px] text-cold-800 hover:bg-black/10"
                                        onClick={() => setSortBy('alphabetical')}
                                    >
                                        <StarIcon className="h-6" />
                                    </button>
                                ) : (
                                    <button
                                        className="text-tiny pre-underline p-tiny rounded-full stroke-[1.5px] text-cold-800 hover:bg-black/10"
                                        onClick={() => setSortBy('popularity')}
                                    >
                                        <AdoptIcon className="h-6" />
                                    </button>
                                )}
                            </div>
                        )}
                        <div className={cn('relative', field ? 'col-span-3' : 'col-span-2')}>
                            {!field && activeFields.length > 0 && (
                                <>
                                    <button
                                        className={cn(
                                            'gap-tiny px-normal py-extratiny button absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center rounded-full bg-cold-800 stroke-[1.5px] text-white shadow-md transition-opacity',
                                            !canScrollLeft && 'pointer-events-none hidden'
                                        )}
                                        onClick={scrollLeft}
                                        disabled={!canScrollLeft}
                                    >
                                        <LeftIcon className="h-4" /> prev
                                    </button>
                                    <button
                                        className={cn(
                                            'gap-tiny px-normal py-extratiny button absolute right-0 top-1/2 z-10 flex -translate-y-1/2 items-center rounded-full bg-cold-800 stroke-[1.5px] text-white shadow-md transition-opacity',
                                            !canScrollRight && 'pointer-events-none hidden'
                                        )}
                                        onClick={scrollRight}
                                        disabled={!canScrollRight}
                                    >
                                        next <RightIcon className="h-4" />
                                    </button>
                                </>
                            )}
                            <div
                                ref={scrollContainerRef}
                                className={cn(
                                    'gap-small flex !h-[38px] place-items-center items-center overflow-x-auto overflow-y-hidden',
                                    '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                                )}
                            >
                                {field ? (
                                    <div className="gap-normal mx-auto flex h-full items-center">
                                        <button
                                            disabled={!setField}
                                            onClick={() => setField?.(undefined)}
                                        >
                                            <div className="my-auto hover:opacity-80">
                                                {fields && (
                                                    <FieldInline
                                                        item={fields.find((e) => e.name === field)!}
                                                        className="button pointer-events-none bg-cold-800 text-white"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                        <button
                                            className="px-normal py-tiny h-full w-7 rounded-lg border border-cold-800/100 text-cold-800/100 hover:border-cold-800/80 hover:text-cold-800/80 disabled:pointer-events-none disabled:opacity-50 md:h-9 md:w-9"
                                            disabled={!setField}
                                            onClick={() => setField?.(undefined)}
                                        >
                                            <CloseIcon className="h-full w-full stroke-[1.5px]" />
                                        </button>
                                    </div>
                                ) : fields !== null && fields.length === 0 ? (
                                    <></>
                                ) : (
                                    activeFields.map((item, i) => (
                                        <button
                                            className={
                                                'px-normal h-full rounded-lg border border-cold-800/50 hover:border-cold-800/80'
                                            }
                                            onClick={() => setField?.(item.name)}
                                            key={i}
                                        >
                                            <div className="pointer-events-none my-auto">
                                                <FieldInline
                                                    item={item}
                                                    className="text-cold-800"
                                                />
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="block md:hidden">
                        <div className="gap-small relative col-span-1 flex items-center justify-between">
                            <SearchableSelect
                                options={(activeFields ?? []).map((field) => ({
                                    label: field.name,
                                }))}
                                value={field}
                                onChange={(value) => setField?.(value)}
                                placeholder={
                                    fields?.length === 0 ? 'No fields available' : 'Select a field'
                                }
                                disabled={fields?.length === 0}
                                customizable={false}
                            />
                            {sortBy === 'popularity' ? (
                                <button
                                    className="text-tiny pre-underline p-tiny rounded-full stroke-[1.5px] text-cold-800 hover:bg-black/10"
                                    onClick={() => setSortBy('alphabetical')}
                                >
                                    <StarIcon className="h-5" />
                                </button>
                            ) : (
                                <button
                                    className="text-tiny pre-underline p-tiny rounded-full stroke-[1.5px] text-cold-800 hover:bg-black/10"
                                    onClick={() => setSortBy('popularity')}
                                >
                                    <AdoptIcon className="h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <Divider
                    className="!py-medium mx-auto w-4/5"
                    direction="horizontal"
                    bgColor="bg-cold-800"
                    borderColor="border-cold-800"
                />
                <div className="gap-normal flex w-full flex-col justify-center">
                    <p className="text-medium text-center font-light">Fill in the hypothesis</p>
                    <textarea
                        placeholder="Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="input h-32"
                    />
                    <p
                        className={cn(
                            '!text-tiny',
                            content.length > 333 && 'text-yellow-800',
                            !validLength && 'text-red-700'
                        )}
                    >
                        {content.length} / {configs?.['MAX_HYPOTHESIS_LENGTH'][1].toString()}
                    </p>
                </div>
                <Divider
                    className="!py-medium mx-auto w-4/5"
                    direction="horizontal"
                    bgColor="bg-cold-800"
                    borderColor="border-cold-800"
                />
                <button
                    className="button w-auto min-w-36 bg-cold-800 md:min-w-48"
                    onClick={() => {
                        if (content.length > 333) setLongHypothesisWarning(true)
                        else onForward()
                    }}
                    disabled={!content || !field || !validLength}
                >
                    {!field
                        ? 'Select a field'
                        : !content
                          ? 'Write something'
                          : !validLength
                            ? 'Hypothesis too long'
                            : 'Preview your Hypothesis'}
                </button>
            </div>
        </>
    )
}

export default PostHypothesisForm
