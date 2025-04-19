import FieldIcon from '@components/Assets/field.svg'
import { DDAO } from 'shared/types/services'

const FieldDetachment = ({ detachment }: { detachment: DDAO.SharableField }) => {
    return (
        <div className="gap-small px-semilarge py-small flex flex-col rounded-lg border border-cold-300 text-cold-800">
            <p className="text-small gap-tiny flex place-items-center items-center text-left font-normal">
                <FieldIcon className="h-5 w-5 stroke-[1.5px] md:h-6 md:w-6" />
                <span>{detachment.name}</span>
            </p>
            <p className="text-tiny mb-auto font-light text-cold-800">{detachment.description}</p>
        </div>
    )
}

export default FieldDetachment
