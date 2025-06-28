import { DAxioms } from 'shared/types/services'

import FieldCard from '../Feed/Fields/FieldCard'

const FieldsTab = ({ fields }: { fields: DAxioms.SharableField[] }) => {
    if (fields.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <p className="text-tiny font-normal text-cold-700">
                    User has not joined any fields yet.
                </p>
            </div>
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
