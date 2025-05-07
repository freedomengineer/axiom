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
        <div className="py-normal px-medium flex w-full items-center justify-between rounded-lg bg-cold-800 text-white">
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
                <span className="text-lg font-bold text-white md:text-2xl">
                    {valueOf(balance ?? 0n)}
                </span>
            </div>
            <div className="gap-tiny flex w-fit flex-col items-end">
                <button
                    className="text-tiny px-normal gap-medium py-small flex h-full w-full items-center justify-end text-nowrap rounded-lg bg-white/100 font-normal text-cold-800 hover:bg-white/75"
                    onClick={() => setOpen(EPopup.Deposit)}
                >
                    Deposit
                    <CircleArrowLeft className="w-4 stroke-[1.5px] md:w-5" />
                </button>
                <button
                    className="text-tiny px-normal gap-medium py-small flex h-full w-full items-center justify-end text-nowrap rounded-lg bg-white/100 font-normal text-primary-800 hover:bg-white/75"
                    onClick={() => setOpen(EPopup.Transfer)}
                >
                    Transfer
                    <UserArrowRight className="w-4 stroke-[1.5px] md:w-5" />
                </button>
            </div>
        </div>
    )
}

export default BalanceCard
