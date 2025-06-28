import { Principal } from '@dfinity/principal'
import { useEffect, useState } from 'react'

import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import { TOKENS } from '@components/Shared/Deposit'
import Divider from '@components/Shared/Divider'
import useAuth from '@hooks/useAuth'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { N_DECIMALS } from 'shared/constants'
import e8s from 'shared/utils/e8s'
import { Facade } from 'shared/utils/services'
import { amountOf } from 'shared/utils/tokens'

const Transfer = ({ token }: { token: 'ACORN' | 'ICP' }) => {
    const { agent } = useAuth()

    const [recipient, setRecipient] = useState<string>('')
    const [recipientUsername, setRecipientUsername] = useState<string>()
    const [recipientPrincipal, setRecipientPrincipal] = useState<Principal>()
    const [amount, setAmount] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [balance, setBalance] = useState<bigint>(0n)

    const [balanceRefreshKey, setBalanceRefreshKey] = useState(0)

    useEffect(() => {
        if (recipient) {
            try {
                const principal = Principal.fromText(recipient)
                Facade.call()
                    .getUserIdentifier({ Principal: principal })
                    .then((res) => setRecipientUsername(res.username))
                    .catch(() => setRecipientUsername(''))
                setRecipientPrincipal(principal)
            } catch {
                setRecipientPrincipal(undefined)
                Facade.call()
                    .getUserIdentifier({ Username: recipient })
                    .then((res) => {
                        setRecipientUsername(res.username)
                        setRecipientPrincipal(res.principal)
                    })
                    .catch(() => setRecipientUsername(''))
            }
        }
    }, [recipient])

    const { Ledger, SmallIcon } = TOKENS[token]

    const transfer = async () => {
        setLoading(true)
        await promise(
            Ledger.call(agent, true)
                .icrc1_transfer({
                    amount: amountOf(Number(amount)),
                    to: { owner: recipientPrincipal!, subaccount: [] },
                    fee: [],
                    from_subaccount: [],
                    memo: [],
                    created_at_time: [],
                })
                .catch((e) => console.log(e)),
            `Transferring ${token}`,
            `${token} transferred successfully!`
        )
        setBalanceRefreshKey((prevKey) => prevKey + 1)
        setAmount('')
        setLoading(false)
    }

    const isInsufficient = !!Number(amount) && Number(amount) > e8s.toNumber(balance)

    return (
        <div className="gap-semilarge flex w-full flex-col items-center">
            <div className="gap-small flex w-full flex-col items-center text-cold-600">
                <input
                    type="text"
                    placeholder="Input recipient's principal/username"
                    value={recipientUsername ? recipientUsername : recipient}
                    onChange={(e) => setRecipient(e.target.value.toLowerCase())}
                    className={cn(
                        'input',
                        recipient === ''
                            ? 'border-cold-400 focus:ring-cold-600'
                            : recipientPrincipal
                              ? 'border-green-400 focus:ring-green-600'
                              : 'border-red-400 focus:ring-red-600'
                    )}
                />
                {recipient !== '' && !recipientPrincipal && (
                    <div className="text-tiny flex w-full flex-col text-left">
                        {!recipientPrincipal && (
                            <span className="text-red-600">Invalid principal/username</span>
                        )}
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Input your transfer amount"
                    value={amount}
                    onChange={(e) => {
                        let val = e.target.value.replace(/,/g, '.')
                        if (!/^\d*\.?\d*$/.test(val)) return
                        const [intPart, decPart] = val.split('.')
                        if (decPart && decPart.length > N_DECIMALS) {
                            val = `${intPart}.${decPart.slice(0, N_DECIMALS)}`
                        }
                        setAmount(val)
                    }}
                    className={cn(
                        'input',
                        !Number(amount)
                            ? 'border-cold-400 focus:ring-cold-600'
                            : !isInsufficient
                              ? 'border-green-400 focus:ring-green-600'
                              : 'border-red-400 focus:ring-red-600'
                    )}
                />
                {!!Number(amount) && isInsufficient && (
                    <div className="text-tiny flex w-full flex-col text-left">
                        {isInsufficient && (
                            <span className="text-red-600">
                                Transfer amount exceeds your balance
                            </span>
                        )}
                    </div>
                )}
            </div>
            <BalanceChanges
                key={balanceRefreshKey}
                amount={amountOf(Number(amount))}
                token={token}
                setBalance={setBalance}
            />
            <Divider
                className="mx-auto w-full md:w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <button
                className="button w-auto min-w-36 md:min-w-48"
                onClick={transfer}
                disabled={!Number(amount) || isInsufficient || !recipientPrincipal || loading}
            >
                {loading ? (
                    <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                ) : !Number(amount) ? (
                    <span>Input transfer amount</span>
                ) : isInsufficient ? (
                    <span>Transfer amount exceeds your balance</span>
                ) : (
                    <span className="gap-small flex">
                        Transfer with {amount} {SmallIcon}
                    </span>
                )}
            </button>
        </div>
    )
}

export default Transfer
