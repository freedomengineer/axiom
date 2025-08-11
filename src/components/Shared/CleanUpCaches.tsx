import { useEffect, useState } from 'react'

import CheckIcon from '@components/Assets/check.svg'
import DeleteIcon from '@components/Assets/delete.svg'
import { deleteAllConfigsCache, getNumConfigsCache } from '@hooks/useConfigs'
import { deleteAllNotificationsCache, getNumNotificationsCache } from '@hooks/useNotification'
import { deleteAllPackagesCache, getNumPackagesCache } from '@hooks/usePackages'
import { deleteAllStatusCache, getNumStatusCache } from '@hooks/useStatus'
import { deleteAllTopCache, getNumTopCache } from '@hooks/useTop'
import { deleteAllUsernamesCache, getNumUsernamesCache } from '@hooks/useUsername'

const CACHES = [
    {
        name: 'Canisters Configs',
        delete: deleteAllConfigsCache,
        num: async () => getNumConfigsCache(),
    },
    {
        name: 'Canisters Status',
        delete: deleteAllStatusCache,
        num: async () => getNumStatusCache(),
    },
    {
        name: 'Axiom Leaderboard',
        delete: deleteAllTopCache,
        num: async () => getNumTopCache(),
    },
    {
        name: 'Axiom Packages',
        delete: deleteAllPackagesCache,
        num: async () => getNumPackagesCache(),
    },
    {
        name: 'Axiom Usernames',
        delete: deleteAllUsernamesCache,
        num: async () => getNumUsernamesCache(),
    },
    {
        name: 'User Notifications',
        delete: deleteAllNotificationsCache,
        num: async () => getNumNotificationsCache(),
    },
]

const CleanUpCaches = ({ setTotal }: { setTotal: (total: number) => void }) => {
    const [success, setSuccess] = useState<{ [key: string]: boolean }>({})
    const [num, setNum] = useState<{ [key: string]: number }>({})

    useEffect(() => {
        Promise.all(CACHES.map((cache) => cache.num().then((num) => [cache.name, num]))).then(
            (nums) => {
                setNum(Object.fromEntries(nums))
                setTotal(nums.reduce((acc, [_, num]) => (Number(num) > 0 ? acc + 1 : acc), 0))
            }
        )
    }, [])

    const refreshNum = async (name: string) => {
        const num = await CACHES.find((cache) => cache.name === name)!.num()
        let nums
        setNum((prev) => {
            nums = { ...prev, [name]: num }
            setTotal(Object.values(nums).reduce((acc, num) => (Number(num) > 0 ? acc + 1 : acc), 0))
            return nums
        })
    }

    return (
        <div className="gap-normal flex w-full flex-col">
            {CACHES.map((cache) => (
                <div className="flex items-center justify-between">
                    <p className="text-small font-normal text-cold-700">
                        {cache.name} ({num[cache.name]})
                    </p>
                    <button
                        className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                        onClick={() => {
                            cache.delete()
                            setSuccess((prev) => ({ ...prev, [cache.name]: true }))
                            refreshNum(cache.name)
                        }}
                        disabled={num[cache.name] === 0 || success[cache.name]}
                    >
                        {num[cache.name] === 0 || success[cache.name] ? (
                            <CheckIcon className="h-3.5 w-3.5 stroke-[2px] text-cold-800 md:h-4 md:w-4" />
                        ) : (
                            <DeleteIcon className="h-3.5 w-3.5 stroke-[2px] text-primary-700 md:h-4 md:w-4" />
                        )}
                    </button>
                </div>
            ))}
        </div>
    )
}

export default CleanUpCaches
