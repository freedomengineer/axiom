import { useState } from 'react'

import ConfigsIcon from '@components/Assets/configs.svg'
import SearchableSelect from '@components/Primitives/SearchableSelect'
import Select from '@components/Primitives/Select'
import useUpdateConfigs from '@hooks/useUpdateConfigs'
import { CONFIGS_TYPES, CONFIGURABLE_ACTORS } from '@utils/indicator/configs'
import { DDAO } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

import ValueInput from './ValueInput'
import ConfigsDetachment from '../ProposalDetachments/ConfigsDetachment'

const ConfigsUpdateForm = ({
    configs,
    setConfigs: setForm,
}: {
    configs: DDAO.ActorsConfigs
    setConfigs: (configs: DDAO.ActorsConfigs) => void
}) => {
    const [selectedActor, setSelectedActor] = useState<(typeof CONFIGURABLE_ACTORS)[number] | null>(
        null
    )

    const {
        value,
        key,
        isLoading,
        variableOptions,
        isAddButtonDisabled,
        setValue,
        handleSelectVariable,
        handleTypeChange,
        handleAddNewConfig,
        handleRemoveConfig,
    } = useUpdateConfigs(selectedActor, configs, setForm)

    const hasConfigs = (actor: string) =>
        (configs.find(([variant]) => UnwrapVariant(variant) === actor)?.[1] ?? []).length > 0

    return (
        <>
            <div className="gap-small flex w-full overflow-x-auto md:overflow-x-hidden">
                {CONFIGURABLE_ACTORS.map((actor) => (
                    <button
                        key={actor}
                        onClick={() => setSelectedActor(actor)}
                        aria-selected={selectedActor === actor}
                        className="button relative w-full border border-cold-800 bg-opacity-0 text-cold-800 hover:bg-cold-800 hover:text-white aria-selected:bg-cold-800 aria-selected:text-white"
                    >
                        {actor}
                        <div className="absolute -right-0.5 -top-3 z-10 flex items-center justify-center -space-x-3">
                            {hasConfigs(actor) && (
                                <ConfigsIcon className="p-extratiny h-7 w-7 rounded-full border-[1.5px] border-white bg-primary-700 stroke-2 text-white" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
            <div className="gap-small grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
                <div className="gap-small flex w-full">
                    <SearchableSelect
                        onChange={handleSelectVariable}
                        options={variableOptions}
                        value={key}
                        disabled={!selectedActor || isLoading}
                        placeholder="Select or type a Key to edit"
                        className="w-full"
                        customizable={false}
                    />
                    <Select
                        onChange={(value) =>
                            handleTypeChange(value as (typeof CONFIGS_TYPES)[number])
                        }
                        options={CONFIGS_TYPES.map((type) => ({ label: type }))}
                        value={value ? UnwrapVariant(value)[0] : undefined}
                        placeholder="Select a Type"
                        disabled={!selectedActor || isLoading}
                        className="w-[10.5rem]"
                    />
                </div>
                <div className="gap-small flex w-full">
                    <ValueInput
                        value={value}
                        setValue={setValue}
                        selectedActor={selectedActor}
                        isLoading={isLoading}
                    />
                    <button
                        onClick={handleAddNewConfig}
                        disabled={isAddButtonDisabled || isLoading}
                        className="button w-[10.25rem] md:w-[10.75rem]"
                    >
                        Add Variable
                    </button>
                </div>
            </div>
            <ConfigsDetachment
                detachment={{ actorsConfigs: configs }}
                onClick={handleRemoveConfig}
                showOldValue
            />
        </>
    )
}

export default ConfigsUpdateForm
