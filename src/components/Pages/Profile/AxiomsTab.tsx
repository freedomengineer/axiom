import { Principal } from '@dfinity/principal'

import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import useAuth from '@hooks/useAuth'
import { Axioms } from 'shared/utils/services'

import HypothesisCard from '../Feed/Hypotheses/HypothesisCard'
const AxiomsTab = ({ principal }: { principal: Principal }) => {
    const { agent } = useAuth()

    return (
        <InfiniteScrollWrapper
            LayoutComponent={({ items }) => (
                <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
                    {items.map((item, i) => (
                        <HypothesisCard key={i} item={item} className="w-full" />
                    ))}
                </div>
            )}
            name="hypothesis"
            hardFilter={{ axiomsFrom: principal.toText() }}
            hardSort={{ by: 'recent', order: 'descending' }}
            query={Axioms.call(agent, true).getHypothesesPagination}
            className="h-full"
            size={12n}
        />
    )
}

export default AxiomsTab
