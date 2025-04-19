import Divider from '@components/Shared/Divider'
import { DDAO } from 'shared/types/services'

import ConfigsUpdateForm from './ConfigsUpdateForm'

const ConfigsForm = ({
    form,
    setForm,
}: {
    form: DDAO.SharableConfigs__1
    setForm: (form: DDAO.SharableConfigs__1) => void
}) => {
    return (
        <>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <p className="text-medium text-center font-light">
                Fill in the Actors&lsquo; modified configs
            </p>
            <div className="gap-normal text-small flex w-full flex-col">
                <ConfigsUpdateForm
                    configs={form.actorsConfigs}
                    setConfigs={(actorsConfigs) => setForm({ ...form, actorsConfigs })}
                />
            </div>
        </>
    )
}

export default ConfigsForm
