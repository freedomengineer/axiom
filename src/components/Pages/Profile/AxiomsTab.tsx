import { DAxioms } from 'shared/types/services'

import HypothesisCard from '../Feed/Hypotheses/HypothesisCard'

const AxiomsTab = ({ axioms }: { axioms: DAxioms.SharableHypothesis[] }) => {
    if (axioms.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <p className="text-tiny font-normal text-cold-700">
                    User has not adopted any axioms yet.
                </p>
            </div>
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
