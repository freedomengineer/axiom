import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'

import { DAxioms } from 'shared/types/services'

import EvidenceCard from '../Feed/Evidences/EvidenceCard'

const EvidencesTab = ({ evidences }: { evidences: DAxioms.SharableEvidence[] }) => {
    if (evidences.length === 0) {
        return (
            <p className="text-normal text-center font-light text-cold-800">
                User has no published evidences yet
            </p>
        )
    }

    return (
        <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
            <ResponsiveMasonry
                columnsCountBreakPoints={{ [530]: 1, [530 * 2]: 2, [530 * 3]: 3 }}
                className="gap-medium mx-auto w-full max-w-[1500px]"
            >
                <Masonry>
                    {evidences.map((item, i) => (
                        <EvidenceCard key={i} item={item} className="mx-auto !w-full" />
                    ))}
                </Masonry>
            </ResponsiveMasonry>
        </div>
    )
}

export default EvidencesTab
