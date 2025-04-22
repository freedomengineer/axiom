import { useState } from 'react'

import CodeIcon from '@components/Assets/code.svg'
import ConfigsIcon from '@components/Assets/configs.svg'
import SearchableSelect from '@components/Primitives/SearchableSelect'
import Select from '@components/Primitives/Select'
import useUpdateConfigs from '@hooks/useUpdateConfigs'
import useUploadWasm from '@hooks/useUploadWasm'
import cn from '@libs/class'
import { CONFIGS_TYPES, DEPLOYABLE_ACTORS } from '@utils/indicator/configs'
import { DDAO } from 'shared/types/services'
import { UnwrapVariant } from 'shared/utils/typings'

import ValueInput from './ValueInput'
import ConfigsDetachment from '../ProposalDetachments/ConfigsDetachment'
import ModulesDetachment from '../ProposalDetachments/ModulesDetachment'

const ConfigsAndWasmUpload = ({
    configs,
    setConfigs,
    commitments,
    setCommitments,
    rawCommitments,
    setRawCommitments,
}: {
    configs: DDAO.ActorsConfigs
    setConfigs: (configs: DDAO.ActorsConfigs) => void
    commitments: DDAO.SharableCommitment[]
    setCommitments: (commitments: DDAO.SharableCommitment[]) => void
    rawCommitments: Record<string, Commitment>
    setRawCommitments: (commitments: Record<string, Commitment>) => void
}) => {
    const [selectedActor, setSelectedActor] = useState<(typeof DEPLOYABLE_ACTORS)[number] | null>(
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
    } = useUpdateConfigs(selectedActor, configs, setConfigs)
    const { fileInputRef, currentCommitment, handleFileChange, handleRemoveCommitment } =
        useUploadWasm(selectedActor, commitments, setCommitments, rawCommitments, setRawCommitments)

    const hasConfigs = (actor: string) =>
        (configs.find(([variant]) => UnwrapVariant(variant) === actor)?.[1] ?? []).length > 0
    const hasCommitment = (actor: string) =>
        commitments.some((c) => UnwrapVariant(c.actorVariant) === actor)

    return (
        <>
            <div className="gap-small flex w-full overflow-x-scroll md:overflow-visible">
                {DEPLOYABLE_ACTORS.map((actor) => (
                    <button
                        key={actor}
                        onClick={() => setSelectedActor(actor)}
                        aria-selected={selectedActor === actor}
                        className="button relative w-full border border-cold-800 bg-opacity-0 text-cold-800 hover:bg-cold-800 hover:text-white aria-selected:bg-cold-800 aria-selected:text-white"
                    >
                        {actor}
                        <div className="absolute -right-0.5 -top-3 z-10 flex items-center justify-center -space-x-2">
                            {hasConfigs(actor) && (
                                <ConfigsIcon className="p-extratiny h-5 w-5 rounded-full border-[1.5px] border-white bg-primary-700 stroke-2 text-white md:h-6 md:w-6" />
                            )}
                            {hasCommitment(actor) && (
                                <CodeIcon className="p-extratiny h-5 w-5 rounded-full border-[1.5px] border-white bg-primary-700 stroke-2 text-white md:h-6 md:w-6" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
            <div className="gap-small flex flex-col md:grid md:grid-cols-2">
                <label
                    htmlFor={`wasm-upload-${selectedActor}`}
                    className={cn(
                        'input !px-normal !py-small group relative flex h-14 w-full flex-col items-start justify-center overflow-hidden rounded-lg text-left md:h-full',
                        selectedActor
                            ? 'cursor-pointer hover:bg-cold-800/10'
                            : 'pointer-events-none bg-cold-900/10'
                    )}
                    aria-selected={!!currentCommitment}
                >
                    {currentCommitment ? (
                        <>
                            <p>
                                <span className="font-semibold">Size:</span>{' '}
                                {(
                                    Number(
                                        currentCommitment.chunks.reduce(
                                            (sum, chunk) => sum + chunk.blob.length,
                                            0
                                        )
                                    ) / 1048576
                                ).toFixed(6)}{' '}
                                MB
                            </p>
                            <p className="w-min truncate">
                                <span className="font-semibold">Module Hash:</span>{' '}
                                {currentCommitment.moduleHash}
                            </p>
                            <p>
                                <span className="font-semibold">Chunks:</span>{' '}
                                {currentCommitment.chunks.length}
                            </p>
                        </>
                    ) : (
                        <>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".wasm"
                                ref={fileInputRef}
                                disabled={!selectedActor}
                                id={`wasm-upload-${selectedActor}`}
                                key={`wasm-upload-${selectedActor}`}
                                className="hidden"
                            />
                            <div className="absolute left-0 top-0 flex h-full w-full flex-row items-center justify-center rounded-lg bg-cold-800 bg-opacity-0 group-hover:bg-opacity-10 md:flex-col">
                                <CodeIcon className="py-medium md:pt-small h-full stroke-1 md:pb-0" />
                                <p className="text-tiny p-normal text-center">
                                    WASM File Upload{' '}
                                    {selectedActor
                                        ? `for ${selectedActor}`
                                        : '(select an actor first)'}
                                </p>
                            </div>
                        </>
                    )}
                </label>
                <div className="gap-small flex h-full w-full flex-col">
                    <div className="gap-small flex w-full">
                        <SearchableSelect
                            onChange={handleSelectVariable}
                            options={variableOptions}
                            value={key}
                            disabled={!selectedActor || isLoading}
                            placeholder="Select or type a Key to edit"
                            className="w-full"
                            customizable
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
            </div>
            <ModulesDetachment
                commitments={commitments}
                onClick={handleRemoveCommitment}
                showOldValue
            />
            <ConfigsDetachment
                detachment={{ actorsConfigs: configs }}
                onClick={handleRemoveConfig}
                showOldValue
            />
        </>
    )
}

export default ConfigsAndWasmUpload
