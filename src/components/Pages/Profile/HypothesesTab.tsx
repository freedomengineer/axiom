import { DAxioms } from 'shared/types/services'

import HypothesisCard from '../Feed/Hypotheses/HypothesisCard'

const HypothesesTab = ({ hypotheses }: { hypotheses: DAxioms.SharableHypothesis[] }) => {
    if (hypotheses.length === 0) {
        return (
            <p className="text-normal text-center font-light text-cold-800">
                User has no published hypotheses yet
            </p>
        )
    }

    return (
        <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
            {hypotheses.map((item, i) => (
                <HypothesisCard key={i} item={item} className="w-full" />
            ))}
        </div>
    )
}

export default HypothesesTab
