import DownIcon from '@components/Assets/down.svg'
import Link from '@components/Shared/Link'
import { Symbol } from '@components/Shared/Username'
import useUsername from '@hooks/useUsername'
import cn from '@libs/class'
import { build } from '@libs/url'
import { DDAO } from 'shared/types/services'

const CustodianCard = ({
    item,
    isExpanded,
    onToggle,
}: {
    item: DDAO.SharableNominee
    isExpanded: boolean
    onToggle: () => void
}) => {
    const { username, capitalRaised } = useUsername(item.principal)

    return (
        <div className="flex w-full flex-col">
            <div className="p-medium flex flex-row items-center justify-between rounded-lg border border-cold-200 bg-cold-50 text-cold-800">
                <Link
                    className="text-medium gap-small flex place-items-center items-center text-left font-normal hover:text-primary-800"
                    href={build(['profile', item.principal.toText()])}
                >
                    <Symbol
                        capitalRaised={capitalRaised.toString()}
                        className="h-4 w-4 stroke-[3px]"
                    />
                    <span>{username}</span>
                </Link>
                <button onClick={onToggle} className="md:hidden" aria-label="Toggle details">
                    <DownIcon
                        className={cn(
                            'h-4 w-4 stroke-2 transition-transform duration-300',
                            isExpanded && 'rotate-180'
                        )}
                    />
                </button>
            </div>

            <div
                className={cn(
                    'mt-1 w-full overflow-hidden transition-all duration-300 ease-in-out md:max-h-max md:opacity-100',
                    isExpanded ? 'max-h-max opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="speech-bubble p-medium relative mt-2 w-full rounded-lg border border-cold-200 bg-white">
                    <div
                        className="absolute -top-[10px] left-[30px] h-0 w-0"
                        style={{
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderBottom: '10px solid #cbd5e1',
                        }}
                    ></div>
                    <div
                        className="absolute -top-[8px] left-[32px] h-0 w-0"
                        style={{
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: '8px solid white',
                        }}
                    ></div>
                    <p className="text-small font-light text-cold-800">{item.title}</p>
                </div>
            </div>
        </div>
    )
}

export default CustodianCard
