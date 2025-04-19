import { DAxioms } from 'shared/types/services'

import EvidenceCard from '../Evidences/EvidenceCard'

const EvidencesLayout = ({ items }: { items: DAxioms.SharableEvidence[] }) => {
    return (
        <div className="gap-small flex w-full flex-col items-center">
            {items.map((item) => (
                <EvidenceCard key={item.id} item={item} className="!w-full" />
            ))}
        </div>
    )
}

export default EvidencesLayout
