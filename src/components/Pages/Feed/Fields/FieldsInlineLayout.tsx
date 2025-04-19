'use client'

import ListWrapper from '@components/Shared/ListWrapper'
import useAuth from '@hooks/useAuth'
import { FIELD_FILTER, FIELD_SORT } from 'shared/default/filter_sort'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'

import FieldInline from './FieldInline'

const Layout = ({ items }: { items: DAxioms.SharableField[] }) => {
    return (
        <div className="gap-tiny flex w-full flex-wrap justify-center">
            {items.map((item, i) => (
                <FieldInline key={i} item={item} />
            ))}
        </div>
    )
}

const FieldsInlineLayout = ({
    hardFilter = {},
    hardSort = {},
}: {
    hardFilter?: any
    hardSort?: any
}) => {
    const { agent } = useAuth()

    return (
        <ListWrapper<DAxioms.SharableField>
            LayoutComponent={Layout}
            query={Axioms.call(agent, true).getFieldsPagination}
            filter={FIELD_FILTER}
            sort={FIELD_SORT}
            hardFilter={hardFilter}
            hardSort={hardSort}
        />
    )
}

export default FieldsInlineLayout
