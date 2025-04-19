import { DAxioms } from 'shared/types/services'

import FieldCard from '../Feed/Fields/FieldCard'

const FieldsTab = ({ fields }: { fields: DAxioms.SharableField[] }) => {
    if (fields.length === 0) {
        return (
            <p className="text-normal text-center font-light text-cold-800">
                User has no joined fields yet
            </p>
        )
    }

    return (
        <div className="gap-medium mx-auto flex w-full max-w-full flex-wrap justify-center md:max-w-[1500px]">
            {fields.map((item, i) => (
                <FieldCard key={i} item={item} className="w-full" />
            ))}
        </div>
    )
}

export default FieldsTab
