import { useState } from 'react'

import CircleArrowLeft from '@components/Assets/circle_arrow_left.svg'
import UserArrowRight from '@components/Assets/user_arrow_right.svg'
import Deposit, { TOKENS } from '@components/Shared/Deposit'
import Popup from '@components/Shared/Popup'
import { valueOf } from 'shared/utils/tokens'

import Transfer from './Transfer'

enum EPopup {
    Deposit,
    Transfer,
}

const BalanceCard = ({
    balance,
    refreshBalances,
    token,
}: {
    balance: bigint | undefined
    refreshBalances: () => Promise<void>
    token: 'ACORN' | 'ICP'
}) => {
    const [open, setOpen] = useState<EPopup>()

    const { ColouredIcon, BigIcon } = TOKENS[token]

    return (
        <div className="py-normal px-medium flex w-full items-center justify-between rounded-lg bg-cold-50 text-cold-700 shadow-md">
            <Popup
                open={open === EPopup.Deposit}
                onClose={() => {
                    setOpen(undefined)
                    refreshBalances()
                }}
                title={`Deposit ${token}`}
                Icon={BigIcon}
                className="w-auto"
            >
                <Deposit token={token} />
            </Popup>
            <Popup
                open={open === EPopup.Transfer}
                onClose={() => {
                    setOpen(undefined)
                    refreshBalances()
                }}
                title={`Transfer ${token}`}
                Icon={BigIcon}
                className="w-full md:w-2/5"
            >
                <Transfer token={token} />
            </Popup>
            <div className="gap-medium flex items-center">
                {ColouredIcon}
                <span className="text-large font-bold text-cold-800">{valueOf(balance ?? 0n)}</span>
            </div>
            <div className="flex flex-col items-end">
                <button
                    className="text-small px-normal gap-medium py-small flex h-full items-center text-nowrap rounded-lg  font-normal text-cold-700 hover:bg-cold-800/10"
                    onClick={() => setOpen(EPopup.Deposit)}
                >
                    Deposit
                    <CircleArrowLeft className="w-5 stroke-[1.5px] md:w-6" />
                </button>
                <button
                    className="text-small px-normal gap-medium py-small flex h-full items-center text-nowrap rounded-lg  font-normal text-primary-700 hover:bg-cold-800/10"
                    onClick={() => setOpen(EPopup.Transfer)}
                >
                    Transfer
                    <UserArrowRight className="w-5 stroke-[1.5px] md:w-6" />
                </button>
            </div>
        </div>
    )
}

export default BalanceCard
