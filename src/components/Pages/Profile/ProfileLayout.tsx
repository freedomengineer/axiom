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
import { DAxioms, DDAO, DFacade } from 'shared/types/services'
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
enum EFullTab {
    Packages = 'Packages',
    Axioms = 'Axioms',
    Fields = 'Fields',
    PublishedHypotheses = 'PublishedHypotheses',
    VotedHypotheses = 'VotedHypotheses',
    PublishedEvidences = 'PublishedEvidences',
    VotedEvidences = 'VotedEvidences',
    OpenedProposals = 'OpenedProposals',
    VotedProposals = 'VotedProposals',
}

const parseTabFromFullTab = (tab: EFullTab): ETab => {
    switch (tab) {
        case EFullTab.Packages:
            return ETab.Packages
        case EFullTab.Axioms:
            return ETab.Axioms
        case EFullTab.Fields:
            return ETab.Fields
        case EFullTab.PublishedHypotheses:
        case EFullTab.VotedHypotheses:
            return ETab.Hypotheses
        case EFullTab.PublishedEvidences:
        case EFullTab.VotedEvidences:
            return ETab.Evidences
        case EFullTab.OpenedProposals:
        case EFullTab.VotedProposals:
            return ETab.Proposals
    }
}
const parseFullTabFromTab = (tab: ETab): EFullTab => {
    switch (tab) {
        case ETab.Packages:
            return EFullTab.Packages
        case ETab.Axioms:
            return EFullTab.Axioms
        case ETab.Fields:
            return EFullTab.Fields
        case ETab.Hypotheses:
            return EFullTab.PublishedHypotheses
        case ETab.Evidences:
            return EFullTab.PublishedEvidences
        case ETab.Proposals:
            return EFullTab.OpenedProposals
    }
}

const ProfileLayout = ({ id }: { id?: string }) => {
    const salesConfigs = useConfigs('Sales')
    const [searchParams, setSearchPrams] = useSearchParams()

    const { agent, principal, refreshUser, setPageStatus } = useAuth()
    const [profileUser, setProfileUser] = useState<DFacade.Sharable>()
    const [userData, setUserData] = useState<{
        [EFullTab.Packages]: ParsedPackages<EPackages> | null
        [EFullTab.Axioms]: DAxioms.SharableHypothesis[] | null
        [EFullTab.Fields]: DAxioms.SharableField[] | null
        [EFullTab.PublishedHypotheses]: DAxioms.SharableHypothesis[] | null
        [EFullTab.VotedHypotheses]: DAxioms.SharableHypothesis[] | null
        [EFullTab.PublishedEvidences]: DAxioms.SharableEvidence[] | null
        [EFullTab.VotedEvidences]: DAxioms.SharableEvidence[] | null
        [EFullTab.OpenedProposals]: DDAO.SharableProposal[] | null
        [EFullTab.VotedProposals]: DDAO.SharableProposal[] | null
    }>({
        [EFullTab.Packages]: null,
        [EFullTab.Axioms]: null,
        [EFullTab.Fields]: null,
        [EFullTab.PublishedHypotheses]: null,
        [EFullTab.VotedHypotheses]: null,
        [EFullTab.PublishedEvidences]: null,
        [EFullTab.VotedEvidences]: null,
        [EFullTab.OpenedProposals]: null,
        [EFullTab.VotedProposals]: null,
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
    const fullTab = (searchParams.get('tab') ?? ETab.Packages) as EFullTab
    const tab = parseTabFromFullTab(fullTab)

    useEffect(() => {
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
            if (!salesConfigs || userData[fullTab] !== null) return

            setLoading(true)

            switch (fullTab) {
                case EFullTab.Packages:
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
                case EFullTab.Fields:
                    Axioms.call(agent)
                        .getFields(
                            parseFilterFromObj('field', {
                                joinedBy: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('field', { by: 'recent', order: 'descending' })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [EFullTab.Fields]: res })))
                    break
                case EFullTab.Axioms:
                case EFullTab.PublishedHypotheses:
                case EFullTab.VotedHypotheses:
                    Axioms.call(agent)
                        .getHypotheses(
                            parseFilterFromObj('hypothesis', {
                                [{
                                    [EFullTab.Axioms]: 'axiomsFrom',
                                    [EFullTab.PublishedHypotheses]: 'publishedBy',
                                    [EFullTab.VotedHypotheses]: 'votedBy',
                                }[fullTab]]: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('hypothesis', { by: 'recent', order: 'descending' })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [fullTab]: res })))
                    break
                case EFullTab.PublishedEvidences:
                case EFullTab.VotedEvidences:
                    Axioms.call(agent)
                        .getEvidences(
                            parseFilterFromObj('evidence', {
                                [{
                                    [EFullTab.PublishedEvidences]: 'publishedBy',
                                    [EFullTab.VotedEvidences]: 'votedBy',
                                }[fullTab]]: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('evidence', { by: 'recent', order: 'descending' })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [fullTab]: res })))
                    break
                case EFullTab.OpenedProposals:
                case EFullTab.VotedProposals:
                    DAO.call(agent)
                        .getProposals(
                            parseFilterFromObj('proposal', {
                                [{
                                    [EFullTab.OpenedProposals]: 'proposedBy',
                                    [EFullTab.VotedProposals]: 'votedBy',
                                }[fullTab]]: profilePrincipal.toText(),
                            }),
                            parseSortFromObj('proposal', { by: 'recent', order: 'descending' })
                        )
                        .then((res) => setUserData((prev) => ({ ...prev, [fullTab]: res })))
                    break
            }
        } catch {
        } finally {
            setLoading(false)
        }
    }, [salesConfigs, fullTab])

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
                    <UpdateUsername onSubmit={() => (refreshUser(), setOpen(undefined))} />
                </Popup>
                <Popup
                    open={open === EPopup.Links}
                    onClose={() => setOpen(undefined)}
                    title="Update Links"
                    className="w-full md:w-3/5"
                >
                    <UpdateLinks
                        links={profileUser.links}
                        onSubmit={() => (refreshUser(), setOpen(undefined))}
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
                        onSubmit={() => (refreshUser(), setOpen(undefined))}
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
                        onSubmit={() => (refreshUser(), setOpen(undefined))}
                    />
                </Popup>
                <div className="flex">
                    <div className="gap-small flex w-min flex-col items-center">
                        <button
                            className="p-tiny flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 object-cover hover:border-opacity-100 disabled:hover:border-opacity-0 md:h-60 md:w-60"
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
            <Tabs value={tab}>
                <TabsHeader
                    className="overflow-x-auto overflow-y-hidden rounded-none border-b border-primary-50 bg-transparent p-0"
                    indicatorProps={{
                        className:
                            'bg-transparent border-b-2 border-primary-700 shadow-none rounded-none',
                    }}
                >
                    {Object.keys(ETab).map((currentTab) => {
                        const parsedFullTab = parseFullTabFromTab(currentTab as ETab)
                        return (
                            <Tab
                                key={currentTab}
                                value={currentTab}
                                onClick={() => setSearchPrams({ tab: parsedFullTab })}
                                className={cn(
                                    'text-normal font-normal',
                                    tab === currentTab && 'text-primary-700'
                                )}
                            >
                                <span className="text-normal text-nowrap font-normal">
                                    {currentTab}{' '}
                                    {![ETab.Hypotheses, ETab.Evidences, ETab.Proposals].includes(
                                        currentTab as ETab
                                    ) &&
                                        userData[parsedFullTab] !== null &&
                                        `(${userData[parsedFullTab]!.length})`}
                                </span>
                            </Tab>
                        )
                    })}
                </TabsHeader>
                <TabsBody>
                    <TabPanel
                        key={tab}
                        value={tab}
                        className={cn(
                            'gap-medium flex w-full flex-col items-center',
                            ![ETab.Hypotheses, ETab.Evidences, ETab.Proposals].includes(tab) &&
                                'mt-medium p-medium'
                        )}
                    >
                        {
                            {
                                [ETab.Packages]:
                                    loading || !userData[tab as unknown as EFullTab] ? (
                                        <Spinner className="mx-auto h-8 w-8 md:h-10 md:w-10" />
                                    ) : (
                                        <PackagesTab packages={userData[EFullTab.Packages]!} />
                                    ),
                                [ETab.Axioms]:
                                    loading || !userData[tab as unknown as EFullTab] ? (
                                        <Spinner className="mx-auto h-8 w-8 md:h-10 md:w-10" />
                                    ) : (
                                        <AxiomsTab axioms={userData[EFullTab.Axioms]!} />
                                    ),
                                [ETab.Fields]:
                                    loading || !userData[tab as unknown as EFullTab] ? (
                                        <Spinner className="mx-auto h-8 w-8 md:h-10 md:w-10" />
                                    ) : (
                                        <FieldsTab fields={userData[EFullTab.Fields]!} />
                                    ),
                                [ETab.Hypotheses]: (
                                    <Tabs value={fullTab} className="w-full">
                                        <TabsHeader
                                            className="overflow-x-auto overflow-y-hidden rounded-none border-b border-primary-50 bg-transparent p-0"
                                            indicatorProps={{
                                                className:
                                                    'bg-transparent border-b-2 border-primary-700 shadow-none rounded-none',
                                            }}
                                        >
                                            {['Published', 'Voted'].map((prefix) => {
                                                const parsedFullTab =
                                                    `${prefix}Hypotheses` as EFullTab
                                                return (
                                                    <Tab
                                                        key={parsedFullTab}
                                                        value={parsedFullTab}
                                                        onClick={() =>
                                                            setSearchPrams({ tab: parsedFullTab })
                                                        }
                                                        className={cn(
                                                            'text-normal font-normal',
                                                            fullTab === parsedFullTab &&
                                                                'text-primary-700'
                                                        )}
                                                    >
                                                        <span className="text-normal text-nowrap font-normal">
                                                            {prefix}{' '}
                                                            {userData[parsedFullTab] !== null &&
                                                                `(${userData[parsedFullTab]!.length})`}
                                                        </span>
                                                    </Tab>
                                                )
                                            })}
                                        </TabsHeader>
                                        <TabsBody>
                                            <TabPanel
                                                key={fullTab}
                                                value={fullTab}
                                                className="gap-medium mt-medium p-medium flex w-full flex-col items-center"
                                            >
                                                {loading || !userData[fullTab] ? (
                                                    <Spinner className="mx-auto h-8 w-8 md:h-10 md:w-10" />
                                                ) : (
                                                    <HypothesesTab
                                                        hypotheses={userData[fullTab]!}
                                                        type={
                                                            fullTab.includes('Published')
                                                                ? 'Published'
                                                                : 'Voted'
                                                        }
                                                    />
                                                )}
                                            </TabPanel>
                                        </TabsBody>
                                    </Tabs>
                                ),
                                [ETab.Evidences]: (
                                    <Tabs value={fullTab} className="w-full">
                                        <TabsHeader
                                            className="overflow-x-auto overflow-y-hidden rounded-none border-b border-primary-50 bg-transparent p-0"
                                            indicatorProps={{
                                                className:
                                                    'bg-transparent border-b-2 border-primary-700 shadow-none rounded-none',
                                            }}
                                        >
                                            {['Published', 'Voted'].map((prefix) => {
                                                const parsedFullTab =
                                                    `${prefix}Evidences` as EFullTab
                                                return (
                                                    <Tab
                                                        key={parsedFullTab}
                                                        value={parsedFullTab}
                                                        onClick={() =>
                                                            setSearchPrams({ tab: parsedFullTab })
                                                        }
                                                        className={cn(
                                                            'text-normal font-normal',
                                                            fullTab === parsedFullTab &&
                                                                'text-primary-700'
                                                        )}
                                                    >
                                                        <span className="text-normal text-nowrap font-normal">
                                                            {prefix}{' '}
                                                            {userData[parsedFullTab] !== null &&
                                                                `(${userData[parsedFullTab]!.length})`}
                                                        </span>
                                                    </Tab>
                                                )
                                            })}
                                        </TabsHeader>
                                        <TabsBody>
                                            <TabPanel
                                                key={fullTab}
                                                value={fullTab}
                                                className="gap-medium mt-medium p-medium flex w-full flex-col items-center"
                                            >
                                                {loading || !userData[fullTab] ? (
                                                    <Spinner className="mx-auto h-8 w-8 md:h-10 md:w-10" />
                                                ) : (
                                                    <EvidencesTab
                                                        evidences={userData[fullTab]!}
                                                        type={
                                                            fullTab.includes('Published')
                                                                ? 'Published'
                                                                : 'Voted'
                                                        }
                                                    />
                                                )}
                                            </TabPanel>
                                        </TabsBody>
                                    </Tabs>
                                ),
                                [ETab.Proposals]: (
                                    <Tabs value={fullTab} className="w-full">
                                        <TabsHeader
                                            className="overflow-x-auto overflow-y-hidden rounded-none border-b border-primary-50 bg-transparent p-0"
                                            indicatorProps={{
                                                className:
                                                    'bg-transparent border-b-2 border-primary-700 shadow-none rounded-none',
                                            }}
                                        >
                                            {['Opened', 'Voted'].map((prefix) => {
                                                const parsedFullTab =
                                                    `${prefix}Proposals` as EFullTab
                                                return (
                                                    <Tab
                                                        key={parsedFullTab}
                                                        value={parsedFullTab}
                                                        onClick={() =>
                                                            setSearchPrams({ tab: parsedFullTab })
                                                        }
                                                        className={cn(
                                                            'text-normal font-normal',
                                                            fullTab === parsedFullTab &&
                                                                'text-primary-700'
                                                        )}
                                                    >
                                                        <span className="text-normal text-nowrap font-normal">
                                                            {prefix}{' '}
                                                            {userData[parsedFullTab] !== null &&
                                                                `(${userData[parsedFullTab]!.length})`}
                                                        </span>
                                                    </Tab>
                                                )
                                            })}
                                        </TabsHeader>
                                        <TabsBody>
                                            <TabPanel
                                                key={fullTab}
                                                value={fullTab}
                                                className="gap-medium mt-medium p-medium flex w-full flex-col items-center"
                                            >
                                                {loading || !userData[fullTab] ? (
                                                    <Spinner className="mx-auto h-8 w-8 md:h-10 md:w-10" />
                                                ) : (
                                                    <ProposalsTab
                                                        proposals={userData[fullTab]!}
                                                        type={
                                                            fullTab.includes('Opened')
                                                                ? 'Opened'
                                                                : 'Voted'
                                                        }
                                                    />
                                                )}
                                            </TabPanel>
                                        </TabsBody>
                                    </Tabs>
                                ),
                            }[tab]
                        }
                    </TabPanel>
                </TabsBody>
            </Tabs>
        </div>
    )
}

export default ProfileLayout
