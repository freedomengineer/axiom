import { Principal } from '@dfinity/principal'

import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import useAuth from '@hooks/useAuth'
import { Axioms } from 'shared/utils/services'

import FieldCard from '../Feed/Fields/FieldCard'

const FieldsTab = ({ principal }: { principal: Principal }) => {
    const { agent } = useAuth()

    return (
        <InfiniteScrollWrapper
            LayoutComponent={({ items }) => (
                <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
                    {items.map((item, i) => (
                        <FieldCard key={i} item={item} className="w-full" />
                    ))}
                </div>
            )}
            name="field"
            hardFilter={{ member: principal.toText() }}
            hardSort={{ by: 'recent', order: 'descending' }}
            query={Axioms.call(agent, true).getFieldsPagination}
            className="h-full w-full"
            size={12n}
        />
    )
}

export default FieldsTab
