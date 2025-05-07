import { DAxioms } from 'shared/types/services'

import HypothesisCard from '../Feed/Hypotheses/HypothesisCard'

const HypothesesTab = ({
    hypotheses,
    type,
}: {
    hypotheses: DAxioms.SharableHypothesis[]
    type: 'Published' | 'Voted'
}) => {
    if (hypotheses.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <p className="text-small font-light text-cold-700">
                    User has not {type === 'Published' ? 'published' : 'voted on'} any hypotheses
                    yet.
                </p>
            </div>
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
