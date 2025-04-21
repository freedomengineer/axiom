import { useCallback, useEffect, useMemo, useState } from 'react'

import { error } from '@libs/toastify'
import { CONFIGS_TYPES, DEFAULT_CONFIGS, DEPLOYABLE_ACTORS } from '@utils/indicator/configs'
import { DDAO } from 'shared/types/services'
import * as SERVICES from 'shared/utils/services'
import { UnwrapVariant, Variant } from 'shared/utils/typings'

type FetchedConfigs = Record<(typeof DEPLOYABLE_ACTORS)[number], DDAO.SharableConfigs>

const bigintToString = (value: any): any => {
    if (typeof value === 'bigint') return value.toString()
    if (Array.isArray(value)) return value.map(bigintToString)
    if (value && typeof value === 'object')
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, bigintToString(v)]))
    return value
}

const useUpdateConfigs = (
    selectedActor: (typeof DEPLOYABLE_ACTORS)[number] | null,
    configs: DDAO.ActorsConfigs,
    setConfigs: (configs: DDAO.ActorsConfigs) => void
) => {
    const [fetchedConfigs, setFetchedConfigs] = useState<FetchedConfigs>(
        DEPLOYABLE_ACTORS.reduce((acc, actor) => ({ ...acc, [actor]: [] }), {} as FetchedConfigs)
    )
    const [key, setKey] = useState<string>('')
    const [value, setValue] = useState<DDAO.SharableValue | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchConfigData = async () => {
            setIsLoading(true)
            try {
                const configsData: DDAO.SharableConfigs[] = await Promise.all(
                    DEPLOYABLE_ACTORS.map((actor) => (SERVICES as any)[actor].call().getConfigs())
                )
                const formattedConfigs = DEPLOYABLE_ACTORS.reduce(
                    (acc, actor, index) => ({
                        ...acc,
                        [actor]: configsData[index].map(([key, value]) => [
                            key,
                            bigintToString(value) as DDAO.SharableValue,
                        ]),
                    }),
                    {} as FetchedConfigs
                )
                setFetchedConfigs(formattedConfigs)
            } catch (err) {
                error('Failed to fetch configs')
            } finally {
                setIsLoading(false)
            }
        }
        fetchConfigData()
    }, [])
    useEffect(() => {
        setKey('')
        setValue(null)
    }, [selectedActor])

    const existingVariable = useMemo(() => {
        if (!selectedActor || !key) return null
        return fetchedConfigs[selectedActor]?.find(([k]) => k === key)
    }, [selectedActor, key, fetchedConfigs])
    const isAddButtonDisabled = useMemo(() => {
        if (!key || !value) return true
        if (existingVariable) {
            return (
                UnwrapVariant(existingVariable[1])[0] === UnwrapVariant(value)[0] &&
                UnwrapVariant(existingVariable[1])[1] == UnwrapVariant(value)[1]
            )
        }
        return false
    }, [key, value, existingVariable])
    const variableOptions = useMemo(() => {
        if (!selectedActor) return []
        return (fetchedConfigs[selectedActor] || []).map((item) => ({
            label: item[0],
            value: item[0],
        }))
    }, [selectedActor, fetchedConfigs])

    const handleSelectVariable = useCallback(
        (variable: string) => {
            if (!selectedActor) return
            const pair = fetchedConfigs[selectedActor]?.find(([k]) => k === variable)
            if (pair) {
                const [key, value] = pair
                setKey(key)
                setValue(value)
            } else {
                setKey(variable)
            }
        },
        [selectedActor, fetchedConfigs]
    )
    const handleTypeChange = useCallback((type: (typeof CONFIGS_TYPES)[number]) => {
        setValue(DEFAULT_CONFIGS[type])
    }, [])
    const handleAddNewConfig = useCallback(() => {
        if (!key || !value || !selectedActor) return
        const actorKey = selectedActor as keyof DDAO.ConfigurableActorVariant
        const existingConfig = configs.find(([_, config]) => config.some(([k]) => k === key))

        if (existingConfig) {
            const [variant] = existingConfig
            const updatedConfigs = existingConfig[1].map(([k, v]) =>
                k === key ? [key, value] : [k, v]
            )
            setConfigs(
                configs.map(([v, c]) =>
                    UnwrapVariant(v) === UnwrapVariant(variant) ? [variant, updatedConfigs] : [v, c]
                ) as DDAO.ActorsConfigs
            )
        } else {
            const currentConfigEntry = configs.find(
                ([variant]) => UnwrapVariant(variant) === actorKey
            )
            const newConfig: DDAO.SharableConfigs = [[key, value]]

            if (currentConfigEntry) {
                setConfigs(
                    configs.map(([variant, config]) =>
                        UnwrapVariant(variant) === actorKey
                            ? [variant, [...config, ...newConfig]]
                            : [variant, config]
                    )
                )
            } else {
                setConfigs([...configs, [Variant(actorKey), newConfig]] as DDAO.ActorsConfigs)
            }
        }
        setKey('')
        setValue(null)
    }, [key, value, selectedActor, configs, setConfigs])
    const handleRemoveConfig = useCallback(
        (actor: string, key: string) => {
            const currentConfigEntry = configs.find(([variant]) => UnwrapVariant(variant) === actor)
            if (currentConfigEntry) {
                const updatedConfigs = currentConfigEntry[1].filter(([k]) => k !== key)
                setConfigs(
                    configs
                        .map(([variant, config]) =>
                            UnwrapVariant(variant) === actor
                                ? updatedConfigs.length > 0
                                    ? [variant, updatedConfigs]
                                    : null
                                : [variant, config]
                        )
                        .filter((x) => x) as DDAO.ActorsConfigs
                )
            }
        },
        [selectedActor, configs, setConfigs]
    )

    return {
        fetchedConfigs,
        key,
        value,
        isLoading,
        existingVariable,
        isAddButtonDisabled,
        variableOptions,
        setKey,
        setValue,
        handleSelectVariable,
        handleTypeChange,
        handleAddNewConfig,
        handleRemoveConfig,
    }
}

export default useUpdateConfigs
