import { Principal } from '@dfinity/principal'
import { useEffect, useMemo, useState } from 'react'
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
import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@components/Primitives/Tabs'
import InfiniteScrollWrapperHard from '@components/Shared/InfiniteScrollWrapperHard'
import Link from '@components/Shared/Link'
import Popup from '@components/Shared/Popup'
import UserList from '@components/Shared/UserList'
import { Symbol } from '@components/Shared/Username'
import useAuth, { PageStatus } from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { EPackages, ParsedPackages, parseAchievements, parseMemberships } from '@hooks/usePackages'
import { cacheUsername } from '@hooks/useUsername'
import cn from '@libs/class'
import { success } from '@libs/toastify'
import { buildBlobImage } from '@libs/url'
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

const ProfileLayout = ({ profilePrincipal }: { profilePrincipal: Principal }) => {
    const salesConfigs = useConfigs('Sales')
    const [searchParams, setSearchPrams] = useSearchParams()

    const { agent, principal, refreshUser, setPageStatus } = useAuth()
    const [profileUser, setProfileUser] = useState<{
        facade?: DFacade.Sharable
        dao?: DDAO.Sharable__1
        axioms?: DAxioms.Sharable__2
    }>()
    const [userPackages, setUserPackages] = useState<ParsedPackages<EPackages>>()
    const [open, setOpen] = useState<EPopup>()
    const [loadingFollow, setLoadingFollow] = useState(false)
    const [copied, setCopied] = useState(false)

    const editable = profilePrincipal?.toText() === principal?.toText()
    const fullTab = (searchParams.get('tab') ?? ETab.Packages) as EFullTab
    const tab = parseTabFromFullTab(fullTab)

    useEffect(() => {
        Promise.all([
            editable
                ? refreshUser().catch(() => undefined)
                : Facade.call(null, true)
                      .getUser(profilePrincipal)
                      .catch(() => undefined),
            DAO.call(agent)
                .getUser(profilePrincipal)
                .catch(() => undefined),
            Axioms.call(agent)
                .getUser(profilePrincipal)
                .catch(() => undefined),
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
            if (!salesConfigs || userPackages) return

            Promise.all([
                Sales.call(agent, true).getOwnedPackages(profilePrincipal),
                Sales.call(agent, true).getOwnedAchievementPackages(profilePrincipal),
            ]).then(([memberships, achievements]) =>
                setUserPackages([
                    ...parseMemberships(memberships, salesConfigs),
                    ...parseAchievements(achievements, salesConfigs),
                ] as any)
            )
        } catch {}
    }, [salesConfigs, agent, profilePrincipal, userPackages])

    const dataCounts = useMemo(
        () => ({
            [EFullTab.Packages]: userPackages?.length ?? 'N/A',
            [EFullTab.Axioms]: profileUser?.axioms?.axioms.length ?? 0,
            [EFullTab.Fields]: profileUser?.axioms?.joinedFields.length ?? 0,
            [EFullTab.PublishedHypotheses]: profileUser?.axioms?.hypotheses.length ?? 0,
            [EFullTab.VotedHypotheses]: profileUser?.axioms?.votedHypotheses.length ?? 0,
            [EFullTab.PublishedEvidences]: profileUser?.axioms?.evidences.length ?? 0,
            [EFullTab.VotedEvidences]: profileUser?.axioms?.votedEvidences.length ?? 0,
            [EFullTab.OpenedProposals]: profileUser?.dao?.proposals.length ?? 0,
            [EFullTab.VotedProposals]: profileUser?.dao?.proposalVotes.length ?? 0,
        }),
        [profileUser, userPackages]
    )

    const handleCopy = (name: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        success(`Copied ${name} to clipboard`)
        setTimeout(() => setCopied(false), 3000)
    }

    const handleFollow = async () => {
        setLoadingFollow(true)
        if (Unwrap(profileUser?.axioms?.callerFollowing ?? [])) {
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

    const memoizedTabs = useMemo(
        () =>
            profileUser && (
                <Tabs value={tab}>
                    <TabsHeader>
                        {Object.keys(ETab).map((currentTab) => {
                            const [tab1, tab2] = parseFullTabFromTab(currentTab as ETab)
                            return (
                                <Tab
                                    key={currentTab}
                                    value={currentTab}
                                    onClick={() => setSearchPrams({ tab: tab1 })}
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
                        <TabPanel key={ETab.Packages} value={ETab.Packages} className="p-medium">
                            {!userPackages ? (
                                <Spinner className="mx-auto h-6 w-6 md:h-8 md:w-8" />
                            ) : (
                                <PackagesTab packages={userPackages} />
                            )}
                        </TabPanel>
                        <TabPanel key={ETab.Axioms} value={ETab.Axioms} className="p-medium">
                            <AxiomsTab principal={profilePrincipal} />
                        </TabPanel>
                        <TabPanel key={ETab.Fields} value={ETab.Fields} className="p-medium">
                            <FieldsTab principal={profilePrincipal} />
                        </TabPanel>
                        <TabPanel key={ETab.Hypotheses} value={ETab.Hypotheses}>
                            <Tabs value={fullTab}>
                                <TabsHeader>
                                    {['Published', 'Voted'].map((prefix) => {
                                        const tab = `${prefix}Hypotheses` as EFullTab
                                        return (
                                            <Tab
                                                key={tab}
                                                value={tab}
                                                onClick={() => setSearchPrams({ tab })}
                                            >
                                                {prefix} ({dataCounts[tab]})
                                            </Tab>
                                        )
                                    })}
                                </TabsHeader>
                                <TabsBody>
                                    <TabPanel
                                        key={EFullTab.PublishedHypotheses}
                                        value={EFullTab.PublishedHypotheses}
                                        className="p-medium"
                                    >
                                        <HypothesesTab
                                            principal={profilePrincipal}
                                            type={'Published'}
                                        />
                                    </TabPanel>
                                    <TabPanel
                                        key={EFullTab.VotedHypotheses}
                                        value={EFullTab.VotedHypotheses}
                                        className="p-medium"
                                    >
                                        <HypothesesTab
                                            principal={profilePrincipal}
                                            type={'Voted'}
                                        />
                                    </TabPanel>
                                </TabsBody>
                            </Tabs>
                        </TabPanel>
                        <TabPanel key={ETab.Evidences} value={ETab.Evidences}>
                            <Tabs value={fullTab}>
                                <TabsHeader>
                                    {['Published', 'Voted'].map((prefix) => {
                                        const tab = `${prefix}Evidences` as EFullTab
                                        return (
                                            <Tab
                                                key={tab}
                                                value={tab}
                                                onClick={() => setSearchPrams({ tab })}
                                            >
                                                {prefix} ({dataCounts[tab]})
                                            </Tab>
                                        )
                                    })}
                                </TabsHeader>
                                <TabsBody>
                                    <TabPanel
                                        key={EFullTab.PublishedEvidences}
                                        value={EFullTab.PublishedEvidences}
                                        className="p-medium"
                                    >
                                        <EvidencesTab
                                            principal={profilePrincipal}
                                            type={'Published'}
                                        />
                                    </TabPanel>
                                    <TabPanel
                                        key={EFullTab.VotedEvidences}
                                        value={EFullTab.VotedEvidences}
                                        className="p-medium"
                                    >
                                        <EvidencesTab principal={profilePrincipal} type={'Voted'} />
                                    </TabPanel>
                                </TabsBody>
                            </Tabs>
                        </TabPanel>
                        <TabPanel key={ETab.Proposals} value={ETab.Proposals}>
                            <Tabs value={fullTab}>
                                <TabsHeader>
                                    {['Opened', 'Voted'].map((prefix) => {
                                        const tab = `${prefix}Proposals` as EFullTab
                                        return (
                                            <Tab
                                                key={tab}
                                                value={tab}
                                                onClick={() => setSearchPrams({ tab })}
                                            >
                                                {prefix} ({dataCounts[tab]})
                                            </Tab>
                                        )
                                    })}
                                </TabsHeader>
                                <TabsBody>
                                    <TabPanel
                                        key={EFullTab.OpenedProposals}
                                        value={EFullTab.OpenedProposals}
                                        className="p-medium"
                                    >
                                        <ProposalsTab
                                            principal={profilePrincipal}
                                            type={'Opened'}
                                        />
                                    </TabPanel>
                                    <TabPanel
                                        key={EFullTab.VotedProposals}
                                        value={EFullTab.VotedProposals}
                                        className="p-medium"
                                    >
                                        <ProposalsTab principal={profilePrincipal} type={'Voted'} />
                                    </TabPanel>
                                </TabsBody>
                            </Tabs>
                        </TabPanel>
                    </TabsBody>
                </Tabs>
            ),
        [tab, fullTab, dataCounts, profilePrincipal, setSearchPrams, userPackages, profileUser]
    )

    if (!profileUser || !profileUser.facade || !profileUser.axioms) return null

    return (
        <div className="gap-extralarge m-auto flex h-auto w-full flex-col">
            <div className="gap-small p-medium mx-auto flex h-auto w-full flex-col rounded-none bg-cold-800 md:w-fit md:flex-row md:rounded-lg">
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
                    className="w-full md:w-fit"
                    Icon={<FollowerIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                >
                    <InfiniteScrollWrapperHard
                        items={profileUser.axioms.followers}
                        LayoutComponent={UserList}
                    />
                </Popup>
                <Popup
                    open={open === EPopup.Followings}
                    onClose={() => setOpen(undefined)}
                    title="Followings"
                    className="w-full md:w-fit"
                    Icon={<FollowingIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
                >
                    <InfiniteScrollWrapperHard
                        items={profileUser.axioms.followings}
                        LayoutComponent={UserList}
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
                                            : handleCopy(
                                                  'username',
                                                  profileUser?.facade?.username ?? ''
                                              )
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
                                            : handleCopy(
                                                  'location',
                                                  profileUser?.facade?.location ?? ''
                                              )
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
                                {editable ? (
                                    profileUser.facade.links.length > 0 ? (
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
                                        <p className="ml-normal text-left">click to add links</p>
                                    )
                                ) : profileUser.facade.links.length > 0 ? (
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
                                    <p className="ml-normal text-left">no links are set</p>
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
                                            <span className="">followers</span>
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
                                            <span className="">following</span>
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
            {memoizedTabs}
        </div>
    )
}

export default ProfileLayout
