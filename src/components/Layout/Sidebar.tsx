'use client'

import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import AcornColouredIcon from '@components/Assets/acorn_coloured.svg'
import AxiomACEIcon from '@components/Assets/axiom_ace.svg'
import ForwardIcon from '@components/Assets/forward.svg'
import HypothesisIcon from '@components/Assets/hypothesis.svg'
import ProfileIcon from '@components/Assets/profile.svg'
import FieldInline from '@components/Pages/Feed/Fields/FieldInline'
import Link from '@components/Shared/Link'
import siteMetadata from '@data/siteMetadata.json'
import useAuth from '@hooks/useAuth'
import useLocalStorage from '@hooks/useLocalStorage'
import { useSpecificUserData } from '@hooks/useUserData'

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
        name: 'My Profile',
        IconComponent: <ProfileIcon className="p-extratiny w-5 stroke-2 md:w-6" />,
    },
]
const FIELD_LIMIT = 6

const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { principal } = useAuth()
    const fields = useSpecificUserData(principal ?? null, 'fields')
    const location = useLocation()

    const [toggle1, setToggle1] = useLocalStorage('sideBarToggle1')
    const [toggle2, setToggle2] = useLocalStorage('sideBarToggle2')
    const [toggle3, setToggle3] = useLocalStorage('sideBarToggle3')
    const [pattern, setPattern] = useState<string>('')
    const [limit, setLimit] = useState(FIELD_LIMIT)

    const targetTime = new Date().setUTCHours(24, 0, 0, 0)
    const [remainingTime, setRemainingTime] = useState<number>(targetTime - Date.now())
    useEffect(() => {
        const interval = setInterval(() => {
            const newRemaining = targetTime - Date.now()
            setRemainingTime(newRemaining > 0 ? newRemaining : 0)
        }, 1000)

        return () => clearInterval(interval)
    }, [targetTime])

    const activeFields = !fields
        ? []
        : pattern
          ? fields.filter((field) => field.name.toLowerCase().includes(pattern.toLowerCase()))
          : fields

    const handleOpen = (index: number) => {
        switch (index) {
            case 0:
                setToggle1(!toggle1)
                break
            case 1:
                setToggle2(!toggle2)
                break
            case 2:
                setToggle3(!toggle3)
                break
        }
    }

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
                                            href={`${(subdata as any).url}${
                                                {
                                                    Leaderboard: '?key=PoweredVoters',
                                                }?.[subname] ?? ''
                                            }`}
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
                    open={toggle1}
                    icon={
                        <ForwardIcon
                            className={`mx-auto h-4 w-4 stroke-[2px] transition-transform ${toggle1 ? 'rotate-90' : ''}`}
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
                        <span className="py-normal text-small font-normal text-cold-800">
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
                <hr className="border-black/7 border-t" />
                <Accordion
                    open={toggle2}
                    icon={
                        <ForwardIcon
                            className={`mx-auto h-4 w-4 stroke-[2px] transition-transform ${toggle2 ? 'rotate-90' : ''}`}
                        />
                    }
                    className="px-medium"
                >
                    <AccordionHeader
                        onClick={() => handleOpen(1)}
                        className="px-medium rounded-lg border-b-0 py-0 hover:bg-cold-800/15"
                    >
                        <span className="py-normal text-small font-normal text-cold-800">
                            SCHOOL
                        </span>
                    </AccordionHeader>
                    <AccordionBody className="gap-normal flex flex-col items-center justify-center py-0">
                        <div className="gap-tiny px-medium flex w-full flex-col justify-start">
                            {Object.entries(siteMetadata.routes['School'].routes).map(
                                ([subname, subdata]) => (
                                    <Link
                                        key={subname}
                                        // href={(subdata as any).url}
                                        href="https://axiom.show/faq"
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
                <hr className="border-black/7 border-t" />
                <Accordion
                    open={toggle3}
                    icon={
                        <ForwardIcon
                            className={`mx-auto h-4 w-4 stroke-[2px] transition-transform ${toggle3 ? 'rotate-90' : ''}`}
                        />
                    }
                    className="px-medium"
                >
                    <AccordionHeader
                        onClick={() => handleOpen(2)}
                        className="px-medium rounded-lg border-b-0 py-0 hover:bg-cold-800/15"
                    >
                        <span className="py-normal text-small font-normal text-cold-800">
                            SOCIAL LINKS
                        </span>
                    </AccordionHeader>
                    <AccordionBody className="gap-normal flex flex-col items-center justify-center py-0">
                        <div className="gap-tiny px-medium flex w-full flex-col justify-start">
                            {Object.entries(siteMetadata.socials).map(([subname, subdata]) => (
                                <Link
                                    key={subname}
                                    href={subdata}
                                    className="pre-underline text-tiny gap-normal mb-1 flex place-items-center items-center text-left font-normal decoration-cold-800/50 hover:decoration-cold-800/100"
                                    icon="forward"
                                    size="small"
                                    openInNewTab
                                >
                                    {subname}
                                </Link>
                            ))}
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
