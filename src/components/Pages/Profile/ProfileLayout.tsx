'use client'

import { Principal } from '@dfinity/principal'
import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import AtIcon from '@components/Assets/at.svg'
import EditIcon from '@components/Assets/edit.svg'
import LocationIcon from '@components/Assets/location.svg'
import PlusIcon from '@components/Assets/plus.svg'
import Spinner from '@components/Primitives/Spinner'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import useAuth, { PageStatus } from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { EPackages, ParsedPackages, parseAchievements, parseMemberships } from '@hooks/usePackages'
import { cacheUsername } from '@hooks/useUsername'
import cn from '@libs/class'
import { buildBlobImage } from '@libs/url'
import { parseFilterFromObj, parseSortFromObj } from 'shared/default/filter_sort'
import { DAxioms, DDAO, DFacade, DSales } from 'shared/types/services'
import { Axioms, DAO, Facade, Sales } from 'shared/utils/services'
import { Unwrap } from 'shared/utils/typings'

import AxiomsTab from './AxiomsTab'
import EvidencesTab from './EvidencesTab'
import FieldsTab from './FieldsTab'
import HypothesesTab from './HypothesesTab'
import PackagesTab from './PackagesTab'
import ProposalsTab from './ProposalsTab'
import UpdateAvatar from './UpdateAvatar'
import UpdateLinks from './UpdateLinks'
import UpdateLocation from './UpdateLocation'
import UpdateUsername from './UpdateUsername'

enum EPopup {
    Username,
    Location,
    Links,
    Avatar,
}
enum ETab {
    Packages = 'Packages',
    Axioms = 'Axioms',
    Fields = 'Fields',
    Hypotheses = 'Hypotheses',
    Evidences = 'Evidences',
    Proposals = 'Proposals',
}
const ProfileLayout = ({ id }: { id?: string }) => {
    const salesConfigs = useConfigs('Sales')
    const [searchParams, setSearchPrams] = useSearchParams()

    const { agent, principal, refreshUser, setPageStatus } = useAuth()
    const [profileUser, setProfileUser] = useState<DFacade.Sharable>()
    const [userData, setUserData] = useState<{
        [ETab.Packages]: ParsedPackages<EPackages> | null
        [ETab.Axioms]: DAxioms.SharableHypothesis[] | null
        [ETab.Fields]: DAxioms.SharableField[] | null
        [ETab.Hypotheses]: DAxioms.SharableHypothesis[] | null
        [ETab.Evidences]: DAxioms.SharableEvidence[] | null
        [ETab.Proposals]: DDAO.SharableProposal[] | null
    }>({
        [ETab.Packages]: null,
        [ETab.Axioms]: null,
        [ETab.Fields]: null,
        [ETab.Hypotheses]: null,
        [ETab.Evidences]: null,
        [ETab.Proposals]: null,
    })
    const [open, setOpen] = useState<EPopup>()
    const [loading, setLoading] = useState(true)

    try {
        id ? Principal.fromText(id) : principal!
    } catch (error) {
        setPageStatus(PageStatus.NotFound)
    }

    const profilePrincipal: Principal = id ? Principal.fromText(id) : principal!
    const editable = profilePrincipal?.toText() === principal?.toText()

    useEffect(() => {
        if (searchParams.get('tab') === null) setSearchPrams({ tab: ETab.Packages })
        Promise.all([
            (editable ? refreshUser() : Facade.call(null, true).getUser(profilePrincipal)).then(
                (res) => {
                    if (res) {
                        setProfileUser(res)
                        cacheUsername(profilePrincipal, res.username)
                    } else {
                        setPageStatus(PageStatus.NotFound)
                    }
                }
            ),
        ])
    }, [])

    useEffect(() => {
        try {
            const tab = searchParams.get('tab') as ETab
            if (!salesConfigs || userData[tab] !== null) return

            setLoading(true)

            switch (tab) {
                case ETab.Packages:
                    Promise.all([
                        Sales.call().getOwnedPackages(profilePrincipal),
                        Sales.call().getOwnedAchievementPackages(profilePrincipal),
                    ]).then(([memberships, achievements]) =>
                        setUserData((prev) => ({
                            ...prev,
                            [ETab.Packages]: [
                                ...parseMemberships(memberships, salesConfigs),
                                ...parseAchievements(achievements, salesConfigs),
                            ] as any,
                        }))
                    )
                    break
                case ETab.Axioms:
                    Axioms.call(agent)
                        .getHypotheses(
                            parseFilterFromObj('hypothesis', {
                                axiomsFrom: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('hypothesis', {
                                by: 'recent',
                                order: 'descending',
                            })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [ETab.Axioms]: res })))
                    break
                case ETab.Fields:
                    Axioms.call(agent)
                        .getFields(
                            parseFilterFromObj('field', {
                                joinedBy: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('field', { by: 'recent', order: 'descending' })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [ETab.Fields]: res })))
                    break
                case ETab.Hypotheses:
                    Axioms.call(agent)
                        .getHypotheses(
                            parseFilterFromObj('hypothesis', {
                                publishedBy: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('hypothesis', {
                                by: 'recent',
                                order: 'descending',
                            })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [ETab.Hypotheses]: res })))
                    break
                case ETab.Evidences:
                    Axioms.call(agent)
                        .getEvidences(
                            parseFilterFromObj('evidence', {
                                publishedBy: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('evidence', {
                                by: 'recent',
                                order: 'descending',
                            })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [ETab.Evidences]: res })))
                    break
                case ETab.Proposals:
                    DAO.call(agent)
                        .getProposals(
                            parseFilterFromObj('proposal', {
                                proposedBy: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('proposal', {
                                by: 'recent',
                                order: 'descending',
                            })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [ETab.Proposals]: res })))
                    break
            }
        } catch {
        } finally {
            setLoading(false)
        }
    }, [salesConfigs, searchParams])

    if (!profileUser) return null

    return (
        <div className="gap-extralarge m-auto flex h-auto w-full flex-col">
            <div className="gap-small p-medium mx-auto flex h-auto w-fit flex-col rounded-lg bg-cold-800 md:flex-row">
                <Popup
                    open={open === EPopup.Username}
                    onClose={() => setOpen(undefined)}
                    title="Update Username"
                    className="w-full md:w-2/5"
                >
                    <UpdateUsername
                        onSubmit={() => {
                            refreshUser(), setOpen(undefined)
                        }}
                    />
                </Popup>
                <Popup
                    open={open === EPopup.Links}
                    onClose={() => setOpen(undefined)}
                    title="Update Links"
                    className="w-full md:w-3/5"
                >
                    <UpdateLinks
                        links={profileUser.links}
                        onSubmit={() => {
                            refreshUser(), setOpen(undefined)
                        }}
                    />
                </Popup>
                <Popup
                    open={open === EPopup.Location}
                    onClose={() => setOpen(undefined)}
                    title="Update Location"
                    className="w-full md:w-2/5"
                >
                    <UpdateLocation
                        location={profileUser.location}
                        onSubmit={() => {
                            refreshUser(), setOpen(undefined)
                        }}
                    />
                </Popup>
                <Popup
                    open={open === EPopup.Avatar}
                    onClose={() => setOpen(undefined)}
                    title="Update Avatar"
                    className="w-full md:w-2/5"
                >
                    <UpdateAvatar
                        avatar={Unwrap(profileUser.avatar)?.blob as Uint8Array}
                        onSubmit={() => {
                            refreshUser(), setOpen(undefined)
                        }}
                    />
                </Popup>
                <div className="flex">
                    <div className="gap-small flex w-min flex-col items-center">
                        <button
                            className="p-tiny flex h-60 w-60 items-center justify-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 object-cover hover:border-opacity-100 disabled:hover:border-opacity-0"
                            onClick={() => setOpen(EPopup.Avatar)}
                            disabled={!editable}
                        >
                            {Unwrap(profileUser.avatar) ? (
                                <img
                                    src={buildBlobImage(
                                        Unwrap(profileUser.avatar)!.blob as Uint8Array
                                    )}
                                    alt="avatar"
                                    className="h-full w-full rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-lg bg-cold-50 text-cold-700">
                                    <p className="text-center">No Avatar</p>
                                </div>
                            )}
                        </button>
                        <div className="flex w-full flex-col">
                            <button
                                className="text-small group flex h-8 w-full items-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 px-1.5 font-display font-semibold text-hot-200 hover:border-opacity-100 disabled:hover:border-opacity-0"
                                onClick={() => setOpen(EPopup.Username)}
                                disabled={!editable}
                            >
                                <div className="my-auto flex h-min w-full items-center justify-between">
                                    <div className="gap-normal flex items-center">
                                        <AtIcon className="h-5 stroke-2" />
                                        {profileUser.username}
                                    </div>
                                    {editable && (
                                        <EditIcon className="h-5 stroke-2 opacity-0 group-hover:opacity-100" />
                                    )}
                                </div>
                            </button>
                            <button
                                className="text-small group flex h-8 w-full items-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 px-1.5 font-display font-normal text-hot-200 hover:border-opacity-100 disabled:hover:border-opacity-0"
                                onClick={() => setOpen(EPopup.Location)}
                                disabled={!editable}
                            >
                                <div className="my auto flex h-min w-full items-center justify-between">
                                    <div className="gap-normal flex items-center">
                                        <LocationIcon className="ml-0.5 h-5 stroke-2" />
                                        {profileUser.location === ''
                                            ? 'Unknown'
                                            : profileUser.location}
                                    </div>
                                    {editable && (
                                        <EditIcon className="h-5 stroke-2 opacity-0 group-hover:opacity-100" />
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                    {(profileUser.links.length > 0 || editable) && (
                        <div className="text-small gap-small py-small px-medium flex flex-col text-nowrap text-hot-200">
                            {profileUser.links?.map((link: DFacade.Hyperlink) => (
                                <Link
                                    className="pre-underline pl-small mr-auto decoration-hot-200/50 hover:decoration-hot-200/100"
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    size="small"
                                    icon="forward"
                                    key={link.url}
                                    openInNewTab
                                >
                                    {link.anchorText}
                                </Link>
                            ))}
                            {editable && (
                                <button
                                    className="gap-small flex items-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 px-1.5 hover:border-opacity-100"
                                    onClick={() => setOpen(EPopup.Links)}
                                >
                                    {profileUser.links.length > 0 ? (
                                        <EditIcon className="h-4 stroke-2" />
                                    ) : (
                                        <PlusIcon className="h-4 stroke-2" />
                                    )}
                                    {profileUser.links.length > 0 ? 'Edit' : 'Add'} links
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Tabs value={searchParams.get('tab') ?? ETab.Packages}>
                <TabsHeader
                    className="overflow-x-auto rounded-none border-b border-primary-50 bg-transparent p-0"
                    indicatorProps={{
                        className:
                            'bg-transparent border-b-2 border-primary-700 shadow-none rounded-none',
                    }}
                >
                    {Object.keys(ETab).map((tab) => (
                        <Tab
                            key={tab}
                            value={tab}
                            onClick={() => setSearchPrams({ tab })}
                            className={cn(
                                'text-normal font-normal',
                                searchParams.get('tab') === tab ? 'text-primary-700' : ''
                            )}
                        >
                            <span className="text-normal font-normal">{tab}</span>
                        </Tab>
                    ))}
                </TabsHeader>
                <TabsBody>
                    <TabPanel
                        key={searchParams.get('tab') ?? ETab.Packages}
                        value={searchParams.get('tab') ?? ETab.Packages}
                        className="gap-medium mt-medium p-medium flex w-full flex-col items-center"
                    >
                        {loading || !userData[searchParams.get('tab') as ETab] ? (
                            <Spinner className="mx-auto h-8 w-8 md:h-10 md:w-10" />
                        ) : (
                            {
                                [ETab.Packages]: (
                                    <PackagesTab packages={userData[ETab.Packages]!} />
                                ),
                                [ETab.Axioms]: <AxiomsTab axioms={userData[ETab.Axioms]!} />,
                                [ETab.Fields]: <FieldsTab fields={userData[ETab.Fields]!} />,
                                [ETab.Hypotheses]: (
                                    <HypothesesTab hypotheses={userData[ETab.Hypotheses]!} />
                                ),
                                [ETab.Evidences]: (
                                    <EvidencesTab evidences={userData[ETab.Evidences]!} />
                                ),
                                [ETab.Proposals]: (
                                    <ProposalsTab proposals={userData[ETab.Proposals]!} />
                                ),
                            }[searchParams.get('tab') ?? ETab.Packages]
                        )}
                    </TabPanel>
                </TabsBody>
            </Tabs>
        </div>
    )
}

export default ProfileLayout
