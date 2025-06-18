'use client'

import { Principal } from '@dfinity/principal'
import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ClipboardIcon from '@components/Assets/clipboard.svg'
import DoneIcon from '@components/Assets/done.svg'
import EditIcon from '@components/Assets/edit.svg'
import FollowerIcon from '@components/Assets/follower.svg'
import FollowingIcon from '@components/Assets/following.svg'
import LocationIcon from '@components/Assets/location.svg'
import MinusIcon from '@components/Assets/minus.svg'
import PlusIcon from '@components/Assets/plus.svg'
import Spinner from '@components/Primitives/Spinner'
import InfiniteScrollWrapperHard from '@components/Shared/InfiniteScrollWrapperHard'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import Username, { Symbol } from '@components/Shared/Username'
import useAuth, { PageStatus } from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { EPackages, ParsedPackages, parseAchievements, parseMemberships } from '@hooks/usePackages'
import { cacheUsername } from '@hooks/useUsername'
import cn from '@libs/class'
import { success } from '@libs/toastify'
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
    Followers,
    Followings,
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
const parseFullTabFromTab = (tab: ETab): [EFullTab, EFullTab | null] => {
    switch (tab) {
        case ETab.Packages:
            return [EFullTab.Packages, null]
        case ETab.Axioms:
            return [EFullTab.Axioms, null]
        case ETab.Fields:
            return [EFullTab.Fields, null]
        case ETab.Hypotheses:
            return [EFullTab.PublishedHypotheses, EFullTab.VotedHypotheses]
        case ETab.Evidences:
            return [EFullTab.PublishedEvidences, EFullTab.VotedEvidences]
        case ETab.Proposals:
            return [EFullTab.OpenedProposals, EFullTab.VotedProposals]
    }
}

const ProfileLayout = ({ id }: { id?: string }) => {
    const salesConfigs = useConfigs('Sales')
    const [searchParams, setSearchPrams] = useSearchParams()

    const { agent, principal, refreshUser, setPageStatus } = useAuth()
    const [profileUser, setProfileUser] = useState<{
        facade: DFacade.Sharable
        dao: DDAO.Sharable__1
        axioms: DAxioms.Sharable
    }>()
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
    const [loadingFollow, setLoadingFollow] = useState(false)
    const [copied, setCopied] = useState(false)
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
            editable ? refreshUser() : Facade.call(null, true).getUser(profilePrincipal),
            DAO.call(agent).getUser(profilePrincipal),
            Axioms.call(agent).getUser(profilePrincipal),
        ]).then(([facade, dao, axioms]) => {
            if (facade) {
                cacheUsername(profilePrincipal, facade.username, facade.capitalRaised.toString())
                setProfileUser({ facade, dao, axioms })
            } else {
                setPageStatus(PageStatus.NotFound)
            }
        })
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
                                member: profilePrincipal.toText(),
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
                                    [EFullTab.PublishedHypotheses]: 'publisher',
                                    [EFullTab.VotedHypotheses]: 'voter',
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
                                    [EFullTab.PublishedEvidences]: 'publisher',
                                    [EFullTab.VotedEvidences]: 'voter',
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
                                    [EFullTab.OpenedProposals]: 'proposer',
                                    [EFullTab.VotedProposals]: 'voter',
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

    const dataCounts = {
        [EFullTab.Packages]: userData[EFullTab.Packages]?.length ?? 'N/A',
        [EFullTab.Axioms]: profileUser.axioms.axioms.length,
        [EFullTab.Fields]: profileUser.axioms.joinedFields.length,
        [EFullTab.PublishedHypotheses]: profileUser.axioms.hypotheses.length,
        [EFullTab.VotedHypotheses]: profileUser.axioms.votedHypotheses.length,
        [EFullTab.PublishedEvidences]: profileUser.axioms.evidences.length,
        [EFullTab.VotedEvidences]: profileUser.axioms.votedEvidences.length,
        [EFullTab.OpenedProposals]: profileUser.dao.proposals.length,
        [EFullTab.VotedProposals]: profileUser.dao.proposalVotes.length,
    }

    const handleCopy = (name: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        success(`Copied ${name} to clipboard`)
        setTimeout(() => setCopied(false), 3000)
    }

    const handleFollow = async () => {
        setLoadingFollow(true)
        if (Unwrap(profileUser.axioms.callerFollowing)) {
            await Axioms.call(agent, true).unfollow(profilePrincipal)
        } else {
            await Axioms.call(agent, true).follow(profilePrincipal)
        }
        await Axioms.call(agent)
            .getUser(profilePrincipal)
            .then((res) => setProfileUser({ ...profileUser, axioms: res }))
        setLoadingFollow(false)
    }

    const updateFacadeUser = (cache: boolean = false) => {
        ;(editable ? refreshUser() : Facade.call(null, true).getUser(profilePrincipal)).then(
            (res) => {
                if (res) {
                    setOpen(undefined)
                    setProfileUser({ ...profileUser, facade: res })
                    cache &&
                        cacheUsername(profilePrincipal, res.username, res.capitalRaised.toString())
                }
            }
        )
    }

    return (
        <div className="gap-extralarge m-auto flex h-auto w-full flex-col">
            <div className="gap-small p-medium mx-auto flex h-auto w-full flex-col rounded-lg bg-cold-800 md:w-fit md:flex-row">
                <Popup
                    open={open === EPopup.Username}
                    onClose={() => setOpen(undefined)}
                    title="Update Username"
                    className="w-full md:w-2/5"
                    Icon={<EditIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                >
                    <UpdateUsername onSubmit={() => updateFacadeUser(true)} />
                </Popup>
                <Popup
                    open={open === EPopup.Links}
                    onClose={() => setOpen(undefined)}
                    title="Update Links"
                    className="w-full md:w-3/5"
                    Icon={<EditIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                >
                    <UpdateLinks
                        links={profileUser.facade.links}
                        onSubmit={() => updateFacadeUser()}
                    />
                </Popup>
                <Popup
                    open={open === EPopup.Location}
                    onClose={() => setOpen(undefined)}
                    title="Update Location"
                    className="w-full md:w-2/5"
                    Icon={<EditIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                >
                    <UpdateLocation
                        location={profileUser.facade.location}
                        onSubmit={() => updateFacadeUser()}
                    />
                </Popup>
                <Popup
                    open={open === EPopup.Avatar}
                    onClose={() => setOpen(undefined)}
                    title="Update Avatar"
                    className="w-full md:w-2/5"
                    Icon={<EditIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                >
                    <UpdateAvatar
                        avatar={Unwrap(profileUser.facade.avatar)?.blob as Uint8Array}
                        onSubmit={() => updateFacadeUser()}
                    />
                </Popup>
                <Popup
                    open={open === EPopup.Followers}
                    onClose={() => setOpen(undefined)}
                    title="Followers"
                    className="w-full md:w-1/5"
                    Icon={<FollowerIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                >
                    <InfiniteScrollWrapperHard
                        items={profileUser.axioms.followers}
                        LayoutComponent={({ items }) => (
                            <div className="gap-small flex flex-col">
                                {items.map((follower, index) => (
                                    <div
                                        key={index}
                                        className="gap-normal text-normal flex items-center"
                                    >
                                        <span className="text-cold-600">{index + 1}. </span>
                                        <Username
                                            principal={follower}
                                            symbol
                                            linkClassName="text-cold-700 pre-underline decoration-cold-700/50 hover:decoration-cold-700/100"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </Popup>
                <Popup
                    open={open === EPopup.Followings}
                    onClose={() => setOpen(undefined)}
                    title="Followings"
                    className="w-full md:w-1/5"
                    Icon={<FollowingIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                >
                    <InfiniteScrollWrapperHard
                        items={profileUser.axioms.followings}
                        LayoutComponent={({ items }) => (
                            <div className="gap-small flex flex-col">
                                {items.map((following, index) => (
                                    <div
                                        key={index}
                                        className="gap-normal text-normal flex items-center"
                                    >
                                        <span className="text-cold-600">{index + 1}. </span>
                                        <Username
                                            principal={following}
                                            symbol
                                            linkClassName="text-cold-700 pre-underline decoration-cold-700/50 hover:decoration-cold-700/100"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </Popup>
                <div className="gap-small flex w-full flex-col">
                    <div className="flex w-full">
                        <div className="gap-small flex w-min flex-col items-center">
                            <button
                                className="p-tiny flex h-[192px] w-[192px] items-center justify-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 object-cover hover:border-opacity-100 disabled:hover:border-opacity-0 md:h-[224px] md:w-[224px]"
                                onClick={() => setOpen(EPopup.Avatar)}
                                disabled={!editable}
                            >
                                {Unwrap(profileUser.facade.avatar) ? (
                                    <img
                                        src={buildBlobImage(
                                            Unwrap(profileUser.facade.avatar)!.blob as Uint8Array
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
                            <div className="flex h-16 w-full flex-col">
                                <button
                                    className="text-small group flex h-8 w-full items-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 px-1.5 font-display font-semibold text-hot-200 hover:border-opacity-100 disabled:hover:border-opacity-0"
                                    onClick={() =>
                                        editable
                                            ? setOpen(EPopup.Username)
                                            : handleCopy('username', profileUser.facade.username)
                                    }
                                    disabled={copied}
                                >
                                    <div className="my-auto flex h-min w-full items-center justify-between">
                                        <div className="gap-normal flex items-center">
                                            <Symbol
                                                capitalRaised={profileUser.facade.capitalRaised.toString()}
                                                className="mr-0 h-4 w-4 stroke-2 md:h-5 md:w-5"
                                            />
                                            {profileUser.facade.username}
                                        </div>
                                        {editable ? (
                                            <EditIcon className="h-4 w-4 stroke-2 opacity-0 group-hover:opacity-100 md:h-5 md:w-5" />
                                        ) : copied ? (
                                            <DoneIcon className="h-4 w-4 stroke-2 opacity-0 group-hover:opacity-100 md:h-5 md:w-5" />
                                        ) : (
                                            <ClipboardIcon className="h-4 w-4 stroke-2 opacity-0 group-hover:opacity-100 md:h-5 md:w-5" />
                                        )}
                                    </div>
                                </button>
                                <button
                                    className="text-small group flex h-8 w-full items-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 px-1.5 font-display font-normal text-hot-200 hover:border-opacity-100 disabled:hover:border-opacity-0"
                                    onClick={() =>
                                        editable
                                            ? setOpen(EPopup.Location)
                                            : handleCopy('location', profileUser.facade.location)
                                    }
                                    disabled={copied}
                                >
                                    <div className="my auto flex h-min w-full items-center justify-between">
                                        <div className="gap-normal flex items-center">
                                            <LocationIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                            {profileUser.facade.location === ''
                                                ? 'Unknown'
                                                : profileUser.facade.location}
                                        </div>
                                        {editable ? (
                                            <EditIcon className="h-4 w-4 stroke-2 opacity-0 group-hover:opacity-100 md:h-5 md:w-5" />
                                        ) : copied ? (
                                            <DoneIcon className="h-4 w-4 stroke-2 opacity-0 group-hover:opacity-100 md:h-5 md:w-5" />
                                        ) : (
                                            <ClipboardIcon className="h-4 w-4 stroke-2 opacity-0 group-hover:opacity-100 md:h-5 md:w-5" />
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="gap-small flex h-full w-full flex-col pr-[20px]">
                            <div className="text-small py-small px-tiny relative flex h-[192px] w-[calc(100%+20px)] flex-col text-nowrap text-hot-200 md:h-[224px]">
                                {editable && (
                                    <button
                                        className="pr-large group absolute left-0 top-0 z-0 h-full w-full rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 hover:border-opacity-100 disabled:hover:border-opacity-0"
                                        disabled={!editable}
                                        onClick={() => setOpen(EPopup.Links)}
                                    >
                                        <EditIcon className="absolute right-1 top-1 h-4 w-4 stroke-2 opacity-0 group-hover:opacity-100 md:h-5 md:w-5" />
                                    </button>
                                )}
                                {profileUser.facade.links.length > 0 || editable ? (
                                    <>
                                        {profileUser.facade.links?.map(
                                            (link: DFacade.Hyperlink) => (
                                                <Link
                                                    className="pre-underline pl-small z-10 mr-auto h-6 decoration-hot-200/50 hover:decoration-hot-200/100 md:h-7"
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
                                            )
                                        )}
                                    </>
                                ) : (
                                    <p className="text-center">No links are set.</p>
                                )}
                            </div>
                            <div className="flex h-16 w-[calc(100%+20px)] flex-col">
                                <button
                                    className="text-small group flex h-8 w-full items-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 px-1.5 font-display font-semibold text-hot-200 hover:border-opacity-100 disabled:hover:border-opacity-0"
                                    onClick={() => setOpen(EPopup.Followers)}
                                >
                                    <div className="my-auto flex h-min w-full items-center justify-between">
                                        <div className="gap-normal flex items-center">
                                            <FollowerIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                            {profileUser.axioms.followers.length}{' '}
                                            <span className="hidden md:block">followers</span>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    className="text-small group flex h-8 w-full items-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 px-1.5 font-display font-normal text-hot-200 hover:border-opacity-100 disabled:hover:border-opacity-0"
                                    onClick={() => setOpen(EPopup.Followings)}
                                >
                                    <div className="my auto flex h-min w-full items-center justify-between">
                                        <div className="gap-normal flex items-center">
                                            <FollowingIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                            {profileUser.axioms.followings.length}{' '}
                                            <span className="hidden md:block">following</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                    {!editable && (
                        <button
                            className="gap-small p-normal flex h-10 w-full items-center justify-center rounded-lg border-2 border-dashed border-hot-200 border-opacity-0 font-display font-normal text-hot-200 hover:border-opacity-100 disabled:border-opacity-100"
                            onClick={handleFollow}
                            disabled={loadingFollow}
                        >
                            {loadingFollow ? (
                                <Spinner className="h-4 w-4 md:h-5 md:w-5" />
                            ) : Unwrap(profileUser.axioms.callerFollowing) ? (
                                <>
                                    <MinusIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                    Unfollow
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                    Follow
                                </>
                            )}
                        </button>
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
                        const [tab1, tab2] = parseFullTabFromTab(currentTab as ETab)
                        return (
                            <Tab
                                key={currentTab}
                                value={currentTab}
                                onClick={() => setSearchPrams({ tab: tab1 })}
                                className={cn(
                                    'text-normal font-normal',
                                    tab === currentTab && 'text-primary-700'
                                )}
                            >
                                <span className="text-normal text-nowrap font-normal">
                                    {currentTab} ({dataCounts[tab1]}
                                    {tab2 && `, ${dataCounts[tab2]}`})
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
                                                            {prefix} ({dataCounts[parsedFullTab]})
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
                                                            {prefix} ({dataCounts[parsedFullTab]})
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
                                                            {prefix} ({dataCounts[parsedFullTab]})
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
