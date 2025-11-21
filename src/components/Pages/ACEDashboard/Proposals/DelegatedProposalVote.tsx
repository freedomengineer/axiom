import { Principal } from '@dfinity/principal'
import { Menu, MenuHandler, MenuList } from '@material-tailwind/react'
import { useState } from 'react'

import Spinner from '@components/Primitives/Spinner'
import { Symbol } from '@components/Shared/Username'
import useAuth from '@hooks/useAuth'
import { Displayer } from '@hooks/useUsername'
import useVoteColors from '@hooks/useVoteColors'
import cn from '@libs/class'
import { EVote, VOTES } from '@utils/dashboard/proposal'
import { mapVoteTypeFromString } from '@utils/voteColors'
import { DDAO, DFacade } from 'shared/types/services'

const DelegatedProposalVote = ({
    vote,
    handleVote,
    loading,
    voters,
    className = '',
    customColor,
}: {
    vote: [Opt<DDAO.Delegable__2>, Displayer | null]
    handleVote: (to: Principal) => Promise<void>
    loading: boolean
    voters: [DFacade.Identifier[], DFacade.Identifier[], DFacade.Identifier[], DFacade.Identifier[]]
    className?: string
    customColor?: string
}) => {
    const { colors } = useVoteColors()
    const { principal } = useAuth()
    const [openDelegateeDropdown, setOpenDelegateeDropdown] = useState(false)

    const { Icon, bgColor, textColor, borderColor, name } = VOTES[EVote.Delegated]
    const isCurrentVote = vote[0] && 'Delegated' in vote[0]

    const voteType = mapVoteTypeFromString(EVote.Delegated)
    const finalCustomColor = customColor || colors[voteType]

    return (
        <Menu allowHover open={openDelegateeDropdown} handler={(t) => setOpenDelegateeDropdown(t)}>
            <MenuHandler>
                <button
                    className={cn(
                        'py-normal gap-small !text-tiny disabled:border-[var(--vote-color)]/0 col-span-2 flex transform items-center justify-center border-2 border-[var(--vote-color)] outline-none transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:bg-[var(--vote-color)] disabled:bg-opacity-50 aria-checked:pointer-events-none',
                        !isCurrentVote &&
                            `bg-[var(--vote-color)]/0 text-[var(--vote-color)] hover:bg-[var(--vote-color)] hover:text-white`,
                        isCurrentVote &&
                            `hover:bg-[var(--vote-color)]/75 hover:border-[var(--vote-color)]/0 bg-[var(--vote-color)] text-white`,
                        className
                    )}
                    style={{
                        ['--vote-color' as any]: finalCustomColor,
                    }}
                    disabled={loading}
                >
                    {loading ? (
                        <Spinner className="h-5 text-white/50 md:h-6" color="white" />
                    ) : (
                        <div className="gap-small flex items-center">
                            <Icon className="h-5 stroke-[1.5px] md:h-6" />
                            <span className={cn(isCurrentVote && 'hidden md:inline')}>{name}</span>
                            {isCurrentVote && (
                                <>
                                    <hr className="hidden h-6 w-[2px] bg-white md:block" />
                                    <div className="gap-small flex items-center">
                                        <Symbol
                                            capitalRaised={vote[1]?.capitalRaised.toString() ?? ''}
                                            className="mr-0 h-4 w-4"
                                        />
                                        <span>{vote[1]?.username}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </button>
            </MenuHandler>
            <MenuList className="w-fit px-0 py-0 outline-none">
                <div className="text-tiny px-medium py-normal flex w-full flex-col text-nowrap text-left font-display font-light">
                    {voters[0].map((voter, i) =>
                        principal && voter.principal.compareTo(principal) === 'eq' ? null : (
                            <div key={i} className="gap-tiny flex w-full items-center outline-none">
                                <div
                                    className={cn('h-5 w-1 md:h-6')}
                                    style={{
                                        backgroundColor: colors['positive'],
                                    }}
                                />
                                <button
                                    className="px-normal py-small w-full rounded-lg text-left hover:bg-cold-800/15"
                                    onClick={() => {
                                        setOpenDelegateeDropdown(false)
                                        handleVote(voter.principal)
                                    }}
                                >
                                    <div className="gap-small flex items-center">
                                        <Symbol
                                            capitalRaised={voter.capitalRaised.toString()}
                                            className="mr-0 h-4 w-4"
                                        />
                                        <span>{voter.username}</span>
                                    </div>
                                </button>
                            </div>
                        )
                    )}
                    {voters[1].map((voter, i) =>
                        principal && voter.principal.compareTo(principal) === 'eq' ? null : (
                            <div key={i} className="gap-tiny flex w-full items-center outline-none">
                                <div
                                    className={cn('h-5 w-1 md:h-6')}
                                    style={{
                                        backgroundColor: colors['negative'],
                                    }}
                                />
                                <button
                                    className="px-normal py-small w-full rounded-lg text-left hover:bg-cold-800/15"
                                    onClick={() => {
                                        setOpenDelegateeDropdown(false)
                                        handleVote(voter.principal)
                                    }}
                                >
                                    <div className="gap-small flex items-center">
                                        <Symbol
                                            capitalRaised={voter.capitalRaised.toString()}
                                            className="mr-0 h-4 w-4"
                                        />
                                        <span>{voter.username}</span>
                                    </div>
                                </button>
                            </div>
                        )
                    )}
                    {voters[2].map((voter, i) =>
                        principal && voter.principal.compareTo(principal) === 'eq' ? null : (
                            <div key={i} className="gap-tiny flex w-full items-center outline-none">
                                <div
                                    className={cn('h-5 w-1 md:h-6')}
                                    style={{
                                        backgroundColor: colors['delegated'],
                                    }}
                                />
                                <button
                                    className="px-normal py-small w-full rounded-lg text-left hover:bg-cold-800/15"
                                    onClick={() => {
                                        setOpenDelegateeDropdown(false)
                                        handleVote(voter.principal)
                                    }}
                                >
                                    <div className="gap-small flex items-center">
                                        <Symbol
                                            capitalRaised={voter.capitalRaised.toString()}
                                            className="mr-0 h-4 w-4"
                                        />
                                        <span>{voter.username}</span>
                                    </div>
                                </button>
                            </div>
                        )
                    )}
                    {voters[3].map((voter, i) =>
                        principal && voter.principal.compareTo(principal) === 'eq' ? null : (
                            <div key={i} className="gap-tiny flex w-full items-center outline-none">
                                <div className={cn('h-6 w-1 bg-cold-700/15 md:h-8')} />
                                <button
                                    className="px-normal py-small w-full rounded-lg text-left hover:bg-cold-800/15"
                                    onClick={() => {
                                        setOpenDelegateeDropdown(false)
                                        handleVote(voter.principal)
                                    }}
                                >
                                    <div className="gap-small flex items-center">
                                        <Symbol
                                            capitalRaised={voter.capitalRaised.toString()}
                                            className="mr-0 h-4 w-4"
                                        />
                                        <span>{voter.username}</span>
                                    </div>
                                </button>
                            </div>
                        )
                    )}
                </div>
            </MenuList>
        </Menu>
    )
}

export default DelegatedProposalVote
