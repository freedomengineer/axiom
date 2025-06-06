import { Principal } from '@dfinity/principal'

import useUsername from '@hooks/useUsername'

import Link from './Link'

const Username = ({
    principal,
    symbol = false,
    className,
    linkClassName,
}: {
    principal: Principal
    symbol?: boolean
    className?: string
    linkClassName?: string
}) => {
    const parsedPrincipal = Principal.fromUint8Array(principal._arr)
    const { username, capitalRaised } = useUsername(parsedPrincipal)
    if (className) return <span className={className}>{username}</span>
    if (linkClassName)
        return (
            <Link
                href={`/profile/${parsedPrincipal.toText()}`}
                className={linkClassName}
                openInNewTab
            >
                {symbol ? '@' : ''}
                {username}
            </Link>
        )
    return <span>{username}</span>
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
            <span key={principal.toText()} className={className}>
                <Username principal={principal} linkClassName={linkClassName} symbol={symbol} />
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
                <>
                    <Username
                        key={principal.toText()}
                        principal={principal}
                        symbol={symbol}
                        linkClassName={linkClassName}
                    />
                    {index === principals.length - 1
                        ? ''
                        : index === principals.length - 2
                          ? ' and '
                          : ', '}
                </>
            ))}
        </>
    )
}

export default Username
