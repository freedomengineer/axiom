'use client'

import { useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { ACORN, Facade, Treasury } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'

const UpdateLocation = ({ location, onSubmit }: { location: string; onSubmit: () => void }) => {
    const { agent } = useAuth()
    const configs = useConfigs('Facade')

    const [newLocation, setNewLocation] = useState<string>('')
    const [loading, setLoading] = useState<number>()

    const update = async () => {
        if (newLocation.length === 0) return

        setLoading(1)
        await promise(
            ACORN.call(agent).icrc2_approve({
                amount: configs?.['UPDATE_LOCATION_FEE'][1] as bigint,
                spender: { owner: Treasury.principal, subaccount: [] },
                fee: [],
                from_subaccount: [],
                memo: [],
                created_at_time: [],
                expected_allowance: [],
                expires_at: [],
            }),
            'Approving ACORN to Axiom Treasury',
            'Approved ACORN to Axiom Treasury successfully!'
        )
        const res = await promise(
            Facade.call(agent).editLocation([newLocation]),
            'Updating location',
            'Location updated successfully!'
        )
        setLoading(undefined)
        if (res.success) onSubmit()
    }

    const remove = async () => {
        if (newLocation.length !== 0) return

        setLoading(0)
        const res = await promise(
            Facade.call(agent).editLocation([]),
            'Removing location',
            'Location removed successfully!'
        )
        setLoading(undefined)
        if (res.success) onSubmit()
    }

    const isTooShort = newLocation.length < (configs?.['MIN_LOCATION_LENGTH'][1] as bigint)
    const isTooLong = newLocation.length > (configs?.['MAX_LOCATION_LENGTH'][1] as bigint)

    return (
        <div className="gap-semilarge flex w-full flex-col items-center">
            <div className="gap-small flex w-full flex-col items-center text-cold-600">
                <input
                    type="text"
                    placeholder="Input your location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className={cn(
                        'input',
                        newLocation.length === 0
                            ? 'border-cold-400 focus:ring-cold-600'
                            : !isTooShort && !isTooLong
                              ? 'border-green-400 focus:ring-green-600'
                              : 'border-red-400 focus:ring-red-600'
                    )}
                />
                {newLocation.length > 0 && (
                    <div className="text-tiny flex w-full flex-col text-left">
                        {isTooShort && <span className="text-red-600">Location is too short</span>}
                        {isTooLong && <span className="text-red-600">Location is too long</span>}
                    </div>
                )}
            </div>
            {(location.length > 0 || newLocation.length > 0) && (
                <BalanceChanges
                    amount={
                        location.length && !newLocation.length
                            ? 0n
                            : (configs?.['UPDATE_LOCATION_FEE'][1] as bigint)
                    }
                />
            )}
            <div className="flex w-full justify-between">
                <button
                    className="button w-auto min-w-36 md:min-w-48"
                    onClick={remove}
                    disabled={loading === 0 || location.length === 0}
                >
                    {loading === 0 ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                        <>
                            Remove with 0{' '}
                            <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                        </>
                    )}
                </button>
                <button
                    className="button w-auto min-w-36 md:min-w-48"
                    onClick={update}
                    disabled={loading === 1 || newLocation.length === 0 || isTooShort || isTooLong}
                >
                    {loading === 1 ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                        <>
                            Update with {valueOf(configs?.['UPDATE_LOCATION_FEE'][1] as bigint)}{' '}
                            <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default UpdateLocation
