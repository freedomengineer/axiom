'use client'

import { Principal } from '@dfinity/principal'
import {
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import TicketIcon from '@components/Assets/ticket.svg'
import Spinner from '@components/Primitives/Spinner'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import TableWrapper, {
    SortDirection,
    SortType,
    TableWrapperHandle,
} from '@components/Shared/TableWrapper'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { getUsername } from '@hooks/useUsername'
import cn from '@libs/class'
import { convertDate } from '@libs/date'
import { promise } from '@libs/toastify'
import { MILLIS_IN_A_DAY, NANO_TO_MILLI } from 'shared/constants'
import { DDAO } from 'shared/types/services'
import e8s from 'shared/utils/e8s'
import { DAO } from 'shared/utils/services'
import { Unwrap } from 'shared/utils/typings'

import EnterElection from './EnterElection'
import ExitElection from './ExitElection'
import UpdateTitle from './UpdateTitle'

export const SelectionContext = createContext<{
    newBallots: Set<string> | undefined
    maxBallots: number
    toggleSelection: (id: string) => void
}>({
    newBallots: undefined,
    maxBallots: 0,
    toggleSelection: () => {},
})
export const useSelection = () => useContext(SelectionContext)

type Row = [number, string, string, bigint, bigint, boolean]

const NomineesRow = memo(
    ({ cells, id, isLastRow }: { cells: Row; id: string; isLastRow: boolean }) => {
        const { newBallots, maxBallots, toggleSelection } = useSelection()
        const isSelected = newBallots?.has(id)

        return (
            <tr className="group hover:bg-cold-50">
                <td
                    className={cn(
                        '!text-tiny py-small px-normal group relative text-nowrap bg-cold-50 text-left font-semibold text-cold-600',
                        'border-b border-r border-cold-300',
                        isLastRow && 'border-b-0'
                    )}
                >
                    <Link
                        href={`/profile/${id}`}
                        color="cold-600"
                        className="pre-underline !text-tiny group z-10 w-full justify-start decoration-cold-600/50 hover:decoration-cold-600/100"
                        icon="forward"
                        size="small"
                        openInNewTab
                    >
                        {cells[1]}
                    </Link>
                </td>
                <td
                    className={cn(
                        '!text-tiny py-small px-normal text-cold-600',
                        'border-b border-r border-cold-300',
                        isLastRow && 'border-b-0'
                    )}
                >
                    <span>{cells[2]}</span>
                </td>
                <td
                    className={cn(
                        '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                        'border-b border-r border-cold-300',
                        isLastRow && 'border-b-0'
                    )}
                >
                    {cells[3].toString()}
                </td>
                <td
                    className={cn(
                        '!text-tiny py-small px-normal text-nowrap font-semibold text-cold-600',
                        'border-b border-r border-cold-300',
                        isLastRow && 'border-b-0'
                    )}
                >
                    {e8s.toString(cells[4], 4)}
                </td>
                <td
                    className={cn(
                        '!text-tiny py-small px-normal text-nowrap text-cold-600',
                        'border-b border-cold-300',
                        isLastRow && 'border-b-0'
                    )}
                >
                    <button
                        onClick={() => toggleSelection(id)}
                        className="flex h-full w-full items-center justify-center disabled:opacity-25"
                        disabled={
                            isSelected === undefined ||
                            (isSelected !== true && newBallots?.size === maxBallots)
                        }
                    >
                        <TicketIcon
                            className={cn(
                                'h-6 w-6 text-cold-800 md:h-7 md:w-7',
                                isSelected === true || (isSelected === undefined && cells[5])
                                    ? 'fill-primary-400 text-primary-800'
                                    : 'fill-white'
                            )}
                        />
                    </button>
                </td>
            </tr>
        )
    }
)

const NomineeLayout = ({ items, sort }: { items: DDAO.SharableNominee[]; sort?: SortType }) => {
    const [displayItems, setDisplayItems] = useState<Row[]>([])
    const { newBallots } = useSelection()

    useEffect(() => {
        Promise.all(
            items.map(
                (item, i) =>
                    getUsername(item.principal).then(({ username }) => [
                        i,
                        username,
                        item.title,
                        item.ballots[0],
                        item.ballots[1],
                        !!Unwrap(item.callerBallot),
                    ]) as Promise<Row>
            )
        ).then(setDisplayItems)
    }, [items])

    useEffect(() => {
        const compare = [
            (a: Row, b: Row) => a[1].localeCompare(b[1]),
            (a: Row, b: Row) => a[2].localeCompare(b[2]),
            (a: Row, b: Row) => Number(a[3] - b[3]),
            (a: Row, b: Row) => Number(a[4] - b[4]),
            (a: Row, b: Row) =>
                newBallots === undefined
                    ? Number(a[5]) - Number(b[5])
                    : Number(newBallots.has(items[a[0]].principal.toText())) -
                      Number(newBallots.has(items[b[0]].principal.toText())),
        ]

        switch (sort?.direction) {
            case SortDirection.ASC:
                setDisplayItems((prev) => [...prev].sort((a, b) => compare[sort.column](a, b)))
                break
            case SortDirection.DESC:
                setDisplayItems((prev) => [...prev].sort((a, b) => compare[sort.column](b, a)))
                break
        }
    }, [sort, newBallots, items])

    return (
        <tbody>
            {displayItems.map((item, i) => {
                const id = items[item[0]].principal.toText()
                return (
                    <NomineesRow
                        key={id}
                        cells={item}
                        id={id}
                        isLastRow={i === displayItems.length - 1}
                    />
                )
            })}
        </tbody>
    )
}

enum EPopup {
    EnterElection,
    ExitElection,
    UpdateTitle,
}
enum ELoading {
    ConfirmSelection,
    ExitElection,
}
const NomineesTable = () => {
    const tableRef = useRef<TableWrapperHandle>(null)
    const { agent, principal } = useAuth()
    const configs = useConfigs('DAO')

    const [userData, setUserData] = useState<DDAO.Sharable__1>()
    const [newBallots, setNewBallots] = useState<Set<string>>()
    const [nominee, setNominee] = useState<DDAO.SharableNominee>()
    const [open, setOpen] = useState<EPopup>()
    const [loading, setLoading] = useState<ELoading>()

    useEffect(() => {
        Promise.all([
            principal &&
                DAO.call()
                    .getUser(principal!)
                    .then(setUserData)
                    .catch(() => {}),
            principal &&
                DAO.call()
                    .getNominee(principal!)
                    .then(setNominee)
                    .catch(() => {}),
        ])
    }, [])

    const handleConfirmSelection = async () => {
        if (!newBallots) return

        setLoading(ELoading.ConfirmSelection)
        const arr = Array.from(newBallots)

        await promise(
            DAO.call(agent).castBallots(arr.map((p) => Principal.fromText(p))),
            'Casting ballots',
            'Ballots casted successfully!'
        )
        await DAO.call()
            .getUser(principal!)
            .then(setUserData)
            .catch(() => {})
        tableRef.current?.refresh()

        setNewBallots(undefined)
        setLoading(undefined)
    }
    const toggleSelection = useCallback(
        (id: string) => {
            setNewBallots((prev) => {
                if (!prev || (prev.size === configs?.['MAX_BALLOTS'][1] && !prev.has(id)))
                    return prev
                const updated = new Set(prev)
                if (updated.has(id)) updated.delete(id)
                else updated.add(id)
                return updated
            })
        },
        [configs]
    )
    const selectionContextValue = useMemo(
        () => ({
            newBallots,
            maxBallots: Number(configs?.['MAX_BALLOTS'][1] ?? 0n),
            toggleSelection,
        }),
        [newBallots, configs, toggleSelection]
    )

    const handleExitElection = async () => {
        setLoading(ELoading.ExitElection)
        await promise(
            DAO.call(agent).leaveElection(),
            'Exiting election',
            'Exited election successfully!'
        )
        setNominee(undefined)
        tableRef.current?.refresh()

        setLoading(undefined)
        setOpen(undefined)
    }

    const ballotsExpiryDate =
        configs && userData
            ? Number(
                  ((configs?.['BALLOT_AVAILABILITY_DURATION'][1] as bigint) ?? 0n) *
                      MILLIS_IN_A_DAY +
                      userData.lastUpdateBallot / NANO_TO_MILLI
              )
            : 0

    return (
        <SelectionContext.Provider value={selectionContextValue}>
            <Popup
                open={open === EPopup.EnterElection}
                onClose={() => setOpen(undefined)}
                title="Enter Election Form"
                className="w-full md:w-2/5"
            >
                <EnterElection
                    onSubmit={() => {
                        DAO.call()
                            .getNominee(principal!)
                            .then(setNominee)
                            .catch(() => {})
                        tableRef.current?.refresh()
                        setOpen(undefined)
                    }}
                />
            </Popup>
            <Popup
                open={open === EPopup.UpdateTitle}
                onClose={() => setOpen(undefined)}
                title="Update Title Form"
                className="w-full md:w-2/5"
            >
                <UpdateTitle
                    onSubmit={() => {
                        tableRef.current?.refresh()
                        setOpen(undefined)
                    }}
                />
            </Popup>
            <Popup
                open={open === EPopup.ExitElection}
                onClose={() => setOpen(undefined)}
                title="Exit Election Confirmation"
                className="w-full md:w-2/5"
            >
                <ExitElection
                    title={nominee?.title}
                    loading={loading === ELoading.ExitElection}
                    handleExitElection={handleExitElection}
                />
            </Popup>
            {userData && (
                <div className="gap-small flex w-full flex-col items-center justify-between md:flex-row">
                    <div className="gap-small flex w-full md:w-fit">
                        {nominee ? (
                            <>
                                <button
                                    className="button h-full w-full bg-cold-800 md:w-36"
                                    onClick={() => setOpen(EPopup.UpdateTitle)}
                                >
                                    Update title
                                </button>
                                <button
                                    className="button h-full w-full md:w-36"
                                    onClick={() => setOpen(EPopup.ExitElection)}
                                >
                                    Exit election
                                </button>
                            </>
                        ) : (
                            <button
                                className="button h-full w-full md:w-[294px]"
                                onClick={() => setOpen(EPopup.EnterElection)}
                            >
                                Enter election
                            </button>
                        )}
                    </div>
                    <div className="gap-small flex w-full md:w-fit">
                        {newBallots ? (
                            <>
                                <button
                                    className="button h-full w-full bg-cold-800 md:w-36"
                                    onClick={() => setNewBallots(undefined)}
                                >
                                    Exit selection
                                </button>
                                <button
                                    className="button h-full w-full md:w-36"
                                    onClick={handleConfirmSelection}
                                    disabled={loading === ELoading.ConfirmSelection}
                                >
                                    {loading === ELoading.ConfirmSelection ? (
                                        <Spinner className="mx-auto h-5 w-5" color="white" />
                                    ) : (
                                        `Cast ballots (${newBallots.size}/${configs?.['MAX_BALLOTS'][1]})`
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                className="button h-full w-full md:w-[294px]"
                                onClick={() =>
                                    setNewBallots(
                                        new Set(userData!.ballots.map(([p]) => p.toText()))
                                    )
                                }
                            >
                                Update ballots (
                                {Date.now() < ballotsExpiryDate ? 'expires in ' : 'expired since '}{' '}
                                {convertDate({ milli: ballotsExpiryDate })})
                            </button>
                        )}
                    </div>
                </div>
            )}
            <TableWrapper
                ref={tableRef}
                LayoutComponent={NomineeLayout as any}
                query={DAO.call(agent, true).getNomineesPagination}
                name="nominee"
                hardSort={{ order: 'descending', by: 'token' }}
                hardSortType={{ column: 3, direction: SortDirection.DESC }}
                size={10n}
                columns={[
                    { title: 'Username', sortable: true },
                    { title: 'Title', sortable: true, className: 'min-w-[300px]' },
                    { title: 'Total Ballots', sortable: true },
                    { title: 'Total Value', sortable: true },
                    { title: 'Action', sortable: true },
                ]}
            />
        </SelectionContext.Provider>
    )
}

export default NomineesTable
