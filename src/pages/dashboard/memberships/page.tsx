import { useState } from 'react'

import PackageIcon from '@components/Assets/package.svg'
import Achievement from '@components/Pages/ACEDashboard/Memberships/Achievement'
import AchievementDetails from '@components/Pages/ACEDashboard/Memberships/AchievementDetails'
import Membership from '@components/Pages/ACEDashboard/Memberships/Membership'
import MembershipDetails from '@components/Pages/ACEDashboard/Memberships/MembershipDetails'
import PageMetadata from '@components/Shared/PageMetadata'
import Popup from '@components/Shared/Popup'
import siteMetadata from '@data/siteMetadata.json'
import useConfigs from '@hooks/useConfigs'
import usePackages, { EPackages, ParsedPackages } from '@hooks/usePackages'

const title = 'Memberships'
const metadata = siteMetadata.routes['ACE Dashboard'].routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const MembershipsPage = () => {
    const configs = useConfigs('Sales')
    const memberships = usePackages(EPackages.Membership, configs)
    const achievements = usePackages(EPackages.Achievement, configs)
    const [selectedPackage, setSelectedPackage] = useState<ParsedPackages<EPackages>>()

    return (
        <>
            <PageMetadata {...pageMetadata} />
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
            <div className="gap-extralarge mx-auto grid w-fit grid-cols-2 justify-items-center md:grid-cols-4">
                {(memberships ?? []).map((p) => (
                    <Membership key={p.symbol} item={p} setSelected={() => setSelectedPackage(p)} />
                ))}
                {(achievements ?? []).map((p) => (
                    <Achievement
                        key={p.symbol}
                        item={p}
                        setSelected={() => setSelectedPackage(p)}
                    />
                ))}
            </div>
        </>
    )
}

export default MembershipsPage
