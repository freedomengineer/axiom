import { Outlet, RouteObject, createBrowserRouter } from 'react-router-dom'

import Error from '@components/Layout/Error'
import LayoutWrapper from '@components/Layout/LayoutWrapper'
import Layout from '@layout'
import MembershipsPage from '@pages/assets/memberships/page'
import AssetsPage from '@pages/assets/page'
import CustodiansPage from '@pages/dashboard/custodians/page'
import OpenProposalPage from '@pages/dashboard/open/page'
import DashboardPage from '@pages/dashboard/page'
import ProposalPage from '@pages/dashboard/proposals/[proposal]/page'
import ProposalsPage from '@pages/dashboard/proposals/page'
import EvidencePage from '@pages/feed/[hypothesis]/evidences/[evidence]/page'
import PostEvidencePage from '@pages/feed/[hypothesis]/evidences/post/page'
import HypothesisPage from '@pages/feed/[hypothesis]/page'
import OtherEvidencePage from '@pages/feed/evidences/[evidence]/page'
import EvidencesPage from '@pages/feed/evidences/page'
import FieldPage from '@pages/feed/fields/[field]/page'
import FieldsPage from '@pages/feed/fields/page'
import FlagsPage from '@pages/feed/flags/page'
import SpecificHistoryPage from '@pages/feed/history/[ago]/page'
import HistoryPage from '@pages/feed/history/page'
import FeedPage from '@pages/feed/page'
import PostHypothesisPage from '@pages/feed/post/page'
import HomePage from '@pages/home/page'
import LoginPage from '@pages/login/page'
import PublicProfilePage from '@pages/profile/[principal]/page'
import MyAssetsPage from '@pages/profile/my_assets/page'
import ProfilePage from '@pages/profile/page'
import SpecificSearchPage from '@pages/search/[type]/page'
import SearchPage from '@pages/search/page'

const createNestedRoutes = (routes: RouteObject[]): RouteObject[] => {
    return routes.map((route) =>
        route.children ? { ...route, children: createNestedRoutes(route.children) } : route
    )
}

const routes: RouteObject[] = [
    {
        path: '/',
        element: <Layout />,
        errorElement: (
            <LayoutWrapper noMiddleWare>
                <Error />
            </LayoutWrapper>
        ),
        children: [
            { index: true, element: <HomePage /> },
            { path: 'login', element: <LoginPage /> },
            {
                path: 'feed',
                element: <Outlet />,
                children: [
                    { index: true, element: <FeedPage /> },
                    { path: 'post', element: <PostHypothesisPage /> },
                    {
                        path: ':hypothesis',
                        element: <Outlet />,
                        children: [
                            { index: true, element: <HypothesisPage /> },
                            {
                                path: 'evidences',
                                element: <Outlet />,
                                children: [
                                    { path: ':evidence', element: <EvidencePage /> },
                                    { path: 'post', element: <PostEvidencePage /> },
                                ],
                            },
                        ],
                    },
                    {
                        path: 'evidences',
                        element: <Outlet />,
                        children: [
                            { index: true, element: <EvidencesPage /> },
                            { path: ':evidence', element: <OtherEvidencePage /> },
                        ],
                    },
                    {
                        path: 'fields',
                        element: <Outlet />,
                        children: [
                            { index: true, element: <FieldsPage /> },
                            {
                                path: ':field',
                                element: <Outlet />,
                                children: [{ index: true, element: <FieldPage /> }],
                            },
                        ],
                    },
                    {
                        path: 'history',
                        element: <Outlet />,
                        children: [
                            { index: true, element: <HistoryPage /> },
                            { path: ':ago', element: <SpecificHistoryPage /> },
                        ],
                    },
                    {
                        path: 'flags',
                        element: <Outlet />,
                        children: [{ index: true, element: <FlagsPage /> }],
                    },
                ],
            },
            {
                path: 'dashboard',
                element: <Outlet />,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: 'custodians', element: <CustodiansPage /> },
                    { path: 'open', element: <OpenProposalPage /> },
                    {
                        path: 'proposals',
                        element: <Outlet />,
                        children: [
                            { index: true, element: <ProposalsPage /> },
                            { path: ':proposal', element: <ProposalPage /> },
                        ],
                    },
                ],
            },
            {
                path: 'assets',
                element: <Outlet />,
                children: [
                    { index: true, element: <AssetsPage /> },
                    { path: 'memberships', element: <MembershipsPage /> },
                ],
            },
            {
                path: 'profile',
                element: <Outlet />,
                children: [
                    { index: true, element: <ProfilePage /> },
                    { path: ':principal', element: <PublicProfilePage /> },
                    { path: 'my_assets', element: <MyAssetsPage /> },
                ],
            },
            {
                path: 'search',
                element: <Outlet />,
                children: [
                    { index: true, element: <SearchPage /> },
                    { path: ':type', element: <SpecificSearchPage /> },
                ],
            },
        ],
    },
]

export const router = createBrowserRouter(createNestedRoutes(routes))
