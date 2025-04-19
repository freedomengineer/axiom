import Divider from '@components/Shared/Divider'
import { DDAO } from 'shared/types/services'

const FieldForm = ({
    form,
    setForm,
}: {
    form: DDAO.SharableField
    setForm: (form: DDAO.SharableField) => void
}) => {
    return (
        <>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <p className="text-medium text-center font-light">Fill in the Field&lsquo;s details</p>
            <div className="gap-small text-small grid w-full grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
                <input
                    type="text"
                    placeholder="Field Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    aria-selected={!!form.name}
                    className="input"
                />
                <input
                    type="text"
                    placeholder="Field Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    aria-selected={!!form.description}
                    className="input"
                />
            </div>
        </>
    )
}

export default FieldForm
