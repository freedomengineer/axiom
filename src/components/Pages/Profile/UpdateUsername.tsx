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

const UpdateUsername = ({ onSubmit }: { onSubmit: () => void }) => {
    const { agent } = useAuth()
    const configs = useConfigs('Facade')

    const [newUsername, setNewUsername] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [isTaken, setIsTaken] = useState<boolean>(false)

    const handleUsernameChange = (value: string) => {
        setNewUsername(value)
        if (value.length === 0) return
        Facade.call()
            .getUserIdentifier({ Username: value })
            .then(() => setIsTaken(true))
            .catch(() => setIsTaken(false))
    }

    const update = async () => {
        setLoading(true)
        const approve = await promise(
            ACORN.call(agent).icrc2_approve({
                amount: configs!['UPDATE_USERNAME_FEE'][1] as bigint,
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
        if (!approve.success) {
            setLoading(false)
            return
        }
        const res = await promise(
            Facade.call(agent).editUsername(newUsername),
            'Updating username',
            'Username updated successfully!'
        )
        setLoading(false)
        if (res.success) onSubmit()
    }

    const isTooShort = newUsername.length < (configs?.['MIN_USERNAME_LENGTH'][1] as bigint)
    const isTooLong = newUsername.length > (configs?.['MAX_USERNAME_LENGTH'][1] as bigint)
    const containsInvalidCharacters = new RegExp(
        `[^a-zA-Z0-9${configs?.['USERNAME_SPECIAL_CHARACTERS'][1] as string}]`
    ).test(newUsername)

    return (
        <div className="gap-semilarge flex w-full flex-col items-center">
            <div className="gap-small flex flex-col text-cold-600">
                <span className="text-tiny">
                    Your Axiom username can use any letter &apos;abc&apos; or number &apos;123&apos;
                    and can include special characters:{' '}
                    {(configs?.['USERNAME_SPECIAL_CHARACTERS'][1] as string)
                        ?.split('')
                        .map((char, i) =>
                            i === (configs?.['USERNAME_SPECIAL_CHARACTERS'][1] as string).length - 1
                                ? ` and '${char}'`
                                : i === 0
                                  ? `'${char}'`
                                  : `, '${char}'`
                        )}
                </span>
                <input
                    type="text"
                    placeholder="Input your username"
                    value={newUsername}
                    onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                    className={cn(
                        'input',
                        newUsername.length === 0
                            ? 'border-cold-400 focus:ring-cold-600'
                            : !isTaken && !isTooShort && !isTooLong && !containsInvalidCharacters
                              ? 'border-green-400 focus:ring-green-600'
                              : 'border-red-400 focus:ring-red-600'
                    )}
                    aria-selected={newUsername.length > 0}
                />
                {newUsername.length > 0 && (
                    <div className="text-tiny flex w-full flex-col text-left">
                        {isTooShort && <span className="text-red-600">Username is too short</span>}
                        {isTooLong && <span className="text-red-600">Username is too long</span>}
                        {containsInvalidCharacters && (
                            <span className="text-red-600">
                                Username contains invalid characters
                            </span>
                        )}
                        {isTaken && <span className="text-red-600">Username is already taken</span>}
                        {!isTaken && !isTooShort && !isTooLong && !containsInvalidCharacters && (
                            <span className="text-green-600">Username is available</span>
                        )}
                    </div>
                )}
            </div>
            <BalanceChanges amount={configs?.['UPDATE_USERNAME_FEE'][1] as bigint} />
            <button
                className="button w-auto min-w-36 md:min-w-48"
                onClick={update}
                disabled={
                    loading || isTaken || isTooShort || isTooLong || containsInvalidCharacters
                }
            >
                {loading ? (
                    <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                    <>
                        Update with {valueOf(configs?.['UPDATE_USERNAME_FEE'][1] as bigint)}{' '}
                        <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                    </>
                )}
            </button>
        </div>
    )
}

export default UpdateUsername
