import { useEffect, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { DAxioms } from 'shared/types/services'
import { ACORN, Axioms, Treasury } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'
import { UnwrapVariant } from 'shared/utils/typings'

import FlagCard from './FlagCard'

const RequestFlag = ({ header, onSubmit }: { header: DAxioms.Header; onSubmit: () => void }) => {
    const { agent } = useAuth()
    const configs = useConfigs('Axioms')

    const [reason, setReason] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [flag, setFlag] = useState<DAxioms.SharableFlag | null>()

    useEffect(() => {
        Axioms.call(agent)
            .getFlag(header)
            .then(setFlag)
            .catch(() => setFlag(null))
    }, [header])

    const request = async () => {
        if (reason.length === 0) return

        setLoading(true)
        const approve = await promise(
            ACORN.call(agent).icrc2_approve({
                amount: configs?.['FLAG_REQUEST_FEE'][1] as bigint,
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
            Axioms.call(agent).requestFlag(header, reason),
            'Requesting flag',
            'Flag requested successfully!'
        )
        setLoading(false)
        if (res.success) onSubmit()
    }

    // const isTooShort = reason.length < (configs?.['MIN_NOMINEE_TITLE_LENGTH'][1] as bigint)
    // const isTooLong = reason.length > (configs?.['MAX_NOMINEE_TITLE_LENGTH'][1] as bigint)
    const isTooShort = reason.length < 3
    const isTooLong = reason.length > 100

    if (flag === undefined) {
        return <Spinner className="h-7 w-7 md:h-8 md:w-8" />
    }
    if (flag && UnwrapVariant(flag.status) === 'Requested') {
        return <FlagCard item={flag} className="mx-auto" />
    }

    return (
        <div className="gap-semilarge flex w-full flex-col items-center md:w-[25vw]">
            <div className="gap-small flex w-full flex-col items-center text-cold-600">
                <input
                    type="text"
                    placeholder="Input your flag reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={cn(
                        'input',
                        reason.length === 0
                            ? 'border-cold-400 focus:ring-cold-600'
                            : !isTooShort && !isTooLong
                              ? 'border-green-400 focus:ring-green-600'
                              : 'border-red-400 focus:ring-red-600'
                    )}
                />
                {reason.length > 0 && (isTooShort || isTooLong) && (
                    <div className="text-tiny flex w-full flex-col text-left">
                        {isTooShort && <span className="text-red-600">Reason is too short</span>}
                        {isTooLong && <span className="text-red-600">Reason is too long</span>}
                    </div>
                )}
            </div>
            <button
                className="button w-auto min-w-36 md:min-w-48"
                onClick={request}
                disabled={loading || reason.length === 0 || isTooShort || isTooLong}
            >
                {loading ? (
                    <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                    <>
                        Request with {valueOf(configs?.['FLAG_REQUEST_FEE'][1] as bigint)}{' '}
                        <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                    </>
                )}
            </button>
        </div>
    )
}

export default RequestFlag
