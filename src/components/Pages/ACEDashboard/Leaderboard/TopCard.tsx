import { Principal } from '@dfinity/principal'

import Link from '@components/Shared/Link'
import useUsername from '@hooks/useUsername'
import cn from '@libs/class'

const TopCard = ({ string, number, index }: { string: string; number: number; index: number }) => {
    const principal = Principal.fromText(string)!
    const { username } = useUsername(principal)

    return (
        <div
            className={cn(
                'gap-medium px-medium py-normal text-medium mx-auto flex w-full max-w-3xl rounded-lg font-medium',
                index === 0
                    ? 'bg-yellow-800 font-bold text-white'
                    : index === 1
                      ? 'bg-primary-700 font-bold text-white'
                      : index === 2
                        ? 'bg-cold-700 font-bold text-white'
                        : 'border border-cold-700 font-medium text-cold-700'
            )}
        >
            <span className="w-10 text-right">{index + 1}</span>
            <span className="w-full">
                <Link
                    href={`/profile/${string}`}
                    className={cn(
                        'pre-underline group z-10 w-full justify-start',
                        index < 3
                            ? 'text-white decoration-white/50 hover:decoration-white/100'
                            : 'text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100'
                    )}
                    size="medium"
                    openInNewTab
                >
                    {username}
                </Link>
            </span>
            <span className="pr-normal w-fit text-right">
                {number.toLocaleString('en-US', { maximumFractionDigits: 8 })}
            </span>
        </div>
    )
}

export default TopCard
