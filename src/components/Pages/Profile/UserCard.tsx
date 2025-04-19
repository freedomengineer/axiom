import { useState } from 'react'

import DefaultAvatarIcon from '@components/Assets/default_avatar.svg'
import DoneIcon from '@components/Assets/done.svg'
import ShareIcon from '@components/Assets/share.svg'
import Link from '@components/Shared/Link'
import useAuth from '@hooks/useAuth'
import { success } from '@libs/toastify'
import { build } from '@libs/url'
import { DFacade } from 'shared/types/services'

const UserCard = ({ item }: { item: DFacade.Sharable }) => {
    const { principal } = useAuth()
    const [copied, setCopied] = useState<boolean>()

    const handleCopy = () => {
        navigator.clipboard.writeText(
            build(['profile', item.principal.toText()], { ref: principal?.toText() ?? null }, true)
        )
        setCopied(true)
        success('Copied share link to clipboard')
        setTimeout(() => setCopied(false), 3000)
    }

    return (
        <div className="gap-medium p-medium flex w-full flex-col rounded-lg border border-cold-700/25 hover:border-cold-700 md:w-[350px]">
            <div className="gap-small flex place-items-center items-center justify-between text-cold-800">
                <Link
                    className="text-medium gap-medium flex place-items-center items-center text-left font-normal hover:text-primary-800"
                    href={build(['profile', item.principal.toText()])}
                >
                    <DefaultAvatarIcon className="h-7 w-7 md:h-8 md:w-8" />
                    <span>{item.username}</span>
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
                {item.location || 'Unknown location'}
            </p>
        </div>
    )
}

export default UserCard
