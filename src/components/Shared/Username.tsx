import { Principal } from '@dfinity/principal'
import { Fragment } from 'react'

import EngineerIcon from '@components/Assets/engineer.svg'
import ExplorerIcon from '@components/Assets/explorer.svg'
import HoboIcon from '@components/Assets/hobo.svg'
import LiberatorIcon from '@components/Assets/liberator.svg'
import PhilosopherIcon from '@components/Assets/philosopher.svg'
import ScientistIcon from '@components/Assets/scientist.svg'
import ScribeIcon from '@components/Assets/scribe.svg'
import SeekerIcon from '@components/Assets/seeker.svg'
import useUsername from '@hooks/useUsername'
import cn from '@libs/class'

import Link from './Link'

export const PACKAGES = {
    '1000000000': ['Hobo', 'HOBO'],
    '2000000000': ['Seeker', 'SEEKER'],
    '5000000000': ['Scribe', 'SCRIBE'],
    '10000000000': ['Scientist', 'SCIENT'],
    '50000000000': ['Philosopher', 'PHILOS'],
    '100000000000': ['Engineer', 'ENGINE'],
    '500000000000': ['Explorer', 'EXPLOR'],
    '1000000000000': ['Liberator', 'LIBER'],
}

export const Symbol = ({
    capitalRaised,
    className,
}: {
    capitalRaised: string
    className?: string
}) => {
    switch (capitalRaised) {
        case '0':
        case '1000000000':
            return (
                <HoboIcon
                    className={cn(
                        'mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4',
                        className
                    )}
                />
            )
        case '2000000000':
            return (
                <SeekerIcon
                    className={cn(
                        'mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4',
                        className
                    )}
                />
            )
        case '5000000000':
            return (
                <ScribeIcon
                    className={cn(
                        'mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4',
                        className
                    )}
                />
            )
        case '10000000000':
            return (
                <ScientistIcon
                    className={cn(
                        'mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4',
                        className
                    )}
                />
            )
        case '50000000000':
            return (
                <PhilosopherIcon
                    className={cn(
                        'mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4',
                        className
                    )}
                />
            )
        case '100000000000':
            return (
                <EngineerIcon
                    className={cn(
                        'mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4',
                        className
                    )}
                />
            )
        case '500000000000':
            return (
                <ExplorerIcon
                    className={cn(
                        'mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4',
                        className
                    )}
                />
            )
        case '1000000000000':
            return (
                <LiberatorIcon
                    className={cn(
                        'mr-1 inline-block h-3.5 w-3.5 shrink-0 text-inherit md:h-4 md:w-4',
                        className,
                        'stroke-[50px]'
                    )}
                />
            )
    }
}

const Username = ({
    principal,
    symbol = false,
    symbolClassName,
    className,
    linkClassName,
}: {
    principal: Principal
    symbol?: boolean
    symbolClassName?: string
    className?: string
    linkClassName?: string
}) => {
    if (!principal) return null
    const parsedPrincipal = Principal.fromUint8Array(principal._arr)
    const { username, capitalRaised } = useUsername(parsedPrincipal)
    if (className && !linkClassName)
        return (
            <span
                className={cn(
                    'flex-nowrap place-items-center gap-1 text-nowrap',
                    'flex items-center',
                    className
                )}
            >
                {symbol && <Symbol capitalRaised={capitalRaised} className={symbolClassName} />}
                {username}
            </span>
        )
    if (linkClassName)
        return (
            <Link
                href={`/profile/${parsedPrincipal.toText()}`}
                className={cn(
                    'flex-nowrap place-items-center gap-1 text-nowrap',
                    'flex items-center',
                    linkClassName
                )}
                openInNewTab
            >
                {symbol && <Symbol capitalRaised={capitalRaised} className={symbolClassName} />}
                {username}
            </Link>
        )
    if (symbol) {
        return (
            <span
                className={cn(
                    'flex-nowrap place-items-center gap-1 text-nowrap',
                    'flex items-center'
                )}
            >
                <Symbol capitalRaised={capitalRaised} className={symbolClassName} />
                {username}
            </span>
        )
    }
    return <>{username}</>
}

export const Usernames = ({
    principals,
    symbol = false,
    className,
    linkClassName,
}: {
    principals: Principal[]
    symbol?: boolean
    linkClassName?: string
    className?: string
}) => {
    if (className)
        return principals.map((principal, index) => (
            <span key={principal.toText()}>
                <Username
                    className={className}
                    principal={principal}
                    linkClassName={linkClassName}
                    symbol={symbol}
                />
                {index === principals.length - 1
                    ? ''
                    : index === principals.length - 2
                      ? ' and '
                      : ', '}
            </span>
        ))
    return (
        <>
            {principals.map((principal, index) => (
                <Fragment key={principal.toText()}>
                    <Username principal={principal} symbol={symbol} linkClassName={linkClassName} />
                    {index === principals.length - 1
                        ? ''
                        : index === principals.length - 2
                          ? ' and '
                          : ', '}
                </Fragment>
            ))}
        </>
    )
}

export default Username
