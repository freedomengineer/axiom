import { DAxioms } from 'shared/types/services'

import HypothesisCard from '../Feed/Hypotheses/HypothesisCard'

const AxiomsTab = ({ axioms }: { axioms: DAxioms.SharableHypothesis[] }) => {
    if (axioms.length === 0) {
        return (
            <p className="text-normal text-center font-light text-cold-800">
                User has no adopted axioms yet
            </p>
        )
    }

    return (
        <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
            {axioms.map((item, i) => (
                <HypothesisCard key={i} item={item} className="w-full" />
            ))}
        </div>
    )
}

export default AxiomsTab
