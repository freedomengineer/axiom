import { DAxioms } from 'shared/types/services'

import EvidenceCard from '../Evidences/EvidenceCard'

const EvidencesLayout = ({
    items,
    onReply,
    localHypothesis,
    setLocalHypothesis,
}: {
    items: DAxioms.SharableEvidence[]
    onReply: (id: bigint) => void
    localHypothesis?: DAxioms.SharableHypothesis
    setLocalHypothesis: (item: DAxioms.SharableHypothesis) => void
}) => {
    return (
        <div className="gap-small flex w-full flex-col items-center">
            {items.map((item) => (
                <EvidenceCard
                    key={item.id}
                    item={item}
                    className="!w-full"
                    onReply={onReply}
                    localHypothesis={localHypothesis}
                    setLocalHypothesis={setLocalHypothesis}
                />
            ))}
        </div>
    )
}

export default EvidencesLayout
