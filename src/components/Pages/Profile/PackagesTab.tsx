import { useState } from 'react'

import PackageIcon from '@components/Assets/package.svg'
import Popup from '@components/Shared/Popup'
import { EPackages, ParsedPackages } from '@hooks/usePackages'
import { DSales } from 'shared/types/services'

import Achievement from '../Assets/Memberships/Achievement'
import AchievementDetails from '../Assets/Memberships/AchievementDetails'
import Membership from '../Assets/Memberships/Membership'
import MembershipDetails from '../Assets/Memberships/MembershipDetails'

const PackagesTab = ({ packages }: { packages: ParsedPackages<EPackages> }) => {
    const [selectedPackage, setSelectedPackage] = useState<
        DSales.SharablePackage | DSales.SharableAchievementPackage
    >()

    if (packages.length === 0) {
        return (
            <p className="text-normal text-center font-light text-cold-800">
                User has no packages yet
            </p>
        )
    }

    return (
        <>
            <Popup
                open={selectedPackage !== undefined}
                onClose={() => setSelectedPackage(undefined)}
                title="Package details"
                Icon={<PackageIcon className="h-6 w-6 stroke-[1.5px] md:h-7 md:w-7" />}
                className="w-full md:w-2/3"
            >
                <div className="w-full overflow-x-auto rounded-lg border border-cold-300 md:overflow-hidden">
                    {selectedPackage &&
                        ('originalPrice' in selectedPackage ? (
                            <MembershipDetails item={selectedPackage} />
                        ) : (
                            <AchievementDetails item={selectedPackage} />
                        ))}
                </div>
            </Popup>
            <div className="gap-medium mx-auto grid w-full grid-cols-2 justify-items-center md:grid-cols-4">
                {packages.map((p) =>
                    'originalPrice' in p ? (
                        <Membership
                            key={p.symbol}
                            item={p}
                            setSelected={() => setSelectedPackage(p)}
                        />
                    ) : (
                        <Achievement
                            key={p.symbol}
                            item={p}
                            setSelected={() => setSelectedPackage(p)}
                        />
                    )
                )}
            </div>
        </>
    )
}

export default PackagesTab
