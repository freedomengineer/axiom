import Link from '@components/Shared/Link'
import useUsername from '@hooks/useUsername'
import { build } from '@libs/url'
import { DDAO } from 'shared/types/services'

const CustodianCard = ({ item }: { item: DDAO.SharableNominee }) => {
    const username = useUsername(item.principal)

    return (
        <div className="gap-medium p-medium flex w-full flex-col rounded-lg border border-cold-700/25 hover:border-cold-700 md:w-[350px]">
            <div className="flex place-items-center items-center justify-between text-cold-800">
                <Link
                    className="text-medium gap-medium flex place-items-center items-center text-left font-normal hover:text-primary-800"
                    href={build(['profile', item.principal.toText()])}
                >
                    <span>{username}</span>
                </Link>
            </div>
            <p className="text-small p-truncate-3 mb-auto font-light text-cold-800">{item.title}</p>
        </div>
    )
}

export default CustodianCard
