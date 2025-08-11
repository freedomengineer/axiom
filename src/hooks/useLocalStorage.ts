import { useEffect, useState } from 'react'

import { StringifiedFilterSort } from 'shared/default/filter_sort'

export type LocalStorageData = StringifiedFilterSort & {
    alphaStageAlert: boolean
    version: string
    sideBarToggle1: boolean
    sideBarToggle2: boolean
    sideBarToggle3: boolean
    sessionExpiry: number
    customVoteValues: {
        Scale: number[]
        Custom: number[]
    }
}

const _default: LocalStorageData = {
    alphaStageAlert: true,
    version: '0.0.0',
    sideBarToggle1: true,
    sideBarToggle2: true,
    sideBarToggle3: true,
    sessionExpiry: 0,
    customVoteValues: {
        Scale: [0, 25, 50, 75, 100],
        Custom: [1000, 5000],
    },
    hypothesis: {
        filter: { age: '2' },
        sort: { by: 'popularity', order: 'descending' },
    },
    field: {
        filter: {},
        sort: { by: 'popularity', order: 'descending' },
    },
    evidence: {
        filter: {},
        sort: { by: 'popularity', order: 'descending' },
    },
    user: {
        filter: {},
        sort: { by: 'capitalRaised', order: 'descending' },
    },
    nominee: {
        filter: {},
        sort: { by: 'token', order: 'descending' },
    },
    proposal: {
        filter: {},
        sort: { by: 'updated', order: 'descending' },
    },
    flag: {
        filter: {},
        sort: { by: 'recent', order: 'descending' },
    },
}

export const getLocalConfig = <T extends keyof LocalStorageData>(key: T): LocalStorageData[T] => {
    const item = localStorage.getItem(key)
    if (item) {
        try {
            return JSON.parse(item)
        } catch (e) {
            console.error(`Error parsing localStorage item for ${key}:`, e)
        }
    }
    localStorage.setItem(key, JSON.stringify(_default[key]))
    return _default[key]
}
export const setLocalConfig = <T extends keyof LocalStorageData>(
    key: T,
    value: LocalStorageData[T]
) => {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.error(`Error setting localStorage item for ${key}:`, e)
    }
}

const useLocalStorage = <T extends keyof LocalStorageData>(
    key: T
): [LocalStorageData[T], (value: LocalStorageData[T]) => void] => {
    const [data, setData] = useState<LocalStorageData[T]>(getLocalConfig(key))

    const setLocalData = (value: LocalStorageData[T]) => {
        setData(value)
        setLocalConfig(key, value)
        // Dispatch custom event to notify other instances
        window.dispatchEvent(new CustomEvent(`localStorage-${key}`, { detail: value }))
    }

    useEffect(() => {
        // Listen for changes from other instances
        const handleStorageChange = (e: CustomEvent) => {
            setData(e.detail)
        }

        // Listen for storage events (from other tabs/windows)
        const handleBrowserStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    const newValue = JSON.parse(e.newValue)
                    setData(newValue)
                } catch (error) {
                    console.error(`Error parsing storage event for ${key}:`, error)
                }
            }
        }

        const eventName = `localStorage-${key}` as const
        window.addEventListener(eventName, handleStorageChange as EventListener)
        window.addEventListener('storage', handleBrowserStorageChange)

        return () => {
            window.removeEventListener(eventName, handleStorageChange as EventListener)
            window.removeEventListener('storage', handleBrowserStorageChange)
        }
    }, [key])

    return [data, setLocalData]
}

export default useLocalStorage
