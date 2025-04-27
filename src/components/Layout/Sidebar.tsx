'use client'

import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import AcornColouredIcon from '@components/Assets/acorn_coloured.svg'
import AxiomACEIcon from '@components/Assets/axiom_ace.svg'
import FooterDecoration2 from '@components/Assets/footer_decoration2.svg'
import ForwardIcon from '@components/Assets/forward.svg'
import HypothesisIcon from '@components/Assets/hypothesis.svg'
import ProfileIcon from '@components/Assets/profile.svg'
import SchoolIcon from '@components/Assets/school.svg'
import GitHubIcon from '@components/Assets/social/GitHub.svg'
import InstagramIcon from '@components/Assets/social/Instagram.svg'
import RedditIcon from '@components/Assets/social/Reddit.svg'
import TelegramIcon from '@components/Assets/social/Telegram.svg'
import TikTokIcon from '@components/Assets/social/TikTok.svg'
import TwitterIcon from '@components/Assets/social/Twitter.svg'
import FieldInline from '@components/Pages/Feed/Fields/FieldInline'
import Link from '@components/Shared/Link'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import { useSpecificUserData } from '@hooks/useUserData'
import { formatTime } from '@libs/date'

const MAIN_ROUTES = [
    {
        name: 'Truth Feed',
        IconComponent: <HypothesisIcon className="p-extratiny w-6 stroke-2 md:w-7" />,
    },
    {
        name: 'ACE Dashboard',
        IconComponent: <AxiomACEIcon className="p-extratiny w-[22px] stroke-2 md:w-[26px]" />,
    },
    {
        name: 'Assets',
        IconComponent: <SchoolIcon className="p-extratiny w-[22px] stroke-2 md:w-[26px]" />,
    },
    {
        name: 'My Profile',
        IconComponent: <ProfileIcon className="p-extratiny w-5 stroke-2 md:w-6" />,
    },
]
const FIELD_LIMIT = 6

const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { principal } = useAuth()
    const fields = useSpecificUserData(principal ?? null, 'fields')
    const location = useLocation()

    const [opens, setOpens] = useState<boolean[]>([true, true])
    const [pattern, setPattern] = useState<string>('')
    const [limit, setLimit] = useState(FIELD_LIMIT)

    const activeFields = !fields
        ? []
        : pattern
          ? fields.filter((field) => field.name.toLowerCase().includes(pattern.toLowerCase()))
          : fields

    const handleOpen = (index: number) => {
        const newOpens = [...opens]
        newOpens[index] = !opens[index]
        setOpens(newOpens)
    }

    const [remainingTime, setRemainingTime] = useState<number>(
        new Date().setUTCHours(24, 0, 0, 0) - Date.now()
    )
    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1000) return 24 * 60 * 60 * 1000
                else return prev - 1000
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <div
                className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={onClose}
            />
            <aside
                className="pt-semilarge pt-medium gap-small fixed left-0 top-auto z-[999] flex h-[calc(100dvh-3rem)] w-0 flex-shrink-0 -translate-x-full flex-col overflow-y-auto text-nowrap border-r border-black/15 bg-white px-0 font-normal text-cold-800 transition-all duration-300 ease-in-out aria-expanded:w-[250px] aria-expanded:translate-x-0 md:static md:h-[calc(100dvh-3.5rem)] md:w-[250px] md:translate-x-0"
                aria-expanded={open}
            >
                {MAIN_ROUTES.map(({ name, IconComponent }) => (
                    <Accordion
                        key={name}
                        open={location.pathname.includes(siteMetadata.routes[name].url)}
                        className="px-medium"
                    >
                        <Link
                            className="py-normal px-medium gap-normal w-full rounded-lg font-normal hover:bg-cold-800 hover:text-white aria-checked:bg-cold-800 aria-checked:text-white"
                            size="small"
                            Icon={IconComponent}
                            href={`${siteMetadata.routes[name].url}${
                                {
                                    'ACE Dashboard': '?actor=Indicator',
                                    'My Profile': `/${principal?.toText()}`,
                                }?.[name] ?? ''
                            }`}
                            onNavigate={onClose}
                            aria-checked={
                                location.pathname.includes(siteMetadata.routes[name].url) &&
                                !Object.values(siteMetadata.routes[name].routes).some(
                                    (route: any) => location.pathname.includes(route.url)
                                )
                            }
                        >
                            {name}
                        </Link>
                        <AccordionBody className="py-0">
                            <div className="pt-extratiny py-small ml-8 flex w-fit flex-col text-nowrap font-normal">
                                {Object.entries(siteMetadata.routes[name].routes).map(
                                    ([subname, subdata]) => (
                                        <Link
                                            key={subname}
                                            href={(subdata as any).url}
                                            className="px-normal py-tiny flex rounded-lg hover:bg-cold-800 hover:text-white aria-checked:bg-cold-800 aria-checked:text-white"
                                            aria-checked={location.pathname.includes(
                                                (subdata as any).url
                                            )}
                                            size="small"
                                            onNavigate={onClose}
                                        >
                                            {subname}
                                        </Link>
                                    )
                                )}
                            </div>
                        </AccordionBody>
                    </Accordion>
                ))}
                <hr className="border-t border-black/15" />
                <Accordion
                    open={opens[0]}
                    icon={
                        <ForwardIcon
                            className={`mx-auto h-4 w-4 stroke-[2px] transition-transform ${opens[0] ? 'rotate-90' : ''}`}
                        />
                    }
                    className="px-medium"
                >
                    <AccordionHeader
                        onClick={() => {
                            handleOpen(0), setLimit(FIELD_LIMIT)
                        }}
                        className="px-medium rounded-lg border-b-0 py-0 hover:bg-cold-800/15"
                    >
                        <span className="py-normal text-normal font-normal text-cold-800">
                            MY FIELDS
                        </span>
                    </AccordionHeader>
                    <AccordionBody className="gap-normal flex flex-col items-center justify-center py-0">
                        <div className="px-medium pt-extratiny w-full">
                            <input
                                type="text"
                                className="input py-extratiny h-7 font-normal text-cold-800"
                                placeholder="Search"
                                onChange={(e) => setPattern(e.target.value)}
                                aria-selected={!!pattern}
                            />
                        </div>
                        <div className="gap-tiny px-medium flex w-full flex-col justify-start">
                            {activeFields.slice(0, limit).map((item, i) => (
                                <FieldInline key={i} item={item} className="mb-1" />
                            ))}
                            <button
                                className="text-tiny pre-underline rounded-lg text-cold-800 decoration-cold-800/50 hover:decoration-cold-800/100 disabled:hidden"
                                disabled={!activeFields || activeFields.length <= limit}
                                onClick={() => setLimit((prev) => prev + FIELD_LIMIT)}
                            >
                                Load more
                            </button>
                        </div>
                    </AccordionBody>
                </Accordion>
                <hr className="border-t border-black/15" />
                <Accordion
                    open={opens[1]}
                    icon={
                        <ForwardIcon
                            className={`mx-auto h-4 w-4 stroke-[2px] transition-transform ${opens[1] ? 'rotate-90' : ''}`}
                        />
                    }
                    className="px-medium"
                >
                    <AccordionHeader
                        onClick={() => handleOpen(1)}
                        className="px-medium rounded-lg border-b-0 py-0 hover:bg-cold-800/15"
                    >
                        <span className="py-normal text-normal font-normal text-cold-800">
                            SCHOOL
                        </span>
                    </AccordionHeader>
                    <AccordionBody className="gap-normal flex flex-col items-center justify-center py-0">
                        <div className="gap-tiny px-medium flex w-full flex-col justify-start">
                            {Object.entries(siteMetadata.routes['School'].routes).map(
                                ([subname, subdata]) => (
                                    <Link
                                        key={subname}
                                        href={(subdata as any).url}
                                        className="pre-underline text-tiny gap-normal mb-1 flex place-items-center items-center text-left font-normal decoration-cold-800/50 hover:decoration-cold-800/100"
                                        icon="forward"
                                        size="small"
                                        onNavigate={onClose}
                                    >
                                        {subname}
                                    </Link>
                                )
                            )}
                        </div>
                    </AccordionBody>
                </Accordion>
                <div className="gap-small mt-auto flex w-full flex-col">
                    <div className="px-normal flex items-end justify-between">
                        <AcornColouredIcon className="w-12 translate-y-7 md:w-16 md:translate-y-10" />
                        <span className="text-semilarge font-display font-bold leading-none">
                            Acorn Drop
                        </span>
                    </div>
                    <div className="gap-small py-normal flex w-full flex-col items-end bg-cold-900 font-display font-bold leading-none text-white">
                        <span className="text-semilarge mr-normal">
                            {`${Math.floor(Math.max(0, Math.floor(remainingTime / 1000)) / 3600)
                                .toString()
                                .padStart(2, '0')}:${Math.floor(
                                (Math.max(0, Math.floor(remainingTime / 1000)) % 3600) / 60
                            )
                                .toString()
                                .padStart(
                                    2,
                                    '0'
                                )}:${(Math.max(0, Math.floor(remainingTime / 1000)) % 60).toString().padStart(2, '0')}`}
                        </span>
                        <span className="text-extratiny w-full text-center font-normal">
                            12,000 Acorns drop every day on Axiom
                        </span>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
