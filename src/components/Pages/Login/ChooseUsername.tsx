import { useState } from 'react'

import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { Choices, ESteps, StepProps } from '@utils/login/step'
import { Facade } from 'shared/utils/services'

const ChooseUsername = ({ choices, setChoice, handleNext }: StepProps) => {
    const configs = useConfigs('Facade')
    const [username, setUsername] = useState<Choices[ESteps.Username]>(choices[ESteps.Username])
    const [isTaken, setIsTaken] = useState<boolean>(false)

    const handleUsernameChange = (value: string) => {
        setUsername(value)
        if (value.length === 0) return
        Facade.call()
            .getUserIdentifier({ Username: value })
            .then(() => setIsTaken(true))
            .catch(() => setIsTaken(false))
    }

    const isTooShort = username.length < (configs?.['MIN_USERNAME_LENGTH'][1] as bigint)
    const isTooLong = username.length > (configs?.['MAX_USERNAME_LENGTH'][1] as bigint)
    const containsInvalidCharacters = new RegExp(
        `[^a-zA-Z0-9${configs?.['USERNAME_SPECIAL_CHARACTERS'][1] as string}]`
    ).test(username)

    return (
        <>
            <div className="gap-small text-small flex flex-col text-cold-600">
                <span>
                    Consider using a pseudonym that is not connected with your real world identity,
                    so that you have the freedom to speak the absolute truth about the reality that
                    you observe around you.
                </span>
                <span>
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
                <span>You will be able to change your username later.</span>
            </div>
            <div className="gap-normal flex flex-col">
                <input
                    type="text"
                    placeholder={choices[ESteps.Username] ?? 'Input your username'}
                    disabled={choices[ESteps.Checkout]}
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                    className={cn(
                        'input',
                        username.length === 0
                            ? 'border-cold-400 focus:ring-cold-600'
                            : !isTaken && !isTooShort && !isTooLong && !containsInvalidCharacters
                              ? 'border-green-400 focus:ring-green-600'
                              : 'border-red-400 focus:ring-red-600'
                    )}
                    aria-selected={username.length > 0}
                />
                {username.length > 0 && (
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
            <button
                className="button ml-auto min-w-36 md:min-w-48"
                onClick={() => {
                    setChoice(username)
                    handleNext()
                }}
                disabled={
                    isTaken ||
                    isTooShort ||
                    isTooLong ||
                    containsInvalidCharacters ||
                    choices[ESteps.Checkout]
                }
            >
                {isTaken || isTooShort || isTooLong || containsInvalidCharacters
                    ? 'Choose a username'
                    : 'Continue with ' + username}
            </button>
        </>
    )
}

export default ChooseUsername
