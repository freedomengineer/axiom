import { Agent, Identity } from '@dfinity/agent'
import { AuthClient, AuthClientCreateOptions, AuthClientLoginOptions } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { DFacade } from 'shared/types/services'
import { createAgent } from 'shared/utils/agent'
import { Facade } from 'shared/utils/services'

import { cacheUsername } from './useUsername'

export enum PageStatus {
    Loading,
    NotFound,
    Restricted,
    LoginRequired,
    Success,
}

type AuthContext = {
    isAuthenticated: boolean | undefined
    isLoading: boolean
    agent: Agent | undefined | null
    principal: Principal | undefined | null
    user: DFacade.Sharable | undefined | null
    refreshUser: () => Promise<DFacade.Sharable | null>
    setPemIdentity: (identity: Identity) => void
    login: () => void
    logout: () => void
    referrer: Principal | null
    pageStatus: PageStatus
    setPageStatus: (status: PageStatus) => void
}

export const AuthContext = createContext<AuthContext>({
    isAuthenticated: undefined,
    isLoading: false,
    agent: undefined,
    principal: undefined,
    user: undefined,
    refreshUser: async () => null,
    setPemIdentity: () => {},
    login: () => {},
    logout: () => {},
    referrer: null,
    pageStatus: PageStatus.Loading,
    setPageStatus: () => {},
})

const defaultOptions: {
    createOptions: AuthClientCreateOptions
    loginOptions: AuthClientLoginOptions
} = {
    createOptions: {
        idleOptions: {
            disableIdle: true,
        },
    },
    loginOptions: {
        identityProvider:
            process.env.DFX_NETWORK === 'ic'
                ? 'https://identity.ic0.app/#authorize'
                : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`,
    },
}

export const useAuthClient = () => {
    const location = useLocation()
    const pathname = location.pathname

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>()
    const [authClient, setAuthClient] = useState<AuthClient | null>()
    const [agent, setAgent] = useState<Agent | null>()
    const [principal, setPrincipal] = useState<Principal | null>()
    const [user, setUser] = useState<DFacade.Sharable | null>()
    const [referrer, setReferrer] = useState<Principal | null>(null)
    const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.Loading)
    const [pemIdentity, setPemIdentity] = useState<Identity | null>(null)

    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (pemIdentity) {
            const isAuthenticated = true
            const agent = createAgent(pemIdentity)
            const principal = pemIdentity.getPrincipal()
            refreshUser(principal).then(() => {
                setIsAuthenticated(isAuthenticated)
                setAgent(agent)
                setPrincipal(principal)
                setIsLoading(false)
            })
        } else {
            AuthClient.create(defaultOptions.createOptions).then(onSuccess)
        }

        const navigation: any = performance.getEntriesByType('navigation')[0]
        if (navigation?.type === 'navigate') {
            try {
                const urlParams = new URLSearchParams(location.search)
                const ref: string = urlParams.get('ref')!
                setReferrer(Principal.fromText(ref))
                localStorage.setItem('ref', ref)
                return
            } catch {}
        }
        try {
            const ref = localStorage.getItem('ref')!
            setReferrer(Principal.fromText(ref))
        } catch {}
    }, [pemIdentity])

    useEffect(() => {
        // Waiting for Identity initialization
        if (isAuthenticated === undefined || user === undefined) {
            setPageStatus(PageStatus.Loading)
            return
        }
        // User has no Identity
        if (isAuthenticated === false) {
            if (
                pathname === '/login' ||
                pathname === '/profile/undefined' ||
                pathname.includes('/profile/my_') ||
                pathname.includes('/post') ||
                pathname.includes('/open')
            ) {
                setPageStatus(PageStatus.Restricted)
                return
            }
        }
        // User has Identity but not registered
        if (isAuthenticated === true && user === null) {
            if (pathname !== '/login') {
                setPageStatus(PageStatus.LoginRequired)
                return
            }
        }
        // User has Identity and registered
        if (isAuthenticated === true && user !== null) {
            // if (pathname === '/login') {
            //     setPageStatus(PageStatus.Restricted)
            //     return
            // }
        }
        setPageStatus(PageStatus.Success)
    }, [isAuthenticated, user, pathname])

    const login = () => {
        setIsLoading(true)
        authClient?.login({
            ...defaultOptions.loginOptions,
            onSuccess: () => onSuccess(authClient).then(() => window.location.reload()),
            onError: () => setIsLoading(false),
        })
    }

    const onSuccess = async (client: AuthClient) => {
        const isAuthenticated = await client.isAuthenticated()
        const identity = client.getIdentity()
        const agent = createAgent(identity)
        const principal = identity.getPrincipal()
        const isAnonymous = principal.isAnonymous()

        if (isAnonymous) {
            setUser(null)
            setIsAuthenticated(false)
            setAgent(null)
            setPrincipal(null)
        } else {
            await refreshUser(principal)
            setIsAuthenticated(isAuthenticated)
            setAgent(agent)
            setPrincipal(principal)
        }
        setAuthClient(client)
        setIsLoading(false)
    }

    const logout = async () => {
        await authClient?.logout()
        setPemIdentity(null)
        setIsAuthenticated(false)
        setAgent(null)
        setPrincipal(null)
        setUser(null)
        window.location.reload()
    }

    const refreshUser = async (p = principal!): Promise<DFacade.Sharable | null> => {
        return await Facade.call()
            .getUser(p)
            .then((res) => {
                setUser(res)
                cacheUsername(p, res.username)
                return res
            })
            .catch(() => {
                setUser(null)
                return null
            })
    }

    return {
        isAuthenticated,
        isLoading,
        agent,
        principal,
        user,
        refreshUser,
        setPemIdentity,
        login,
        logout,
        referrer,
        pageStatus,
        setPageStatus,
    }
}

const useAuth = () => useContext(AuthContext)

export default useAuth
