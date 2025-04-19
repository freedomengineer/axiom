'use client'

import { useState } from 'react'

import Spinner from '@components/Primitives/Spinner'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { DAO } from 'shared/utils/services'

const UpdateTitle = ({ onSubmit }: { onSubmit: () => void }) => {
    const { agent } = useAuth()
    const configs = useConfigs('DAO')

    const [title, setTitle] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const update = async () => {
        if (title.length === 0) return

        setLoading(true)
        const res = await promise(
            DAO.call(agent).updateNomineeTitle(title),
            'Updating nominee title',
            'Nominee title updated successfully!'
        )
        setLoading(false)
        if (res.success) onSubmit()
    }

    const isTooShort = title.length < (configs?.['MIN_NOMINEE_TITLE_LENGTH'][1] as bigint)
    const isTooLong = title.length > (configs?.['MAX_NOMINEE_TITLE_LENGTH'][1] as bigint)

    return (
        <div className="gap-semilarge flex w-full flex-col items-center">
            <div className="gap-small flex w-full flex-col items-center text-cold-600">
                <input
                    type="text"
                    placeholder="Input your new nominee title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(
                        'input',
                        title.length === 0
                            ? 'border-cold-400 focus:ring-cold-600'
                            : !isTooShort && !isTooLong
                              ? 'border-green-400 focus:ring-green-600'
                              : 'border-red-400 focus:ring-red-600'
                    )}
                />
                {title.length > 0 && (
                    <div className="text-tiny flex w-full flex-col text-left">
                        {isTooShort && <span className="text-red-600">Title is too short</span>}
                        {isTooLong && <span className="text-red-600">Title is too long</span>}
                    </div>
                )}
            </div>
            <button
                className="button w-auto min-w-36 md:min-w-48"
                onClick={update}
                disabled={loading || title.length === 0 || isTooShort || isTooLong}
            >
                {loading ? <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" /> : 'Update'}
            </button>
        </div>
    )
}

export default UpdateTitle
