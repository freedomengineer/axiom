'use client'

import { Identity } from '@dfinity/agent'
import {
    Menu,
    MenuHandler,
    MenuList,
    Popover,
    PopoverContent,
    PopoverHandler,
} from '@material-tailwind/react'
import { useEffect, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import ClaimIcon from '@components/Assets/claim.svg'
import CloseIcon from '@components/Assets/close.svg'
import DefaultAvatarIcon from '@components/Assets/default_avatar.svg'
import EditIcon from '@components/Assets/edit.svg'
import IcpIcon from '@components/Assets/icp.svg'
import IcpColouredIcon from '@components/Assets/icp_coloured.svg'
import LinkIcon from '@components/Assets/link.svg'
import LoginIcon from '@components/Assets/login.svg'
import ExtendedLogoIcon from '@components/Assets/logo/Logo_LandscapeLEAVES-FULLCOLOUR.svg'
import MiniLogoIcon from '@components/Assets/logo/Logo_MarkACORN-FULLCOLOUR.svg'
import LogoutIcon from '@components/Assets/logout.svg'
import MenuIcon from '@components/Assets/menu.svg'
import NotificationIcon from '@components/Assets/notification.svg'
import SearchIcon from '@components/Assets/search.svg'
import PostHypothesis from '@components/Pages/Feed/Hypotheses/PostHypothesis'
import MyAssetsLayout from '@components/Pages/Profile/MyAssets/MyAssetsLayout'
import Transfer from '@components/Pages/Profile/MyAssets/Transfer'
import Link from '@components/Shared/Link'
import Notifications from '@components/Shared/Notifications'
import Popup from '@components/Shared/Popup'
import QRCode from '@components/Shared/QRCode'
import useAuth from '@hooks/useAuth'
import { deleteAllConfigsCache } from '@hooks/useConfigs'
import useNotification, {
    deleteAllNotificationsCache,
    useNotificationPoller,
} from '@hooks/useNotification'
import { deleteAllPackagesCache } from '@hooks/usePackages'
import { deleteAllStatusCache } from '@hooks/useStatus'
import useUserData from '@hooks/useUserData'
import { deleteAllUsernamesCache } from '@hooks/useUsername'
import cn from '@libs/class'
import { formatCanisterDateTime } from '@libs/date'
import { build, buildBlobImage } from '@libs/url'
import { deriveIdentity } from 'shared/utils/agent'
import { Unwrap } from 'shared/utils/typings'

const TimeDisplay = () => {
    const [now, setNow] = useState<number>(Date.now())

    useEffect(() => {
        const interval = setInterval(() => {
            setNow((prev) => prev + 1000)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <span className="px-normal py-small rounded-lg hover:text-cold-950 hover:outline-none">
            {formatCanisterDateTime({ milli: now }, true)}
        </span>
    )
}

enum EPopup {
    Login,
    Notification,
    Post,
    Claim,
    Search,
    Affiliate,
    TransferICP,
    TransferACORN,
}

const Header = ({
    openSidebar,
    setOpenSidebar,
}: Readonly<{ openSidebar: boolean; setOpenSidebar: (open: boolean) => void }>) => {
    const { isAuthenticated, principal, agent, user, setPemIdentity, login, logout } = useAuth()
    const { unreadUserCount, unreadSystemCount } = useNotification()
    const userData = useUserData(principal ?? null)
    useNotificationPoller(agent ?? null, 10)

    const [openMenu, setOpenMenu] = useState<{ [key: string]: string | null }>({})
    const [open, setOpen] = useState<EPopup | null>(null)

    const [q, setQ] = useState<string>('')
    const [pem, setPem] = useState<{ input: string; identity: Identity | null }>({
        input: '',
        identity: null,
    })

    const handleMainMenu = (title0: string, isOpen: boolean) => {
        setOpenMenu((prev) => ({ ...prev, [title0]: isOpen ? title0 : null }))
    }

    const claimable =
        (userData?.escrowClaimable ?? 0n) +
        (userData?.affiliateEarning?.balance ?? 0n) +
        (userData?.axiomsEarning.balance ?? 0n) +
        (userData?.daoEarning[0].balance ?? 0n) +
        (userData?.daoEarning[1].balance ?? 0n)

    return (
        <header className="sticky top-0 z-[9999] flex h-[3rem] items-center border-b border-black/15 bg-white md:h-[3.5rem]">
            <div className="py-medium px-semilarge mx-auto flex w-full items-center justify-between">
                <div className="gap-small flex items-center">
                    <button
                        onClick={() => setOpenSidebar(!openSidebar)}
                        className="block md:hidden"
                    >
                        <MenuIcon
                            className="h-3.5 w-8 stroke-[1.5px] text-cold-800 aria-hidden:hidden"
                            aria-hidden={openSidebar}
                        />
                        <CloseIcon
                            className="h-3.5 w-8 stroke-[1.5px] text-cold-800 aria-hidden:hidden"
                            aria-hidden={!openSidebar}
                        />
                    </button>
                    <Link href="/">
                        <ExtendedLogoIcon className="hidden h-[1.75rem] md:block md:h-[2.25rem]" />
                        <MiniLogoIcon className="block h-[1.75rem] md:hidden md:h-[2.25rem]" />
                    </Link>
                </div>
                <div className="gap-semilarge flex w-full items-center justify-end">
                    <div className="gap-semilarge ml-semilarge relative flex w-full items-center md:w-1/2">
                        <input
                            type="text"
                            placeholder="Search"
                            onFocus={() => setOpen(EPopup.Search)}
                            onChange={(e) => setQ(e.target.value)}
                            onBlur={() => setTimeout(() => setOpen(null), 150)}
                            aria-selected={open === EPopup.Search && !!q}
                            className="text-tiny px-medium peer h-[2rem] w-full rounded-lg border border-black/10 font-display font-normal focus:border-primary-700 focus:outline-none md:h-[2.25rem]"
                        />
                        <SearchIcon className="right-medium peer absolute h-5 w-5 stroke-[1.5px] text-black/10 peer-aria-selected:text-primary-700" />
                        {open === EPopup.Search && q && (
                            <div className="fixed left-1/2 top-[3.25rem] mx-auto w-[90%] -translate-x-1/2 transform rounded-lg border border-black/10 bg-white shadow-lg md:absolute md:left-0 md:top-12 md:w-full md:translate-x-0">
                                <div className="px-medium py-small flex flex-col">
                                    <span className="text-normal font-display font-semibold text-primary-700">
                                        Feed
                                    </span>
                                    <Link
                                        className="text-tiny px-normal py-small rounded-lg font-light hover:bg-black/5"
                                        href={build(['search', 'hypotheses'], { q })}
                                    >
                                        {`Search "${q}" in Hypotheses`}
                                    </Link>
                                    <Link
                                        className="text-tiny px-normal py-small rounded-lg font-light hover:bg-black/5"
                                        href={build(['search', 'fields'], { q })}
                                    >
                                        {`Search "${q}" in Fields`}
                                    </Link>
                                    <Link
                                        className="text-tiny px-normal py-small rounded-lg font-light hover:bg-black/5"
                                        href={build(['search', 'evidences'], { q })}
                                    >
                                        {`Search "${q}" in Evidences`}
                                    </Link>
                                    <hr className="my-tiny border-black/10" />
                                    <span className="text-normal font-display font-semibold text-primary-700">
                                        Axiom ACE
                                    </span>
                                    <Link
                                        className="text-tiny px-normal py-small rounded-lg font-light hover:bg-black/5"
                                        href={build(['search', 'proposals'], { q })}
                                    >
                                        {`Search "${q}" in Proposals`}
                                    </Link>
                                    <Link
                                        className="text-tiny px-normal py-small rounded-lg font-light hover:bg-black/5"
                                        href={build(['search', 'configs'], { q })}
                                    >
                                        {`Search "${q}" in Configs`}
                                    </Link>
                                    <hr className="my-tiny border-black/10" />
                                    <span className="text-normal font-display font-semibold text-primary-700">
                                        Users
                                    </span>
                                    <Link
                                        className="text-tiny px-normal py-small rounded-lg font-light hover:bg-black/5"
                                        href={build(['search', 'users'], { q })}
                                    >
                                        {`Search "${q}" in Users`}
                                    </Link>
                                    <hr className="my-tiny border-black/10" />
                                    <Link
                                        className="text-tiny px-normal py-small rounded-lg font-light hover:bg-black/5"
                                        href={build(['search'], { q })}
                                    >
                                        {`Search All`}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        className="md:px-medium gap-small flex h-[1.75rem] w-[1.75rem] items-center rounded-full border-0 border-black/10 px-0 text-primary-700 hover:bg-black/5 disabled:pointer-events-none disabled:opacity-50 md:h-[2.25rem] md:w-auto md:border"
                        onClick={() => setOpen(EPopup.Post)}
                        disabled={!isAuthenticated || !user}
                    >
                        <span className="text-tiny hidden font-display font-normal md:block">
                            Post
                        </span>
                        <EditIcon className="h-5 w-5 stroke-[1.5px]" />
                    </button>
                    <button
                        className="md:px-medium gap-small relative flex h-[1.75rem] w-[1.75rem] items-center rounded-full border-0 border-black/10 px-0 text-primary-700 hover:bg-black/5 disabled:pointer-events-none disabled:opacity-50 md:h-[2.25rem] md:w-auto md:border"
                        onClick={() => setOpen(EPopup.Claim)}
                        disabled={!isAuthenticated || !user}
                    >
                        <span className="text-tiny hidden font-display font-normal md:block">
                            Claim
                        </span>
                        <ClaimIcon className="h-5 w-5 stroke-[1.5px]" />
                        <div
                            className="absolute -top-[1.5rem] right-[2rem] z-50 aria-hidden:hidden md:-top-[1.25rem] md:right-[2.25rem]"
                            aria-hidden={claimable === 0n}
                        >
                            <div className="live-dot"></div>
                            <div className="live-animated"></div>
                        </div>
                    </button>
                    <Popover
                        open={openMenu['Notification'] === 'Notification'}
                        handler={(t) => handleMainMenu('Notification', t)}
                        animate={{ mount: { scale: 1, y: 0 }, unmount: { scale: 1, y: 20 } }}
                    >
                        <PopoverHandler
                            onMouseEnter={() => setOpenMenu({ Notification: 'Notification' })}
                        >
                            <button
                                className="md:px-medium gap-small relative flex h-[1.75rem] w-[1.75rem] items-center rounded-full border-0 border-black/10 px-0 text-primary-700 outline-none hover:bg-black/5 disabled:pointer-events-none disabled:opacity-50 md:h-[2.25rem] md:w-auto md:border"
                                disabled={!isAuthenticated || !user}
                            >
                                <span className="text-tiny hidden font-display font-normal md:block">
                                    Noti
                                </span>
                                <NotificationIcon className="h-5 w-5 stroke-[1.5px]" />
                                <div
                                    className="absolute -top-[1.5rem] right-[2rem] z-50 aria-hidden:hidden md:-top-[1.25rem] md:right-[2.25rem]"
                                    aria-hidden={unreadUserCount + unreadSystemCount === 0}
                                >
                                    <div className="live-dot"></div>
                                    <div className="live-animated"></div>
                                </div>
                            </button>
                        </PopoverHandler>
                        <PopoverContent
                            onMouseEnter={() => setOpenMenu({ Notification: 'Notification' })}
                            className="relative w-full border-none bg-transparent p-0 shadow-none outline-none md:max-w-[40rem]"
                        >
                            <div className="p-medium mx-auto w-[90%] max-w-[40rem] rounded-lg border border-cold-200 bg-white shadow-lg outline-none duration-100 ease-in-out">
                                <Notifications />
                            </div>
                        </PopoverContent>
                    </Popover>
                    {!isAuthenticated ? (
                        <button
                            className="md:px-medium gap-small flex h-[1.75rem] w-[1.75rem] items-center rounded-full border-0 border-black/10 px-0 text-primary-700 hover:bg-black/5 md:h-[2.25rem] md:w-auto md:border"
                            onClick={() => setOpen(EPopup.Login)}
                        >
                            <span className="text-tiny hidden text-nowrap font-display font-normal md:block">
                                Log in
                            </span>
                            <LoginIcon className="h-5 w-5 stroke-[1.5px]" />
                        </button>
                    ) : (
                        <Popover
                            open={openMenu['User'] === 'User'}
                            handler={(t) => handleMainMenu('User', t)}
                            animate={{ mount: { scale: 1, y: 0 }, unmount: { scale: 1, y: 20 } }}
                        >
                            <PopoverHandler onMouseEnter={() => setOpenMenu({ User: 'User' })}>
                                <button className="md:px-medium gap-small flex h-[1.75rem] w-[1.75rem] items-center rounded-full border-0 border-black/10 px-0 text-primary-700 outline-none hover:bg-black/5 md:h-[2.25rem] md:w-auto md:border">
                                    {user ? (
                                        <>
                                            <span className="text-tiny hidden text-nowrap font-display font-normal md:block">
                                                {user.username}
                                            </span>
                                            {Unwrap(user.avatar) ? (
                                                <img
                                                    src={buildBlobImage(
                                                        Unwrap(user.avatar)!.blob as Uint8Array
                                                    )}
                                                    alt="avatar"
                                                    className="h-5 w-5 rounded-full object-cover ring-2 ring-primary-700/75 ring-offset-0"
                                                />
                                            ) : (
                                                <DefaultAvatarIcon className="h-5 w-5" />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-tiny hidden text-nowrap font-display font-normal md:block">
                                                {principal?.toText().slice(0, 21).concat('...')}
                                            </span>
                                            <LogoutIcon className="h-5 w-5 stroke-[1.5px]" />
                                        </>
                                    )}
                                </button>
                            </PopoverHandler>
                            <PopoverContent
                                onMouseEnter={() => setOpenMenu({ User: 'User' })}
                                className="relative w-full border-none bg-transparent p-0 shadow-none outline-none md:max-w-[20rem]"
                            >
                                <div className="p-medium ml-auto mr-4 flex w-[90%] max-w-[20rem] flex-col rounded-lg border border-cold-200 bg-white shadow-lg outline-none md:mr-8">
                                    <TimeDisplay />
                                    <hr className="py-small border-black/10 hover:outline-none" />
                                    <button
                                        className="px-normal py-small rounded-lg text-left hover:bg-cold-500/25 hover:text-cold-950 hover:outline-none"
                                        onClick={() => setOpen(EPopup.Affiliate)}
                                    >
                                        My Referral Link
                                    </button>
                                    <button
                                        className="px-normal py-small rounded-lg text-left hover:bg-cold-500/25 hover:text-cold-950 hover:outline-none"
                                        onClick={() => setOpen(EPopup.TransferACORN)}
                                    >
                                        Transfer ACORN
                                    </button>
                                    <button
                                        className="px-normal py-small rounded-lg text-left hover:bg-cold-500/25 hover:text-cold-950 hover:outline-none"
                                        onClick={() => setOpen(EPopup.TransferICP)}
                                    >
                                        Transfer ICP
                                    </button>
                                    <hr className="py-small border-black/10 hover:outline-none" />
                                    <button
                                        className="py-small rounded-lg font-medium text-red-800 hover:bg-red-800 hover:text-white hover:outline-none"
                                        onClick={() => (
                                            deleteAllConfigsCache(),
                                            deleteAllPackagesCache(),
                                            deleteAllStatusCache(),
                                            deleteAllUsernamesCache(),
                                            deleteAllNotificationsCache(),
                                            localStorage.clear(),
                                            setOpenMenu({})
                                        )}
                                    >
                                        Clean up all cache
                                    </button>
                                    <button
                                        className="py-small rounded-lg font-medium text-red-800 hover:bg-red-800 hover:text-white hover:outline-none"
                                        onClick={logout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
            {isAuthenticated && (
                <Popup
                    open={open === EPopup.Affiliate}
                    onClose={() => setOpen(null)}
                    title="My Referral Link"
                    Icon={<LinkIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                    className="w-full md:w-2/5"
                >
                    <QRCode
                        arr={[
                            {
                                name: 'Referral Link',
                                content: `${window.location.origin}/?ref=${principal?.toText()}`,
                            },
                        ]}
                    />
                </Popup>
            )}
            {isAuthenticated && (
                <Popup
                    open={open === EPopup.TransferICP}
                    onClose={() => setOpen(null)}
                    title="Transfer ICP"
                    Icon={<IcpIcon className="h-6 w-6 fill-current stroke-0 md:h-7 md:w-7" />}
                    className="w-full md:w-2/5"
                >
                    <Transfer token="ICP" />
                </Popup>
            )}
            {isAuthenticated && (
                <Popup
                    open={open === EPopup.TransferACORN}
                    onClose={() => setOpen(null)}
                    title="Transfer ACORN"
                    Icon={<AcornIcon className="h-6 w-6 md:h-7 md:w-7" />}
                    className="w-full md:w-2/5"
                >
                    <Transfer token="ACORN" />
                </Popup>
            )}
            {principal && user && (
                <Popup
                    open={open === EPopup.Post}
                    onClose={() => setOpen(null)}
                    title="Post Hypothesis"
                    href={build(['feed', 'post'])}
                    Icon={<EditIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                    className="w-full md:w-4/5"
                >
                    <PostHypothesis onSubmit={() => setOpen(null)} isPopup={true} />
                </Popup>
            )}
            {principal && user && (
                <Popup
                    open={open === EPopup.Claim}
                    onClose={() => setOpen(null)}
                    title="My Assets"
                    Icon={<ClaimIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                    className="w-full md:w-4/5"
                    href={build(['profile', 'my_assets'])}
                >
                    <MyAssetsLayout />
                </Popup>
            )}
            {/* {principal && user && (
                <Popup
                    open={open === EPopup.Notification}
                    onClose={() => setOpen(null)}
                    title="Notifications"
                    Icon={<NotificationIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                    className="w-full md:w-4/5"
                    href={build(['profile', 'my_notifications'])}
                >
                    <Notifications />
                </Popup>
            )} */}
            <Popup
                open={open === EPopup.Login}
                onClose={() => {
                    setOpen(null), setPem('')
                }}
                title="Login To Axiom"
                Icon={<LoginIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                className="w-full md:w-auto"
            >
                <div className="gap-medium flex flex-col">
                    <button
                        onClick={login}
                        className={cn(
                            'px-medium !text-normal gap-normal py-normal flex transform items-center justify-center text-nowrap rounded-md bg-gradient-to-r from-blue-900 to-purple-800 font-normal text-white transition-all duration-200 ease-in-out hover:bg-opacity-80 hover:from-blue-800 hover:to-purple-600 disabled:pointer-events-none disabled:opacity-50'
                        )}
                    >
                        Log in with Internet Identity <IcpColouredIcon className="h-5 md:h-6" />
                    </button>
                    <span className="text-tiny text-center text-black/50">
                        Or import your PEM key to log in (not recommended, only for advanced users)
                    </span>
                    <input
                        placeholder="Paste your PEM key here"
                        value={pem.identity ? 'Identity imported!' : pem.input}
                        onChange={(e) => {
                            try {
                                const identity = deriveIdentity(e.target.value)
                                setPem({ input: e.target.value, identity })
                                setPemIdentity(identity)
                            } catch {
                                setPem({ input: e.target.value, identity: null })
                            }
                        }}
                        aria-selected={!!pem.input}
                        type={pem.identity ? 'text' : 'password'}
                        disabled={pem.identity !== null}
                        className="px-medium py-normal !text-small rounded-md border-2 border-cold-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cold-600 disabled:pointer-events-none disabled:bg-cold-900/10 aria-selected:border-cold-400"
                    />
                </div>
            </Popup>
        </header>
    )
}

export default Header
