'use client '

import { useState } from 'react'

import DoneIcon from '@components/Assets/done.svg'
import FieldIcon from '@components/Assets/field.svg'
import FieldMembersIcon from '@components/Assets/field_members.svg'
import HypothesisIcon from '@components/Assets/hypothesis.svg'
import ShareIcon from '@components/Assets/share.svg'
import Spinner from '@components/Primitives/Spinner'
import InfiniteScrollWrapperHard from '@components/Shared/InfiniteScrollWrapperHard'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import UserList from '@components/Shared/UserList'
import useAuth from '@hooks/useAuth'
import useFieldDetails from '@hooks/useFieldDetails'
import cn from '@libs/class'
import { success } from '@libs/toastify'
import { build } from '@libs/url'
import { DAxioms } from 'shared/types/services'

enum EPopup {
    Members,
}

const FieldCard = ({ item, className }: { item: DAxioms.SharableField; className?: string }) => {
    const { principal } = useAuth()
    const { localItem, role, loading, handleSubscribe } = useFieldDetails(item)

    const [open, setOpen] = useState<EPopup>()
    const [copied, setCopied] = useState<boolean>()

    const handleCopy = () => {
        navigator.clipboard.writeText(
            build(['feed', 'fields', localItem.name], { ref: principal?.toText() ?? null }, true)
        )
        setCopied(true)
        success('Copied share link to clipboard')
        setTimeout(() => setCopied(false), 3000)
    }

    const fieldUrl = build(['feed', 'fields', localItem.name])

    return (
        <div
            className={cn(
                'gap-medium p-medium flex w-full flex-col rounded-lg border md:w-[350px]',
                role === 'Member'
                    ? 'border-primary-800 border-opacity-75 hover:border-opacity-100'
                    : 'border-cold-400 border-opacity-25 hover:border-opacity-100',
                className
            )}
        >
            <Popup
                open={open === EPopup.Members}
                onClose={() => setOpen(undefined)}
                title="Members"
                className="w-full md:w-fit"
                Icon={<FieldMembersIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
            >
                <InfiniteScrollWrapperHard items={localItem.members} LayoutComponent={UserList} />
            </Popup>
            <div className="gap-small flex place-items-center items-center justify-between text-cold-800">
                <Link
                    className="text-medium gap-medium flex place-items-center items-center text-left font-normal hover:text-primary-800"
                    href={fieldUrl}
                >
                    <FieldIcon className="h-7 w-7 md:h-8 md:w-8" />
                    <p className="p-truncate-1">{localItem.name}</p>
                </Link>
                <button
                    className="rounded-md border border-cold-800 hover:border-primary-800 hover:bg-primary-800/10 hover:text-primary-800 disabled:pointer-events-none md:border-[1.5px]"
                    onClick={handleCopy}
                    disabled={copied}
                >
                    {copied ? (
                        <DoneIcon className="p-extratiny h-6 w-6 rounded-md stroke-1 md:h-7 md:w-7 md:stroke-[1.5px]" />
                    ) : (
                        <ShareIcon className="p-extratiny h-6 w-6 rounded-md stroke-1 md:h-7 md:w-7 md:border-[1.5px]" />
                    )}
                </button>
            </div>
            <p className="text-small p-truncate-3 mb-auto font-light text-cold-800">
                {localItem.description}
            </p>
            <div className="gap-small mt-auto grid h-9 grid-cols-2 place-items-center items-center md:h-10">
                <div className="text-tiny grid h-full w-full grid-cols-2 items-center divide-x-[1px] font-normal text-white">
                    <button
                        className="gap-normal flex h-full w-full items-center justify-center rounded-l-lg bg-cold-800 hover:bg-opacity-75"
                        onClick={() => setOpen(EPopup.Members)}
                    >
                        <FieldMembersIcon className="h-3.5 w-4 stroke-[1.5px] md:h-4 md:w-4" />
                        <span>{localItem.members.length}</span>
                    </button>

                    <button className="gap-normal pointer-events-none flex h-full w-full items-center justify-center rounded-r-lg bg-cold-800 hover:bg-opacity-75">
                        <HypothesisIcon className="h-4 w-4 stroke-[1.25px] md:h-5 md:w-5" />
                        <span>{localItem.hypothesisIds.length}</span>
                    </button>
                </div>
                <button
                    className={cn(
                        '!text-small flex h-full w-full items-center justify-center rounded-lg border border-primary-800 border-opacity-0 text-white',
                        role === 'Guest'
                            ? 'border-opacity-100 text-primary-800 hover:bg-primary-800/10'
                            : role === 'Member'
                              ? 'bg-primary-800 hover:bg-opacity-75'
                              : 'pointer-events-none bg-primary-800/75'
                    )}
                    disabled={loading || !role}
                    onClick={handleSubscribe}
                >
                    {loading ? (
                        <Spinner
                            className="h-5 w-5 text-white/75"
                            color={role === 'Guest' ? 'deep-orange' : 'white'}
                        />
                    ) : (
                        <>
                            {role === 'Guest'
                                ? 'Subscribe'
                                : role === 'Member'
                                  ? 'Unsubscribe'
                                  : 'Log in required'}
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default FieldCard
