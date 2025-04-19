import { useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import Divider from '@components/Shared/Divider'
import { promise } from '@libs/toastify'
import e8s from 'shared/utils/e8s'

type Progress = { current: bigint; threshold: bigint }
type ExtendedProgress = Progress & { currentSymbol: string; thresholdSymbol: string }

const UpgradeAccountAchievement = ({
    current,
    threshold,
    currentSymbol,
    thresholdSymbol,
}: ExtendedProgress) => {
    const progress = Number(current) / Number(threshold)

    return (
        <div className="my-auto flex h-min flex-col">
            <p className="text-small font-light">Qualifying progress</p>
            <div className="text-small gap-small flex w-full flex-col items-center">
                <span className="flex w-full items-center justify-between">
                    <span className="font-semibold">{e8s.toString(current)}</span>
                    <span className="font-semibold">{e8s.toString(threshold)}</span>
                </span>
                <div className="flex h-2 w-full justify-start rounded-full bg-cold-100">
                    {progress >= 1 ? (
                        <span className="h-2 w-full rounded-full bg-primary-600"></span>
                    ) : (
                        <>
                            <span
                                className="h-2 rounded-full bg-primary-600"
                                style={{ width: `${progress * 100}%` }}
                            ></span>
                            <span
                                className="h-2 rounded-full bg-cold-100"
                                style={{ width: `${(1 - progress) * 100}%` }}
                            ></span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
const OctupleBurialAchievement = ({ current, threshold }: Progress) => {
    const progress = Number(current) / Number(threshold)

    return (
        <div className="my-auto flex h-min flex-col">
            <p className="text-small font-light">Qualifying progress</p>
            <div className="text-small gap-small flex w-full flex-col items-center">
                <span className="flex w-full items-center justify-between">
                    <span className="font-semibold">{e8s.toString(current)}</span>
                    <span className="font-semibold">{e8s.toString(threshold)}</span>
                </span>
                <div className="flex h-2 w-full justify-start rounded-full bg-cold-100">
                    {progress >= 1 ? (
                        <span className="h-2 w-full rounded-full bg-primary-600"></span>
                    ) : (
                        <>
                            <span
                                className="h-2 rounded-full bg-primary-600"
                                style={{ width: `${progress * 100}%` }}
                            ></span>
                            <span
                                className="h-2 rounded-full bg-cold-100"
                                style={{ width: `${(1 - progress) * 100}%` }}
                            ></span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
const ReferralAchievement = ({ current, threshold }: Progress) => {
    const progress = Number(current) / Number(threshold)

    return (
        <div className="my-auto flex h-min flex-col">
            <p className="text-small font-light">Qualifying progress</p>
            <div className="text-small gap-small flex w-full flex-col items-center">
                <span className="flex w-full items-center justify-between">
                    <span className="font-semibold">{current}</span>
                    <span className="font-semibold">{threshold}</span>
                </span>
                <div className="flex h-2 w-full justify-start rounded-full bg-cold-100">
                    {progress >= 1 ? (
                        <span className="h-2 w-full rounded-full bg-primary-600"></span>
                    ) : (
                        <>
                            <span
                                className="h-2 rounded-full bg-primary-600"
                                style={{ width: `${progress * 100}%` }}
                            ></span>
                            <span
                                className="h-2 rounded-full bg-cold-100"
                                style={{ width: `${(1 - progress) * 100}%` }}
                            ></span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

const AchievementCard = ({
    name,
    onClaim,
    progress,
    claimed,
}: {
    name: 'UpgradeAccount' | 'OctupleBurial' | 'Referral'
    onClaim: () => Promise<void>
    progress: Progress | ExtendedProgress
    claimed: boolean
}) => {
    const [loading, setLoading] = useState(false)

    const claim = async () => {
        setLoading(true)
        await promise(
            onClaim(),
            name === 'UpgradeAccount' ? 'Upgrading account' : `Claiming ${name} achievement`,
            name === 'UpgradeAccount'
                ? 'Account upgraded successfully!'
                : `${name} achievement claimed successfully!`
        )
        setLoading(false)
    }

    const claimable = !claimed && (progress as Progress).current >= (progress as Progress).threshold

    return (
        <div className="gap-medium p-semilarge relative flex h-min w-full flex-col rounded-lg border border-cold-200 bg-white text-cold-800 shadow-md md:h-full">
            <div className="flex items-center justify-start">
                <h3 className="text-medium font-display font-bold text-primary-700">{name}</h3>
            </div>
            <div className="flex flex-col justify-between">
                {
                    {
                        UpgradeAccount: (
                            <UpgradeAccountAchievement {...(progress as ExtendedProgress)} />
                        ),
                        OctupleBurial: <OctupleBurialAchievement {...(progress as Progress)} />,
                        Referral: <ReferralAchievement {...(progress as Progress)} />,
                    }[name]
                }
            </div>
            <button className="button" onClick={claim} disabled={loading || !claimable}>
                <div
                    className="absolute -top-[1.8rem] right-[1.9rem] z-50 aria-hidden:hidden"
                    aria-hidden={!claimable}
                >
                    <div className="live-dot"></div>
                    <div className="live-animated"></div>
                </div>
                {loading ? (
                    <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                ) : claimed ? (
                    'Claimed'
                ) : claimable ? (
                    {
                        UpgradeAccount: `Claim ${progress.thresholdSymbol} package`,
                        OctupleBurial: `Claim PLANTR package`,
                        Referral: `Claim PAMPH package`,
                    }[name]
                ) : (
                    {
                        UpgradeAccount: `${e8s.toString(
                            e8s.sub(progress.threshold, progress.current)
                        )} buried left to claim ${progress.thresholdSymbol}`,
                        OctupleBurial: `${e8s.toString(
                            e8s.sub(progress.threshold, progress.current)
                        )} octuple buried left to claim PLANTR`,
                        Referral: `${
                            progress.threshold - progress.current
                        } referrals left to claim PAMPH`,
                    }[name]
                )}
            </button>
        </div>
    )
}

export default AchievementCard
